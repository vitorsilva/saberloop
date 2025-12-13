/**
 * Record a promotional video for Play Store
 *
 * Run with: node scripts/record-playstore-video.cjs
 *
 * Output: .playwright-mcp/saberloop-promo.webm
 */

const { chromium } = require('playwright');
const path = require('path');

async function recordVideo() {
  const outputDir = path.join(__dirname, '..', '.playwright-mcp');

  console.log('Starting video recording...');
  console.log('Output directory:', outputDir);

  // Launch browser with video recording enabled
  const browser = await chromium.launch({
    headless: false // Show browser so you can see what's being recorded
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: {
      dir: outputDir,
      size: { width: 390, height: 844 }
    }
  });

  const page = await context.newPage();

  try {
    // Scene 1: Welcome screen
    console.log('Scene 1: Welcome screen');
    await page.goto('https://saberloop.com/app/');
    await page.waitForTimeout(3000);

    // Scene 2: Click "Try Free Quizzes"
    console.log('Scene 2: Entering app');
    await page.click('button:has-text("Try Free Quizzes")');
    await page.waitForTimeout(2000);

    // Scene 3: Home screen - show recent topics
    console.log('Scene 3: Home screen with topics');
    await page.waitForTimeout(2000);

    // Scene 4: Click on a quiz (Solar System - fun topic)
    console.log('Scene 4: Starting a quiz');
    await page.click('text=Solar System');
    await page.waitForTimeout(2000);

    // Scene 5-9: Answer 5 questions
    for (let i = 1; i <= 5; i++) {
      console.log(`Scene ${4 + i}: Question ${i}`);

      // Wait for question to load
      await page.waitForSelector('button:has-text("A)")');
      await page.waitForTimeout(1000);

      // Click first answer option
      await page.click('button:has-text("A)")');
      await page.waitForTimeout(500);

      // Click Next Question or Submit Answer
      const nextButton = await page.$('button:has-text("Next Question")');
      const submitButton = await page.$('button:has-text("Submit Answer")');

      if (nextButton) {
        await nextButton.click();
      } else if (submitButton) {
        await submitButton.click();
      }

      await page.waitForTimeout(1000);
    }

    // Scene 10: Results screen
    console.log('Scene 10: Results screen');
    await page.waitForTimeout(3000);

    // Scene 11: Navigate to Settings
    console.log('Scene 11: Settings');
    await page.click('text=Settings');
    await page.waitForTimeout(2000);

    // Scene 12: Back to Home
    console.log('Scene 12: Back to Home');
    await page.click('text=Home');
    await page.waitForTimeout(2000);

    console.log('Recording complete!');

  } catch (error) {
    console.error('Error during recording:', error);
  }

  // Close context to save video
  await context.close();
  await browser.close();

  console.log('\nVideo saved to:', outputDir);
  console.log('Look for a file named like: xxxxxxxx.webm');
  console.log('\nNext steps:');
  console.log('1. Find the .webm file in .playwright-mcp/');
  console.log('2. Upload to YouTube as unlisted or public');
  console.log('3. Add the YouTube URL to Play Store listing');
}

recordVideo().catch(console.error);
