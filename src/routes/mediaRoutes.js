
import express from 'express';
import { textToSpeech, generateImage, generateVideo, generateAnimation } from '../services/mediaService.js';

export const mediaRouter = express.Router();

/**
 * @swagger
 * /api/media/text-to-speech:
 *   post:
 *     summary: Convert text to speech
 *     tags: [Media Services]
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
 *                 description: Text to convert to speech
 *     responses:
 *       200:
 *         description: Successfully converted text to speech
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 audio:
 *                   type: string
 *                   description: Base64 encoded audio
 *                 format:
 *                   type: string
 *                   description: Audio format
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
mediaRouter.post('/media/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const result = await textToSpeech(text);
    res.json(result);
  } catch (error) {
    console.error('Text-to-speech API error:', error.message);
    res.status(500).json({ error: error.message || 'Text-to-speech conversion failed' });
  }
});

/**
 * @swagger
 * /api/media/generate-image:
 *   post:
 *     summary: Generate an image from text
 *     tags: [Media Services]
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
 *                 description: Text prompt for image generation
 *     responses:
 *       200:
 *         description: Successfully generated image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image:
 *                   type: string
 *                   description: Base64 encoded image
 *                 format:
 *                   type: string
 *                   description: Image format
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
mediaRouter.post('/media/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const result = await generateImage(prompt);
    res.json(result);
  } catch (error) {
    console.error('Image generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Image generation failed' });
  }
});

/**
 * @swagger
 * /api/media/generate-video:
 *   post:
 *     summary: Generate a video from text
 *     tags: [Media Services]
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
 *                 description: Text prompt for video generation
 *     responses:
 *       200:
 *         description: Video generation request received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Status message
 *                 status:
 *                   type: string
 *                   description: Status code
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
mediaRouter.post('/media/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const result = await generateVideo(prompt);
    res.json(result);
  } catch (error) {
    console.error('Video generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Video generation failed' });
  }
});

/**
 * @swagger
 * /api/media/generate-animation:
 *   post:
 *     summary: Generate an animation from text
 *     tags: [Media Services]
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
 *                 description: Text prompt for animation generation
 *     responses:
 *       200:
 *         description: Animation generation request received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Status message
 *                 status:
 *                   type: string
 *                   description: Status code
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
mediaRouter.post('/media/generate-animation', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const result = await generateAnimation(prompt);
    res.json(result);
  } catch (error) {
    console.error('Animation generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Animation generation failed' });
  }
});
