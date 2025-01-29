import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import serverless from 'serverless-http';
import cluster from 'cluster';
import os from 'os';
import { initializeModels } from './models/aiModels';
import { createAIRoutes } from './routes/aiRoutes';

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const app = express();

// Enhanced Middleware
app.use(cors());
app.use(compression()); // Compress responses
app.use(helmet()); // Security headers
app.use(limiter); // Rate limiting
app.use(express.json());
app.use(morgan('combined')); // Enhanced logging

// Initialize models and routes
let models: any = null;

const initializeApp = async () => {
  try {
    models = await initializeModels();
    app.use('/api', createAIRoutes(models));
    
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

  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

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
    initializeApp().then(() => {
      const PORT = process.env.PORT || 8080;
      app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started on port ${PORT}`);
      });
    });
  }
}

export default app;
