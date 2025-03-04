
import express from 'express';
import { generateThumbnails } from '../utils/thumbnailGenerator.js';
import { generateTextToSpeech, cloneVoice } from '../services/ttsService.js';
import { generateText } from '../services/textService.js';
import AdmZip from 'adm-zip';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const router = express.Router();

/**
 * @swagger
 * /api/media/generate-image:
 *   post:
 *     summary: Generate YouTube thumbnail images from text
 *     description: Creates thumbnail images based on the text prompt
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
 *                 description: Text description for image generation
 *     responses:
 *       200:
 *         description: Returns a zip file with generated thumbnails
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    console.log(`Generating YouTube thumbnails for prompt: ${prompt}`);
    
    // Generate multiple thumbnail variations
    const zipBuffer = await generateThumbnails(prompt, 3);
    
    // Set response headers for zip file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=youtube-thumbnails.zip');
    
    // Send the zip buffer
    res.send(zipBuffer);
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    res.status(500).json({ error: 'Failed to generate thumbnails' });
  }
});

/**
 * @swagger
 * /api/media/text-to-speech:
 *   post:
 *     summary: Convert text to speech with voice options
 *     description: Converts provided text to speech audio using local models
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
 *               voice:
 *                 type: string
 *                 description: Voice identifier
 *     responses:
 *       200:
 *         description: Returns a zip file with the generated audio
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voice = 'en-US' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    console.log(`Generating speech for: ${text.substring(0, 30)}... using voice: ${voice}`);
    
    // Create temp directory for files
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tts-'));
    const outputFile = path.join(tempDir, 'speech.mp3');
    
    // Generate the speech file
    await generateTextToSpeech(text, voice, outputFile);
    
    // Create a zip with the audio file
    const zip = new AdmZip();
    zip.addLocalFile(outputFile);
    const zipBuffer = zip.toBuffer();
    
    // Clean up temp files
    await fs.unlink(outputFile);
    await fs.rmdir(tempDir);
    
    // Set response headers for zip file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=text-to-speech.zip');
    
    // Send the zip buffer
    res.send(zipBuffer);
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

/**
 * @swagger
 * /api/media/clone-voice:
 *   post:
 *     summary: Clone a voice for text-to-speech
 *     description: Creates a voice clone from audio samples
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio sample for voice cloning
 *               name:
 *                 type: string
 *                 description: Name for the cloned voice
 *     responses:
 *       200:
 *         description: Returns success message with voice ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 voiceId:
 *                   type: string
 */
router.post('/clone-voice', async (req, res) => {
  try {
    // Voice cloning implementation
    const voiceId = await cloneVoice(req.body);
    res.json({ success: true, voiceId });
  } catch (error) {
    console.error('Error cloning voice:', error);
    res.status(500).json({ error: 'Failed to clone voice' });
  }
});

/**
 * @swagger
 * /api/media/available-voices:
 *   get:
 *     summary: Get available voices for text-to-speech
 *     description: Returns a list of available voices for text-to-speech
 *     responses:
 *       200:
 *         description: Returns available voices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 free:
 *                   type: array
 *                   items:
 *                     type: string
 *                 premium:
 *                   type: object
 */
router.get('/available-voices', (req, res) => {
  // Return available voices
  const voices = {
    free: [
      'en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 
      'it-IT', 'pt-BR', 'ru-RU', 'ja-JP', 'ko-KR', 
      'zh-CN', 'hi-IN', 'ar-SA'
    ],
    premium: {
      'Aria (Female)': 'aria',
      'Roger (Male)': 'roger',
      'Sarah (Female)': 'sarah',
      'Charlie (Male)': 'charlie',
      'Custom Voices': 'custom'
    }
  };
  
  res.json(voices);
});

/**
 * @swagger
 * /api/media/generate-text:
 *   post:
 *     summary: Generate text using AI model
 *     description: Generates text using GPT-NeoX model
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
 *     responses:
 *       200:
 *         description: Returns generated text
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 */
router.post('/generate-text', async (req, res) => {
  try {
    const { prompt, maxLength = 100 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const text = await generateText(prompt, maxLength);
    res.json({ text });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

export default router;
