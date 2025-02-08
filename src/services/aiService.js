
import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: 'http://localhost:11434'
});

const checkOllamaConnection = async () => {
  try {
    await ollama.list();
    return true;
  } catch (error) {
    console.warn('Could not connect to Ollama server. Please ensure Ollama is running with: ollama serve');
    return false;
  }
};

export const initializeModels = async () => {
  try {
    console.log('Initializing AI models...');
    
    const isConnected = await checkOllamaConnection();
    if (!isConnected) {
      console.log('⚠️ Ollama not running. Start it with: ollama serve');
      console.log('💡 Will use fallback responses until Ollama is available');
      return false;
    }
    
    // Check if deepseek model is available
    const models = await ollama.list();
    const hasDeepseek = models.models?.some(m => m.name === 'deepseek-coder');
    
    if (!hasDeepseek) {
      console.log('Pulling deepseek-coder model...');
      await ollama.pull('deepseek-coder:6.7b');
    }
    
    console.log('✅ AI models initialized successfully');
    return true;
  } catch (error) {
    console.warn('⚠️ Error initializing models:', error.message);
    return false;
  }
};

const getFallbackResponse = (type) => {
  const responses = {
    summary: "I apologize, but text summarization is currently unavailable. Please ensure Ollama is running.",
    script: "I apologize, but script generation is currently unavailable. Please ensure Ollama is running."
  };
  return responses[type];
};

export const summarizeText = async (text) => {
  try {
    if (!text) {
      throw new Error('Text is required');
    }

    const isConnected = await checkOllamaConnection();
    if (!isConnected) {
      return getFallbackResponse('summary');
    }

    const response = await ollama.generate({
      model: 'deepseek-coder',
      prompt: `Summarize the following text in a concise way:\n${text}`,
      stream: false
    });

    return response.response;
  } catch (error) {
    console.error('Text summarization error:', error.message);
    return getFallbackResponse('summary');
  }
};

export const generateScript = async (prompt) => {
  try {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const isConnected = await checkOllamaConnection();
    if (!isConnected) {
      return getFallbackResponse('script');
    }

    const response = await ollama.generate({
      model: 'deepseek-coder',
      prompt: `Generate a creative story or script based on this prompt:\n${prompt}`,
      stream: false
    });

    return response.response;
  } catch (error) {
    console.error('Script generation error:', error.message);
    return getFallbackResponse('script');
  }
};
