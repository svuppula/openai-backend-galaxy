
import { createCanvas, loadImage, registerFont } from 'canvas';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

// Define font paths - in a real environment you'd have these files
const fontPath = path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf');

// Try to register font if it exists
try {
  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: 'Roboto' });
  }
} catch (error) {
  console.warn('Font registration failed, using system fonts', error);
}

/**
 * Generate YouTube thumbnail variations based on a text prompt
 * @param {string} prompt - The text description for thumbnail generation
 * @param {number} count - Number of variations to generate
 * @returns {Promise<Buffer>} - The generated thumbnails as a zip file
 */
export const generateThumbnails = async (prompt, count = 3) => {
  try {
    // Create temp directory for files
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'thumbnails-'));
    const zip = new AdmZip();
    
    // YouTube thumbnail dimensions (1280x720 is standard)
    const width = 1280;
    const height = 720;
    
    // Generate thumbnails
    for (let i = 0; i < count; i++) {
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      
      // Determine thumbnail style based on prompt content and variation number
      const style = getThumbnailStyle(prompt, i);
      
      // Apply background color or gradient
      applyBackground(ctx, width, height, style);
      
      // Add text elements
      addTextElements(ctx, width, height, prompt, style);
      
      // Add visual elements
      await addVisualElements(ctx, width, height, style);
      
      // Save to file
      const outputFile = path.join(tempDir, `thumbnail-${i + 1}.png`);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputFile, buffer);
      
      // Add to zip
      zip.addLocalFile(outputFile);
    }
    
    // Get zip buffer
    const zipBuffer = zip.toBuffer();
    
    // Clean up temp files
    fs.rmdirSync(tempDir, { recursive: true });
    
    return zipBuffer;
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    throw new Error('Failed to generate thumbnails');
  }
};

/**
 * Get thumbnail style based on prompt
 * @param {string} prompt - The text description
 * @param {number} variation - Variation number
 * @returns {object} - Style object
 */
const getThumbnailStyle = (prompt, variation) => {
  const lowercasePrompt = prompt.toLowerCase();
  
  // Default style
  const style = {
    background: '#1a73e8',
    textColor: '#ffffff',
    accentColor: '#ffdd00',
    font: 'bold 60px Arial',
    smallFont: 'bold 30px Arial',
    layout: 'centered'
  };
  
  // Tech theme
  if (
    lowercasePrompt.includes('tech') || 
    lowercasePrompt.includes('phone') || 
    lowercasePrompt.includes('laptop') || 
    lowercasePrompt.includes('computer') ||
    lowercasePrompt.includes('gadget') ||
    lowercasePrompt.includes('review')
  ) {
    style.background = variation === 0 ? '#121212' : (variation === 1 ? '#0f2b46' : '#2c2c2c');
    style.textColor = '#ffffff';
    style.accentColor = variation === 0 ? '#00b2ff' : (variation === 1 ? '#ff5722' : '#76ff03');
    style.layout = 'tech';
  }
  
  // Food theme
  else if (
    lowercasePrompt.includes('food') || 
    lowercasePrompt.includes('recipe') || 
    lowercasePrompt.includes('cooking') ||
    lowercasePrompt.includes('meal') ||
    lowercasePrompt.includes('restaurant')
  ) {
    style.background = variation === 0 ? '#6a3d0f' : (variation === 1 ? '#e65100' : '#33691e');
    style.textColor = '#ffffff';
    style.accentColor = variation === 0 ? '#ffd600' : (variation === 1 ? '#ffecb3' : '#ccff90');
    style.layout = 'food';
  }
  
  // Travel theme
  else if (
    lowercasePrompt.includes('travel') || 
    lowercasePrompt.includes('vacation') || 
    lowercasePrompt.includes('trip') ||
    lowercasePrompt.includes('destination') ||
    lowercasePrompt.includes('tourist')
  ) {
    style.background = variation === 0 ? '#01579b' : (variation === 1 ? '#006064' : '#1b5e20');
    style.textColor = '#ffffff';
    style.accentColor = variation === 0 ? '#ffc400' : (variation === 1 ? '#40c4ff' : '#b2ff59');
    style.layout = 'travel';
  }
  
  // Gaming theme
  else if (
    lowercasePrompt.includes('game') || 
    lowercasePrompt.includes('gaming') || 
    lowercasePrompt.includes('player') ||
    lowercasePrompt.includes('console') ||
    lowercasePrompt.includes('xbox') ||
    lowercasePrompt.includes('playstation')
  ) {
    style.background = variation === 0 ? '#6200ea' : (variation === 1 ? '#d50000' : '#2962ff');
    style.textColor = '#ffffff';
    style.accentColor = variation === 0 ? '#76ff03' : (variation === 1 ? '#ffff00' : '#18ffff');
    style.layout = 'gaming';
  }
  
  // Business/finance theme
  else if (
    lowercasePrompt.includes('business') || 
    lowercasePrompt.includes('finance') || 
    lowercasePrompt.includes('money') ||
    lowercasePrompt.includes('investment') ||
    lowercasePrompt.includes('stock') ||
    lowercasePrompt.includes('market')
  ) {
    style.background = variation === 0 ? '#0d47a1' : (variation === 1 ? '#1a237e' : '#004d40');
    style.textColor = '#ffffff';
    style.accentColor = variation === 0 ? '#ffc107' : (variation === 1 ? '#b2dfdb' : '#ffecb3');
    style.layout = 'business';
  }
  
  // Beauty/fashion theme
  else if (
    lowercasePrompt.includes('beauty') || 
    lowercasePrompt.includes('fashion') || 
    lowercasePrompt.includes('makeup') ||
    lowercasePrompt.includes('style') ||
    lowercasePrompt.includes('clothing')
  ) {
    style.background = variation === 0 ? '#ad1457' : (variation === 1 ? '#f50057' : '#6a1b9a');
    style.textColor = '#ffffff';
    style.accentColor = variation === 0 ? '#fff59d' : (variation === 1 ? '#b2ebf2' : '#ea80fc');
    style.layout = 'beauty';
  }
  
  // General/other - apply different styles based on variation
  else {
    const variationStyles = [
      { bg: '#4527a0', text: '#ffffff', accent: '#ffea00', layout: 'left' },
      { bg: '#c62828', text: '#ffffff', accent: '#ffeb3b', layout: 'centered' },
      { bg: '#00796b', text: '#ffffff', accent: '#ffc107', layout: 'right' }
    ];
    
    style.background = variationStyles[variation].bg;
    style.textColor = variationStyles[variation].text;
    style.accentColor = variationStyles[variation].accent;
    style.layout = variationStyles[variation].layout;
  }
  
  return style;
};

/**
 * Apply background style to canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {object} style - Style object
 */
const applyBackground = (ctx, width, height, style) => {
  // Fill with base color
  ctx.fillStyle = style.background;
  ctx.fillRect(0, 0, width, height);
  
  // Add gradient overlay based on layout
  if (style.layout === 'tech') {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add tech-like grid lines
    ctx.strokeStyle = style.accentColor + '30';  // 30% opacity
    ctx.lineWidth = 2;
    
    // Horizontal lines
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 0; x < width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  } 
  
  else if (style.layout === 'food') {
    // Add a radial gradient for food thumbnails
    const gradient = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, width/2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some "steam" effects
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * width;
      const y = Math.random() * (height/2);
      const radius = 20 + Math.random() * 60;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  else if (style.layout === 'travel') {
    // Add a linear gradient for travel thumbnails
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some "cloud" effects
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * (height/3);
      const radius = 40 + Math.random() * 100;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  else if (style.layout === 'gaming') {
    // Add a gradient and some "gaming" effects
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some "pixel" effects
    const pixelSize = 15;
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * width / pixelSize) * pixelSize;
      const y = Math.floor(Math.random() * height / pixelSize) * pixelSize;
      ctx.fillStyle = style.accentColor + Math.floor(Math.random() * 99).toString(16).padStart(2, '0');  // Random opacity
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }
  
  else {
    // Add a subtle gradient for other layouts
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  // Add a subtle vignette effect
  const gradient = ctx.createRadialGradient(width/2, height/2, height/3, width/2, height/2, height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

/**
 * Add text elements to thumbnail
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {string} prompt - The text description
 * @param {object} style - Style object
 */
const addTextElements = (ctx, width, height, prompt, style) => {
  // Process prompt text
  const words = prompt.split(' ');
  
  // Get first 2-3 words for title (or more if they're short)
  let titleWords = [];
  let charCount = 0;
  
  for (const word of words) {
    if (charCount + word.length > 25) break;
    titleWords.push(word);
    charCount += word.length + 1;
  }
  
  let subtitleWords = words.slice(titleWords.length);
  
  // If subtitle is too long, truncate
  if (subtitleWords.length > 5) {
    subtitleWords = subtitleWords.slice(0, 5);
    subtitleWords.push('...');
  }
  
  const title = titleWords.join(' ').toUpperCase();
  const subtitle = subtitleWords.join(' ');
  
  // Add title shadow for readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Configure text style
  ctx.fillStyle = style.textColor;
  ctx.textAlign = style.layout === 'left' ? 'left' : (style.layout === 'right' ? 'right' : 'center');
  
  // Calculate text positions based on layout
  let titleX, titleY, subtitleX, subtitleY;
  
  if (style.layout === 'left') {
    titleX = 50;
    titleY = height / 2 - 30;
    subtitleX = 50;
    subtitleY = height / 2 + 30;
  } else if (style.layout === 'right') {
    titleX = width - 50;
    titleY = height / 2 - 30;
    subtitleX = width - 50;
    subtitleY = height / 2 + 30;
  } else {
    titleX = width / 2;
    titleY = height / 2 - 30;
    subtitleX = width / 2;
    subtitleY = height / 2 + 30;
  }
  
  // Some variations for different layouts
  if (style.layout === 'tech') {
    // Tech layout has title at the bottom
    titleY = height - 150;
    subtitleY = height - 80;
    
    // Add "NEW" badge for tech reviews
    if (prompt.toLowerCase().includes('review')) {
      ctx.fillStyle = style.accentColor;
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('NEW', width - 100, 80);
      
      // Draw circle around "NEW"
      ctx.beginPath();
      ctx.arc(width - 100, 70, 50, 0, Math.PI * 2);
      ctx.strokeStyle = style.accentColor;
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  } else if (style.layout === 'food') {
    // Food layout has title at the top
    titleY = 150;
    subtitleY = 220;
  } else if (style.layout === 'gaming') {
    // Gaming layout has angled text
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-0.05);
    ctx.textAlign = 'center';
    ctx.font = 'bold 70px Arial';
    ctx.fillText(title, 0, 0);
    ctx.font = 'bold 35px Arial';
    ctx.fillText(subtitle, 0, 70);
    ctx.restore();
    return; // Skip the normal text rendering
  }
  
  // Draw title
  ctx.font = 'bold 70px Arial';
  ctx.fillText(title, titleX, titleY);
  
  // Draw subtitle
  ctx.font = 'bold 35px Arial';
  ctx.fillText(subtitle, subtitleX, subtitleY);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Add accent elements based on style
  if (style.layout !== 'gaming') { // We already handled gaming layout differently
    ctx.fillStyle = style.accentColor;
    
    if (style.layout === 'left') {
      // Left accent bar
      ctx.fillRect(25, titleY - 60, 10, 120);
    } else if (style.layout === 'right') {
      // Right accent bar
      ctx.fillRect(width - 35, titleY - 60, 10, 120);
    } else {
      // Center accent line
      ctx.fillRect(width / 2 - 100, subtitleY + 30, 200, 8);
    }
  }
};

/**
 * Add visual elements to thumbnail based on style
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {object} style - Style object
 */
const addVisualElements = async (ctx, width, height, style) => {
  // Add style-specific visual elements
  if (style.layout === 'tech') {
    // Add tech-related visual elements
    drawTechElements(ctx, width, height, style);
  } else if (style.layout === 'food') {
    // Add food-related visual elements
    drawFoodElements(ctx, width, height, style);
  } else if (style.layout === 'travel') {
    // Add travel-related visual elements
    drawTravelElements(ctx, width, height, style);
  } else if (style.layout === 'gaming') {
    // Add gaming-related visual elements
    drawGamingElements(ctx, width, height, style);
  } else if (style.layout === 'business') {
    // Add business-related visual elements
    drawBusinessElements(ctx, width, height, style);
  } else if (style.layout === 'beauty') {
    // Add beauty-related visual elements
    drawBeautyElements(ctx, width, height, style);
  } else {
    // Add general visual elements
    drawGeneralElements(ctx, width, height, style);
  }
};

// Draw tech-related visual elements
const drawTechElements = (ctx, width, height, style) => {
  // Draw a smartphone outline
  ctx.strokeStyle = style.accentColor;
  ctx.lineWidth = 5;
  
  const phoneX = width / 4;
  const phoneY = height / 4;
  const phoneWidth = width / 2;
  const phoneHeight = height / 2;
  
  // Phone body
  ctx.beginPath();
  ctx.roundRect(phoneX, phoneY, phoneWidth, phoneHeight, 20);
  ctx.stroke();
  
  // Phone screen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(phoneX + 10, phoneY + 10, phoneWidth - 20, phoneHeight - 20);
  
  // Home button
  ctx.beginPath();
  ctx.arc(phoneX + phoneWidth / 2, phoneY + phoneHeight - 20, 15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fill();
};

// Draw food-related visual elements
const drawFoodElements = (ctx, width, height, style) => {
  // Draw a plate
  ctx.beginPath();
  ctx.arc(width / 2, height - 200, 150, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fill();
  ctx.strokeStyle = style.accentColor;
  ctx.lineWidth = 5;
  ctx.stroke();
  
  // Draw a fork and knife
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 3;
  
  // Fork
  const forkX = width / 2 - 80;
  const forkY = height - 300;
  ctx.beginPath();
  ctx.moveTo(forkX, forkY);
  ctx.lineTo(forkX - 20, forkY + 150);
  ctx.moveTo(forkX - 15, forkY + 20);
  ctx.lineTo(forkX - 25, forkY + 70);
  ctx.moveTo(forkX - 5, forkY + 20);
  ctx.lineTo(forkX - 15, forkY + 70);
  ctx.moveTo(forkX + 5, forkY + 20);
  ctx.lineTo(forkX - 5, forkY + 70);
  ctx.stroke();
  
  // Knife
  const knifeX = width / 2 + 80;
  const knifeY = height - 300;
  ctx.beginPath();
  ctx.moveTo(knifeX, knifeY);
  ctx.lineTo(knifeX + 20, knifeY + 150);
  ctx.moveTo(knifeX - 5, knifeY + 20);
  ctx.lineTo(knifeX + 25, knifeY + 20);
  ctx.lineTo(knifeX + 30, knifeY + 70);
  ctx.lineTo(knifeX + 15, knifeY + 70);
  ctx.stroke();
};

// Draw travel-related visual elements
const drawTravelElements = (ctx, width, height, style) => {
  // Draw mountains
  ctx.beginPath();
  ctx.moveTo(0, height - 100);
  ctx.lineTo(width / 4, height - 300);
  ctx.lineTo(width / 2, height - 150);
  ctx.lineTo(3 * width / 4, height - 350);
  ctx.lineTo(width, height - 200);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fill();
  
  // Draw sun
  ctx.beginPath();
  ctx.arc(width - 150, 150, 80, 0, Math.PI * 2);
  ctx.fillStyle = style.accentColor;
  ctx.fill();
  
  // Draw airplane
  ctx.beginPath();
  ctx.moveTo(150, 150);
  ctx.lineTo(250, 100);
  ctx.lineTo(270, 100);
  ctx.lineTo(180, 170);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(200, 130);
  ctx.lineTo(220, 110);
  ctx.lineTo(250, 120);
  ctx.lineTo(220, 140);
  ctx.closePath();
  ctx.fill();
};

// Draw gaming-related visual elements
const drawGamingElements = (ctx, width, height, style) => {
  // Draw controller outline
  ctx.strokeStyle = style.accentColor;
  ctx.lineWidth = 5;
  
  // Main body
  ctx.beginPath();
  ctx.ellipse(width / 2, height - 200, 100, 60, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Left grip
  ctx.beginPath();
  ctx.ellipse(width / 2 - 120, height - 250, 40, 70, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();
  
  // Right grip
  ctx.beginPath();
  ctx.ellipse(width / 2 + 120, height - 250, 40, 70, -Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();
  
  // Buttons
  ctx.fillStyle = style.accentColor;
  ctx.beginPath();
  ctx.arc(width / 2 + 50, height - 200, 10, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(width / 2 + 80, height - 220, 10, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(width / 2 + 50, height - 240, 10, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(width / 2 + 20, height - 220, 10, 0, Math.PI * 2);
  ctx.fill();
  
  // D-pad
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(width / 2 - 60, height - 210, 40, 10);
  ctx.fillRect(width / 2 - 45, height - 225, 10, 40);
};

// Draw business-related visual elements
const drawBusinessElements = (ctx, width, height, style) => {
  // Draw a bar chart
  const barWidth = 60;
  const spacing = 20;
  const barX = width / 4;
  const chartHeight = 200;
  
  // Draw bars
  ctx.fillStyle = style.accentColor;
  
  // Bar 1
  const bar1Height = chartHeight * 0.5;
  ctx.fillRect(barX, height - 150 - bar1Height, barWidth, bar1Height);
  
  // Bar 2
  const bar2Height = chartHeight * 0.7;
  ctx.fillRect(barX + barWidth + spacing, height - 150 - bar2Height, barWidth, bar2Height);
  
  // Bar 3
  const bar3Height = chartHeight * 0.4;
  ctx.fillRect(barX + 2 * (barWidth + spacing), height - 150 - bar3Height, barWidth, bar3Height);
  
  // Bar 4
  const bar4Height = chartHeight * 0.9;
  ctx.fillRect(barX + 3 * (barWidth + spacing), height - 150 - bar4Height, barWidth, bar4Height);
  
  // Bar 5
  const bar5Height = chartHeight * 0.6;
  ctx.fillRect(barX + 4 * (barWidth + spacing), height - 150 - bar5Height, barWidth, bar5Height);
  
  // Draw x-axis
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(barX - 20, height - 150);
  ctx.lineTo(barX + 5 * (barWidth + spacing), height - 150);
  ctx.stroke();
  
  // Draw y-axis
  ctx.beginPath();
  ctx.moveTo(barX - 20, height - 150);
  ctx.lineTo(barX - 20, height - 150 - chartHeight);
  ctx.stroke();
  
  // Draw dollar sign
  ctx.font = 'bold 80px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillText('$', width - 150, 150);
};

// Draw beauty-related visual elements
const drawBeautyElements = (ctx, width, height, style) => {
  // Draw abstract makeup brush
  ctx.strokeStyle = style.accentColor;
  ctx.lineWidth = 5;
  
  // Brush handle
  ctx.beginPath();
  ctx.moveTo(width - 200, height - 100);
  ctx.lineTo(width - 300, height - 300);
  ctx.stroke();
  
  // Brush head
  ctx.beginPath();
  ctx.ellipse(width - 320, height - 330, 30, 15, Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fill();
  ctx.stroke();
  
  // Draw some makeup swatches
  const swatchSize = 40;
  const swatchY = 150;
  const colors = [
    'rgba(255, 182, 193, 0.7)',  // Pink
    'rgba(255, 0, 0, 0.7)',      // Red
    'rgba(255, 165, 0, 0.7)',    // Orange
    'rgba(218, 112, 214, 0.7)',  // Orchid
    'rgba(255, 20, 147, 0.7)'    // Deep pink
  ];
  
  for (let i = 0; i < colors.length; i++) {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.ellipse(150 + i * 70, swatchY, swatchSize, swatchSize / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw a compact mirror outline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2 + 100, 80, 0, Math.PI);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(width / 2, height / 2 + 100, 80, Math.PI, Math.PI * 2);
  ctx.stroke();
  
  // Mirror line
  ctx.beginPath();
  ctx.moveTo(width / 2 - 80, height / 2 + 100);
  ctx.lineTo(width / 2 + 80, height / 2 + 100);
  ctx.stroke();
};

// Draw general elements when no specific theme is detected
const drawGeneralElements = (ctx, width, height, style) => {
  // Draw play button for general video theme
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(width / 2 - 20, height / 2 - 30);
  ctx.lineTo(width / 2 + 30, height / 2);
  ctx.lineTo(width / 2 - 20, height / 2 + 30);
  ctx.closePath();
  ctx.fillStyle = style.accentColor;
  ctx.fill();
  
  // Draw corner accent
  ctx.fillStyle = style.accentColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(150, 0);
  ctx.lineTo(0, 150);
  ctx.closePath();
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  
  // Draw some random shapes for visual interest
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = style.accentColor + '40'; // 40% opacity
    ctx.beginPath();
    ctx.arc(
      Math.random() * width, 
      Math.random() * height, 
      10 + Math.random() * 40, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
  }
};
