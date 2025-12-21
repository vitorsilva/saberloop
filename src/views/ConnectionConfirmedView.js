  import BaseView from './BaseView.js';

  export default class ConnectionConfirmedView extends BaseView {
    constructor() {
      super();
    }

    async render() {
      this.setHTML(`
        <div class="relative flex h-auto min-h-screen w-full flex-col items-center justify-center
          bg-background-light dark:bg-background-dark overflow-x-hidden px-4">

          <!-- Success checkmark -->
          <div class="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30
            flex items-center justify-center mb-6">
            <svg class="w-10 h-10 text-green-600 dark:text-green-400" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </div>

          <!-- Title -->
          <h1 class="text-text-light dark:text-text-dark text-2xl font-bold mb-2">
            Connection Confirmed!
          </h1>

          <!-- Subtitle -->
          <p class="text-subtext-light dark:text-subtext-dark text-center mb-8">
            Your free OpenRouter account is connected.
          </p>

          <!-- Placeholder for benefits list -->
          <p class="text-subtext-light dark:text-subtext-dark text-sm mb-8">
            (Full content coming in Phase 4)
          </p>

          <!-- CTA Button -->
          <button id="start-quiz-btn" class="w-full max-w-xs px-6 py-3 rounded-lg
            bg-primary hover:bg-primary-dark text-white font-medium transition-colors">
            Start Your First Quiz
          </button>

        </div>
      `);

      this.setupEventListeners();
    }

    setupEventListeners() {
      const startBtn = document.getElementById('start-quiz-btn');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          this.navigateTo('/');
        });
      }
    }
  }