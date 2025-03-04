
import express from 'express';
import { generateScript, summarizeText } from '../services/aiService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const aiRouter = express.Router();

/**
 * @swagger
 * /ai/analyze:
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
aiRouter.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const analysis = await summarizeText(text);
    res.json({ analysis });
  } catch (error) {
    console.error('Text analysis API error:', error.message);
    res.status(500).json({ error: error.message || 'Text analysis failed' });
  }
});

/**
 * @swagger
 * /ai/script-generation:
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
aiRouter.post('/script-generation', async (req, res) => {
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

/**
 * @swagger
 * /ai/text-generation:
 *   post:
 *     summary: Generate text using local AI model
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
 *                 description: Prompt for text generation
 *               maxLength:
 *                 type: number
 *                 description: Maximum length of generated text
 *                 default: 500
 *     responses:
 *       200:
 *         description: Successfully generated text
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
aiRouter.post('/text-generation', async (req, res) => {
  try {
    const { prompt, maxLength = 500 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Simple rule-based text generation (simulating AI response)
    const generateLocalText = (prompt, maxLength) => {
      // Predefined responses for common prompts
      const responses = {
        'hello': 'Hello! How can I assist you today?',
        'weather': 'The weather is currently sunny with a chance of clouds later.',
        'help': 'I can help you with text generation, summarization, and script writing.',
        'features': 'This API supports text analysis, script generation, text-to-speech, and more!'
      };
      
      // Check if the prompt contains any keywords
      for (const [key, value] of Object.entries(responses)) {
        if (prompt.toLowerCase().includes(key)) {
          return value;
        }
      }
      
      // Default response
      const defaultResponse = `Thank you for your prompt: "${prompt}". This is a locally generated response without using external API calls. In a production environment, this would connect to an AI model like GPT-NeoX to generate more sophisticated responses tailored to your specific request.`;
      
      return defaultResponse.substring(0, maxLength);
    };
    
    const generatedText = generateLocalText(prompt, maxLength);
    res.json({ text: generatedText });
  } catch (error) {
    console.error('Text generation error:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// Export the router for use in other files
export default aiRouter;
