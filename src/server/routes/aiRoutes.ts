import { Router } from 'express';
import { AIModels } from '../models/aiModels';
import { cacheMiddleware } from '../middleware/cache';
import { setInCache } from '../cache/nodeCache';

export const createAIRoutes = (models: AIModels) => {
  const router = Router();

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

  // ... Add other AI routes following the same pattern

  return router;
};