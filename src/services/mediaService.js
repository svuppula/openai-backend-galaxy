import { pipeline } from '@huggingface/transformers';

let speechPipeline;
let imagePipeline;

const initializeMediaModels = async () => {
  try {
    speechPipeline = await pipeline('text-to-speech', 'facebook/fastspeech2-en-ljspeech');
    imagePipeline = await pipeline('text-to-image', 'stabilityai/stable-diffusion-2');
    console.log('Media models initialized successfully');
  } catch (error) {
    console.error('Failed to initialize media models:', error);
    throw error;
  }
};

export const textToSpeech = async (text) => {
  if (!speechPipeline) await initializeMediaModels();
  return await speechPipeline(text);
};

export const textToImage = async (prompt) => {
  if (!imagePipeline) await initializeMediaModels();
  return await imagePipeline(prompt);
};