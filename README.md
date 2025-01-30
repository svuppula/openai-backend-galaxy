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

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
```

## API Documentation

Once the server is running, access the Swagger documentation at:
- Local: http://localhost:8080/api-docs
- Production: https://your-production-url.com/api-docs

## Available Endpoints

- POST `/api/speech-to-text`: Convert speech to text
- POST `/api/image-recognition`: Recognize objects in images
- GET `/health`: Health check endpoint

For detailed API documentation and testing, use the Swagger UI interface at `/api-docs`.

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy to AWS Lambda
npm run deploy
```

## Environment Variables

Required environment variables:
- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment ('development' or 'production')

## License

MIT