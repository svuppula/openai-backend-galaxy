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
let textGenerationPipeline: any;
let textSummarizationPipeline: any;
let sentimentAnalysisPipeline: any;
let translationPipeline: any;
let nerPipeline: any;
let questionAnsweringPipeline: any;
let objectDetectionPipeline: any;

const initializeModels = async () => {
  try {
    // Initialize all models
    speechToTextPipeline = await pipeline(
      "automatic-speech-recognition",
      "onnx-community/whisper-tiny.en"
    );

    imageRecognitionPipeline = await pipeline(
      "image-classification",
      "onnx-community/mobilenetv4_conv_small.e2400_r224_in1k"
    );

    textGenerationPipeline = await pipeline(
      "text-generation",
      "onnx-community/gpt2-tiny"
    );

    textSummarizationPipeline = await pipeline(
      "summarization",
      "onnx-community/bart-large-cnn"
    );

    sentimentAnalysisPipeline = await pipeline(
      "sentiment-analysis",
      "onnx-community/distilbert-base-uncased-finetuned-sst-2-english"
    );

    translationPipeline = await pipeline(
      "translation",
      "onnx-community/marian-base-ende"
    );

    nerPipeline = await pipeline(
      "token-classification",
      "onnx-community/bert-base-NER"
    );

    questionAnsweringPipeline = await pipeline(
      "question-answering",
      "onnx-community/distilbert-base-uncased-distilled-squad"
    );

    objectDetectionPipeline = await pipeline(
      "object-detection",
      "onnx-community/detr-resnet-50"
    );

    console.log('AI models initialized successfully');
  } catch (error) {
    console.error('Error initializing AI models:', error);
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 1. Speech-to-Text API
app.post('/api/speech-to-text', async (req, res) => {
  try {
    const { audioUrl } = req.body;
    if (!audioUrl) {
      return res.status(400).json({ error: 'Audio URL is required' });
    }
    const result = await speechToTextPipeline(audioUrl);
    res.json({ text: result.text });
  } catch (error) {
    res.status(500).json({ error: 'Speech-to-text processing failed' });
  }
});

// 2. Image Recognition API
app.post('/api/image-recognition', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    const result = await imageRecognitionPipeline(imageUrl);
    res.json({ predictions: result });
  } catch (error) {
    res.status(500).json({ error: 'Image recognition failed' });
  }
});

// 3. Text Generation API
app.post('/api/text-generation', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const result = await textGenerationPipeline(prompt);
    res.json({ generatedText: result[0].generated_text });
  } catch (error) {
    res.status(500).json({ error: 'Text generation failed' });
  }
});

// 4. Text Summarization API
app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await textSummarizationPipeline(text);
    res.json({ summary: result[0].summary_text });
  } catch (error) {
    res.status(500).json({ error: 'Text summarization failed' });
  }
});

// 5. Sentiment Analysis API
app.post('/api/sentiment', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await sentimentAnalysisPipeline(text);
    res.json({ sentiment: result[0] });
  } catch (error) {
    res.status(500).json({ error: 'Sentiment analysis failed' });
  }
});

// 6. Translation API
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }
    const result = await translationPipeline(text, { target_lang: targetLang });
    res.json({ translation: result[0].translation_text });
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' });
  }
});

// 7. Named Entity Recognition API
app.post('/api/ner', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await nerPipeline(text);
    res.json({ entities: result });
  } catch (error) {
    res.status(500).json({ error: 'Named entity recognition failed' });
  }
});

// 8. Question Answering API
app.post('/api/qa', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question || !context) {
      return res.status(400).json({ error: 'Question and context are required' });
    }
    const result = await questionAnsweringPipeline({
      question,
      context
    });
    res.json({ answer: result });
  } catch (error) {
    res.status(500).json({ error: 'Question answering failed' });
  }
});

// 9. Object Detection API
app.post('/api/object-detection', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    const result = await objectDetectionPipeline(imageUrl);
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