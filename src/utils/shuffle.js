/**
 * Shuffle utility for answer randomization
 * Prevents position memorization on quiz replays
 */

/**
 * Fisher-Yates shuffle algorithm
 * Creates a new shuffled array without mutating the original
 * @param {Array} array - Array to shuffle
 * @returns {Array} - New shuffled array
 */
function fisherYatesShuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffle answer options for a question
 * Returns a new question object with shuffled options and updated correct index
 *
 * @param {Object} question - Question object with options and correct index
 * @param {string} question.question - The question text
 * @param {Array<string>} question.options - Array of answer options
 * @param {number} question.correct - Index of correct answer (0-3)
 * @param {string} [question.difficulty] - Optional difficulty level
 * @returns {Object} - New question object with shuffled options and updated correct index
 */
export function shuffleQuestionOptions(question) {
  const { options, correct, ...rest } = question;

  // Handle edge cases
  if (!options || options.length === 0) {
    return question;
  }

  if (options.length === 1) {
    return question;
  }

  // Create indices array and shuffle it
  const indices = options.map((_, i) => i);
  const shuffledIndices = fisherYatesShuffle(indices);

  // Reorder options based on shuffled indices
  const shuffledOptions = shuffledIndices.map(i => options[i]);

  // Find new position of correct answer
  const newCorrectIndex = shuffledIndices.indexOf(correct);

  return {
    ...rest,
    options: shuffledOptions,
    correct: newCorrectIndex
  };
}

/**
 * Shuffle all questions in an array
 * Each question gets its options shuffled independently
 *
 * @param {Array<Object>} questions - Array of question objects
 * @returns {Array<Object>} - New array with shuffled options in each question
 */
export function shuffleAllQuestions(questions) {
  if (!questions || !Array.isArray(questions)) {
    return questions;
  }

  return questions.map(q => shuffleQuestionOptions(q));
}
