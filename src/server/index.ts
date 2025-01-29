import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { pipeline } from '@huggingface/transformers';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import serverless from 'serverless-http';
import { createClient } from 'redis';
import cluster from 'cluster';
import os from 'os';

// Initialize Redis client for caching
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const app = express();
const PORT = process.env.PORT || 8080;

// Enhanced Middleware
app.use(cors());
app.use(compression()); // Compress responses
app.use(helmet()); // Security headers
app.use(limiter); // Rate limiting
app.use(express.json());
app.use(morgan('combined')); // Enhanced logging

// Initialize AI models with caching
let models = {
  speechToText: null,
  imageRecognition: null,
  textGeneration: null,
  textSummarization: null,
  sentimentAnalysis: null,
  translation: null,
  ner: null,
  questionAnswering: null,
  objectDetection: null
};

const initializeModels = async () => {
  try {
    models = {
      speechToText: await pipeline("automatic-speech-recognition", "onnx-community/whisper-tiny.en"),
      imageRecognition: await pipeline("image-classification", "onnx-community/mobilenetv4_conv_small.e2400_r224_in1k"),
      textGeneration: await pipeline("text-generation", "onnx-community/gpt2-tiny"),
      textSummarization: await pipeline("summarization", "onnx-community/bart-large-cnn"),
      sentimentAnalysis: await pipeline("sentiment-analysis", "onnx-community/distilbert-base-uncased-finetuned-sst-2-english"),
      translation: await pipeline("translation", "onnx-community/marian-base-ende"),
      ner: await pipeline("token-classification", "onnx-community/bert-base-NER"),
      questionAnswering: await pipeline("question-answering", "onnx-community/distilbert-base-uncased-distilled-squad"),
      objectDetection: await pipeline("object-detection", "onnx-community/detr-resnet-50")
    };
    console.log('AI models initialized successfully');
  } catch (error) {
    console.error('Error initializing AI models:', error);
  }
};

// Cache middleware
const cache = async (req, res, next) => {
  try {
    const key = req.originalUrl;
    const cachedResponse = await redisClient.get(key);
    
    if (cachedResponse) {
      return res.json(JSON.parse(cachedResponse));
    }
    
    next();
  } catch (error) {
    next();
  }
};

// API endpoints with caching and error handling
app.post('/api/speech-to-text', cache, async (req, res) => {
  try {
    const { audioUrl } = req.body;
    if (!audioUrl) {
      return res.status(400).json({ error: 'Audio URL is required' });
    }
    const result = await models.speechToText(audioUrl);
    await redisClient.set(req.originalUrl, JSON.stringify(result), 'EX', 3600);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Speech-to-text processing failed' });
  }
});

// 2. Image Recognition API
app.post('/api/image-recognition', cache, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    const result = await models.imageRecognition(imageUrl);
    await redisClient.set(req.originalUrl, JSON.stringify(result), 'EX', 3600);
    res.json({ predictions: result });
  } catch (error) {
    res.status(500).json({ error: 'Image recognition failed' });
  }
});

// 3. Text Generation API
app.post('/api/text-generation', cache, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const result = await models.textGeneration(prompt);
    await redisClient.set(req.originalUrl, JSON.stringify(result), 'EX', 3600);
    res.json({ generatedText: result[0].generated_text });
  } catch (error) {
    res.status(500).json({ error: 'Text generation failed' });
  }
});

// 4. Text Summarization API
app.post('/api/summarize', cache, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await models.textSummarization(text);
    await redisClient.set(req.originalUrl, JSON.stringify(result), 'EX', 3600);
    res.json({ summary: result[0].summary_text });
  } catch (error) {
    res.status(500).json({ error: 'Text summarization failed' });
  }
});

// 5. Sentiment Analysis API
app.post('/api/sentiment', cache, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await models.sentimentAnalysis(text);
    await redisClient.set(req.originalUrl, JSON.stringify(result), 'EX', 3600);
    res.json({ sentiment: result[0] });
  } catch (error) {
    res.status(500).json({ error: 'Sentiment analysis failed' });
  }
});

// 6. Translation API
app.post('/api/translate', cache, async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }
    const result = await models.translation(text, { target_lang: targetLang });
    await redisClient.set(req.originalUrl, JSON.stringify(result), 'EX', 3600);
    res.json({ translation: result[0].translation_text });
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' });
  }
});

// 7. Named Entity Recognition API
app.post('/api/ner', cache, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await models.ner(text);
    await redisClient.set(req.originalUrl, JSON.stringify(result), 'EX', 3600);
    res.json({ entities: result });
  } catch (error) {
    res.status(500).json({ error: 'Named entity recognition failed' });
  }
});

// 8. Question Answering API
app.post('/api/qa', cache, async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question || !context) {
      return res.status(400).json({ error: 'Question and context are required' });
    }
    const result = await models.questionAnswering({
      question,
      context
    });
    await redisClient.set(req.originalUrl, JSON.stringify(result), 'EX', 3600);
    res.json({ answer: result });
  } catch (error) {
    res.status(500).json({ error: 'Question answering failed' });
  }
});

// 9. Object Detection API
app.post('/api/object-detection', cache, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    const result = await models.objectDetection(imageUrl);
    await redisClient.set(req.originalUrl, JSON.stringify(result), 'EX', 3600);
    res.json({ objects: result });
  } catch (error) {
    res.status(500).json({ error: 'Object detection failed' });
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
      },
      textGeneration: {
        method: 'POST',
        path: '/api/text-generation',
        description: 'Generate text from prompt',
        body: { prompt: 'string' }
      },
      summarization: {
        method: 'POST',
        path: '/api/summarize',
        description: 'Summarize text',
        body: { text: 'string' }
      },
      sentiment: {
        method: 'POST',
        path: '/api/sentiment',
        description: 'Analyze text sentiment',
        body: { text: 'string' }
      },
      translation: {
        method: 'POST',
        path: '/api/translate',
        description: 'Translate text',
        body: { text: 'string', targetLang: 'string' }
      },
      ner: {
        method: 'POST',
        path: '/api/ner',
        description: 'Named Entity Recognition',
        body: { text: 'string' }
      },
      qa: {
        method: 'POST',
        path: '/api/qa',
        description: 'Question Answering',
        body: { question: 'string', context: 'string' }
      },
      objectDetection: {
        method: 'POST',
        path: '/api/object-detection',
        description: 'Detect objects in images',
        body: { imageUrl: 'string' }
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// AWS Lambda handler
const handler = serverless(app);
export { handler };

// Start server based on environment
if (process.env.NODE_ENV !== 'lambda') {
  if (cluster.isMaster) {
    // Create a worker for each CPU
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork(); // Replace the dead worker
    });
  } else {
    // Workers share the TCP connection
    initializeModels().then(() => {
      app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started on port ${PORT}`);
      });
    });
  }
}

export default app;
