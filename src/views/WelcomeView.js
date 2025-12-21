  // WelcomeView - First-time user onboarding

  import BaseView from './BaseView.js';
  import { markWelcomeSeen } from '../features/onboarding.js';
  import { showConnectModal } from '../components/ConnectModal.js';
  import { isFeatureEnabled } from '../core/features.js';

  export default class WelcomeView extends BaseView {
    async render() {
      this.setHTML(`
        <div class="flex min-h-screen flex-col bg-background-light
  dark:bg-background-dark">
          <div class="flex flex-1 flex-col items-center justify-center p-6">

            <!-- Hero Section -->
            <div class="mb-8 flex flex-col items-center">
              <img src="/app/icons/icon-192x192.png" alt="Saberloop logo" class="mb-6 h-24 w-24 rounded-3xl">
              <h1 class="text-3xl font-bold text-text-light dark:text-text-dark">
                Welcome to Saberloop
              </h1>
              <p class="mt-2 text-center text-subtext-light
  dark:text-subtext-dark">
                Learn Anything, Practice Anything
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

            <!-- Action Buttons -->
            <div class="w-full max-w-sm">
              <button
                id="connectBtn"
                class="flex h-14 w-full items-center justify-center rounded-xl
  bg-primary font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90
   transition-colors"
              >
                Connect to AI Provider
              </button>

              <button
                id="skipBtn"
                class="flex h-14 w-full items-center justify-center rounded-xl
  bg-card-light dark:bg-card-dark font-bold text-text-light dark:text-text-dark
  mt-3 hover:bg-border-light dark:hover:bg-border-dark transition-colors"
              >
                Try Free Quizzes
              </button>
            </div>
            
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

      const connectBtn = this.querySelector('#connectBtn');
      this.addEventListener(connectBtn, 'click', async () => {
        if (isFeatureEnabled('OPENROUTER_GUIDE', 'welcome')) {
          this.navigateTo('/setup-openrouter');
        } else {
          await showConnectModal();
        }
      });
    }
  }