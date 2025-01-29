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

export const initializeModels = async (): Promise<AIModels> => {
  try {
    const models = {
      speechToText: await pipeline("automatic-speech-recognition", "onnx-community/whisper-tiny.en"),
      imageRecognition: await pipeline("image-classification", "onnx-community/mobilenetv4_conv_small.e2400_r224_in1k"),
      textGeneration: await pipeline("text-generation", "onnx-community/gpt2-tiny"),
      textSummarization: await pipeline("summarization", "onnx-community/bart-large-cnn"),
      sentimentAnalysis: await pipeline("sentiment-analysis", "onnx-community/distilbert-base-uncased-finetuned-sst-2-english"),
      translation: await pipeline("translation", "onnx-community/marian-base-ende"),
      ner: await pipeline("token-classification", "onnx-community/bert-base-NER"),
      questionAnswering: await pipeline("question-answering", "onnx-community/distilbert-base-uncased-distilled-squad"),
      objectDetection: await pipeline("object-detection", "onnx-community/detr-resnet-50")
    };
    console.log('AI models initialized successfully');
    return models;
  } catch (error) {
    console.error('Error initializing AI models:', error);
    throw error;
  }
};