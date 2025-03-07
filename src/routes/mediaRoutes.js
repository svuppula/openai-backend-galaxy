import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateThumbnails, loadModel } from '../utils/thumbnailGenerator.js';
import { textToSpeech, getAvailableVoices, cloneVoice } from '../services/ttsService.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'video/mp4', 
      'audio/mpeg', 
      'audio/wav'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'));
    }
  }
});

const router = express.Router();

// Clean up temp files periodically
const cleanupTempFiles = () => {
  const tempDir = path.join(__dirname, '../../temp');
  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.error('Error reading temp directory:', err);
        return;
      }
      
      // Only delete files older than 1 hour
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      files.forEach(file => {
        if (file === '.gitkeep') return; // Keep the gitkeep file
        
        const filePath = path.join(tempDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error(`Error getting stats for file ${file}:`, err);
            return;
          }
          
          if (stats.isFile() && stats.mtimeMs < oneHourAgo) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(`Error deleting file ${file}:`, err);
              }
            });
          }
        });
      });
    });
  }
};

// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

router.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'en-US', speed = 1.0 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const audioPath = await textToSpeech(text, voice, speed);
    
    // Return the URL to the generated audio file
    const audioUrl = `/media/audio/${path.basename(audioPath)}`;
    res.json({ audioUrl });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    res.status(500).json({ error: 'Failed to convert text to speech' });
  }
});

router.get('/voices', async (req, res) => {
  try {
    const voices = await getAvailableVoices();
    res.json({ voices });
  } catch (error) {
    console.error('Error getting available voices:', error);
    res.status(500).json({ error: 'Failed to get available voices' });
  }
});

router.get('/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../../temp', filename);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Audio file not found' });
  }
  
  res.sendFile(filepath);
});

router.post('/generate-thumbnails', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    
    // Load the model first
    await loadModel();
    
    // Generate thumbnails with image recognition
    const thumbnails = await generateThumbnails(req.file.path);
    
    res.json({ thumbnails });
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    res.status(500).json({ error: 'Failed to generate thumbnails' });
  }
});

router.get('/thumbnail/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../../temp', filename);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Thumbnail not found' });
  }
  
  res.sendFile(filepath);
});

// Add a route for voice cloning
router.post('/clone-voice', upload.single('audio_sample'), async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Voice name is required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Audio sample is required' });
    }
    
    const result = await cloneVoice(name, req.file.path);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error cloning voice:', error);
    res.status(500).json({ error: 'Failed to clone voice' });
  }
});

export default router;
