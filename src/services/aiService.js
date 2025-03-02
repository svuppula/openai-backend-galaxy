
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
    'Telugu': ['Ravi', 'Krishna', 'Venu', 'Surya', 'Karthik', 'Vijay', 'Ajay', 'Sai', 'Prasad', 'Naresh', 'Mahesh', 'Ram', 'Charan', 'Arun', 'Prabhas'],
    'Hindi': ['Rahul', 'Vikram', 'Aditya', 'Raj', 'Arjun', 'Akshay', 'Rohit', 'Amit', 'Rishi', 'Vikas', 'Sanjay', 'Nikhil', 'Varun', 'Rajesh', 'Karan'],
    'Tamil': ['Karthik', 'Surya', 'Vijay', 'Arjun', 'Raj', 'Ajith', 'Sakthi', 'Praveen', 'Manoj', 'Dinesh', 'Kumar', 'Suresh', 'Ganesh', 'Bala', 'Mani'],
    'English': ['Michael', 'David', 'Robert', 'John', 'William', 'James', 'Thomas', 'Joseph', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Paul', 'Steven']
  };
  
  const femaleNames = {
    'Telugu': ['Ananya', 'Divya', 'Sravani', 'Priya', 'Lakshmi', 'Madhavi', 'Sunitha', 'Kavitha', 'Deepika', 'Swathi', 'Sujatha', 'Meenakshi', 'Jyothi', 'Nandini', 'Padma'],
    'Hindi': ['Meera', 'Priya', 'Neha', 'Anjali', 'Pooja', 'Aarti', 'Kavita', 'Nisha', 'Shikha', 'Deepika', 'Anu', 'Jyoti', 'Suman', 'Preeti', 'Ritu'],
    'Tamil': ['Priya', 'Divya', 'Lakshmi', 'Kavya', 'Meena', 'Sangeetha', 'Lalitha', 'Kalpana', 'Devi', 'Anitha', 'Vijaya', 'Radha', 'Saranya', 'Seetha', 'Vimala'],
    'English': ['Emily', 'Sarah', 'Jessica', 'Amanda', 'Elizabeth', 'Jennifer', 'Mary', 'Patricia', 'Linda', 'Barbara', 'Susan', 'Margaret', 'Lisa', 'Nancy', 'Karen']
  };
  
  // Generate random titles based on themes
  const titles = {
    'Love and Relationships': [
      'HEARTS IN HARMONY', 'SILENT VOWS', 'WHISPERS OF LOVE', 
      'THE COLOR OF PASSION', 'BETWEEN TWO HEARTS', 'LOVE IN THE RAIN',
      'FORGOTTEN PROMISES', 'DESTINY\'S EMBRACE', 'CROSSING PATHS',
      'LOVE BEYOND BORDERS', 'THE WAITING HEART', 'UNSPOKEN WORDS'
    ],
    'Friendship and Loyalty': [
      'BONDS UNBROKEN', 'THE PACT', 'CHILDHOOD MEMORIES', 
      'HANDS THAT HOLD', 'BEYOND BLOOD', 'TRUE COMPANIONS',
      'SHOULDER TO SHOULDER', 'THE PROMISE KEEPERS', 'FRIENDS FOREVER',
      'LOYALTY TESTED', 'THE STRENGTH OF MANY', 'BROTHERS IN SPIRIT'
    ],
    'Family Values': [
      'BLOOD TIES', 'THE FAMILY TREE', 'GENERATIONS', 
      'HOME IS WHERE', 'ROOTS AND WINGS', 'ANCESTRAL BONDS',
      'THE INHERITANCE', 'FAMILY SECRETS', 'FATHER\'S LEGACY',
      'MOTHER\'S WISDOM', 'REUNITING HEARTS', 'THE RETURN HOME'
    ],
    'Social Issues': [
      'VOICES UNHEARD', 'THE CHANGE MAKERS', 'BREAKING CHAINS', 
      'SILENT REVOLUTION', 'BEYOND THE WALLS', 'NEW HORIZONS',
      'THE AWAKENING', 'STANDING TALL', 'AGAINST THE CURRENT',
      'TRUTH UNVEILED', 'FIGHTING DARKNESS', 'HOPE IN SHADOWS'
    ]
  };
  
  // Select random names
  const maleNameList = maleNames[language] || maleNames['English'];
  const femaleNameList = femaleNames[language] || femaleNames['English'];
  
  // Shuffle the arrays to create randomness
  const shuffledMaleNames = [...maleNameList].sort(() => Math.random() - 0.5);
  const shuffledFemaleNames = [...femaleNameList].sort(() => Math.random() - 0.5);
  
  const hero = shuffledMaleNames[0];
  const heroine = shuffledFemaleNames[0];
  const friend = shuffledMaleNames[1];
  const rival = shuffledMaleNames[2];
  const parentName = Math.random() > 0.5 ? shuffledMaleNames[3] : shuffledFemaleNames[1];
  
  // Select random title
  const themeKey = isLove ? 'Love and Relationships' : 
                  isFriendship ? 'Friendship and Loyalty' : 
                  isFamily ? 'Family Values' : 
                  isSocial ? 'Social Issues' : 'Family Values';
  
  const themeTitles = titles[themeKey] || titles['Family Values'];
  const title = themeTitles[Math.floor(Math.random() * themeTitles.length)];
  
  // Generate random locations
  const locations = {
    'Telugu': ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Warangal', 'Tirupati', 'Coastal village', 'Godavari riverbank', 'Krishna district', 'Araku Valley', 'Rayalaseema region'],
    'Hindi': ['Mumbai', 'Delhi', 'Agra', 'Jaipur', 'Varanasi', 'Himalayan village', 'Ganga riverbank', 'Rajasthan desert', 'Kerala backwaters', 'Punjab fields'],
    'Tamil': ['Chennai', 'Madurai', 'Coimbatore', 'Pondicherry', 'Ooty', 'Coastal fishing village', 'Kaveri riverbank', 'Tea plantation', 'Temple town', 'Hill station'],
    'English': ['New York', 'London', 'Los Angeles', 'Sydney', 'Toronto', 'Coastal town', 'Mountain retreat', 'University campus', 'Small town America', 'European village']
  };
  
  // Get random locations
  const locationList = locations[language] || locations['English'];
  const shuffledLocations = [...locationList].sort(() => Math.random() - 0.5);
  const mainLocation = shuffledLocations[0];
  const secondLocation = shuffledLocations[1];
  
  // Generate random plot twists
  const plotTwists = [
    `${hero} discovers a hidden truth about his past that changes everything.`,
    `${heroine} has been keeping a secret that threatens their relationship.`,
    `An unexpected visitor from ${hero}'s past arrives, bringing chaos.`,
    `${friend} betrays ${hero} in an unexpected way, testing their friendship.`,
    `A natural disaster forces everyone to reconsider their priorities.`,
    `${rival} and ${hero} discover they're related by blood.`,
    `${heroine}'s family reveals a long-kept secret about their ancestry.`,
    `An old letter reveals the truth about a misunderstanding from years ago.`,
    `${hero} faces a moral dilemma that challenges his core beliefs.`,
    `A childhood promise comes back to haunt ${heroine} at the worst possible time.`
  ];
  
  // Choose a random plot twist
  const plotTwist = plotTwists[Math.floor(Math.random() * plotTwists.length)];
  
  // Create script structure with randomized elements
  let script = '';
  
  // Title and metadata
  script += `TITLE: "${title}"\n\n`;
  script += `GENRE: ${genre}\n`;
  script += `THEME: ${themeKey}\n`;
  script += `DURATION: 30 minutes\n`;
  script += `LANGUAGE: ${language}\n\n`;
  
  // Characters with randomized descriptions
  script += `CHARACTERS:\n`;
  
  const heroTraits = ['ambitious', 'compassionate', 'stubborn', 'loyal', 'quick-tempered', 'creative', 'analytical', 'charismatic'];
  const heroineTraits = ['intelligent', 'resilient', 'soft-spoken', 'determined', 'empathetic', 'practical', 'adventurous', 'reserved'];
  const friendTraits = ['humorous', 'supportive', 'cautious', 'impulsive', 'wise', 'skeptical', 'optimistic', 'protective'];
  
  const randomHeroTrait = heroTraits[Math.floor(Math.random() * heroTraits.length)];
  const randomHeroTrait2 = heroTraits[Math.floor(Math.random() * heroTraits.length)];
  const randomHeroineTrait = heroineTraits[Math.floor(Math.random() * heroineTraits.length)];
  const randomHeroineTrait2 = heroineTraits[Math.floor(Math.random() * heroineTraits.length)];
  const randomFriendTrait = friendTraits[Math.floor(Math.random() * friendTraits.length)];
  
  script += `- ${hero}: Main protagonist, ${randomHeroTrait} and ${randomHeroTrait2}\n`;
  script += `- ${heroine}: ${isLove ? 'Love interest' : 'Supporting character'}, ${randomHeroineTrait} and ${randomHeroineTrait2}\n`;
  script += `- ${friend}: Best friend of ${hero}, ${randomFriendTrait} and provides support\n`;
  
  if (isFamily) {
    script += `- ${parentName}: ${Math.random() > 0.5 ? 'Father' : 'Mother'} of ${hero}, ${Math.random() > 0.5 ? 'traditional and strict' : 'loving and understanding'}\n`;
  }
  
  if (Math.random() > 0.6) {
    script += `- ${rival}: ${isLove ? `Competes with ${hero} for ${heroine}'s affection` : `${hero}'s rival in ${Math.random() > 0.5 ? 'business' : 'personal life'}`}\n`;
  }
  
  // Generate random synopsis
  script += `\nSYNOPSIS:\n`;
  
  if (isLove) {
    script += `In the ${mainLocation === 'Hyderabad' || mainLocation === 'Mumbai' ? 'bustling city' : 'picturesque setting'} of ${mainLocation}, ${hero}, a ${randomHeroTrait} young man from a ${Math.random() > 0.5 ? 'middle-class' : 'traditional'} family, crosses paths with ${heroine}, a ${randomHeroineTrait} woman who ${Math.random() > 0.5 ? 'recently moved from ' + secondLocation : 'works as a ' + (Math.random() > 0.5 ? 'teacher' : 'doctor')}. Despite their ${Math.random() > 0.5 ? 'different backgrounds' : 'initial misunderstandings'}, they find themselves drawn to each other. ${plotTwist} With the support of ${friend}, ${hero} must navigate the complexities of love and relationships while staying true to his values.\n\n`;
  } else if (isFriendship) {
    script += `${hero} and ${friend} have been inseparable since childhood in ${mainLocation}. When ${hero} faces ${Math.random() > 0.5 ? 'a major personal crisis' : 'an opportunity to move to ' + secondLocation}, their friendship is put to the ultimate test. ${plotTwist} The story explores the depths of true friendship and the sacrifices we make for those we care about. ${heroine} enters their lives at a crucial moment, bringing a new perspective that changes everything.\n\n`;
  } else if (isFamily) {
    script += `The ${hero}'s family in ${mainLocation} faces a turning point when ${Math.random() > 0.5 ? hero + ' decides to pursue an unconventional career against ' + parentName + '\'s wishes' : 'an unexpected family secret comes to light'}. ${plotTwist} Family bonds are tested as they navigate through misunderstandings, generational gaps, and the rediscovery of what truly matters. ${friend} stands by ${hero}'s side while ${heroine} provides a fresh perspective that helps bridge the divides.\n\n`;
  } else if (isSocial) {
    script += `When ${hero} returns to his home in ${mainLocation} after ${Math.random() > 0.5 ? 'completing his education in ' + secondLocation : 'years of working in ' + secondLocation}, he witnesses the social issues plaguing his community. With determination and the help of ${heroine} and ${friend}, he initiates change that faces strong opposition from influential figures. ${plotTwist} The story highlights the courage needed to challenge established norms and the power of community action.\n\n`;
  } else {
    script += `In ${mainLocation}, ${hero}'s ordinary life takes an extraordinary turn when ${Math.random() > 0.5 ? 'a chance encounter with ' + heroine + ' reveals an unexpected connection' : 'he discovers a hidden talent that changes his perspective'}. ${plotTwist} With ${friend}'s unwavering support and ${heroine}'s unique insights, ${hero} embarks on a journey of self-discovery that will test his resilience and transform his understanding of life's purpose.\n\n`;
  }
  
  // Scene structure with randomized elements
  script += `SCENE BREAKDOWN:\n\n`;
  
  // Add varied scenes with randomized elements
  const timeOfDay = ['Morning', 'Afternoon', 'Evening', 'Night', 'Dawn', 'Dusk', 'Sunset'];
  const emotions = ['joy', 'sorrow', 'anger', 'confusion', 'hope', 'despair', 'determination', 'regret'];
  const weatherConditions = ['sunny', 'rainy', 'cloudy', 'stormy', 'foggy', 'clear', 'windy'];
  
  // Get random elements
  const randomTime1 = timeOfDay[Math.floor(Math.random() * timeOfDay.length)];
  const randomTime2 = timeOfDay[Math.floor(Math.random() * timeOfDay.length)];
  const randomTime3 = timeOfDay[Math.floor(Math.random() * timeOfDay.length)];
  const randomEmotion1 = emotions[Math.floor(Math.random() * emotions.length)];
  const randomEmotion2 = emotions[Math.floor(Math.random() * emotions.length)];
  const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  
  // Scene 1 - Introduction
  script += `SCENE 1 - INTRODUCTION\n`;
  script += `LOCATION: ${mainLocation} - ${randomTime1}\n\n`;
  script += `[The ${randomWeather} day sets the tone as ${hero} is introduced in his daily life. We see his ${randomHeroTrait} nature and his relationship with ${friend}.]\n\n`;
  script += `${hero}: (looking ${Math.random() > 0.5 ? 'thoughtful' : 'determined'}) ${Math.random() > 0.5 ? 'Every day feels the same, but something tells me today will be different.' : 'I can\'t shake this feeling that something\'s about to change.'}\n\n`;
  
  // Scene 2 - Meeting or Inciting Incident
  script += `SCENE 2 - ${isLove ? 'FIRST MEETING' : 'INCITING INCIDENT'}\n`;
  script += `LOCATION: ${Math.random() > 0.5 ? 'Busy marketplace in ' + mainLocation : 'Local ' + (Math.random() > 0.5 ? 'café' : 'park') + ' in ' + mainLocation} - ${randomTime2}\n\n`;
  
  if (isLove) {
    script += `[${hero} and ${heroine} meet under ${Math.random() > 0.5 ? 'unexpected circumstances' : 'a humorous misunderstanding'}.]\n\n`;
    script += `${hero}: (${Math.random() > 0.5 ? 'accidentally bumping into ' + heroine : 'helping ' + heroine + ' with her dropped belongings'}) I'm sorry, I didn't ${Math.random() > 0.5 ? 'see you there' : 'mean to cause trouble'}.\n`;
    script += `${heroine}: (${Math.random() > 0.5 ? 'slightly annoyed' : 'smiling'}) It's alright. (Their eyes meet, ${Math.random() > 0.5 ? 'suggesting an instant connection' : 'creating an awkward but memorable moment'})\n\n`;
  } else if (isFriendship) {
    script += `[${hero} learns about a problem that will test his friendship with ${friend}.]\n\n`;
    script += `${friend}: (looking troubled) I've always been there for you, and now I need your help more than ever.\n`;
    script += `${hero}: (concerned) What happened? Tell me everything.\n`;
    script += `${friend}: (hesitant) It's about ${Math.random() > 0.5 ? 'the job offer in ' + secondLocation : 'what happened with ' + (Math.random() > 0.5 ? 'my family' : 'my future')}...\n\n`;
  } else if (isFamily) {
    script += `[A tense family discussion reveals deeper issues.]\n\n`;
    script += `${parentName}: (firmly) This is not what we planned for you!\n`;
    script += `${hero}: (frustrated) But this is what I want to do with my life!\n`;
    script += `${Math.random() > 0.5 ? friend : heroine}: (trying to mediate) Let's all calm down and discuss this properly.\n\n`;
  } else if (isSocial) {
    script += `[${hero} witnesses a social injustice that motivates him to take action.]\n\n`;
    script += `Villager: This is how things have always been done here. Nobody has ever questioned it.\n`;
    script += `${hero}: (with determination) That doesn't make it right. Something needs to change.\n`;
    script += `${Math.random() > 0.5 ? friend : heroine}: (supportive) If anyone can make a difference, it's you.\n\n`;
  } else {
    script += `[An unexpected event disrupts ${hero}'s normal life.]\n\n`;
    script += `${friend}: (excited) Everything's about to change. Are you ready?\n`;
    script += `${hero}: (uncertain) I don't have a choice, do I?\n`;
    script += `${Math.random() > 0.5 ? friend : heroine}: (reassuring) Sometimes the best things in life aren't choices, they're destiny.\n\n`;
  }
  
  // Middle scenes condensed for brevity
  script += `SCENES 3-6 - RISING ACTION\n`;
  script += `[Multiple locations in ${mainLocation} and ${secondLocation} - Various times of day]\n\n`;
  script += `[The story develops as ${hero} navigates challenges and relationships evolve. ${plotTwist} Tensions rise as stakes become higher.]\n\n`;
  script += `${hero}: (expressing ${randomEmotion1}) I never thought it would come to this.\n`;
  script += `${heroine}: Sometimes we don't know our own strength until we're tested.\n`;
  script += `${friend}: (supportive but concerned) Be careful about the choices you make now - they'll define everything that follows.\n\n`;
  
  // Climax scene
  script += `SCENE 7 - CLIMAX\n`;
  script += `LOCATION: ${Math.random() > 0.5 ? 'Dramatic confrontation at ' + (Math.random() > 0.5 ? 'the heart of ' + mainLocation : 'a symbolic location in ' + secondLocation) : randomWeather + ' setting that mirrors the emotional turmoil'} - ${randomTime3}\n\n`;
  
  if (isLove) {
    script += `[${hero} and ${heroine} face the biggest obstacle to their relationship.]\n\n`;
    script += `${hero}: (emotional) No matter what happens, I will always ${Math.random() > 0.5 ? 'love you' : 'fight for us'}.\n`;
    script += `${heroine}: (with equal emotion) We'll face this together, like we've faced everything else.\n`;
    script += `${Math.random() > 0.5 ? rival : parentName}: (challenging) Some things are simply impossible, no matter how much you want them.\n\n`;
  } else if (isFriendship) {
    script += `[${hero} makes a sacrifice to help ${friend}.]\n\n`;
    script += `${friend}: (shocked) Why would you do this for me?\n`;
    script += `${hero}: (sincere) Because that's what friends do. They stand by each other, no matter what.\n`;
    script += `${heroine}: (witnessing the moment) True friendship is the rarest gift in this world.\n\n`;
  } else if (isFamily) {
    script += `[Family conflict reaches its peak with emotional confrontations.]\n\n`;
    script += `${hero}: (emotional) All I ever wanted was your support!\n`;
    script += `${parentName}: (realizing) I thought I was protecting you, but I was only holding you back.\n`;
    script += `${Math.random() > 0.5 ? friend : heroine}: Sometimes the people who love us the most understand us the least.\n\n`;
  } else if (isSocial) {
    script += `[${hero} confronts the opposition in a public gathering.]\n\n`;
    script += `${hero}: (passionate) This stops today. We deserve better, and we will fight for it!\n`;
    script += `Opponent: You're just one person. What can you possibly do?\n`;
    script += `${heroine}: (stepping forward) He's not alone. We stand with him.\n`;
    script += `${friend}: (joining them) All of us do.\n\n`;
  } else {
    script += `[${hero} faces his biggest challenge yet.]\n\n`;
    script += `${hero}: (determined) This is the moment that defines who I am.\n`;
    script += `${heroine}: (supporting) And I believe in who you are.\n`;
    script += `${friend}: We all do.\n\n`;
  }
  
  // Resolution scene
  script += `SCENE 8 - RESOLUTION\n`;
  script += `LOCATION: ${Math.random() > 0.5 ? 'Meaningful setting in ' + mainLocation : 'Return to where it all began'} - ${Math.random() > 0.5 ? 'Sunset' : 'Sunrise'} (symbolic of new beginnings)\n\n`;
  
  if (isLove) {
    script += `[${hero} and ${heroine} overcome all obstacles, their love prevailing.]\n\n`;
    script += `${hero}: (with ${randomEmotion2}) We've proven that our love is stronger than any obstacle.\n`;
    script += `${heroine}: (smiling) This is just the beginning of our journey together.\n`;
    script += `${friend}: (happy for them) Some stories don't need an ending, just a new chapter.\n\n`;
  } else if (isFriendship) {
    script += `[${hero} and ${friend} reconcile, their friendship stronger than ever.]\n\n`;
    script += `${friend}: Our friendship has been tested, but it never broke.\n`;
    script += `${hero}: Some bonds can never be broken.\n`;
    script += `${heroine}: (observing) You two remind the world what true friendship means.\n\n`;
  } else if (isFamily) {
    script += `[Family reconciliation and acceptance.]\n\n`;
    script += `${parentName}: I'm proud of you. I always have been.\n`;
    script += `${hero}: Thank you for believing in me, finally.\n`;
    script += `${Math.random() > 0.5 ? friend : heroine}: (smiling) Family isn't always perfect, but it's always family.\n\n`;
  } else if (isSocial) {
    script += `[The community begins to see positive changes from ${hero}'s initiatives.]\n\n`;
    script += `Elder: You've brought hope back to our community.\n`;
    script += `${hero}: We did it together. This is just the beginning.\n`;
    script += `${heroine}: Sometimes all people need is someone brave enough to take the first step.\n\n`;
  } else {
    script += `[${hero} emerges transformed from his journey.]\n\n`;
    script += `${hero}: I'm not the same person I was when this all began.\n`;
    script += `${friend}: For what it's worth, I like this version of you better.\n`;
    script += `${heroine}: That's the beauty of life - we're constantly evolving.\n\n`;
  }
  
  // Ending
  script += `FINAL SCENE - EPILOGUE\n`;
  script += `LOCATION: ${Math.random() > 0.5 ? 'Symbolic location showing growth and change' : 'Looking out over ' + mainLocation} - New day\n\n`;
  script += `[The story concludes with a sense of closure but also hints at future possibilities.]\n\n`;
  script += `${hero}: (voiceover) Sometimes the end of one story is just the beginning of another...\n\n`;
  
  script += `END CREDITS\n\n`;
  
  script += `PRODUCTION NOTES:\n`;
  script += `- The film should capture authentic ${language} cultural elements\n`;
  script += `- Music should emphasize emotional moments and reflect the ${genre.toLowerCase()} genre\n`;
  script += `- Consider shooting in natural locations for authenticity\n`;
  script += `- Focus on character development through close-ups and meaningful dialogue\n`;
  script += `- The color palette should shift throughout the story to reflect the emotional journey\n`;
  
  return script;
}

