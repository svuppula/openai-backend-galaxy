
# AI API Service

A powerful Express.js backend service for AI-powered features using local Deepseek models.

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Ollama (for running local AI models)

## Installation

1. Install Ollama from https://ollama.ai/

2. Pull the Deepseek model:
```bash
ollama pull deepseek-coder:6.7b
```

3. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-api-service
```

4. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start Ollama service (in a separate terminal):
```bash
ollama serve
```

2. Start the development server:
```bash
npm run server
```

The application will be available at:
- API Server: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

## Available Endpoints

### Text Services
- POST `/api/text-summarization`: Summarize text using AI
- POST `/api/script-generation`: Generate a script from a prompt

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
