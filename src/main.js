import './styles/main.css';
import { initDatabase, storeOpenRouterKey } from './core/db.js';
import router from './core/router.js';
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
import HelpView from './views/HelpView.js';
import OpenRouterGuideView from './views/OpenRouterGuideView.js';
import ConnectionConfirmedView from './views/ConnectionConfirmedView.js';
import { loadSamplesIfNeeded } from './features/sample-loader.js';
import { shouldShowWelcome, markWelcomeSeen } from './features/onboarding.js';
import { logger } from './utils/logger.js';
import { initErrorHandling } from './utils/errorHandler.js';
import { initPerformanceMonitoring } from './utils/performance.js'
import { isFeatureEnabled } from './core/features.js';
import { telemetry } from './utils/telemetry.js';
import { initI18n } from './core/i18n.js';
import state from './core/state.js';

logger.info('Saberloop initializing');
initErrorHandling();
initPerformanceMonitoring();

// Log telemetry status
if (telemetry.isEnabled()) {
  logger.info('Telemetry initialized');
} else {
  logger.debug('Telemetry disabled');
}

// Initialize database
async function init() {
  try {
    // Initialize i18n first (translations needed for UI)
    await initI18n();
    logger.info('i18n initialized');

    await initDatabase();
    logger.info('Database initialized');

    // Load sample quizzes if needed
    await loadSamplesIfNeeded();

    // Check if this is an OAuth callback BEFORE router starts
    if (isAuthCallback()) {
      logger.debug('OAuth callback detected');
      await handleOAuthCallback();
      return; // Don't continue with normal init
    }

    // Handle deep links (e.g., ?topic=History)
    handleDeepLinks();

    // Register routes
    router.addRoute('/', HomeView);
    router.addRoute('/topic-input', TopicInputView);
    router.addRoute('/quiz', QuizView);
    router.addRoute('/results', ResultsView);
    router.addRoute('/loading', LoadingView)
    router.addRoute('/settings', SettingsView);
    router.addRoute('/history', TopicsView);
    router.addRoute('/welcome', WelcomeView);
    router.addRoute('/help', HelpView);
    router.addRoute('/setup-openrouter', OpenRouterGuideView);
    router.addRoute('/connection-confirmed', ConnectionConfirmedView);

    // Start the router
    router.init();
    logger.info('Router initialized');

    // Initialize network status monitoring
    initNetworkMonitoring();    

    // Redirect to welcome if needed (after router init)
    const showWelcome = await shouldShowWelcome();
    logger.debug('Show welcome check', { showWelcome });
    if (showWelcome) {
      window.location.hash = '#/welcome';
    }    

  } catch (error) {
    logger.error('Initialization failed', { error: error.message });
  }
}

/**
 * Handle deep links from shared URLs
 * Parses query params and stores prefilled topic in state
 */
function handleDeepLinks() {
  const params = new URLSearchParams(window.location.search);
  const topic = params.get('topic');

  if (topic) {
    const decodedTopic = decodeURIComponent(topic);
    state.set('prefilledTopic', decodedTopic);
    logger.debug('Deep link handled', { topic: decodedTopic });

    // Track telemetry
    telemetry.track('deep_link_opened', { topic: decodedTopic });

    // Clear query params from URL without page reload
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', cleanUrl);
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

      // Mark welcome as seen so user goes to home
      await markWelcomeSeen();

      logger.info('OpenRouter connected successfully');

      // Redirect based on feature flag
      if (isFeatureEnabled('OPENROUTER_GUIDE', 'welcome')) {
        window.location.href = window.location.origin + '/app/#/connection-confirmed';
      } else {
        window.location.href = window.location.origin + '/app/#/';
      }

    } catch (error) {
      logger.error('OAuth callback failed', { error: error.message });

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
              onclick="window.location.href = '/app/'"
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
      logger.info('App ready to work offline');
    },
    onRegistered(registration) {
      logger.info('Service Worker registered');
    },
    onRegisterError(error) {
      logger.error('Service Worker registration failed', { error: error.message });
    }
  });
}