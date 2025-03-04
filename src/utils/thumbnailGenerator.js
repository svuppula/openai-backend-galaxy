
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

// ES Module compatible __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Font paths
const fontDir = path.join(__dirname, '../assets/fonts');
const fontPath = path.join(fontDir, 'Roboto-Bold.ttf');

// Ensure font directory exists
fs.ensureDirSync(fontDir);

// Download Roboto font if it doesn't exist
async function ensureFontExists() {
  if (!fs.existsSync(fontPath)) {
    console.log('Downloading Roboto-Bold.ttf font...');
    try {
      const fontUrl = 'https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Bold.ttf';
      const response = await axios.get(fontUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(fontPath, Buffer.from(response.data));
      console.log('Roboto-Bold.ttf downloaded successfully');
    } catch (error) {
      console.error('Error downloading font:', error.message);
      // Use system font as fallback
      return false;
    }
  }
  return true;
}

// Register font with canvas
async function registerFontForCanvas() {
  const fontExists = await ensureFontExists();
  if (fontExists) {
    try {
      registerFont(fontPath, { family: 'Roboto', weight: 'bold' });
      console.log('Font registered successfully');
    } catch (error) {
      console.error('Font registration failed:', error.message);
      // Continue without custom font
    }
  }
}

export async function generateThumbnails(prompt) {
  await registerFontForCanvas();
  
  // Create temp directory if it doesn't exist
  const tempDir = path.resolve(process.env.TEMP_DIR || './temp');
  fs.ensureDirSync(tempDir);
  
  const zip = new AdmZip();
  const thumbnailPath = path.join(tempDir, 'thumbnails');
  fs.ensureDirSync(thumbnailPath);
  
  // Generate multiple thumbnails with different realistic background images
  const imagePromises = [];
  
  // Use Unsplash API to get realistic images based on the prompt
  // Since we're aiming for no API keys, we'll use direct Unsplash source URLs for common themes
  const backgroundImages = [
    // Technology themed
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    // Nature themed
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
    // Urban themed
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
    // Abstract themed
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab',
    // Business themed
    'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4'
  ];
  
  // Extract keywords from prompt
  const keywords = prompt.split(' ')
    .filter(word => word.length > 3)
    .map(word => word.toLowerCase());
  
  // For thumbnails with background images
  for (let i = 0; i < backgroundImages.length; i++) {
    const imageUrl = `${backgroundImages[i]}?q=85&w=1280&h=720&fit=crop`;
    imagePromises.push(createThumbnail(
      imageUrl,
      prompt,
      path.join(thumbnailPath, `thumbnail_${i + 1}.jpg`),
      1280, 720
    ));
  }
  
  // For thumbnails with solid color backgrounds and different layouts
  const colors = ['#1E40AF', '#991B1B', '#065F46', '#6B21A8', '#B45309'];
  
  for (let i = 0; i < colors.length; i++) {
    imagePromises.push(createSolidThumbnail(
      colors[i],
      prompt,
      path.join(thumbnailPath, `thumbnail_solid_${i + 1}.jpg`),
      1280, 720
    ));
  }
  
  // Wait for all thumbnails to be created
  await Promise.all(imagePromises);
  
  // Add all generated thumbnails to the zip file
  const files = fs.readdirSync(thumbnailPath);
  files.forEach(file => {
    const filePath = path.join(thumbnailPath, file);
    zip.addLocalFile(filePath);
  });
  
  // Write the zip file
  const zipFilePath = path.join(tempDir, 'thumbnails.zip');
  zip.writeZip(zipFilePath);
  
  // Clean up individual files
  files.forEach(file => {
    fs.unlinkSync(path.join(thumbnailPath, file));
  });
  
  return zipFilePath;
}

async function createThumbnail(imageUrl, text, outputPath, width, height) {
  try {
    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Load and draw background image
    const image = await loadImage(imageUrl);
    ctx.drawImage(image, 0, 0, width, height);
    
    // Add semi-transparent overlay for better text visibility
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);
    
    // Configure text style
    ctx.font = '60px "Roboto", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    
    // Draw text with word wrapping
    const lines = getLines(ctx, text, width - 100);
    ctx.fillStyle = '#FFFFFF';
    
    lines.forEach((line, index) => {
      const y = height / 2 - ((lines.length - 1) * 70 / 2) + index * 70;
      ctx.fillText(line, width / 2, y);
    });
    
    // Save the image
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw error;
  }
}

async function createSolidThumbnail(backgroundColor, text, outputPath, width, height) {
  try {
    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Add design elements
    drawDesignElements(ctx, width, height);
    
    // Configure text style
    ctx.font = '64px "Roboto", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text with word wrapping
    const lines = getLines(ctx, text, width - 150);
    ctx.fillStyle = '#FFFFFF';
    
    lines.forEach((line, index) => {
      const y = height / 2 - ((lines.length - 1) * 70 / 2) + index * 70;
      ctx.fillText(line, width / 2, y);
    });
    
    // Save the image
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  } catch (error) {
    console.error('Error creating solid thumbnail:', error);
    throw error;
  }
}

function drawDesignElements(ctx, width, height) {
  // Draw decorative elements
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  
  // Draw circles
  for (let i = 0; i < 5; i++) {
    const radius = Math.random() * 100 + 50;
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw diagonal stripes
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = -height; i < width + height; i += 40) {
    ctx.fillRect(i, 0, 20, height);
  }
}

function getLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
