
import NodeCache from 'node-cache';

// Cache for AI model responses to reduce computation and increase performance
const responseCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // Cache for 1 hour

// Simple rules-based text generation for fast, free, and scalable solution
// For a real implementation, you would use a more sophisticated model
export const generateText = async (prompt, maxLength = 100) => {
  // Check cache first
  const cacheKey = `${prompt}-${maxLength}`;
  const cachedResponse = responseCache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // In a production environment, you would load and run a proper GPT-NeoX model
    // For this demo, we'll use a simple rule-based system
    
    // Generate response based on prompt keywords
    let response = '';
    
    if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi')) {
      response = "Hello! How can I assist you today? I'm a text generation model that can help answer questions, provide information, or just chat with you.";
    } else if (prompt.toLowerCase().includes('weather')) {
      response = "I don't have real-time data to check the current weather conditions. For accurate weather information, I recommend checking a weather service or app that provides current forecasts for your specific location.";
    } else if (prompt.toLowerCase().includes('recipe') || prompt.toLowerCase().includes('cook')) {
      response = "Here's a simple pasta recipe: Cook your favorite pasta according to package instructions. In a pan, sauté garlic in olive oil, add diced tomatoes, salt, pepper, and basil. Mix with cooked pasta and top with parmesan cheese.";
    } else if (prompt.toLowerCase().includes('help') || prompt.toLowerCase().includes('assist')) {
      response = "I can help you with information, answer questions, provide suggestions, write content, or assist with various tasks. Feel free to ask me anything, and I'll do my best to help!";
    } else if (prompt.toLowerCase().includes('joke')) {
      response = "Why did the scarecrow win an award? Because he was outstanding in his field!";
    } else {
      // Generate a more generic response
      response = `Thank you for your prompt: "${prompt}". This is a demonstration of text generation capabilities. In a full implementation, this would use a large language model to generate more contextually relevant responses.`;
    }

    // Ensure we don't exceed maxLength
    if (response.length > maxLength) {
      response = response.substring(0, maxLength) + '...';
    }
    
    // Cache the response
    responseCache.set(cacheKey, response);
    
    return response;
  } catch (error) {
    console.error('Error generating text:', error);
    throw new Error('Failed to generate text');
  }
};
