import { Router } from 'express';
import { AIModels } from '../models/aiModels';
import { cacheMiddleware } from '../middleware/cache';
import { setInCache } from '../cache/nodeCache';

export const createAIRoutes = (models: AIModels) => {
  const router = Router();

  /**
   * @swagger
   * /api/speech-to-text:
   *   post:
   *     summary: Convert speech to text
   *     description: Converts audio file to text using AI models
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               audioUrl:
   *                 type: string
   *                 description: URL of the audio file to process
   *     responses:
   *       200:
   *         description: Successfully converted speech to text
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 text:
   *                   type: string
   *       400:
   *         description: Bad request - missing audio URL
   *       500:
   *         description: Server error during processing
   */
  router.post('/speech-to-text', cacheMiddleware, async (req, res) => {
    try {
      const { audioUrl } = req.body;
      if (!audioUrl) {
        return res.status(400).json({ error: 'Audio URL is required' });
      }
      const result = await models.speechToText(audioUrl);
      setInCache(req.originalUrl, result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Speech-to-text processing failed' });
    }
  });

  /**
   * @swagger
   * /api/image-recognition:
   *   post:
   *     summary: Recognize objects in images
   *     description: Performs object recognition on provided image
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               imageUrl:
   *                 type: string
   *                 description: URL of the image to analyze
   *     responses:
   *       200:
   *         description: Successfully analyzed image
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 predictions:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       label:
   *                         type: string
   *                       confidence:
   *                         type: number
   *       400:
   *         description: Bad request - missing image URL
   *       500:
   *         description: Server error during processing
   */
  router.post('/image-recognition', cacheMiddleware, async (req, res) => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }
      const result = await models.imageRecognition(imageUrl);
      setInCache(req.originalUrl, result);
      res.json({ predictions: result });
    } catch (error) {
      res.status(500).json({ error: 'Image recognition failed' });
    }
  });

  return router;
};