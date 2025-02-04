const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const NodeCache = require('node-cache');

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

// Cache middleware
const cacheMiddleware = (req, res, next) => {
  if (req.method !== 'GET') return next();
  
  const key = req.originalUrl;
  const cachedResponse = cache.get(key);
  
  if (cachedResponse) {
    return res.json(cachedResponse);
  }
  next();
};

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// AI Routes
app.post('/api/speech-to-text', cacheMiddleware, async (req, res) => {
  try {
    const { audioUrl } = req.body;
    if (!audioUrl) {
      return res.status(400).json({ error: 'Audio URL is required' });
    }
    // Mock response for demo
    const result = { text: "Speech to text conversion result" };
    cache.set(req.originalUrl, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Speech-to-text processing failed' });
  }
});

app.post('/api/image-recognition', cacheMiddleware, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    // Mock response for demo
    const result = { objects: ["object1", "object2"] };
    cache.set(req.originalUrl, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Image recognition failed' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;