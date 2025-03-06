
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const AdmZip = require('adm-zip');
const { generateThumbnails, cleanupTempFiles, loadModel } = require('../utils/thumbnailGenerator');
const { textToSpeech, getAvailableVoices, cloneVoice } = require('../services/ttsService');

const router = express.Router();

// GET available voices
router.get('/available-voices', async (req, res) => {
  try {
    const voices = await getAvailableVoices();
    res.json(voices);
  } catch (error) {
    console.error('Error getting available voices:', error);
    res.status(500).json({ error: 'Failed to get available voices' });
  }
});

// Text to speech
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Generate a unique session ID
    const sessionId = uuidv4();
    
    // Convert text to speech
    const outputPath = await textToSpeech(text, voice, sessionId);
    
    // Create a zip file
    const zip = new AdmZip();
    
    // Add the generated audio file to the zip
    zip.addLocalFile(outputPath);
    
    // Set headers for the response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="speech-${sessionId}.zip"`);
    
    // Send the zip file
    zip.toBuffer().then((buffer) => {
      res.send(buffer);
      
      // Clean up temporary files
      fs.unlink(outputPath, (err) => {
        if (err) console.error('Error deleting audio file:', err);
      });
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Thumbnail generation
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Load the model before generating images
    await loadModel();
    
    // Generate thumbnails
    const zipPath = await generateThumbnails(prompt, 3);
    
    // Check if the file exists
    if (!fs.existsSync(zipPath)) {
      return res.status(500).json({ error: 'Failed to generate thumbnails' });
    }
    
    // Set the content type
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=thumbnails.zip');
    
    // Send the file
    const fileStream = fs.createReadStream(zipPath);
    fileStream.pipe(res);
    
    // Clean up the temp directory after sending the file
    fileStream.on('close', () => {
      const jobId = path.basename(path.dirname(zipPath));
      cleanupTempFiles(jobId);
    });
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    res.status(500).json({ error: 'Failed to generate thumbnails' });
  }
});

// Video generation (placeholder)
router.post('/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Mock video generation - creating a ZIP with a dummy video
    const sessionId = uuidv4();
    const tempDir = path.join(__dirname, '../../temp', sessionId);
    
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create a text file with the prompt as placeholder
    const videoInfoPath = path.join(tempDir, 'video_info.txt');
    fs.writeFileSync(videoInfoPath, `Video will be generated for prompt: ${prompt}`);
    
    // Create a zip file
    const zipPath = path.join(tempDir, 'video.zip');
    const zip = new AdmZip();
    zip.addLocalFile(videoInfoPath);
    zip.writeZip(zipPath);
    
    // Set headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=video-${sessionId}.zip`);
    
    // Send the zip file
    const fileStream = fs.createReadStream(zipPath);
    fileStream.pipe(res);
    
    // Clean up temp directory
    fileStream.on('close', () => {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  } catch (error) {
    console.error('Error generating video:', error);
    res.status(500).json({ error: 'Failed to generate video' });
  }
});

// Animation generation (placeholder)
router.post('/generate-animation', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Mock animation generation - creating a ZIP with a dummy animation file
    const sessionId = uuidv4();
    const tempDir = path.join(__dirname, '../../temp', sessionId);
    
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create a text file with the prompt as placeholder
    const animationInfoPath = path.join(tempDir, 'animation_info.txt');
    fs.writeFileSync(animationInfoPath, `Animation will be generated for prompt: ${prompt}`);
    
    // Create a zip file
    const zipPath = path.join(tempDir, 'animation.zip');
    const zip = new AdmZip();
    zip.addLocalFile(animationInfoPath);
    zip.writeZip(zipPath);
    
    // Set headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=animation-${sessionId}.zip`);
    
    // Send the zip file
    const fileStream = fs.createReadStream(zipPath);
    fileStream.pipe(res);
    
    // Clean up temp directory
    fileStream.on('close', () => {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  } catch (error) {
    console.error('Error generating animation:', error);
    res.status(500).json({ error: 'Failed to generate animation' });
  }
});

// Voice cloning
router.post('/clone-voice', async (req, res) => {
  try {
    const { name, audioSample } = req.body;
    
    if (!name || !audioSample) {
      return res.status(400).json({ error: 'Name and audio sample are required' });
    }
    
    // Clone the voice
    const result = await cloneVoice(name, audioSample);
    
    res.json(result);
  } catch (error) {
    console.error('Error cloning voice:', error);
    res.status(500).json({ error: 'Failed to clone voice' });
  }
});

module.exports = router;
