import BaseView from './BaseView.js';
import state from '../core/state.js';
import { generateQuestions } from '../services/quiz-service.js';
import { getApiKey } from '../services/auth-service.js';
import { logger } from '../utils/logger.js';

// Default timing constants (can be overridden via window.LOADING_VIEW_CONFIG for testing)
const getConfig = () => {
  const defaults = {
    ESTIMATED_DURATION_SECONDS: 60,
    SHOW_COUNTDOWN_AFTER_SECONDS: 20
  };
  return window.LOADING_VIEW_CONFIG || defaults;
};

export default class LoadingView extends BaseView {
  constructor() {
    super();
    this.loadingMessages = [
      'Preparing your questions...',
      'Consulting our AI teacher...',
      'Crafting the perfect quiz...',
      'Almost ready...'
    ];
    this.extendedMessages = [
      "Teaching an AI isn't easy...",
      'Our AI is thinking extra hard...'
    ];
    this.currentMessageIndex = 0;
    this.messageInterval = null;
    this.countdownInterval = null;
    this.elapsedSeconds = 0;
    this.extendedMessagesAdded = false;
  }

  async render() {
    const topic = state.get('currentTopic');
    const gradeLevel = state.get('currentGradeLevel');

    if (!topic) {
      this.navigateTo('/topic-input');
      return;
    }

    // Check if offline
    const isOffline = !navigator.onLine;

    this.setHTML(`
      <div class="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark items-center justify-center">
        <!-- Loading Content -->
        <div class="flex flex-col items-center gap-6 p-8 text-center">

          <!-- Animated Spinner -->
          <div class="relative">
            <div class="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
            <div class="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>

          <!-- Topic Display -->
          <div class="mt-4">
            <p class="text-sm text-subtext-light dark:text-subtext-darkuppercase tracking-wider">
              Generating quiz for
            </p>
            <h1 data-testid="loading-topic" class="text-2xl font-bold text-text-light dark:text-text-dark mt-2">
              ${this.escapeHtml(topic)}
            </h1>
            <p class="text-sm text-subtext-light dark:text-subtext-dark mt-1">    
              ${gradeLevel || 'Middle School'} Level
            </p>
          </div>

          <!-- Dynamic Message -->
          <p id="loadingMessage" data-testid="loading-message" class="text-base text-primary font-medium animate-pulse">
            ${isOffline ? 'You appear to be offline...' : this.loadingMessages[0]}
          </p>

          <!-- Countdown Timer (hidden initially, shown after delay) -->
          <p id="countdownText" class="text-sm text-subtext-light dark:text-subtext-dark hidden">
          </p>

          <!-- Progress Dots -->
          <div class="flex gap-2 mt-4">
            <span class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </div>

          <!-- Offline Warning -->
          ${isOffline ? `
            <div class="mt-4 p-4 bg-warning/10 border border-warning rounded-lg max-w-sm">
              <p class="text-sm text-warning">
                You're offline. Quiz generation requires an internet connection.
              </p>
            </div>
          ` : ''}

        </div>

        <!-- Cancel Button -->
        <div class="absolute bottom-8 left-0 right-0 flex justify-center">        
          <button id="cancelBtn" class="px-6 py-2 text-sm text-subtext-light dark:text-subtext-dark hover:text-error transition-colors">
            Cancel
          </button>
        </div>
      </div>
    `);

    this.attachListeners();

    if (!isOffline) {
      this.startMessageRotation();
      this.startCountdownTimer();
      this.startQuizGeneration(topic, gradeLevel);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  startMessageRotation() {
    this.messageInterval = setInterval(() => {
      this.currentMessageIndex = (this.currentMessageIndex + 1) % this.loadingMessages.length;
      const messageEl = this.querySelector('#loadingMessage');
      if (messageEl) {
        messageEl.textContent = this.loadingMessages[this.currentMessageIndex];
      }
    }, 2000);
  }

  startCountdownTimer() {
    const config = getConfig();
    this.elapsedSeconds = 0;
    this.extendedMessagesAdded = false;

    this.countdownInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.updateCountdown();
    }, 1000);
  }

  updateCountdown() {
    const config = getConfig();
    const countdownEl = this.querySelector('#countdownText');
    if (!countdownEl) return;

    const { ESTIMATED_DURATION_SECONDS, SHOW_COUNTDOWN_AFTER_SECONDS } = config;

    // Don't show countdown until after the initial delay
    if (this.elapsedSeconds < SHOW_COUNTDOWN_AFTER_SECONDS) {
      return;
    }

    // Show the countdown element
    countdownEl.classList.remove('hidden');

    // Calculate remaining time
    const remaining = ESTIMATED_DURATION_SECONDS - this.elapsedSeconds;

    if (remaining > 0) {
      countdownEl.textContent = `About ${remaining} seconds remaining...`;
    } else {
      countdownEl.textContent = 'Almost done...';

      // Add extended messages to rotation (only once)
      if (!this.extendedMessagesAdded) {
        this.extendedMessagesAdded = true;
        this.loadingMessages = [...this.loadingMessages, ...this.extendedMessages];
      }
    }
  }

  async startQuizGeneration(topic, gradeLevel) {
    try {
      // Get API key via auth service
      const apiKey = await getApiKey();
      if (!apiKey) {
        throw new Error('Not connected to OpenRouter. Please connect in Settings.');
      }

      // Build options for question generation
      const options = {};

      // If continuing on topic, pass previous questions to exclude
      const continueChain = state.getContinueChain();
      if (continueChain && continueChain.topic === topic) {
        options.previousQuestions = continueChain.previousQuestions;
      }

      const result = await generateQuestions(topic, gradeLevel, apiKey, options);

      // Store questions and language in state for QuizView
      state.set('generatedQuestions', result.questions);
      state.set('quizLanguage', result.language);

      // Clear interval before navigating
      this.cleanup();

      // Navigate to quiz
      this.navigateTo('/quiz');

    } catch (error) {
      logger.error('Failed to generate questions', { error: error.message });
      this.cleanup();

      // Show specific error message to help user diagnose the issue
      alert(error.message || 'Failed to generate questions. Please try again.');
      this.navigateTo('/topic-input');
    }
  }

  attachListeners() {
    const cancelBtn = this.querySelector('#cancelBtn');
    if (cancelBtn) {
      this.addEventListener(cancelBtn, 'click', () => {
        if (confirm('Are you sure you want to cancel?')) {
          this.cleanup();
          this.navigateTo('/topic-input');
        }
      });
    }
  }

  cleanup() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
      this.messageInterval = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  destroy() {
    this.cleanup();
    super.destroy();
  }
}
