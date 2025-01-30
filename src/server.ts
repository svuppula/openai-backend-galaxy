import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { initializeModels } from './server/models/aiModels';
import { createAIRoutes } from './server/routes/aiRoutes';

const app = express();
const PORT = process.env.PORT || 8080;

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
  apis: ['./src/server/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.json());
app.use(morgan('combined'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize models and routes
const init = async () => {
  try {
    const models = await initializeModels();
    app.use('/api', createAIRoutes(models));
    
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy' });
    });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

init();