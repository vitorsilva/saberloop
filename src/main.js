  import { initDatabase } from './db/db.js';
  import router from './router/router.js';
  import TestView from './views/TestView.js';

  console.log('🎓 QuizMaster initializing...');

  // Initialize database
  async function init() {
    try {
      await initDatabase();
      console.log('✅ Database initialized');

      // Register routes
      router.addRoute('/', TestView);
      router.addRoute('/test', TestView);

      // Start the router
      router.init();
      console.log('✅ Router initialized');

    } catch (error) {
      console.error('❌ Initialization failed:', error);
    }
  }

  init();