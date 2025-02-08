
import { Router } from 'express';
import { textToSpeech, textToImage } from '../services/mediaService.js';
import { cacheMiddleware } from '../middleware/cache.js';

const mediaRouter = Router();

/**
 * @swagger
 * /api/media/text-to-speech:
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
 *                 description: The text to convert to speech
 *                 example: "Hello, how are you today?"
 *     responses:
 *       200:
 *         description: Audio generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 audio:
 *                   type: string
 *                   description: Base64 encoded audio data
 *       400:
 *         description: Missing or invalid text parameter
 *       500:
 *         description: Text-to-speech conversion failed
 */
mediaRouter.post('/media/text-to-speech', cacheMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
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
 *     tags: [Media]
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
 *                 description: The text prompt to generate an image from
 *                 example: "A beautiful sunset over mountains"
 *     responses:
 *       200:
 *         description: Image generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image:
 *                   type: string
 *                   description: Base64 encoded image data
 *       400:
 *         description: Missing or invalid prompt parameter
 *       500:
 *         description: Image generation failed
 */
mediaRouter.post('/media/text-to-image', cacheMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const image = await textToImage(prompt);
    res.json({ image });
  } catch (error) {
    console.error('Text-to-image error:', error);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

export { mediaRouter };
