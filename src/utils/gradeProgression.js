/**
 * Grade Level Progression Utility
 *
 * Calculates the next grade level based on continue count.
 * Progression: 2 continues -> level up, then 4 more -> level up, then 8 more -> level up
 * Thresholds (cumulative): 2, 6, 14
 */

export const GRADE_LEVELS = ['elementary', 'middle school', 'high school', 'college'];

// Cumulative continue counts at which to level up
export const PROGRESSION_THRESHOLDS = [2, 6, 14];

/**
 * Calculate the next grade level based on continue count
 * @param {number} continueCount - Number of times user has continued (0 = initial quiz)
 * @param {string} startingLevel - The grade level when the chain started
 * @returns {string} The grade level for the next quiz
 */
export function calculateNextGradeLevel(continueCount, startingLevel) {
  const startingIndex = GRADE_LEVELS.indexOf(startingLevel);

  // If starting level is not found, default to middle school
  if (startingIndex === -1) {
    return 'middle school';
  }

  // Count how many thresholds have been passed
  let levelsToAdd = 0;
  for (const threshold of PROGRESSION_THRESHOLDS) {
    if (continueCount >= threshold) {
      levelsToAdd++;
    }
  }

  // Calculate new level, capped at college (index 3)
  const newIndex = Math.min(startingIndex + levelsToAdd, GRADE_LEVELS.length - 1);

  return GRADE_LEVELS[newIndex];
}

/**
 * Get the number of continues until next level up
 * @param {number} continueCount - Current continue count
 * @returns {number|null} Continues until next level, or null if at max progression
 */
export function getContinuesUntilNextLevel(continueCount) {
  for (const threshold of PROGRESSION_THRESHOLDS) {
    if (continueCount < threshold) {
      return threshold - continueCount;
    }
  }
  return null; // Already at max progression
}
