# AI API Service

A powerful Express.js backend service for AI-powered features including text summarization, script generation, and media generation.

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-api-service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
PORT=3000
NODE_ENV=development
```

## Running the Application

1. Start the development server:
```bash
npm run server
```

The application will be available at:
- API Server: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

## Available Endpoints

### Text Services
- POST `/api/text/summarize`: Summarize text using AI
- POST `/api/text/generate-script`: Generate a script from a prompt

### Media Services
- POST `/api/media/text-to-speech`: Convert text to speech
- POST `/api/media/text-to-image`: Generate images from text descriptions

## Testing the APIs

1. Open http://localhost:3000/api-docs in your browser
2. Use the Swagger UI to test each endpoint
3. Each endpoint accepts JSON payloads with the required parameters

## Error Handling

The API includes comprehensive error handling:
- Input validation
- Model initialization errors
- Processing errors

## Caching

The service includes automatic caching for all endpoints to improve performance.

## License

MIT