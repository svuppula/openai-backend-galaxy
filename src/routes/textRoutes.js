
import express from 'express';
import { summarizeText, generateKeywords } from '../services/textService.js';

const router = express.Router();

/**
 * @swagger
 * /text/summarize:
 *   post:
 *     summary: Generate a summary from text
 *     tags: [Text]
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
 *                 example: "Long text to be summarized..."
 *               maxLength:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: Generated summary
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/summarize', async (req, res) => {
  try {
    const { text, maxLength = 100 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const summary = await summarizeText(text, maxLength);
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

/**
 * @swagger
 * /text/keywords:
 *   post:
 *     summary: Extract keywords from text
 *     tags: [Text]
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
 *                 example: "Text to extract keywords from..."
 *               maxKeywords:
 *                 type: number
 *                 example: 5
 *     responses:
 *       200:
 *         description: Extracted keywords
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/keywords', async (req, res) => {
  try {
    const { text, maxKeywords = 5 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const keywords = await generateKeywords(text, maxKeywords);
    res.json({ keywords });
  } catch (error) {
    console.error('Error extracting keywords:', error);
    res.status(500).json({ error: 'Failed to extract keywords' });
  }
});

export default router;
