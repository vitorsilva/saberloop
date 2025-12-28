// @ts-check
import { test, expect } from '@playwright/test';
import { setupAuthenticatedState } from './helpers.js';

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

    // Should see results page
    await expect(page).toHaveURL(/#\/results/);

    // Results should display score percentage
    await expect(page.getByTestId('score-percentage')).toBeVisible();
  });

});
