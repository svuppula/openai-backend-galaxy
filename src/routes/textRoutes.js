import { Router } from 'express';
import { summarizeText, generateScript } from '../services/textService.js';
import { cacheMiddleware } from '../middleware/cache.js';

const textRouter = Router();

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
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Text summarized successfully
 */
textRouter.post('/summarize', cacheMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const summary = await summarizeText(text);
    res.json({ summary });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

/**
 * @swagger
 * /api/text/generate-script:
 *   post:
 *     summary: Generate a script using AI
 *     tags: [Text Services]
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
 *         description: Script generated successfully
 */
textRouter.post('/generate-script', cacheMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    
    const script = await generateScript(prompt);
    res.json({ script });
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ error: 'Script generation failed' });
  }
});

export { textRouter };