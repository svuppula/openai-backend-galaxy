
import { Router } from 'express';
import { summarizeText, generateScript } from '../services/aiService.js';

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
textRouter.post('/text/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Text is required and must be a string' 
      });
    }

    const summary = await summarizeText(text);
    res.json({ summary });
  } catch (error) {
    console.error('Text summarization error:', error);
    res.status(500).json({ 
      error: error.message || 'Text summarization failed' 
    });
  }
});

/**
 * @swagger
 * /api/text/generate:
 *   post:
 *     summary: Generate a script or story using AI
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
 *                 description: The prompt for generating the script/story
 *     responses:
 *       200:
 *         description: Script generated successfully
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
textRouter.post('/text/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Prompt is required and must be a string' 
      });
    }

    const script = await generateScript(prompt);
    res.json({ script });
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Script generation failed' 
    });
  }
});

export { textRouter };
