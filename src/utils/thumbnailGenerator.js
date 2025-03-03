
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Dictionary of visual concepts and corresponding colors/styles
const CONCEPT_STYLES = {
  // Categories
  tech: { bgColor: '#081b29', textColor: '#3498db', icon: '💻' },
  travel: { bgColor: '#1a5276', textColor: '#f9e79f', icon: '✈️' },
  food: { bgColor: '#641e16', textColor: '#f5b041', icon: '🍔' },
  fitness: { bgColor: '#186a3b', textColor: '#58d68d', icon: '💪' },
  business: { bgColor: '#212f3c', textColor: '#f4f6f7', icon: '📊' },
  art: { bgColor: '#4a235a', textColor: '#bb8fce', icon: '🎨' },
  music: { bgColor: '#1b2631', textColor: '#e74c3c', icon: '🎵' },
  education: { bgColor: '#7d6608', textColor: '#f7dc6f', icon: '📚' },
  gaming: { bgColor: '#1b2631', textColor: '#3498db', icon: '🎮' },
  
  // Common words/concepts to detect
  new: { textEffect: 'highlight', highlightColor: '#e74c3c' },
  best: { textEffect: 'outline', outlineColor: '#f1c40f' },
  review: { textEffect: 'shadow', shadowColor: '#2c3e50' },
  tutorial: { textEffect: 'gradient', gradientColors: ['#3498db', '#2ecc71'] },
  vs: { textEffect: 'split', splitColors: ['#e74c3c', '#3498db'] },
  top: { textEffect: 'starburst', burstColor: '#f1c40f' },
};

// Keywords that map to categories
const CATEGORY_KEYWORDS = {
  tech: ['computer', 'software', 'hardware', 'coding', 'programming', 'technology', 'app', 'digital', 'smartphone', 'tech'],
  travel: ['trip', 'vacation', 'journey', 'adventure', 'destination', 'travel', 'tour', 'explore', 'beach', 'mountain', 'landscape'],
  food: ['recipe', 'cooking', 'delicious', 'meal', 'dish', 'restaurant', 'cuisine', 'food', 'eat', 'baking', 'dessert'],
  fitness: ['workout', 'exercise', 'gym', 'training', 'health', 'fitness', 'muscle', 'strength', 'cardio', 'yoga'],
  business: ['entrepreneur', 'startup', 'marketing', 'finance', 'career', 'success', 'business', 'leadership', 'management', 'money'],
  art: ['painting', 'drawing', 'creative', 'design', 'artistic', 'illustration', 'art', 'craft', 'color', 'sketch'],
  music: ['song', 'album', 'concert', 'guitar', 'piano', 'singing', 'music', 'band', 'artist', 'instrument'],
  education: ['learn', 'study', 'school', 'college', 'university', 'knowledge', 'education', 'course', 'teaching', 'academic'],
  gaming: ['game', 'playthrough', 'gaming', 'gameplay', 'console', 'strategy', 'multiplayer', 'level', 'character', 'video game'],
};

// Detect category from text
function detectCategory(text) {
  text = text.toLowerCase();
  
  // Check for direct category words
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Default to a generic style if no category is detected
  return 'business';
}

// Extract main concepts and keywords from text
function extractConcepts(text) {
  const words = text.toLowerCase().split(/\s+/);
  const concepts = [];
  
  // Find important words
  for (const word of words) {
    const cleanWord = word.replace(/[^\w\s]/gi, '');
    if (cleanWord in CONCEPT_STYLES) {
      concepts.push(cleanWord);
    }
    
    // Look for category keywords
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.includes(cleanWord) && !concepts.includes(category)) {
        concepts.push(category);
      }
    }
  }
  
  return concepts;
}

// Generate a catchy title from the text
function generateTitle(text) {
  const words = text.split(/\s+/);
  let title = '';
  
  // Take the first 4-6 words for the title
  const titleWords = words.slice(0, Math.min(5, words.length));
  title = titleWords.join(' ');
  
  // Add an attention-grabbing prefix if the title is short
  if (titleWords.length < 3) {
    const prefixes = ["Ultimate", "Complete", "Essential", "Amazing", "Definitive"];
    title = prefixes[Math.floor(Math.random() * prefixes.length)] + " " + title;
  }
  
  // Convert title to title case
  return title.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Draw text with effects
function drawTextWithEffect(ctx, text, x, y, fontSize, color, effect, effectDetails) {
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  
  // Apply text effects
  switch(effect) {
    case 'highlight':
      // Draw highlight behind text
      ctx.fillStyle = effectDetails.highlightColor || '#ffff00';
      ctx.fillRect(
        x - ctx.measureText(text).width / 2 - 10, 
        y - fontSize / 2 - 5, 
        ctx.measureText(text).width + 20, 
        fontSize + 10
      );
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      break;
      
    case 'outline':
      // Draw text outline
      ctx.strokeStyle = effectDetails.outlineColor || '#000000';
      ctx.lineWidth = fontSize / 10;
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      break;
      
    case 'shadow':
      // Draw text shadow
      const shadowColor = effectDetails.shadowColor || 'rgba(0,0,0,0.5)';
      const shadowOffsetX = fontSize / 12;
      const shadowOffsetY = fontSize / 12;
      ctx.fillStyle = shadowColor;
      ctx.fillText(text, x + shadowOffsetX, y + shadowOffsetY);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      break;
      
    case 'gradient':
      // Draw gradient text
      const colors = effectDetails.gradientColors || ['#ff0000', '#0000ff'];
      const gradient = ctx.createLinearGradient(
        x - ctx.measureText(text).width / 2, 
        y, 
        x + ctx.measureText(text).width / 2, 
        y
      );
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      ctx.fillStyle = gradient;
      ctx.fillText(text, x, y);
      break;
      
    default:
      // Normal text
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
  }
}

// Draw a thumbnail-style background
function drawThumbnailBackground(ctx, width, height, category) {
  const style = CONCEPT_STYLES[category] || { bgColor: '#212f3c', textColor: '#f4f6f7' };
  
  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, style.bgColor);
  gradient.addColorStop(1, adjustColor(style.bgColor, -20)); // Darker variant
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add design elements based on category
  drawCategoryDesignElements(ctx, width, height, category);
}

// Draw design elements specific to categories
function drawCategoryDesignElements(ctx, width, height, category) {
  // Draw geometric elements based on category
  switch(category) {
    case 'tech':
      // Circuit-like pattern
      ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 50, y);
        ctx.lineTo(x + 50, y + 50);
        ctx.stroke();
      }
      break;
      
    case 'travel':
      // Cloud or mountain silhouettes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < width; i += 80) {
        const mountainHeight = 50 + Math.random() * 100;
        ctx.beginPath();
        ctx.moveTo(i, height);
        ctx.lineTo(i + 40, height - mountainHeight);
        ctx.lineTo(i + 80, height);
        ctx.fill();
      }
      break;
      
    case 'food':
      // Plate-like circles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(width / 4, height / 4, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(width * 3/4, height * 3/4, 70, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    // Add cases for other categories as needed
      
    default:
      // Generic abstract shapes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * width, 
          Math.random() * height, 
          20 + Math.random() * 60, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
      }
  }
}

// Utility function to adjust color brightness
function adjustColor(color, amount) {
  // Convert hex to RGB
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);
  
  // Adjust values
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Draw overlay elements
function drawOverlayElements(ctx, width, height, title, concepts) {
  // Draw title
  const fontSize = Math.min(width / 15, 36);
  
  // Find text effects to apply from concepts
  let textEffect = 'none';
  let effectDetails = {};
  
  // Check if any concepts have special text effects
  for (const concept of concepts) {
    if (concept in CONCEPT_STYLES && CONCEPT_STYLES[concept].textEffect) {
      textEffect = CONCEPT_STYLES[concept].textEffect;
      effectDetails = CONCEPT_STYLES[concept];
      break;
    }
  }
  
  // Get the category for text color
  const category = concepts.find(c => c in CONCEPT_STYLES) || 'business';
  const textColor = CONCEPT_STYLES[category]?.textColor || '#ffffff';
  
  // Draw the title text with effect
  drawTextWithEffect(
    ctx, 
    title.toUpperCase(), 
    width / 2, 
    height / 2, 
    fontSize, 
    textColor,
    textEffect,
    effectDetails
  );
  
  // Draw category icon if available
  if (category in CONCEPT_STYLES && CONCEPT_STYLES[category].icon) {
    ctx.font = `${fontSize * 1.5}px Arial`;
    ctx.fillText(CONCEPT_STYLES[category].icon, width / 2, height / 4);
  }
  
  // Add number or bullet points for numbered lists or tips
  if (title.toLowerCase().includes('top') || title.toLowerCase().includes('tips')) {
    const number = Math.floor(Math.random() * 10) + 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `bold ${fontSize * 2}px Arial`;
    ctx.fillText(number.toString(), width * 0.8, height * 0.3);
    
    // Circle around the number
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.3, fontSize, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Main function to generate YouTube thumbnail
async function generateYouTubeThumbnail(text) {
  const width = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Analyze the text
  const category = detectCategory(text);
  const concepts = extractConcepts(text);
  const title = generateTitle(text);
  
  // Draw background
  drawThumbnailBackground(ctx, width, height, category);
  
  // Draw overlay elements
  drawOverlayElements(ctx, width, height, title, [category, ...concepts]);
  
  // Return image as buffer
  return canvas.toBuffer('image/png');
}

// Function to generate multiple thumbnail variations
async function generateThumbnailVariations(text, count = 3) {
  const thumbnails = [];
  
  for (let i = 0; i < count; i++) {
    const thumbnailBuffer = await generateYouTubeThumbnail(text);
    thumbnails.push({
      buffer: thumbnailBuffer,
      filename: `thumbnail_variation_${i + 1}.png`
    });
  }
  
  // Create a zip file with all variations
  const zip = new AdmZip();
  
  // Add each thumbnail to the zip
  thumbnails.forEach((thumbnail, index) => {
    zip.addFile(thumbnail.filename, thumbnail.buffer);
  });
  
  // Generate the zip buffer
  return zip.toBuffer();
}

module.exports = {
  generateYouTubeThumbnail,
  generateThumbnailVariations
};
