import { test, expect } from '@playwright/test';
import { setupAuthenticatedState, clearSessions } from './helpers.js';

/**
 * Capture screenshots for Google Play Store listing.
 *
 * Run with:
 *   npx playwright test tests/e2e/capture-playstore-screenshots.spec.js --headed
 *
 * Play Store requires 1080x1920 pixels (9:16 ratio).
 * We capture at 360x640 viewport and upscale during post-processing.
 *
 * Screenshots saved to: docs/product-info/screenshots/playstore/
 */

const PLAYSTORE_VIEWPORT = { width: 360, height: 640 };
const SCREENSHOT_DIR = 'docs/product-info/screenshots/playstore';

test.use({ viewport: PLAYSTORE_VIEWPORT });

test.describe('Capture Play Store Screenshots', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(PLAYSTORE_VIEWPORT);
  });

  test('01. Quiz in action - Question with answers', async ({ page }) => {
    await setupAuthenticatedState(page);
    await clearSessions(page);
    await page.reload();
    await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 10000 });

    // Generate a quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'World History');
    await page.selectOption('#gradeLevelSelect', 'high school');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/01-quiz-question.png`,
      fullPage: false
    });
    console.log('✓ 01: Quiz in action');
  });

  test('02. Explanation modal - AI explanation for wrong answer', async ({ page }) => {
    await setupAuthenticatedState(page);
    await clearSessions(page);
    await page.reload();
    await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 10000 });

    // Generate and complete a quiz with one wrong answer
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Science');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    // Answer first question wrong (option 0), rest correct (option 1)
    await page.locator('.option-btn').nth(0).click();
    await page.waitForTimeout(200);
    await page.click('#submitBtn');
    await page.waitForTimeout(300);

    // Answer remaining questions correctly
    for (let i = 1; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Should be on results page
    await expect(page).toHaveURL(/#\/results/);
    await page.waitForTimeout(500);

    // Click the explain button to open modal
    const explainBtn = page.locator('.explain-btn');
    await expect(explainBtn).toBeVisible();
    await explainBtn.click();

    // Wait for modal and explanation content
    const modal = page.locator('#explanationModal');
    await expect(modal).toBeVisible();
    await expect(page.locator('text=The correct answer is')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/02-explanation-modal.png`,
      fullPage: false
    });
    console.log('✓ 02: Explanation modal');
  });

  test('03. Results with Continue button', async ({ page }) => {
    await setupAuthenticatedState(page);
    await clearSessions(page);
    await page.reload();
    await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 10000 });

    // Generate and complete a quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Geography');
    await page.selectOption('#gradeLevelSelect', 'middle school');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    // Answer all questions (mix for realistic score)
    await page.locator('.option-btn').nth(1).click();
    await page.waitForTimeout(200);
    await page.click('#submitBtn');
    await page.waitForTimeout(300);

    await page.locator('.option-btn').nth(0).click();
    await page.waitForTimeout(200);
    await page.click('#submitBtn');
    await page.waitForTimeout(300);

    for (let i = 2; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Should be on results page with Continue button visible
    await expect(page).toHaveURL(/#\/results/);
    await page.waitForTimeout(500);

    // Scroll to show Continue button
    const continueBtn = page.locator('#continueTopicBtn');
    await continueBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/03-results-continue.png`,
      fullPage: false
    });
    console.log('✓ 03: Results with Continue');
  });

  test('04. Settings - Language and model selection', async ({ page }) => {
    // Mock the models API for consistent screenshot
    await page.route('**/api/v1/models', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B', context_length: 8192, pricing: { prompt: '0', completion: '0' } },
            { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B', context_length: 131072, pricing: { prompt: '0', completion: '0' } }
          ]
        })
      });
    });

    await setupAuthenticatedState(page);
    await page.goto('/#/settings');
    await page.waitForSelector('[data-testid="settings-title"]');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/04-settings.png`,
      fullPage: false
    });
    console.log('✓ 04: Settings');
  });

  test('05. Home with quiz history', async ({ page }) => {
    await setupAuthenticatedState(page);
    await clearSessions(page);
    await page.reload();
    await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 10000 });

    // Create a quiz to populate history
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Mathematics');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    // Answer all questions
    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Go back to home to show history
    await page.goto('/#/');
    await page.waitForSelector('[data-testid="welcome-heading"]');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/05-home-history.png`,
      fullPage: false
    });
    console.log('✓ 05: Home with history');
  });

  test('06. Results with share button', async ({ page }) => {
    await setupAuthenticatedState(page);
    await clearSessions(page);
    await page.reload();
    await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 10000 });

    // Generate and complete a quiz with good score
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Art History');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    // Answer 4 correct, 1 incorrect (80%)
    await page.locator('.option-btn').nth(1).click();
    await page.waitForTimeout(200);
    await page.click('#submitBtn');
    await page.waitForTimeout(300);

    await page.locator('.option-btn').nth(0).click();
    await page.waitForTimeout(200);
    await page.click('#submitBtn');
    await page.waitForTimeout(300);

    for (let i = 2; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Should be on results page
    await expect(page).toHaveURL(/#\/results/);
    await page.waitForTimeout(500);

    // Scroll to top to show score and share button
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/06-share-results.png`,
      fullPage: false
    });
    console.log('✓ 06: Results with share button');
  });

  test('07. Topic input with options', async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto('/#/topic-input');
    await page.waitForTimeout(500);

    // Fill in topic to show the form populated
    await page.fill('#topicInput', 'Learn Spanish');

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/07-topic-input.png`,
      fullPage: false
    });
    console.log('✓ 07: Topic input');
  });

  test('08. Quiz in Portuguese (multi-language)', async ({ page }) => {
    await setupAuthenticatedState(page);

    // Set language to Portuguese
    await page.goto('/#/settings');
    await page.waitForSelector('[data-testid="settings-title"]');

    const langSelect = page.locator('#uiLanguage');
    if (await langSelect.isVisible()) {
      await langSelect.selectOption('pt-PT');
      await page.waitForTimeout(300);
    }

    // Generate quiz in Portuguese
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'História de Portugal');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/08-portuguese-quiz.png`,
      fullPage: false
    });
    console.log('✓ 08: Portuguese quiz');
  });

});
