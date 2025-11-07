# Phase 8: Testing QuizMaster Features

**Goal**: Write tests for QuizMaster functionality and ensure production readiness.

---

## 📚 Prerequisites

**You already know how to test from Epic 01:**
- ✅ Vitest for unit tests (Phase 4.3)
- ✅ Playwright for E2E tests (Phase 4.4)
- ✅ Test infrastructure is set up

**This phase focuses on:**
- 🎯 Writing tests for QuizMaster features
- 🎯 Testing SPA flows (routing, state, views)
- 🎯 Manual testing checklists
- 🎯 Bug fixes and polish

**Skip the setup - you already did that in Epic 01!**

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Write unit tests for QuizMaster modules
- ✅ Write E2E tests for quiz flows
- ✅ Test all user journeys manually
- ✅ Handle edge cases gracefully
- ✅ Polish UI/UX details
- ✅ Fix bugs discovered during testing
- ⏱️ **Estimated time: 1-2 sessions** (testing only, not setup)

---

## 8.1 Unit Tests for QuizMaster

### Test Router

```javascript
// tests/router.test.js

import { describe, it, expect, beforeEach } from 'vitest';
import { Router } from '../src/router/router.js';

describe('Router', () => {
  let router;

  beforeEach(() => {
    router = new Router();
    window.location.hash = '';
  });

  it('should register routes', () => {
    router.register('/', () => 'home');
    router.register('/quiz', () => 'quiz');
    expect(router.routes.size).toBe(2);
  });

  it('should navigate to route', () => {
    router.register('/', () => 'home');
    router.navigateTo('/');
    expect(window.location.hash).toBe('#/');
  });

  it('should handle unknown routes', () => {
    router.register('/', () => 'home');
    router.navigateTo('/unknown');
    expect(window.location.hash).toBe('#/'); // Fallback to home
  });
});
```

### Test State Manager

```javascript
// tests/state.test.js

import { describe, it, expect, beforeEach } from 'vitest';
import { StateManager } from '../src/state.js';

describe('StateManager', () => {
  let state;

  beforeEach(() => {
    state = StateManager.getInstance();
    state.clear();
  });

  it('should be singleton', () => {
    const state1 = StateManager.getInstance();
    const state2 = StateManager.getInstance();
    expect(state1).toBe(state2);
  });

  it('should set and get state', () => {
    state.set('topic', 'Math');
    expect(state.get('topic')).toBe('Math');
  });

  it('should clear state', () => {
    state.set('topic', 'Math');
    state.clear();
    expect(state.get('topic')).toBeUndefined();
  });
});
```

### Test Mock API

```javascript
// tests/api.mock.test.js

import { describe, it, expect } from 'vitest';
import { generateQuestions, generateExplanation } from '../src/api/api.mock.js';

describe('Mock API', () => {
  it('should generate 5 questions', async () => {
    const questions = await generateQuestions('Math', '5th Grade');
    expect(questions).toHaveLength(5);
  });

  it('should generate questions with correct structure', async () => {
    const questions = await generateQuestions('Science');
    questions.forEach(q => {
      expect(q).toHaveProperty('question');
      expect(q).toHaveProperty('options');
      expect(q).toHaveProperty('correct');
      expect(q.options).toHaveLength(4);
    });
  });

  it('should generate explanation', async () => {
    const explanation = await generateExplanation(
      'What is 2+2?',
      'B',
      'C',
      'Elementary'
    );
    expect(typeof explanation).toBe('string');
    expect(explanation.length).toBeGreaterThan(0);
  });
});
```

---

## 8.2 E2E Tests for Quiz Flows

### Test Complete Quiz Flow

```javascript
// tests/e2e/quiz-flow.spec.js

import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test('should complete full quiz journey', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Home page
    await expect(page.locator('h1')).toContainText('QuizMaster');

    // Start quiz
    await page.fill('#topicInput', 'Math');
    await page.selectOption('#gradeSelect', '5th Grade');
    await page.click('#startBtn');

    // Wait for questions to load
    await expect(page.locator('.quiz-view')).toBeVisible();

    // Answer all 5 questions
    for (let i = 0; i < 5; i++) {
      await page.click('.option-btn:first-child');
      await page.click('#nextBtn');
    }

    // Results page
    await expect(page.locator('.results-view')).toBeVisible();
    await expect(page.locator('.score')).toBeVisible();

    // Navigate to history
    await page.click('a[href="#/history"]');
    await expect(page.locator('.history-view')).toBeVisible();

    // Verify session appears
    await expect(page.locator('.session-card')).toHaveCount(1);
  });

  test('should handle empty input', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Try to start without entering topic
    await page.click('#startBtn');

    // Should show alert or error
    const alert = page.locator('.error-message, [role="alert"]');
    await expect(alert).toBeVisible();
  });
});
```

### Test Offline Mode

```javascript
// tests/e2e/offline.spec.js

import { test, expect } from '@playwright/test';

test.describe('Offline Mode', () => {
  test('should view history offline', async ({ page, context }) => {
    await page.goto('http://localhost:3000');

    // Complete a quiz first
    await page.fill('#topicInput', 'Science');
    await page.click('#startBtn');
    // ... complete quiz ...

    // Go offline
    await context.setOffline(true);

    // Navigate to history
    await page.click('a[href="#/history"]');

    // Should still work
    await expect(page.locator('.history-view')).toBeVisible();
    await expect(page.locator('.session-card')).toHaveCount(1);
  });

  test('should show offline indicator', async ({ page, context }) => {
    await page.goto('http://localhost:3000');

    // Go offline
    await context.setOffline(true);

    // Should show offline indicator
    await expect(page.locator('.offline-indicator')).toBeVisible();

    // Start quiz button should be disabled
    await expect(page.locator('#startBtn')).toBeDisabled();
  });
});
```

---

## 8.3 Manual Testing Checklist

### Happy Path Testing

**Test 1: Complete Quiz Flow**
```
Steps:
1. Open app
2. Enter topic: "Fractions"
3. Select grade: "5th Grade"
4. Click "Start Quiz"
5. Answer all 5 questions
6. Click "Submit"
7. View results
8. Navigate to History
9. Verify session appears

Expected:
✓ All steps complete without errors
✓ Questions load within 2 seconds
✓ Answers save correctly
✓ Score calculates correctly
✓ History shows new session
```

**Test 2: Offline History Access**
```
Steps:
1. Complete a quiz (online)
2. Go offline (DevTools → Network → Offline)
3. Navigate to History
4. View past sessions
5. Go back online
6. Try new quiz

Expected:
✓ History loads offline
✓ Past sessions display correctly
✓ "Start Quiz" disabled when offline
✓ Offline indicator shows
✓ Works again when online
```

**Test 3: Settings Persistence**
```
Steps:
1. Go to Settings
2. Change default grade level to "High School"
3. Save settings
4. Close browser
5. Reopen app
6. Check settings

Expected:
✓ Settings persist across sessions
✓ Default grade level remembered
✓ API key remains saved (if entered)
```

### Edge Case Testing

**Test 4: Empty Input**
```
Steps:
1. Click "Start Quiz" without entering topic
2. Enter spaces only, click start

Expected:
✓ Alert shows: "Please enter a topic"
✓ Quiz doesn't start
✓ User stays on home screen
```

**Test 5: Very Long Topic Name**
```
Steps:
1. Enter topic: "The complete history of the Roman Empire from rise to fall including all major battles and political intrigue"
2. Start quiz

Expected:
✓ Quiz generates successfully
✓ Topic displays properly (truncated if needed)
✓ No layout breaking
```

**Test 6: Rapid Navigation**
```
Steps:
1. Start quiz
2. Immediately click browser back
3. Click forward
4. Navigate to different route

Expected:
✓ No errors in console
✓ Views render correctly
✓ State maintains consistency
✓ No memory leaks
```

**Test 7: Browser Refresh Mid-Quiz**
```
Steps:
1. Start quiz
2. Answer 2 questions
3. Refresh browser
4. Check state

Expected:
✓ App loads (doesn't crash)
✓ Quiz state lost (acceptable)
✓ User returned to home screen
✓ No errors
```

**Test 8: Multiple Tabs**
```
Steps:
1. Open app in tab 1
2. Start quiz
3. Open app in tab 2
4. Start different quiz
5. Check both tabs

Expected:
✓ Each tab works independently
✓ IndexedDB handles concurrent access
✓ No data corruption
```

**Test 9: API Failure Simulation**
```
Steps:
1. Mock API returns error
2. Try to start quiz

Expected:
✓ Error message shown
✓ User can retry
✓ No app crash
✓ Graceful fallback
```

**Test 10: Empty History**
```
Steps:
1. Clear all history
2. Navigate to History

Expected:
✓ Empty state shown
✓ Message: "No quiz history yet"
✓ Button to start first quiz
✓ No errors
```

---

## 8.3 Cross-Browser Testing

### Browsers to Test

**Desktop:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if Mac available)
- [ ] Edge (latest)

**Mobile:**
- [ ] Chrome Android
- [ ] Safari iOS

### Browser-Specific Issues

**Common issues:**
- Date formatting differences
- CSS vendor prefixes
- JavaScript API availability
- Service worker support

**Test in each browser:**
- [ ] Basic navigation works
- [ ] Quiz flow completes
- [ ] IndexedDB works
- [ ] Service worker registers
- [ ] App installs (if supported)

---

## 8.4 Error Handling Improvements

### Add Error Boundary

```javascript
// src/utils/errorHandler.js

export class ErrorBoundary {
  constructor() {
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.showError('Something went wrong. Please try again.');
      event.preventDefault();
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.showError('An unexpected error occurred.');
      event.preventDefault();
    });
  }

  showError(message) {
    // Show error toast or modal
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// Initialize in main.js
new ErrorBoundary();
```

### Retry Logic for API Calls

```javascript
// src/api/api.mock.js (update)

export async function generateQuestions(topic, gradeLevel, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate random failure for testing
      if (Math.random() < 0.1 && attempt < retries - 1) {
        throw new Error('Network error');
      }

      console.log(`[MOCK API] Generating questions (attempt ${attempt + 1})`);

      // Return questions...
      return questions;

    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (attempt === retries - 1) {
        throw new Error('Failed after multiple attempts. Please try again.');
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}
```

### Graceful Degradation

```javascript
// src/views/QuizView.js

async render() {
  try {
    const questions = await generateQuestions(topic, gradeLevel);
    this.renderQuiz(questions);

  } catch (error) {
    console.error('Failed to generate questions:', error);

    // Show friendly error with retry option
    this.setHTML(`
      <div class="error-view">
        <h2>😕 Oops!</h2>
        <p>We couldn't generate questions right now.</p>
        <p class="error-detail">${error.message}</p>

        <div class="error-actions">
          <button id="retryBtn" class="primary-btn">Try Again</button>
          <button id="homeBtn" class="secondary-btn">Go Home</button>
        </div>
      </div>
    `);

    this.querySelector('#retryBtn').addEventListener('click', () => {
      this.render();  // Retry
    });

    this.querySelector('#homeBtn').addEventListener('click', () => {
      this.navigateTo('/');
    });
  }
}
```

---

## 8.5 Loading States

### Add Proper Loading UI

```javascript
// src/components/LoadingSpinner.js

export default class LoadingSpinner {
  static render(message = 'Loading...') {
    return `
      <div class="loading-view">
        <div class="spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-message">${message}</p>
      </div>
    `;
  }
}
```

```css
/* styles.css */

.loading-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 40px;
}

.spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top-color: #4F46E5;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.4s;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.8s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-message {
  margin-top: 20px;
  color: #6B7280;
  font-size: 14px;
}
```

### Skeleton Screens

```javascript
// src/views/HistoryView.js

render() {
  // Show skeleton while loading
  this.setHTML(`
    <div class="history-view">
      <h1>Quiz History</h1>
      <div class="sessions-list">
        ${this.renderSkeleton()}
      </div>
    </div>
  `);

  // Load real data
  this.loadHistory();
}

renderSkeleton() {
  return Array(3).fill(0).map(() => `
    <div class="session-card skeleton">
      <div class="skeleton-title"></div>
      <div class="skeleton-meta"></div>
      <div class="skeleton-score"></div>
    </div>
  `).join('');
}

async loadHistory() {
  const sessions = await getRecentSessions(20);
  this.renderHistory(sessions);
}
```

---

## 8.6 UI/UX Polish

### Micro-Interactions

**1. Button Feedback**
```css
.primary-btn {
  transition: all 0.2s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.primary-btn:active {
  transform: translateY(0);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

**2. Success Feedback**
```javascript
// After saving settings
saveBtn.textContent = '✓ Saved!';
saveBtn.classList.add('success');

setTimeout(() => {
  saveBtn.textContent = 'Save Settings';
  saveBtn.classList.remove('success');
}, 2000);
```

**3. Smooth Transitions**
```css
#app > * {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Accessibility Improvements

**1. Focus Indicators**
```css
*:focus {
  outline: 2px solid #4F46E5;
  outline-offset: 2px;
}

button:focus,
input:focus,
select:focus {
  outline: 2px solid #4F46E5;
  outline-offset: 2px;
}
```

**2. ARIA Labels**
```javascript
// In QuizView
renderQuestion() {
  return `
    <div class="quiz-view" role="main" aria-live="polite">
      <div class="progress" role="progressbar"
           aria-valuenow="${questionIndex + 1}"
           aria-valuemin="1"
           aria-valuemax="${questions.length}">
        Question ${questionIndex + 1} of ${questions.length}
      </div>

      <h2 class="question-text" id="question-${questionIndex}">
        ${question.question}
      </h2>

      <div class="options" role="radiogroup"
           aria-labelledby="question-${questionIndex}">
        ${question.options.map((option, index) => `
          <button
            class="option-btn"
            role="radio"
            aria-checked="${answers[questionIndex] === option[0]}"
            data-answer="${option[0]}">
            ${option}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}
```

**3. Keyboard Navigation**
```javascript
// Allow Enter key to submit
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const activeElement = document.activeElement;

    // If on option button, select it
    if (activeElement.classList.contains('option-btn')) {
      activeElement.click();
    }

    // If on next button, click it
    if (activeElement.id === 'nextBtn') {
      activeElement.click();
    }
  }
});
```

---

## 8.7 Performance Optimization

### Measure Performance

```javascript
// src/utils/performance.js

export function measurePageLoad() {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];

    console.log('Performance Metrics:');
    console.log('- DOM Content Loaded:', perfData.domContentLoadedEventEnd);
    console.log('- Load Complete:', perfData.loadEventEnd);
    console.log('- Total Load Time:', perfData.loadEventEnd - perfData.fetchStart);
  });
}

export function measureViewRender(viewName) {
  const start = performance.now();

  return () => {
    const end = performance.now();
    console.log(`${viewName} render time: ${end - start}ms`);
  };
}

// Usage in view
render() {
  const measure = measureViewRender('HomeView');
  // ... rendering code ...
  measure();
}
```

### Optimize Bundle Size

```bash
# Analyze bundle
npm run build

# Check dist/ folder size
ls -lh dist/
```

**Tips:**
- Remove unused imports
- Lazy load views (dynamic imports)
- Minify CSS
- Compress images

---

## 8.8 Bug Log Template

### Track Issues

```markdown
# Bug Log

## Bug #1: Quiz doesn't submit if last question unanswered
**Severity**: High
**Steps to reproduce**:
1. Start quiz
2. Answer questions 1-4
3. Leave question 5 unanswered
4. Click Submit

**Expected**: Alert to answer all questions
**Actual**: Submits with undefined answer

**Fix**: Add validation before submit
**Status**: Fixed in commit abc123

---

## Bug #2: History shows duplicate sessions
**Severity**: Medium
**Steps to reproduce**:
1. Complete quiz
2. View history
3. Refresh page
4. See duplicate

**Root cause**: IndexedDB auto-increment issue
**Fix**: TBD
**Status**: In progress
```

---

## 8.9 Final Pre-Launch Checklist

### Functionality
- [ ] All quiz flows work
- [ ] History displays correctly
- [ ] Settings persist
- [ ] Offline mode works
- [ ] Install works
- [ ] Error handling works

### Performance
- [ ] Page loads < 2 seconds
- [ ] Quiz generates < 3 seconds
- [ ] No memory leaks
- [ ] Smooth animations

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color contrast passes WCAG AA

### Cross-Browser
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Works on mobile

### PWA
- [ ] Lighthouse score 90+
- [ ] Service worker works
- [ ] Manifest valid
- [ ] Icons display properly

### Content
- [ ] No typos
- [ ] Instructions clear
- [ ] Error messages helpful
- [ ] Success messages encouraging

---

## Checkpoint Questions

**Q1**: Why is manual testing still important when we have unit tests?

<details>
<summary>Answer</summary>

Unit tests check individual functions in isolation. Manual testing checks:
- User flows (multiple steps)
- Visual appearance
- Real browser quirks
- User experience
- Edge cases humans think of

Both are needed for quality assurance.
</details>

**Q2**: What's the difference between error handling and graceful degradation?

<details>
<summary>Answer</summary>

**Error handling**: Catching errors and showing messages
- Try/catch blocks
- Error boundaries
- User-friendly messages

**Graceful degradation**: App still works when features fail
- Offline mode (limited features)
- Fallback for old browsers
- Alternative flows when API fails

Graceful degradation is error handling + alternative functionality.
</details>

**Q3**: Why test in multiple browsers?

<details>
<summary>Answer</summary>

Each browser has:
- Different JavaScript engines
- Different CSS rendering
- Different API support
- Different bugs

What works in Chrome might break in Safari. Testing ensures it works everywhere.
</details>

---

## Hands-On Exercise

### Complete Testing & Polish

**Task**: Thoroughly test QuizMaster and fix all issues found.

**Steps**:

1. **Run all manual tests** from checklist above

2. **Fix bugs** discovered during testing

3. **Add loading states** for all async operations

4. **Improve error messages** to be user-friendly

5. **Polish UI** with transitions and feedback

6. **Run Lighthouse audit** and fix issues

7. **Test in 3+ browsers**

8. **Create bug log** for any remaining issues

**Success Criteria**:
- ✅ All manual tests pass
- ✅ No console errors
- ✅ Lighthouse score 90+
- ✅ Works in multiple browsers
- ✅ Loading states everywhere
- ✅ Graceful error handling

---

## Next Steps

Once testing is complete:

**"I'm ready for Phase 9"** → We'll deploy to production

**Found bugs?** → Document and fix them before deploying

---

## Learning Notes

**Date Started**: ___________

**Bugs Found**: _____
**Bugs Fixed**: _____

**Browser Testing**:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile

**Lighthouse Score**: _____/100

**Date Completed**: ___________
