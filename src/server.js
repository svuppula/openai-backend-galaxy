
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';

// Import routes
import mediaRouter from './routes/mediaRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import textRoutes from './routes/textRoutes.js';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for simplicity in dev
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after a minute'
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Static directory for temporary files
app.use('/temp', express.static(path.join(process.cwd(), 'temp')));

// API routes
app.use('/', mediaRouter);
app.use('/', aiRoutes);
app.use('/', textRoutes);

// Swagger documentation endpoint
app.get('/api-docs', (req, res) => {
  res.send('API Documentation');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Default error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Start server if not running in serverless environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for serverless deployment
export const handler = serverless(app);
