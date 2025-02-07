import { pipeline } from '@huggingface/transformers';

let summarizationPipeline;
let generationPipeline;

const initializeTextModels = async () => {
  try {
    summarizationPipeline = await pipeline('summarization', 'facebook/bart-large-cnn');
    generationPipeline = await pipeline('text-generation', 'gpt2');
    console.log('Text models initialized successfully');
  } catch (error) {
    console.error('Failed to initialize text models:', error);
    throw error;
  }
};

export const summarizeText = async (text) => {
  if (!summarizationPipeline) await initializeTextModels();
  const result = await summarizationPipeline(text, {
    max_length: 130,
    min_length: 30,
  });
  return result[0].summary_text;
};

export const generateScript = async (prompt) => {
  if (!generationPipeline) await initializeTextModels();
  const result = await generationPipeline(prompt, {
    max_length: 100,
    num_return_sequences: 1,
  });
  return result[0].generated_text;
};