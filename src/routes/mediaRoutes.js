
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateThumbnails, loadModel } from '../utils/thumbnailGenerator.js';
import { textToSpeech, getAvailableVoices } from '../services/ttsService.js';

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

/**
 * @swagger
 * /api/media/tts:
 *   post:
 *     summary: Convert text to speech
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Hello, this is a test of the text-to-speech system."
 *               voice:
 *                 type: string
 *                 example: "en-US"
 *               speed:
 *                 type: number
 *                 example: 1.0
 *     responses:
 *       200:
 *         description: Audio file URL
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'en-US', speed = 1.0 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const audioPath = await textToSpeech(text, voice, speed);
    
    // Return the URL to the generated audio file
    const audioUrl = `/api/media/audio/${path.basename(audioPath)}`;
    res.json({ audioUrl });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    res.status(500).json({ error: 'Failed to convert text to speech' });
  }
});

/**
 * @swagger
 * /api/media/voices:
 *   get:
 *     summary: Get available TTS voices
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: List of available voices
 *       500:
 *         description: Server error
 */
router.get('/voices', async (req, res) => {
  try {
    const voices = await getAvailableVoices();
    res.json({ voices });
  } catch (error) {
    console.error('Error getting available voices:', error);
    res.status(500).json({ error: 'Failed to get available voices' });
  }
});

/**
 * @swagger
 * /api/media/audio/{filename}:
 *   get:
 *     summary: Get an audio file
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audio file
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
router.get('/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../../temp', filename);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Audio file not found' });
  }
  
  res.sendFile(filepath);
});

/**
 * @swagger
 * /api/media/generate-thumbnails:
 *   post:
 *     summary: Generate thumbnails from an image
 *     tags: [Media]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Generated thumbnails
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/media/thumbnail/{filename}:
 *   get:
 *     summary: Get a thumbnail image
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thumbnail image
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
router.get('/thumbnail/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../../temp', filename);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Thumbnail not found' });
  }
  
  res.sendFile(filepath);
});

export default router;
