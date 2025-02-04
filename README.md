# AI API Service

A powerful Express.js backend service for AI-powered features including speech-to-text and image recognition.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Quick Start

1. Clone the repository
```bash
git clone <your-repo-url>
cd ai-api-service
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
PORT=3000
NODE_ENV=development
```

4. Start the development servers

In one terminal, start the frontend:
```bash
npm run dev
```

In another terminal, start the backend:
```bash
npm run server
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

## Important Note

Before running the application, make sure to add the following scripts to your package.json:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "server": "nodemon src/server.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run server\""
  }
}
```

## Available Endpoints

- POST `/api/speech-to-text`: Convert speech to text
- POST `/api/image-recognition`: Recognize objects in images
- GET `/health`: Health check endpoint

## License

MIT