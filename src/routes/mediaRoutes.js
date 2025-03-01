
import { Router } from 'express';
import { textToSpeech, textToImage, textToVideo, textToAnimation } from '../services/mediaService.js';
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
 *                   description: Base64 encoded image data or URL
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

/**
 * @swagger
 * /api/media/text-to-video:
 *   post:
 *     summary: Generate video from text
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
 *                 description: The text prompt to generate a video from
 *                 example: "A car driving through a forest"
 *     responses:
 *       200:
 *         description: Video generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 video:
 *                   type: string
 *                   description: URL or data for the generated video
 *       400:
 *         description: Missing or invalid prompt parameter
 *       500:
 *         description: Video generation failed
 */
mediaRouter.post('/media/text-to-video', cacheMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const video = await textToVideo(prompt);
    res.json({ video });
  } catch (error) {
    console.error('Text-to-video error:', error);
    res.status(500).json({ error: 'Video generation failed' });
  }
});

/**
 * @swagger
 * /api/media/text-to-animation:
 *   post:
 *     summary: Generate animation from text
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
 *                 description: The text prompt to generate an animation from
 *                 example: "A bouncing ball that changes color"
 *     responses:
 *       200:
 *         description: Animation generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 animation:
 *                   type: object
 *                   description: Animation data
 *       400:
 *         description: Missing or invalid prompt parameter
 *       500:
 *         description: Animation generation failed
 */
mediaRouter.post('/media/text-to-animation', cacheMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const animation = await textToAnimation(prompt);
    res.json({ animation });
  } catch (error) {
    console.error('Text-to-animation error:', error);
    res.status(500).json({ error: 'Animation generation failed' });
  }
});

export { mediaRouter };
