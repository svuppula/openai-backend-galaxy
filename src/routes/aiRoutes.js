
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  analyzeText,
  generateScript,
  generateText
} from '../services/aiService.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

/**
 * @swagger
 * /api/ai/analyze:
 *   post:
 *     summary: Analyze text using AI
 *     tags: [AI]
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
 *                 example: "Text to analyze for sentiment, tone, and key points."
 *     responses:
 *       200:
 *         description: Analysis results
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Analyze text with AI
    const analysis = await analyzeText(text);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});

/**
 * @swagger
 * /api/ai/script-generation:
 *   post:
 *     summary: Generate script based on prompt
 *     tags: [AI]
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
 *                 example: "Create a 1-minute explainer video script about quantum computing."
 *     responses:
 *       200:
 *         description: Generated script
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/script-generation', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Generate script with AI
    const script = await generateScript(prompt);
    
    res.json({ script });
  } catch (error) {
    console.error('Error generating script:', error);
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

/**
 * @swagger
 * /api/ai/text-generation:
 *   post:
 *     summary: Generate text based on prompt
 *     tags: [AI]
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
 *                 example: "Write a short story about a robot learning to paint."
 *               maxLength:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Generated text
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/text-generation', async (req, res) => {
  try {
    const { prompt, maxLength = 500 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Generate text with AI
    const text = await generateText(prompt, maxLength);
    
    res.json({ text });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

export default router;
