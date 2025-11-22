 const FUNCTIONS_URL = '/.netlify/functions';

  /**
   * Generate quiz questions (via backend)
   */
  export async function generateQuestions(topic, gradeLevel = 'middle school') {
    try {
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
      return data.questions;

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
      return data.explanation;

    } catch (error) {
      console.error('Explanation generation failed:', error);
      return 'Sorry, we couldn\'t generate an explanation at this time.';
    }
  }