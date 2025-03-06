
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { v4: uuidv4 } = require('uuid');
const tf = require('@tensorflow/tfjs-node');
const axios = require('axios');
const { Canvas, Image } = require('canvas');
const fse = require('fs-extra');

// Initialize canvas
const registerFonts = () => {
  const fontPath = path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf');
  
  // Create the directory if it doesn't exist
  const fontDir = path.dirname(fontPath);
  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
  }
  
  // Download the font if it doesn't exist
  if (!fs.existsSync(fontPath)) {
    console.log('Downloading Roboto-Bold.ttf font...');
    const fontUrl = 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Bold.ttf';
    
    return axios({
      method: 'get',
      url: fontUrl,
      responseType: 'stream'
    })
      .then(response => {
        const writer = fs.createWriteStream(fontPath);
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
      })
      .then(() => {
        // Register font after successful download
        try {
          const { registerFont } = require('canvas');
          registerFont(fontPath, { family: 'Roboto', weight: 'bold' });
          console.log('Font registered successfully');
        } catch (err) {
          console.error('Error registering font:', err);
        }
      })
      .catch(err => {
        console.error('Error downloading font:', err);
      });
  } else {
    // Register existing font
    try {
      const { registerFont } = require('canvas');
      registerFont(fontPath, { family: 'Roboto', weight: 'bold' });
      console.log('Font registered successfully');
    } catch (err) {
      console.error('Error registering font:', err);
    }
    return Promise.resolve();
  }
};

// Call registerFonts at startup
registerFonts();

// Model cache
let textToImageModel = null;

// Load the text-to-image model (will use a pre-trained model from TensorFlow Hub)
async function loadModel() {
  if (!textToImageModel) {
    try {
      // Load the model from TensorFlow Hub (using a text-to-image model)
      const modelUrl = 'https://tfhub.dev/google/imagenet/mobilenet_v2_100_224/classification/5';
      textToImageModel = await tf.loadGraphModel(modelUrl, { fromTFHub: true });
      console.log('Text-to-image model loaded successfully');
    } catch (error) {
      console.error('Error loading text-to-image model:', error);
      throw new Error('Failed to load text-to-image model');
    }
  }
  return textToImageModel;
}

// Use Unsplash API for realistic images based on the prompt
async function getRealisticImageFromUnsplash(prompt) {
  try {
    // Clean the prompt for better search results
    const searchTerm = prompt.split(' ').slice(0, 3).join(' ');
    
    // Search Unsplash for images matching the prompt
    const unsplashResponse = await axios.get(`https://source.unsplash.com/1200x800/?${encodeURIComponent(searchTerm)}`);
    
    // The URL after redirects is the image URL
    return unsplashResponse.request.res.responseUrl;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    throw new Error('Failed to fetch realistic image');
  }
}

// Generate thumbnails from text prompt
async function generateThumbnails(prompt, count = 3) {
  // Create a unique job ID for this generation
  const jobId = uuidv4();
  const tempDir = path.join(__dirname, '../../temp', jobId);

  try {
    // Create temporary directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate multiple images for the same prompt
    const imagePromises = [];
    for (let i = 0; i < count; i++) {
      imagePromises.push(generateSingleThumbnail(prompt, i, tempDir));
    }

    // Wait for all images to be generated
    await Promise.all(imagePromises);

    // Create a zip file with all generated images
    const zipPath = path.join(tempDir, 'thumbnails.zip');
    const zip = new AdmZip();
    
    // Add each image to the zip
    const files = fs.readdirSync(tempDir);
    for (const file of files) {
      if (file.endsWith('.jpg') || file.endsWith('.png')) {
        const filePath = path.join(tempDir, file);
        zip.addLocalFile(filePath);
      }
    }
    
    // Write the zip file
    zip.writeZip(zipPath);
    
    // Return the path to the zip file
    return zipPath;
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    throw error;
  }
}

// Generate a single thumbnail
async function generateSingleThumbnail(prompt, index, tempDir) {
  try {
    // Get a realistic image URL from Unsplash based on the prompt
    const imageUrl = await getRealisticImageFromUnsplash(prompt);
    
    // Download the image
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'arraybuffer'
    });
    
    // Save the image to the temp directory
    const imagePath = path.join(tempDir, `thumbnail_${index + 1}.jpg`);
    fs.writeFileSync(imagePath, response.data);
    
    // Load the image into canvas to add text overlay
    const image = new Image();
    const buffer = fs.readFileSync(imagePath);
    image.src = buffer;
    
    // Create canvas with the image dimensions
    const canvas = new Canvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0, image.width, image.height);
    
    // Add text overlay with the prompt
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, image.height - 100, image.width, 100);
    
    ctx.font = '30px Roboto';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt, 
                image.width / 2, image.height - 40);
    
    // Save the modified image
    const buffer2 = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(imagePath, buffer2);
    
    return imagePath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
}

// Clean up temporary files
function cleanupTempFiles(jobId) {
  const tempDir = path.join(__dirname, '../../temp', jobId);
  if (fs.existsSync(tempDir)) {
    fse.removeSync(tempDir);
  }
}

module.exports = {
  generateThumbnails,
  cleanupTempFiles,
  loadModel
};
