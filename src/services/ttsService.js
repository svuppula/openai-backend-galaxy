
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import gTTS from 'node-gtts';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Available languages for TTS
const availableLanguages = {
  english: 'en',
  spanish: 'es',
  french: 'fr',
  german: 'de',
  italian: 'it',
  japanese: 'ja',
  korean: 'ko',
  chinese: 'zh',
  russian: 'ru',
  portuguese: 'pt',
  dutch: 'nl',
  hindi: 'hi',
  arabic: 'ar'
};

// Define voice types (simulated since gTTS doesn't have different voices)
const voiceTypes = {
  male: {
    pitch: 0.8,  // Lower pitch to simulate male voice
    speed: 1.0
  },
  female: {
    pitch: 1.2,  // Higher pitch to simulate female voice
    speed: 1.0
  },
  child: {
    pitch: 1.5,  // Higher pitch to simulate child voice
    speed: 1.1   // Slightly faster to simulate child voice
  },
  elder: {
    pitch: 0.7,  // Lower pitch for elder voice
    speed: 0.8   // Slower for elder voice
  },
  robot: {
    pitch: 0.5,  // Very low pitch for robot voice
    speed: 0.9   // Slightly slower for robotic effect
  }
};

/**
 * Convert text to speech using Google's TTS service
 * @param {string} text - The text to convert to speech
 * @param {object} options - Options for the TTS conversion
 * @returns {Promise<object>} - Object containing the URL of the audio file
 */
export const textToSpeech = async (text, options = {}) => {
  try {
    if (!text) {
      throw new Error('Text is required for text-to-speech conversion');
    }
    
    // Get language from options or default to English
    const language = options.language ? 
      (availableLanguages[options.language.toLowerCase()] || 'en') : 
      'en';
    
    // Set up Google TTS with the selected language
    const gtts = new gTTS(language);
    
    // Create filename with UUID to ensure uniqueness
    const filename = `tts-${uuidv4()}.mp3`;
    const tempDir = path.join(__dirname, '../../temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, filename);
    
    // Save the audio file
    return new Promise((resolve, reject) => {
      gtts.save(filePath, text, (err) => {
        if (err) {
          console.error('Error saving TTS audio:', err);
          return reject(err);
        }
        
        // Prepare response with file info
        const fileUrl = `/temp/${filename}`;
        
        // Add voice type info to response (simulated)
        const voiceType = options.voiceType || 'default';
        
        resolve({
          success: true,
          audioUrl: fileUrl,
          fileName: filename,
          language,
          voiceType,
          message: 'Text-to-speech conversion successful'
        });
      });
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
};

/**
 * Simulate voice cloning by applying simple transformations
 * @param {string} text - The text to convert to speech
 * @param {object} options - Options including voice sample
 * @returns {Promise<object>} - Object containing the URL of the cloned voice audio
 */
export const cloneVoice = async (text, options = {}) => {
  try {
    if (!text) {
      throw new Error('Text is required for voice cloning');
    }
    
    // In a real implementation, we would analyze the voice sample
    // For this simulation, we'll just use predefined voice types
    
    // Use provided voice type or determine based on "sample" metadata
    const voiceType = options.voiceType || 'default';
    const language = options.language ? 
      (availableLanguages[options.language.toLowerCase()] || 'en') : 
      'en';
    
    // Set up Google TTS with the selected language
    const gtts = new gTTS(language);
    
    // Create filename with UUID to ensure uniqueness
    const filename = `voice-clone-${uuidv4()}.mp3`;
    const tempDir = path.join(__dirname, '../../temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, filename);
    
    // Generate the TTS audio
    return new Promise((resolve, reject) => {
      gtts.save(filePath, text, (err) => {
        if (err) {
          console.error('Error saving cloned voice audio:', err);
          return reject(err);
        }
        
        // Prepare response with file info and simulated voice cloning metadata
        const fileUrl = `/temp/${filename}`;
        
        resolve({
          success: true,
          audioUrl: fileUrl,
          fileName: filename,
          language,
          voiceType,
          isCloned: true,
          message: 'Voice cloning simulation successful'
        });
      });
    });
  } catch (error) {
    console.error('Voice cloning error:', error);
    throw error;
  }
};

export default {
  textToSpeech,
  cloneVoice,
  availableLanguages,
  voiceTypes
};
