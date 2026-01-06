// @ts-check
import { test, expect } from '@playwright/test';
import { setupAuthenticatedState } from './helpers.js';

/**
 * E2E tests for Issue #79: Answer labels should be sequential A, B, C, D after shuffle
 */
test.describe('Quiz Replay Label Order (Issue #79)', () => {
  test('replay quiz should show options with sequential A, B, C, D labels', async ({ page }) => {
    await setupAuthenticatedState(page);

    // Insert a completed quiz session directly into IndexedDB
    await page.evaluate(async () => {
      const dbName = 'quizmaster';
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onsuccess = () => {
          const db = request.result;

          // Create topic first
          const topicTx = db.transaction(['topics'], 'readwrite');
          const topicStore = topicTx.objectStore('topics');
          topicStore.put({
            id: 'test-topic-79',
            name: 'Test Geography',
            gradeLevel: 'middle school',
            createdAt: new Date().toISOString(),
            lastPlayedAt: new Date().toISOString()
          });

          topicTx.oncomplete = () => {
            // Now create session with questions that have prefixes
            const sessionTx = db.transaction(['sessions'], 'readwrite');
            const sessionStore = sessionTx.objectStore('sessions');
            sessionStore.put({
              id: 1,
              topicId: 'test-topic-79',
              topic: 'Test Geography',
              timestamp: new Date().toISOString(),
              score: 4,
              total: 5,
              language: 'en',
              questions: [
                {
                  question: 'What is the capital of France?',
                  options: ['A) London', 'B) Paris', 'C) Berlin', 'D) Madrid'],
                  correct: 1,
                  difficulty: 'easy'
                },
                {
                  question: 'What is the largest ocean?',
                  options: ['A) Atlantic', 'B) Indian', 'C) Pacific', 'D) Arctic'],
                  correct: 2,
                  difficulty: 'easy'
                },
                {
                  question: 'What continent is Brazil in?',
                  options: ['A) Africa', 'B) Europe', 'C) Asia', 'D) South America'],
                  correct: 3,
                  difficulty: 'easy'
                },
                {
                  question: 'What is the longest river?',
                  options: ['A) Nile', 'B) Amazon', 'C) Yangtze', 'D) Mississippi'],
                  correct: 0,
                  difficulty: 'medium'
                },
                {
                  question: 'What mountain is the tallest?',
                  options: ['A) K2', 'B) Kangchenjunga', 'C) Everest', 'D) Lhotse'],
                  correct: 2,
                  difficulty: 'medium'
                }
              ],
              answers: [1, 2, 3, 0, 2]
            });

            sessionTx.oncomplete = () => {
              db.close();
              resolve();
            };
            sessionTx.onerror = () => reject(sessionTx.error);
          };
          topicTx.onerror = () => reject(topicTx.error);
        };
        request.onerror = () => reject(request.error);
      });
    });

    // Navigate to history page
    await page.goto('/#/history');
    await page.waitForLoadState('networkidle');

    // Find and click the Test Geography topic to replay
    const topicCard = page.locator('text=Test Geography').first();
    await expect(topicCard).toBeVisible({ timeout: 5000 });
    await topicCard.click();

    // Wait for quiz to load (should trigger shuffle on replay)
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 10000 });

    // Wait for question to render
    await expect(page.locator('h2')).toBeVisible();
    await page.waitForTimeout(500);

    // Get all option buttons
    const options = page.locator('.option-btn');
    await expect(options).toHaveCount(4);

    // Verify labels are sequential A, B, C, D (trim whitespace from text content)
    const option1Text = (await options.nth(0).textContent())?.trim();
    const option2Text = (await options.nth(1).textContent())?.trim();
    const option3Text = (await options.nth(2).textContent())?.trim();
    const option4Text = (await options.nth(3).textContent())?.trim();

    expect(option1Text).toMatch(/^A\)/);
    expect(option2Text).toMatch(/^B\)/);
    expect(option3Text).toMatch(/^C\)/);
    expect(option4Text).toMatch(/^D\)/);

    // Navigate to next question and verify labels again
    await options.nth(0).click();
    await page.locator('#submitBtn').click();
    await page.waitForTimeout(500);

    // Verify second question also has sequential labels
    const options2 = page.locator('.option-btn');
    const q2option1 = (await options2.nth(0).textContent())?.trim();
    const q2option2 = (await options2.nth(1).textContent())?.trim();
    const q2option3 = (await options2.nth(2).textContent())?.trim();
    const q2option4 = (await options2.nth(3).textContent())?.trim();

    expect(q2option1).toMatch(/^A\)/);
    expect(q2option2).toMatch(/^B\)/);
    expect(q2option3).toMatch(/^C\)/);
    expect(q2option4).toMatch(/^D\)/);
  });
});
