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
});
