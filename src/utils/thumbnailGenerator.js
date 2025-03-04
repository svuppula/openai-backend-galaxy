
import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define path to font file using the __dirname variable
const fontPath = path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf');

// Check if font file exists and register it
if (fs.existsSync(fontPath)) {
  registerFont(fontPath, { family: 'Roboto' });
}

// Color themes for different content categories
const colorThemes = {
  tech: ['#0062ff', '#00c6ff'],
  nature: ['#00a86b', '#4caf50'],
  business: ['#7b68ee', '#9370db'],
  entertainment: ['#ff3e4d', '#ff7700'],
  education: ['#4a90e2', '#5cb3ff'],
  fitness: ['#e91e63', '#ff5e8f'],
  food: ['#ff9800', '#ffeb3b'],
  default: ['#6c5ce7', '#a29bfe']
};

// Theme-specific icon designs
const drawThemeIcon = (ctx, category, width, height) => {
  const centerX = width * 0.85;
  const centerY = height * 0.15;
  const size = Math.min(width, height) * 0.1;
  
  ctx.save();
  
  switch(category.toLowerCase()) {
    case 'tech':
      // Draw gear icon
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = size * 0.1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw gear teeth
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = centerX + Math.cos(angle) * size * 0.7;
        const y1 = centerY + Math.sin(angle) * size * 0.7;
        const x2 = centerX + Math.cos(angle) * size;
        const y2 = centerY + Math.sin(angle) * size;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      break;
      
    case 'nature':
      // Draw leaf icon
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, size * 0.7, size * 0.4, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(centerX - size * 0.3, centerY + size * 0.3);
      ctx.quadraticCurveTo(centerX, centerY, centerX + size * 0.3, centerY - size * 0.3);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = size * 0.1;
      ctx.stroke();
      break;
      
    case 'business':
      // Draw chart icon
      ctx.fillStyle = '#ffffff';
      
      // Bar chart
      ctx.fillRect(centerX - size * 0.6, centerY, size * 0.2, size * 0.5);
      ctx.fillRect(centerX - size * 0.3, centerY - size * 0.3, size * 0.2, size * 0.8);
      ctx.fillRect(centerX, centerY - size * 0.1, size * 0.2, size * 0.6);
      ctx.fillRect(centerX + size * 0.3, centerY - size * 0.5, size * 0.2, size);
      
      // X axis
      ctx.fillRect(centerX - size * 0.7, centerY + size * 0.5, size * 1.4, size * 0.1);
      break;
      
    case 'entertainment':
      // Draw play button
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(centerX - size * 0.4, centerY - size * 0.6);
      ctx.lineTo(centerX + size * 0.6, centerY);
      ctx.lineTo(centerX - size * 0.4, centerY + size * 0.6);
      ctx.closePath();
      ctx.fill();
      break;
      
    case 'education':
      // Draw book icon
      ctx.fillStyle = '#ffffff';
      
      // Book cover
      ctx.fillRect(centerX - size * 0.6, centerY - size * 0.6, size * 1.2, size * 1.2);
      
      // Book spine
      ctx.fillStyle = colorThemes.education[0];
      ctx.fillRect(centerX - size * 0.7, centerY - size * 0.6, size * 0.1, size * 1.2);
      
      // Book lines
      ctx.fillStyle = colorThemes.education[0];
      ctx.fillRect(centerX - size * 0.4, centerY - size * 0.3, size * 0.8, size * 0.1);
      ctx.fillRect(centerX - size * 0.4, centerY, size * 0.8, size * 0.1);
      ctx.fillRect(centerX - size * 0.4, centerY + size * 0.3, size * 0.8, size * 0.1);
      break;
      
    case 'fitness':
      // Draw dumbbell
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = size * 0.2;
      
      // Bar
      ctx.beginPath();
      ctx.moveTo(centerX - size * 0.5, centerY);
      ctx.lineTo(centerX + size * 0.5, centerY);
      ctx.stroke();
      
      // Weights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(centerX - size * 0.8, centerY - size * 0.3, size * 0.3, size * 0.6);
      ctx.fillRect(centerX + size * 0.5, centerY - size * 0.3, size * 0.3, size * 0.6);
      break;
      
    case 'food':
      // Draw fork and knife
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = size * 0.1;
      
      // Fork
      ctx.beginPath();
      ctx.moveTo(centerX - size * 0.3, centerY - size * 0.6);
      ctx.lineTo(centerX - size * 0.3, centerY + size * 0.4);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX - size * 0.5, centerY - size * 0.6);
      ctx.lineTo(centerX - size * 0.3, centerY - size * 0.3);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX - size * 0.3, centerY - size * 0.6);
      ctx.lineTo(centerX - size * 0.3, centerY - size * 0.3);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX - size * 0.1, centerY - size * 0.6);
      ctx.lineTo(centerX - size * 0.3, centerY - size * 0.3);
      ctx.stroke();
      
      // Knife
      ctx.beginPath();
      ctx.moveTo(centerX + size * 0.3, centerY - size * 0.6);
      ctx.lineTo(centerX + size * 0.3, centerY + size * 0.4);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX + size * 0.1, centerY - size * 0.6);
      ctx.lineTo(centerX + size * 0.5, centerY - size * 0.3);
      ctx.lineTo(centerX + size * 0.3, centerY - size * 0.1);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      break;
      
    default:
      // Draw star icon for default
      ctx.fillStyle = '#ffffff';
      const spikes = 5;
      const outerRadius = size;
      const innerRadius = size * 0.4;
      
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
  }
  
  ctx.restore();
};

// Function to detect category from text
const detectCategory = (text) => {
  text = text.toLowerCase();
  
  const keywords = {
    tech: ['technology', 'software', 'hardware', 'programming', 'computer', 'ai', 'code', 'app', 'digital', 'smartphone', 'internet', 'coding', 'tech', 'developer', 'web', 'mobile'],
    nature: ['nature', 'environment', 'plant', 'animal', 'green', 'eco', 'outdoor', 'garden', 'forest', 'wildlife', 'mountain', 'landscape', 'climate', 'conservation', 'sustainable'],
    business: ['business', 'finance', 'money', 'entrepreneur', 'market', 'economy', 'company', 'startup', 'investment', 'corporate', 'management', 'strategy', 'leadership', 'career'],
    entertainment: ['entertainment', 'movie', 'music', 'game', 'concert', 'celebrity', 'film', 'festival', 'tv', 'show', 'play', 'streaming', 'video', 'youtube', 'netflix', 'perform'],
    education: ['education', 'learn', 'school', 'university', 'college', 'student', 'teacher', 'academic', 'course', 'study', 'knowledge', 'class', 'tutorial', 'lecture', 'training'],
    fitness: ['fitness', 'workout', 'exercise', 'gym', 'health', 'diet', 'nutrition', 'muscle', 'training', 'weight', 'yoga', 'strength', 'cardio', 'wellness', 'running'],
    food: ['food', 'recipe', 'cook', 'restaurant', 'meal', 'delicious', 'kitchen', 'bake', 'chef', 'tasty', 'cuisine', 'cooking', 'dish', 'flavor', 'ingredient', 'dinner']
  };
  
  // Count occurrences of keywords from each category
  let scores = {};
  for (const [category, words] of Object.entries(keywords)) {
    scores[category] = words.filter(word => text.includes(word)).length;
  }
  
  // Find category with highest score
  let maxScore = 0;
  let detectedCategory = 'default';
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedCategory = category;
    }
  }
  
  return maxScore > 0 ? detectedCategory : 'default';
};

// Create a YouTube thumbnail
const createYouTubeThumbnail = async (text, options = {}) => {
  try {
    // Default options
    const width = options.width || 1280;
    const height = options.height || 720;
    const category = options.category || detectCategory(text);
    const outputPath = options.outputPath || path.join(__dirname, '../../temp', `thumbnail-${Date.now()}.png`);
    
    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Get theme colors
    const themeColors = colorThemes[category] || colorThemes.default;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, themeColors[0]);
    gradient.addColorStop(1, themeColors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add theme-specific icon
    drawThemeIcon(ctx, category, width, height);
    
    // Add a semi-transparent overlay for better text readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    // Add decorative elements
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 20;
    
    // Draw decorative lines
    ctx.beginPath();
    ctx.moveTo(0, height * 0.25);
    ctx.lineTo(width * 0.3, height * 0.25);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width * 0.7, height * 0.75);
    ctx.lineTo(width, height * 0.75);
    ctx.stroke();
    
    // Add corner accent
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.2, 0);
    ctx.lineTo(0, height * 0.2);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width * 0.8, height);
    ctx.lineTo(width, height * 0.8);
    ctx.closePath();
    ctx.fill();
    
    // Generate title text from input
    let title = text;
    if (text.length > 60) {
      // Truncate and add ellipsis if too long
      title = text.substring(0, 57) + '...';
    }
    
    // Drawing the main title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.floor(height * 0.09)}px 'Roboto', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // Split into lines if needed
    const words = title.split(' ');
    let line = '';
    let lines = [];
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > width * 0.9 && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line); // Add the last line
    
    // Center vertically based on number of lines
    const lineHeight = Math.floor(height * 0.1);
    const totalTextHeight = lines.length * lineHeight;
    let textY = (height - totalTextHeight) / 2;
    
    // Draw each line
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, textY + (index * lineHeight));
    });
    
    // Add a category tag
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.font = `bold ${Math.floor(height * 0.04)}px 'Roboto', sans-serif`;
    const tagText = category.charAt(0).toUpperCase() + category.slice(1);
    const tagMetrics = ctx.measureText(tagText);
    const tagWidth = tagMetrics.width + 40;
    const tagHeight = Math.floor(height * 0.06);
    const tagX = 20;
    const tagY = height - tagHeight - 20;
    
    // Tag background
    ctx.fillStyle = themeColors[0];
    ctx.fillRect(tagX, tagY, tagWidth, tagHeight);
    
    // Tag text
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagText, tagX + 20, tagY + tagHeight / 2);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Make sure the directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    return {
      path: outputPath,
      width,
      height,
      category
    };
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw error;
  }
};

export default createYouTubeThumbnail;
