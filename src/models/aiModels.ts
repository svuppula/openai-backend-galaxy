import { pipeline } from '@huggingface/transformers';

export interface AIModels {
  speechToText: any;
  imageRecognition: any;
}

const modelCache: Partial<AIModels> = {};

export const getModel = async (modelType: keyof AIModels) => {
  if (!modelCache[modelType]) {
    switch (modelType) {
      case 'speechToText':
        modelCache[modelType] = await pipeline("automatic-speech-recognition");
        break;
      case 'imageRecognition':
        modelCache[modelType] = await pipeline("image-classification");
        break;
    }
  }
  return modelCache[modelType];
};

export const initializeModels = async (): Promise<AIModels> => {
  try {
    console.log('Initializing AI models...');
    return new Proxy({} as AIModels, {
      get: (target, prop: keyof AIModels) => {
        return async (...args: any[]) => {
          const model = await getModel(prop);
          return model(...args);
        };
      }
    });
  } catch (error) {
    console.error('Error initializing AI models:', error);
    throw error;
  }
};