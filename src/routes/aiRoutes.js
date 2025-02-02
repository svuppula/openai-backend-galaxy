import { Router } from 'express';
import { pipeline, Pipeline } from '@huggingface/transformers';
import NodeCache from 'node-cache';
import type { PipelineType } from '@huggingface/transformers';

const aiRouter = Router();
const cache = new NodeCache({ stdTTL: 3600 });

// Initialize AI models
const initializeModel = async (task: PipelineType, model?: string) => {
  try {
    return await pipeline(task, model);
  } catch (error) {
    console.error(`Error initializing ${task} model:`, error);
    throw error;
  }
};

/**
 * @swagger
 * /api/speech-to-text:
 *   post:
 *     summary: Convert speech to text
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               audioUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful conversion
 */
aiRouter.post('/speech-to-text', async (req, res) => {
  try {
    const { audioUrl } = req.body;
    if (!audioUrl) {
      return res.status(400).json({ error: 'Audio URL is required' });
    }

    const cacheKey = `speech_${audioUrl}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const model = await initializeModel('automatic-speech-recognition', 'openai/whisper-small');
    const result = await model(audioUrl);
    
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ error: 'Speech-to-text processing failed' });
  }
});

/**
 * @swagger
 * /api/image-recognition:
 *   post:
 *     summary: Recognize objects in images
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful recognition
 */
aiRouter.post('/image-recognition', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const cacheKey = `image_${imageUrl}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const model = await initializeModel('image-classification', 'google/vit-base-patch16-224');
    const result = await model(imageUrl);
    
    cache.set(cacheKey, result);
    res.json({ predictions: result });
  } catch (error) {
    console.error('Image recognition error:', error);
    res.status(500).json({ error: 'Image recognition failed' });
  }
});

export { aiRouter };