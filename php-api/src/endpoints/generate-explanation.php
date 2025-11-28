<?php
require_once __DIR__ . '/../Config.php';
require_once __DIR__ . '/../AnthropicClient.php';
function handleGenerateExplanation($requestBody)
{
    // Parse JSON body
    $body = json_decode($requestBody, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return array(
            'statusCode' => 400,
            'body' => array('error' => 'Invalid JSON in request body')
        );
    }
    // Validate required fields
    if (!isset($body['question']) || !isset($body['userAnswer']) || !isset($body['correctAnswer'])) {
        return array(
            'statusCode' => 400,
            'body' => array('error' => 'Missing required fields')
        );
    }
    $question = $body['question'];
    $userAnswer = $body['userAnswer'];
    $correctAnswer = $body['correctAnswer'];
    $gradeLevel = isset($body['gradeLevel']) ? $body['gradeLevel'] : 'middle school';
    // Build the prompt
    $prompt = 'You are a patient, encouraging tutor helping a ' . $gradeLevel . ' student who answered a
question incorrectly.
LANGUAGE REQUIREMENT (CRITICAL):
- Detect the language of the question below
- Provide your ENTIRE explanation in the SAME language as the question
- Do NOT mix languages - if the question is in Portuguese, explain in Portuguese
- If language is unclear, default to English
Question: ' . $question . '
Student\'s Answer: ' . $userAnswer . '
Correct Answer: ' . $correctAnswer . '
Provide a brief, helpful explanation (under 150 words) that:
1. Explains why their answer was incorrect (1 sentence, not critical)
2. Clarifies the correct concept (2-3 sentences)
3. Includes a relatable analogy or real-world example
4. Ends with an encouraging note
Tone: Friendly, supportive, not condescending
Format: Plain text, no markdown headers
IMPORTANT: Your entire response must be in the same language as the question.';
    try {
        // Call Anthropic API
        $client = new AnthropicClient();
        $response = $client->sendMessage('', $prompt, 512);
        $explanation = $client->extractText($response);
        // Return success
        return array(
            'statusCode' => 200,
            'body' => array('explanation' => $explanation)
        );
    } catch (Exception $e) {
        error_log('Generate explanation error: ' . $e->getMessage());
        return array(
            'statusCode' => 500,
            'body' => array(
                'error' => 'Failed to generate explanation',
                'message' => $e->getMessage()
            )
        );
    }
}