import { Router } from 'express';
import { textToSpeech, textToImage, textToVideo } from '../services/mediaService.js';
import { cacheMiddleware } from '../middleware/cache.js';

const mediaRouter = Router();

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
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Audio generated successfully
 */
mediaRouter.post('/text-to-speech', cacheMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const audio = await textToSpeech(text);
    res.json({ audio });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: 'Text-to-speech conversion failed' });
  }
});

/**
 * @swagger
 * /api/media/text-to-image:
 *   post:
 *     summary: Generate image from text
 *     tags: [Media Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image generated successfully
 */
mediaRouter.post('/text-to-image', cacheMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    
    const image = await textToImage(prompt);
    res.json({ image });
  } catch (error) {
    console.error('Text-to-image error:', error);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

export { mediaRouter };