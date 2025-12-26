import { logger } from '../utils/logger.js';

/**
 * Show a bottom sheet modal with explanation for an incorrect answer
 * @param {Object} options - Modal options
 * @param {string} options.question - The question text
 * @param {string} options.userAnswer - User's incorrect answer
 * @param {string} options.correctAnswer - The correct answer
 * @param {Function} options.onFetchExplanation - Async function to fetch explanation
 * @returns {Promise<void>} Resolves when modal is closed
 */
export function showExplanationModal({ question, userAnswer, correctAnswer, onFetchExplanation }) {
  return new Promise((resolve) => {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'explanationModal';
    backdrop.className = 'fixed inset-0 bg-black/50 z-50 flex items-end justify-center';

    // Extract just the answer text (remove A), B), etc. prefix if present)
    const cleanUserAnswer = userAnswer.replace(/^[A-D]\)\s*/, '');
    const cleanCorrectAnswer = correctAnswer.replace(/^[A-D]\)\s*/, '');

    backdrop.innerHTML = `
      <div class="bg-card-light dark:bg-card-dark rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto transform transition-transform duration-300 translate-y-full" id="explanationSheet">
        <!-- Drag Handle -->
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-12 h-1 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
        </div>

        <!-- INCORRECT Badge -->
        <div class="flex justify-center mb-4">
          <span class="bg-error/20 text-error px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-base">error</span>
            INCORRECT
          </span>
        </div>

        <!-- Question -->
        <h2 class="text-text-light dark:text-text-dark text-xl font-bold text-center px-6 mb-6">${question}</h2>

        <!-- Answer Cards Side by Side -->
        <div class="flex gap-3 px-4 mb-6">
          <!-- User's Answer -->
          <div class="flex-1 bg-error/10 rounded-xl p-4">
            <div class="flex items-center gap-2 text-error text-sm mb-1">
              <span class="material-symbols-outlined text-base">close</span>
              YOU SELECTED
            </div>
            <p class="text-text-light dark:text-text-dark text-lg font-semibold">${cleanUserAnswer}</p>
          </div>
          <!-- Correct Answer -->
          <div class="flex-1 bg-success/10 rounded-xl p-4 border border-success/30">
            <div class="flex items-center justify-between text-success text-sm mb-1">
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base">check</span>
                CORRECT ANSWER
              </span>
              <span class="material-symbols-outlined">check_circle</span>
            </div>
            <p class="text-text-light dark:text-text-dark text-lg font-semibold">${cleanCorrectAnswer}</p>
          </div>
        </div>

        <!-- Divider -->
        <hr class="border-border-light dark:border-border-dark mx-4 mb-6">

        <!-- Explanation Section -->
        <div class="px-4 mb-6" id="explanationContent">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-primary">lightbulb</span>
            <h3 class="text-text-light dark:text-text-dark font-bold text-lg">Why it's ${cleanCorrectAnswer}</h3>
          </div>
          <!-- Loading state -->
          <div id="explanationLoading" class="flex items-center gap-2 text-subtext-light dark:text-subtext-dark">
            <span class="material-symbols-outlined animate-spin">progress_activity</span>
            <span>Generating explanation...</span>
          </div>
          <!-- Explanation text (hidden initially) -->
          <p id="explanationText" class="text-subtext-light dark:text-subtext-dark leading-relaxed hidden"></p>
          <!-- Error state (hidden initially) -->
          <div id="explanationError" class="hidden">
            <p class="text-error mb-3">Failed to generate explanation.</p>
            <button id="retryBtn" class="text-primary font-medium hover:underline">Try again</button>
          </div>
        </div>

        <!-- Got it Button -->
        <div class="px-4 pb-8">
          <button id="gotItBtn" class="w-full bg-primary rounded-xl py-4 font-bold text-white flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
            Got it!
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Animate sheet in
    const sheet = backdrop.querySelector('#explanationSheet');
    requestAnimationFrame(() => {
      sheet.classList.remove('translate-y-full');
      sheet.classList.add('translate-y-0');
    });

    // Function to close modal
    const closeModal = () => {
      sheet.classList.remove('translate-y-0');
      sheet.classList.add('translate-y-full');
      setTimeout(() => {
        backdrop.remove();
        resolve();
      }, 300);
    };

    // Function to fetch and display explanation
    const fetchExplanation = async () => {
      const loadingEl = backdrop.querySelector('#explanationLoading');
      const textEl = backdrop.querySelector('#explanationText');
      const errorEl = backdrop.querySelector('#explanationError');

      loadingEl.classList.remove('hidden');
      textEl.classList.add('hidden');
      errorEl.classList.add('hidden');

      try {
        const explanation = await onFetchExplanation();
        loadingEl.classList.add('hidden');
        textEl.textContent = explanation;
        textEl.classList.remove('hidden');
      } catch (error) {
        logger.error('Failed to fetch explanation', { error: error.message });
        loadingEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
      }
    };

    // Start fetching explanation
    fetchExplanation();

    // Handle "Got it" button
    const gotItBtn = backdrop.querySelector('#gotItBtn');
    gotItBtn.addEventListener('click', closeModal);

    // Handle retry button
    const retryBtn = backdrop.querySelector('#retryBtn');
    retryBtn.addEventListener('click', fetchExplanation);

    // Handle backdrop click (close modal)
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  });
}
