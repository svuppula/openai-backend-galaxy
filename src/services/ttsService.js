
import gtts from 'node-gtts';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createCanvas } from 'canvas';
import NodeCache from 'node-cache';

// Set up cache for voice models
const voiceCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // Cache for 1 hour

/**
 * Generate text-to-speech using gTTS (Google Text to Speech) with caching
 * @param {string} text - The text to convert to speech
 * @param {string} voice - The voice/language to use
 * @param {string} outputFile - Path to the output file
 * @returns {Promise<string>} - Path to the generated audio file
 */
export const generateTextToSpeech = async (text, voice, outputFile) => {
  return new Promise((resolve, reject) => {
    try {
      // Initialize gTTS with the selected voice/language
      const tts = gtts(voice.substring(0, 2)); // Get language code from voice code
      
      // Generate the speech file
      tts.save(outputFile, text, (err) => {
        if (err) reject(err);
        else resolve(outputFile);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Simple voice cloning implementation (simulation)
 * In a production environment, you would use a more sophisticated model
 * @param {object} data - The voice data
 * @returns {Promise<string>} - The voice ID
 */
export const cloneVoice = async (data) => {
  // Generate unique ID for the voice
  const voiceId = `custom-${Date.now()}`;
  
  // In a real implementation, you'd process the audio sample and train a model
  // For this demo, we'll simply store the voice ID in cache
  voiceCache.set(voiceId, {
    name: data.name || `Custom Voice ${voiceId}`,
    created: new Date().toISOString()
  });
  
  return voiceId;
};

/**
 * Get available voices, including custom voices
 * @returns {object} - Object with free and premium voices
 */
export const getAvailableVoices = () => {
  const standardVoices = {
    free: [
      'en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 
      'it-IT', 'pt-BR', 'ru-RU', 'ja-JP', 'ko-KR', 
      'zh-CN', 'hi-IN', 'ar-SA'
    ],
    premium: {
      'Aria (Female)': 'aria',
      'Roger (Male)': 'roger',
      'Sarah (Female)': 'sarah',
      'Charlie (Male)': 'charlie'
    }
  };
  
  // Add custom voices from cache
  const customVoices = {};
  const customKeys = voiceCache.keys();
  
  for (const key of customKeys) {
    const voice = voiceCache.get(key);
    if (voice && voice.name) {
      customVoices[voice.name] = key;
    }
  }
  
  if (Object.keys(customVoices).length > 0) {
    standardVoices.custom = customVoices;
  }
  
  return standardVoices;
};
