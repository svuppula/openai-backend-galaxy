
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Simple text summarization without using external API
 * @param {string} text - Text to summarize
 * @returns {Promise<string>} - Summarized text
 */
export const summarizeText = async (text) => {
  // Extract key sentences using a simple algorithm
  
  // Split text into sentences
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  
  if (sentences.length <= 3) {
    // Text is already short enough
    return text;
  }
  
  // Calculate word frequency
  const wordFrequency = {};
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
  words.forEach(word => {
    if (word.length > 2) { // Ignore short words
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });
  
  // Score sentences based on word frequency
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
  
  // Sort sentences by score and select top 3
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => {
      // Restore original order
      return sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence);
    })
    .map(item => item.sentence);
  
  return topSentences.join(' ');
};

/**
 * Generate a script based on a prompt without using external API
 * @param {string} prompt - Prompt for script generation
 * @returns {Promise<string>} - Generated script
 */
export const generateScript = async (prompt) => {
  // This is a simple template-based script generator
  // In a real-world scenario, this would use an AI model
  
  // Convert prompt to lowercase for matching
  const promptLower = prompt.toLowerCase();
  
  // Extract potential topics from the prompt
  const topics = {
    technology: promptLower.includes('tech') || promptLower.includes('computer') || promptLower.includes('digital'),
    education: promptLower.includes('learn') || promptLower.includes('education') || promptLower.includes('school'),
    entertainment: promptLower.includes('fun') || promptLower.includes('entertainment') || promptLower.includes('game'),
    business: promptLower.includes('business') || promptLower.includes('money') || promptLower.includes('finance'),
    health: promptLower.includes('health') || promptLower.includes('fitness') || promptLower.includes('wellness'),
    travel: promptLower.includes('travel') || promptLower.includes('vacation') || promptLower.includes('trip'),
    food: promptLower.includes('food') || promptLower.includes('recipe') || promptLower.includes('cook')
  };
  
  // Determine main topic
  let mainTopic = 'general';
  let maxCount = 0;
  
  for (const [topic, found] of Object.entries(topics)) {
    if (found && Math.random() > maxCount) {
      mainTopic = topic;
      maxCount = Math.random();
    }
  }
  
  // Script templates for different topics
  const scriptTemplates = {
    technology: `
[OPENING SHOT: Close-up of the latest technology device]

HOST: Hey there, tech enthusiasts! Welcome back to another exciting video about ${prompt}. I'm your host, and today we're diving deep into this fascinating topic.

[TRANSITION: Animated graphics showing tech concepts]

HOST: If you've ever wondered about ${prompt}, you're in the right place. Let me break it down for you.

[SECTION 1: Technical explanation with visual aids]

HOST: First, let's understand what we're talking about. ${prompt} is revolutionizing the way we interact with technology.

[SHOW screen with key points]

HOST: The key aspects to understand are:
1. How this technology works
2. Why it matters for the future
3. What problems it solves

[SECTION 2: Demonstration]

HOST: Let me show you how this actually works in practice.

[DEMONSTRATION sequence]

HOST: As you can see, it's pretty impressive when you see it in action!

[SECTION 3: Practical applications]

HOST: Now let's talk about how you can use this in your daily life.

[CLOSING]

HOST: That's all for today's video on ${prompt}. If you found this helpful, don't forget to like and subscribe for more tech content. Leave your questions in the comments below!

[END CARD with social media handles]
`,
    education: `
[OPENING: Animated intro with educational theme]

TEACHER: Hello learners! Welcome to today's lesson about ${prompt}. I'm excited to guide you through this fascinating topic.

[TRANSITION: Whiteboard animation]

TEACHER: Today's learning objectives are:
1. Understanding the fundamentals of ${prompt}
2. Exploring key concepts and theories
3. Applying what we learn through practical examples

[SECTION 1: Explanation with visual aids]

TEACHER: Let's start with the basics. ${prompt} is an important concept that helps us understand the world around us.

[ANIMATED DIAGRAM appears]

TEACHER: As you can see from this diagram, there are several components that work together.

[SECTION 2: Interactive examples]

TEACHER: Now, let's work through some examples together.

[PROBLEM-SOLVING sequence]

TEACHER: Great job! Let's try another one that's a bit more challenging.

[SECTION 3: Real-world applications]

TEACHER: What makes ${prompt} so valuable is how we can apply it in real life. Here are some examples of where you might see this concept in action.

[CLOSING]

TEACHER: That wraps up our lesson on ${prompt}. Remember to practice what we've learned, and I'll see you in the next video where we'll build on these concepts!

[END CARD with additional resources]
`,
    entertainment: `
[ENERGETIC INTRO with upbeat music]

HOST: What's up, everyone! Welcome to another amazing video about ${prompt}. This is going to be epic!

[FLASHY TRANSITION with sound effects]

HOST: If you're into entertainment, you're going to love what I have for you today. We're exploring ${prompt} like never before!

[SECTION 1: Exciting overview]

HOST: ${prompt} has been taking the world by storm, and for good reason! It's changing how we experience entertainment.

[MONTAGE of related content]

HOST: Just look at these incredible moments that make ${prompt} so special!

[SECTION 2: Behind the scenes]

HOST: What many people don't know is what goes on behind the scenes.

[REVEAL dramatic information]

HOST: Surprised? I was too when I first learned about this!

[SECTION 3: Fan engagement]

HOST: Let's check out what fans are saying about ${prompt} online.

[SOCIAL MEDIA highlights]

HOST: The reactions have been insane! Keep those comments coming!

[CLOSING with call to action]

HOST: That's it for today's video on ${prompt}. Make sure you smash that like button, hit subscribe, and turn on notifications so you never miss our latest uploads!

[OUTRO with bloopers]
`,
    business: `
[PROFESSIONAL INTRO with business music]

PRESENTER: Welcome to Business Insights. I'm your host, and today we're analyzing ${prompt} and its impact on the market.

[TRANSITION to data visualization]

PRESENTER: Let's look at the numbers that make ${prompt} such an important topic in today's business landscape.

[SECTION 1: Market analysis]

PRESENTER: The current market situation shows significant opportunities in this area.

[GRAPHS AND CHARTS appear]

PRESENTER: As you can see from these trends, there's been consistent growth over the past quarters.

[SECTION 2: Strategic considerations]

PRESENTER: For businesses looking to leverage ${prompt}, there are several key strategies to consider.

[BULLET POINTS with strategic framework]

PRESENTER: Implementing these approaches could provide a competitive advantage in today's challenging environment.

[SECTION 3: Case studies]

PRESENTER: Let's examine how leading companies have successfully implemented these strategies.

[COMPANY EXAMPLES with results]

PRESENTER: The results speak for themselves - a 30% increase in efficiency and 25% growth in market share.

[CLOSING with actionable advice]

PRESENTER: To summarize, ${prompt} presents significant opportunities for businesses willing to adapt. The key takeaways from today's analysis are...

[END CARD with contact information for consulting services]
`,
    general: `
[OPENING SHOT: Engaging visual related to the topic]

HOST: Hello and welcome! Today we're exploring ${prompt}, a topic I'm really excited to share with you.

[TRANSITION: Simple graphic with title]

HOST: There's so much to discover about ${prompt}, and we'll cover the most interesting aspects in this video.

[SECTION 1: Introduction to the topic]

HOST: First, let's talk about what ${prompt} actually is and why it matters.

[VISUAL EXPLANATION with simple graphics]

HOST: As you can see, there are several key elements that make this topic fascinating.

[SECTION 2: Deeper exploration]

HOST: Now that we understand the basics, let's dive deeper into some interesting aspects.

[DEMONSTRATIONS or EXAMPLES]

HOST: These examples really show the importance and versatility of ${prompt}.

[SECTION 3: Practical relevance]

HOST: You might be wondering how this relates to everyday life. Let me show you some practical applications.

[REAL-WORLD CONNECTIONS]

HOST: As we've seen, ${prompt} has impacts that go beyond what you might initially think.

[CLOSING]

HOST: I hope you've enjoyed learning about ${prompt}. If you found this video helpful, please like and subscribe for more content like this!

[END CARD with suggested related videos]
`
  };
  
  // Select template based on main topic or default to general
  const scriptTemplate = scriptTemplates[mainTopic] || scriptTemplates.general;
  
  // Further personalize the script with details from the prompt
  let personalizedScript = scriptTemplate;
  
  // Extract potential keywords from the prompt
  const keywords = prompt.split(' ')
    .filter(word => word.length > 4)
    .map(word => word.replace(/[^a-zA-Z0-9]/g, ''));
  
  // Insert some keywords into the script for more personalization
  if (keywords.length > 0) {
    // Replace some generic terms with keywords from the prompt
    const termsToReplace = ['this topic', 'it', 'this concept', 'this subject'];
    
    termsToReplace.forEach(term => {
      if (Math.random() > 0.5 && personalizedScript.includes(term)) {
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        personalizedScript = personalizedScript.replace(term, randomKeyword);
      }
    });
  }
  
  return personalizedScript;
};

export default {
  summarizeText,
  generateScript
};
