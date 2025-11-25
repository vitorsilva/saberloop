 const FUNCTIONS_URL = '/.netlify/functions';

    const devLog = (...args) => {
      if (import.meta.env.DEV) {
        console.log(...args);
      }
    };

    /**
   * Generate quiz questions (via backend)
   */
  export async function generateQuestions(topic, gradeLevel = 'middle school') {
    try {

      devLog(`[REAL API] Generating questions for "${topic}" (${gradeLevel})`);
      
      const response = await fetch(`${FUNCTIONS_URL}/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic, gradeLevel })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate questions');
      }

      const data = await response.json();

      devLog('[REAL API] Generated questions:', data.questions);
      devLog('[REAL API] Detected language:', data.language);

      return {
        language: data.language,
        questions: data.questions
      };

    } catch (error) {
      console.error('Question generation failed:', error);
      throw new Error('Failed to generate questions. Please try again.');
    }
  }

  /**
   * Generate explanation (via backend)
   */
  export async function generateExplanation(question, userAnswer, correctAnswer, gradeLevel    
   = 'middle school') {

    devLog(`[REAL API] Generating explanation for incorrect answer`);

    try {
      const response = await fetch(`${FUNCTIONS_URL}/generate-explanation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, userAnswer, correctAnswer, gradeLevel })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate explanation');
      }

      const data = await response.json();

      devLog('[REAL API] Generated explanation:', data.explanation);

      return data.explanation;

    } catch (error) {
      console.error('Explanation generation failed:', error);
      return 'Sorry, we couldn\'t generate an explanation at this time.';
    }
  }