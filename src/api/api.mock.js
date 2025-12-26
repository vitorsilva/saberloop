// api.mock.js - Mock API for testing without real Claude API calls
import { logger } from '../utils/logger.js';

  /**
   * Mock question generation - returns fake but realistic questions
   * @param {string} topic - The topic to generate questions about
   * @param {string} gradeLevel - The grade level for the questions
   * @param {string} _apiKey - The API key (unused in mock, accepted for interface consistency)
   * @param {Object} options - Optional settings
   * @param {Array<string>} options.previousQuestions - Questions to exclude (for continue feature)
   * @returns {Promise<Array>} Array of 5 question objects
   */
  export async function generateQuestions(topic, gradeLevel = 'middle school', _apiKey, options = {}) {
    // Simulate network delay (real APIs take time)
    // Can be overridden via window.MOCK_API_DELAY_MS for testing
    const delay = (typeof window !== 'undefined' && window.MOCK_API_DELAY_MS) || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    const { previousQuestions = [] } = options;
    logger.debug('Mock API generating questions', { topic, gradeLevel, previousQuestionsCount: previousQuestions.length });

    // Return realistic mock data
    const mockQuestions = [
      {
        question: `What is the main concept behind ${topic}?`,
        options: [
          "A) The first option about the topic",
          "B) The correct answer explaining the core concept",
          "C) A common misconception",
          "D) An unrelated distractor"
        ],
        correct: 1, // Index of correct option (B)
        difficulty: "easy"
      },
      {
        question: `How would you apply ${topic} in a real-world scenario?`,
        options: [
          "A) By ignoring the basic principles",
          "B) By using only memorized facts",
          "C) By understanding and applying the underlying concepts",
          "D) By guessing randomly"
        ],
        correct: 1, // Index of correct option (C)
        difficulty: "medium"
      },
      {
        question: `Which of the following best describes ${topic}?`,
        options: [
          "A) A complex theory with no practical use",
          "B) A fundamental concept used in many areas",
          "C) An outdated idea no longer relevant",
          "D) A simple fact that requires no understanding"
        ],
        correct: 1, // Index of correct option (B)
        difficulty: "easy"
      },
      {
        question: `What is a common mistake students make when learning ${topic}?`,
        options: [
          "A) They understand it too well",
          "B) They confuse it with a related but different concept",
          "C) They never make mistakes with this topic",
          "D) They always get it right on the first try"
        ],
        correct: 1, // Index of correct option (B)
        difficulty: "medium"
      },
      {
        question: `In advanced applications, how does ${topic} connect to other concepts?`,
        options: [
          "A) It exists in complete isolation from everything else",
          "B) It serves as a foundation for more complex ideas",
          "C) It contradicts all other known concepts",
          "D) It has no relationship to anything else"
        ],
        correct: 1, // Index of correct option (B)
        difficulty: "challenging"
      }
    ];

    logger.debug('Mock API questions generated', { count: mockQuestions.length, language: 'EN-US' });

    return {
      language: 'EN-US',
      questions: mockQuestions
    };
  }

  /**
   * Mock explanation generation - returns fake but helpful explanations
   * @param {string} question - The question text
   * @param {string} userAnswer - The user's answer
   * @param {string} correctAnswer - The correct answer
   * @param {string} gradeLevel - The grade level
   * @param {string} _apiKey - The API key (unused in mock, accepted for interface consistency)
   * @returns {Promise<string>} The explanation text
   */
  export async function generateExplanation(question, userAnswer, correctAnswer, gradeLevel =
  'middle school', _apiKey) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    logger.debug('Mock API generating explanation');

    const mockExplanation =  `Your answer (${userAnswer}) wasn't quite right, but that's okay - this is how we learn!    


  The correct answer is ${correctAnswer}. This is because the concept works differently than you       
  might have initially thought. Think of it like this: imagine you're building with blocks - you       
  need to understand how each piece fits together before you can build something complex.

  The key thing to remember is that understanding the foundations helps everything else make sense.
   Keep practicing, and you'll get it! 🌟`;

   logger.debug('Mock API explanation generated');

   return mockExplanation;
  }