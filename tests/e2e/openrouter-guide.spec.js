import { test, expect } from '@playwright/test';

// Helper to set up unauthenticated state (no OpenRouter connection, but welcome seen)
async function setupUnauthenticatedState(page) {
  // First navigate to the app to let it create the database
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Set up IndexedDB data
  await page.evaluate(async () => {
    const dbName = 'quizmaster';
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');

        // Remove OpenRouter key (unauthenticated)
        store.delete('openrouter_api_key');

        // Mark welcome as seen so we go to home, not welcome
        store.put({
          key: 'welcomeScreenVersion',
          value: '999.0.0'
        });

        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  });

  // Navigate to home page explicitly
  await page.goto('/#/');
  await page.waitForLoadState('networkidle');

  // Wait for home page to load (should show "Welcome back!" since welcome was seen)
  await page.waitForSelector('h2:has-text("Welcome back!")', { timeout: 10000 });
}

// Helper to mark welcome as seen (for direct route testing)
async function markWelcomeSeen(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.evaluate(async () => {
    const dbName = 'quizmaster';
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');

        // Mark welcome as seen
        store.put({
          key: 'welcomeScreenVersion',
          value: '999.0.0'
        });

        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  });
}

test.describe('OpenRouter Guide Flow', () => {

  test('Settings → Guide: should navigate to guide when clicking Connect', async ({ page }) => {
    await setupUnauthenticatedState(page);

    // Go to Settings
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Connect with OpenRouter', { timeout: 10000 });

    // Click "Connect with OpenRouter"
    await page.click('text=Connect with OpenRouter');

    // Should navigate to the guide
    await expect(page).toHaveURL(/#\/setup-openrouter/);
    await expect(page.locator('h1')).toContainText('Set up OpenRouter');
    await expect(page.locator('h2')).toContainText('Create your free account');
  });

  test('Home → Guide: should navigate to guide when clicking Generate Quiz while not connected', async ({ page }) => {
    await setupUnauthenticatedState(page);

    // Verify we're on home page
    await expect(page).toHaveURL(/#\//);
    await expect(page.locator('#startQuizBtn')).toBeVisible();

    // Click "Generate Quiz" button
    await page.click('#startQuizBtn');

    // Should navigate to the guide
    await expect(page).toHaveURL(/#\/setup-openrouter/);
    await expect(page.locator('h2')).toContainText('Create your free account');
  });

  test('Welcome → Guide: should navigate to guide when clicking Connect to AI Provider', async ({ page }) => {
    // Go directly to welcome page (don't mark welcome as seen)
    await page.goto('/#/welcome');
    await page.waitForLoadState('networkidle');

    // Wait for the Connect button to be visible
    await page.waitForSelector('#connectBtn', { timeout: 10000 });

    // Click "Connect to AI Provider" button
    await page.click('#connectBtn');

    // Should navigate to the guide
    await expect(page).toHaveURL(/#\/setup-openrouter/);
    await expect(page.locator('h2')).toContainText('Create your free account');
  });

  test('Guide: "I\'ll do it later" should return to homepage', async ({ page }) => {
    await setupUnauthenticatedState(page);

    // Go to the guide
    await page.goto('/#/setup-openrouter');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=I\'ll do it later', { timeout: 10000 });

    // Click "I'll do it later"
    await page.click('text=I\'ll do it later');

    // Should navigate to homepage
    await expect(page).toHaveURL(/#\//);
  });

  test('Guide: back button should navigate back', async ({ page }) => {
    await setupUnauthenticatedState(page);

    // Go to Settings first, then to the guide
    await page.goto('/#/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Connect with OpenRouter', { timeout: 10000 });
    await page.click('text=Connect with OpenRouter');
    await expect(page).toHaveURL(/#\/setup-openrouter/);

    // Wait for back button to be visible
    await page.waitForSelector('#back-btn', { timeout: 10000 });

    // Click back button
    await page.click('#back-btn');

    // Should go back to Settings
    await expect(page).toHaveURL(/#\/settings/);
  });

  test('Guide: should display all 4 step cards', async ({ page }) => {
    // Mark welcome as seen first so we don't get redirected
    await markWelcomeSeen(page);

    // Navigate to guide
    await page.goto('/#/setup-openrouter');
    await page.waitForLoadState('networkidle');

    // Wait for the guide to load
    await page.waitForSelector('h2:has-text("Create your free account")', { timeout: 10000 });

    // Check all steps are visible (using h3 tags for step titles)
    await expect(page.locator('h3:has-text("Sign Up")')).toBeVisible();
    await expect(page.locator('h3:has-text("Create Account")')).toBeVisible();
    await expect(page.locator('h3:has-text("Skip Payment")')).toBeVisible();
    await expect(page.locator('h3:has-text("Authorize")')).toBeVisible();

    // Check the warning box in Step 3
    await expect(page.locator('text=Important: Do not add payment')).toBeVisible();
  });

  test('ConnectionConfirmed: should display success screen', async ({ page }) => {
    // Mark welcome as seen first so we don't get redirected
    await markWelcomeSeen(page);

    // Navigate to connection confirmed
    await page.goto('/#/connection-confirmed');
    await page.waitForLoadState('networkidle');

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Connection Confirmed!")', { timeout: 10000 });

    // Check success elements
    await expect(page.locator('h1')).toContainText('Connection Confirmed!');
    await expect(page.locator('text=Free tier includes')).toBeVisible();
    await expect(page.locator('text=Start Your First Quiz')).toBeVisible();
  });

  test('ConnectionConfirmed: Start Quiz button should navigate to home', async ({ page }) => {
    // Mark welcome as seen first
    await markWelcomeSeen(page);

    // Navigate to connection confirmed
    await page.goto('/#/connection-confirmed');
    await page.waitForLoadState('networkidle');

    // Wait for button to be visible
    await page.waitForSelector('#start-quiz-btn', { timeout: 10000 });

    // Click the button
    await page.click('#start-quiz-btn');

    // Should navigate to homepage
    await expect(page).toHaveURL(/#\//);
  });

});
