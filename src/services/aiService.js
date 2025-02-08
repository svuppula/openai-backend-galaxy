
import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: 'http://localhost:11434'
});

export const initializeModels = async () => {
  try {
    console.log('Initializing AI models...');
    
    // Check if Ollama is running and deepseek model is available
    const models = await ollama.list();
    const hasDeepseek = models.models?.some(m => m.name === 'deepseek-coder');
    
    if (!hasDeepseek) {
      console.log('Pulling deepseek-coder model...');
      await ollama.pull('deepseek-coder:6.7b');
    }
    
    console.log('AI models initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing models:', error);
    return false;
  }
};

export const summarizeText = async (text) => {
  try {
    if (!text) {
      throw new Error('Text is required');
    }

    const response = await ollama.generate({
      model: 'deepseek-coder',
      prompt: `Summarize the following text in a concise way:\n${text}`,
      stream: false
    });

    if (!response || !response.response) {
      throw new Error('Failed to get response from model');
    }

    return response.response;
  } catch (error) {
    console.error('Text summarization error:', error);
    throw new Error('Text summarization failed: ' + error.message);
  }
};

export const generateScript = async (prompt) => {
  try {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const response = await ollama.generate({
      model: 'deepseek-coder',
      prompt: `Generate a creative story or script based on this prompt:\n${prompt}`,
      stream: false
    });

    if (!response || !response.response) {
      throw new Error('Failed to get response from model');
    }

    return response.response;
  } catch (error) {
    console.error('Script generation error:', error);
    throw new Error('Script generation failed: ' + error.message);
  }
};
