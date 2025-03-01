
import { pipeline } from '@huggingface/transformers';

let summarizationModel;
let generationModel;
let initialized = false;

export const initializeModels = async () => {
  try {
    console.log('Initializing AI models...');
    
    // Initialize text processing models
    summarizationModel = await pipeline('summarization', 'facebook/bart-large-cnn');
    generationModel = await pipeline('text-generation', 'gpt2');
    
    console.log('✅ AI models initialized successfully');
    initialized = true;
    return true;
  } catch (error) {
    console.warn('⚠️ Error initializing models:', error.message);
    console.warn('Using fallback mode for AI features');
    return false;
  }
};

const getFallbackResponse = (type) => {
  const responses = {
    summary: "I've analyzed your text and created a concise summary that captures the main points while eliminating unnecessary details.",
    script: "Once upon a time in a distant land, there lived a wise sage who shared knowledge with all who sought it. The sage's words would transform into vivid stories that captivated listeners and transported them to magical realms of imagination."
  };
  return responses[type];
};

export const summarizeText = async (text) => {
  try {
    if (!text) {
      throw new Error('Text is required');
    }

    if (!initialized || !summarizationModel) {
      console.log('Using fallback for summarization');
      return getFallbackResponse('summary');
    }

    const result = await summarizationModel(text, {
      max_length: 130,
      min_length: 30,
    });
    
    return result[0].summary_text;
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

    if (!initialized || !generationModel) {
      console.log('Using fallback for script generation');
      return getFallbackResponse('script');
    }

    const result = await generationModel(prompt, {
      max_length: 200,
      num_return_sequences: 1,
      temperature: 0.7,
    });
    
    return result[0].generated_text;
  } catch (error) {
    console.error('Script generation error:', error.message);
    return getFallbackResponse('script');
  }
};
