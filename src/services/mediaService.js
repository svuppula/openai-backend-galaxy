
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createCanvas } from 'canvas';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a temp directory for file operations
const tempDir = path.join(process.cwd(), 'temp');

// Helper function to create a directory if it doesn't exist
const ensureDirectoryExists = async (directory) => {
  try {
    await fs.ensureDir(directory);
    return directory;
  } catch (error) {
    console.error(`Error creating directory ${directory}:`, error);
    throw new Error(`Could not create directory: ${error.message}`);
  }
};

// Function to create a unique temporary directory
const createTempDirectory = async () => {
  const uniqueDir = path.join(tempDir, uuidv4());
  return ensureDirectoryExists(uniqueDir);
};

// Function to clean up a temporary directory
const cleanupTempDirectory = async (directory) => {
  try {
    await fs.remove(directory);
  } catch (error) {
    console.error(`Error removing directory ${directory}:`, error);
  }
};

// Function to generate a waveform audio file
const generateWaveformAudio = async (text, outputPath) => {
  try {
    // Generate a simple waveform based on the text
    // This is a basic implementation - in a real app, you would use a TTS library
    
    // Calculate parameters based on the text
    const sampleRate = 44100;
    const duration = Math.min(Math.max(text.length * 0.05, 2), 30); // Duration in seconds
    const frequency = 440; // Base frequency in Hz
    
    // Generate audio data (simple sine wave with some variations)
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = Buffer.alloc(numSamples * 2); // 16-bit samples
    
    // Generate a more varied waveform based on the text
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const charPosition = Math.floor((i / numSamples) * text.length);
      const char = text[charPosition] || 'a';
      const charCode = char.charCodeAt(0);
      
      // Create variation based on character
      const freqVariation = (charCode % 20) / 10;
      const currentFreq = frequency + (charCode % 40) - 20;
      
      // Add some amplitude variation
      const amplitude = 0.5 + Math.sin(t * 0.5) * 0.3;
      
      // Combined waveform with harmonics
      const sample = Math.sin(2 * Math.PI * currentFreq * t) * 0.6 + 
                    Math.sin(2 * Math.PI * currentFreq * 2 * t) * 0.2 + 
                    Math.sin(2 * Math.PI * currentFreq * 3 * t) * 0.1;
      
      // Convert to 16-bit PCM
      const value = Math.floor(sample * amplitude * 32767);
      buffer.writeInt16LE(value, i * 2);
    }
    
    // Write WAV header
    const headerBuffer = Buffer.alloc(44);
    
    // "RIFF" chunk descriptor
    headerBuffer.write('RIFF', 0);
    headerBuffer.writeUInt32LE(36 + buffer.length, 4); // Chunk size
    headerBuffer.write('WAVE', 8);
    
    // "fmt " sub-chunk
    headerBuffer.write('fmt ', 12);
    headerBuffer.writeUInt32LE(16, 16); // Subchunk1 size
    headerBuffer.writeUInt16LE(1, 20); // PCM format
    headerBuffer.writeUInt16LE(1, 22); // Mono channel
    headerBuffer.writeUInt32LE(sampleRate, 24); // Sample rate
    headerBuffer.writeUInt32LE(sampleRate * 2, 28); // Byte rate
    headerBuffer.writeUInt16LE(2, 32); // Block align
    headerBuffer.writeUInt16LE(16, 34); // Bits per sample
    
    // "data" sub-chunk
    headerBuffer.write('data', 36);
    headerBuffer.writeUInt32LE(buffer.length, 40); // Subchunk2 size
    
    // Write the complete WAV file
    const wavBuffer = Buffer.concat([headerBuffer, buffer]);
    await fs.writeFile(outputPath, wavBuffer);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating waveform audio:', error);
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
};

// Function to generate audio from text
export const textToSpeech = async (text) => {
  if (!text) {
    throw new Error('Text is required for speech generation');
  }
  
  try {
    // Create a unique temporary directory
    const tempDir = await createTempDirectory();
    const audioFilePath = path.join(tempDir, 'speech.wav');
    
    // Generate audio file
    await generateWaveformAudio(text, audioFilePath);
    
    // Create a zip file with the audio
    const zip = new AdmZip();
    zip.addLocalFile(audioFilePath);
    const zipBuffer = zip.toBuffer();
    
    // Clean up temporary directory
    await cleanupTempDirectory(tempDir);
    
    return zipBuffer;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw new Error(`Text-to-speech failed: ${error.message}`);
  }
};

// Function to generate a procedural image based on keywords
const generateProceduralImage = async (keywords, width, height, outputPath, seed) => {
  try {
    // Create a canvas with the specified dimensions
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Use the seed for random number generation
    const random = (min, max) => {
      seed = (seed * 9301 + 49297) % 233280;
      const rnd = seed / 233280;
      return min + rnd * (max - min);
    };
    
    // Draw a gradient sky background
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    skyGradient.addColorStop(0, '#87CEEB'); // Sky blue
    skyGradient.addColorStop(1, '#E0F7FF'); // Light blue
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Determine landscape type based on keywords
    const hasForest = keywords.some(word => ['forest', 'tree', 'wood', 'jungle', 'nature'].includes(word));
    const hasMountains = keywords.some(word => ['mountain', 'hill', 'peak', 'highland', 'scenic'].includes(word));
    const hasWater = keywords.some(word => ['water', 'river', 'lake', 'ocean', 'sea', 'stream'].includes(word));
    const hasSunset = keywords.some(word => ['sunset', 'dusk', 'evening', 'night', 'dark'].includes(word));
    
    // Adjust colors based on keywords
    if (hasSunset) {
      const sunsetGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      sunsetGradient.addColorStop(0, '#FF7F50'); // Coral
      sunsetGradient.addColorStop(0.5, '#FFD700'); // Gold
      sunsetGradient.addColorStop(1, '#87CEEB'); // Sky blue
      ctx.fillStyle = sunsetGradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    // Draw mountains if needed
    if (hasMountains) {
      // Create mountain layers
      const numMountainRanges = Math.floor(random(2, 4));
      for (let range = 0; range < numMountainRanges; range++) {
        const mountainColor = hasSunset ? 
          `rgba(${Math.floor(100 - range * 20)}, ${Math.floor(80 - range * 20)}, ${Math.floor(120 - range * 20)}, 1)` : 
          `rgba(${Math.floor(100 - range * 20)}, ${Math.floor(120 - range * 20)}, ${Math.floor(100 - range * 20)}, 1)`;
        
        // Draw mountain range
        ctx.fillStyle = mountainColor;
        ctx.beginPath();
        ctx.moveTo(0, height * (0.5 + range * 0.1));
        
        // Create jagged mountain peaks
        const numPeaks = Math.floor(random(5, 10));
        for (let i = 0; i <= numPeaks; i++) {
          const x = width * (i / numPeaks);
          const y = height * (0.5 + range * 0.1) - random(50, 150) * (1 - range * 0.3);
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height * (0.5 + range * 0.1));
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
      }
    }
    
    // Draw water if needed
    if (hasWater) {
      const waterHeight = height * 0.3;
      const waterY = height * 0.7;
      
      // Create water gradient
      const waterGradient = ctx.createLinearGradient(0, waterY, 0, height);
      waterGradient.addColorStop(0, hasSunset ? '#FFD700' : '#4682B4'); // Color based on time of day
      waterGradient.addColorStop(1, hasSunset ? '#4169E1' : '#191970');
      
      ctx.fillStyle = waterGradient;
      ctx.fillRect(0, waterY, width, waterHeight);
      
      // Add some water ripples
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 10; i++) {
        const y = waterY + random(10, waterHeight - 10);
        ctx.beginPath();
        ctx.moveTo(0, y);
        
        for (let x = 0; x < width; x += 20) {
          ctx.lineTo(x, y + random(-2, 2));
        }
        
        ctx.stroke();
      }
    }
    
    // Draw forest if needed
    if (hasForest) {
      const forestStartY = hasMountains ? height * 0.6 : height * 0.7;
      const forestHeight = hasWater ? height * 0.4 : height * 0.3;
      
      // Draw ground
      const groundGradient = ctx.createLinearGradient(0, forestStartY, 0, height);
      groundGradient.addColorStop(0, '#228B22'); // Forest green
      groundGradient.addColorStop(1, '#006400'); // Dark green
      
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, forestStartY, width, forestHeight);
      
      // Draw trees
      const numTrees = Math.floor(random(30, 50));
      
      for (let i = 0; i < numTrees; i++) {
        const x = random(0, width);
        const treeHeight = random(20, 60);
        const y = random(forestStartY, forestStartY + forestHeight - treeHeight);
        
        // Tree trunk
        ctx.fillStyle = '#8B4513'; // Saddle brown
        ctx.fillRect(x - 2, y, 4, treeHeight);
        
        // Tree foliage
        ctx.fillStyle = hasSunset ? '#556B2F' : '#228B22'; // Dark olive green or forest green
        ctx.beginPath();
        ctx.moveTo(x, y - treeHeight * 0.5);
        ctx.lineTo(x + treeHeight * 0.3, y);
        ctx.lineTo(x - treeHeight * 0.3, y);
        ctx.closePath();
        ctx.fill();
      }
    }
    
    // Add a sun or moon
    if (hasSunset) {
      // Draw a setting sun
      const sunRadius = random(30, 50);
      const sunX = random(width * 0.2, width * 0.8);
      const sunY = random(height * 0.1, height * 0.3);
      
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
      sunGradient.addColorStop(0, '#FFD700'); // Gold
      sunGradient.addColorStop(1, '#FF4500'); // OrangeRed
      
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw a sun
      const sunRadius = random(20, 40);
      const sunX = random(width * 0.7, width * 0.9);
      const sunY = random(height * 0.1, height * 0.2);
      
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
      sunGradient.addColorStop(0, '#FFFACD'); // Lemon chiffon
      sunGradient.addColorStop(1, '#FFD700'); // Gold
      
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Save the image
    const buffer = canvas.toBuffer('image/jpeg');
    await fs.writeFile(outputPath, buffer);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating procedural image:', error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
};

// Function to extract keywords from a prompt
const extractKeywords = (prompt) => {
  // Remove common words and extract meaningful keywords
  const words = prompt.toLowerCase().split(/\s+/);
  const stopWords = new Set(['a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'and', 'or', 'but', 'if', 'then', 'than', 'so', 'yet', 'that', 'this', 'these', 'those', 'it', 'its', 'is', 'was', 'be', 'been', 'being', 'am', 'are', 'were', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'i', 'me', 'my', 'mine', 'myself', 'you', 'your', 'yours', 'yourself', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'we', 'us', 'our', 'ours', 'ourselves', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'too', 'very', 'just', 'once', 'there', 'here', 'now', 'then', 'always', 'never']);
  
  // Filter out stop words and keep only unique meaningful words
  const keywords = [...new Set(words.filter(word => word.length > 3 && !stopWords.has(word)))];
  
  // Return 3-5 keywords or defaults if not enough are found
  const defaultKeywords = ['nature', 'landscape', 'mountains', 'forest', 'scenic'];
  return keywords.length >= 3 ? keywords.slice(0, 5) : [...keywords, ...defaultKeywords].slice(0, 5);
};

// Function to generate images from a prompt
export const generateImage = async (prompt) => {
  if (!prompt) {
    throw new Error('Prompt is required for image generation');
  }
  
  try {
    // Create a unique temporary directory
    const tempDir = await createTempDirectory();
    
    // Extract keywords from the prompt
    const keywords = extractKeywords(prompt);
    console.log('Extracted keywords:', keywords);
    
    // Generate multiple images with different seeds
    const numImages = 3;
    const imagePromises = [];
    
    for (let i = 0; i < numImages; i++) {
      const seed = Math.floor(Math.random() * 1000000);
      const imagePath = path.join(tempDir, `image_${i}.jpg`);
      imagePromises.push(generateProceduralImage(keywords, 1024, 768, imagePath, seed));
    }
    
    // Wait for all images to be generated
    await Promise.all(imagePromises);
    
    // Create a zip file with all the images
    const zip = new AdmZip();
    const files = await fs.readdir(tempDir);
    files.forEach(file => {
      if (file.endsWith('.jpg')) {
        zip.addLocalFile(path.join(tempDir, file));
      }
    });
    
    const zipBuffer = zip.toBuffer();
    
    // Clean up temporary directory
    await cleanupTempDirectory(tempDir);
    
    return zipBuffer;
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error(`Image generation failed: ${error.message}`);
  }
};

// Function to generate video content
export const generateVideo = async (prompt) => {
  if (!prompt) {
    throw new Error('Prompt is required for video generation');
  }
  
  try {
    // Create a unique temporary directory
    const tempDir = await createTempDirectory();
    
    // Extract keywords from the prompt
    const keywords = extractKeywords(prompt);
    
    // Generate multiple frames for a video
    const numFrames = 10;
    const framePromises = [];
    
    for (let i = 0; i < numFrames; i++) {
      const seed = Math.floor(Math.random() * 1000000) + i * 1000; // Different seed for each frame
      const framePath = path.join(tempDir, `frame_${i.toString().padStart(3, '0')}.jpg`);
      framePromises.push(generateProceduralImage(keywords, 640, 480, framePath, seed));
    }
    
    // Wait for all frames to be generated
    await Promise.all(framePromises);
    
    // Create a simple metadata.txt file explaining what would be in the video
    const metadataPath = path.join(tempDir, 'metadata.txt');
    const metadataContent = `
Video generated from prompt: "${prompt}"
Keywords: ${keywords.join(', ')}
Number of frames: ${numFrames}
Resolution: 640x480
Generated at: ${new Date().toISOString()}

Note: In a production environment, these frames would be combined into a video file.
This is a demonstration of the procedural video generation capabilities.
`;
    await fs.writeFile(metadataPath, metadataContent);
    
    // Create a zip file with all frames and metadata
    const zip = new AdmZip();
    const files = await fs.readdir(tempDir);
    files.forEach(file => {
      zip.addLocalFile(path.join(tempDir, file));
    });
    
    const zipBuffer = zip.toBuffer();
    
    // Clean up temporary directory
    await cleanupTempDirectory(tempDir);
    
    return zipBuffer;
  } catch (error) {
    console.error('Video generation error:', error);
    throw new Error(`Video generation failed: ${error.message}`);
  }
};

// Function to generate animation content
export const generateAnimation = async (prompt) => {
  if (!prompt) {
    throw new Error('Prompt is required for animation generation');
  }
  
  try {
    // Create a unique temporary directory
    const tempDir = await createTempDirectory();
    
    // Extract keywords from the prompt
    const keywords = extractKeywords(prompt);
    
    // Generate multiple frames for animation with smoother transitions
    const numFrames = 12; // 12 frames for a simple animation loop
    const framePromises = [];
    const baseSpeed = Math.random() * 0.02 + 0.01; // Random base speed for elements
    
    for (let i = 0; i < numFrames; i++) {
      // We'll use a consistent base seed but modify it slightly for each frame
      // to create smooth transitions between frames
      const baseSeed = Math.floor(Math.random() * 1000000);
      const frameSeed = baseSeed + i * 10; // Smaller increment for smoother transition
      const framePath = path.join(tempDir, `frame_${i.toString().padStart(3, '0')}.jpg`);
      
      // Generate procedural image for this animation frame
      const canvas = createCanvas(640, 480);
      const ctx = canvas.getContext('2d');
      
      // Custom random function with seed
      const random = (min, max) => {
        let seed = frameSeed;
        for (let j = 0; j < i; j++) {
          seed = (seed * 9301 + 49297) % 233280;
        }
        const rnd = seed / 233280;
        return min + rnd * (max - min);
      };
      
      // Common background for all frames
      const skyGradient = ctx.createLinearGradient(0, 0, 0, 480);
      skyGradient.addColorStop(0, '#87CEEB');
      skyGradient.addColorStop(1, '#E0F7FF');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, 640, 480);
      
      // Animation-specific elements - clouds that move across frames
      const numClouds = 5;
      for (let c = 0; c < numClouds; c++) {
        const cloudX = (random(0, 640) + i * baseSpeed * 640) % 640;
        const cloudY = random(50, 150);
        const cloudRadius = random(30, 60);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Draw cloud (multiple overlapping circles)
        for (let j = 0; j < 5; j++) {
          const offsetX = random(-cloudRadius/2, cloudRadius/2);
          const offsetY = random(-cloudRadius/4, cloudRadius/4);
          const circleRadius = random(cloudRadius/2, cloudRadius);
          
          ctx.beginPath();
          ctx.arc(cloudX + offsetX, cloudY + offsetY, circleRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Save frame
      const buffer = canvas.toBuffer('image/jpeg');
      await fs.writeFile(framePath, buffer);
      
      framePromises.push(framePath);
    }
    
    // Wait for all frames to be written
    await Promise.all(framePromises);
    
    // Create a simple metadata.txt file
    const metadataPath = path.join(tempDir, 'metadata.txt');
    const metadataContent = `
Animation generated from prompt: "${prompt}"
Keywords: ${keywords.join(', ')}
Number of frames: ${numFrames}
Frame rate: 12 fps
Resolution: 640x480
Generated at: ${new Date().toISOString()}

Note: In a production environment, these frames would be combined into a GIF or video animation.
This is a demonstration of the procedural animation generation capabilities.
`;
    await fs.writeFile(metadataPath, metadataContent);
    
    // Create a zip file with all frames and metadata
    const zip = new AdmZip();
    const files = await fs.readdir(tempDir);
    files.forEach(file => {
      zip.addLocalFile(path.join(tempDir, file));
    });
    
    const zipBuffer = zip.toBuffer();
    
    // Clean up temporary directory
    await cleanupTempDirectory(tempDir);
    
    return zipBuffer;
  } catch (error) {
    console.error('Animation generation error:', error);
    throw new Error(`Animation generation failed: ${error.message}`);
  }
};
