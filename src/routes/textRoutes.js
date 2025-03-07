
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import path from 'path';
import { generateText } from '../services/textService.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * @swagger
 * /api/text/analyze:
 *   post:
 *     summary: Analyze text for sentiment and entities
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
 *                 example: "I love this product! It's amazing and the customer service is great."
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
    
    // Use generateText as a replacement for analyzeText
    const analysis = await generateText(`Analyze this text: ${text}`, 300);
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});

/**
 * @swagger
 * /api/text/summarize:
 *   post:
 *     summary: Generate a summary of provided text
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
 *                 example: "Long article or text to summarize..."
 *               maxLength:
 *                 type: number
 *                 example: 150
 *     responses:
 *       200:
 *         description: Summary results
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/summarize', async (req, res) => {
  try {
    const { text, maxLength = 150 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Use generateText as a replacement for generateSummary
    const summary = await generateText(`Summarize this text: ${text}`, maxLength);
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;
