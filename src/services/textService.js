
// A more reliable implementation without requiring model downloads
import { v4 as uuidv4 } from 'uuid';

// Store for generating varied responses
const plotElements = {
  telugu: {
    settings: [
      'గ్రామీణ తెలంగాణా', 'హైదరాబాద్ నగరం', 'విశాఖపట్నం సముద్ర తీరం', 
      'చిత్తూరు జిల్లా', 'అనంతపురం', 'తిరుమల కొండలు', 'గోదావరి నది ఒడ్డున'
    ],
    themes: [
      'ప్రేమ విరహం', 'స్నేహం విలువ', 'కుటుంబ బంధాలు', 'సాంఘిక అన్యాయాలు', 
      'ఆధునిక జీవితం', 'మనిషి మంచితనం', 'సంస్కృతి సంఘర్షణ'
    ],
    characters: [
      'రాజు - ఓ సాధారణ యువకుడు', 'సుందరి - కలల రాణి', 'కృష్ణ - తెలివైన విద్యార్థి',
      'లక్ష్మి - సాహసవంతురాలు', 'రామయ్య - పొలాల రైతు', 'సీత - ఉపాధ్యాయురాలు'
    ],
    conflicts: [
      'కులాల మధ్య వివాదాలు', 'సంప్రదాయాలకు ఆధునికతకు మధ్య ఘర్షణ', 
      'పేదరికం నుండి బయటపడే ప్రయత్నం', 'కుటుంబ వ్యతిరేకత'
    ]
  },
  english: {
    settings: [
      'a bustling city', 'a quiet coastal town', 'a remote village', 
      'a university campus', 'a tech startup', 'an old family estate'
    ],
    themes: [
      'overcoming adversity', 'finding one\'s purpose', 'reconciliation', 
      'the power of friendship', 'social inequality', 'cultural identity'
    ],
    characters: [
      'Rahul - an ambitious college graduate', 'Priya - a talented artist',
      'Sam - a retired teacher', 'Maya - a tech entrepreneur', 
      'Arjun - a struggling writer', 'Zoya - a dedicated doctor'
    ],
    conflicts: [
      'generational differences', 'career vs personal life', 
      'traditional values vs modern thinking', 'urban development vs heritage conservation'
    ]
  },
  hindi: {
    settings: [
      'मुंबई की गलियाँ', 'दिल्ली का एक मोहल्ला', 'राजस्थान का एक छोटा गाँव', 
      'हिमालय की तलहटी', 'गंगा के किनारे', 'एक कॉलेज कैंपस'
    ],
    themes: [
      'परिवार का महत्व', 'दोस्ती की कहानी', 'प्यार और त्याग', 
      'संघर्ष और सफलता', 'परंपरा और आधुनिकता', 'सामाजिक मुद्दे'
    ],
    characters: [
      'विकास - एक महत्वाकांक्षी युवक', 'अनु - एक आत्मनिर्भर लड़की',
      'बृजेश - एक बुज़ुर्ग शिक्षक', 'मीरा - एक कलाकार', 
      'राहुल - एक इंजीनियर', 'प्रिया - एक डॉक्टर'
    ],
    conflicts: [
      'परिवार के विरोध का सामना', 'करियर और रिश्ते के बीच संघर्ष', 
      'गाँव और शहर के बीच अंतर', 'आर्थिक चुनौतियां'
    ]
  },
  tamil: {
    settings: [
      'சென்னை நகரம்', 'மதுரை கோயில் பகுதி', 'ஊட்டி மலைப் பகுதி', 
      'கன்னியாகுமரி கடற்கரை', 'ஒரு கிராமம்', 'காவிரி நதிக்கரை'
    ],
    themes: [
      'குடும்ப பந்தம்', 'காதல் கதை', 'நட்பின் மகத்துவம்', 
      'சமூக அநீதி', 'கலாச்சார மரபுகள்', 'போராட்டமும் வெற்றியும்'
    ],
    characters: [
      'கார்த்திக் - ஒரு கல்லூரி மாணவன்', 'தமிழ் - ஒரு திறமையான பெண்',
      'மணி - ஒரு ஆசிரியர்', 'செல்வி - ஒரு தொழில் முனைவோர்', 
      'முருகன் - ஒரு விவசாயி', 'லதா - ஒரு மருத்துவர்'
    ],
    conflicts: [
      'வர்க்க வேறுபாடுகள்', 'பாரம்பரியமும் நவீனமும்', 
      'கிராமத்திற்கும் நகரத்திற்கும் இடையே உள்ள வேறுபாடுகள்', 'குடும்ப பிரச்சனைகள்'
    ]
  }
};

// Utility function to get random elements
const getRandomElements = (array, count = 1) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
};

// Create a more structured script with scenes and dialogue
const generateStructuredScript = (prompt) => {
  // Detect language from prompt (simple detection based on keywords)
  let language = 'english';
  if (/తెలుగు|అందం|ప్రేమ|కథ/.test(prompt)) language = 'telugu';
  if (/हिंदी|कहानी|प्रेम|भारतीय/.test(prompt)) language = 'hindi';
  if (/தமிழ்|காதல்|கதை|திரைப்படம்/.test(prompt)) language = 'tamil';
  
  const elements = plotElements[language] || plotElements.english;
  
  // Generate random elements for the story
  const setting = getRandomElements(elements.settings);
  const theme = getRandomElements(elements.themes);
  const conflict = getRandomElements(elements.conflicts);
  const mainCharacters = getRandomElements(elements.characters, 3);
  
  // Generate a unique title using UUID to ensure randomness
  const uniqueId = uuidv4().substring(0, 6);
  
  let title = '';
  switch(language) {
    case 'telugu':
      title = `జీవితం మలుపు - ${uniqueId}`;
      break;
    case 'hindi':
      title = `जिंदगी के रंग - ${uniqueId}`;
      break;
    case 'tamil':
      title = `வாழ்க்கை பயணம் - ${uniqueId}`;
      break;
    default:
      title = `Journey of Life - ${uniqueId}`;
  }
  
  // Structure for script: title, synopsis, characters, scenes
  const script = {
    title,
    genre: theme,
    setting,
    duration: "30 minutes",
    characters: mainCharacters,
    synopsis: `A story set in ${setting} exploring ${theme} through the lives of ${mainCharacters.length} characters facing ${conflict}.`,
    scenes: []
  };
  
  // Generate 5-8 scenes with dialogue
  const sceneCount = Math.floor(Math.random() * 4) + 5; // 5-8 scenes
  
  for (let i = 1; i <= sceneCount; i++) {
    const scene = {
      sceneNumber: i,
      location: i === 1 ? setting : `Another location in ${setting}`,
      timeOfDay: ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'][Math.floor(Math.random() * 4)],
      description: `Characters interact as they deal with ${i === sceneCount ? 'the resolution of' : 'aspects of'} ${conflict}.`,
      dialogue: []
    };
    
    // Generate 3-5 dialogue exchanges per scene
    const dialogueCount = Math.floor(Math.random() * 3) + 3;
    const charactersInScene = getRandomElements(mainCharacters, Math.min(mainCharacters.length, 3));
    
    for (let j = 0; j < dialogueCount; j++) {
      const character = charactersInScene[j % charactersInScene.length].split(' - ')[0];
      let dialogueText = '';
      
      // More varied dialogue based on scene position
      if (i === 1) {
        // Opening scene - establish characters
        dialogueText = `This is where our story begins. I'm dealing with ${conflict} in my life.`;
      } else if (i === sceneCount) {
        // Closing scene - resolution
        dialogueText = `I've learned so much through this journey. We've all changed because of what we've been through.`;
      } else {
        // Middle scenes - conflict development
        dialogueText = `We need to find a way to resolve this situation. It's affecting all of us.`;
      }
      
      scene.dialogue.push({
        character,
        text: dialogueText
      });
    }
    
    script.scenes.push(scene);
  }
  
  // Format the script for output
  let formattedScript = `TITLE: ${script.title}\n\nGENRE: ${script.genre}\n\nSETTING: ${script.setting}\n\nDURATION: ${script.duration}\n\n`;
  
  formattedScript += "CHARACTERS:\n";
  script.characters.forEach(char => {
    formattedScript += `- ${char}\n`;
  });
  
  formattedScript += "\nSYNOPSIS:\n" + script.synopsis + "\n\n";
  
  script.scenes.forEach(scene => {
    formattedScript += `\nSCENE ${scene.sceneNumber} - ${scene.location} - ${scene.timeOfDay}\n\n`;
    formattedScript += scene.description + "\n\n";
    
    scene.dialogue.forEach(dialogue => {
      formattedScript += `${dialogue.character}: ${dialogue.text}\n\n`;
    });
  });
  
  return formattedScript;
};

// Generate a completely random script each time, incorporating elements from the prompt
export const generateScript = async (prompt) => {
  console.log(`Generating script for prompt: ${prompt}`);
  try {
    // Generate structured script with randomization
    return generateStructuredScript(prompt);
  } catch (error) {
    console.error('Error generating script:', error);
    // Fallback with error information
    return `Error generating script: ${error.message}. Please try again with a different prompt.`;
  }
};

// Placeholder for summarization function that doesn't require downloading models
export const summarizeText = async (text) => {
  try {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 3) return text;
    
    // Simple extractive summarization: take first, middle and last sentence
    const firstSentence = sentences[0];
    const middleSentence = sentences[Math.floor(sentences.length / 2)];
    const lastSentence = sentences[sentences.length - 1];
    
    return `${firstSentence}. ${middleSentence}. ${lastSentence}.`;
  } catch (error) {
    console.error('Error summarizing text:', error);
    return text;
  }
};
