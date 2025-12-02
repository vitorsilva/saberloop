  // WelcomeView - First-time user onboarding

  import BaseView from './BaseView.js';
  import { startAuth } from '../api/openrouter-auth.js';
  import { markWelcomeSeen } from '../utils/welcome-version.js';

  export default class WelcomeView extends BaseView {
    async render() {
      this.setHTML(`
        <div class="flex min-h-screen flex-col bg-background-light
  dark:bg-background-dark">
          <div class="flex flex-1 flex-col items-center justify-center p-6">

            <!-- Hero Section -->
            <div class="mb-8 flex flex-col items-center">
              <div class="mb-6 flex h-24 w-24 items-center justify-center
  rounded-3xl bg-primary/10">
                <span class="material-symbols-outlined text-5xl
  text-primary">psychology</span>
              </div>
              <h1 class="text-3xl font-bold text-text-light dark:text-text-dark">    
                Welcome to Saberloop
              </h1>
              <p class="mt-2 text-center text-subtext-light
  dark:text-subtext-dark">
                AI-powered quizzes on any topic
              </p>
            </div>

            <!-- Features List -->
            <div class="mb-10 w-full max-w-sm space-y-4">
              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl    
   bg-card-light dark:bg-card-dark">
                  <span class="material-symbols-outlined text-xl
  text-primary">target</span>
                </div>
                <div>
                  <p class="font-medium text-text-light
  dark:text-text-dark">Personalized Quizzes</p>
                  <p class="text-sm text-subtext-light dark:text-subtext-dark">On    
   any topic you choose</p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl    
   bg-card-light dark:bg-card-dark">
                  <span class="material-symbols-outlined text-xl
  text-primary">trending_up</span>
                </div>
                <div>
                  <p class="font-medium text-text-light
  dark:text-text-dark">Track Progress</p>
                  <p class="text-sm text-subtext-light
  dark:text-subtext-dark">See your improvement over time</p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl    
   bg-card-light dark:bg-card-dark">
                  <span class="material-symbols-outlined text-xl
  text-primary">offline_bolt</span>
                </div>
                <div>
                  <p class="font-medium text-text-light
  dark:text-text-dark">Works Offline</p>
                  <p class="text-sm text-subtext-light
  dark:text-subtext-dark">Review past quizzes anytime</p>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="w-full max-w-sm">
              <button
                id="getStartedBtn"
                class="flex h-14 w-full items-center justify-center rounded-xl       
  bg-primary font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90    
   transition-colors"
              >
                Get Started Free
              </button>
              <p class="mt-3 text-center text-sm text-subtext-light
  dark:text-subtext-dark">
                Free tier: 50 quizzes/day • No credit card required
              </p>
              <p class="mt-2 text-center text-xs text-subtext-light
  dark:text-subtext-dark">
                <span class="material-symbols-outlined text-xs
  align-middle">info</span>
                Powered by OpenRouter
              </p>
            </div>

            <button
              id="skipBtn"
              class="mt-4 text-sm text-subtext-light dark:text-subtext-dark
hover:text-primary transition-colors underline"
            >
              Skip for now
            </button>
            
          </div>
        </div>
      `);

      this.attachListeners();
    }

    attachListeners() {

      const skipBtn = this.querySelector('#skipBtn');

      this.addEventListener(skipBtn, 'click', async () => {
        await markWelcomeSeen();
        this.navigateTo('/');
      });
            
      const btn = this.querySelector('#getStartedBtn');

      this.addEventListener(btn, 'click', async () => {
        // Check if online
        if (!navigator.onLine) {
          this.showError('You need internet to connect. Please check your connection.');
          return;
        }

        // Show loading state
        btn.disabled = true;
        btn.innerHTML = `
          <span class="material-symbols-outlined animate-spin
  mr-2">progress_activity</span>
          Connecting...
        `;

        try {
          await startAuth();
        } catch (error) {
          console.error('Auth failed:', error);
          btn.disabled = false;
          btn.textContent = 'Get Started Free';
          this.showError('Failed to connect. Please try again.');
        }
      });
    }

    showError(message) {
      // Remove existing error
      const existing = this.querySelector('#authError');
      if (existing) existing.remove();

      const errorDiv = document.createElement('div');
      errorDiv.id = 'authError';
      errorDiv.className = 'mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm text-center';
      errorDiv.textContent = message;

      const btn = this.querySelector('#getStartedBtn');
      btn.parentElement.appendChild(errorDiv);
    }
  }