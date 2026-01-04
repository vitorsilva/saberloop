import { test, expect } from '@playwright/test';
import { setupAuthenticatedState, clearSessions } from './helpers.js';

/**
 * Capture screenshots and demo video for the landing page.
 *
 * Run with:
 *   npx playwright test tests/e2e/capture-landing-assets.spec.js --headed
 *
 * Note: Video recording is enabled in playwright.config.js, so test videos
 * will be saved automatically to test-results/
 */

const MOBILE_VIEWPORT = { width: 375, height: 667 };
const SCREENSHOT_DIR = 'docs/product-info/screenshots';

test.describe('Capture Landing Page Assets', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test('1. Explanation modal with actual text', async ({ page }) => {
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

    // Wait for modal to appear and explanation to load
    const modal = page.locator('#explanationModal');
    await expect(modal).toBeVisible();

    // Wait for explanation content to be visible (the explanation API responds with both explanations)
    // Look for the actual explanation text, not the loading spinners
    await expect(page.locator('text=The correct answer is')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500); // Let UI settle

    // Capture screenshot with modal open
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-explanation-modal.png`,
      fullPage: false
    });

    console.log('✓ Captured: Explanation modal with actual text');
  });

  test('2. Results page with usage cost card', async ({ page }) => {
    await setupAuthenticatedState(page);
    await clearSessions(page);
    await page.reload();
    await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 10000 });

    // Generate and complete a quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'World History');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    // Answer all questions (mix of correct and incorrect for realistic screenshot)
    // Question 1: correct
    await page.locator('.option-btn').nth(1).click();
    await page.waitForTimeout(200);
    await page.click('#submitBtn');
    await page.waitForTimeout(300);

    // Question 2: incorrect
    await page.locator('.option-btn').nth(0).click();
    await page.waitForTimeout(200);
    await page.click('#submitBtn');
    await page.waitForTimeout(300);

    // Questions 3-5: correct
    for (let i = 2; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Should be on results page
    await expect(page).toHaveURL(/#\/results/);
    await page.waitForTimeout(500);

    // Scroll to show usage cost card prominently
    const usageCard = page.getByTestId('usage-cost-card');
    await expect(usageCard).toBeVisible();
    await usageCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Capture screenshot showing usage cost card
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-usage-cost.png`,
      fullPage: false
    });

    console.log('✓ Captured: Results page with usage cost card');
  });

  test('3. Results page with share button (80% score)', async ({ page }) => {
    await setupAuthenticatedState(page);
    await clearSessions(page);
    await page.reload();
    await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 10000 });

    // Generate and complete a quiz with 80% score
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Geography');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    // Answer 4 correct, 1 incorrect (80%)
    // Question 1: correct
    await page.locator('.option-btn').nth(1).click();
    await page.waitForTimeout(200);
    await page.click('#submitBtn');
    await page.waitForTimeout(300);

    // Question 2: incorrect
    await page.locator('.option-btn').nth(0).click();
    await page.waitForTimeout(200);
    await page.click('#submitBtn');
    await page.waitForTimeout(300);

    // Questions 3-5: correct
    for (let i = 2; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Should be on results page with 80% score
    await expect(page).toHaveURL(/#\/results/);
    await expect(page.getByTestId('score-percentage')).toContainText('80%');
    await page.waitForTimeout(500);

    // Scroll to top to show score and share button
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    // Capture screenshot showing share results button
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-share-results.png`,
      fullPage: false
    });

    console.log('✓ Captured: Results page with share button');
  });

  test('4. Demo video - Complete user journey (~30s)', async ({ page }) => {
    // This test creates a video showing the full user journey
    // Video is automatically saved by Playwright to test-results/

    await setupAuthenticatedState(page);
    await clearSessions(page);
    await page.reload();
    await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 10000 });

    // Show home screen
    await page.waitForTimeout(1500);

    // Navigate to topic input
    await page.click('#startQuizBtn');
    await expect(page).toHaveURL(/#\/topic-input/);
    await page.waitForTimeout(800);

    // Type topic slowly (character by character for visual effect)
    const topic = 'World History';
    for (const char of topic) {
      await page.type('#topicInput', char, { delay: 80 });
    }
    await page.waitForTimeout(600);

    // Select grade level with visible action
    await page.selectOption('#gradeLevelSelect', 'high school');
    await page.waitForTimeout(500);

    // Generate quiz
    await page.click('#generateBtn');

    // Show loading state
    await expect(page).toHaveURL(/#\/loading/);
    await page.waitForTimeout(2000);

    // Wait for quiz
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // Answer questions with deliberate pauses
    // Question 1: Get it wrong to show explanation feature later
    await page.locator('.option-btn').nth(0).click();
    await page.waitForTimeout(500);
    await page.click('#submitBtn');
    await page.waitForTimeout(800);

    // Questions 2-5: Answer correctly
    for (let i = 1; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(400);
      await page.click('#submitBtn');
      await page.waitForTimeout(600);
    }

    // Show results page
    await expect(page).toHaveURL(/#\/results/);
    await page.waitForTimeout(1500);

    // Scroll down to show usage cost card
    const usageCard = page.getByTestId('usage-cost-card');
    await usageCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    // Scroll back up and click explain button
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Click explain button to show modal
    await page.locator('.explain-btn').click();
    await expect(page.locator('#explanationModal')).toBeVisible();
    await page.waitForTimeout(2500); // Let user read explanation

    // Close modal
    await page.locator('#gotItBtn').click();
    await page.waitForTimeout(800);

    // Show Continue button
    await page.locator('#continueTopicBtn').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    console.log('✓ Captured: Demo video (~30s journey)');
    console.log('  Video saved to test-results/ directory');
  });

});
