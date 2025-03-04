
import gTTS from 'node-gtts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Available languages in gTTS
const FREE_LANGUAGES = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)', 
  'fr-FR': 'French',
  'de-DE': 'German',
  'es-ES': 'Spanish',
  'it-IT': 'Italian',
  'ja-JP': 'Japanese',
  'ko-KR': 'Korean', 
  'pt-BR': 'Portuguese (Brazil)',
  'ru-RU': 'Russian',
  'zh-CN': 'Chinese (Simplified)',
  'nl-NL': 'Dutch',
  'hi-IN': 'Hindi',
  'id-ID': 'Indonesian',
  'pl-PL': 'Polish',
  'ar-SA': 'Arabic',
  'sv-SE': 'Swedish',
  'tr-TR': 'Turkish'
};

// Premium voice options (simulated)
const PREMIUM_VOICES = {
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

// Track cloned voices (in-memory storage, would be replaced with a database in production)
const CLONED_VOICES = {};

/**
 * Get available voices for text-to-speech
 * @returns {Promise<Object>} Object containing free and premium voices
 */
async function getAvailableVoices() {
  return {
    free: Object.keys(FREE_LANGUAGES),
    premium: PREMIUM_VOICES,
    cloned: CLONED_VOICES
  };
}

/**
 * Convert text to speech
 * @param {string} text - The text to convert to speech
 * @param {string} outputFile - Path to save the audio file
 * @param {string} voice - Voice identifier (language code for free voices or voice ID for premium/cloned)
 * @returns {Promise<string>} Path to the generated audio file
 */
async function textToSpeech(text, outputFile, voice = 'en-US') {
  return new Promise((resolve, reject) => {
    try {
      let languageCode = voice;
      
      // Check if it's a premium voice
      if (Object.values(PREMIUM_VOICES).includes(voice)) {
        // Extract language from premium voice ID (e.g., 'en-us-male' -> 'en')
        languageCode = voice.split('-')[0];
        
        // Map to gTTS supported format
        if (languageCode === 'en') {
          languageCode = voice.includes('gb') ? 'en-gb' : 'en-us';
        } else {
          languageCode = `${languageCode}-${languageCode}`;
        }
      }
      
      // Check if it's a cloned voice
      if (Object.values(CLONED_VOICES).includes(voice)) {
        // For now, cloned voices will use English (US) as base
        languageCode = 'en-us';
      }
      
      // Create gTTS instance
      const gtts = new gTTS(languageCode);
      
      // Create a write stream
      const fileStream = fs.createWriteStream(outputFile);
      
      // Generate audio and pipe to file
      gtts.stream(text)
        .pipe(fileStream)
        .on('finish', () => {
          resolve(outputFile);
        })
        .on('error', (error) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Clone a voice and use it for text-to-speech
 * @param {string} text - The text to convert to speech
 * @param {string} outputFile - Path to save the audio file
 * @param {string} voiceType - Voice type to clone
 * @returns {Promise<string>} Path to the generated audio file
 */
async function cloneVoice(text, outputFile, voiceType = 'default') {
  return new Promise((resolve, reject) => {
    try {
      // Generate a unique ID for the cloned voice
      const cloneId = uuidv4();
      const cloneName = `Cloned Voice ${Object.keys(CLONED_VOICES).length + 1}`;
      
      // Store the cloned voice (in memory for this example)
      CLONED_VOICES[cloneName] = `cloned-${cloneId}`;
      
      // For demonstration, use English TTS with slight modifications
      const gtts = new gTTS('en');
      
      // Create a write stream
      const fileStream = fs.createWriteStream(outputFile);
      
      // Generate audio and pipe to file
      gtts.stream(text)
        .pipe(fileStream)
        .on('finish', () => {
          resolve(outputFile);
        })
        .on('error', (error) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}

export { textToSpeech, getAvailableVoices, cloneVoice };
