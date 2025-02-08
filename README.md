
# AI Text Generation API

A powerful Express.js backend service for AI-powered text generation using local Deepseek models.

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Ollama (for running local AI models)

## Installation

1. Install Ollama from https://ollama.ai/

2. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-text-generation-api
```

3. Install dependencies:
```bash
npm install
```

4. Start Ollama (in a separate terminal):
```bash
ollama serve
```

The first time you run the application, it will automatically download the required Deepseek model. This may take a few minutes depending on your internet connection.

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
  - Request body: `{ "text": "Text to summarize" }`
  - Response: `{ "summary": "Summarized text" }`

- POST `/api/text/generate`: Generate a script or story from a prompt
  - Request body: `{ "prompt": "Your creative prompt" }`
  - Response: `{ "script": "Generated story/script" }`

## Testing the APIs

1. Ensure Ollama is running (`ollama serve`)
2. Start the server (`npm run server`)
3. Open http://localhost:3000/api-docs in your browser
4. Use the Swagger UI to test each endpoint
5. Each endpoint accepts JSON payloads with the required parameters

## Error Handling

The API includes comprehensive error handling:
- 400: Bad Request (missing or invalid parameters)
- 500: Internal Server Error (model or processing errors)

All error responses include a descriptive message in the response body.

## Troubleshooting

1. If you get connection errors, ensure Ollama is running with:
```bash
ollama serve
```

2. If the model isn't responding, try restarting Ollama and the server

3. Check the server logs for detailed error messages

## License

MIT
