  // api.real.js - Uses OpenRouter for LLM calls (client-side)

  import { callOpenRouter } from './openrouter-client.js';
  import { logger } from '../utils/logger.js';
  import { getSelectedModel } from '../services/model-service.js';

  // Language code to full name mapping
  const LANGUAGE_NAMES = {
    'en': 'English',
    'pt-PT': 'Portuguese (European)',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German'
  };

  /**
   * Generate quiz questions using OpenRouter
   * @param {string} topic - The topic to generate questions about
   * @param {string} gradeLevel - The grade level for the questions
   * @param {string} apiKey - The OpenRouter API key
   * @param {Object} [options] - Optional settings
   * @param {Array<string>} [options.previousQuestions] - Questions to exclude (for continue feature)
   * @param {string} [options.language] - Language code for content generation (e.g., 'en', 'pt-PT')
   * @param {number} [options.questionCount] - Number of questions to generate (default: 5)
   * @returns {Promise<{language: string, questions: Array}>} Object with language and questions array
   */
  export async function generateQuestions(topic, gradeLevel = 'middle school', apiKey, options = {}) {
    const startTime = performance.now();
    const { previousQuestions = [], language = 'en', questionCount = 5 } = options;
    const languageName = LANGUAGE_NAMES[language] || 'English';
    logger.debug('Generating questions', { topic, gradeLevel, language, previousQuestionsCount: previousQuestions.length });

    if (!apiKey) {
      throw new Error('API key is required');
    }

    // Build exclusion section if there are previous questions
    const exclusionSection = previousQuestions.length > 0
      ? `
IMPORTANT - AVOID DUPLICATE QUESTIONS:
The following questions have already been asked. Generate NEW questions
that cover DIFFERENT aspects of the topic:

Previously asked questions:
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

If you cannot generate 5 completely new questions, generate as many new
ones as possible and note any that might overlap.
`
      : '';

    // Build the prompt for question generation
    const prompt = `You are an expert educational content creator. Generate exactly ${questionCount}
  multiple-choice questions about "${topic}" appropriate for ${gradeLevel} students.
${exclusionSection}

  LANGUAGE REQUIREMENT (CRITICAL):
  - Generate ALL content in ${languageName} (${language})
  - The questions, ALL answer options, and any text must be in ${languageName}
  - Do NOT auto-detect language from the topic
  - Even if the topic is written in a different language, respond in ${languageName}
  - Do NOT mix languages - everything must be in ${languageName}

  Requirements:
  - Each question should have 4 answer options (A, B, C, D)
  - Only one correct answer per question
  - Include a mix of difficulty levels: easy, medium, and challenging
  - Questions should test understanding, not just memorization
  - Use clear, concise language appropriate for ${gradeLevel}
  - Avoid ambiguous phrasing
  - No trick questions

  CRITICAL - Answer Option Quality:
  - Each answer option must represent a DISTINCT claim
  - Wrong answers must be factually incorrect, not alternative phrasings of the correct answer
  - NEVER generate logical inverse pairs (e.g., "X increases Y" and "not-X decreases Y" are the same fact)
  - Each wrong answer (distractor) should test a different misconception

  CORRECT ANSWER DISTRIBUTION:
  - Distribute correct answers across positions A, B, C, D
  - Vary which position has the correct answer across all questions
  - Do NOT cluster all correct answers in the same position

  Return your response as a JSON object with this exact structure:
  {
    "language": "XX-XX",
    "questions": [
      {
        "question": "The question text here?",
        "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
        "correct": 0,
        "difficulty": "easy"
      }
    ]
  }

  IMPORTANT:
  - The "correct" field must be a NUMBER (0 for first option, 1 for second option, 2 for third
  option, 3 for fourth option)
  - ALL text must be in ${languageName}
  - The "language" field should be "${language}"
  - Return ONLY the JSON object, no other text before or after.`;

    try {
      // Call OpenRouter
      const result = await callOpenRouter(apiKey, prompt, {
        maxTokens: 2048,
        temperature: 0.7
      });

      logger.debug('OpenRouter raw response received');

      // Parse JSON from response
      let data;
      try {
        // Sometimes models wrap JSON in markdown code blocks
        let jsonText = result.text.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.slice(7);
        }
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.slice(3);
        }
        if (jsonText.endsWith('```')) {
          jsonText = jsonText.slice(0, -3);
        }
        data = JSON.parse(jsonText.trim());
      } catch (parseError) {
        logger.error('Failed to parse questions JSON', { parseError: parseError.message });
        throw new Error('Invalid response format from AI');
      }

      // Validate structure
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length !== questionCount) {
        logger.error('Invalid questions structure', { expected: questionCount, received: data.questions?.length });
        throw new Error('AI returned invalid question format');
      }

      const duration = Math.round(performance.now() - startTime);
      logger.debug('Questions generated successfully', { language: data.language, count: data.questions.length, model: result.model });
      logger.perf('quiz_generation', { value: duration, status: 'success', topic, model: result.model });

      return {
        language: data.language || 'EN-US',
        questions: data.questions
      };

    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const model = getSelectedModel(); // Get model for error tracking
      logger.error('Question generation failed', { error: error.message, model });
      logger.perf('quiz_generation', { value: duration, status: 'error', topic, model, error: error.message });
      throw error;
    }
  }

  /**
   * Generate explanation for wrong answer using OpenRouter
   * @param {string} question - The question text
   * @param {string} userAnswer - The user's answer
   * @param {string} correctAnswer - The correct answer
   * @param {string} gradeLevel - The grade level
   * @param {string} apiKey - The OpenRouter API key
   * @param {string} language - Language code for the explanation (e.g., 'en', 'pt-PT')
   */
  export async function generateExplanation(question, userAnswer, correctAnswer, gradeLevel =
  'middle school', apiKey, language = 'en') {
    const languageName = LANGUAGE_NAMES[language] || 'English';
    logger.debug('Generating explanation for incorrect answer', { language });

    if (!apiKey) {
      throw new Error('API key is required');
    }

    const prompt = `A ${gradeLevel} student answered a quiz question incorrectly. Please provide
   a brief, encouraging explanation of why the correct answer is right and help them understand
  the concept.

  Question: ${question}
  Student's answer: ${userAnswer}
  Correct answer: ${correctAnswer}

  Requirements:
  - Be encouraging and supportive
  - Explain why the correct answer is right
  - Briefly explain why the student's answer was incorrect (if different from correct)
  - Keep the explanation concise (2-3 sentences max)
  - Use language appropriate for ${gradeLevel} level
  - Write the explanation in ${languageName} (${language})

  Provide only the explanation, no other text.`;

    try {
      const result = await callOpenRouter(apiKey, prompt, {
        maxTokens: 500,
        temperature: 0.7
      });

      logger.debug('Explanation generated successfully');

      return result.text.trim();

    } catch (error) {
      logger.error('Explanation generation failed', { error: error.message });
      return 'Sorry, we couldn\'t generate an explanation at this time.';
    }
  }