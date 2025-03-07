
import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';
import { pipeline } from '@huggingface/transformers';

// Cache for loaded models to prevent reloading
let textToImageModel = null;

/**
 * Generates images based on a text prompt
 * @param {string} prompt - The text description to generate images from
 * @param {number} numImages - Number of images to generate (default: 4)
 * @returns {Promise<string>} - Path to the zip file containing generated images
 */
export const generateImagesFromText = async (prompt, numImages = 4) => {
  try {
    console.log(`Generating ${numImages} images for prompt: "${prompt}"`);
    
    // Create a unique ID for this generation request
    const requestId = uuidv4();
    const tempDir = path.join(process.env.TEMP_DIR || '/tmp', requestId);
    const zipPath = path.join(process.env.TEMP_DIR || '/tmp', `${requestId}.zip`);
    
    // Create temp directory for storing images
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Load model if not already loaded
    if (!textToImageModel) {
      console.log('Loading text-to-image model...');
      textToImageModel = await pipeline(
        'text-to-image',
        'ZB-Tech/Text-to-Image', // Using the specified model
        { device: 'webgpu' } // Use GPU if available
      );
      console.log('Model loaded successfully');
    }
    
    // Generate multiple images concurrently
    const generationPromises = Array(numImages).fill().map(async (_, index) => {
      try {
        console.log(`Generating image ${index + 1}/${numImages}...`);
        
        // Generate image from text
        const image = await textToImageModel(prompt, {
          num_inference_steps: 30,
          guidance_scale: 7.5,
          negative_prompt: "blurry, bad quality, distorted, low resolution",
        });
        
        // Convert image tensor to buffer if needed
        let imageBuffer;
        if (image instanceof tf.Tensor) {
          // If the result is a tensor, convert to appropriate format
          const imageData = await tf.node.encodePng(image);
          imageBuffer = Buffer.from(imageData);
        } else if (Buffer.isBuffer(image)) {
          // If already a buffer, use directly
          imageBuffer = image;
        } else if (image && image.data) {
          // If it has a data property (common in transformers.js output)
          imageBuffer = Buffer.from(image.data);
        } else {
          // If it's a Blob or has toBuffer method
          imageBuffer = await image.toBuffer ? await image.toBuffer() : Buffer.from(await image.arrayBuffer());
        }
        
        // Save the image to the temp directory
        const imagePath = path.join(tempDir, `image_${index + 1}.png`);
        fs.writeFileSync(imagePath, imageBuffer);
        console.log(`Image ${index + 1} saved to ${imagePath}`);
        
        return imagePath;
      } catch (error) {
        console.error(`Error generating image ${index + 1}:`, error);
        throw error;
      }
    });
    
    // Wait for all images to be generated
    const imagePaths = await Promise.all(generationPromises);
    
    // Create a zip file containing all generated images
    const zip = new AdmZip();
    imagePaths.forEach((imagePath, index) => {
      zip.addLocalFile(imagePath, '', `image_${index + 1}.png`);
    });
    
    // Write the zip file
    zip.writeZip(zipPath);
    console.log(`Zip file created at ${zipPath}`);
    
    // Clean up the temp directory with individual images
    imagePaths.forEach(imagePath => {
      fs.unlinkSync(imagePath);
    });
    fs.rmdirSync(tempDir);
    
    return zipPath;
  } catch (error) {
    console.error('Error in generateImagesFromText:', error);
    throw new Error(`Failed to generate images: ${error.message}`);
  }
};

// For memory management and handling high load
export const clearModelCache = () => {
  if (textToImageModel) {
    console.log('Clearing text-to-image model from cache');
    textToImageModel = null;
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }
};

// Setup auto-cleaning for the model cache at intervals to prevent memory leaks
const CACHE_CLEANUP_INTERVAL = 3600000; // 1 hour
setInterval(() => {
  clearModelCache();
}, CACHE_CLEANUP_INTERVAL);
