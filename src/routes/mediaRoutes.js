
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import NodeCache from 'node-cache';
import { generateYouTubeThumbnails } from '../utils/thumbnailGenerator.js';
import gtts from 'node-gtts';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for voice cloning profiles
const voiceCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

// Initialize router
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TextToSpeechRequest:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           description: Text to convert to speech
 *         voice:
 *           type: string
 *           description: Voice identifier to use
 */

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
 *             $ref: '#/components/schemas/TextToSpeechRequest'
 *     responses:
 *       200:
 *         description: Returns audio file
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/text-to-speech', async (req, res) => {
  try {
    console.log('Text-to-speech request received');
    const { text, voice = 'en-us' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Create temporary directory if it doesn't exist
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create a unique filename
    const timestamp = Date.now();
    const outputFile = path.join(tempDir, `tts_${timestamp}.mp3`);
    const outputZip = path.join(tempDir, `tts_${timestamp}.zip`);
    
    // Parse language code from voice parameter
    let lang = 'en';
    if (voice.includes('-')) {
      // Extract language code from formats like en-US
      lang = voice.split('-')[0].toLowerCase();
    }
    
    // Check if language is supported
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'ja', 'ko', 'zh'];
    if (!supportedLanguages.includes(lang)) {
      lang = 'en'; // Default to English if not supported
    }
    
    // Initialize TTS with the selected language
    const tts = gtts(lang);
    
    // Create a promise wrapper for the TTS save function
    const saveAudio = () => {
      return new Promise((resolve, reject) => {
        tts.save(outputFile, text, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    };
    
    // Generate audio file
    await saveAudio();
    
    // Create ZIP file
    const zip = new AdmZip();
    zip.addLocalFile(outputFile);
    zip.writeZip(outputZip);
    
    // Send ZIP file
    res.setHeader('Content-Disposition', 'attachment; filename="text-to-speech.zip"');
    res.setHeader('Content-Type', 'application/zip');
    fs.createReadStream(outputZip).pipe(res);
    
    // Clean up files after sending
    setTimeout(() => {
      try {
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
        if (fs.existsSync(outputZip)) fs.unlinkSync(outputZip);
      } catch (err) {
        console.error('Error cleaning up temp files:', err);
      }
    }, 5000);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: error.message || 'Failed to convert text to speech' });
  }
});

/**
 * @swagger
 * /media/clone-voice:
 *   post:
 *     summary: Clone a voice using local models
 *     tags: [Media]
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
 *                 description: Audio file for voice cloning
 *               name:
 *                 type: string
 *                 description: Name for the cloned voice
 *     responses:
 *       200:
 *         description: Voice cloned successfully
 */
router.post('/clone-voice', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Voice name is required' });
    }
    
    // In a real implementation, we would process the audio file
    // Here we're simulating voice cloning by storing the name
    
    // Create a simple voice profile (in a real app this would have more data)
    const voiceProfile = {
      id: `voice_${Date.now()}`,
      name,
      created: new Date().toISOString(),
      // This would normally have model weights or parameters
      // We're simulating this for the free implementation
      parameters: {
        pitch: Math.random() * 0.5 + 0.75, // Random pitch modifier
        speed: Math.random() * 0.3 + 0.85, // Random speed modifier
      }
    };
    
    // Store in cache
    voiceCache.set(voiceProfile.id, voiceProfile);
    
    res.json({
      success: true,
      message: 'Voice cloned successfully (simulation)',
      voiceId: voiceProfile.id
    });
  } catch (error) {
    console.error('Voice cloning error:', error);
    res.status(500).json({ error: error.message || 'Failed to clone voice' });
  }
});

/**
 * @swagger
 * /media/available-voices:
 *   get:
 *     summary: Get all available voices
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: List of available voices
 */
router.get('/available-voices', (req, res) => {
  try {
    // Free system voices
    const freeVoices = [
      'en-US', 'en-GB', 'fr-FR', 'de-DE', 'it-IT', 
      'es-ES', 'ja-JP', 'ko-KR', 'pt-BR', 'zh-CN'
    ];
    
    // Premium voices (simulated - these would be higher quality in a real system)
    const premiumVoices = {
      'American Male': 'en-us-male',
      'American Female': 'en-us-female',
      'British Male': 'en-gb-male',
      'British Female': 'en-gb-female',
      'Australian Male': 'en-au-male',
      'Australian Female': 'en-au-female',
      'Indian Male': 'en-in-male',
      'Indian Female': 'en-in-female',
      'French Male': 'fr-fr-male',
      'French Female': 'fr-fr-female',
      'German Male': 'de-de-male',
      'German Female': 'de-de-female',
      'Spanish Male': 'es-es-male',
      'Spanish Female': 'es-es-female',
      'Italian Male': 'it-it-male',
      'Italian Female': 'it-it-female',
      'Japanese Male': 'ja-jp-male',
      'Japanese Female': 'ja-jp-female'
    };
    
    // Get cloned voices from cache
    const clonedVoices = {};
    const keys = voiceCache.keys();
    for (const key of keys) {
      const voice = voiceCache.get(key);
      if (voice) {
        clonedVoices[voice.name] = voice.id;
      }
    }
    
    res.json({
      free: freeVoices,
      premium: premiumVoices,
      cloned: clonedVoices
    });
  } catch (error) {
    console.error('Get voices error:', error);
    res.status(500).json({ error: error.message || 'Failed to get available voices' });
  }
});

/**
 * @swagger
 * /media/generate-image:
 *   post:
 *     summary: Generate an image from text
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
 *                 description: Text prompt for image generation
 *     responses:
 *       200:
 *         description: Returns generated image
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/generate-image', async (req, res) => {
  try {
    console.log('Generate image request received');
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Generate YouTube thumbnails using Canvas
    const zipBuffer = await generateYouTubeThumbnails(prompt);
    
    // Send the ZIP file
    res.setHeader('Content-Disposition', 'attachment; filename="youtube-thumbnails.zip"');
    res.setHeader('Content-Type', 'application/zip');
    res.send(zipBuffer);
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

/**
 * @swagger
 * /media/generate-video:
 *   post:
 *     summary: Generate a video from text
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
 *                 description: Text prompt for video generation
 *     responses:
 *       200:
 *         description: Returns generated video
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/generate-video', async (req, res) => {
  try {
    console.log('Generate video request received');
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Create temporary directory if it doesn't exist
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Generate thumbnails first (we'll use these for the video frames)
    const thumbnailZip = await generateYouTubeThumbnails(prompt);
    
    // Extract thumbnails to temp directory
    const thumbnailsDir = path.join(tempDir, `video_frames_${Date.now()}`);
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }
    
    // Extract thumbnails
    const thumbZip = new AdmZip(thumbnailZip);
    thumbZip.extractAllTo(thumbnailsDir, true);
    
    // Currently, we're just sending back the thumbnails
    // In a real implementation, we would create a video from the frames
    // using something like ffmpeg or a browser-based video encoding library
    
    // Create a zip file with the "video frames"
    const outputZip = new AdmZip();
    
    // Add README explaining the limitations
    const readmeContent = `
# Video Generation

This package contains still frames that would be used to create a video based on your prompt:
"${prompt}"

In a production environment, these frames would be combined with transitions and 
text animations to create a full video.

## Contents
- Thumbnail frames in different aspect ratios
- Sample script based on your prompt

## Note
For a complete video solution, these frames would be animated and combined
using a video editing API or library.
`;
    
    outputZip.addFile('README.md', Buffer.from(readmeContent));
    
    // Add all the thumbnails
    const files = fs.readdirSync(thumbnailsDir);
    for (const file of files) {
      outputZip.addLocalFile(path.join(thumbnailsDir, file));
    }
    
    // Add a simple script based on the prompt
    const scriptContent = `
# Video Script: ${prompt}

## Introduction
Hello everyone, welcome to this video about ${prompt}.

## Main Points
${prompt.split(' ').length > 5 ? prompt : 'Today we\'ll explore the key aspects of ' + prompt}

## Conclusion
Thanks for watching! Don't forget to like and subscribe for more content.
`;
    outputZip.addFile('video_script.md', Buffer.from(scriptContent));
    
    // Send the ZIP file
    res.setHeader('Content-Disposition', 'attachment; filename="video-generation.zip"');
    res.setHeader('Content-Type', 'application/zip');
    res.send(outputZip.toBuffer());
    
    // Clean up temp directory
    setTimeout(() => {
      try {
        fs.rmSync(thumbnailsDir, { recursive: true, force: true });
      } catch (err) {
        console.error('Error cleaning up temp files:', err);
      }
    }, 5000);
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate video' });
  }
});

/**
 * @swagger
 * /media/generate-animation:
 *   post:
 *     summary: Generate an animation from text
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
 *                 description: Text prompt for animation generation
 *     responses:
 *       200:
 *         description: Returns generated animation
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/generate-animation', async (req, res) => {
  try {
    console.log('Generate animation request received');
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Create temporary directory if it doesn't exist
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Generate thumbnails first (we'll use these for the animation frames with modifications)
    const thumbnailZip = await generateYouTubeThumbnails(prompt);
    
    // Extract thumbnails to temp directory
    const thumbnailsDir = path.join(tempDir, `animation_frames_${Date.now()}`);
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }
    
    // Extract thumbnails
    const thumbZip = new AdmZip(thumbnailZip);
    thumbZip.extractAllTo(thumbnailsDir, true);
    
    // Create a zip file with the "animation frames"
    const outputZip = new AdmZip();
    
    // Add README explaining the limitations
    const readmeContent = `
# Animation Generation

This package contains still frames that would be used to create an animation based on your prompt:
"${prompt}"

In a production environment, these frames would be combined with transitions and 
animations to create a full animated sequence.

## Contents
- Base frames in different aspect ratios
- Animation script and instructions

## Note
For a complete animation solution, these frames would be combined
using an animation library or API.
`;
    
    outputZip.addFile('README.md', Buffer.from(readmeContent));
    
    // Add all the thumbnails as animation frames
    const files = fs.readdirSync(thumbnailsDir);
    for (const file of files) {
      outputZip.addLocalFile(path.join(thumbnailsDir, file));
    }
    
    // Add animation script
    const scriptContent = `
# Animation Script: ${prompt}

## Scene 1: Introduction
Fade in to the main title: "${prompt}"
Add subtle motion to the background elements

## Scene 2: Main Content
Present key information with animated text
Use smooth transitions between information points

## Scene 3: Conclusion
Show call-to-action with animated elements
Fade out with logo

## Animation Notes
- Use easing functions for smooth motion
- Incorporate text reveals and highlights
- Add particle effects for emphasis
`;
    outputZip.addFile('animation_script.md', Buffer.from(scriptContent));
    
    // Add animation instructions
    const instructionsContent = `
# How to use these animation frames

1. Load the frames into an animation software like After Effects, Blender, or a web-based animation library
2. Apply motion tweens between frames
3. Add text animations following the script
4. Render the final animation at 30fps for smooth playback
`;
    outputZip.addFile('animation_instructions.md', Buffer.from(instructionsContent));
    
    // Send the ZIP file
    res.setHeader('Content-Disposition', 'attachment; filename="animation-generation.zip"');
    res.setHeader('Content-Type', 'application/zip');
    res.send(outputZip.toBuffer());
    
    // Clean up temp directory
    setTimeout(() => {
      try {
        fs.rmSync(thumbnailsDir, { recursive: true, force: true });
      } catch (err) {
        console.error('Error cleaning up temp files:', err);
      }
    }, 5000);
  } catch (error) {
    console.error('Animation generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate animation' });
  }
});

export default router;
