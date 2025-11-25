  // CORS headers for all responses
  const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Input validation helper
  function validateRequest(body) {
    const errors = [];

    if (!body.topic || typeof body.topic !== 'string') {
      errors.push('Topic is required and must be a string');
    } else {
      if (body.topic.trim().length < 2) {
        errors.push('Topic must be at least 2 characters');
      }
      if (body.topic.length > 200) {
        errors.push('Topic must be less than 200 characters');
      }
    }

    if (body.gradeLevel && typeof body.gradeLevel !== 'string') {
      errors.push('Grade level must be a string');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  export const handler = async (event, context) => {
    // Handle CORS preflight (browsers send this before POST)
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: ''
      };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    try {
      // Parse and validate request body
      let body;
      try {
        body = JSON.parse(event.body);
      } catch (parseError) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
      }

      const { topic, gradeLevel } = body;

      // Validate input
      const validation = validateRequest(body);
      if (!validation.valid) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            error: 'Validation failed',
            details: validation.errors
          })
        };
      }

      // Get API key from environment variable
      const API_KEY = process.env.ANTHROPIC_API_KEY;

      if (!API_KEY) {
        console.error('ANTHROPIC_API_KEY not set');
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Server configuration error' })
        };
      }

      // Create prompt
      const prompt = `You are an expert educational content creator. Generate exactly 5 multiple-choice questions about "${topic}" appropriate for ${gradeLevel || 'middle school'} students.

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
  - Use clear, concise language appropriate for ${gradeLevel || 'middle school'}
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
  - The "correct" field must be a NUMBER (0 for first option, 1 for second option, 2 for third option, 3 for fourth option)
  - ALL text must be in the same language as the topic
  - The "language" field must be a locale code (e.g., "EN-US", "PT-PT", "ES-ES", "FR-FR")
  - Return ONLY the JSON object, no other text before or after.`;

      // Call Anthropic API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          temperature: 0.7,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      // Handle API errors
      if (!response.ok) {
        let errorMessage = 'API request failed';
        try {
          const error = await response.json();
          errorMessage = error.error?.message || errorMessage;
        } catch (parseError) {
          const textError = await response.text();
          errorMessage = textError || errorMessage;
        }

        console.error('Anthropic API error:', errorMessage);
        return {
          statusCode: response.status,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: errorMessage })
        };
      }

      // Parse response
      const originalResponse = await response.json();
      const text = originalResponse.content[0].text;

      // Parse JSON from response
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse questions JSON:', text);
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Invalid response format from API' })
        };
      }

      // Validate structure
      if (!data.questions || !Array.isArray(data.questions) ||
      data.questions.length !== 5) {
        console.error('Invalid questions structure:', data);
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Invalid response format from API' })
        };
      }

      // Return success with language
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          language: data.language || 'EN-US',
          questions: data.questions
        })
      };

    } catch (error) {
      console.error('Function error:', error);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Failed to generate questions',
          message: error.message
        })
      };
    }
  };