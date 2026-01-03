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
   * @returns {Promise<{language: string, questions: Array, model: string, usage: {promptTokens: number, completionTokens: number, totalTokens: number, costUsd: number}}>} Object with language, questions, model, and usage data
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
        questions: data.questions,
        model: result.model,
        usage: result.usage
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
 * Generate a structured explanation for wrong answer using OpenRouter.
 * Returns both the general explanation (cacheable) and personalized feedback.
 * @param {string} question - The question text
 * @param {string} userAnswer - The user's answer
 * @param {string} correctAnswer - The correct answer
 * @param {string} gradeLevel - The grade level
 * @param {string} apiKey - The OpenRouter API key
 * @param {string} language - Language code for the explanation (e.g., 'en', 'pt-PT')
 * @returns {Promise<{rightAnswerExplanation: string, wrongAnswerExplanation: string}>} Structured explanation
 */
export async function generateExplanation(question, userAnswer, correctAnswer, gradeLevel =
'middle school', apiKey, language = 'en') {
  const languageName = LANGUAGE_NAMES[language] || 'English';
  logger.debug('Generating structured explanation for incorrect answer', { language });

  if (!apiKey) {
    throw new Error('API key is required');
  }

  const prompt = `A ${gradeLevel} student answered a quiz question incorrectly. Provide an explanation in JSON format.

Question: ${question}
Student's answer: ${userAnswer}
Correct answer: ${correctAnswer}

Return a JSON object with exactly these two fields:
{
  "rightAnswerExplanation": "Why the correct answer is right (2-3 sentences, educational, encouraging)",
  "wrongAnswerExplanation": "Why the student's specific answer was incorrect (1-2 sentences, helpful)"
}

Requirements:
- Be encouraging and supportive
- Use language appropriate for ${gradeLevel} level
- Write in ${languageName} (${language})
- Return ONLY the JSON object, no other text`;

  try {
    const result = await callOpenRouter(apiKey, prompt, {
      maxTokens: 500,
      temperature: 0.7
    });

    // Parse JSON response
    let data;
    try {
      let jsonText = result.text.trim();

      // Remove BOM if present
      if (jsonText.charCodeAt(0) === 0xFEFF) {
        jsonText = jsonText.slice(1);
      }

      // Handle markdown code blocks
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }
      jsonText = jsonText.trim();

      // Try to extract JSON if there's extra text before/after it
      // Look for { ... } pattern that contains our expected fields
      if (!jsonText.startsWith('{')) {
        const jsonMatch = jsonText.match(/\{[\s\S]*"rightAnswerExplanation"[\s\S]*"wrongAnswerExplanation"[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      } else if (!jsonText.endsWith('}')) {
        // JSON starts correctly but has trailing text
        const lastBrace = jsonText.lastIndexOf('}');
        if (lastBrace > 0) {
          jsonText = jsonText.slice(0, lastBrace + 1);
        }
      }

      // Normalize smart quotes to straight quotes
      jsonText = jsonText
        .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
        .replace(/[\u2018\u2019]/g, "'"); // Smart single quotes

      data = JSON.parse(jsonText);
    } catch (parseError) {
      logger.error('Failed to parse explanation JSON', { parseError: parseError.message, rawText: result.text.substring(0, 200) });
      // Fallback: return a user-friendly message instead of raw JSON
      return {
        rightAnswerExplanation: '',
        wrongAnswerExplanation: ''
      };
    }

    logger.debug('Structured explanation generated successfully');

    return {
      rightAnswerExplanation: data.rightAnswerExplanation || '',
      wrongAnswerExplanation: data.wrongAnswerExplanation || ''
    };

  } catch (error) {
    logger.error('Explanation generation failed', { error: error.message });
    throw error;
  }
}

/**
 * Generate only the wrong answer explanation (when right answer explanation is already cached).
 * @param {string} question - The question text
 * @param {string} userAnswer - The user's answer
 * @param {string} correctAnswer - The correct answer
 * @param {string} gradeLevel - The grade level
 * @param {string} apiKey - The OpenRouter API key
 * @param {string} language - Language code for the explanation (e.g., 'en', 'pt-PT')
 * @returns {Promise<string>} Wrong answer explanation text
 */
export async function generateWrongAnswerExplanation(question, userAnswer, correctAnswer, gradeLevel =
'middle school', apiKey, language = 'en') {
  const languageName = LANGUAGE_NAMES[language] || 'English';
  logger.debug('Generating wrong answer explanation only', { language });

  if (!apiKey) {
    throw new Error('API key is required');
  }

  const prompt = `A ${gradeLevel} student answered a quiz question incorrectly.

Question: ${question}
Student's answer: ${userAnswer}
Correct answer: ${correctAnswer}

Explain briefly (1-2 sentences) why the student's specific answer "${userAnswer}" was incorrect.
Be helpful and encouraging. Write in ${languageName} (${language}).
Provide only the explanation, no other text.`;

  try {
    const result = await callOpenRouter(apiKey, prompt, {
      maxTokens: 200,
      temperature: 0.7
    });

    logger.debug('Wrong answer explanation generated successfully');

    return result.text.trim();

  } catch (error) {
    logger.error('Wrong answer explanation generation failed', { error: error.message });
    throw error;
  }
}