
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';
import fs from 'fs-extra';

// Import routes
import { router as mediaRoutes } from './routes/mediaRoutes.js';
import { router as aiRoutes } from './routes/aiRoutes.js';
import { router as textRoutes } from './routes/textRoutes.js';

// ES Module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Disabled to allow Swagger UI to work properly
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('combined'));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all routes
app.use(apiLimiter);

// Create temp directory if it doesn't exist
const tempDir = process.env.TEMP_DIR || './temp';
fs.ensureDirSync(tempDir);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Collaborators World API Documentation',
      version: '1.0.0',
      description: 'Documentation for the Collaborators World Media API',
      contact: {
        name: 'API Support',
        email: 'support@collaboratorsworld.com'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        TextToSpeechRequest: {
          type: 'object',
          required: ['text', 'voice'],
          properties: {
            text: {
              type: 'string',
              description: 'The text to convert to speech'
            },
            voice: {
              type: 'string',
              description: 'The voice ID to use for text-to-speech'
            }
          }
        },
        ImageGenerationRequest: {
          type: 'object',
          required: ['prompt'],
          properties: {
            prompt: {
              type: 'string',
              description: 'The prompt to use for image generation'
            }
          }
        },
        VideoGenerationRequest: {
          type: 'object',
          required: ['prompt'],
          properties: {
            prompt: {
              type: 'string',
              description: 'The prompt to use for video generation'
            }
          }
        },
        AnimationGenerationRequest: {
          type: 'object',
          required: ['prompt'],
          properties: {
            prompt: {
              type: 'string',
              description: 'The prompt to use for animation generation'
            }
          }
        },
        VoiceCloneRequest: {
          type: 'object',
          required: ['name', 'audioUrl'],
          properties: {
            name: {
              type: 'string',
              description: 'The name to give to the cloned voice'
            },
            audioUrl: {
              type: 'string',
              description: 'URL to the audio file to clone'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
app.use('/api/media', mediaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/text', textRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server (if not being run via serverless)
if (!process.env.SERVERLESS) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for serverless
export const handler = serverless(app);
export default app;
