
import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import { generateThumbnails } from '../utils/thumbnailGenerator.js';
import { textToSpeech, getAvailableVoices } from '../services/ttsService.js';

// ES Module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create router
const router = express.Router();

/**
 * @swagger
 * /api/media/available-voices:
 *   get:
 *     summary: Get available voices for text-to-speech
 *     description: Returns a list of available voices for use with the text-to-speech API
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: List of available voices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 free:
 *                   type: array
 *                   items:
 *                     type: string
 *                 premium:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *                 cloned:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get('/available-voices', async (req, res) => {
  try {
    const voices = await getAvailableVoices();
    res.json(voices);
  } catch (error) {
    console.error('Error getting available voices:', error);
    res.status(500).json({ error: error.message || 'Failed to get available voices' });
  }
});

/**
 * @swagger
 * /api/media/text-to-speech:
 *   post:
 *     summary: Convert text to speech
 *     description: Converts text to speech and returns the audio file
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TextToSpeechRequest'
 *     responses:
 *       200:
 *         description: Audio file
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Set default voice if not provided
    const selectedVoice = voice || 'en-US';
    
    // Generate speech
    const outputZipPath = await textToSpeech(text, selectedVoice);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=speech.zip`);
    
    // Send file
    res.sendFile(outputZipPath, { root: '/' }, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error sending file' });
        }
      }
      
      // Delete file after sending (not waiting for deletion to complete)
      fs.unlink(outputZipPath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
  } catch (error) {
    console.error('Text to speech error:', error);
    res.status(500).json({ error: error.message || 'Text to speech failed' });
  }
});

/**
 * @swagger
 * /api/media/generate-image:
 *   post:
 *     summary: Generate thumbnail images based on a prompt
 *     description: Generates multiple thumbnail images based on the provided prompt
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImageGenerationRequest'
 *     responses:
 *       200:
 *         description: Zip file containing generated images
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Generate thumbnails
    const outputZipPath = await generateThumbnails(prompt);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=thumbnails.zip`);
    
    // Send file
    res.sendFile(outputZipPath, { root: '/' }, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error sending file' });
        }
      }
      
      // Delete file after sending (not waiting for deletion to complete)
      fs.unlink(outputZipPath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: error.message || 'Image generation failed' });
  }
});

/**
 * @swagger
 * /api/media/generate-video:
 *   post:
 *     summary: Generate video based on a prompt
 *     description: Generates a video based on the provided prompt
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VideoGenerationRequest'
 *     responses:
 *       200:
 *         description: Zip file containing generated video
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Create a placeholder zip file with a README explaining that this is a simulation
    const zip = new AdmZip();
    const tempDir = process.env.TEMP_DIR || './temp';
    fs.ensureDirSync(tempDir);
    
    // Add a README file
    zip.addFile('README.txt', Buffer.from(
      `Video Generation Simulation\n\n` +
      `Prompt: ${prompt}\n\n` +
      `This is a simulated video generation response.\n` +
      `In a real implementation, this would contain actual video clips based on your prompt.\n` +
      `The real implementation would use open-source video generation models.\n`
    ));
    
    // Add placeholder files
    zip.addFile('video.txt', Buffer.from(`This would be a video file generated from: ${prompt}`));
    
    // Save the zip file
    const zipFilePath = path.join(tempDir, 'video_output.zip');
    zip.writeZip(zipFilePath);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=video_output.zip`);
    
    // Send file
    res.sendFile(zipFilePath, { root: '/' }, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error sending file' });
        }
      }
      
      // Delete file after sending (not waiting for deletion to complete)
      fs.unlink(zipFilePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: error.message || 'Video generation failed' });
  }
});

/**
 * @swagger
 * /api/media/generate-animation:
 *   post:
 *     summary: Generate animation based on a prompt
 *     description: Generates an animation based on the provided prompt
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnimationGenerationRequest'
 *     responses:
 *       200:
 *         description: Zip file containing generated animation
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/generate-animation', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Create a placeholder zip file with a README explaining that this is a simulation
    const zip = new AdmZip();
    const tempDir = process.env.TEMP_DIR || './temp';
    fs.ensureDirSync(tempDir);
    
    // Add a README file
    zip.addFile('README.txt', Buffer.from(
      `Animation Generation Simulation\n\n` +
      `Prompt: ${prompt}\n\n` +
      `This is a simulated animation generation response.\n` +
      `In a real implementation, this would contain actual animation files based on your prompt.\n` +
      `The real implementation would use open-source animation generation models.\n`
    ));
    
    // Add placeholder files
    zip.addFile('animation.txt', Buffer.from(`This would be an animation file generated from: ${prompt}`));
    
    // Save the zip file
    const zipFilePath = path.join(tempDir, 'animation_output.zip');
    zip.writeZip(zipFilePath);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=animation_output.zip`);
    
    // Send file
    res.sendFile(zipFilePath, { root: '/' }, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error sending file' });
        }
      }
      
      // Delete file after sending (not waiting for deletion to complete)
      fs.unlink(zipFilePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
  } catch (error) {
    console.error('Animation generation error:', error);
    res.status(500).json({ error: error.message || 'Animation generation failed' });
  }
});

/**
 * @swagger
 * /api/media/clone-voice:
 *   post:
 *     summary: Clone a voice
 *     description: Clones a voice from an audio file
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VoiceCloneRequest'
 *     responses:
 *       200:
 *         description: Voice cloned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 voiceId:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/clone-voice', async (req, res) => {
  try {
    const { name, audioUrl } = req.body;
    
    if (!name || !audioUrl) {
      return res.status(400).json({ error: 'Name and audio URL are required' });
    }
    
    // In a real implementation, we would download the audio file and use a voice cloning model
    // For this simulation, we'll just return a success response with a fake voice ID
    
    // Create a unique voice ID based on the name
    const voiceId = `cloned_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    
    // Simulate adding the voice to the available voices
    res.json({
      success: true,
      voiceId: voiceId,
      message: 'Voice cloned successfully (simulation)'
    });
  } catch (error) {
    console.error('Voice cloning error:', error);
    res.status(500).json({ error: error.message || 'Voice cloning failed' });
  }
});

export { router };
