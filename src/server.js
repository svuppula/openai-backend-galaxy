
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import serverless from 'serverless-http';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mediaRoutes from './routes/mediaRoutes.js';
import textRoutes from './routes/textRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create temp directory for file storage
app.use('/temp', express.static(join(__dirname, '../temp')));

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Collaborators World API',
      version: '1.0.0',
      description: 'API for media generation and manipulation',
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
app.use('/media', mediaRoutes);
app.use('/text', textRoutes);
app.use('/ai', aiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Collaborators World API',
    documentation: '/api-docs',
    endpoints: {
      media: '/media',
      text: '/text',
      ai: '/ai'
    }
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API documentation available at http://localhost:${port}/api-docs`);
  });
}

// Export for serverless use
export const handler = serverless(app);
export default app;
