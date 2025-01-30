# AI API Service

A powerful Express.js backend service for AI-powered features including speech-to-text and image recognition.

## Features

- Speech to Text conversion
- Image Recognition
- Swagger API Documentation
- Caching with Node-Cache
- Rate Limiting
- AWS Lambda ready
- Clustering for improved performance

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# For production
npm start
```

## API Documentation

Once the server is running, visit:
- Local: http://localhost:8080/api-docs
- Production: https://your-production-url.com/api-docs

## Available Endpoints

- POST `/api/speech-to-text`: Convert speech to text
- POST `/api/image-recognition`: Recognize objects in images
- GET `/health`: Health check endpoint

For detailed API documentation and testing, please use the Swagger UI interface.

## Deployment

This service is configured for AWS Lambda deployment using the Serverless framework:

```bash
# Deploy to AWS Lambda
npm run deploy
```

## Environment Variables

- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment ('development' or 'production')

## Performance

The service includes:
- Response caching
- Rate limiting
- Multi-core utilization through clustering
- Compression
- Security headers

## License

MIT