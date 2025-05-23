/**
 * This file contains mock data handlers for demonstration purposes
 * Used to simulate LangPal responses when full WebRTC connection isn't available
 */

// Sample responses for demo mode
const SAMPLE_RESPONSES = [
  "Hi there! I'm LangPal, your friendly teddy bear language learning companion!",
  "I'd love to help you practice a new language! Would you like to try some simple Spanish phrases?",
  "Great job! Your pronunciation is getting better every time!",
  "Let's try another fun phrase: 'Me gusta jugar contigo' - It means 'I like playing with you'!",
  "I can help with vocabulary, pronunciation, and even simple conversations. What would you like to practice?",
  "¡Muy bien! That was perfect!",
  "Learning languages is more fun when we do it together!",
  "Would you like to learn how to count in French? Let's start with: Un, deux, trois...",
  "I'm programmed to recognize multiple languages and help with pronunciation!",
  "Let's play a word game! I'll say a word in English, and you can try to say it in Spanish!"
];

/**
 * Generates a random response from LangPal
 * @returns A random response string
 */
export const getRandomResponse = (): string => {
  const randomIndex = Math.floor(Math.random() * SAMPLE_RESPONSES.length);
  return SAMPLE_RESPONSES[randomIndex];
};

/**
 * Simple keyword-based response system
 * @param userText The text from the user
 * @returns An appropriate response based on keywords
 */
export const getKeywordBasedResponse = (userText: string): string => {
  const text = userText.toLowerCase();
  
  if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
    return "Hello there! I'm LangPal, your friendly language learning teddy bear!";
  }
  
  if (text.includes('spanish') || text.includes('español')) {
    return "¡Hola! I'd love to help you practice Spanish! Let's start with a simple phrase: 'Buenos días' - it means 'Good morning'!";
  }
  
  if (text.includes('french') || text.includes('français')) {
    return "Bonjour! Let's practice some French together! Can you repeat after me: 'Comment ça va?' - it means 'How are you?'";
  }
  
  if (text.includes('german') || text.includes('deutsch')) {
    return "Guten Tag! I can help you with some German phrases. Let's try: 'Wie heißt du?' - it means 'What's your name?'";
  }
  
  if (text.includes('learn') || text.includes('teach') || text.includes('help')) {
    return "I'm here to help you learn languages! We can practice vocabulary, pronunciation, or have simple conversations. What language interests you?";
  }
  
  if (text.includes('thank') || text.includes('thanks')) {
    return "You're welcome! I'm happy to help you practice languages anytime!";
  }
  
  if (text.includes('bye') || text.includes('goodbye')) {
    return "Goodbye! Hope to talk to you again soon. Keep practicing!";
  }
  
  // Default response if no keywords match
  return getRandomResponse();
};

/**
 * Simulates a delayed response from LangPal
 * @param userText The text from the user
 * @param callback Function to call with the response
 * @param delay Delay in ms before responding (defaults to random time between 1-3 seconds)
 */
export const simulateResponse = (
  userText: string, 
  callback: (response: string) => void,
  delay = Math.floor(Math.random() * 2000) + 1000
): void => {
  setTimeout(() => {
    const response = getKeywordBasedResponse(userText);
    callback(response);
  }, delay);
};