
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { generateThumbnail } from '../utils/thumbnailGenerator.js';
import { textToSpeech, getAvailableVoices } from '../services/ttsService.js';
import { generateVideo, generateAnimation } from '../services/mediaServiceImpl.js';
import { generateImagesFromText } from '../services/imageGenerationService.js';

const router = express.Router();

// Set up multer for handling multipart/form-data
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/media/text-to-speech:
 *   post:
 *     summary: Convert text to speech
 *     description: Converts the provided text to speech using TTS
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
 *               voice:
 *                 type: string
 *     responses:
 *       200:
 *         description: Audio file as attachment
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const outputPath = await textToSpeech(text, voice);
    
    res.download(outputPath, 'speech.zip', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Failed to send file' });
      }
      
      // Clean up the file after sending
      fs.unlink(outputPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: error.message || 'Failed to process text-to-speech' });
  }
});

/**
 * @swagger
 * /api/media/available-voices:
 *   get:
 *     summary: Get available voices
 *     description: Returns a list of available voices for text-to-speech
 *     responses:
 *       200:
 *         description: List of available voices
 *       500:
 *         description: Server error
 */
router.get('/available-voices', async (req, res) => {
  try {
    const voices = await getAvailableVoices();
    res.json(voices);
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch available voices' });
  }
});

/**
 * @swagger
 * /api/media/generate-image:
 *   post:
 *     summary: Generate images from text prompt
 *     description: Generates realistic images based on the text prompt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *               count:
 *                 type: number
 *                 default: 4
 *     responses:
 *       200:
 *         description: Zip file containing generated images
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt, count = 4 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Limit the number of images per request for resource management
    const numImages = Math.min(Math.max(1, count), 10);
    
    console.log(`Generating ${numImages} images for prompt: "${prompt}"`);
    const zipPath = await generateImagesFromText(prompt, numImages);
    
    res.download(zipPath, 'generated_images.zip', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Failed to send file' });
      }
      
      // Clean up the file after sending
      fs.unlink(zipPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate images' });
  }
});

/**
 * @swagger
 * /api/media/generate-thumbnail:
 *   post:
 *     summary: Generate YouTube thumbnails
 *     description: Generates YouTube thumbnails based on the text prompt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zip file containing generated thumbnails
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/generate-thumbnail', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const outputPath = await generateThumbnail(prompt);
    
    res.download(outputPath, 'thumbnails.zip', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Failed to send file' });
      }
      
      // Clean up the file after sending
      fs.unlink(outputPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate thumbnails' });
  }
});

/**
 * @swagger
 * /api/media/generate-video:
 *   post:
 *     summary: Generate video content
 *     description: Generates video content based on the text prompt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zip file containing generated video
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const outputPath = await generateVideo(prompt);
    
    res.download(outputPath, 'video.zip', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Failed to send file' });
      }
      
      // Clean up the file after sending
      fs.unlink(outputPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate video' });
  }
});

/**
 * @swagger
 * /api/media/generate-animation:
 *   post:
 *     summary: Generate animation content
 *     description: Generates animation content based on the text prompt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zip file containing generated animation
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/generate-animation', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const outputPath = await generateAnimation(prompt);
    
    res.download(outputPath, 'animation.zip', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Failed to send file' });
      }
      
      // Clean up the file after sending
      fs.unlink(outputPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Animation generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate animation' });
  }
});

export default router;
