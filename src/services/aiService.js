
import { Ollama } from 'ollama';

const ollama = new Ollama();

export const initializeModels = async () => {
  try {
    console.log('Initializing AI models...');
    
    // Initialize local Deepseek model
    await ollama.create({
      name: 'deepseek-coder',
      model: 'deepseek-coder:6.7b',
      options: {
        temperature: 0.7,
        top_p: 0.9
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error initializing models:', error);
    return false;
  }
};

export const summarizeText = async (text) => {
  try {
    const response = await ollama.generate({
      model: 'deepseek-coder',
      prompt: `Summarize the following text:\n${text}`,
      max_tokens: 500
    });
    return response.response;
  } catch (error) {
    console.error('Text summarization error:', error);
    throw error;
  }
};

export const generateScript = async (prompt) => {
  try {
    const response = await ollama.generate({
      model: 'deepseek-coder',
      prompt: `Generate a script based on this prompt:\n${prompt}`,
      max_tokens: 1000
    });
    return response.response;
  } catch (error) {
    console.error('Script generation error:', error);
    throw error;
  }
};
