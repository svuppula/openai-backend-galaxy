
import express from 'express';
import { generateText, generateScript, summarizeText } from '../services/aiService.js';

const router = express.Router();

/**
 * @swagger
 * /ai/generate:
 *   post:
 *     summary: Generate text with AI
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
 *               maxTokens:
 *                 type: number
 *                 example: 100
 *               temperature:
 *                 type: number
 *                 example: 0.7
 *     responses:
 *       200:
 *         description: Generated text
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, maxTokens = 100, temperature = 0.7 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const text = await generateText(prompt, maxTokens, temperature);
    res.json({ text });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

/**
 * @swagger
 * /ai/script:
 *   post:
 *     summary: Generate a script/dialogue with AI
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *             properties:
 *               topic:
 *                 type: string
 *                 example: "A conversation between a teacher and a student about climate change."
 *               characters:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Teacher", "Student"]
 *               length:
 *                 type: string
 *                 enum: [short, medium, long]
 *                 example: "medium"
 *     responses:
 *       200:
 *         description: Generated script
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/script', async (req, res) => {
  try {
    const { 
      topic, 
      characters = ['Character 1', 'Character 2'], 
      length = 'medium' 
    } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const script = await generateScript(topic, characters, length);
    res.json({ script });
  } catch (error) {
    console.error('Error generating script:', error);
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

/**
 * @swagger
 * /ai/summarize:
 *   post:
 *     summary: Summarize text with AI
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
 *                 example: "Long text to be summarized..."
 *               length:
 *                 type: string
 *                 enum: [short, medium, long]
 *                 example: "short"
 *     responses:
 *       200:
 *         description: Summarized text
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/summarize', async (req, res) => {
  try {
    const { text, length = 'short' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const summary = await summarizeText(text, length);
    res.json({ summary });
  } catch (error) {
    console.error('Error summarizing text:', error);
    res.status(500).json({ error: 'Failed to summarize text' });
  }
});

export default router;
