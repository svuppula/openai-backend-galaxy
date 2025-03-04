
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import gtts from 'node-gtts';

// ES Module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Available voices
const availableVoices = {
  free: ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'ja-JP', 'ko-KR', 'pt-BR', 'ru-RU', 'zh-CN', 'nl-NL', 'hi-IN', 'id-ID', 'pl-PL', 'sv-SE', 'tr-TR', 'ar-SA'],
  premium: {
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
  },
  cloned: {}
};

// Get available voices
export async function getAvailableVoices() {
  return availableVoices;
}

// Add a cloned voice
export function addClonedVoice(name, voiceId) {
  availableVoices.cloned[name] = voiceId;
  return availableVoices;
}

// Text to speech conversion
export async function textToSpeech(text, voice = 'en-US') {
  try {
    // Create temp directory if it doesn't exist
    const tempDir = process.env.TEMP_DIR || './temp';
    fs.ensureDirSync(tempDir);
    
    // Create a unique output directory for this request
    const outputDir = path.join(tempDir, `tts_${Date.now()}`);
    fs.ensureDirSync(outputDir);
    
    // Determine voice type and parameters
    let voiceCode = voice;
    let isPremium = false;
    let isCloned = false;
    
    // Check if the voice is a premium voice
    for (const [name, id] of Object.entries(availableVoices.premium)) {
      if (voice === id) {
        isPremium = true;
        // Extract language code from the ID
        voiceCode = id.split('-').slice(0, 2).join('-');
        break;
      }
    }
    
    // Check if the voice is a cloned voice
    for (const [name, id] of Object.entries(availableVoices.cloned)) {
      if (voice === id) {
        isCloned = true;
        // Use a default language code for cloned voices
        voiceCode = 'en-US';
        break;
      }
    }
    
    // Generate speech using node-gtts
    // Splitting the code to handle different voice types for clarity
    let audioFilePath;
    
    if (isPremium || isCloned) {
      // For premium or cloned voices, we'll still use gtts but add metadata
      // In a real implementation, different TTS engines would be used
      
      // Extract language code for gtts
      const langCode = voiceCode.split('-')[0];
      
      // Create gtts instance with language
      const gTTS = gtts(langCode);
      
      audioFilePath = path.join(outputDir, 'speech.mp3');
      
      // Generate speech
      await new Promise((resolve, reject) => {
        gTTS.save(audioFilePath, text, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      // Create a metadata file to explain the voice
      const metadataContent = isPremium
        ? `This audio was generated using a premium voice simulation: ${voice}`
        : `This audio was generated using a cloned voice simulation: ${voice}`;
      
      fs.writeFileSync(path.join(outputDir, 'voice_info.txt'), metadataContent);
    } else {
      // For free voices, just use gtts directly
      // Extract language code for gtts
      const langCode = voiceCode.split('-')[0];
      
      // Create gtts instance with language
      const gTTS = gtts(langCode);
      
      audioFilePath = path.join(outputDir, 'speech.mp3');
      
      // Generate speech
      await new Promise((resolve, reject) => {
        gTTS.save(audioFilePath, text, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    
    // Create a README file
    fs.writeFileSync(
      path.join(outputDir, 'README.txt'),
      `Text to Speech\n\n` +
      `Original Text:\n${text}\n\n` +
      `Voice: ${voice}\n\n` +
      `Generated using node-gtts (Google Text-to-Speech)\n`
    );
    
    // Create a ZIP file containing the audio and metadata
    const zip = new AdmZip();
    
    // Add all files in the output directory to the ZIP
    const files = fs.readdirSync(outputDir);
    for (const file of files) {
      zip.addLocalFile(path.join(outputDir, file));
    }
    
    // Write the ZIP file
    const zipFilePath = path.join(tempDir, `speech_${Date.now()}.zip`);
    zip.writeZip(zipFilePath);
    
    // Clean up the output directory
    fs.removeSync(outputDir);
    
    return zipFilePath;
  } catch (error) {
    console.error('Text to speech error:', error);
    throw error;
  }
}
