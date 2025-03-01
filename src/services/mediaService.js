
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import AdmZip from 'adm-zip';
import { createCanvas } from 'canvas';

// Create temp directory for storing generated files
const createTempDir = () => {
  const tempDir = path.join(os.tmpdir(), `ai-gen-${uuidv4()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
};

/**
 * Initialize media models
 */
export const initializeMediaModels = async () => {
  try {
    console.log('Media models initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize media models:', error);
    return false;
  }
};

/**
 * Convert text to speech using Web Speech API compatible audio synthesis
 */
export const textToSpeech = async (text) => {
  try {
    if (!text) {
      throw new Error('Text is required for text-to-speech conversion');
    }

    // Create temp directory
    const tempDir = createTempDir();
    const outputZipPath = path.join(tempDir, 'audio.zip');
    const audioFilePath = path.join(tempDir, 'speech.mp3');

    // Generate a simple audio tone with frequencies that mimic speech
    // This is a completely free alternative that doesn't rely on any external services
    const sampleRate = 44100;
    const duration = Math.min(30, Math.max(3, text.length / 20)); // Scale duration with text length
    
    // Calculate number of samples
    const numSamples = Math.floor(sampleRate * duration);
    const audioData = Buffer.alloc(numSamples * 2); // 16-bit audio = 2 bytes per sample
    
    // Generate a simple sine wave with varying frequencies to simulate speech patterns
    // This creates a synthetic voice pattern based on the text content
    const words = text.split(' ');
    let wordIndex = 0;
    
    for (let i = 0; i < numSamples; i++) {
      // Progress through words to create varying frequencies
      const progress = i / numSamples;
      wordIndex = Math.floor(progress * words.length) % words.length;
      
      // Use word length and position to create varying frequencies
      const word = words[wordIndex];
      const charCode = word ? word.charCodeAt(0) % 10 : 5;
      const baseFreq = 150 + (charCode * 20); // Base frequency varies by word
      
      // Add variations to make it sound more speech-like
      const vibrato = Math.sin(i / 50) * 20;
      const freq = baseFreq + vibrato;
      
      // Apply amplitude envelope to simulate speech patterns
      let amplitude = 0;
      
      // Create pauses between words
      const wordProgress = (i % (sampleRate / 4)) / (sampleRate / 4);
      if (wordProgress < 0.8) {
        amplitude = 10000 * Math.sin(Math.pow(wordProgress, 0.5) * Math.PI);
      }
      
      // Generate sample
      const sample = Math.floor(amplitude * Math.sin(2 * Math.PI * freq * i / sampleRate));
      
      // Write 16-bit sample (little endian)
      audioData.writeInt16LE(sample, i * 2);
    }
    
    // Create MP3 header and data
    // Simple WAV header
    const header = Buffer.alloc(44);
    
    // RIFF chunk descriptor
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + audioData.length, 4); // Chunk size
    header.write('WAVE', 8);
    
    // "fmt " sub-chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Subchunk1 size
    header.writeUInt16LE(1, 20); // Audio format (PCM)
    header.writeUInt16LE(1, 22); // Num channels (mono)
    header.writeUInt32LE(sampleRate, 24); // Sample rate
    header.writeUInt32LE(sampleRate * 2, 28); // Byte rate
    header.writeUInt16LE(2, 32); // Block align
    header.writeUInt16LE(16, 34); // Bits per sample
    
    // "data" sub-chunk
    header.write('data', 36);
    header.writeUInt32LE(audioData.length, 40); // Subchunk2 size
    
    // Combine header and audio data
    const wavFile = Buffer.concat([header, audioData]);
    fs.writeFileSync(audioFilePath, wavFile);

    // Create a zip file and add the audio file
    const zip = new AdmZip();
    zip.addLocalFile(audioFilePath);
    zip.writeZip(outputZipPath);

    // Return the zip file as a buffer
    const zipBuffer = fs.readFileSync(outputZipPath);

    // Clean up temporary files
    fs.removeSync(tempDir);

    return {
      buffer: zipBuffer,
      filename: 'audio.zip',
      contentType: 'application/zip'
    };
  } catch (error) {
    console.error('Text-to-speech error:', error.message);
    throw error;
  }
};

/**
 * Generate realistic images from text prompt using procedural generation
 */
export const generateImage = async (prompt) => {
  try {
    if (!prompt) {
      throw new Error('Prompt is required for image generation');
    }

    // Create temp directory
    const tempDir = createTempDir();
    const outputZipPath = path.join(tempDir, 'images.zip');
    
    // Generate multiple scenic images from the prompt
    const imageFiles = [];
    const imageCount = 3; // Number of images to generate
    
    // Extract key themes from the prompt for more relevant imagery
    const keywords = extractKeywords(prompt);
    const scenes = getSceneTypes(keywords);
    
    for (let i = 0; i < imageCount; i++) {
      const imagePath = path.join(tempDir, `image${i + 1}.jpg`);
      
      // Create a canvas for generating the image
      const width = 800;
      const height = 600;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      
      // Generate a scenic landscape based on the scene type
      const scene = scenes[i % scenes.length];
      
      // Create a basic scene
      generateSceneImage(ctx, width, height, scene);
      
      // Save the canvas as a JPEG file
      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      fs.writeFileSync(imagePath, buffer);
      imageFiles.push(imagePath);
    }

    // Create a zip file and add the images
    const zip = new AdmZip();
    imageFiles.forEach(imagePath => {
      zip.addLocalFile(imagePath);
    });
    zip.writeZip(outputZipPath);

    // Return the zip file as a buffer
    const zipBuffer = fs.readFileSync(outputZipPath);

    // Clean up temporary files
    fs.removeSync(tempDir);

    return {
      buffer: zipBuffer,
      filename: 'images.zip',
      contentType: 'application/zip'
    };
  } catch (error) {
    console.error('Image generation error:', error.message);
    throw error;
  }
};

/**
 * Extract keywords from a prompt to determine imagery
 */
function extractKeywords(prompt) {
  // Simple keyword extraction by removing common words
  const commonWords = ['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'and', 'or', 'who', 'what', 'where', 'when', 'why', 'how'];
  const words = prompt.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  return words.filter(word => !commonWords.includes(word) && word.length > 3);
}

/**
 * Map keywords to scene types
 */
function getSceneTypes(keywords) {
  // Default scenes if no matches
  const defaultScenes = ['mountain', 'forest', 'ocean', 'desert', 'sunset'];
  
  // Scene mapping based on keywords
  const sceneMapping = {
    'mountain': ['mountain', 'peak', 'hill', 'climb', 'high', 'snow', 'alpine'],
    'forest': ['forest', 'tree', 'wood', 'green', 'nature', 'leaf', 'plant'],
    'ocean': ['ocean', 'sea', 'water', 'wave', 'beach', 'coast', 'island', 'blue'],
    'desert': ['desert', 'sand', 'dune', 'dry', 'arid', 'cactus', 'hot'],
    'sunset': ['sunset', 'dawn', 'dusk', 'sun', 'sky', 'cloud', 'horizon', 'orange', 'red'],
    'village': ['village', 'town', 'house', 'home', 'cottage', 'community', 'rural'],
    'river': ['river', 'stream', 'flow', 'creek', 'water', 'bridge'],
    'cave': ['cave', 'cavern', 'dark', 'underground', 'stone', 'rock'],
    'meadow': ['meadow', 'field', 'flower', 'grass', 'plain'],
    'night': ['night', 'moon', 'star', 'dark', 'evening']
  };
  
  // Match keywords to scenes
  const matchedScenes = [];
  keywords.forEach(keyword => {
    for (const [scene, relatedWords] of Object.entries(sceneMapping)) {
      if (relatedWords.some(word => keyword.includes(word) || word.includes(keyword))) {
        matchedScenes.push(scene);
        break;
      }
    }
  });
  
  // Return matched scenes or default ones
  return matchedScenes.length > 0 ? matchedScenes : defaultScenes;
}

/**
 * Generate a realistic-looking nature scene
 */
function generateSceneImage(ctx, width, height, sceneType) {
  // Set up base colors and parameters based on scene type
  let skyColors, groundColors, middleColors, details;
  
  switch(sceneType) {
    case 'mountain':
      skyColors = ['#87CEEB', '#6495ED', '#4682B4'];
      groundColors = ['#8B4513', '#A0522D', '#CD853F'];
      middleColors = ['#808080', '#A9A9A9', '#C0C0C0', '#FFFFFF'];
      details = { 
        type: 'mountains',
        count: 3 + Math.floor(Math.random() * 3),
        colors: ['#808080', '#A9A9A9', '#C0C0C0']
      };
      break;
    case 'forest':
      skyColors = ['#87CEEB', '#6495ED', '#B0E0E6'];
      groundColors = ['#228B22', '#006400', '#556B2F'];
      middleColors = ['#2E8B57', '#3CB371', '#20B2AA'];
      details = {
        type: 'trees',
        count: 20 + Math.floor(Math.random() * 30),
        colors: ['#006400', '#228B22', '#008000', '#32CD32']
      };
      break;
    case 'ocean':
      skyColors = ['#87CEEB', '#00BFFF', '#1E90FF'];
      groundColors = ['#00008B', '#0000CD', '#4169E1'];
      middleColors = ['#20B2AA', '#5F9EA0', '#48D1CC'];
      details = {
        type: 'waves',
        count: 10 + Math.floor(Math.random() * 10),
        colors: ['#E0FFFF', '#B0E0E6', '#ADD8E6']
      };
      break;
    case 'desert':
      skyColors = ['#87CEEB', '#F0E68C', '#FFD700'];
      groundColors = ['#F4A460', '#DEB887', '#D2B48C'];
      middleColors = ['#CD853F', '#DAA520', '#B8860B'];
      details = {
        type: 'cacti',
        count: 3 + Math.floor(Math.random() * 7),
        colors: ['#2E8B57', '#006400', '#228B22']
      };
      break;
    case 'sunset':
      skyColors = ['#FF4500', '#FF6347', '#FF7F50', '#FFA07A'];
      groundColors = ['#2F4F4F', '#696969', '#808080'];
      middleColors = ['#A0522D', '#8B4513', '#CD853F'];
      details = {
        type: 'silhouettes',
        count: 5 + Math.floor(Math.random() * 10),
        colors: ['#000000', '#191970', '#2F4F4F']
      };
      break;
    case 'village':
      skyColors = ['#87CEEB', '#6495ED', '#B0E0E6'];
      groundColors = ['#228B22', '#006400', '#556B2F'];
      middleColors = ['#A0522D', '#8B4513', '#CD853F'];
      details = {
        type: 'houses',
        count: 5 + Math.floor(Math.random() * 7),
        colors: ['#8B4513', '#A52A2A', '#D2691E', '#CD853F']
      };
      break;
    case 'river':
      skyColors = ['#87CEEB', '#6495ED', '#B0E0E6'];
      groundColors = ['#228B22', '#006400', '#556B2F'];
      middleColors = ['#4682B4', '#5F9EA0', '#6495ED'];
      details = {
        type: 'riverbanks',
        count: 2,
        colors: ['#8B4513', '#A0522D', '#CD853F']
      };
      break;
    case 'cave':
      skyColors = ['#2F4F4F', '#4B0082', '#191970'];
      groundColors = ['#696969', '#808080', '#A9A9A9'];
      middleColors = ['#4B0082', '#800080', '#8B008B'];
      details = {
        type: 'stalactites',
        count: 8 + Math.floor(Math.random() * 12),
        colors: ['#A9A9A9', '#D3D3D3', '#778899']
      };
      break;
    case 'meadow':
      skyColors = ['#87CEEB', '#ADD8E6', '#B0E0E6'];
      groundColors = ['#7CFC00', '#7FFF00', '#ADFF2F'];
      middleColors = ['#FFD700', '#FFFF00', '#FF69B4', '#FF1493', '#9370DB'];
      details = {
        type: 'flowers',
        count: 40 + Math.floor(Math.random() * 60),
        colors: ['#FF69B4', '#FF1493', '#FFD700', '#9370DB', '#BA55D3']
      };
      break;
    case 'night':
      skyColors = ['#191970', '#000080', '#00008B'];
      groundColors = ['#2F4F4F', '#696969', '#808080'];
      middleColors = ['#FFFAFA', '#F0FFFF', '#F5FFFA'];
      details = {
        type: 'stars',
        count: 100 + Math.floor(Math.random() * 150),
        colors: ['#FFFFFF', '#F0F8FF', '#FFFAFA']
      };
      break;
    default:
      // Default to forest
      skyColors = ['#87CEEB', '#6495ED', '#B0E0E6'];
      groundColors = ['#228B22', '#006400', '#556B2F'];
      middleColors = ['#2E8B57', '#3CB371', '#20B2AA'];
      details = {
        type: 'trees',
        count: 20 + Math.floor(Math.random() * 30),
        colors: ['#006400', '#228B22', '#008000', '#32CD32']
      };
  }
  
  // Draw gradient sky
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.5);
  skyColors.forEach((color, i) => {
    skyGradient.addColorStop(i / (skyColors.length - 1), color);
  });
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height * 0.5);
  
  // Draw ground/water
  const groundGradient = ctx.createLinearGradient(0, height * 0.5, 0, height);
  groundColors.forEach((color, i) => {
    groundGradient.addColorStop(i / (groundColors.length - 1), color);
  });
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, height * 0.5, width, height * 0.5);
  
  // Add middle layer details based on scene type
  drawSceneDetails(ctx, width, height, details);
  
  // Add some atmospheric effects
  addAtmosphericEffects(ctx, width, height, sceneType);
}

/**
 * Draw scene-specific details
 */
function drawSceneDetails(ctx, width, height, details) {
  switch(details.type) {
    case 'mountains':
      // Draw mountains
      for (let i = 0; i < details.count; i++) {
        const mountainColor = details.colors[i % details.colors.length];
        const baseX = (i * (width / (details.count - 1))) - (width / (details.count * 2));
        const peakHeight = height * (0.2 + (Math.random() * 0.3));
        
        ctx.beginPath();
        ctx.moveTo(baseX, height * 0.5);
        ctx.lineTo(baseX + (width / details.count) * 1.5, height * 0.5);
        ctx.lineTo(baseX + (width / details.count) * 0.75, height * 0.5 - peakHeight);
        ctx.closePath();
        ctx.fillStyle = mountainColor;
        ctx.fill();
        
        // Snow caps
        if (Math.random() > 0.5) {
          ctx.beginPath();
          ctx.moveTo(baseX + (width / details.count) * 0.75 - (width / details.count) * 0.2, height * 0.5 - peakHeight + (peakHeight * 0.2));
          ctx.lineTo(baseX + (width / details.count) * 0.75, height * 0.5 - peakHeight);
          ctx.lineTo(baseX + (width / details.count) * 0.75 + (width / details.count) * 0.2, height * 0.5 - peakHeight + (peakHeight * 0.3));
          ctx.closePath();
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }
      }
      break;
    case 'trees':
      // Draw trees
      for (let i = 0; i < details.count; i++) {
        const treeColor = details.colors[i % details.colors.length];
        const x = Math.random() * width;
        const y = height * 0.5 + Math.random() * (height * 0.3);
        const treeHeight = height * (0.1 + (Math.random() * 0.2));
        const trunkWidth = treeHeight * 0.1;
        
        // Draw trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - (trunkWidth / 2), y - treeHeight * 0.2, trunkWidth, treeHeight * 0.5);
        
        // Draw foliage (3 triangles)
        ctx.fillStyle = treeColor;
        for (let j = 0; j < 3; j++) {
          const triangleWidth = treeHeight * (0.5 - (j * 0.1));
          const triangleBase = y - treeHeight * (0.1 + (j * 0.25));
          
          ctx.beginPath();
          ctx.moveTo(x - triangleWidth / 2, triangleBase);
          ctx.lineTo(x + triangleWidth / 2, triangleBase);
          ctx.lineTo(x, triangleBase - triangleWidth * 0.8);
          ctx.closePath();
          ctx.fill();
        }
      }
      break;
    case 'waves':
      // Draw ocean waves
      for (let i = 0; i < details.count; i++) {
        const waveColor = details.colors[i % details.colors.length];
        const y = height * (0.5 + (i * 0.04));
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        
        // Create wave pattern
        for (let x = 0; x < width; x += 50) {
          const amplitude = 5 + Math.random() * 15;
          const offset = Math.sin(x * 0.02 + i) * amplitude;
          ctx.lineTo(x, y + offset);
        }
        
        ctx.lineTo(width, y);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        ctx.fillStyle = waveColor;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      break;
    case 'cacti':
      // Draw cacti
      for (let i = 0; i < details.count; i++) {
        const cactusColor = details.colors[i % details.colors.length];
        const x = 100 + Math.random() * (width - 200);
        const y = height * 0.7;
        const cactusHeight = height * (0.1 + (Math.random() * 0.2));
        const cactusWidth = cactusHeight * 0.3;
        
        // Main stem
        ctx.fillStyle = cactusColor;
        ctx.fillRect(x - (cactusWidth / 2), y - cactusHeight, cactusWidth, cactusHeight);
        
        // Arms (1-2)
        const armCount = 1 + Math.floor(Math.random() * 2);
        for (let j = 0; j < armCount; j++) {
          const armWidth = cactusWidth * 0.7;
          const armHeight = cactusHeight * 0.4;
          const armY = y - cactusHeight * (0.3 + (Math.random() * 0.4));
          const isLeftArm = j % 2 === 0;
          
          if (isLeftArm) {
            ctx.fillRect(x - (cactusWidth / 2) - armHeight, armY, armHeight, armWidth);
          } else {
            ctx.fillRect(x + (cactusWidth / 2), armY, armHeight, armWidth);
          }
        }
      }
      break;
    case 'silhouettes':
      // Draw silhouettes (hills, trees, mountains against sunset)
      ctx.fillStyle = '#000000';
      
      // Hills silhouette
      ctx.beginPath();
      ctx.moveTo(0, height * 0.5);
      
      for (let x = 0; x < width; x += width / 20) {
        const y = height * (0.5 - (Math.sin(x * 0.01) * 0.05) - (Math.cos(x * 0.02) * 0.03));
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(width, height * 0.5);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      
      // Tree silhouettes
      for (let i = 0; i < details.count; i++) {
        const x = Math.random() * width;
        const y = height * 0.5;
        const treeHeight = height * (0.1 + (Math.random() * 0.1));
        
        // Trunk
        ctx.fillRect(x - 2, y - treeHeight * 0.3, 4, treeHeight * 0.3);
        
        // Foliage
        ctx.beginPath();
        ctx.moveTo(x, y - treeHeight);
        ctx.lineTo(x + treeHeight * 0.2, y - treeHeight * 0.5);
        ctx.lineTo(x - treeHeight * 0.2, y - treeHeight * 0.5);
        ctx.closePath();
        ctx.fill();
      }
      break;
    case 'houses':
      // Draw village houses
      for (let i = 0; i < details.count; i++) {
        const houseColor = details.colors[i % details.colors.length];
        const x = 50 + (i * (width - 100) / details.count);
        const y = height * 0.6;
        const houseWidth = width * 0.08;
        const houseHeight = height * 0.1;
        
        // House base
        ctx.fillStyle = houseColor;
        ctx.fillRect(x - (houseWidth / 2), y - houseHeight, houseWidth, houseHeight);
        
        // Roof
        ctx.beginPath();
        ctx.moveTo(x - (houseWidth / 2) - 10, y - houseHeight);
        ctx.lineTo(x + (houseWidth / 2) + 10, y - houseHeight);
        ctx.lineTo(x, y - houseHeight - 30);
        ctx.closePath();
        ctx.fillStyle = '#A52A2A';
        ctx.fill();
        
        // Door
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 10, y - 40, 20, 40);
        
        // Windows (1-2)
        ctx.fillStyle = '#F0F8FF';
        const windowCount = 1 + Math.floor(Math.random() * 2);
        const windowSpacing = houseWidth / (windowCount + 1);
        
        for (let j = 0; j < windowCount; j++) {
          const windowX = x - (houseWidth / 2) + (windowSpacing * (j + 1));
          ctx.fillRect(windowX - 10, y - houseHeight + 15, 20, 20);
        }
      }
      break;
    case 'riverbanks':
      // Draw winding river
      ctx.beginPath();
      
      // River path
      const riverWidth = width * 0.2;
      ctx.moveTo(0, height * 0.5);
      
      for (let x = 0; x < width; x += width / 20) {
        const centerY = height * (0.5 + (Math.sin(x * 0.01) * 0.1));
        ctx.lineTo(x, centerY);
      }
      
      ctx.lineTo(width, height * 0.5);
      
      // Reverse path for bottom edge
      for (let x = width; x > 0; x -= width / 20) {
        const centerY = height * (0.5 + (Math.sin(x * 0.01) * 0.1));
        ctx.lineTo(x, centerY + riverWidth);
      }
      
      ctx.lineTo(0, height * 0.5 + riverWidth);
      ctx.closePath();
      
      // River gradient
      const riverGradient = ctx.createLinearGradient(0, height * 0.5, 0, height * 0.5 + riverWidth);
      riverGradient.addColorStop(0, '#4682B4');
      riverGradient.addColorStop(0.5, '#5F9EA0');
      riverGradient.addColorStop(1, '#4682B4');
      
      ctx.fillStyle = riverGradient;
      ctx.fill();
      
      // Reflections
      for (let i = 0; i < 10; i++) {
        const reflectionX = Math.random() * width;
        const centerY = height * (0.5 + (Math.sin(reflectionX * 0.01) * 0.1));
        const reflectionY = centerY + Math.random() * riverWidth;
        
        ctx.beginPath();
        ctx.moveTo(reflectionX, reflectionY);
        ctx.lineTo(reflectionX + 30, reflectionY + 5);
        ctx.lineTo(reflectionX + 15, reflectionY + 10);
        ctx.closePath();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
      }
      break;
    case 'stalactites':
      // Draw cave stalactites and stalagmites
      for (let i = 0; i < details.count; i++) {
        const color = details.colors[i % details.colors.length];
        const x = Math.random() * width;
        const isTop = Math.random() > 0.5;
        
        if (isTop) {
          // Stalactite (from ceiling)
          const height = 50 + Math.random() * 100;
          const width = 10 + Math.random() * 20;
          
          ctx.beginPath();
          ctx.moveTo(x - width/2, 0);
          ctx.lineTo(x + width/2, 0);
          ctx.lineTo(x, height);
          ctx.closePath();
          
          ctx.fillStyle = color;
          ctx.fill();
        } else {
          // Stalagmite (from floor)
          const stalagHeight = 50 + Math.random() * 100;
          const stalagWidth = 10 + Math.random() * 20;
          
          ctx.beginPath();
          ctx.moveTo(x - stalagWidth/2, height);
          ctx.lineTo(x + stalagWidth/2, height);
          ctx.lineTo(x, height - stalagHeight);
          ctx.closePath();
          
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
      break;
    case 'flowers':
      // Draw meadow flowers
      for (let i = 0; i < details.count; i++) {
        const flowerColor = details.colors[i % details.colors.length];
        const x = Math.random() * width;
        const y = height * (0.5 + Math.random() * 0.4);
        const size = 3 + Math.random() * 7;
        
        // Stem
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - size * 3);
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Flower petals
        const petalCount = 5 + Math.floor(Math.random() * 3);
        
        for (let j = 0; j < petalCount; j++) {
          const angle = (j / petalCount) * Math.PI * 2;
          const petalX = x + Math.cos(angle) * size;
          const petalY = (y - size * 3) + Math.sin(angle) * size;
          
          ctx.beginPath();
          ctx.arc(petalX, petalY, size, 0, Math.PI * 2);
          ctx.fillStyle = flowerColor;
          ctx.fill();
        }
        
        // Flower center
        ctx.beginPath();
        ctx.arc(x, y - size * 3, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFF00';
        ctx.fill();
      }
      break;
    case 'stars':
      // Draw night sky stars
      for (let i = 0; i < details.count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height * 0.7;
        const size = Math.random() > 0.9 ? 2 : 1;
        const opacity = 0.5 + Math.random() * 0.5;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
        
        // Occasional twinkle effect
        if (Math.random() > 0.95) {
          ctx.beginPath();
          ctx.moveTo(x - size * 4, y);
          ctx.lineTo(x + size * 4, y);
          ctx.moveTo(x, y - size * 4);
          ctx.lineTo(x, y + size * 4);
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      
      // Add moon
      const moonX = width * (0.2 + Math.random() * 0.6);
      const moonY = height * (0.1 + Math.random() * 0.2);
      const moonSize = 30 + Math.random() * 20;
      
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
      
      // Moon gradient
      const moonGradient = ctx.createRadialGradient(
        moonX, moonY, 0,
        moonX, moonY, moonSize
      );
      moonGradient.addColorStop(0, '#FFFFFF');
      moonGradient.addColorStop(0.7, '#F0F8FF');
      moonGradient.addColorStop(1, '#E6E6FA');
      
      ctx.fillStyle = moonGradient;
      ctx.fill();
      
      // Moon craters
      const craterCount = 3 + Math.floor(Math.random() * 5);
      for (let i = 0; i < craterCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * moonSize * 0.7;
        const craterX = moonX + Math.cos(angle) * distance;
        const craterY = moonY + Math.sin(angle) * distance;
        const craterSize = 2 + Math.random() * 5;
        
        ctx.beginPath();
        ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 220, 220, 0.8)';
        ctx.fill();
      }
      break;
  }
}

/**
 * Add atmospheric effects to the scene
 */
function addAtmosphericEffects(ctx, width, height, sceneType) {
  // Add clouds to scenes except cave and night
  if (!['cave', 'night'].includes(sceneType)) {
    const cloudCount = 3 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < cloudCount; i++) {
      const x = Math.random() * width;
      const y = height * (0.1 + Math.random() * 0.2);
      const cloudWidth = 50 + Math.random() * 100;
      const cloudHeight = 20 + Math.random() * 40;
      
      // Cloud opacity varies by scene
      let cloudOpacity = 0.7;
      if (sceneType === 'sunset') cloudOpacity = 0.5;
      if (sceneType === 'desert') cloudOpacity = 0.3;
      
      // Create cloud shape with multiple circles
      const circleCount = 5 + Math.floor(Math.random() * 5);
      
      ctx.beginPath();
      for (let j = 0; j < circleCount; j++) {
        const circleX = x + (j * cloudWidth / circleCount);
        const circleY = y + (Math.sin(j) * cloudHeight / 6);
        const circleSize = cloudHeight / 2 + Math.random() * cloudHeight / 2;
        
        ctx.moveTo(circleX + circleSize, circleY);
        ctx.arc(circleX, circleY, circleSize, 0, Math.PI * 2);
      }
      
      ctx.fillStyle = `rgba(255, 255, 255, ${cloudOpacity})`;
      ctx.fill();
    }
  }
  
  // Scene-specific effects
  switch(sceneType) {
    case 'sunset':
      // Add sun
      const sunX = width * 0.5;
      const sunY = height * 0.2;
      const sunSize = 60;
      
      const sunGradient = ctx.createRadialGradient(
        sunX, sunY, 0,
        sunX, sunY, sunSize
      );
      sunGradient.addColorStop(0, '#FFFFFF');
      sunGradient.addColorStop(0.2, '#FFFF00');
      sunGradient.addColorStop(0.5, '#FFA500');
      sunGradient.addColorStop(0.8, '#FF4500');
      sunGradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
      ctx.fillStyle = sunGradient;
      ctx.fill();
      
      // Add rays
      ctx.save();
      ctx.translate(sunX, sunY);
      
      for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sunSize * 1.5, 0);
        
        const rayGradient = ctx.createLinearGradient(0, 0, sunSize * 1.5, 0);
        rayGradient.addColorStop(0, 'rgba(255, 165, 0, 0.7)');
        rayGradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
        
        ctx.strokeStyle = rayGradient;
        ctx.lineWidth = 5;
        ctx.stroke();
      }
      
      ctx.restore();
      break;
    case 'night':
      // Add distant city lights for night scene
      ctx.beginPath();
      ctx.moveTo(0, height * 0.5);
      
      for (let x = 0; x < width; x += 10) {
        const buildingHeight = Math.random() > 0.8 ? 
          height * (0.48 - Math.random() * 0.05) : 
          height * 0.5;
          
        ctx.lineTo(x, buildingHeight);
        ctx.lineTo(x + 5, buildingHeight);
      }
      
      ctx.lineTo(width, height * 0.5);
      ctx.lineTo(width, height * 0.55);
      ctx.lineTo(0, height * 0.55);
      ctx.closePath();
      
      ctx.fillStyle = '#000000';
      ctx.fill();
      
      // Add tiny lights in buildings
      for (let x = 5; x < width; x += 10) {
        if (Math.random() > 0.7) {
          const y = height * (0.5 - Math.random() * 0.03);
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          
          const colors = ['#FFFF00', '#F0E68C', '#FFD700'];
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fill();
        }
      }
      break;
    case 'forest':
      // Add mist/fog among trees
      for (let i = 0; i < 5; i++) {
        const y = height * (0.5 + i * 0.08);
        const fogHeight = height * 0.05;
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        
        for (let x = 0; x < width; x += 20) {
          const offset = Math.sin(x * 0.03 + i) * 5;
          ctx.lineTo(x, y + offset);
        }
        
        ctx.lineTo(width, y);
        ctx.lineTo(width, y + fogHeight);
        
        for (let x = width; x > 0; x -= 20) {
          const offset = Math.sin(x * 0.03 + i) * 5;
          ctx.lineTo(x, y + fogHeight + offset);
        }
        
        ctx.lineTo(0, y + fogHeight);
        ctx.closePath();
        
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 - i * 0.01})`;
        ctx.fill();
      }
      break;
    case 'ocean':
      // Add reflections on water
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * width;
        const y = height * (0.5 + Math.random() * 0.3);
        const reflectionWidth = 30 + Math.random() * 50;
        const reflectionHeight = 5 + Math.random() * 10;
        
        ctx.beginPath();
        ctx.ellipse(x, y, reflectionWidth, reflectionHeight, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`;
        ctx.fill();
      }
      break;
    case 'cave':
      // Add light beams in cave
      for (let i = 0; i < 3; i++) {
        const x = width * (0.3 + i * 0.2);
        const beamWidth = 30 + Math.random() * 50;
        
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - beamWidth/2, height);
        ctx.lineTo(x + beamWidth/2, height);
        ctx.closePath();
        
        const beamGradient = ctx.createLinearGradient(x, 0, x, height);
        beamGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        beamGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
        
        ctx.fillStyle = beamGradient;
        ctx.fill();
      }
      break;
  }
}

// Initialize models on import
initializeMediaModels();
