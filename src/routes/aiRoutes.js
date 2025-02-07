import { Router } from 'express';
import NodeCache from 'node-cache';
import {
  initializeModels,
  summarizeText,
  generateScript,
  textToSpeech,
  textToImage,
  textToVideo
} from '../services/aiService.js';

const aiRouter = Router();
const cache = new NodeCache({ stdTTL: 3600 });
let models;

// Initialize models when the server starts
(async () => {
  try {
    models = await initializeModels();
    console.log('AI models initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AI models:', error);
  }
})();

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

    const summary = await summarizeText(text);
    cache.set(cacheKey, summary);
    res.json({ summary });
  } catch (error) {
    console.error('Text summarization error:', error);
    res.status(500).json({ error: 'Text summarization failed' });
  }
});

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

    const script = await generateScript(prompt);
    cache.set(cacheKey, script);
    res.json({ script });
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ error: 'Script generation failed' });
  }
});

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

    const audioData = await textToSpeech(text, models);
    cache.set(cacheKey, audioData);
    res.json({ audioData });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: 'Text-to-speech conversion failed' });
  }
});

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

    const image = await textToImage(prompt, models);
    cache.set(cacheKey, image);
    res.json({ image });
  } catch (error) {
    console.error('Text-to-image error:', error);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

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

    const video = await textToVideo(prompt, models);
    cache.set(cacheKey, video);
    res.json({ video });
  } catch (error) {
    console.error('Text-to-video error:', error);
    res.status(500).json({ error: 'Video generation failed' });
  }
});

export { aiRouter };