
import express from 'express';
import { textToSpeech, getAvailableVoices, cloneVoice } from '../services/ttsService.js';
import createYouTubeThumbnail from '../utils/thumbnailGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * @swagger
 * /media/available-voices:
 *   get:
 *     summary: Get available voices for text-to-speech
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: List of available voices
 *       500:
 *         description: Server error
 */
router.get('/available-voices', async (req, res) => {
  try {
    const voices = await getAvailableVoices();
    res.json(voices);
  } catch (error) {
    console.error('Error fetching available voices:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch available voices' });
  }
});

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
 *               voice:
 *                 type: string
 *                 description: Voice identifier
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
    const { text, voice } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const outputId = uuidv4();
    const outputFile = path.join(tempDir, `${outputId}.mp3`);
    
    await textToSpeech(text, outputFile, voice);
    
    // Create a zip file with the audio
    const zip = new AdmZip();
    zip.addLocalFile(outputFile);
    
    const zipFilePath = path.join(tempDir, `speech-${outputId}.zip`);
    zip.writeZip(zipFilePath);
    
    // Clean up the audio file
    fs.unlinkSync(outputFile);
    
    // Send the zip file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="text-to-speech.zip"`);
    
    const zipStream = fs.createReadStream(zipFilePath);
    zipStream.pipe(res);
    
    // Clean up the zip file after sending
    zipStream.on('end', () => {
      fs.unlinkSync(zipFilePath);
    });
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
 *                 description: Voice type to clone
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
    const { text, voiceType } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const outputId = uuidv4();
    const outputFile = path.join(tempDir, `${outputId}.mp3`);
    
    await cloneVoice(text, outputFile, voiceType);
    
    // Create a zip file with the audio
    const zip = new AdmZip();
    zip.addLocalFile(outputFile);
    
    const zipFilePath = path.join(tempDir, `cloned-voice-${outputId}.zip`);
    zip.writeZip(zipFilePath);
    
    // Clean up the audio file
    fs.unlinkSync(outputFile);
    
    // Send the zip file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="cloned-voice.zip"`);
    
    const zipStream = fs.createReadStream(zipFilePath);
    zipStream.pipe(res);
    
    // Clean up the zip file after sending
    zipStream.on('end', () => {
      fs.unlinkSync(zipFilePath);
    });
  } catch (error) {
    console.error('Voice cloning API error:', error.message);
    res.status(500).json({ error: error.message || 'Voice cloning failed' });
  }
});

/**
 * @swagger
 * /media/generate-image:
 *   post:
 *     summary: Generate realistic images based on text
 *     tags: [Media]
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
 *                 description: Text to generate images from
 *     responses:
 *       200:
 *         description: Successfully generated images
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Create a unique folder for this batch
    const batchId = uuidv4();
    const tempDir = path.join(process.cwd(), 'temp');
    const batchDir = path.join(tempDir, batchId);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    if (!fs.existsSync(batchDir)) {
      fs.mkdirSync(batchDir);
    }
    
    // Generate multiple thumbnails with different styles/contexts
    const thumbnailCount = 3;
    const thumbnails = [];
    
    // Define contexts for realistic images - use realistic styles for different contexts
    const contexts = [
      { style: 'realistic', context: 'nature' },
      { style: 'realistic', context: 'urban' },
      { style: 'realistic', context: 'technology' }
    ];
    
    for (let i = 0; i < thumbnailCount; i++) {
      const context = contexts[i % contexts.length];
      const outputPath = path.join(batchDir, `image-${i+1}.png`);
      
      const result = await createYouTubeThumbnail(prompt, { 
        style: context.style,
        context: context.context,
        outputPath,
        width: 1280,
        height: 720
      });
      
      thumbnails.push({
        path: outputPath,
        relativePath: `image-${i+1}.png`,
        style: context.style,
        context: context.context
      });
    }
    
    // Create a zip file with all thumbnails
    const zip = new AdmZip();
    thumbnails.forEach(thumbnail => {
      zip.addLocalFile(thumbnail.path);
    });
    
    const zipFilePath = path.join(tempDir, `images-${batchId}.zip`);
    zip.writeZip(zipFilePath);
    
    // Clean up individual image files
    thumbnails.forEach(thumbnail => {
      fs.unlinkSync(thumbnail.path);
    });
    fs.rmdirSync(batchDir);
    
    // Send the zip file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="generate-image.zip"`);
    
    const zipStream = fs.createReadStream(zipFilePath);
    zipStream.pipe(res);
    
    // Clean up the zip file after sending
    zipStream.on('end', () => {
      fs.unlinkSync(zipFilePath);
    });
  } catch (error) {
    console.error('Image generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Image generation failed' });
  }
});

/**
 * @swagger
 * /media/generate-video:
 *   post:
 *     summary: Generate video content based on text
 *     tags: [Media]
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
 *                 description: Text to generate video from
 *     responses:
 *       200:
 *         description: Successfully generated video
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // For now, we'll simulate video generation by creating a sequence of images
    const batchId = uuidv4();
    const tempDir = path.join(process.cwd(), 'temp');
    const batchDir = path.join(tempDir, batchId);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    if (!fs.existsSync(batchDir)) {
      fs.mkdirSync(batchDir);
    }
    
    // Generate a sequence of frames (images)
    const frameCount = 5;
    const frames = [];
    
    for (let i = 0; i < frameCount; i++) {
      const outputPath = path.join(batchDir, `frame-${i+1}.png`);
      
      // Generate slightly different images for each frame
      const framePrompt = `${prompt} - scene ${i+1}`;
      
      const result = await createYouTubeThumbnail(framePrompt, { 
        style: 'realistic',
        context: 'video frame',
        outputPath
      });
      
      frames.push({
        path: outputPath,
        relativePath: `frame-${i+1}.png`
      });
    }
    
    // Create a zip file with all frames
    const zip = new AdmZip();
    frames.forEach(frame => {
      zip.addLocalFile(frame.path);
    });
    
    // Add a README.txt explaining these are video frames
    const readmePath = path.join(batchDir, 'README.txt');
    fs.writeFileSync(readmePath, `Video frames generated from prompt: "${prompt}"\n\nThese frames represent key moments in a video sequence.`);
    zip.addLocalFile(readmePath);
    
    const zipFilePath = path.join(tempDir, `video-${batchId}.zip`);
    zip.writeZip(zipFilePath);
    
    // Clean up individual files
    frames.forEach(frame => {
      fs.unlinkSync(frame.path);
    });
    fs.unlinkSync(readmePath);
    fs.rmdirSync(batchDir);
    
    // Send the zip file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="generate-video.zip"`);
    
    const zipStream = fs.createReadStream(zipFilePath);
    zipStream.pipe(res);
    
    // Clean up the zip file after sending
    zipStream.on('end', () => {
      fs.unlinkSync(zipFilePath);
    });
  } catch (error) {
    console.error('Video generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Video generation failed' });
  }
});

/**
 * @swagger
 * /media/generate-animation:
 *   post:
 *     summary: Generate animation content based on text
 *     tags: [Media]
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
 *                 description: Text to generate animation from
 *     responses:
 *       200:
 *         description: Successfully generated animation
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/generate-animation', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Similar to video generation, we'll create a sequence of frames
    const batchId = uuidv4();
    const tempDir = path.join(process.cwd(), 'temp');
    const batchDir = path.join(tempDir, batchId);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    if (!fs.existsSync(batchDir)) {
      fs.mkdirSync(batchDir);
    }
    
    // Generate a sequence of animation frames (images)
    const frameCount = 8;
    const frames = [];
    
    for (let i = 0; i < frameCount; i++) {
      const outputPath = path.join(batchDir, `frame-${i+1}.png`);
      
      // Generate animation frames with progressive changes
      const framePrompt = `${prompt} - animation frame ${i+1} of ${frameCount}`;
      
      const result = await createYouTubeThumbnail(framePrompt, { 
        style: 'animation',
        context: 'animation frame',
        outputPath
      });
      
      frames.push({
        path: outputPath,
        relativePath: `frame-${i+1}.png`
      });
    }
    
    // Create a zip file with all frames
    const zip = new AdmZip();
    frames.forEach(frame => {
      zip.addLocalFile(frame.path);
    });
    
    // Add a README.txt explaining these are animation frames
    const readmePath = path.join(batchDir, 'README.txt');
    fs.writeFileSync(readmePath, `Animation frames generated from prompt: "${prompt}"\n\nThese frames represent a sequence of animation frames.`);
    zip.addLocalFile(readmePath);
    
    const zipFilePath = path.join(tempDir, `animation-${batchId}.zip`);
    zip.writeZip(zipFilePath);
    
    // Clean up individual files
    frames.forEach(frame => {
      fs.unlinkSync(frame.path);
    });
    fs.unlinkSync(readmePath);
    fs.rmdirSync(batchDir);
    
    // Send the zip file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="generate-animation.zip"`);
    
    const zipStream = fs.createReadStream(zipFilePath);
    zipStream.pipe(res);
    
    // Clean up the zip file after sending
    zipStream.on('end', () => {
      fs.unlinkSync(zipFilePath);
    });
  } catch (error) {
    console.error('Animation generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Animation generation failed' });
  }
});

export default router;
