import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import serverless from 'serverless-http';
import cluster from 'cluster';
import os from 'os';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { initializeModels } from './models/aiModels';
import { createAIRoutes } from './routes/aiRoutes';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI API Service',
      version: '1.0.0',
      description: 'API documentation for AI services including speech-to-text and image recognition',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-url.com' 
          : 'http://localhost:8080',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
  },
  apis: ['./src/server/routes/*.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const app = express();

// Enhanced Middleware
app.use(cors());
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false // This is needed for Swagger UI to work properly
}));
app.use(limiter);
app.use(express.json());
app.use(morgan('combined'));

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize models and routes
let models: any = null;

const initializeApp = async () => {
  try {
    models = await initializeModels();
    app.use('/api', createAIRoutes(models));
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy' });
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
  if (cluster.isPrimary || cluster.isMaster) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    initializeApp().then(() => {
      const PORT = process.env.PORT || 8080;
      app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started on port ${PORT}`);
      });
    });
  }
}

export default app;