
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import serverless from 'serverless-http';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Import route modules
import { textRouter } from './routes/textRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import { mediaRouter } from './routes/mediaRoutes.js';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), 'temp');
fs.ensureDirSync(tempDir);

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Collaborators World API',
      version: '1.0.0',
      description: 'API documentation for collaborative text generation and media services',
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

// Static files
app.use(express.static(path.join(__dirname, '../public')));

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
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message || 'Something went wrong! Please try again later.' 
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  });
}

// Cleanup function for temp directory
const cleanupTempFiles = () => {
  try {
    const files = fs.readdirSync(tempDir);
    const currentTime = new Date().getTime();
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = currentTime - stats.mtime.getTime();
      
      // Remove files older than 1 hour (3600000 ms)
      if (fileAge > 3600000) {
        fs.removeSync(filePath);
      }
    });
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

// Set up periodic cleanup
setInterval(cleanupTempFiles, 3600000); // Run every hour

// Export the serverless handler for AWS Lambda
export const handler = serverless(app);
