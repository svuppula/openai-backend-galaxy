import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import NodeCache from 'node-cache';
import { aiRouter } from './routes/aiRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize cache
const cache = new NodeCache({ 
  stdTTL: 3600,
  checkperiod: 120
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI API Service',
      version: '1.0.0',
      description: 'API documentation for AI services',
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
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.use('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// AI Routes
app.use('/api', aiRouter);

// Start server
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  });
}

export default app;