  // api.real.js - Uses OpenRouter for LLM calls (client-side)

  import { callOpenRouter } from './openrouter-client.js';
  import { getOpenRouterKey } from '../db/db.js';
  import { logger } from '../utils/logger.js';

  /**
   * Generate quiz questions using OpenRouter
   */
  export async function generateQuestions(topic, gradeLevel = 'middle school') {
    logger.debug('Generating questions', { topic, gradeLevel });

    // Get stored API key
    const apiKey = await getOpenRouterKey();
    if (!apiKey) {
      throw new Error('Not connected to OpenRouter. Please connect in Settings.');
    }

    // Build the prompt (same as Netlify function)
    const prompt = `You are an expert educational content creator. Generate exactly 5
  multiple-choice questions about "${topic}" appropriate for ${gradeLevel} students.

  LANGUAGE REQUIREMENT (CRITICAL):
  - Detect the language of the topic "${topic}"
  - Generate ALL questions and ALL answer options in the SAME language as the topic
  - For example:
  - If topic is "Digestive System" → questions in English (EN-US)
  - If topic is "Sistema Digestivo" → questions in Portuguese (PT-PT)
  - If topic is "Système Digestif" → questions in French (FR-FR)
  - Do NOT mix languages - everything must be consistent
  - If the topic language is ambiguous, default to English (EN-US)

  Requirements:
  - Each question should have 4 answer options (A, B, C, D)
  - Only one correct answer per question
  - Include a mix of difficulty: 2 easy, 2 medium, 1 challenging
  - Questions should test understanding, not just memorization
  - Use clear, concise language appropriate for ${gradeLevel}
  - Avoid ambiguous phrasing
  - No trick questions

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
  - ALL text must be in the same language as the topic
  - The "language" field must be a locale code (e.g., "EN-US", "PT-PT", "ES-ES", "FR-FR")
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
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length !== 5) {
        logger.error('Invalid questions structure', { questionCount: data.questions?.length });
        throw new Error('AI returned invalid question format');
      }

      logger.debug('Questions generated successfully', { language: data.language, count: data.questions.length });

      return {
        language: data.language || 'EN-US',
        questions: data.questions
      };

    } catch (error) {
      logger.error('Question generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate explanation for wrong answer using OpenRouter
   */
  export async function generateExplanation(question, userAnswer, correctAnswer, gradeLevel =
  'middle school') {
    logger.debug('Generating explanation for incorrect answer');

    // Get stored API key
    const apiKey = await getOpenRouterKey();
    if (!apiKey) {
      throw new Error('Not connected to OpenRouter. Please connect in Settings.');
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
  - Detect the language of the question and respond in the same language

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