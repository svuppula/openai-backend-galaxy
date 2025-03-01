
import express from 'express';
import { generateScript, summarizeText } from '../services/aiService.js';

export const aiRouter = express.Router();

/**
 * @swagger
 * /api/ai/analyze:
 *   post:
 *     summary: Analyze text content
 *     tags: [AI Services]
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
 *                 description: Text to analyze
 *     responses:
 *       200:
 *         description: Successfully analyzed text
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   type: string
 *                   description: Analysis of the text
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
aiRouter.post('/ai/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Using summarization as a form of analysis for now
    const analysis = await summarizeText(text);
    res.json({ analysis });
  } catch (error) {
    console.error('Text analysis API error:', error.message);
    res.status(500).json({ error: error.message || 'Text analysis failed' });
  }
});

/**
 * @swagger
 * /api/ai/script-generation:
 *   post:
 *     summary: Generate a script from a prompt
 *     tags: [AI Services]
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
aiRouter.post('/ai/script-generation', async (req, res) => {
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
