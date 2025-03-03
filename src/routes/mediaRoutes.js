import express from 'express';
import { textToSpeech, generateImage, generateVideo, generateAnimation } from '../services/mediaService.js';
import axios from 'axios';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

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

// ElevenLabs TTS (premium option)
const generateElevenLabsTTS = async (text, voiceId, apiKey) => {
  try {
    const url = `${process.env.ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1'}/text-to-speech/${voiceId}`;
    
    const response = await axios({
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
        'xi-api-key': apiKey
      },
      data: {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      responseType: 'arraybuffer'
    });
    
    return {
      buffer: Buffer.from(response.data),
      contentType: 'audio/mpeg',
      filename: 'speech.mp3'
    };
  } catch (error) {
    console.error('ElevenLabs TTS generation error:', error.message);
    throw new Error('Failed to generate speech with ElevenLabs');
  }
};

// Voice cloning with ElevenLabs
const cloneVoiceWithElevenLabs = async (name, description, files, apiKey) => {
  try {
    const url = `${process.env.ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1'}/voices/add`;
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    
    // Add sample files
    files.forEach((file, index) => {
      formData.append('files', file, `sample_${index}.mp3`);
    });
    
    const response = await axios({
      method: 'POST',
      url,
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey,
      },
      data: formData
    });
    
    return response.data.voice_id;
  } catch (error) {
    console.error('Voice cloning error:', error.message);
    throw new Error('Failed to clone voice with ElevenLabs');
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
 *               apiKey:
 *                 type: string
 *                 description: Optional ElevenLabs API key for premium voices
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
    const { text, voice = "Aria", apiKey = null } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    let result;
    
    // If API key is provided, use ElevenLabs
    if (apiKey) {
      // Check if voice is a valid voice ID or name
      const voiceId = ELEVENLABS_VOICES[voice] || voice;
      result = await generateElevenLabsTTS(text, voiceId, apiKey);
    } else {
      // Use free TTS service
      result = await generateFreeTTS(text, voice);
    }
    
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
 *     summary: Clone a voice with ElevenLabs
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
 *               - apiKey
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
 *               apiKey:
 *                 type: string
 *                 description: ElevenLabs API key
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
    const { name, description = "", apiKey } = req.body;
    const files = req.files;
    
    if (!name || !files || files.length === 0 || !apiKey) {
      return res.status(400).json({ 
        error: 'Name, at least one audio file, and API key are required' 
      });
    }
    
    const voiceId = await cloneVoiceWithElevenLabs(
      name, 
      description, 
      files.map(f => f.buffer),
      apiKey
    );
    
    res.json({ 
      success: true, 
      message: 'Voice cloned successfully',
      voice_id: voiceId
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
    
    const result = await generateImage(prompt);
    
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
    
    const result = await generateVideo(prompt);
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
    
    const result = await generateAnimation(prompt);
    res.json(result);
  } catch (error) {
    console.error('Animation generation API error:', error.message);
    res.status(500).json({ error: error.message || 'Animation generation failed' });
  }
});
