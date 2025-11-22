  const USE_REAL_API = import.meta.env.PROD;  // Use real API in production

  let api;

  if (USE_REAL_API) {
    api = await import('./api.real.js');
    console.log('🚀 Using real API via Netlify Functions');
  } else {
    api = await import('./api.mock.js');
    console.log('🔧 Using mock API (development mode)');
  }

  export const { generateQuestions, generateExplanation } = api;