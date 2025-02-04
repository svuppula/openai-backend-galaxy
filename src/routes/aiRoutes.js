import { Router } from 'express';
import { pipeline } from '@huggingface/transformers';
import NodeCache from 'node-cache';

const aiRouter = Router();
const cache = new NodeCache({ stdTTL: 3600 });

// Initialize AI models
const initializeModel = async (task, model) => {
  try {
    return await pipeline(task, model);
  } catch (error) {
    console.error(`Error initializing ${task} model:`, error);
    throw error;
  }
};

/**
 * @swagger
 * /api/text-summarization:
 *   post:
 *     summary: Summarize text
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
 *         description: Successful summarization
 */
aiRouter.post('/text-summarization', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cacheKey = `summary_${text.substring(0, 50)}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const model = await initializeModel('summarization', 'facebook/bart-large-cnn');
    const result = await model(text, { max_length: 130, min_length: 30 });
    
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Text summarization error:', error);
    res.status(500).json({ error: 'Text summarization failed' });
  }
});

/**
 * @swagger
 * /api/script-generation:
 *   post:
 *     summary: Generate script from prompt
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
 *         description: Successful script generation
 */
aiRouter.post('/script-generation', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const cacheKey = `script_${prompt.substring(0, 50)}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const model = await initializeModel('text-generation', 'gpt2');
    const result = await model(prompt, { max_length: 500 });
    
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ error: 'Script generation failed' });
  }
});

/**
 * @swagger
 * /api/text-to-speech:
 *   post:
 *     summary: Convert text to speech
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
 *         description: Successful text-to-speech conversion
 */
aiRouter.post('/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cacheKey = `speech_${text.substring(0, 50)}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const model = await initializeModel('text-to-speech', 'facebook/fastspeech2-en-ljspeech');
    const result = await model(text);
    
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: 'Text-to-speech conversion failed' });
  }
});

/**
 * @swagger
 * /api/text-to-image:
 *   post:
 *     summary: Generate image from text
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
 *         description: Successful image generation
 */
aiRouter.post('/text-to-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const cacheKey = `image_${prompt.substring(0, 50)}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const model = await initializeModel('text-to-image', 'stabilityai/stable-diffusion-2');
    const result = await model(prompt);
    
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Text-to-image error:', error);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

/**
 * @swagger
 * /api/text-to-video:
 *   post:
 *     summary: Generate video from text
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
 *         description: Successful video generation
 */
aiRouter.post('/text-to-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const cacheKey = `video_${prompt.substring(0, 50)}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const model = await initializeModel('text-to-video', 'damo-vilab/text-to-video-ms-1.7b');
    const result = await model(prompt);
    
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Text-to-video error:', error);
    res.status(500).json({ error: 'Video generation failed' });
  }
});

export { aiRouter };