# AI API Service

A powerful Express.js backend service for AI-powered features including speech-to-text and image recognition.

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

3. Start the development servers

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

## Available Scripts

- `npm run dev`: Start the frontend development server
- `npm run server`: Start the backend server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## Environment Variables

Create a `.env` file in the root directory with:
```
PORT=3000
NODE_ENV=development
```

## API Documentation

Access the Swagger documentation at:
- Local: http://localhost:3000/api-docs
- Production: https://your-production-url.com/api-docs

## Available Endpoints

- POST `/api/speech-to-text`: Convert speech to text
- POST `/api/image-recognition`: Recognize objects in images
- GET `/health`: Health check endpoint

## License

MIT