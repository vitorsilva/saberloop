import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the dependencies before importing the module
vi.mock('./openrouter-client.js', () => ({
  callOpenRouter: vi.fn()
}));

vi.mock('../utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    perf: vi.fn()
  }
}));

import { generateQuestions } from './api.real.js';
import { callOpenRouter } from './openrouter-client.js';

// Helper to generate mock questions of a specific count
function generateMockQuestions(count) {
  return Array.from({ length: count }, (_, i) => ({
    question: `Q${i + 1}?`,
    options: ['A', 'B', 'C', 'D'],
    correct: i % 4,
    difficulty: ['easy', 'medium', 'challenging'][i % 3]
  }));
}

describe('generateQuestions prompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should include guidance for distinct answer options', async () => {
    // Arrange: Mock the API to capture the prompt
    let capturedPrompt = '';
    callOpenRouter.mockImplementation(async (apiKey, prompt) => {
      capturedPrompt = prompt;
      return {
        text: JSON.stringify({
          language: 'EN-US',
          questions: [
            { question: 'Q1?', options: ['A', 'B', 'C', 'D'], correct: 0, difficulty: 'easy' },
            { question: 'Q2?', options: ['A', 'B', 'C', 'D'], correct: 1, difficulty: 'easy' },
            { question: 'Q3?', options: ['A', 'B', 'C', 'D'], correct: 2, difficulty: 'medium' },
            { question: 'Q4?', options: ['A', 'B', 'C', 'D'], correct: 3, difficulty: 'medium' },
            { question: 'Q5?', options: ['A', 'B', 'C', 'D'], correct: 0, difficulty: 'challenging' }
          ]
        })
      };
    });

    // Act: Call the function
    await generateQuestions('Test Topic', 'middle school', 'fake-api-key');

    // Assert: Check that the prompt contains guidance for distinct options
    expect(capturedPrompt).toContain('DISTINCT');
    expect(capturedPrompt).toMatch(/logical.*inverse|inverse.*logical/i);
    expect(capturedPrompt).toMatch(/factually incorrect|genuinely incorrect/i);
  });

  it('should include previous questions in prompt when provided', async () => {
    // Arrange: Mock the API to capture the prompt
    let capturedPrompt = '';
    callOpenRouter.mockImplementation(async (apiKey, prompt) => {
      capturedPrompt = prompt;
      return {
        text: JSON.stringify({
          language: 'EN-US',
          questions: [
            { question: 'Q1?', options: ['A', 'B', 'C', 'D'], correct: 0, difficulty: 'easy' },
            { question: 'Q2?', options: ['A', 'B', 'C', 'D'], correct: 1, difficulty: 'easy' },
            { question: 'Q3?', options: ['A', 'B', 'C', 'D'], correct: 2, difficulty: 'medium' },
            { question: 'Q4?', options: ['A', 'B', 'C', 'D'], correct: 3, difficulty: 'medium' },
            { question: 'Q5?', options: ['A', 'B', 'C', 'D'], correct: 0, difficulty: 'challenging' }
          ]
        })
      };
    });

    // Act: Call with previous questions
    const previousQuestions = [
      'What is the capital of France?',
      'Who wrote Romeo and Juliet?'
    ];
    await generateQuestions('Test Topic', 'middle school', 'fake-api-key', { previousQuestions });

    // Assert: Check that previous questions are included
    expect(capturedPrompt).toContain('AVOID DUPLICATE QUESTIONS');
    expect(capturedPrompt).toContain('What is the capital of France?');
    expect(capturedPrompt).toContain('Who wrote Romeo and Juliet?');
  });

  it('should not include exclusion section when no previous questions', async () => {
    // Arrange: Mock the API to capture the prompt
    let capturedPrompt = '';
    callOpenRouter.mockImplementation(async (apiKey, prompt) => {
      capturedPrompt = prompt;
      return {
        text: JSON.stringify({
          language: 'EN-US',
          questions: [
            { question: 'Q1?', options: ['A', 'B', 'C', 'D'], correct: 0, difficulty: 'easy' },
            { question: 'Q2?', options: ['A', 'B', 'C', 'D'], correct: 1, difficulty: 'easy' },
            { question: 'Q3?', options: ['A', 'B', 'C', 'D'], correct: 2, difficulty: 'medium' },
            { question: 'Q4?', options: ['A', 'B', 'C', 'D'], correct: 3, difficulty: 'medium' },
            { question: 'Q5?', options: ['A', 'B', 'C', 'D'], correct: 0, difficulty: 'challenging' }
          ]
        })
      };
    });

    // Act: Call without previous questions
    await generateQuestions('Test Topic', 'middle school', 'fake-api-key');

    // Assert: Exclusion section should not be present
    expect(capturedPrompt).not.toContain('AVOID DUPLICATE QUESTIONS');
  });

  it('should use default questionCount of 5 in prompt', async () => {
    let capturedPrompt = '';
    callOpenRouter.mockImplementation(async (apiKey, prompt) => {
      capturedPrompt = prompt;
      return {
        text: JSON.stringify({
          language: 'EN-US',
          questions: generateMockQuestions(5)
        })
      };
    });

    await generateQuestions('Test Topic', 'middle school', 'fake-api-key');

    expect(capturedPrompt).toContain('Generate exactly 5');
  });

  it('should use custom questionCount in prompt', async () => {
    let capturedPrompt = '';
    callOpenRouter.mockImplementation(async (apiKey, prompt) => {
      capturedPrompt = prompt;
      return {
        text: JSON.stringify({
          language: 'EN-US',
          questions: generateMockQuestions(10)
        })
      };
    });

    await generateQuestions('Test Topic', 'middle school', 'fake-api-key', { questionCount: 10 });

    expect(capturedPrompt).toContain('Generate exactly 10');
  });

  it('should validate response has correct number of questions', async () => {
    callOpenRouter.mockImplementation(async () => {
      return {
        text: JSON.stringify({
          language: 'EN-US',
          questions: generateMockQuestions(3) // Wrong count
        })
      };
    });

    await expect(
      generateQuestions('Test Topic', 'middle school', 'fake-api-key', { questionCount: 5 })
    ).rejects.toThrow('AI returned invalid question format');
  });

  it('should accept response with matching questionCount', async () => {
    callOpenRouter.mockImplementation(async () => {
      return {
        text: JSON.stringify({
          language: 'EN-US',
          questions: generateMockQuestions(15)
        })
      };
    });

    const result = await generateQuestions('Test Topic', 'middle school', 'fake-api-key', { questionCount: 15 });

    expect(result.questions).toHaveLength(15);
  });
});
