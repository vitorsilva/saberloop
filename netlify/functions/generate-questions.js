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

  exports.handler = async (event, context) => {
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
  school'} students.

  Requirements:
  - Each question should have 4 answer options (A, B, C, D)
  - Only one correct answer per question
  - Include a mix of difficulty: 2 easy, 2 medium, 1 challenging
  - Questions should test understanding, not just memorization
  - Use clear, concise language appropriate for ${gradeLevel || 'middle school'}
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
      const data = await response.json();
      const text = data.content[0].text;

      // Parse JSON from response
      let questions;
      try {
        questions = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse questions JSON:', text);
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Invalid response format from API' })
        };
      }

      // Validate structure
      if (!Array.isArray(questions) || questions.length !== 5) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Invalid response format from API' })
        };
      }

      // Return success
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ questions })
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