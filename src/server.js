import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { textRouter } from './routes/textRoutes.js';
import { mediaRouter } from './routes/mediaRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

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

app.use(cors());
app.use(compression());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/text', textRouter);
app.use('/api/media', mediaRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;