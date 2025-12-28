// @ts-check

/**
 * Shared test helper functions for E2E tests
 */

/**
 * Set up authenticated state with sample quizzes loaded.
 * This sets up IndexedDB data and navigates to the home page.
 * @param {import('@playwright/test').Page} page
 */
export async function setupAuthenticatedState(page) {
  // First navigate to the app (will show welcome page initially)
  await page.goto('/');

  // Wait for the app to initialize (either welcome or home page)
  await page.waitForLoadState('networkidle');

  // Set up IndexedDB data - the app has already created the database
  await page.evaluate(async () => {
    const dbName = 'quizmaster';
    const dbVersion = 1;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);

      request.onerror = () => reject(request.error);

      // The app already created the stores, so onupgradeneeded won't fire
      // but we keep it for safety
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          sessionStore.createIndex('byTopicId', 'topicId');
          sessionStore.createIndex('byTimestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('topics')) {
          const topicStore = db.createObjectStore('topics', { keyPath: 'id' });
          topicStore.createIndex('byName', 'name');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');

        // Store a fake OpenRouter API key
        store.put({
          key: 'openrouter_api_key',
          value: {
            key: 'sk-or-v1-test-key-for-e2e',
            storedAt: new Date().toISOString()
          }
        });

        // Mark welcome as seen so we don't get redirected
        // Key must match WELCOME_VERSION_KEY in welcome-version.js
        store.put({
          key: 'welcomeScreenVersion',
          value: '999.0.0' // High version number to always skip welcome
        });

        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  });

  // Navigate explicitly to home page (not just reload, which keeps the /welcome URL)
  await page.goto('/#/');

  // Wait for the home page to be visible (not welcome page)
  await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 15000 });
}

/**
 * Clear all quiz sessions for clean test state.
 * @param {import('@playwright/test').Page} page
 */
export async function clearSessions(page) {
  await page.evaluate(async () => {
    const dbName = 'quizmaster';
    const request = indexedDB.open(dbName);
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const db = request.result;
        if (db.objectStoreNames.contains('sessions')) {
          const transaction = db.transaction(['sessions'], 'readwrite');
          const store = transaction.objectStore('sessions');
          store.clear();
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
        } else {
          db.close();
          resolve();
        }
      };
      request.onerror = () => resolve();
    });
  });
}
