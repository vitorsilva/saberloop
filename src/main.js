import { initDatabase, storeOpenRouterKey } from './db/db.js';
import router from './router/router.js';
import HomeView from './views/HomeView.js';
import TopicInputView from './views/TopicInputView.js';
import QuizView from './views/QuizView.js';
import ResultsView from './views/ResultsView.js';
import { initNetworkMonitoring } from './utils/network.js';
import { registerSW } from 'virtual:pwa-register';
import LoadingView from './views/LoadingView.js';
import SettingsView from './views/SettingsView.js';
import TopicsView from './views/TopicsView.js';
import { isAuthCallback, handleCallback } from './api/openrouter-auth.js';
import WelcomeView from './views/WelcomeView.js';
import { loadSamplesIfNeeded } from './utils/sample-loader.js';
import { shouldShowWelcome } from './utils/welcome-version.js';

console.log('🎓 Saberloop initializing...');

// Initialize database
async function init() {
  try {
    await initDatabase();
    console.log('✅ Database initialized');

    // Load sample quizzes if needed
    await loadSamplesIfNeeded();

    // Check if this is an OAuth callback BEFORE router starts
    if (isAuthCallback()) {
      console.log('🔐 OAuth callback detected');
      await handleOAuthCallback();
      return; // Don't continue with normal init
    }

    // Register routes
    router.addRoute('/', HomeView);
    router.addRoute('/topic-input', TopicInputView);
    router.addRoute('/quiz', QuizView);
    router.addRoute('/results', ResultsView);
    router.addRoute('/loading', LoadingView)
    router.addRoute('/settings', SettingsView);
    router.addRoute('/history', TopicsView);
    router.addRoute('/welcome', WelcomeView);
    
    // Start the router
    router.init();
    console.log('✅ Router initialized');

    // Initialize network status monitoring
    initNetworkMonitoring();    

    // Redirect to welcome if needed (after router init)
    const showWelcome = await shouldShowWelcome();
    console.log('👋 Show welcome:', showWelcome);
    if (showWelcome) {
      window.location.hash = '#/welcome';
    }    

  } catch (error) {
    console.error('❌ Initialization failed:', error);
  }
}

  /**
   * Handle OAuth callback from OpenRouter
   */
  async function handleOAuthCallback() {
    const appContainer = document.getElementById('app');

    // Show loading state
    appContainer.innerHTML = `
      <div class="flex min-h-screen items-center justify-center
  bg-background-light dark:bg-background-dark">
        <div class="text-center">
          <span class="material-symbols-outlined text-5xl text-primary
  animate-spin">progress_activity</span>
          <p class="mt-4 text-lg font-medium text-text-light
  dark:text-text-dark">
            Completing connection...
          </p>
        </div>
      </div>
    `;

    try {
      // Exchange code for API key
      const apiKey = await handleCallback();

      // Store the key
      await storeOpenRouterKey(apiKey);

      console.log('✅ OpenRouter connected successfully');

      // Redirect to home (removes ?code from URL)
      window.location.href = window.location.origin + '/#/';

    } catch (error) {
      console.error('❌ OAuth callback failed:', error);

      // Show error
      appContainer.innerHTML = `
        <div class="flex min-h-screen items-center justify-center
  bg-background-light dark:bg-background-dark p-6">
          <div class="text-center max-w-sm">
            <span class="material-symbols-outlined text-5xl
  text-red-500">error</span>
            <p class="mt-4 text-lg font-medium text-text-light
  dark:text-text-dark">
              Connection Failed
            </p>
            <p class="mt-2 text-sm text-subtext-light dark:text-subtext-dark">       
              ${error.message}
            </p>
            <button
              onclick="window.location.href = '/'"
              class="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-medium     
  hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      `;
    }
  }

init();

// Register service worker with Vite PWA Plugin
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      // New version available
      if (confirm('New version available! Reload to update?')) {
        updateSW(true); // Force reload with new version
      }
    },
    onOfflineReady() {
      console.log('✅ App ready to work offline');
    },
    onRegistered(registration) {
      console.log('✅ Service Worker registered');
    },
    onRegisterError(error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  });
}