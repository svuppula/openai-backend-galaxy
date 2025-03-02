import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createCanvas } from 'canvas';
import AdmZip from 'adm-zip';

// Helper function to create a directory if it doesn't exist
const ensureDirectoryExists = async (directory) => {
  try {
    await fs.ensureDir(directory);
  } catch (error) {
    console.error(`Error creating directory ${directory}:`, error);
    throw new Error(`Could not create directory: ${error.message}`);
  }
};

// Function to create a unique temporary directory
export const createTempDirectory = async () => {
  const tempDir = path.join(process.cwd(), 'temp', uuidv4());
  await ensureDirectoryExists(tempDir);
  return tempDir;
};

// Function to clean up a temporary directory
export const cleanupTempDirectory = async (directory) => {
  try {
    await fs.remove(directory);
  } catch (error) {
    console.error(`Error removing directory ${directory}:`, error);
  }
};

// Function to create video content
export const generateVideo = async (prompt) => {
  try {
    // Create a unique temporary directory
    const tempDir = await createTempDirectory();
    const videoFile = path.join(tempDir, 'video.mp4');
    
    // Generate a simple video file (mock implementation)
    // In a real implementation, you would use a video generation library
    
    // Create a placeholder video file with some metadata
    await fs.writeFile(videoFile, Buffer.from('This is a placeholder for a video file'));
    
    // Create a zip file containing the video
    const zip = new AdmZip();
    zip.addLocalFile(videoFile);
    const zipBuffer = zip.toBuffer();
    
    // Clean up the temporary directory
    await cleanupTempDirectory(tempDir);
    
    return zipBuffer;
  } catch (error) {
    console.error('Error generating video:', error);
    throw new Error(`Failed to generate video: ${error.message}`);
  }
};

// Function to create animation content
export const generateAnimation = async (prompt) => {
  try {
    // Create a unique temporary directory
    const tempDir = await createTempDirectory();
    const animationFile = path.join(tempDir, 'animation.gif');
    
    // Generate a simple animation file (mock implementation)
    // In a real implementation, you would use an animation generation library
    
    // Create a placeholder animation file with some metadata
    await fs.writeFile(animationFile, Buffer.from('This is a placeholder for an animation file'));
    
    // Create a zip file containing the animation
    const zip = new AdmZip();
    zip.addLocalFile(animationFile);
    const zipBuffer = zip.toBuffer();
    
    // Clean up the temporary directory
    await cleanupTempDirectory(tempDir);
    
    return zipBuffer;
  } catch (error) {
    console.error('Error generating animation:', error);
    throw new Error(`Failed to generate animation: ${error.message}`);
  }
};

// Helper function to extract keywords from a prompt
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

// Export the new functions alongside the existing ones
export {
  generateVideo,
  generateAnimation
};
