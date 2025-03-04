
import express from 'express';
import { textToSpeech, cloneVoice } from '../services/ttsService.js';
import createYouTubeThumbnail from '../utils/thumbnailGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

/**
 * @swagger
 * /media/text-to-speech:
 *   post:
 *     summary: Convert text to speech
 *     tags: [Media]
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
 *                 description: Text to convert to speech
 *               language:
 *                 type: string
 *                 description: Language for TTS
 *                 default: english
 *               voiceType:
 *                 type: string
 *                 description: Type of voice
 *                 default: default
 *     responses:
 *       200:
 *         description: Successfully converted text to speech
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, language, voiceType } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const result = await textToSpeech(text, { language, voiceType });
    res.json(result);
  } catch (error) {
    console.error('Text-to-speech API error:', error.message);
    res.status(500).json({ error: error.message || 'Text-to-speech conversion failed' });
  }
});

/**
 * @swagger
 * /media/clone-voice:
 *   post:
 *     summary: Clone a voice and use it for text-to-speech
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - voiceType
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to convert to speech with cloned voice
 *               voiceType:
 *                 type: string
 *                 description: Voice type to simulate cloning
 *               language:
 *                 type: string
 *                 description: Language for TTS
 *                 default: english
 *     responses:
 *       200:
 *         description: Successfully generated cloned voice audio
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/clone-voice', async (req, res) => {
  try {
    const { text, voiceType, language } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const result = await cloneVoice(text, { voiceType, language });
    res.json(result);
  } catch (error) {
    console.error('Voice cloning API error:', error.message);
    res.status(500).json({ error: error.message || 'Voice cloning failed' });
  }
});

/**
 * @swagger
 * /media/generate-thumbnail:
 *   post:
 *     summary: Generate a YouTube thumbnail based on text
 *     tags: [Media]
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
 *                 description: Text to generate thumbnail from
 *               category:
 *                 type: string
 *                 description: Category of the thumbnail (optional)
 *               width:
 *                 type: number
 *                 description: Width of the thumbnail
 *                 default: 1280
 *               height:
 *                 type: number
 *                 description: Height of the thumbnail
 *                 default: 720
 *     responses:
 *       200:
 *         description: Successfully generated thumbnail
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/generate-thumbnail', async (req, res) => {
  try {
    const { text, category, width, height } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const result = await createYouTubeThumbnail(text, { category, width, height });
    
    res.json({
      success: true,
      thumbnailUrl: `/temp/${path.basename(result.path)}`,
      width: result.width,
      height: result.height,
      category: result.category
    });
  } catch (error) {
    console.error('Thumbnail generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Thumbnail generation failed' });
  }
});

/**
 * @swagger
 * /media/generate-thumbnail-pack:
 *   post:
 *     summary: Generate multiple YouTube thumbnails based on text
 *     tags: [Media]
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
 *                 description: Text to generate thumbnails from
 *               count:
 *                 type: number
 *                 description: Number of thumbnails to generate
 *                 default: 3
 *     responses:
 *       200:
 *         description: Successfully generated thumbnail pack
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/generate-thumbnail-pack', async (req, res) => {
  try {
    const { text, count = 3 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Validate count
    const thumbnailCount = Math.min(5, Math.max(1, count)); // Limit between 1-5
    
    // Create a unique folder for this batch
    const batchId = uuidv4();
    const tempDir = path.join(__dirname, '../../temp');
    const batchDir = path.join(tempDir, batchId);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    if (!fs.existsSync(batchDir)) {
      fs.mkdirSync(batchDir);
    }
    
    // Generate different categories based on the text
    const categories = ['default', 'tech', 'entertainment', 'education'];
    
    // Generate multiple thumbnails
    const thumbnails = [];
    for (let i = 0; i < thumbnailCount; i++) {
      const category = categories[i % categories.length];
      const outputPath = path.join(batchDir, `thumbnail-${i+1}.png`);
      
      // Slightly modify text for each thumbnail
      let modifiedText = text;
      if (i > 0) {
        const suffixes = [' - Best Tips', ' - Ultimate Guide', ' - How To', ' - Tutorial', ' - Explained'];
        modifiedText += suffixes[i % suffixes.length];
      }
      
      const result = await createYouTubeThumbnail(modifiedText, { 
        category,
        outputPath
      });
      
      thumbnails.push({
        path: outputPath,
        relativePath: `thumbnail-${i+1}.png`,
        category: result.category
      });
    }
    
    // Create a zip file with all thumbnails
    const zip = new AdmZip();
    thumbnails.forEach(thumbnail => {
      zip.addLocalFile(thumbnail.path);
    });
    
    const zipFilePath = path.join(tempDir, `thumbnails-${batchId}.zip`);
    zip.writeZip(zipFilePath);
    
    res.json({
      success: true,
      zipUrl: `/temp/thumbnails-${batchId}.zip`,
      thumbnailCount,
      thumbnails: thumbnails.map(thumbnail => ({
        filename: path.basename(thumbnail.path),
        category: thumbnail.category
      }))
    });
  } catch (error) {
    console.error('Thumbnail pack generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Thumbnail pack generation failed' });
  }
});

export default router;
