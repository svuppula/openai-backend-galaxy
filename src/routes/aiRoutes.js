
import { Router } from 'express';
import NodeCache from 'node-cache';
import { generateScript, summarizeText } from '../services/aiService.js';

const aiRouter = Router();
const cache = new NodeCache({ stdTTL: 3600 });

/**
 * @swagger
 * /api/script-generation:
 *   post:
 *     summary: Generate a script using AI
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
 *                 description: The prompt for script generation
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
 *       400:
 *         description: Bad request - prompt is missing
 *       500:
 *         description: Internal server error
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
      return res.json({ script: cachedResult });
    }

    const script = await generateScript(prompt);
    cache.set(cacheKey, script);
    res.json({ script });
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ error: 'Script generation failed' });
  }
});

/**
 * @swagger
 * /api/summarize:
 *   post:
 *     summary: Summarize text using AI
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
 *                 description: The text to be summarized
 *     responses:
 *       200:
 *         description: Text summarized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *       400:
 *         description: Bad request - text is missing
 *       500:
 *         description: Internal server error
 */
aiRouter.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cacheKey = `summary_${text.substring(0, 50)}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json({ summary: cachedResult });
    }

    const summary = await summarizeText(text);
    cache.set(cacheKey, summary);
    res.json({ summary });
  } catch (error) {
    console.error('Text summarization error:', error);
    res.status(500).json({ error: 'Text summarization failed' });
  }
});

export { aiRouter };
