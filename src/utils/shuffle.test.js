/**
 * Unit tests for shuffle utility
 */
import { describe, it, expect, vi } from 'vitest';
import { shuffleQuestionOptions, shuffleAllQuestions, stripPrefix, addPrefix } from './shuffle.js';

describe('shuffleQuestionOptions', () => {
  const sampleQuestion = {
    question: 'What is 2 + 2?',
    options: ['A) 3', 'B) 4', 'C) 5', 'D) 6'],
    correct: 1, // B) 4 is correct
    difficulty: 'easy'
  };

  it('should return a new object (not mutate original)', () => {
    const original = { ...sampleQuestion };
    const shuffled = shuffleQuestionOptions(sampleQuestion);

    expect(shuffled).not.toBe(sampleQuestion);
    expect(sampleQuestion).toEqual(original);
  });

  it('should preserve all option content (just reordered with normalized labels)', () => {
    const shuffled = shuffleQuestionOptions(sampleQuestion);

    expect(shuffled.options).toHaveLength(4);
    // Extract answer text (without labels) and compare
    const originalContent = sampleQuestion.options.map(opt => opt.replace(/^[A-D]\)\s*/, '')).sort();
    const shuffledContent = shuffled.options.map(opt => opt.replace(/^[A-D]\)\s*/, '')).sort();
    expect(shuffledContent).toEqual(originalContent);
  });

  it('should update correct index to point to same answer content', () => {
    const shuffled = shuffleQuestionOptions(sampleQuestion);

    // The correct answer content (without label) should be the same
    const originalCorrectContent = sampleQuestion.options[sampleQuestion.correct].replace(/^[A-D]\)\s*/, '');
    const shuffledCorrectContent = shuffled.options[shuffled.correct].replace(/^[A-D]\)\s*/, '');

    expect(shuffledCorrectContent).toBe(originalCorrectContent);
  });

  it('should preserve other question properties', () => {
    const shuffled = shuffleQuestionOptions(sampleQuestion);

    expect(shuffled.question).toBe(sampleQuestion.question);
    expect(shuffled.difficulty).toBe(sampleQuestion.difficulty);
  });

  it('should handle question with correct at position 0', () => {
    const question = {
      question: 'Test?',
      options: ['A) Correct', 'B) Wrong1', 'C) Wrong2', 'D) Wrong3'],
      correct: 0
    };

    const shuffled = shuffleQuestionOptions(question);
    // Correct answer content should be 'Correct' (label may change)
    expect(shuffled.options[shuffled.correct]).toContain('Correct');
  });

  it('should handle question with correct at position 3', () => {
    const question = {
      question: 'Test?',
      options: ['A) Wrong1', 'B) Wrong2', 'C) Wrong3', 'D) Correct'],
      correct: 3
    };

    const shuffled = shuffleQuestionOptions(question);
    // Correct answer content should be 'Correct' (label may change)
    expect(shuffled.options[shuffled.correct]).toContain('Correct');
  });

  it('should handle question with fewer than 4 options', () => {
    const question = {
      question: 'True or False?',
      options: ['True', 'False'],
      correct: 0
    };

    const shuffled = shuffleQuestionOptions(question);
    expect(shuffled.options).toHaveLength(2);
    // Correct answer content should be 'True' (with sequential label added)
    expect(shuffled.options[shuffled.correct]).toContain('True');
  });

  it('should handle question with single option', () => {
    const question = {
      question: 'Only one option?',
      options: ['The only answer'],
      correct: 0
    };

    const shuffled = shuffleQuestionOptions(question);
    // Should return the SAME object reference (early return optimization)
    expect(shuffled).toBe(question);
  });

  it('should handle empty options array', () => {
    const question = {
      question: 'No options?',
      options: [],
      correct: 0
    };

    const result = shuffleQuestionOptions(question);
    expect(result).toEqual(question);
  });

  it('should handle missing options', () => {
    const question = {
      question: 'No options property?',
      correct: 0
    };

    const result = shuffleQuestionOptions(question);
    expect(result).toEqual(question);
  });

  it('should produce different orderings over multiple calls (statistical)', () => {
    // Run shuffle 20 times and check we get at least 2 different orderings
    const orderings = new Set();

    for (let i = 0; i < 20; i++) {
      const shuffled = shuffleQuestionOptions(sampleQuestion);
      orderings.add(JSON.stringify(shuffled.options));
    }

    // With 4 options, there are 24 possible orderings
    // Running 20 times should produce at least 2 different orderings
    expect(orderings.size).toBeGreaterThan(1);
  });

  // Issue #79: Answer labels should always be A, B, C, D in order after shuffle
  describe('label normalization (Issue #79)', () => {
    it('should have options with sequential A, B, C, D labels after shuffle', () => {
      const question = {
        question: 'What is the capital of France?',
        options: ['A) London', 'B) Paris', 'C) Berlin', 'D) Madrid'],
        correct: 1 // B) Paris is correct
      };

      // Run multiple times to ensure labels are always sequential
      for (let i = 0; i < 10; i++) {
        const shuffled = shuffleQuestionOptions(question);

        // Labels should always be A, B, C, D in order
        expect(shuffled.options[0]).toMatch(/^A\)/);
        expect(shuffled.options[1]).toMatch(/^B\)/);
        expect(shuffled.options[2]).toMatch(/^C\)/);
        expect(shuffled.options[3]).toMatch(/^D\)/);
      }
    });

    it('should preserve correct answer content after label normalization', () => {
      const question = {
        question: 'What is 2 + 2?',
        options: ['A) 3', 'B) 4', 'C) 5', 'D) 6'],
        correct: 1 // B) 4 is correct (answer text is "4")
      };

      for (let i = 0; i < 10; i++) {
        const shuffled = shuffleQuestionOptions(question);

        // The correct answer should still contain "4" (the actual answer)
        expect(shuffled.options[shuffled.correct]).toContain('4');
      }
    });
  });
});

describe('shuffleAllQuestions', () => {
  const sampleQuestions = [
    {
      question: 'Q1?',
      options: ['A', 'B', 'C', 'D'],
      correct: 0
    },
    {
      question: 'Q2?',
      options: ['W', 'X', 'Y', 'Z'],
      correct: 2
    }
  ];

  it('should return a new array', () => {
    const shuffled = shuffleAllQuestions(sampleQuestions);
    expect(shuffled).not.toBe(sampleQuestions);
  });

  it('should shuffle each question independently', () => {
    const shuffled = shuffleAllQuestions(sampleQuestions);

    expect(shuffled).toHaveLength(2);
    // Correct answers should contain the original content (labels may change)
    expect(shuffled[0].options[shuffled[0].correct]).toContain('A');
    expect(shuffled[1].options[shuffled[1].correct]).toContain('Y');
  });

  it('should handle empty array', () => {
    const result = shuffleAllQuestions([]);
    expect(result).toEqual([]);
  });

  it('should handle null/undefined', () => {
    expect(shuffleAllQuestions(null)).toBe(null);
    expect(shuffleAllQuestions(undefined)).toBe(undefined);
  });

  it('should handle non-array input', () => {
    const notArray = { foo: 'bar' };
    expect(shuffleAllQuestions(notArray)).toBe(notArray);
  });
});

// Issue #79: Tests for prefix handling helper functions
describe('stripPrefix', () => {
  it('should strip "A) " prefix', () => {
    expect(stripPrefix('A) Paris')).toBe('Paris');
  });

  it('should strip "B) " prefix', () => {
    expect(stripPrefix('B) London')).toBe('London');
  });

  it('should strip "C) " prefix', () => {
    expect(stripPrefix('C) Berlin')).toBe('Berlin');
  });

  it('should strip "D) " prefix', () => {
    expect(stripPrefix('D) Madrid')).toBe('Madrid');
  });

  it('should strip "A. " prefix (dot format)', () => {
    expect(stripPrefix('A. Paris')).toBe('Paris');
  });

  it('should strip lowercase prefix "a) "', () => {
    expect(stripPrefix('a) Paris')).toBe('Paris');
  });

  it('should strip lowercase prefix "b. "', () => {
    expect(stripPrefix('b. London')).toBe('London');
  });

  it('should handle option without prefix', () => {
    expect(stripPrefix('Paris')).toBe('Paris');
  });

  it('should handle option starting with letter but no delimiter', () => {
    expect(stripPrefix('Apple is a fruit')).toBe('Apple is a fruit');
  });

  it('should handle empty string', () => {
    expect(stripPrefix('')).toBe('');
  });

  it('should handle non-string input', () => {
    expect(stripPrefix(null)).toBe(null);
    expect(stripPrefix(undefined)).toBe(undefined);
    expect(stripPrefix(123)).toBe(123);
  });

  it('should preserve content after prefix', () => {
    expect(stripPrefix('A) The capital of France is Paris')).toBe('The capital of France is Paris');
  });
});

describe('addPrefix', () => {
  it('should add "A) " prefix for index 0', () => {
    expect(addPrefix('Paris', 0)).toBe('A) Paris');
  });

  it('should add "B) " prefix for index 1', () => {
    expect(addPrefix('London', 1)).toBe('B) London');
  });

  it('should add "C) " prefix for index 2', () => {
    expect(addPrefix('Berlin', 2)).toBe('C) Berlin');
  });

  it('should add "D) " prefix for index 3', () => {
    expect(addPrefix('Madrid', 3)).toBe('D) Madrid');
  });

  it('should handle index beyond D (uses ASCII)', () => {
    expect(addPrefix('Rome', 4)).toBe('E) Rome');
    expect(addPrefix('Athens', 5)).toBe('F) Athens');
  });

  it('should handle empty string content', () => {
    expect(addPrefix('', 0)).toBe('A) ');
  });

  it('should handle content with special characters', () => {
    expect(addPrefix('São Paulo (Brazil)', 0)).toBe('A) São Paulo (Brazil)');
  });
});
