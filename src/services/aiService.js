import { Ollama } from 'ollama-node';
import { pipeline } from '@huggingface/transformers';

const ollama = new Ollama();

export const initializeModels = async () => {
  try {
    console.log('Initializing AI models...');
    
    // Initialize local models
    await ollama.create({
      name: 'deepseek-r1',
      model: 'deepseek-coder:6.7b',
      options: {
        temperature: 0.7,
        top_p: 0.9
      }
    });

    // Initialize HuggingFace pipelines
    const textToSpeech = await pipeline('text-to-speech', 'microsoft/speecht5_tts');
    const textToImage = await pipeline('text-to-image', 'stabilityai/stable-diffusion-2');
    const textToVideo = await pipeline('text-to-video', 'damo-vilab/text-to-video-ms-1.7b');

    return {
      ollama,
      textToSpeech,
      textToImage,
      textToVideo
    };
  } catch (error) {
    console.error('Error initializing models:', error);
    throw error;
  }
};

export const summarizeText = async (text) => {
  try {
    const response = await ollama.generate({
      model: 'deepseek-r1',
      prompt: `Summarize the following text:\n${text}`,
      max_tokens: 500
    });
    return response.text;
  } catch (error) {
    console.error('Text summarization error:', error);
    throw error;
  }
};

export const generateScript = async (prompt) => {
  try {
    const response = await ollama.generate({
      model: 'deepseek-r1',
      prompt: `Generate a script based on this prompt:\n${prompt}`,
      max_tokens: 1000
    });
    return response.text;
  } catch (error) {
    console.error('Script generation error:', error);
    throw error;
  }
};

export const textToSpeech = async (text, models) => {
  try {
    const audioData = await models.textToSpeech(text);
    return audioData;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
};

export const textToImage = async (prompt, models) => {
  try {
    const image = await models.textToImage(prompt);
    return image;
  } catch (error) {
    console.error('Text-to-image error:', error);
    throw error;
  }
};

export const textToVideo = async (prompt, models) => {
  try {
    const video = await models.textToVideo(prompt);
    return video;
  } catch (error) {
    console.error('Text-to-video error:', error);
    throw error;
  }
};