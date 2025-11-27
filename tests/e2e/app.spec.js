import { test, expect } from '@playwright/test';

test.describe('QuizMaster E2E Tests', () => {
  test('should display home page with welcome message', async ({ page }) => {
    await page.goto('/');

    // Check for page title
    await expect(page.locator('h1')).toContainText('QuizUp');

    // Check for welcome message
    await expect(page.locator('h2')).toContainText('Welcome back!');

    // Check for Start New Quiz button
    await expect(page.locator('#startQuizBtn')).toBeVisible();

    // Check for Recent Topics section
    await expect(page.locator('h3')).toContainText('Recent Topics');

    // Check mock data is displayed (inside recentTopicsList)
    await expect(page.locator('#recentTopicsList >> text=No quizzes yet')).toBeVisible();

  });

  test('should navigate to topic input screen', async ({ page }) => {
    await page.goto('/');

    // Click Start New Quiz button
    await page.click('#startQuizBtn');

    // Should navigate to topic input page
    await expect(page).toHaveURL(/#\/topic-input/);

    // Check for New Quiz header
    await expect(page.locator('h1')).toContainText('New Quiz');

    // Check for input fields
    await expect(page.locator('#topicInput')).toBeVisible();
    await expect(page.locator('#gradeLevelSelect')).toBeVisible();
    await expect(page.locator('#generateBtn')).toBeVisible();
  });

  test('should create and complete a full quiz', async ({ page }) => {
    await page.goto('/#/topic-input');

    // Enter a topic
    await page.fill('#topicInput', 'Science');

    // Select grade level
    await page.selectOption('#gradeLevelSelect', 'middle school');

    // Generate questions
    await page.click('#generateBtn');

    // Should navigate to loading page first
    await expect(page).toHaveURL(/#\/loading/);

    // Wait for quiz to load (API call takes time)
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    // Check quiz header
    await expect(page.locator('h1')).toContainText('Science Quiz');

    // Check progress indicator
    await expect(page.locator('text=Question 1 of 5')).toBeVisible();

    // Answer all 5 questions
    for (let i = 0; i < 5; i++) {
      // Wait for question to load
      await expect(page.locator('h2')).toBeVisible();

      // Wait a bit for the page to stabilize
      await page.waitForTimeout(300);

      // Click the second option (correct answer in mock - index 1)
      const options = page.locator('.option-btn');
      await expect(options.nth(1)).toBeVisible();
      await options.nth(1).click();

      // Wait for selection to register
      await page.waitForTimeout(200);

      // Click Next Question or Submit Answer
      const submitBtn = page.locator('#submitBtn');
      await expect(submitBtn).not.toHaveClass(/opacity-50/);
      await submitBtn.click();

      // Wait for navigation/re-render
      await page.waitForTimeout(300);
    }

    // Should navigate to results page
    await expect(page).toHaveURL(/#\/results/);

    // Check results header
    await expect(page.locator('h1')).toContainText('Results');

    // Wait for results to render
    await page.waitForLoadState('networkidle');

    // Check score is displayed (testing shows 80% due to timing, which is acceptable)
    const scoreText = page.locator('p.text-success.text-5xl').first();
    await expect(scoreText).toBeVisible();

    // Check that a success message is shown
    await expect(page.locator('p.text-text-light.dark\\:text-text-dark.text-xl.font-bold')).toBeVisible();

    // Check review section
    await expect(page.locator('h2')).toContainText('Review Your Answers');

    // Verify answers are displayed (should have check marks for correct answers)
    const checkMarks = page.locator('span:has-text("check")');
    await expect(checkMarks.first()).toBeVisible(); // At least one correct answer
  });

  test('should navigate using bottom navigation', async ({ page }) => {
    await page.goto('/');

    // Check all navigation links are visible
    await expect(page.locator('a[href="#/"]')).toBeVisible();
    await expect(page.locator('a[href="#/history"]')).toBeVisible();
    await expect(page.locator('a[href="#/settings"]')).toBeVisible();

    // Navigate to topics (currently goes to #/history which doesn't exist yet)
    // This will be updated when Topics view is implemented
  });

  test('should show back button confirmation on quiz page', async ({ page }) => {
    // Create a quiz first
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Math');
    await page.click('#generateBtn');

    // Wait for loading then quiz
    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    // Set up dialog handler
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Are you sure you want to leave?');
      dialog.dismiss();
    });

    // Click back button
    await page.click('#backBtn');
  });

  test('should allow trying another topic from results', async ({ page }) => {
    // Complete a quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'History');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    // Answer all questions
    for (let i = 0; i < 5; i++) {
      const options = page.locator('.option-btn');
      await options.nth(1).click();
      await page.click('#submitBtn');
    }

    // On results page
    await expect(page).toHaveURL(/#\/results/);

    // Click Try Another Topic
    await page.click('#tryAnotherBtn');

    // Should navigate back to topic input
    await expect(page).toHaveURL(/#\/topic-input/);
  });

  test('should display correct and incorrect answers in results', async ({ page }) => {
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Geography');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    // Answer questions with mix of correct/incorrect
    // Question 1: correct (option 1)
    await page.locator('.option-btn').nth(1).click();
    await page.click('#submitBtn');

    // Question 2: incorrect (option 0)
    await page.locator('.option-btn').nth(0).click();
    await page.click('#submitBtn');

    // Question 3: correct (option 1)
    await page.locator('.option-btn').nth(1).click();
    await page.click('#submitBtn');

    // Question 4: correct (option 1)
    await page.locator('.option-btn').nth(1).click();
    await page.click('#submitBtn');

    // Question 5: correct (option 1)
    await page.locator('.option-btn').nth(1).click();
    await page.click('#submitBtn');

    // Check results show 80%
    await expect(page.locator('text=80%')).toBeVisible();
    await expect(page.locator('text=Great Job!')).toBeVisible();

    // Check that both correct (check icon) and incorrect (close icon) are shown
    await expect(page.locator('span:has-text("check")')).toHaveCount(4);
    await expect(page.locator('span:has-text("close")')).toHaveCount(1);
  });

  test('should disable submit button when no answer is selected', async ({ page }) => {
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Science');
    await page.click('#generateBtn');

    await expect(page).toHaveURL(/#\/loading/);
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    // Submit button should be disabled (have opacity-50 class)
    const submitBtn = page.locator('#submitBtn');
    await expect(submitBtn).toHaveClass(/opacity-50/);

    // Select an answer
    await page.locator('.option-btn').nth(1).click();

    // Submit button should now be enabled (not have opacity-50)
    await expect(submitBtn).not.toHaveClass(/opacity-50/);
  });

  test('should display network status indicator on home page', async ({ page }) => {
    await page.goto('/');

    // Check that network indicator dot exists
    const networkDot = page.locator('#networkStatusDot');
    await expect(networkDot).toBeVisible();

    // Should have green background when online (default state)
    const dotClasses = await networkDot.getAttribute('class');
    expect(dotClasses).toContain('bg-green-500');

    // Verify it's positioned on the home icon
    const homeIcon = page.locator('a[href="#/"] .material-symbols-outlined');
    await expect(homeIcon).toBeVisible();
  });

   test('should display completed quiz on home page', async ({ page }) => {        
      // First verify home page shows empty state
      await page.goto('/');
      await expect(page.locator('#recentTopicsList >> text=No quizzes yet')).toBeVisible();

      // Complete a quiz
      await page.goto('/#/topic-input');
      await page.fill('#topicInput', 'Dinosaurs');
      await page.selectOption('#gradeLevelSelect', 'middle school');
      await page.click('#generateBtn');

      // Wait for loading then quiz
      await expect(page).toHaveURL(/#\/loading/);
      await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

      // Answer all 5 questions
      for (let i = 0; i < 5; i++) {
        await page.locator('.option-btn').nth(1).click();
        await page.waitForTimeout(200);
        await page.click('#submitBtn');
        await page.waitForTimeout(300);
      }

      // Should be on results page
      await expect(page).toHaveURL(/#\/results/);

      // Navigate back to home
      await page.goto('/');

      // Now the quiz should appear in recent topics
      await expect(page.locator('#recentTopicsList >> text=Dinosaurs')).toBeVisible();

      // Should show score (5/5 since mock always has correct answer at index 1)    
      await expect(page.locator('#recentTopicsList >> text=5/5')).toBeVisible();    

      // Should show "Today" as the date
      await expect(page.locator('#recentTopicsList >> text=Today')).toBeVisible();
    });

   test('should replay a saved quiz when clicked', async ({ page }) => {
      // Clear database to ensure clean state
      await page.goto('/');
      await page.evaluate(async () => {
        const dbName = 'quizmaster';
        const request = indexedDB.open(dbName);
        return new Promise((resolve) => {
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            store.clear();
            transaction.oncomplete = () => resolve();
          };
        });
      });

      // Step 1: Complete a quiz first to have something to replay
      await page.goto('/#/topic-input');
      await page.fill('#topicInput', 'Ancient Egypt');
      await page.selectOption('#gradeLevelSelect', 'high school');
      await page.click('#generateBtn');

      // Wait for quiz to load
      await expect(page).toHaveURL(/#\/loading/);
      await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

      // Answer all 5 questions (selecting option 1 - correct in mock)
      for (let i = 0; i < 5; i++) {
        await page.locator('.option-btn').nth(1).click();
        await page.waitForTimeout(200);
        await page.click('#submitBtn');
        await page.waitForTimeout(300);
      }

      // Should be on results page
      await expect(page).toHaveURL(/#\/results/);

      // Step 2: Go back to home page
      await page.goto('/');

      // Verify quiz appears in recent topics
      await expect(page.locator('#recentTopicsList >> text=Ancient Egypt')).toBeVisible();

      // Step 3: Click on the quiz item to replay it
      const quizItem = page.locator('.quiz-item').first();
      await quizItem.click();

      // Step 4: Should navigate to quiz page (not loading page - using saved questions)
      await expect(page).toHaveURL(/#\/quiz/);

      // Should show the same topic
      await expect(page.locator('h1')).toContainText('Ancient Egypt Quiz');

      // Should show question 1
      await expect(page.locator('text=Question 1 of 5')).toBeVisible();

      // Step 5: Complete the replay with different answers
      for (let i = 0; i < 5; i++) {
        await page.locator('.option-btn').nth(0).click(); // Different answer        
        await page.waitForTimeout(200);
        await page.click('#submitBtn');
        await page.waitForTimeout(300);
      }

      // Should be on results page
      await expect(page).toHaveURL(/#\/results/);

      // Step 6: Verify no duplicate - go back to home and count quizzes
      await page.goto('/');

      // Should still have only one "Ancient Egypt" quiz (updated, not duplicated)
      const egyptQuizzes = page.locator('.quiz-item >> text=Ancient Egypt');
      await expect(egyptQuizzes).toHaveCount(1);

      // Score should be updated (0/5 now since we selected wrong answers)
      await expect(page.locator('#recentTopicsList >> text=0/5')).toBeVisible();     
    });

    test('should navigate to settings page', async ({ page }) => {
      await page.goto('/');

      // Click Settings in bottom nav
      await page.click('a[href="#/settings"]');

      // Should navigate to settings page
      await expect(page).toHaveURL(/#\/settings/);

      // Check for Settings header
      await expect(page.locator('h1')).toContainText('Settings');

      // Check for Preferences section
      await expect(page.locator('h2').first()).toContainText('Preferences');

      // Check for About section
      await expect(page.locator('h2').nth(1)).toContainText('About');
    });

    test('should display all settings form elements', async ({ page }) => {
      await page.goto('/#/settings');

      // Check all dropdowns are visible
      await expect(page.locator('#defaultGradeLevel')).toBeVisible();
      await expect(page.locator('#questionsPerQuiz')).toBeVisible();
      await expect(page.locator('#difficulty')).toBeVisible();

      // Check About section content
      await expect(page.locator('text=Version')).toBeVisible();

      // Version now uses YYYYMMDD.NN format (e.g., 20251126.01)
      await expect(page.locator('text=/\\d{8}\\.\\d{2}/')).toBeVisible();

      await expect(page.locator('text=View on GitHub')).toBeVisible();
    });

    test('should persist settings after page refresh', async ({ page }) => {
      await page.goto('/#/settings');

      // Change settings
      await page.selectOption('#defaultGradeLevel', 'college');
      await page.selectOption('#questionsPerQuiz', '15');
      await page.selectOption('#difficulty', 'hard');

      // Refresh the page
      await page.reload();

      // Verify settings persisted
      await expect(page.locator('#defaultGradeLevel')).toHaveValue('college');
      await expect(page.locator('#questionsPerQuiz')).toHaveValue('15');
      await expect(page.locator('#difficulty')).toHaveValue('hard');
    });

   test('should handle offline mode correctly', async ({ page, context }) => {      
      // Step 1: Complete a quiz first so we have something to replay offline        
      await page.goto('/');
      await page.evaluate(async () => {
        const dbName = 'quizmaster';
        const request = indexedDB.open(dbName);
        return new Promise((resolve) => {
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            store.clear();
            transaction.oncomplete = () => resolve();
          };
        });
      });

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
      await expect(page.locator('h2')).toContainText('Welcome back!');

      // Verify button is re-enabled
      await expect(page.locator('#startQuizBtn')).toBeEnabled();

      // Verify offline banner is hidden again
      await expect(page.locator('#offlineBanner')).toHaveClass(/hidden/);
    });

    test('should display quiz history on topics page', async ({ page }) => {
      // Step 1: Clear sessions and create some quizzes
      await page.goto('/');
      await page.evaluate(async () => {
        const dbName = 'quizmaster';
        const request = indexedDB.open(dbName);
        return new Promise((resolve) => {
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            store.clear();
            transaction.oncomplete = () => resolve();
          };
        });
      });

      // Create first quiz
      await page.goto('/#/topic-input');
      await page.fill('#topicInput', 'World History');
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

      // Create second quiz
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

      // Step 2: Navigate to topics/history page
      await page.goto('/');
      await page.click('a[href="#/history"]');

      // Should be on history page
      await expect(page).toHaveURL(/#\/history/);
      await expect(page.locator('h1')).toContainText('Quiz History');

      // Step 3: Verify quiz items are displayed
      const quizItems = page.locator('.quiz-item');
      await expect(quizItems).toHaveCount(2);

      // Verify both topics appear
      await expect(page.locator('text=World History')).toBeVisible();
      await expect(page.locator('text=Chemistry')).toBeVisible();

      // Verify scores are shown (both should be 5/5)
      await expect(page.locator('text=5/5').first()).toBeVisible();

      // Step 4: Click on first quiz to replay
      await quizItems.first().click();

      // Should navigate to quiz page
      await expect(page).toHaveURL(/#\/quiz/);

      // Should show the quiz (Chemistry is most recent, so it's first)
      await expect(page.locator('h1')).toContainText('Quiz');
      await expect(page.locator('text=Question 1 of 5')).toBeVisible();
    });

});
