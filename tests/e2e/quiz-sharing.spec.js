// @ts-check
import { test, expect } from '@playwright/test';
import { setupAuthenticatedState, clearSessions } from './helpers.js';

test.describe('Quiz Sharing Feature', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedState(page);
    await clearSessions(page);
    await page.reload();
    await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 10000 });
  });

  test('should show Share Quiz button on results page after completing quiz', async ({ page }) => {
    // Complete a quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Math basics');
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

    // Should be on results page
    await expect(page).toHaveURL(/#\/results/);

    // Share Quiz button should be visible
    const shareQuizBtn = page.locator('#shareQuizBtn');
    await expect(shareQuizBtn).toBeVisible();
  });

  test('should open Share Quiz modal when button clicked on results page', async ({ page }) => {
    // Complete a quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Science');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveURL(/#\/results/);

    // Click Share Quiz button
    await page.click('#shareQuizBtn');

    // Modal should appear
    const modal = page.locator('#shareQuizModal');
    await expect(modal).toBeVisible();

    // Modal should have expected elements (use heading role to avoid matching button)
    await expect(page.getByRole('heading', { name: 'Share Quiz' })).toBeVisible();
    await expect(page.locator('#copyQuizLinkBtn')).toBeVisible();
    await expect(page.locator('#closeShareQuizBtn')).toBeVisible();
  });

  test('should close Share Quiz modal when close button clicked', async ({ page }) => {
    // Complete a quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'History');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveURL(/#\/results/);

    // Open modal
    await page.click('#shareQuizBtn');
    await expect(page.locator('#shareQuizModal')).toBeVisible();

    // Close modal
    await page.click('#closeShareQuizBtn');

    // Wait for animation
    await page.waitForTimeout(400);

    // Modal should be gone
    await expect(page.locator('#shareQuizModal')).not.toBeVisible();
  });

  test('should show share button on quiz items in history page', async ({ page }) => {
    // Complete a quiz first
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Geography');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveURL(/#\/results/);

    // Navigate to history page
    await page.goto('/#/history');
    await expect(page.getByTestId('topics-title')).toBeVisible();

    // Share button should be visible on quiz item
    const shareBtn = page.locator('.share-quiz-btn').first();
    await expect(shareBtn).toBeVisible();
  });

  test('should open Share Quiz modal from history page', async ({ page }) => {
    // Complete a quiz first
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Biology');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveURL(/#\/results/);

    // Navigate to history page
    await page.goto('/#/history');
    await expect(page.getByTestId('topics-title')).toBeVisible();

    // Click share button (should not trigger replay)
    await page.locator('.share-quiz-btn').first().click();

    // Modal should appear
    await expect(page.locator('#shareQuizModal')).toBeVisible();

    // Should still be on history page (not navigated to quiz)
    await expect(page).toHaveURL(/#\/history/);
  });

  test('should import quiz from shared URL and show preview', async ({ page }) => {
    // Pre-generated encoded quiz data for "Test Quiz" with 2 questions
    // Generated using serializeQuiz() from quiz-serializer.js
    const encodedData = 'N4IgLiBcICoKYGcwAICKBXAlgLxAGhAHMoQBbTAEwoBs5kEBjACwHsXr8QBHKAbVB7QA6kwCGKTAmQAmANTSA-JxZ8QAZk4AWTgFZOANhABdAgygBGAL54BJEeOSTka2WqUEVkXiD0FDBAHZOAA5jUwtLI0sgA';

    // Navigate to shared quiz URL
    await page.goto(`/#/quiz/${encodedData}`);

    // Note: URL stays at /quiz/<data> but ImportView is rendered
    // Wait for import preview content to appear
    await expect(page.locator('text=Play Now')).toBeVisible({ timeout: 5000 });

    // Should show the quiz topic
    await expect(page.locator('text=Test Quiz')).toBeVisible();

    // Should show question count (2 questions)
    await expect(page.locator('text=2 questions')).toBeVisible();
  });

  test('should play imported quiz when Play Now clicked', async ({ page }) => {
    // Pre-generated encoded quiz data
    const encodedData = 'N4IgLiBcICoKYGcwAICKBXAlgLxAGhAHMoQBbTAEwoBs5kEBjACwHsXr8QBHKAbVB7QA6kwCGKTAmQAmANTSA-JxZ8QAZk4AWTgFZOANhABdAgygBGAL54BJEeOSTka2WqUEVkXiD0FDBAHZOAA5jUwtLI0sgA';

    // Navigate to shared quiz URL
    await page.goto(`/#/quiz/${encodedData}`);

    // Wait for import preview (URL stays at /quiz/<data>, but ImportView renders)
    await expect(page.locator('text=Play Now')).toBeVisible({ timeout: 5000 });

    // Click Play Now
    await page.click('text=Play Now');

    // Should navigate to actual quiz view
    await expect(page).toHaveURL(/#\/quiz$/);

    // Should show quiz with the imported topic
    await expect(page.getByTestId('quiz-title')).toBeVisible();
  });

  test('should copy link to clipboard when copy button clicked', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Complete a quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Chemistry');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveURL(/#\/results/);

    // Open share modal
    await page.click('#shareQuizBtn');
    await expect(page.locator('#shareQuizModal')).toBeVisible();

    // Click copy button
    await page.click('#copyQuizLinkBtn');

    // Button should show success state
    await expect(page.locator('#copyQuizLinkBtn')).toContainText('Copied');

    // Verify clipboard has URL (may not work in all CI environments)
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('/#/quiz/');
  });
});
