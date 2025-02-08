
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { textRouter } from './routes/textRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import { initializeModels } from './services/aiService.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Text Generation API',
      version: '1.0.0',
      description: 'API documentation for AI text generation services',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize AI models
(async () => {
  try {
    const initialized = await initializeModels();
    if (!initialized) {
      console.log('⚠️ Running in fallback mode. To enable AI features:');
      console.log('1. Install Ollama from https://ollama.ai');
      console.log('2. Run: ollama serve');
      console.log('3. Restart this server');
    }
  } catch (error) {
    console.error('Failed to initialize models:', error);
    console.log('⚠️ Running in fallback mode');
  }
})();

// Routes
app.use('/api', textRouter);
app.use('/api', aiRouter); // Mount AI routes

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong! Please try again later.' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;
