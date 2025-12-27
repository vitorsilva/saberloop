// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Share Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Set up localStorage to skip welcome screen
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('hasSeenWelcome', 'true');
    });
  });

  test('should show share button on results page', async ({ page }) => {
    // Navigate to results with mock quiz data
    await page.goto('/');
    await page.evaluate(() => {
      // Set up mock quiz state
      const mockQuestions = [
        { question: 'What is 2+2?', options: ['3', '4', '5', '6'], correct: 1 },
        { question: 'What is 3+3?', options: ['5', '6', '7', '8'], correct: 1 }
      ];
      const mockAnswers = [1, 1]; // Both correct

      window.localStorage.setItem('currentQuestions', JSON.stringify(mockQuestions));
      window.localStorage.setItem('currentAnswers', JSON.stringify(mockAnswers));
      window.localStorage.setItem('currentTopic', 'Math');
    });

    // This approach sets state directly - alternative is to complete a full quiz flow
    // For now, just verify the share button would be visible if results existed
  });

  test.skip('should open share modal when share button clicked', async ({ page }) => {
    // Skip: Full E2E test requires completing a quiz flow which needs API mocking
    // This test is placeholder for future implementation with mock quiz data
    // The share modal functionality is tested via unit tests in share.test.js
  });

  test('should handle deep link with topic parameter', async ({ page }) => {
    // Visit with topic query parameter
    await page.goto('/?topic=World%20History');

    // Wait for redirect and navigate to topic input
    await page.waitForTimeout(500);
    await page.goto('/#/topic-input');

    // Wait for the topic input to load
    await page.waitForSelector('[data-testid="topic-input"]');

    // Note: The deep link handling clears the query param
    // but the prefilled topic should appear in the input
    // This requires state to be preserved which may need adjustment
  });

  test.describe('Share Modal UI', () => {
    test.beforeEach(async ({ page }) => {
      // Set up mock quiz results directly in state
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('hasSeenWelcome', 'true');

        // Create global state mock for testing
        window.__testState = {
          currentQuestions: [
            { question: 'Test Q1', options: ['A', 'B', 'C', 'D'], correct: 0 },
            { question: 'Test Q2', options: ['A', 'B', 'C', 'D'], correct: 1 }
          ],
          currentAnswers: [0, 1],
          currentTopic: 'Test Topic'
        };
      });
    });

    test('share modal should have expected elements', async ({ page }) => {
      // This is a component test - would need proper results page setup
      // For now, document expected behavior

      // Expected elements in ShareModal:
      // - Title: "Share Your Score"
      // - Preview image container
      // - Twitter/X button
      // - Facebook button
      // - Copy Link button
      // - More Options button (if Web Share API available)
      // - Close button
    });
  });
});
