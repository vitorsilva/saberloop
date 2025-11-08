import { initDatabase } from './db/db.js';
import router from './router/router.js';
import HomeView from './views/HomeView.js';
import TopicInputView from './views/TopicInputView.js';
import QuizView from './views/QuizView.js';
import ResultsView from './views/ResultsView.js';
import { initNetworkMonitoring } from './utils/network.js';

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

  // Register service worker for PWA functionality
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:',registration.scope);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);    
        });
    });
  }