  <?php
  require_once __DIR__ . '/../Config.php';
  require_once __DIR__ . '/../AnthropicClient.php';
  require_once __DIR__ . '/../handlers/GenerateQuestionsHandler.php';

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

      // Create client and handler
      $client = new AnthropicClient();
      $handler = new GenerateQuestionsHandler($client);

      // Delegate to handler
      return $handler->handle($body);
  }