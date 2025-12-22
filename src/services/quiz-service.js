/**
 * Quiz Service - Business logic for quiz operations
 * Views should use this instead of importing db directly
 */
import { getRecentSessions, getSession, saveSession, updateSession } from '../core/db.js';

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
