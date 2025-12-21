 import BaseView from './BaseView.js';

  export default class OpenRouterGuideView extends BaseView {
    constructor() {
      super();
    }

    async render() {
      this.setHTML(`
        <div class="relative flex h-auto min-h-screen w-full flex-col
          bg-background-light dark:bg-background-dark overflow-x-hidden">

          <!-- Header with back button -->
          <div class="flex items-center p-4 pb-2
            bg-background-light dark:bg-background-dark">
            <button id="back-btn" class="p-2 -ml-2 mr-2 rounded-full
              hover:bg-card-light dark:hover:bg-card-dark transition-colors">
              <svg class="w-6 h-6 text-text-light dark:text-text-dark" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="text-text-light dark:text-text-dark text-lg font-bold
              leading-tight tracking-[-0.015em]">Set up OpenRouter</h1>
          </div>

          <!-- Placeholder content -->
          <div class="flex-grow px-4 py-8">
            <p class="text-text-light dark:text-text-dark text-center">
              OpenRouter Guide - Coming Soon
            </p>
            <p class="text-subtext-light dark:text-subtext-dark text-center text-sm mt-2">
              (This is a shell view for testing routes)
            </p>
          </div>

        </div>
      `);

      this.setupEventListeners();
    }

    setupEventListeners() {
      const backBtn = document.getElementById('back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          window.history.back();
        });
      }
    }
  }