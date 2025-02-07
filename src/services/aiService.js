import { pipeline } from '@huggingface/transformers';
import { Ollama } from 'ollama-node';

const ollama = new Ollama();

const checkOllamaConnection = async () => {
  try {
    await ollama.list();
    return true;
  } catch (error) {
    console.warn('Ollama connection failed, using fallback options:', error.message);
    return false;
  }
};

export const initializeModels = async () => {
  try {
    console.log('Initializing AI models...');
    
    const isOllamaAvailable = await checkOllamaConnection();
    
    if (isOllamaAvailable) {
      // Initialize local models if Ollama is available
      await ollama.create({
        name: 'deepseek-r1',
        model: 'deepseek-coder:6.7b',
        options: {
          temperature: 0.7,
          top_p: 0.9
        }
      });
    }

    // Initialize HuggingFace pipelines
    const textToSpeech = await pipeline('text-to-speech', 'microsoft/speecht5_tts');
    const textToImage = await pipeline('text-to-image', 'stabilityai/stable-diffusion-2');
    const textToVideo = await pipeline('text-to-video', 'damo-vilab/text-to-video-ms-1.7b');

    return {
      ollama: isOllamaAvailable ? ollama : null,
      textToSpeech,
      textToImage,
      textToVideo,
      isOllamaAvailable
    };
  } catch (error) {
    console.error('Error initializing models:', error);
    throw error;
  }
};

export const summarizeText = async (text, models) => {
  try {
    if (models.isOllamaAvailable) {
      const response = await models.ollama.generate({
        model: 'deepseek-r1',
        prompt: `Summarize the following text:\n${text}`,
        max_tokens: 500
      });
      return response.text;
    } else {
      // Fallback to HuggingFace pipeline
      const summarizer = await pipeline('summarization');
      const result = await summarizer(text);
      return result[0].summary_text;
    }
  } catch (error) {
    console.error('Text summarization error:', error);
    throw error;
  }
};

export const generateScript = async (prompt, models) => {
  try {
    if (models.isOllamaAvailable) {
      const response = await models.ollama.generate({
        model: 'deepseek-r1',
        prompt: `Generate a script based on this prompt:\n${prompt}`,
        max_tokens: 1000
      });
      return response.text;
    } else {
      // Fallback to HuggingFace pipeline
      const generator = await pipeline('text-generation');
      const result = await generator(prompt);
      return result[0].generated_text;
    }
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