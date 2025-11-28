  <?php

  use PHPUnit\Framework\TestCase;

  require_once __DIR__ . '/../src/handlers/GenerateQuestionsHandler.php';
  require_once __DIR__ . '/../src/AnthropicClient.php';

  class GenerateQuestionsHandlerTest extends TestCase
  {
      public function testReturnsErrorWhenTopicMissing()
      {
          // Create a mock client (won't be used for this test)
          $mockClient = $this->createMock(AnthropicClient::class);

          $handler = new GenerateQuestionsHandler($mockClient);
          $result = $handler->handle([]);

          $this->assertEquals(400, $result['statusCode']);
          $this->assertArrayHasKey('error', $result['body']);
      }

      public function testReturnsErrorWhenTopicTooShort()
      {
          $mockClient = $this->createMock(AnthropicClient::class);

          $handler = new GenerateQuestionsHandler($mockClient);
          $result = $handler->handle(['topic' => 'A']);

          $this->assertEquals(400, $result['statusCode']);
          $this->assertStringContainsString('at least 2 characters', $result['body']['details'][0]);
      }

      public function testReturnsErrorWhenTopicTooLong()
      {
          $mockClient = $this->createMock(AnthropicClient::class);

          $handler = new GenerateQuestionsHandler($mockClient);
          $result = $handler->handle(['topic' => str_repeat('A', 201)]);

          $this->assertEquals(400, $result['statusCode']);
          $this->assertStringContainsString('less than 200', $result['body']['details'][0]);
      }

      public function testReturnsQuestionsOnSuccess()
      {
          // Create mock that returns fake API response
          $mockClient = $this->createMock(AnthropicClient::class);

          // Mock the sendMessage method
          $mockClient->method('sendMessage')
              ->willReturn(['content' => [['text' => 'fake']]]);

          // Mock extractText to return valid JSON
          $mockClient->method('extractText')
              ->willReturn('{"language": "EN-US", "questions": [
                  {"question": "Q1?", "options": ["A", "B", "C", "D"], "correct": 0, "difficulty": "easy"},
                  {"question": "Q2?", "options": ["A", "B", "C", "D"], "correct": 1, "difficulty": "easy"},
                  {"question": "Q3?", "options": ["A", "B", "C", "D"], "correct": 2, "difficulty": "medium"},
                  {"question": "Q4?", "options": ["A", "B", "C", "D"], "correct": 3, "difficulty": "medium"},
                  {"question": "Q5?", "options": ["A", "B", "C", "D"], "correct": 0, "difficulty": "challenging"}      
              ]}');

          $handler = new GenerateQuestionsHandler($mockClient);
          $result = $handler->handle(['topic' => 'Math', 'gradeLevel' => '5th grade']);

          $this->assertEquals(200, $result['statusCode']);
          $this->assertEquals('EN-US', $result['body']['language']);
          $this->assertCount(5, $result['body']['questions']);
      }

      public function testHandlesMarkdownWrappedJson()
      {
          $mockClient = $this->createMock(AnthropicClient::class);

          $mockClient->method('sendMessage')
              ->willReturn(['content' => [['text' => 'fake']]]);

          // Return JSON wrapped in markdown (like Claude sometimes does)
          $mockClient->method('extractText')
              ->willReturn('```json
  {"language": "EN-US", "questions": [
      {"question": "Q1?", "options": ["A", "B", "C", "D"], "correct": 0, "difficulty": "easy"},
      {"question": "Q2?", "options": ["A", "B", "C", "D"], "correct": 1, "difficulty": "easy"},
      {"question": "Q3?", "options": ["A", "B", "C", "D"], "correct": 2, "difficulty": "medium"},
      {"question": "Q4?", "options": ["A", "B", "C", "D"], "correct": 3, "difficulty": "medium"},
      {"question": "Q5?", "options": ["A", "B", "C", "D"], "correct": 0, "difficulty": "challenging"}
  ]}
  ```');

          $handler = new GenerateQuestionsHandler($mockClient);
          $result = $handler->handle(['topic' => 'Science']);

          $this->assertEquals(200, $result['statusCode']);
          $this->assertCount(5, $result['body']['questions']);
      }
  }