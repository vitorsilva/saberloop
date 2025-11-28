<?php
require_once __DIR__ . '/../Config.php';
require_once __DIR__ . '/../AnthropicClient.php';
function handleGenerateQuestions($requestBody)
{
    // Parse JSON body
    $body = json_decode($requestBody, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return array(
            'statusCode' => 400,
            'body' => array('error' => 'Invalid JSON in request body')
        );
    }
    // Validate input
    $validation = validateGenerateQuestionsRequest($body);
    if (!$validation['valid']) {
        return array(
            'statusCode' => 400,
            'body' => array(
                'error' => 'Validation failed',
                'details' => $validation['errors']
            )
        );
    }
    $topic = $body['topic'];
    $gradeLevel = isset($body['gradeLevel']) ? $body['gradeLevel'] : 'middle school';
    // Build the prompt
    $prompt = 'You are an expert educational content creator. Generate exactly 5 multiple-choice questions        
about "' . $topic . '" appropriate for ' . $gradeLevel . ' students.
LANGUAGE REQUIREMENT (CRITICAL):
- Detect the language of the topic "' . $topic . '"
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
- Use clear, concise language appropriate for ' . $gradeLevel . '
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
- The "correct" field must be a NUMBER (0 for first option, 1 for second option, 2 for third option, 3 for        
fourth option)
- ALL text must be in the same language as the topic
- The "language" field must be a locale code (e.g., "EN-US", "PT-PT", "ES-ES", "FR-FR")
- Return ONLY the JSON object, no other text before or after.';
    try {
        // Call Anthropic API
        $client = new AnthropicClient();
        $response = $client->sendMessage('', $prompt, 2048);

        $text = $client->extractText($response);

        // Log raw response
        error_log('Raw API response length: ' . strlen($text));
        error_log('First 50 chars: ' . substr($text, 0, 50));

        // Remove markdown code blocks if present
        $text = trim($text);
        if (strpos($text, '```json') !== false) {
            error_log('Found ```json, removing...');
            $text = preg_replace('/^```json\s*/', '', $text);
            $text = preg_replace('/\s*```$/', '', $text);
        } elseif (strpos($text, '```') !== false) {
            error_log('Found ```, removing...');
            $text = preg_replace('/^```\s*/', '', $text);
            $text = preg_replace('/\s*```$/', '', $text);
        }
        $text = trim($text);

        error_log('After cleanup, first 50 chars: ' . substr($text, 0, 50));

        // Parse JSON from Claude's response
        $data = json_decode($text, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('JSON parse error: ' . json_last_error_msg());
            error_log('Failed to parse questions JSON: ' . $text);
            return array(
                'statusCode' => 500,
                'body' => array('error' => 'Invalid response format from API')
            );
        }

        // Validate structure
        if (!isset($data['questions']) || !is_array($data['questions']) || count($data['questions']) !== 5) {     
            error_log('Invalid questions structure: ' . $text);
            return array(
                'statusCode' => 500,
                'body' => array('error' => 'Invalid response format from API')
            );
        }
        // Return success
        return array(
            'statusCode' => 200,
            'body' => array(
                'language' => isset($data['language']) ? $data['language'] : 'EN-US',
                'questions' => $data['questions']
            )
        );
    } catch (Exception $e) {
        error_log('Generate questions error: ' . $e->getMessage());
        return array(
            'statusCode' => 500,
            'body' => array(
                'error' => 'Failed to generate questions',
                'message' => $e->getMessage()
            )
        );
    }
}
function validateGenerateQuestionsRequest($body)
{
    $errors = array();
    if (!isset($body['topic']) || !is_string($body['topic'])) {
        $errors[] = 'Topic is required and must be a string';
    } else {
        if (strlen(trim($body['topic'])) < 2) {
            $errors[] = 'Topic must be at least 2 characters';
        }
        if (strlen($body['topic']) > 200) {
            $errors[] = 'Topic must be less than 200 characters';
        }
    }
    if (isset($body['gradeLevel']) && !is_string($body['gradeLevel'])) {
        $errors[] = 'Grade level must be a string';
    }
    return array(
        'valid' => count($errors) === 0,
        'errors' => $errors
    );
}