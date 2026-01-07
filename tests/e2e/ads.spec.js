// @ts-check
import { test, expect } from '@playwright/test';
import { setupAuthenticatedState } from './helpers.js';

/**
 * Ads E2E Tests
 *
 * Tests ad container behavior in the application:
 * - Ad container exists in LoadingView
 * - Ad container hidden when offline
 * - Ad container has correct CSS class
 *
 * Note: Actual ad loading is not tested (requires AdSense approval)
 * These tests verify the ad infrastructure is in place.
 */

test.describe('Ads', () => {

  test.beforeEach(async ({ page }) => {
    // Set up authenticated state (skips welcome screen, loads sample quizzes)
    await setupAuthenticatedState(page);
  });

  test('should have ad container in LoadingView', async ({ page }) => {
    // Navigate to topic input
    await page.goto('/#/topic-input');
    await expect(page.locator('#topicInput')).toBeVisible();

    // Enter a topic and generate quiz
    await page.fill('#topicInput', 'Test Topic for Ads');
    await page.click('#generateBtn');

    // Should navigate to loading view
    await expect(page).toHaveURL(/#\/loading/);

    // Ad container should exist
    const adContainer = page.locator('#quiz-loading-ad');
    await expect(adContainer).toBeAttached();

    // Ad container should have the correct CSS class
    await expect(adContainer).toHaveClass(/ad-container/);
  });

  test('should have ad container when offline (but hidden)', async ({ page, context }) => {
    // Go offline first
    await context.setOffline(true);

    // Navigate to topic input
    await page.goto('/#/topic-input');
    await expect(page.locator('#topicInput')).toBeVisible();

    // Enter a topic and try to generate quiz
    await page.fill('#topicInput', 'Offline Test Topic');
    await page.click('#generateBtn');

    // Should navigate to loading view (even if offline)
    await expect(page).toHaveURL(/#\/loading/);

    // Ad container should exist in the DOM
    const adContainer = page.locator('#quiz-loading-ad');
    await expect(adContainer).toBeAttached();

    // Ad container should be empty when offline (no ad loaded)
    // The :empty CSS selector hides empty containers via display: none
    const containerContent = await adContainer.innerHTML();
    expect(containerContent).toBe('');
  });

  test('should display loading topic while ad container is present', async ({ page }) => {
    // Navigate to topic input
    await page.goto('/#/topic-input');

    // Enter a topic
    await page.fill('#topicInput', 'History of Rome');
    await page.click('#generateBtn');

    // Should be on loading view
    await expect(page).toHaveURL(/#\/loading/);

    // Topic should be displayed
    await expect(page.getByTestId('loading-topic')).toContainText('History of Rome');

    // Loading message should be visible
    await expect(page.getByTestId('loading-message')).toBeVisible();

    // Ad container should coexist with loading UI
    const adContainer = page.locator('#quiz-loading-ad');
    await expect(adContainer).toBeAttached();
  });

});
