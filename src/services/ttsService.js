
const fs = require('fs');
const path = require('path');
const gtts = require('node-gtts');
const { v4: uuidv4 } = require('uuid');

// Available voices cache
let voicesCache = null;

// Get available voices
async function getAvailableVoices() {
  if (voicesCache) {
    return voicesCache;
  }
  
  // Free voices (based on node-gtts supported languages)
  const freeVoices = [
    'en', 'en-us', 'en-gb', 'en-au', 'en-ca', 'en-in', 'en-za', 
    'fr', 'fr-ca', 'fr-fr', 
    'de', 'de-de', 
    'es', 'es-es', 'es-mx', 
    'it', 'ja', 'ko', 'nl', 'pl', 'pt', 'pt-br', 'ru', 'zh-cn', 'zh-tw'
  ];
  
  // Premium voices
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
    'Italian Male': 'it-male',
    'Italian Female': 'it-female',
    'Japanese Male': 'ja-male',
    'Japanese Female': 'ja-female'
  };
  
  // Cloned voices (would be populated by real implementation)
  const clonedVoices = {
    'Demo Voice 1': 'cloned-voice-1',
    'Demo Voice 2': 'cloned-voice-2'
  };
  
  voicesCache = {
    free: freeVoices,
    premium: premiumVoices,
    cloned: clonedVoices
  };
  
  return voicesCache;
}

// TTS function
async function textToSpeech(text, voice = 'en', sessionId) {
  return new Promise((resolve, reject) => {
    try {
      // If voice is from premium or cloned category, extract the language
      let language = voice;
      if (voice.includes('-male') || voice.includes('-female')) {
        language = voice.split('-').slice(0, -1).join('-');
      } else if (voice.startsWith('cloned-')) {
        // For cloned voices, use English as fallback
        language = 'en';
      }
      
      // Create gtts instance with the language
      const tts = gtts(language || 'en');
      
      // Create directory if it doesn't exist
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Generate a unique filename
      const filename = `tts-${sessionId || uuidv4()}.mp3`;
      const outputPath = path.join(tempDir, filename);
      
      // Generate speech file
      tts.save(outputPath, text, (err) => {
        if (err) {
          console.error('Error generating speech:', err);
          reject(err);
        } else {
          resolve(outputPath);
        }
      });
    } catch (error) {
      console.error('Error in textToSpeech:', error);
      reject(error);
    }
  });
}

// Voice cloning simulation function
async function cloneVoice(name, audioSample) {
  // This is a mock implementation
  // In a real scenario, this would use a voice cloning ML model
  
  // Generate a unique ID for the cloned voice
  const voiceId = `cloned-voice-${uuidv4().slice(0, 8)}`;
  
  // Add the cloned voice to the cache
  if (!voicesCache) {
    await getAvailableVoices();
  }
  
  voicesCache.cloned[name] = voiceId;
  
  return {
    success: true,
    name,
    voiceId,
    message: `Voice "${name}" has been successfully cloned`
  };
}

module.exports = {
  textToSpeech,
  getAvailableVoices,
  cloneVoice
};
