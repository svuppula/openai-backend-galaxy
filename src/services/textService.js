
import axios from 'axios';

/**
 * Summarizes text using an AI service
 * @param {string} text - Text to summarize
 * @param {number} maxLength - Maximum length of summary
 * @returns {Promise<string>} - The generated summary
 */
export async function summarizeText(text, maxLength = 100) {
  try {
    // In a real implementation, you would call an external AI API or use a local model
    // For this mock implementation, we'll generate a simple summary
    
    const words = text.split(' ');
    let summary = '';
    
    if (words.length <= maxLength) {
      summary = text;
    } else {
      // Extract first few sentences as a simple summary
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      let currentLength = 0;
      const selectedSentences = [];
      
      for (const sentence of sentences) {
        const wordCount = sentence.split(' ').length;
        if (currentLength + wordCount <= maxLength) {
          selectedSentences.push(sentence.trim());
          currentLength += wordCount;
        } else {
          break;
        }
      }
      
      summary = selectedSentences.join(' ');
    }
    
    return summary;
  } catch (error) {
    console.error('Error in summarizeText:', error);
    throw new Error('Failed to generate summary');
  }
}

/**
 * Extracts keywords from text
 * @param {string} text - Text to extract keywords from
 * @param {number} maxKeywords - Maximum number of keywords to extract
 * @returns {Promise<string[]>} - Array of extracted keywords
 */
export async function generateKeywords(text, maxKeywords = 5) {
  try {
    // In a real implementation, you would use NLP techniques or an external API
    // For this mock implementation, we'll just extract common words
    
    // Remove punctuation and convert to lowercase
    const cleanText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    
    // Split into words
    const words = cleanText.split(/\s+/);
    
    // Filter out common stop words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
      'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of', 'from'];
    
    const filteredWords = words.filter(word => 
      word.length > 2 && !stopWords.includes(word)
    );
    
    // Count word frequencies
    const wordCounts = {};
    filteredWords.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // Sort by frequency
    const sortedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    // Return top keywords
    return sortedWords.slice(0, maxKeywords);
  } catch (error) {
    console.error('Error in generateKeywords:', error);
    throw new Error('Failed to extract keywords');
  }
}
