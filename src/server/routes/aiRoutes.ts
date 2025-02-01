import { Router } from 'express';
import { AIModels } from '../models/aiModels';

/**
 * @swagger
 * /api/speech-to-text:
 *   post:
 *     tags:
 *       - AI Services
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
 */
export const createAIRoutes = (models: AIModels) => {
  const router = Router();

  router.post('/speech-to-text', async (req, res) => {
    try {
      const { audioUrl } = req.body;
      if (!audioUrl) {
        return res.status(400).json({ error: 'Audio URL is required' });
      }
      const result = await models.speechToText(audioUrl);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Speech-to-text processing failed' });
    }
  });

  /**
   * @swagger
   * /api/image-recognition:
   *   post:
   *     tags:
   *       - AI Services
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
   */
  router.post('/image-recognition', async (req, res) => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }
      const result = await models.imageRecognition(imageUrl);
      res.json({ predictions: result });
    } catch (error) {
      res.status(500).json({ error: 'Image recognition failed' });
    }
  });

  return router;
};