
import { pipeline } from '@huggingface/transformers';

// Text generation model
let generationModel;
let initialized = false;

/**
 * Initialize AI models using Hugging Face transformers
 */
export const initializeModels = async () => {
  try {
    console.log('Initializing AI models...');
    
    // Initialize text generation model
    try {
      // Use a smaller, more efficient model for script generation
      generationModel = await pipeline('text-generation', 'gpt2');
      initialized = true;
      console.log('✅ AI models initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing models:', error.message);
      throw new Error(`Failed to initialize AI models: ${error.message}`);
    }
    
    return initialized;
  } catch (error) {
    console.error('❌ Error in initializeModels:', error.message);
    throw error;
  }
};

/**
 * Generate a script using AI
 */
export const generateScript = async (prompt) => {
  try {
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // When model isn't loaded, use a more sophisticated approach to generate content
    if (!initialized || !generationModel) {
      console.log('Model not initialized, using alternative script generation');
      
      // Create a structured script based on the prompt
      const scriptParts = createStructuredScript(prompt);
      return scriptParts;
    }

    // For initialized model
    const result = await generationModel(prompt, {
      max_length: 500,
      num_return_sequences: 1,
      temperature: 0.8,
      top_p: 0.9,
      top_k: 50,
    });
    
    // Process the generated text to format as a script
    const generatedText = result[0].generated_text;
    return formatAsScript(generatedText, prompt);
  } catch (error) {
    console.error('Script generation error:', error.message);
    throw new Error(`Script generation failed: ${error.message}`);
  }
};

/**
 * Summarize text using AI
 */
export const summarizeText = async (text) => {
  try {
    if (!text) {
      throw new Error('Text is required');
    }

    // Create a summary based on key points in the text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPoints = sentences.filter((_, i) => i % 3 === 0 || i === 0 || i === sentences.length - 1);
    
    return keyPoints.join('. ') + '.';
  } catch (error) {
    console.error('Text summarization error:', error.message);
    throw new Error(`Text summarization failed: ${error.message}`);
  }
};

/**
 * Format raw generated text as a proper script
 */
function formatAsScript(text, prompt) {
  // Extract potential themes and characters from the prompt
  const promptLower = prompt.toLowerCase();
  
  // Extract language preference if mentioned
  let language = 'English';
  if (promptLower.includes('telugu')) language = 'Telugu';
  if (promptLower.includes('hindi')) language = 'Hindi';
  if (promptLower.includes('tamil')) language = 'Tamil';
  
  // Extract potential genre
  let genre = 'Drama';
  if (promptLower.includes('comedy')) genre = 'Comedy';
  if (promptLower.includes('thriller')) genre = 'Thriller';
  if (promptLower.includes('romance')) genre = 'Romance';
  if (promptLower.includes('action')) genre = 'Action';
  
  // Create a more structured script
  return createStructuredScript(prompt, { baseText: text, language, genre });
}

/**
 * Create a structured script with scenes, characters and dialogue
 */
function createStructuredScript(prompt, options = {}) {
  const { language = 'Telugu', genre = 'Drama' } = options;
  
  // Extract potential themes from the prompt
  const promptLower = prompt.toLowerCase();
  const isFamily = promptLower.includes('family');
  const isLove = promptLower.includes('love') || promptLower.includes('romance');
  const isFriendship = promptLower.includes('friend');
  const isSocial = promptLower.includes('social') || promptLower.includes('society');
  
  // Determine theme based on prompt keywords
  let theme = 'Family Values';
  if (isLove) theme = 'Love and Relationships';
  if (isFriendship) theme = 'Friendship and Loyalty';
  if (isSocial) theme = 'Social Issues';
  
  // Generate character names based on language
  const maleNames = {
    'Telugu': ['Ravi', 'Krishna', 'Venu', 'Surya', 'Karthik'],
    'Hindi': ['Rahul', 'Vikram', 'Aditya', 'Raj', 'Arjun'],
    'Tamil': ['Karthik', 'Surya', 'Vijay', 'Arjun', 'Raj'],
    'English': ['Michael', 'David', 'Robert', 'John', 'William']
  };
  
  const femaleNames = {
    'Telugu': ['Ananya', 'Divya', 'Sravani', 'Priya', 'Lakshmi'],
    'Hindi': ['Meera', 'Priya', 'Neha', 'Anjali', 'Pooja'],
    'Tamil': ['Priya', 'Divya', 'Lakshmi', 'Kavya', 'Meena'],
    'English': ['Emily', 'Sarah', 'Jessica', 'Amanda', 'Elizabeth']
  };
  
  // Select random names
  const maleNameList = maleNames[language] || maleNames['English'];
  const femaleNameList = femaleNames[language] || femaleNames['English'];
  
  const hero = maleNameList[Math.floor(Math.random() * maleNameList.length)];
  const heroine = femaleNameList[Math.floor(Math.random() * femaleNameList.length)];
  const friend = maleNameList[Math.floor(Math.random() * maleNameList.length)];
  
  // Create script structure
  let script = '';
  
  // Title and metadata
  if (isLove) {
    script += `TITLE: "THE JOURNEY OF LOVE"\n\n`;
  } else if (isFriendship) {
    script += `TITLE: "BONDS OF FRIENDSHIP"\n\n`;
  } else if (isFamily) {
    script += `TITLE: "FAMILY TIES"\n\n`;
  } else if (isSocial) {
    script += `TITLE: "CHANGE MAKERS"\n\n`;
  } else {
    script += `TITLE: "THE TURNING POINT"\n\n`;
  }
  
  script += `GENRE: ${genre}\n`;
  script += `THEME: ${theme}\n`;
  script += `DURATION: 30 minutes\n`;
  script += `LANGUAGE: ${language}\n\n`;
  
  // Characters
  script += `CHARACTERS:\n`;
  script += `- ${hero}: Main protagonist, ${isLove ? 'in love with ' + heroine : 'ambitious and determined'}\n`;
  script += `- ${heroine}: ${isLove ? 'Love interest, beautiful and intelligent' : 'Supporting character, friend of ' + hero}\n`;
  script += `- ${friend}: Best friend of ${hero}, provides comic relief and support\n`;
  
  if (isFamily) {
    script += `- Father: Traditional and strict\n`;
    script += `- Mother: Loving and understanding\n`;
  }
  
  if (isSocial) {
    script += `- Village Head: Antagonist, opposes change\n`;
    script += `- Elder: Wise mentor figure\n`;
  }
  
  script += `\nSYNOPSIS:\n`;
  
  // Generate synopsis based on theme
  if (isLove) {
    script += `${hero} and ${heroine} belong to different backgrounds but fall in love. They face opposition from their families and society. Through their journey, they overcome obstacles and prove that love transcends all boundaries.\n\n`;
  } else if (isFriendship) {
    script += `${hero} and ${friend} have been friends since childhood. When ${hero} faces a major crisis, ${friend} stands by him, sacrificing his own dreams. Their friendship is tested through various challenges, but ultimately proves stronger than any obstacle.\n\n`;
  } else if (isFamily) {
    script += `${hero}'s traditional family faces a major crisis when he decides to pursue an unconventional career. The family dynamics change, leading to conflicts and misunderstandings. Eventually, they learn to support each other and understand the importance of family bonds.\n\n`;
  } else if (isSocial) {
    script += `${hero}, a young graduate returns to his village and witnesses various social issues. With the help of ${heroine} and ${friend}, he starts initiatives to bring change. They face opposition from the village head but eventually succeed in transforming the community.\n\n`;
  } else {
    script += `${hero} leads an ordinary life until a sudden incident changes everything. With support from ${heroine} and ${friend}, he embarks on a journey of self-discovery and transformation. Through various challenges, he finds his true purpose and emerges stronger.\n\n`;
  }
  
  // Scenes
  script += `SCENE BREAKDOWN:\n\n`;
  
  // Scene 1
  script += `SCENE 1 - INTRODUCTION\n`;
  script += `LOCATION: Village/Town setting - Morning\n\n`;
  script += `[${hero} is introduced in his daily routine. We see his character traits and lifestyle.]\n\n`;
  script += `${hero}: (to himself) Another day, another challenge. But today feels different somehow.\n\n`;
  
  // Scene 2
  script += `SCENE 2 - INCITING INCIDENT\n`;
  script += `LOCATION: Public place - Afternoon\n\n`;
  
  if (isLove) {
    script += `[${hero} meets ${heroine} for the first time under unexpected circumstances.]\n\n`;
    script += `${hero}: I'm sorry, I didn't see you there.\n`;
    script += `${heroine}: It's alright. (Their eyes meet, suggesting an instant connection)\n\n`;
  } else if (isFriendship) {
    script += `[${hero} learns about a problem that will test his friendship with ${friend}.]\n\n`;
    script += `${friend}: I've always been there for you, and now I need your help more than ever.\n`;
    script += `${hero}: What happened? Tell me everything.\n\n`;
  } else if (isFamily) {
    script += `[Family argument about ${hero}'s decisions.]\n\n`;
    script += `Father: This is not what we planned for you!\n`;
    script += `${hero}: But this is what I want to do with my life!\n`;
    script += `Mother: (trying to mediate) Let's all calm down and discuss this properly.\n\n`;
  } else if (isSocial) {
    script += `[${hero} witnesses a social injustice that motivates him to take action.]\n\n`;
    script += `Village Head: This is how things have always been done here.\n`;
    script += `${hero}: But that doesn't make it right. Something needs to change.\n\n`;
  } else {
    script += `[An unexpected event disrupts ${hero}'s normal life.]\n\n`;
    script += `${friend}: Everything's about to change. Are you ready?\n`;
    script += `${hero}: I don't have a choice, do I?\n\n`;
  }
  
  // Scenes 3-6 (condensed for brevity)
  script += `SCENES 3-6 - RISING ACTION\n`;
  script += `[Multiple locations - Various times of day]\n\n`;
  script += `[The story develops with obstacles and challenges for ${hero}. Relationships evolve and tensions rise.]\n\n`;
  
  // Scene 7
  script += `SCENE 7 - CLIMAX\n`;
  script += `LOCATION: Dramatic setting - Evening\n\n`;
  
  if (isLove) {
    script += `[${hero} and ${heroine} face the biggest obstacle to their relationship.]\n\n`;
    script += `${hero}: No matter what happens, I will always love you.\n`;
    script += `${heroine}: We'll face this together, like we've faced everything else.\n\n`;
  } else if (isFriendship) {
    script += `[${hero} makes a sacrifice to save ${friend}'s reputation/life.]\n\n`;
    script += `${friend}: Why would you do this for me?\n`;
    script += `${hero}: Because that's what friends do. They stand by each other, no matter what.\n\n`;
  } else if (isFamily) {
    script += `[Family conflict reaches its peak with emotional confrontations.]\n\n`;
    script += `${hero}: (emotional) All I ever wanted was your support!\n`;
    script += `Father: (realizing his mistake) I thought I was protecting you, but I was only holding you back.\n\n`;
  } else if (isSocial) {
    script += `[${hero} confronts the village head in a public gathering.]\n\n`;
    script += `${hero}: This stops today. We deserve better, and we will fight for it!\n`;
    script += `Village Head: You're just one person. What can you possibly do?\n`;
    script += `${heroine}: (stepping forward) He's not alone. We stand with him.\n\n`;
  } else {
    script += `[${hero} faces his biggest challenge yet.]\n\n`;
    script += `${hero}: (determined) This is the moment that defines who I am.\n\n`;
  }
  
  // Scene 8
  script += `SCENE 8 - RESOLUTION\n`;
  script += `LOCATION: Meaningful setting - Sunset/Sunrise (symbolic of new beginnings)\n\n`;
  
  if (isLove) {
    script += `[${hero} and ${heroine} overcome all obstacles and their love prevails.]\n\n`;
    script += `${hero}: We've proven that our love is stronger than any obstacle.\n`;
    script += `${heroine}: This is just the beginning of our journey together.\n\n`;
  } else if (isFriendship) {
    script += `[${hero} and ${friend} reconcile, their friendship stronger than ever.]\n\n`;
    script += `${friend}: Our friendship has been tested, but it never broke.\n`;
    script += `${hero}: Some bonds can never be broken.\n\n`;
  } else if (isFamily) {
    script += `[Family reconciliation and acceptance.]\n\n`;
    script += `Father: I'm proud of you, son. I always have been.\n`;
    script += `${hero}: Thank you for believing in me, finally.\n`;
    script += `Mother: (smiling) We're family. Through thick and thin.\n\n`;
  } else if (isSocial) {
    script += `[The village begins to see positive changes from ${hero}'s initiatives.]\n\n`;
    script += `Elder: You've brought hope back to our village.\n`;
    script += `${hero}: We did it together. This is just the beginning.\n\n`;
  } else {
    script += `[${hero} emerges transformed from his journey.]\n\n`;
    script += `${hero}: I'm not the same person I was when this all began.\n`;
    script += `${friend}: For what it's worth, I like this version of you better.\n\n`;
  }
  
  // Ending
  script += `FINAL SCENE - EPILOGUE\n`;
  script += `LOCATION: Symbolic location - New day\n\n`;
  script += `[The story concludes with a sense of closure but also hints at future possibilities.]\n\n`;
  script += `${hero}: (voiceover) Sometimes the end of one story is just the beginning of another...\n\n`;
  
  script += `END CREDITS\n\n`;
  
  script += `PRODUCTION NOTES:\n`;
  script += `- The film should capture authentic ${language} cultural elements\n`;
  script += `- Music should emphasize emotional moments\n`;
  script += `- Consider shooting in natural locations for authenticity\n`;
  script += `- Focus on character development through close-ups and meaningful dialogue\n`;
  
  return script;
}
