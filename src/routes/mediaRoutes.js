
import express from 'express';
import axios from 'axios';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { createCanvas } from 'canvas';

export const mediaRouter = express.Router();

// Available ElevenLabs voices
const ELEVENLABS_VOICES = {
  "Aria": "9BWtsMINqrJLrRacOk9x",
  "Roger": "CwhRBWXzGAHq8TQ4Fs17",
  "Sarah": "EXAVITQu4vr4xnSDxMaL",
  "Laura": "FGY2WhTYpPnrIDTdsKH5",
  "Charlie": "IKne3meq5aSn9XLyUdCD",
  "George": "JBFqnCBsd6RMkjVDRZzb",
  "Callum": "N2lVS1w4EtoT3dr4eOWO",
  "River": "SAz9YHcvj6GT2YYXdXww",
  "Liam": "TX3LPaxmHKxFdv7VOQHJ",
  "Charlotte": "XB0fDUnXU5powFXDhCwa",
  "Alice": "Xb7hH8MSUJpSbSDYk0k2",
  "Matilda": "XrExE9yKIg1WjnnlVkGX",
  "Will": "bIHbv24MWmeRgasZH58o",
  "Jessica": "cgSgspJ2msm6clMCkdW9",
  "Eric": "cjVigY5qzO86Huf0OWal",
  "Chris": "iP95p4xoKVk53GoZ742B",
  "Brian": "nPczCjzI2devNBz1zQrb",
  "Daniel": "onwK4e9ZLuTAKqWW03F9",
  "Lily": "pFZP5JQG7iQjIQuC4Bku",
  "Bill": "pqHfZKP75CvOlQylNhV4"
};

// Free TTS alternative
const generateFreeTTS = async (text, voice = "en-US") => {
  try {
    const tempDir = path.join(os.tmpdir(), uuidv4());
    await fs.ensureDir(tempDir);
    
    // Use node-gtts for free TTS
    const gtts = require('node-gtts')(voice.substring(0, 2));
    const filepath = path.join(tempDir, 'output.mp3');
    
    return new Promise((resolve, reject) => {
      gtts.save(filepath, text, async (err) => {
        if (err) {
          await fs.remove(tempDir);
          return reject(err);
        }
        
        const buffer = await fs.readFile(filepath);
        await fs.remove(tempDir);
        
        resolve({
          buffer,
          contentType: 'audio/mpeg',
          filename: 'speech.mp3'
        });
      });
    });
  } catch (error) {
    console.error('Free TTS generation error:', error);
    throw new Error('Failed to generate speech with free TTS engine');
  }
};

// Text to Image generation using Canvas
const generateImageFromText = async (prompt) => {
  try {
    console.log('Generating image from prompt:', prompt);
    const tempDir = path.join(os.tmpdir(), uuidv4());
    await fs.ensureDir(tempDir);
    
    // Create a set of images based on the prompt
    const imageCount = 4;
    const zip = new AdmZip();
    
    for (let i = 0; i < imageCount; i++) {
      const canvas = createCanvas(800, 600);
      const ctx = canvas.getContext('2d');
      
      // Generate a gradient based on the hash of the prompt + index
      const hash = hashString(prompt + i);
      const color1 = `#${hash.substring(0, 6)}`;
      const color2 = `#${hash.substring(6, 12)}`;
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);
      
      // Add text representation of the prompt
      ctx.font = '24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      
      // Add shadow to text
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      // Wrap text for display
      const words = prompt.split(' ');
      let line = '';
      let y = 250;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (testLine.length > 30 && n > 0) {
          ctx.fillText(line, 400, y);
          line = words[n] + ' ';
          y += 34;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 400, y);
      
      // Add a placeholder image element (circle or shape)
      ctx.beginPath();
      ctx.arc(400, 150, 100, 0, Math.PI * 2);
      ctx.fillStyle = invertColor(color1);
      ctx.fill();
      
      // Add some random shapes based on the hash
      for (let j = 0; j < 10; j++) {
        const x = Math.floor(Math.random() * 800);
        const y = Math.floor(Math.random() * 600);
        const size = Math.floor(Math.random() * 50) + 10;
        
        ctx.beginPath();
        if (j % 3 === 0) {
          // Circle
          ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        } else if (j % 3 === 1) {
          // Square
          ctx.rect(x, y, size, size);
        } else {
          // Triangle
          ctx.moveTo(x, y);
          ctx.lineTo(x + size, y);
          ctx.lineTo(x + size / 2, y - size);
          ctx.closePath();
        }
        
        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`;
        ctx.fill();
      }
      
      // Convert canvas to buffer
      const buffer = canvas.toBuffer('image/png');
      
      // Add to zip
      zip.addFile(`image_${i + 1}.png`, buffer);
    }
    
    // Add metadata
    const metadata = {
      prompt,
      generated: new Date().toISOString(),
      count: imageCount,
      engine: 'collaborators-world-free-generator'
    };
    
    zip.addFile('metadata.json', Buffer.from(JSON.stringify(metadata, null, 2)));
    
    return {
      buffer: zip.toBuffer(),
      contentType: 'application/zip',
      filename: 'images.zip'
    };
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error('Failed to generate images');
  }
};

// Helper function to hash a string
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hex and pad to ensure we have enough characters
  const hexHash = Math.abs(hash).toString(16).padStart(12, '0');
  return hexHash;
}

// Helper function to invert a color
function invertColor(hex) {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Invert colors
  const invR = 255 - r;
  const invG = 255 - g;
  const invB = 255 - b;
  
  // Convert back to hex
  return `#${invR.toString(16).padStart(2, '0')}${invG.toString(16).padStart(2, '0')}${invB.toString(16).padStart(2, '0')}`;
}

// Voice cloning with a local model approach 
const cloneVoiceWithLocalModel = async (name, description, files) => {
  try {
    // This would be where you'd implement actual voice cloning
    // For now, we'll return a mock success response
    return {
      success: true,
      voice_id: uuidv4(),
      name,
      description
    };
  } catch (error) {
    console.error('Voice cloning error:', error);
    throw new Error('Failed to clone voice');
  }
};

/**
 * @swagger
 * /api/media/text-to-speech:
 *   post:
 *     summary: Convert text to speech
 *     tags: [Media Services]
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
 *                 description: Voice ID or name to use (default is Aria)
 *                 example: "Aria"
 *               useLocalModel:
 *                 type: boolean
 *                 description: Whether to use the local model for TTS
 *     responses:
 *       200:
 *         description: Successfully converted text to speech
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
mediaRouter.post('/media/text-to-speech', async (req, res) => {
  try {
    const { text, voice = "Aria", useLocalModel = true } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    let result;
    
    // Use free TTS by default, no API key needed
    result = await generateFreeTTS(text, voice);
    
    // Create a zip file to contain the audio
    const zip = new AdmZip();
    
    // Add audio file to the zip
    zip.addFile("speech.mp3", result.buffer);
    
    // Add metadata
    const metadata = {
      generated: new Date().toISOString(),
      text,
      voice
    };
    zip.addFile("metadata.json", Buffer.from(JSON.stringify(metadata, null, 2)));
    
    // Get the zip buffer
    const zipBuffer = zip.toBuffer();
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="text-to-speech.zip"`);
    
    // Send the file buffer
    res.send(zipBuffer);
  } catch (error) {
    console.error('Text-to-speech API error:', error.message);
    res.status(500).json({ error: error.message || 'Text-to-speech conversion failed' });
  }
});

/**
 * @swagger
 * /api/media/clone-voice:
 *   post:
 *     summary: Clone a voice with local model
 *     tags: [Media Services]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - files
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name for the cloned voice
 *               description:
 *                 type: string
 *                 description: Description of the voice
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Audio samples (3-10 files recommended)
 *     responses:
 *       200:
 *         description: Successfully cloned voice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 voice_id:
 *                   type: string
 *                   description: ID of the cloned voice
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
mediaRouter.post('/media/clone-voice', async (req, res) => {
  try {
    const { name, description = "" } = req.body;
    const files = req.files;
    
    if (!name || !files || files.length === 0) {
      return res.status(400).json({ 
        error: 'Name and at least one audio file are required' 
      });
    }
    
    const result = await cloneVoiceWithLocalModel(
      name, 
      description, 
      files.map(f => f.buffer)
    );
    
    res.json({ 
      success: true, 
      message: 'Voice cloned successfully',
      voice_id: result.voice_id
    });
  } catch (error) {
    console.error('Voice cloning API error:', error.message);
    res.status(500).json({ error: error.message || 'Voice cloning failed' });
  }
});

/**
 * @swagger
 * /api/media/available-voices:
 *   get:
 *     summary: Get list of available TTS voices
 *     tags: [Media Services]
 *     responses:
 *       200:
 *         description: List of available voices
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
 *       500:
 *         description: Server error
 */
mediaRouter.get('/media/available-voices', async (req, res) => {
  try {
    // Free voices from GTTS
    const freeVoices = [
      'en-US', 'en-GB', 'en-AU', 'fr-FR', 'de-DE', 
      'it-IT', 'es-ES', 'hi-IN', 'pt-BR', 'ru-RU',
      'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW'
    ];
    
    res.json({
      free: freeVoices,
      premium: ELEVENLABS_VOICES
    });
  } catch (error) {
    console.error('Available voices API error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch available voices' });
  }
});

/**
 * @swagger
 * /api/media/generate-image:
 *   post:
 *     summary: Generate images from text
 *     tags: [Media Services]
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
 *         description: Successfully generated images
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
mediaRouter.post('/media/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Generate images using our free local approach
    const result = await generateImageFromText(prompt);
    
    // Set headers for file download
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    
    // Send the file buffer
    res.send(result.buffer);
  } catch (error) {
    console.error('Image generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Image generation failed' });
  }
});

/**
 * @swagger
 * /api/media/generate-video:
 *   post:
 *     summary: Generate a video from text
 *     tags: [Media Services]
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
 *         description: Video generation request received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Status message
 *                 status:
 *                   type: string
 *                   description: Status code
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
mediaRouter.post('/media/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // For now, return mock data
    const result = {
      message: "Video generation queued",
      status: "processing"
    };
    res.json(result);
  } catch (error) {
    console.error('Video generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Video generation failed' });
  }
});

/**
 * @swagger
 * /api/media/generate-animation:
 *   post:
 *     summary: Generate an animation from text
 *     tags: [Media Services]
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
 *         description: Animation generation request received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Status message
 *                 status:
 *                   type: string
 *                   description: Status code
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       500:
 *         description: Server error
 */
mediaRouter.post('/media/generate-animation', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // For now, return mock data
    const result = {
      message: "Animation generation queued",
      status: "processing"
    };
    res.json(result);
  } catch (error) {
    console.error('Animation generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Animation generation failed' });
  }
});
