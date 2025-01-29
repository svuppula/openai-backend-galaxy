import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { pipeline } from '@huggingface/transformers';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize AI models
let speechToTextPipeline: any;
let imageRecognitionPipeline: any;

const initializeModels = async () => {
  try {
    // Initialize Speech-to-Text
    speechToTextPipeline = await pipeline(
      "automatic-speech-recognition",
      "onnx-community/whisper-tiny.en"
    );

    // Initialize Image Recognition
    imageRecognitionPipeline = await pipeline(
      "image-classification",
      "onnx-community/mobilenetv4_conv_small.e2400_r224_in1k"
    );

    console.log('AI models initialized successfully');
  } catch (error) {
    console.error('Error initializing AI models:', error);
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Speech-to-Text endpoint
app.post('/api/speech-to-text', async (req, res) => {
  try {
    const { audioUrl } = req.body;
    if (!audioUrl) {
      return res.status(400).json({ error: 'Audio URL is required' });
    }

    const result = await speechToTextPipeline(audioUrl);
    res.json({ text: result.text });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ error: 'Speech-to-text processing failed' });
  }
});

// Image Recognition endpoint
app.post('/api/image-recognition', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const result = await imageRecognitionPipeline(imageUrl);
    res.json({ predictions: result });
  } catch (error) {
    console.error('Image recognition error:', error);
    res.status(500).json({ error: 'Image recognition processing failed' });
  }
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    version: '1.0.0',
    endpoints: {
      health: {
        method: 'GET',
        path: '/api/health',
        description: 'Check API health status'
      },
      speechToText: {
        method: 'POST',
        path: '/api/speech-to-text',
        description: 'Convert speech to text',
        body: { audioUrl: 'string' }
      },
      imageRecognition: {
        method: 'POST',
        path: '/api/image-recognition',
        description: 'Recognize objects in images',
        body: { imageUrl: 'string' }
      }
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize models and start server
initializeModels().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;