/**
 * Party Mode Demo Video Capture Script
 *
 * This script captures a demo video of the Party Mode functionality.
 * It simulates the complete flow: mode switch, create party, join, gameplay, results.
 *
 * Usage:
 *   npx playwright test scripts/capture-party-demo.js
 *
 * Output:
 *   docs/product-info/videos/party-mode-demo.webm
 *
 * Storyboard:
 *   docs/learning/epic06_sharing/PARTY_MODE_DEMO_VIDEO.md
 */

// @ts-check
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Video output configuration
const VIDEO_OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs', 'product-info', 'videos');
const SCREENSHOT_OUTPUT_DIR = path.join(__dirname, '..', '..', 'docs', 'product-info', 'screenshots', 'party');

// Timing constants (in milliseconds)
const TIMING = {
  SHORT_PAUSE: 500,
  MEDIUM_PAUSE: 1000,
  LONG_PAUSE: 2000,
  TRANSITION: 800,
  READ_TIME: 1500,
};

// Test data
const MOCK_QUIZ = {
  topic: 'Famous Scientists',
  questions: [
    {
      question: 'Who developed the theory of relativity?',
      options: ['A) Isaac Newton', 'B) Albert Einstein', 'C) Galileo Galilei', 'D) Stephen Hawking'],
      correct: 1
    },
    {
      question: 'Who is known as the father of modern physics?',
      options: ['A) Albert Einstein', 'B) Isaac Newton', 'C) Galileo Galilei', 'D) Niels Bohr'],
      correct: 2
    },
    {
      question: 'Who discovered penicillin?',
      options: ['A) Marie Curie', 'B) Louis Pasteur', 'C) Alexander Fleming', 'D) Joseph Lister'],
      correct: 2
    }
  ]
};

const PARTICIPANTS = [
  { id: 'host-001', name: 'You', isHost: true, isYou: true },
  { id: 'guest-001', name: 'Alex', isHost: false, isYou: false },
  { id: 'guest-002', name: 'Sam', isHost: false, isYou: false }
];

test.describe('Party Mode Demo Video', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro dimensions
    video: {
      mode: 'on',
      size: { width: 390, height: 844 }
    }
  });

  test('Capture complete party mode flow', async ({ page }, testInfo) => {
    // Ensure output directories exist
    if (!fs.existsSync(VIDEO_OUTPUT_DIR)) {
      fs.mkdirSync(VIDEO_OUTPUT_DIR, { recursive: true });
    }
    if (!fs.existsSync(SCREENSHOT_OUTPUT_DIR)) {
      fs.mkdirSync(SCREENSHOT_OUTPUT_DIR, { recursive: true });
    }

    // Setup: Enable feature flags and authenticated state
    await setupForDemo(page);

    // ========================================
    // ACT 1: Introduction - Mode Switch
    // ========================================
    console.log('🎬 Act 1: Mode Switch');

    // Start on home page in learning mode
    await page.goto('/#/');
    await page.waitForSelector('[data-testid="welcome-heading"]');
    await pause(TIMING.LONG_PAUSE);

    // Screenshot: Learning mode home
    await page.screenshot({
      path: path.join(SCREENSHOT_OUTPUT_DIR, '01-home-learning-mode.png')
    });

    // Switch to Party mode
    const partyModeBtn = page.locator('[data-mode="party"]');
    await partyModeBtn.click();
    await pause(TIMING.TRANSITION);

    // Wait for party buttons to appear
    await page.waitForSelector('[data-testid="create-party-btn"]');
    await pause(TIMING.MEDIUM_PAUSE);

    // Screenshot: Party mode home
    await page.screenshot({
      path: path.join(SCREENSHOT_OUTPUT_DIR, '02-home-party-mode.png')
    });

    // ========================================
    // ACT 2: Host Creates Party
    // ========================================
    console.log('🎬 Act 2: Create Party');

    // Click Create Party
    await page.click('[data-testid="create-party-btn"]');
    await page.waitForURL(/#\/party\/create/);
    await pause(TIMING.MEDIUM_PAUSE);

    // Screenshot: Create party - quiz selection
    await page.screenshot({
      path: path.join(SCREENSHOT_OUTPUT_DIR, '03-create-party-select-quiz.png')
    });

    // Select a quiz (first one in list)
    const quizItem = page.locator('.quiz-select-item').first();
    await quizItem.click();
    await pause(TIMING.SHORT_PAUSE);

    // Click Create Party button
    const createBtn = page.locator('#createRoomBtn');
    await createBtn.click();
    await pause(TIMING.LONG_PAUSE);

    // Wait for room code to appear
    await page.waitForSelector('.room-code-display', { timeout: 5000 }).catch(() => {
      // Room section should be visible
    });
    await pause(TIMING.MEDIUM_PAUSE);

    // Screenshot: Room code displayed
    await page.screenshot({
      path: path.join(SCREENSHOT_OUTPUT_DIR, '04-room-code-created.png')
    });

    // ========================================
    // ACT 3 & 4: Simulate Guest Joins (Mock)
    // ========================================
    console.log('🎬 Act 3-4: Simulated Guest Joins');

    // Inject mock participants via JavaScript
    await page.evaluate((participants) => {
      // Find and update participant list
      const container = document.querySelector('#participantContainer');
      if (container) {
        const participantHTML = participants.map(p => `
          <div class="participant-item flex items-center gap-3 p-3 bg-card-light dark:bg-card-dark rounded-xl">
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span class="text-primary font-bold">${p.name.charAt(0)}</span>
            </div>
            <div class="flex-1">
              <p class="text-text-light dark:text-text-dark font-medium">
                ${p.name}${p.isHost ? ' (Host)' : ''}${p.isYou ? ' - You' : ''}
              </p>
              <p class="text-subtext-light dark:text-subtext-dark text-sm">Connected</p>
            </div>
            ${p.isHost ? '<span class="material-symbols-outlined text-primary">star</span>' : ''}
          </div>
        `).join('');

        container.innerHTML = `
          <h3 class="text-text-light dark:text-text-dark text-lg font-bold mb-3">
            Participants (${participants.length})
          </h3>
          <div class="flex flex-col gap-2">${participantHTML}</div>
        `;
      }

      // Enable start button
      const startBtn = document.querySelector('#startQuizBtn');
      if (startBtn) {
        startBtn.removeAttribute('disabled');
      }

      // Hide min players message
      const minMsg = document.querySelector('#minPlayersMsg');
      if (minMsg) {
        minMsg.classList.add('hidden');
      }
    }, PARTICIPANTS);

    await pause(TIMING.LONG_PAUSE);

    // Screenshot: Participants in lobby
    await page.screenshot({
      path: path.join(SCREENSHOT_OUTPUT_DIR, '05-party-lobby-participants.png')
    });

    // ========================================
    // ACT 5: Start Quiz & Gameplay
    // ========================================
    console.log('🎬 Act 5: Gameplay');

    // Click Start Quiz
    const startQuizBtn = page.locator('#startQuizBtn');
    await startQuizBtn.click();
    await pause(TIMING.TRANSITION);

    // Navigate to party quiz view (simulated)
    await page.goto('/#/party/quiz/DEMO01');
    await pause(TIMING.LONG_PAUSE);

    // Inject mock quiz UI
    await page.evaluate((quiz) => {
      const app = document.querySelector('#app');
      if (app) {
        app.innerHTML = `
          <div class="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark p-4">
            <!-- Timer Bar -->
            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all duration-1000" style="width: 80%"></div>
            </div>

            <!-- Question Counter -->
            <div class="flex justify-between items-center mb-4">
              <span class="text-subtext-light dark:text-subtext-dark">Question 1 of ${quiz.questions.length}</span>
              <span class="text-primary font-bold">24s</span>
            </div>

            <!-- Question -->
            <h2 class="text-text-light dark:text-text-dark text-xl font-bold mb-6">
              ${quiz.questions[0].question}
            </h2>

            <!-- Options -->
            <div class="flex flex-col gap-3 mb-6">
              ${quiz.questions[0].options.map((opt, i) => `
                <button class="option-btn p-4 rounded-xl text-left font-medium transition-all
                  ${i === 1 ? 'bg-primary text-white' : 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark'}
                  hover:opacity-80">
                  ${opt}
                </button>
              `).join('')}
            </div>

            <!-- Live Scoreboard -->
            <div class="mt-auto bg-card-light dark:bg-card-dark rounded-xl p-4">
              <h3 class="text-text-light dark:text-text-dark font-bold mb-2">Live Scores</h3>
              <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                  <span class="text-text-light dark:text-text-dark">You</span>
                  <span class="text-primary font-bold">15</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-subtext-light dark:text-subtext-dark">Alex</span>
                  <span class="text-subtext-light dark:text-subtext-dark">10</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-subtext-light dark:text-subtext-dark">Sam</span>
                  <span class="text-subtext-light dark:text-subtext-dark">12</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }, MOCK_QUIZ);

    await pause(TIMING.LONG_PAUSE);

    // Screenshot: Quiz gameplay
    await page.screenshot({
      path: path.join(SCREENSHOT_OUTPUT_DIR, '06-party-quiz-gameplay.png')
    });

    // ========================================
    // ACT 6: Results
    // ========================================
    console.log('🎬 Act 6: Results');

    // Navigate to results
    await page.goto('/#/party/results/DEMO01');
    await pause(TIMING.MEDIUM_PAUSE);

    // Inject mock results UI
    await page.evaluate(() => {
      const app = document.querySelector('#app');
      if (app) {
        app.innerHTML = `
          <div class="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark p-4">
            <!-- Header -->
            <h1 class="text-text-light dark:text-text-dark text-2xl font-bold text-center mb-6">
              Party Results
            </h1>

            <!-- Winner -->
            <div class="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-6 text-center">
              <span class="text-4xl mb-2 block">🏆</span>
              <h2 class="text-white text-2xl font-bold">You Won!</h2>
              <p class="text-white/80">45 points</p>
            </div>

            <!-- Leaderboard -->
            <div class="bg-card-light dark:bg-card-dark rounded-xl p-4 mb-6">
              <h3 class="text-text-light dark:text-text-dark font-bold mb-4">Final Standings</h3>

              <!-- 1st Place -->
              <div class="flex items-center gap-3 p-3 bg-yellow-500/20 rounded-xl mb-2">
                <span class="text-2xl">🥇</span>
                <span class="text-text-light dark:text-text-dark font-bold flex-1">You</span>
                <span class="text-primary font-bold">45 pts</span>
              </div>

              <!-- 2nd Place -->
              <div class="flex items-center gap-3 p-3 bg-gray-500/10 rounded-xl mb-2">
                <span class="text-2xl">🥈</span>
                <span class="text-text-light dark:text-text-dark flex-1">Sam</span>
                <span class="text-subtext-light dark:text-subtext-dark font-bold">38 pts</span>
              </div>

              <!-- 3rd Place -->
              <div class="flex items-center gap-3 p-3 bg-orange-500/10 rounded-xl">
                <span class="text-2xl">🥉</span>
                <span class="text-text-light dark:text-text-dark flex-1">Alex</span>
                <span class="text-subtext-light dark:text-subtext-dark font-bold">32 pts</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mt-auto">
              <button class="flex-1 py-4 rounded-xl bg-primary text-white font-bold">
                Play Again
              </button>
              <button class="flex-1 py-4 rounded-xl border-2 border-primary text-primary font-bold">
                Share
              </button>
            </div>
          </div>
        `;
      }
    });

    await pause(TIMING.LONG_PAUSE);

    // Screenshot: Final results
    await page.screenshot({
      path: path.join(SCREENSHOT_OUTPUT_DIR, '07-party-results.png')
    });

    // Final pause before video ends
    await pause(TIMING.LONG_PAUSE);

    console.log('🎬 Video capture complete!');

    // Copy video to output directory after test
    testInfo.attach('party-demo-video', {
      contentType: 'video/webm',
      path: testInfo.outputPath('video.webm')
    });
  });
});

/**
 * Set up the page for demo recording
 */
async function setupForDemo(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Set up IndexedDB with authenticated state and sample quizzes
  await page.evaluate(async () => {
    const dbName = 'quizmaster';
    const dbVersion = 1;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');

        // Fake API key
        store.put({
          key: 'openrouter_api_key',
          value: { key: 'sk-or-demo-key', storedAt: new Date().toISOString() }
        });

        // Skip welcome
        store.put({ key: 'welcomeScreenVersion', value: '999.0.0' });

        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
      };
    });
  });

  // Enable feature flags
  await page.evaluate(() => {
    localStorage.setItem('__test_feature_MODE_TOGGLE', 'ENABLED');
    localStorage.setItem('__test_feature_PARTY_SESSION', 'ENABLED');
  });

  // Reload to apply
  await page.reload();
  await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 10000 });
}

/**
 * Helper to pause for timing
 */
function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
