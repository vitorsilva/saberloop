n// prompts.js - Prompt templates for Claude API

  /**
   * Generate question prompt for Claude
   * @param {string} topic - The topic to generate questions about
   * @param {string} gradeLevel - The grade level (default: 'middle school')
   * @returns {string} The formatted prompt
   */
  export function createQuestionPrompt(topic, gradeLevel = 'middle school') {
    return `You are an expert educational content creator. Generate exactly 5
  multiple-choice questions about "${topic}" appropriate for ${gradeLevel}
  students.

  Requirements:
  - Each question should have 4 answer options (A, B, C, D)
  - Only one correct answer per question
  - Include a mix of difficulty: 2 easy, 2 medium, 1 challenging
  - Questions should test understanding, not just memorization
  - Use clear, concise language appropriate for ${gradeLevel}
  - Avoid ambiguous phrasing
  - No trick questions

  Return your response as a JSON array with this exact structure:
  [
    {
      "question": "The question text here?",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct": "A",
      "difficulty": "easy"
    }
  ]

  IMPORTANT: Return ONLY the JSON array, no other text before or after.`;
  }

  /**
   * Generate explanation prompt for incorrect answer
   * @param {string} question - The question that was asked
   * @param {string} userAnswer - The answer the user selected
   * @param {string} correctAnswer - The correct answer
   * @param {string} gradeLevel - The grade level
   * @returns {string} The formatted prompt
   */
  export function createExplanationPrompt(question, userAnswer, correctAnswer,
  gradeLevel = 'middle school') {
    return `You are a patient, encouraging tutor helping a ${gradeLevel} student
  who answered a question incorrectly.

  Question: ${question}
  Student's Answer: ${userAnswer}
  Correct Answer: ${correctAnswer}

  Provide a brief, helpful explanation (under 150 words) that:
  1. Explains why their answer was incorrect (1 sentence, not critical)
  2. Clarifies the correct concept (2-3 sentences)
  3. Includes a relatable analogy or real-world example
  4. Ends with an encouraging note

  Tone: Friendly, supportive, not condescending
  Format: Plain text, no markdown headers`;
  }