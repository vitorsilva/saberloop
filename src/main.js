  // QuizMaster - Main Entry Point
  // This file initializes the app

  import { initDatabase } from './db/db.js';
  import { generateQuestions } from './api/index.js';

  console.log('🎓 QuizMaster initializing...');

  // Test that modules are working
  async function testModules() {
    try {
      // Test database module
      console.log('Testing database module...');
      await initDatabase();
      console.log('✅ Database initialized');

      // Test API module
      console.log('Testing API module...');
      const questions = await generateQuestions('JavaScript', 'high school');
      console.log('✅ API working, generated', questions.length, 'questions');

      console.log('🎉 All modules working correctly!');
    } catch (error) {
      console.error('❌ Module test failed:', error);
    }
  }

  // Run test
  testModules();