/**
 * Quiz Service - Business logic for quiz operations
 * Views should use this instead of importing db or api directly
 */
import { getRecentSessions, getSession, saveSession, updateSession } from '../core/db.js';
import { generateQuestions as apiGenerateQuestions, generateExplanation as apiGenerateExplanation } from '../api/index.js';

/**
 * Get quiz history (recent sessions)
 * @param {number} limit - Maximum sessions to return
 * @returns {Promise<Array>} Recent quiz sessions
 */
export async function getQuizHistory(limit = 10) {
  return getRecentSessions(limit);
}

/**
 * Get a specific quiz session by ID
 * @param {number} id - Session ID
 * @returns {Promise<Object|null>} Quiz session or null
 */
export async function getQuizSession(id) {
  return getSession(id);
}

/**
 * Save a new quiz session
 * @param {Object} sessionData - Quiz session data
 * @returns {Promise<number>} New session ID
 */
export async function saveQuizSession(sessionData) {
  return saveSession(sessionData);
}

/**
 * Update an existing quiz session
 * @param {number} id - Session ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateQuizSession(id, updates) {
  return updateSession(id, updates);
}

/**
 * Generate quiz questions using AI
 * @param {string} topic - Quiz topic
 * @param {string} gradeLevel - Education level
 * @param {string} apiKey - OpenRouter API key
 * @param {Object} [options] - Optional settings
 * @param {Array<string>} [options.previousQuestions] - Questions to exclude (for continue feature)
 * @param {string} [options.language] - Language code for content generation (e.g., 'en', 'pt-PT')
 * @param {number} [options.questionCount] - Number of questions to generate (default: 5)
 * @returns {Promise<{questions: Array, language: string}>}
 */
export async function generateQuestions(topic, gradeLevel, apiKey, options = {}) {
  return apiGenerateQuestions(topic, gradeLevel, apiKey, options);
}

/**
 * Generate an explanation for an incorrect answer
 * @param {string} question - The question text
 * @param {string} userAnswer - User's incorrect answer
 * @param {string} correctAnswer - The correct answer
 * @param {string} gradeLevel - Education level
 * @param {string} apiKey - OpenRouter API key
 * @param {string} language - Language code for the explanation (e.g., 'en', 'pt-PT')
 * @returns {Promise<string>} Explanation text
 */
export async function generateExplanation(question, userAnswer, correctAnswer, gradeLevel, apiKey, language = 'en') {
  return apiGenerateExplanation(question, userAnswer, correctAnswer, gradeLevel, apiKey, language);
}
