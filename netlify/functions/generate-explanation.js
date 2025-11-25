 const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  export const handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: ''
      };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    try {
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

      const { question, userAnswer, correctAnswer, gradeLevel } = body;

      // Validate input
      if (!question || !userAnswer || !correctAnswer) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Missing required fields' })
        };
      }

      const API_KEY = process.env.ANTHROPIC_API_KEY;

      if (!API_KEY) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Server configuration error' })
        };
      }

      // Create prompt
      const prompt = `You are a patient, encouraging tutor helping a ${gradeLevel ||
  'middle school'} student who answered a question incorrectly.

    LANGUAGE REQUIREMENT (CRITICAL):
  - Detect the language of the question below
  - Provide your ENTIRE explanation in the SAME language as the question
  - Do NOT mix languages - if the question is in Portuguese, explain in Portuguese
  - If language is unclear, default to English

  Question: ${question}
  Student's Answer: ${userAnswer}
  Correct Answer: ${correctAnswer}

  Provide a brief, helpful explanation (under 150 words) that:
  1. Explains why their answer was incorrect (1 sentence, not critical)
  2. Clarifies the correct concept (2-3 sentences)
  3. Includes a relatable analogy or real-world example
  4. Ends with an encouraging note

  Tone: Friendly, supportive, not condescending
  Format: Plain text, no markdown headers
  IMPORTANT: Your entire response must be in the same language as the question.`;

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
          max_tokens: 512,
          temperature: 0.7,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

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

      const data = await response.json();
      const explanation = data.content[0].text;

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ explanation })
      };

    } catch (error) {
      console.error('Function error:', error);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Failed to generate explanation',
          message: error.message
        })
      };
    }
  };