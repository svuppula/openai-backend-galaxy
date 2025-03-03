const { generateThumbnailVariations } = require('../utils/thumbnailGenerator');
const { createCanvas } = require('canvas');
const AdmZip = require('adm-zip');
const gtts = require('node-gtts');
const fs = require('fs');
const path = require('path');
const os = require('os');
const express = require('express');
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
    const zipBuffer = await generateThumbnailVariations(prompt, 3);
    
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
 *     summary: Convert text to speech
 *     description: Converts provided text to speech audio using node-gtts
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
 *                 description: Voice language code for synthesis
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
    const { text, voice = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    console.log(`Generating speech for: ${text.substring(0, 30)}... using voice: ${voice}`);
    
    // Create temp directory for files
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tts-'));
    const outputFile = path.join(tempDir, 'speech.mp3');
    
    // Initialize gTTS with the selected voice/language
    const tts = gtts(voice);
    
    // Generate the speech file
    await new Promise((resolve, reject) => {
      tts.save(outputFile, text, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Create a zip with the audio file
    const zip = new AdmZip();
    zip.addLocalFile(outputFile);
    const zipBuffer = zip.toBuffer();
    
    // Clean up temp files
    fs.unlinkSync(outputFile);
    fs.rmdirSync(tempDir);
    
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

module.exports = router;
