
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage, registerFont } from 'canvas';
import AdmZip from 'adm-zip';
import fs from 'fs';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register font for thumbnail text
const fontPath = path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf');

// Ensure the font directory exists
const fontDir = path.dirname(fontPath);
if (!fs.existsSync(fontDir)) {
  fs.mkdirSync(fontDir, { recursive: true });
}

// Download Roboto font if it doesn't exist
if (!fs.existsSync(fontPath)) {
  const robotoUrl = 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Bold.ttf';
  
  try {
    const response = await fetch(robotoUrl);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(fontPath, Buffer.from(buffer));
    console.log('Roboto-Bold.ttf downloaded successfully');
  } catch (error) {
    console.error('Error downloading Roboto font:', error);
    // Fallback: Don't register the font, use system default
  }
}

// Register font if it exists
try {
  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: 'Roboto', weight: 'bold' });
  }
} catch (error) {
  console.warn('Warning: Could not register font, using system default', error);
}

// Category-based background images (references to stock free images or colors)
const categoryBackgrounds = {
  tech: '#1e88e5', // Blue for tech
  gaming: '#d32f2f', // Red for gaming
  education: '#43a047', // Green for education
  entertainment: '#f57c00', // Orange for entertainment
  business: '#3949ab', // Indigo for business
  health: '#00acc1', // Cyan for health
  default: '#5e35b1', // Purple default
};

// Icons for categories (emoji as text)
const categoryIcons = {
  tech: '💻',
  gaming: '🎮',
  education: '📚',
  entertainment: '🎬',
  business: '💼',
  health: '❤️',
  default: '🔍',
};

// Get category from text content
function detectCategory(text) {
  text = text.toLowerCase();
  
  if (/tech|computer|software|hardware|smartphone|gadget|digital|algorithm|code|programming/.test(text)) {
    return 'tech';
  }
  if (/game|gaming|play|console|xbox|playstation|nintendo|fortnite|minecraft/.test(text)) {
    return 'gaming';
  }
  if (/education|learn|school|college|university|course|study|knowledge|teach|academic/.test(text)) {
    return 'education';
  }
  if (/movie|film|music|entertain|show|theater|concert|performance|streaming|netflix/.test(text)) {
    return 'entertainment';
  }
  if (/business|company|startup|entrepreneur|finance|invest|stock|market|corporate|economy/.test(text)) {
    return 'business';
  }
  if (/health|workout|fitness|exercise|diet|nutrition|medical|wellness|yoga|doctor/.test(text)) {
    return 'health';
  }
  
  return 'default';
}

// Make text fit on canvas
function fitTextOnCanvas(ctx, text, maxWidth, fontSize, fontFamily) {
  // Start with the provided font size
  let size = fontSize;
  ctx.font = `bold ${size}px ${fontFamily}`;
  
  // Measure width of text
  let width = ctx.measureText(text).width;
  
  // If text is wider than canvas, shrink it
  while (width > maxWidth && size > 12) {
    size -= 2;
    ctx.font = `bold ${size}px ${fontFamily}`;
    width = ctx.measureText(text).width;
  }
  
  return size;
}

// Word wrap function
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  
  lines.push(line);
  
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + (i * lineHeight));
  }
  
  return lines.length;
}

// Extract keywords from prompt
function extractKeywords(text) {
  // Simple keyword extraction - remove common words and get remaining words
  const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'on', 'at', 'to', 'from', 'by'];
  return text
    .split(' ')
    .filter(word => word.length > 3 && !commonWords.includes(word.toLowerCase()))
    .slice(0, 3)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1));
}

// Generate thumbnails with different aspect ratios and styles
export async function generateYouTubeThumbnails(prompt) {
  console.log('Generating YouTube thumbnails for prompt:', prompt);
  const category = detectCategory(prompt);
  const backgroundColor = categoryBackgrounds[category];
  const icon = categoryIcons[category];
  const keywords = extractKeywords(prompt);
  
  // Zip file to store the thumbnails
  const zip = new AdmZip();
  
  try {
    // Different thumbnail sizes
    const thumbnailSizes = [
      { width: 1280, height: 720, name: 'standard' }, // 16:9 Standard
      { width: 1280, height: 800, name: 'square-ish' }, // More square format
      { width: 1280, height: 1024, name: 'vertical' }, // More vertical
    ];
    
    // Create multiple thumbnail variations
    for (const size of thumbnailSizes) {
      // Create canvas with the specified dimensions
      const canvas = createCanvas(size.width, size.height);
      const ctx = canvas.getContext('2d');
      
      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, size.width, size.height);
      
      // Add diagonal stripe
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(size.width, size.height);
      ctx.lineWidth = size.width / 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();
      
      // Add category icon
      const iconSize = Math.min(size.width, size.height) / 4;
      ctx.font = `${iconSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, size.width - iconSize, iconSize);
      
      // Add title text
      const fontFamily = fs.existsSync(fontPath) ? 'Roboto' : 'Arial, sans-serif';
      let fontSize = Math.min(size.width, size.height) / 10;
      fontSize = fitTextOnCanvas(ctx, prompt, size.width - 60, fontSize, fontFamily);
      
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      const lineHeight = fontSize * 1.2;
      const textX = 40;
      const textY = size.height / 2;
      wrapText(ctx, prompt, textX, textY, size.width - 80, lineHeight);
      
      // Add keywords at the bottom
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, size.height - 60, size.width, 60);
      
      ctx.font = `bold ${Math.min(size.width, size.height) / 20}px ${fontFamily}`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(keywords.join(' • '), size.width / 2, size.height - 30);
      
      // Add the thumbnail to the zip
      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      zip.addFile(`youtube-thumbnail-${size.name}.jpg`, buffer);
      
      console.log(`Generated ${size.name} thumbnail`);
    }
    
    // Return the zip file
    return zip.toBuffer();
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    throw new Error('Failed to generate thumbnails');
  }
}
