import { initDatabase } from './db/db.js';
import router from './router/router.js';
import HomeView from './views/HomeView.js';
import TopicInputView from './views/TopicInputView.js';
import QuizView from './views/QuizView.js';
import ResultsView from './views/ResultsView.js';
import { initNetworkMonitoring } from './utils/network.js';
import { registerSW } from 'virtual:pwa-register';

console.log('🎓 QuizMaster initializing...');

// Initialize database
async function init() {
  try {
    await initDatabase();
    console.log('✅ Database initialized');

    // Register routes
    router.addRoute('/', HomeView);
    router.addRoute('/topic-input', TopicInputView);
    router.addRoute('/quiz', QuizView);
    router.addRoute('/results', ResultsView);

    // Start the router
    router.init();
    console.log('✅ Router initialized');

    // Initialize network status monitoring
    initNetworkMonitoring();    

  } catch (error) {
    console.error('❌ Initialization failed:', error);
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