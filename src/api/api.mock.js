// api.mock.js - Mock API for testing without real Claude API calls
    const devLog = (...args) => {
      if (import.meta.env.DEV) {
        console.log(...args);
      }
    };

  /**
   * Mock question generation - returns fake but realistic questions
   * @param {string} topic - The topic to generate questions about
   * @param {string} gradeLevel - The grade level for the questions
   * @returns {Promise<Array>} Array of 5 question objects
   */
  export async function generateQuestions(topic, gradeLevel = 'middle school') {
    // Simulate network delay (real APIs take time)
    await new Promise(resolve => setTimeout(resolve, 1000));


    devLog(`[MOCK API] Generating questions for "${topic}" (${gradeLevel})`);

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
        correctAnswer: 1, // Index of correct option (B)
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
        correctAnswer: 2, // Index of correct option (C)
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
        correctAnswer: 1, // Index of correct option (B)
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
        correctAnswer: 1, // Index of correct option (B)
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
        correctAnswer: 1, // Index of correct option (B)
        difficulty: "challenging"
      }
    ];

    devLog('[MOCK API] Generated questions:', mockQuestions);

    return mockQuestions;
  }

  /**
   * Mock explanation generation - returns fake but helpful explanations
   * @param {string} question - The question text
   * @param {string} userAnswer - The user's answer
   * @param {string} correctAnswer - The correct answer
   * @param {string} gradeLevel - The grade level
   * @returns {Promise<string>} The explanation text
   */
  export async function generateExplanation(question, userAnswer, correctAnswer, gradeLevel =
  'middle school') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    devLog(`[MOCK API] Generating explanation for incorrect answer`);

    const mockExplanation =  `Your answer (${userAnswer}) wasn't quite right, but that's okay - this is how we learn!    


  The correct answer is ${correctAnswer}. This is because the concept works differently than you       
  might have initially thought. Think of it like this: imagine you're building with blocks - you       
  need to understand how each piece fits together before you can build something complex.

  The key thing to remember is that understanding the foundations helps everything else make sense.    
   Keep practicing, and you'll get it! 🌟`;
   
   devLog('[MOCK API] Generated explanation:', mockExplanation);
   
   return mockExplanation;
  }