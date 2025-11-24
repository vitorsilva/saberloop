const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'false'
    ? false
    : (import.meta.env.PROD ||
  import.meta.env.VITE_USE_REAL_API === 'true');

  let api;

  if (USE_REAL_API) {
    api = await import('./api.real.js');
    console.log('🚀 Using real API via Netlify Functions');
  } else {
    api = await import('./api.mock.js');
    console.log('🔧 Using mock API (development mode)');
  }

  export const { generateQuestions, generateExplanation } = api;