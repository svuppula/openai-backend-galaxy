
# Collaborators World API

A powerful serverless Express.js backend service for collaborative text generation, text-to-speech, image generation, and more. This application is designed to run independently without external services and can be deployed to AWS Lambda to serve millions of users.

## Features

- **Text Generation**: Create stories, scripts, and creative content from prompts
- **Text Summarization**: Condense long-form content
- **Text-to-Speech**: Convert text to audio output
- **Image Generation**: Create scenic images from text descriptions
- **Video & Animation Generation**: Generate video and animation content

## Technology Stack

- Node.js (v18+)
- Express.js
- Open Source AI Libraries
- Serverless Framework
- AWS Lambda

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- AWS account (for deployment)
- AWS CLI configured (for deployment)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd collaborators-world-api
```

2. Install dependencies:
```bash
npm install
```

## Running Locally

1. Start the development server:
```bash
npm run server
```

The application will be available at:
- API Server: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

## Available Endpoints

### Text Services
- **POST `/api/text/summarize`**: Summarize text using AI
  - Request body: `{ "text": "Text to summarize" }`
  - Response: `{ "summary": "Summarized text" }`

- **POST `/api/text/generate`**: Generate a script or story from a prompt
  - Request body: `{ "prompt": "Your creative prompt" }`
  - Response: `{ "script": "Generated story/script" }`

- **POST `/api/text/script-generation`**: Generate a script from a prompt (alias)
  - Request body: `{ "prompt": "Your creative prompt" }`
  - Response: `{ "script": "Generated script" }`

### Media Services
- **POST `/api/media/text-to-speech`**: Convert text to speech
  - Request body: `{ "text": "Text to convert" }`
  - Response: Audio file in ZIP format

- **POST `/api/media/generate-image`**: Generate scenic images from text
  - Request body: `{ "prompt": "Image description" }`
  - Response: Image files in ZIP format

- **POST `/api/media/generate-video`**: Generate video content
  - Request body: `{ "prompt": "Video description" }`
  - Response: Video file in ZIP format

- **POST `/api/media/generate-animation`**: Generate animation content
  - Request body: `{ "prompt": "Animation description" }`
  - Response: Animation file in ZIP format

### AI Services
- **POST `/api/ai/analyze`**: Analyze text content
  - Request body: `{ "text": "Text to analyze" }`
  - Response: `{ "analysis": "Analysis result" }`

- **POST `/api/ai/script-generation`**: Generate a script from a prompt
  - Request body: `{ "prompt": "Creative prompt" }`
  - Response: `{ "script": "Generated script" }`

## Testing the APIs

1. Start the server (`npm run server`)
2. Open http://localhost:3000/api-docs in your browser
3. Use the Swagger UI to test each endpoint
4. Each endpoint accepts JSON payloads with the required parameters

## Deploying to AWS Lambda

### Prerequisites for Deployment

1. Make sure you have an AWS account
2. Install and configure the AWS CLI:
```bash
aws configure
```

3. Install Serverless Framework globally:
```bash
npm install -g serverless
```

### Deployment Steps

1. Update the `serverless.yml` configuration if needed:
```bash
# No changes needed if using the included serverless.yml
```

2. Deploy to AWS Lambda:
```bash
serverless deploy
```

3. After deployment, you'll receive a URL for your API endpoint. The Swagger documentation will be available at `{your-api-url}/api-docs`.

### Scaling for Millions of Users

The application is designed to scale automatically with AWS Lambda:

1. **Auto-scaling**: AWS Lambda automatically scales based on the number of incoming requests
2. **Exception Handling**: The system provides proper error handling and feedback
3. **Efficient Resource Usage**: The serverless design ensures you only pay for what you use
4. **Reduced Cold Starts**: The application is optimized to minimize cold start times
5. **Logging & Monitoring**: Built-in logging helps track performance and issues

## Performance Optimization

For higher throughput and improved performance:

1. Use AWS Lambda Provisioned Concurrency to reduce cold starts:
```bash
serverless deploy --provisioned-concurrency 10
```

2. Increase memory allocation in `serverless.yml` for faster processing:
```yaml
provider:
  memorySize: 2048  # Increase from 1024 to 2048 MB for better performance
```

3. Configure AWS CloudFront as a CDN in front of your API for caching and global distribution.

## Troubleshooting

1. If endpoints return error messages, check CloudWatch logs:
```bash
serverless logs -f api
```

2. For local testing issues, check the server console for detailed error messages

3. If deployment fails, ensure your AWS credentials are properly configured

## License

MIT
