  <?php

  use PHPUnit\Framework\TestCase;

  require_once __DIR__ . '/../src/handlers/GenerateExplanationHandler.php';
  require_once __DIR__ . '/../src/AnthropicClient.php';
  
  class GenerateExplanationHandlerTest extends TestCase
  {
      public function testReturnsErrorWhenQuestionMissing()
      {
          $mockClient = $this->createMock(AnthropicClient::class);

          $handler = new GenerateExplanationHandler($mockClient);
          $result = $handler->handle([
              'userAnswer' => 'A',
              'correctAnswer' => 'B'
          ]);

          $this->assertEquals(400, $result['statusCode']);
          $this->assertEquals('Missing required fields', $result['body']['error']);
      }

      public function testReturnsErrorWhenUserAnswerMissing()
      {
          $mockClient = $this->createMock(AnthropicClient::class);

          $handler = new GenerateExplanationHandler($mockClient);
          $result = $handler->handle([
              'question' => 'What is 2+2?',
              'correctAnswer' => 'B'
          ]);

          $this->assertEquals(400, $result['statusCode']);
          $this->assertEquals('Missing required fields', $result['body']['error']);
      }

      public function testReturnsErrorWhenCorrectAnswerMissing()
      {
          $mockClient = $this->createMock(AnthropicClient::class);

          $handler = new GenerateExplanationHandler($mockClient);
          $result = $handler->handle([
              'question' => 'What is 2+2?',
              'userAnswer' => 'A'
          ]);

          $this->assertEquals(400, $result['statusCode']);
          $this->assertEquals('Missing required fields', $result['body']['error']);
      }

      public function testReturnsExplanationOnSuccess()
      {
          $mockClient = $this->createMock(AnthropicClient::class);

          $mockClient->method('sendMessage')
              ->willReturn(['content' => [['text' => 'fake']]]);

          $mockClient->method('extractText')
              ->willReturn('Great effort! The correct answer is B because 2+2=4. Keep practicing!');

          $handler = new GenerateExplanationHandler($mockClient);
          $result = $handler->handle([
              'question' => 'What is 2+2?',
              'userAnswer' => 'A) 3',
              'correctAnswer' => 'B) 4',
              'gradeLevel' => '3rd grade'
          ]);

          $this->assertEquals(200, $result['statusCode']);
          $this->assertArrayHasKey('explanation', $result['body']);
          $this->assertStringContainsString('Keep practicing', $result['body']['explanation']);
      }

      public function testUsesDefaultGradeLevel()
      {
          $mockClient = $this->createMock(AnthropicClient::class);

          // Capture the prompt to verify grade level
          $mockClient->expects($this->once())
              ->method('sendMessage')
              ->with(
                  $this->equalTo(''),
                  $this->stringContains('middle school'),
                  $this->equalTo(512)
              )
              ->willReturn(['content' => [['text' => 'fake']]]);

          $mockClient->method('extractText')
              ->willReturn('Explanation text here.');

          $handler = new GenerateExplanationHandler($mockClient);
          $handler->handle([
              'question' => 'Test question?',
              'userAnswer' => 'A',
              'correctAnswer' => 'B'
          ]);
      }
  }