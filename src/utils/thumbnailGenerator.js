
import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register fonts - make sure the font file exists
try {
  const fontPath = path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf');
  registerFont(fontPath, { family: 'Roboto', weight: 'bold' });
} catch (error) {
  console.warn('Font registration failed:', error.message);
  // Continue even if font registration fails
}

// Collection of realistic sample images for different contexts
const sampleImages = {
  nature: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb', // Mountains
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470', // Landscape
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', // Forest
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', // Beach
    'https://images.unsplash.com/photo-1546514355-7fdc90ccbd03'  // Lake
  ],
  urban: [
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df', // City skyline
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b', // City street
    'https://images.unsplash.com/photo-1517935706615-2717063c2225', // Night city
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', // Modern buildings
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9'  // City view
  ],
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475', // Tech devices
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', // Code/digital
    'https://images.unsplash.com/photo-1518770660439-4636190af475', // Computer/tech
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa', // Abstract tech
    'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f'  // Bitcoin/crypto
  ],
  business: [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf', // Business meeting
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab', // Office building
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f', // Business charts
    'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a', // Workspace
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a'  // Business person
  ],
  sports: [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635', // Running
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5', // Ball sports
    'https://images.unsplash.com/photo-1517649763962-0c623066013b', // Basketball
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d', // Stadium
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211'  // Sports equipment
  ],
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836', // Meal spread
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352', // Fruit
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', // Pizza
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe', // Vegetables
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445'  // Dessert
  ],
  "video frame": [
    'https://images.unsplash.com/photo-1485846234645-a62644f84728', // Video gear
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4', // Film frame
    'https://images.unsplash.com/photo-1520483601560-389dff434fdf', // Film/cinema
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26', // Spotlight
    'https://images.unsplash.com/photo-1543536448-d209d2d13a1c'  // Camera lens
  ],
  "animation frame": [
    'https://images.unsplash.com/photo-1633350036554-2f91ea79a3e3', // Cartoon style
    'https://images.unsplash.com/photo-1605710345595-541b88b95ab6', // Animation 
    'https://images.unsplash.com/photo-1633976976526-aee3ae2be796', // Animated character
    'https://images.unsplash.com/photo-1595491542937-3de00ac7e01a', // 3D animation 
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85'  // Animation workspace
  ]
};

// Color schemes for different thumbnail styles
const colorSchemes = {
  vibrant: {
    background: '#FF5722',
    text: '#FFFFFF',
    highlight: '#FFEB3B',
    accent: '#2196F3'
  },
  minimal: {
    background: '#FFFFFF',
    text: '#212121',
    highlight: '#BDBDBD',
    accent: '#607D8B'
  },
  dark: {
    background: '#212121',
    text: '#FFFFFF',
    highlight: '#FFC107',
    accent: '#4CAF50'
  },
  tech: {
    background: '#0D47A1',
    text: '#FFFFFF',
    highlight: '#00E5FF',
    accent: '#F50057'
  },
  nature: {
    background: '#2E7D32',
    text: '#FFFFFF',
    highlight: '#FFC107',
    accent: '#29B6F6'
  },
  elegant: {
    background: '#37474F',
    text: '#ECEFF1',
    highlight: '#FFAB00',
    accent: '#5C6BC0'
  },
  realistic: {
    background: 'rgba(0, 0, 0, 0.5)',
    text: '#FFFFFF',
    highlight: '#FFC107',
    accent: '#4CAF50'
  },
  animation: {
    background: 'rgba(41, 98, 255, 0.7)',
    text: '#FFFFFF',
    highlight: '#FF9800',
    accent: '#E91E63'
  }
};

// Helper function to identify keywords in text and select appropriate context
function analyzeTextForContext(text) {
  const keywords = {
    nature: ['nature', 'mountain', 'forest', 'beach', 'lake', 'river', 'ocean', 'landscape', 'wildlife', 'tree', 'plant', 'flower', 'sunset', 'sunrise'],
    urban: ['city', 'urban', 'street', 'building', 'architecture', 'skyline', 'downtown', 'metropolis'],
    technology: ['tech', 'technology', 'digital', 'computer', 'software', 'hardware', 'programming', 'code', 'app', 'application', 'smartphone', 'device', 'gadget', 'bitcoin', 'crypto', 'blockchain'],
    business: ['business', 'finance', 'professional', 'corporate', 'entrepreneur', 'startup', 'office', 'meeting', 'marketing', 'management'],
    sports: ['sport', 'sports', 'fitness', 'workout', 'exercise', 'athletic', 'game', 'match', 'player', 'team', 'competition'],
    food: ['food', 'cooking', 'recipe', 'meal', 'restaurant', 'kitchen', 'chef', 'cuisine', 'dish', 'baking', 'delicious', 'taste', 'flavor']
  };

  const textLower = text.toLowerCase();
  
  // Count keyword matches for each context
  const contextScores = {};
  
  for (const [context, contextKeywords] of Object.entries(keywords)) {
    contextScores[context] = 0;
    for (const keyword of contextKeywords) {
      if (textLower.includes(keyword)) {
        contextScores[context] += 1;
      }
    }
  }
  
  // Find the context with the highest score
  let bestContext = 'technology'; // Default context
  let highestScore = 0;
  
  for (const [context, score] of Object.entries(contextScores)) {
    if (score > highestScore) {
      highestScore = score;
      bestContext = context;
    }
  }
  
  return bestContext;
}

/**
 * Creates a YouTube thumbnail based on the provided text
 * @param {string} text - The text to display on the thumbnail
 * @param {Object} options - Options for thumbnail generation
 * @param {string} options.style - Style of the thumbnail (vibrant, minimal, dark, tech, nature, elegant)
 * @param {string} options.context - Context for the thumbnail (nature, urban, technology, etc.)
 * @param {string} options.outputPath - Path to save the thumbnail
 * @param {number} options.width - Width of the thumbnail (default: 1280)
 * @param {number} options.height - Height of the thumbnail (default: 720)
 * @returns {Promise<Object>} - Information about the generated thumbnail
 */
async function createYouTubeThumbnail(text, options = {}) {
  // Set default options
  const style = options.style || 'vibrant';
  let context = options.context;
  if (!context) {
    context = analyzeTextForContext(text);
  }
  const width = options.width || 1280;
  const height = options.height || 720;
  const tempDir = path.join(process.cwd(), 'temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Set output path or generate one
  const outputPath = options.outputPath || path.join(tempDir, `thumbnail-${uuidv4()}.png`);
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Get color scheme
  const colors = colorSchemes[style] || colorSchemes.vibrant;
  
  // Start with a plain background
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);
  
  try {
    // Choose a random realistic image based on context
    let imageList = sampleImages[context];
    if (!imageList) {
      imageList = sampleImages.technology; // Default to technology if context not found
    }
    
    const randomImageUrl = imageList[Math.floor(Math.random() * imageList.length)];
    const backgroundImage = await loadImage(`${randomImageUrl}?w=${width}&h=${height}&fit=crop&q=80`);
    
    // Draw background image
    ctx.drawImage(backgroundImage, 0, 0, width, height);
    
    // Add semi-transparent overlay to make text more readable
    ctx.fillStyle = colors.background;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1.0;
    
    // Draw text
    ctx.fillStyle = colors.text;
    
    // Break text into multiple lines if needed
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    const maxLineWidth = width * 0.8;
    
    // Use a dynamic font size based on text length
    let fontSize = 68;
    if (text.length > 50) {
      fontSize = 54;
    }
    if (text.length > 80) {
      fontSize = 44;
    }
    if (text.length > 120) {
      fontSize = 38;
    }
    
    ctx.font = `bold ${fontSize}px 'Roboto', sans-serif`;
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxLineWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Calculate total text height
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    
    // Position text in the center
    let y = (height - totalTextHeight) / 2 + fontSize;
    
    // Draw text with highlight/shadow for better visibility
    ctx.textAlign = 'center';
    
    // Add shadow/outline for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    
    for (const line of lines) {
      ctx.fillText(line, width / 2, y);
      y += lineHeight;
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Add a highlight line or accent element for design
    ctx.fillStyle = colors.highlight;
    ctx.fillRect(width / 2 - 100, height - 100, 200, 8);
    
    // Add a visual indicator of the context in the corner
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(150, 0);
    ctx.lineTo(0, 150);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 24px "Roboto", sans-serif';
    ctx.save();
    ctx.translate(30, 60);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(context.toUpperCase(), 0, 0);
    ctx.restore();
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    return {
      path: outputPath,
      width,
      height,
      style,
      context
    };
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    
    // Fallback to a simple thumbnail if image loading fails
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 48px "Roboto", sans-serif';
    
    // Draw text with word wrap
    const words = text.split(' ');
    let line = '';
    let lines = [];
    const maxLineWidth = width * 0.8;
    const lineHeight = 60;
    
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxLineWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    
    if (line) {
      lines.push(line);
    }
    
    const totalTextHeight = lines.length * lineHeight;
    let y = (height - totalTextHeight) / 2;
    
    for (const line of lines) {
      ctx.fillText(line, width / 2, y + lineHeight / 2);
      y += lineHeight;
    }
    
    // Save the fallback image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    return {
      path: outputPath,
      width,
      height,
      style,
      context,
      fallback: true
    };
  }
}

export default createYouTubeThumbnail;
