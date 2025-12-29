// @ts-check
import { test, expect } from '@playwright/test';
import { setupAuthenticatedState, clearSessions } from './helpers.js';

/**
 * Offline Mode E2E Tests
 *
 * Tests comprehensive offline functionality including:
 * - Connection state transitions
 * - UI updates (banner, buttons, indicator)
 * - Navigation while offline
 * - Edge cases (rapid toggling)
 */

test.describe('Offline Mode', () => {

  test.beforeEach(async ({ page }) => {
    // Set up authenticated state (skips welcome screen, loads sample quizzes)
    await setupAuthenticatedState(page);
  });

  test('should show offline banner when connection is lost', async ({ page, context }) => {
    // Verify banner is hidden when online
    const offlineBanner = page.locator('#offlineBanner');
    await expect(offlineBanner).toHaveClass(/hidden/);

    // Go offline
    await context.setOffline(true);

    // Banner should appear (hidden class removed)
    await expect(offlineBanner).not.toHaveClass(/hidden/);
  });

  test('should hide offline banner when connection is restored', async ({ page, context }) => {
    const offlineBanner = page.locator('#offlineBanner');

    // Go offline first
    await context.setOffline(true);
    await expect(offlineBanner).not.toHaveClass(/hidden/);

    // Go back online
    await context.setOffline(false);

    // Banner should hide
    await expect(offlineBanner).toHaveClass(/hidden/);
  });

  test('should handle rapid offline/online toggling gracefully', async ({ page, context }) => {
    const offlineBanner = page.locator('#offlineBanner');
    const startBtn = page.locator('#startQuizBtn');

    // Rapidly toggle connection 5 times
    for (let i = 0; i < 5; i++) {
      await context.setOffline(true);
      await page.waitForTimeout(100);
      await context.setOffline(false);
      await page.waitForTimeout(100);
    }

    // Final state should be online (stable)
    await expect(offlineBanner).toHaveClass(/hidden/);

    // App should still be functional
    await expect(startBtn).toBeEnabled();
  });

  test('should allow navigation to all views while offline', async ({ page, context }) => {
    const offlineBanner = page.locator('#offlineBanner');

    // Go offline
    await context.setOffline(true);
    await expect(offlineBanner).not.toHaveClass(/hidden/);

    // Navigate to Settings
    await page.click('a[href="#/settings"]');
    await expect(page.getByTestId('settings-title')).toBeVisible();

    // Navigate to History
    await page.click('a[href="#/history"]');
    await expect(page).toHaveURL(/#\/history/);

    // Navigate back to Home
    await page.click('a[href="#/"]');
    await expect(page).toHaveURL(/\/$/);

    // Banner should still be visible throughout
    await expect(offlineBanner).not.toHaveClass(/hidden/);
  });

  test('should complete a sample quiz while offline', async ({ page, context }) => {
    // Verify we have sample quizzes available (pre-loaded on first launch)
    const quizItem = page.locator('.quiz-item').first();
    await expect(quizItem).toBeVisible();

    // Go offline BEFORE starting the quiz
    await context.setOffline(true);

    // Start the sample quiz
    await quizItem.click();

    // Should navigate to quiz (not loading - uses cached questions)
    await expect(page).toHaveURL(/#\/quiz/);

    // Answer all 5 questions
    for (let i = 0; i < 5; i++) {
      // Click first option
      await page.locator('.option-btn').first().click();
      await page.waitForTimeout(200);
      // Click submit/next
      await page.locator('#submitBtn').click();
      await page.waitForTimeout(300);
    }

    // Should see results paged
    await expect(page).toHaveURL(/#\/results/);

    // Results should display score percentage
    await expect(page.getByTestId('score-percentage')).toBeVisible();
  });

    test('should complete quiz even if connection lost mid-quiz', async ({ page, context }) => {
      // Start online - click on a sample quiz
      const quizItem = page.locator('.quiz-item').first();
      await quizItem.click();
      await expect(page).toHaveURL(/#\/quiz/);

      // Answer first 2 questions while ONLINE
      for (let i = 0; i < 2; i++) {
        await page.locator('.option-btn').first().click();
        await page.waitForTimeout(200);
        await page.locator('#submitBtn').click();
        await page.waitForTimeout(300);
      }

      // NOW go offline mid-quiz
      await context.setOffline(true);

      // Answer remaining 3 questions while OFFLINE
      for (let i = 0; i < 3; i++) {
        await page.locator('.option-btn').first().click();
        await page.waitForTimeout(200);
        await page.locator('#submitBtn').click();
        await page.waitForTimeout(300);
      }

      // Should still see results page
      await expect(page).toHaveURL(/#\/results/);
      await expect(page.getByTestId('score-percentage')).toBeVisible();
    });

  test('should handle full offline/online cycle with quiz replay', async ({ page, context }) => {
    // Clear sessions for clean state
    await clearSessions(page);
    await page.reload();
    await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 10000 });

    // Step 1: Create a quiz while online
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Marine Biology');
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

    await expect(page).toHaveURL(/#\/results/);

    // Step 2: Go to home page while online
    await page.goto('/');

    // Verify button is enabled when online
    const startBtn = page.locator('#startQuizBtn');
    await expect(startBtn).toBeEnabled();

    // Verify offline banner is hidden
    const offlineBanner = page.locator('#offlineBanner');
    await expect(offlineBanner).toHaveClass(/hidden/);

    // Step 3: Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500); // Wait for UI to update

    // Verify button is now disabled
    await expect(startBtn).toBeDisabled();

    // Verify offline banner is visible
    await expect(offlineBanner).not.toHaveClass(/hidden/);
    await expect(offlineBanner).toContainText("You're offline");

    // Step 4: Verify saved quiz replay still works offline
    const quizItem = page.locator('.quiz-item').first();
    await expect(quizItem).toContainText('Marine Biology');
    await quizItem.click();

    // Should navigate to quiz (using saved questions)
    await expect(page).toHaveURL(/#\/quiz/);
    await expect(page.locator('h1')).toContainText('Marine Biology Quiz');

    // Step 5: Go back online BEFORE navigating
    await context.setOffline(false);

    // Now navigate back to home (while online)
    await page.goto('/');
    await page.waitForTimeout(500); // Wait for UI to update

    // Wait for home page to load
    await expect(page.getByTestId('welcome-heading')).toBeVisible();

    // Verify button is re-enabled
    await expect(page.locator('#startQuizBtn')).toBeEnabled();

    // Verify offline banner is hidden again
    await expect(page.locator('#offlineBanner')).toHaveClass(/hidden/);
  });

});
