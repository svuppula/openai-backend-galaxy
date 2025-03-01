
import express from 'express';
import { summarizeText, generateScript } from '../services/aiService.js';

export const textRouter = express.Router();

/**
 * @swagger
 * /api/text/summarize:
 *   post:
 *     summary: Summarize text using AI
 *     tags: [Text Services]
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
 *                 description: Text to summarize
 *     responses:
 *       200:
 *         description: Successfully summarized text
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *                   description: Summarized text
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
textRouter.post('/text/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const summary = await summarizeText(text);
    res.json({ summary });
  } catch (error) {
    console.error('Text summarization API error:', error.message);
    res.status(500).json({ error: error.message || 'Text summarization failed' });
  }
});

/**
 * @swagger
 * /api/text/generate:
 *   post:
 *     summary: Generate creative text from a prompt
 *     tags: [Text Services]
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
 *                 description: Creative prompt for text generation
 *     responses:
 *       200:
 *         description: Successfully generated text
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 script:
 *                   type: string
 *                   description: Generated text
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
textRouter.post('/text/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const script = await generateScript(prompt);
    res.json({ script });
  } catch (error) {
    console.error('Text generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Text generation failed' });
  }
});

/**
 * @swagger
 * /api/text/script-generation:
 *   post:
 *     summary: Generate a script from a prompt
 *     tags: [Text Services]
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
 *                 description: Creative prompt for script generation
 *     responses:
 *       200:
 *         description: Successfully generated script
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 script:
 *                   type: string
 *                   description: Generated script
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
textRouter.post('/text/script-generation', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const script = await generateScript(prompt);
    res.json({ script });
  } catch (error) {
    console.error('Script generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Script generation failed' });
  }
});
