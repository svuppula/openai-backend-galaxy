import { Router } from 'express';
import type { AIModels } from '../models/aiModels';

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