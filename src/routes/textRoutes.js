
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

/**
 * @swagger
 * /text/analyze-sentiment:
 *   post:
 *     summary: Analyze sentiment of text
 *     tags: [Text]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to analyze
 *     responses:
 *       200:
 *         description: Successfully analyzed sentiment
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/analyze-sentiment', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Simple sentiment analysis based on positive and negative keywords
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'love', 'happy', 'joy', 'exciting', 'positive', 'beautiful',
      'best', 'perfect', 'brilliant', 'outstanding'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst',
      'hate', 'sad', 'disappointing', 'negative', 'ugly',
      'failure', 'wrong', 'annoying', 'frustrating'
    ];
    
    // Count occurrences of positive and negative words
    const words = text.toLowerCase().split(/\W+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    // Calculate sentiment score (-1 to 1)
    const total = positiveCount + negativeCount;
    let sentimentScore = 0;
    
    if (total > 0) {
      sentimentScore = (positiveCount - negativeCount) / total;
    }
    
    // Determine sentiment category
    let sentiment;
    if (sentimentScore > 0.5) sentiment = 'Very Positive';
    else if (sentimentScore > 0.1) sentiment = 'Positive';
    else if (sentimentScore > -0.1) sentiment = 'Neutral';
    else if (sentimentScore > -0.5) sentiment = 'Negative';
    else sentiment = 'Very Negative';
    
    res.json({
      success: true,
      text,
      sentiment,
      score: sentimentScore,
      positiveWords: positiveCount,
      negativeWords: negativeCount
    });
  } catch (error) {
    console.error('Sentiment analysis API error:', error.message);
    res.status(500).json({ error: error.message || 'Sentiment analysis failed' });
  }
});

/**
 * @swagger
 * /text/summarize:
 *   post:
 *     summary: Summarize text
 *     tags: [Text]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to summarize
 *               maxSentences:
 *                 type: number
 *                 description: Maximum number of sentences
 *                 default: 3
 *     responses:
 *       200:
 *         description: Successfully summarized text
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/summarize', async (req, res) => {
  try {
    const { text, maxSentences = 3 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Basic text summarization algorithm
    // 1. Split text into sentences
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    
    if (sentences.length <= maxSentences) {
      // Text is already short enough
      return res.json({
        success: true,
        originalText: text,
        summary: text,
        originalLength: text.length,
        summaryLength: text.length
      });
    }
    
    // 2. Calculate word frequency
    const wordFrequency = {};
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    words.forEach(word => {
      if (word.length > 2) { // Ignore short words
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    
    // 3. Score sentences based on word frequency
    const sentenceScores = sentences.map(sentence => {
      const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      let score = 0;
      
      sentenceWords.forEach(word => {
        if (wordFrequency[word]) {
          score += wordFrequency[word];
        }
      });
      
      // Normalize by sentence length to avoid bias towards longer sentences
      return {
        sentence,
        score: sentenceWords.length > 0 ? score / sentenceWords.length : 0
      };
    });
    
    // 4. Sort sentences by score and select top N
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .sort((a, b) => {
        // Restore original order
        return sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence);
      })
      .map(item => item.sentence);
    
    const summary = topSentences.join(' ');
    
    res.json({
      success: true,
      originalText: text,
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: Math.round((1 - summary.length / text.length) * 100) + '%'
    });
  } catch (error) {
    console.error('Text summarization API error:', error.message);
    res.status(500).json({ error: error.message || 'Text summarization failed' });
  }
});

export default router;
