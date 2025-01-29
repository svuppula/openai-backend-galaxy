import { pipeline } from '@huggingface/transformers';

export interface AIModels {
  speechToText: any;
  imageRecognition: any;
  textGeneration: any;
  textSummarization: any;
  sentimentAnalysis: any;
  translation: any;
  ner: any;
  questionAnswering: any;
  objectDetection: any;
}

// Lazy loading of models to reduce cold start time
const modelCache: Partial<AIModels> = {};

export const getModel = async (modelType: keyof AIModels) => {
  if (!modelCache[modelType]) {
    switch (modelType) {
      case 'speechToText':
        modelCache[modelType] = await pipeline("automatic-speech-recognition", "onnx-community/whisper-tiny.en");
        break;
      case 'imageRecognition':
        modelCache[modelType] = await pipeline("image-classification", "onnx-community/mobilenetv4_conv_small.e2400_r224_in1k");
        break;
      case 'textGeneration':
        modelCache[modelType] = await pipeline("text-generation", "onnx-community/gpt2-tiny");
        break;
      case 'textSummarization':
        modelCache[modelType] = await pipeline("summarization", "onnx-community/bart-large-cnn");
        break;
      case 'sentimentAnalysis':
        modelCache[modelType] = await pipeline("sentiment-analysis", "onnx-community/distilbert-base-uncased-finetuned-sst-2-english");
        break;
      case 'translation':
        modelCache[modelType] = await pipeline("translation", "onnx-community/marian-base-ende");
        break;
      case 'ner':
        modelCache[modelType] = await pipeline("token-classification", "onnx-community/bert-base-NER");
        break;
      case 'questionAnswering':
        modelCache[modelType] = await pipeline("question-answering", "onnx-community/distilbert-base-uncased-distilled-squad");
        break;
      case 'objectDetection':
        modelCache[modelType] = await pipeline("object-detection", "onnx-community/detr-resnet-50");
        break;
    }
  }
  return modelCache[modelType];
};

export const initializeModels = async (): Promise<AIModels> => {
  try {
    // Initialize only the most commonly used models at startup
    await getModel('textGeneration');
    await getModel('sentimentAnalysis');
    
    console.log('Initial AI models initialized successfully');
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
