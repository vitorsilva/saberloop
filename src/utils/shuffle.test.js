/**
 * Unit tests for shuffle utility
 */
import { describe, it, expect, vi } from 'vitest';
import { shuffleQuestionOptions, shuffleAllQuestions } from './shuffle.js';

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

  it('should preserve all options (just reordered)', () => {
    const shuffled = shuffleQuestionOptions(sampleQuestion);

    expect(shuffled.options).toHaveLength(4);
    expect(shuffled.options.sort()).toEqual(sampleQuestion.options.sort());
  });

  it('should update correct index to point to same option text', () => {
    const shuffled = shuffleQuestionOptions(sampleQuestion);

    // The correct answer text should be the same
    const originalCorrectText = sampleQuestion.options[sampleQuestion.correct];
    const shuffledCorrectText = shuffled.options[shuffled.correct];

    expect(shuffledCorrectText).toBe(originalCorrectText);
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
    expect(shuffled.options[shuffled.correct]).toBe('A) Correct');
  });

  it('should handle question with correct at position 3', () => {
    const question = {
      question: 'Test?',
      options: ['A) Wrong1', 'B) Wrong2', 'C) Wrong3', 'D) Correct'],
      correct: 3
    };

    const shuffled = shuffleQuestionOptions(question);
    expect(shuffled.options[shuffled.correct]).toBe('D) Correct');
  });

  it('should handle question with fewer than 4 options', () => {
    const question = {
      question: 'True or False?',
      options: ['True', 'False'],
      correct: 0
    };

    const shuffled = shuffleQuestionOptions(question);
    expect(shuffled.options).toHaveLength(2);
    expect(shuffled.options[shuffled.correct]).toBe('True');
  });

  it('should handle question with single option', () => {
    const question = {
      question: 'Only one option?',
      options: ['The only answer'],
      correct: 0
    };

    const shuffled = shuffleQuestionOptions(question);
    expect(shuffled.options).toEqual(['The only answer']);
    expect(shuffled.correct).toBe(0);
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
    expect(shuffled[0].options[shuffled[0].correct]).toBe('A');
    expect(shuffled[1].options[shuffled[1].correct]).toBe('Y');
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
