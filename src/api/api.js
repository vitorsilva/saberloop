// api.js - Anthropic Claude API integration

  import { getSetting } from './db.js';
  import { createQuestionPrompt, createExplanationPrompt } from './prompts.js';

  const API_BASE_URL = 'https://api.anthropic.com/v1';
  const API_VERSION = '2023-06-01';

  /**
   * Make a request to Claude API
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Optional settings (model, maxTokens, temperature)
   * @returns {string} The response text from Claude
   */
  async function callClaude(messages, options = {}) {
    // Get API key from IndexedDB settings
    const apiKey = await getSetting('apiKey');

    if (!apiKey) {
      throw new Error('No API key configured. Please add your Anthropic API key in Settings.');        
    }

    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': API_VERSION,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'claude-sonnet-4-5',
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.7,
        messages: messages
      })
    });

    // Handle HTTP errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Generate quiz questions for a topic
   * @param {string} topic - The topic to generate questions about
   * @param {string} gradeLevel - The grade level for the questions
   * @returns {Array} Array of 5 question objects
   */
  export async function generateQuestions(topic, gradeLevel = 'middle school') {
    const prompt = createQuestionPrompt(topic, gradeLevel);

    try {
      const response = await callClaude([
        { role: 'user', content: prompt }
      ]);

      // Parse JSON response
      const questions = JSON.parse(response);

      // Validate structure
      if (!Array.isArray(questions) || questions.length !== 5) {
        throw new Error('Invalid response format from API');
      }

      return questions;

    } catch (error) {
      console.error('Question generation failed:', error);
      throw new Error('Failed to generate questions. Please try again.');
    }
  }

  /**
   * Generate explanation for an incorrect answer
   * @param {string} question - The question text
   * @param {string} userAnswer - The user's answer
   * @param {string} correctAnswer - The correct answer
   * @param {string} gradeLevel - The grade level
   * @returns {string} The explanation text
   */
  export async function generateExplanation(question, userAnswer, correctAnswer, gradeLevel =
  'middle school') {
    const prompt = createExplanationPrompt(question, userAnswer, correctAnswer, gradeLevel);

    try {
      const response = await callClaude([
        { role: 'user', content: prompt }
      ]);

      return response;

    } catch (error) {
      console.error('Explanation generation failed:', error);
      return 'Sorry, we couldn\'t generate an explanation at this time.';
    }
  }