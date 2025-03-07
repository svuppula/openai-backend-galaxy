
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import AdmZip from 'adm-zip';
import gtts from 'node-gtts';

// Environment variable or default temp directory
const tempDir = process.env.TEMP_DIR || '/tmp';

/**
 * Converts text to speech and returns the path to the generated audio file
 * @param {string} text - The text to convert to speech
 * @param {string} voice - The voice to use (language code for free voices, voice ID for premium)
 * @returns {Promise<string>} - Path to the generated audio file
 */
export const textToSpeech = async (text, voice = 'en-US') => {
  try {
    // Create a unique ID for this TTS request
    const requestId = uuidv4();
    const outputDir = path.join(tempDir, requestId);
    const outputFile = path.join(outputDir, 'speech.mp3');
    const zipFile = path.join(tempDir, `${requestId}.zip`);
    
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Determine if this is a free voice (language code) or a premium/cloned voice
    if (voice.includes('-')) {
      // This is a free voice using gtts
      const language = voice.split('-')[0].toLowerCase();
      const tts = gtts(language);
      
      console.log(`Generating speech using free TTS (language: ${language})`);
      
      // Convert text to speech (returns a promise)
      await new Promise((resolve, reject) => {
        tts.save(outputFile, text, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } else {
      // This is a premium or cloned voice
      // We'll just use the free TTS for now as a fallback
      const tts = gtts('en');
      
      console.log(`Using fallback TTS for voice ID: ${voice}`);
      
      // Convert text to speech (returns a promise)
      await new Promise((resolve, reject) => {
        tts.save(outputFile, text, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    
    // Create a ZIP file containing the audio
    const zip = new AdmZip();
    zip.addLocalFile(outputFile);
    zip.writeZip(zipFile);
    
    // Clean up the temporary output directory
    fs.unlinkSync(outputFile);
    fs.rmdirSync(outputDir);
    
    return zipFile;
  } catch (error) {
    console.error('Error in textToSpeech:', error);
    throw new Error(`Failed to convert text to speech: ${error.message}`);
  }
};

/**
 * Returns the available voices for text-to-speech
 * @returns {Promise<Object>} - Object containing free and premium voices
 */
export const getAvailableVoices = async () => {
  // Free voices are language codes
  const freeVoices = ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'ja-JP', 'ko-KR', 'pt-BR', 'ru-RU', 'zh-CN'];
  
  // Premium voices are key-value pairs (name: ID)
  const premiumVoices = {
    'American Male': 'en-us-male',
    'American Female': 'en-us-female',
    'British Male': 'en-gb-male',
    'British Female': 'en-gb-female',
    'French Male': 'fr-fr-male',
    'French Female': 'fr-fr-female',
    'German Male': 'de-de-male',
    'German Female': 'de-de-female',
    'Spanish Male': 'es-es-male',
    'Spanish Female': 'es-es-female'
  };
  
  // Cloned voices would be populated dynamically if we had a real voice cloning service
  const clonedVoices = {};
  
  return {
    free: freeVoices,
    premium: premiumVoices,
    cloned: clonedVoices
  };
};
