
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import serverless from 'serverless-http';
import { textRouter } from './routes/textRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import { mediaRouter } from './routes/mediaRoutes.js';
import { initializeModels } from './services/aiService.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Services API',
      version: '1.0.0',
      description: 'API documentation for AI text generation and media services',
    },
    servers: [
      {
        url: process.env.BASE_URL || `http://localhost:${PORT}`,
        description: 'API Server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));

// Initialize AI models
(async () => {
  try {
    console.log('Starting AI services...');
    const initialized = await initializeModels();
    if (initialized) {
      console.log('✅ AI models initialized successfully');
    } else {
      console.log('⚠️ Running with fallback AI features');
    }
  } catch (error) {
    console.error('Failed to initialize models:', error);
    console.log('⚠️ Running with fallback AI features');
  }
})();

// Routes
app.use('/api', textRouter);
app.use('/api', aiRouter);
app.use('/api', mediaRouter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', mode: 'serverless' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong! Please try again later.' 
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  });
}

// Export the serverless handler for AWS Lambda
export const handler = serverless(app);
