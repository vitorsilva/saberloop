 <?php

  class GenerateExplanationHandler
  {
      private $client;

      public function __construct($client)
      {
          $this->client = $client;
      }

      public function handle($input)
      {
          // Validate required fields
          if (!isset($input['question']) || !isset($input['userAnswer']) || !isset($input['correctAnswer'])) {
              return array(
                  'statusCode' => 400,
                  'body' => array('error' => 'Missing required fields')
              );
          }

          $question = $input['question'];
          $userAnswer = $input['userAnswer'];
          $correctAnswer = $input['correctAnswer'];
          $gradeLevel = isset($input['gradeLevel']) ? $input['gradeLevel'] : 'middle school';

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
              $response = $this->client->sendMessage('', $prompt, 512);
              $explanation = $this->client->extractText($response);

              // Remove markdown code blocks if present
              $explanation = $this->cleanResponse($explanation);

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

      private function cleanResponse($text)
      {
          if (strpos($text, '```') === 0) {
              $text = preg_replace('/^```\w*\n?/', '', $text);
          }
          if (substr($text, -3) === '```') {
              $text = substr($text, 0, -3);
          }
          return trim($text);
      }
  }