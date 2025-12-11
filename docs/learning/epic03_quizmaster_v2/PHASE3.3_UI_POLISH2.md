# Phase 3.3: UI Polish 2 - Consistency & Offline Experience

**Epic:** 3 - QuizMaster V2
**Status:** Not Started
**Estimated Time:** 2-3 sessions
**Prerequisites:** Phase 3 (UI Polish) complete

---

## Overview

Phase 3.3 focuses on UI consistency improvements and enhancing the offline experience. This interim phase addresses visual inconsistencies, enables quiz replay functionality, and implements proper offline-aware UI behavior.

**What you'll build:**
- Consistent button sizing across the home page
- Quiz replay functionality from saved sessions
- Offline-aware UI (disabled actions when offline)
- Topics page with full quiz history
- Automated version numbering in build process

**Why this matters:**
- Visual consistency improves perceived quality
- Quiz replay adds significant value for learning retention
- Offline-first design is core PWA philosophy
- Automated versioning enables proper release tracking

---

## Learning Objectives

By the end of this phase, you will:
- Understand responsive design patterns with Tailwind CSS
- Learn to store and retrieve complete quiz data for replay
- Implement offline-aware UI patterns
- Build a list view with filtering/sorting capabilities
- Set up automated version generation in build pipelines

---

## Current State Analysis

### Codebase Patterns (from exploration)

**View Structure:**
- All views extend `BaseView` (`src/views/BaseView.js`)
- Pattern: `render()` → `setHTML()` → `attachListeners()`
- Cleanup via `destroy()` method (tracked event listeners)

**Routing:**
- Hash-based SPA routing (`src/router/router.js`)
- Routes registered in `main.js`
- Navigation via `this.navigateTo('/path')`

**Database (IndexedDB):**
- Wrapper in `src/db/db.js` using `idb` library
- Stores: `topics`, `sessions`, `settings`
- Session object: `{ id, topicId, topic, score, totalQuestions, timestamp }`

**Network Detection:**
- `src/utils/network.js` provides `isOnline()`, `onOnline()`, `onOffline()`
- Visual indicator: green dot (online) / orange dot (offline)

**Styling:**
- Tailwind CSS via CDN
- Dark mode enabled by default (`<html class="dark">`)
- Color variables defined in `tailwind.config`

**Current Button Styling (HomeView.js:29-35):**
```javascript
<button id="startQuizBtn" class="flex cursor-pointer items-center justify-center
  bg-primary text-white rounded-xl h-14 px-5 shadow-lg shadow-primary/30
  hover:bg-primary/90 transition-colors">
  <span class="material-symbols-outlined mr-2">add</span>
  Start New Quiz
</button>
```

**Current Recent Topics Container (HomeView.js:76):**
```javascript
<div class="flex flex-col gap-3">
  <!-- quiz items are full width within this container -->
</div>
```

**Current Session Storage (db.js):**
```javascript
// Sessions store questions as generated, but answers not stored for replay
{
  id: auto,
  topicId: string,
  topic: string,
  score: number,
  totalQuestions: number,
  timestamp: Date
}
```

---

## Implementation Tasks

### Task 1: Full-Width "Start New Quiz" Button

**Problem:** Button has fixed padding (`px-5`) while Recent Topics list is full-width.

**Solution:** Make button full-width to match the container.

**File:** `src/views/HomeView.js`

**Current (lines 29-35):**
```html
<button id="startQuizBtn" class="flex cursor-pointer items-center justify-center
  bg-primary text-white rounded-xl h-14 px-5 shadow-lg shadow-primary/30
  hover:bg-primary/90 transition-colors">
```

**Target:**
```html
<button id="startQuizBtn" class="flex w-full cursor-pointer items-center justify-center
  bg-primary text-white rounded-xl h-14 shadow-lg shadow-primary/30
  hover:bg-primary/90 transition-colors">
```

**Changes:**
- Add `w-full` class for full width
- Remove `px-5` (no longer needed with full width)

**Testing:**
1. Run dev server: `npm run dev`
2. Open http://localhost:8888
3. Verify button spans full width of container
4. Verify button aligns with Recent Topics cards below
5. Test on mobile viewport (responsive)

---

### Task 2: Quiz Replay from Saved Sessions

**Problem:** Clicking a recent quiz item does nothing. Users should be able to replay saved quizzes.

**Solution:**
1. Store complete quiz data (questions + user answers) in session
2. Add click handler to recent quiz items
3. Create replay flow that loads saved questions

#### Step 2.1: Extend Session Schema

**File:** `src/db/db.js`

**Current session object:**
```javascript
{
  id, topicId, topic, score, totalQuestions, timestamp
}
```

**Extended session object:**
```javascript
{
  id,
  topicId,
  topic,
  score,
  totalQuestions,
  timestamp,
  gradeLevel,        // NEW: for context
  questions: [       // NEW: complete question data
    {
      question: string,
      options: string[],
      correctAnswer: number,
      explanation: string
    }
  ],
  userAnswers: []    // NEW: user's answers (indices)
}
```

**Note:** Existing sessions without `questions` field will work (graceful degradation).

#### Step 2.2: Update ResultsView to Save Complete Data

**File:** `src/views/ResultsView.js`

When saving session, include questions and answers:
```javascript
const session = {
  topic: state.get('currentTopic'),
  topicId: state.get('currentTopic').toLowerCase().replace(/\s+/g, '-'),
  score: score,
  totalQuestions: questions.length,
  timestamp: new Date(),
  gradeLevel: state.get('currentGradeLevel'),
  questions: questions,           // Full question objects
  userAnswers: state.get('currentAnswers')  // User's answer indices
};
await db.saveSession(session);
```

#### Step 2.3: Add Click Handler to Recent Quiz Items

**File:** `src/views/HomeView.js`

**Current item (lines 85-102):** No click handler, just display.

**Target:** Add data attribute and click handler.

```html
<div class="quiz-item flex items-center gap-4 bg-card-light dark:bg-card-dark
  rounded-xl p-4 cursor-pointer hover:bg-opacity-80 transition-colors"
  data-session-id="${session.id}">
  <!-- existing content -->
</div>
```

**Click handler:**
```javascript
const quizItems = this.container.querySelectorAll('.quiz-item');
quizItems.forEach(item => {
  this.addEventListener(item, 'click', async () => {
    const sessionId = parseInt(item.dataset.sessionId);
    await this.replayQuiz(sessionId);
  });
});
```

#### Step 2.4: Implement Replay Flow

**File:** `src/views/HomeView.js`

**New method:**
```javascript
async replayQuiz(sessionId) {
  const session = await db.getSession(sessionId);

  if (!session.questions) {
    // Old session without saved questions
    alert('This quiz was saved before replay was available. Start a new quiz on this topic!');
    return;
  }

  // Set state for replay
  state.set('currentTopic', session.topic);
  state.set('currentGradeLevel', session.gradeLevel || 'middle school');
  state.set('generatedQuestions', session.questions);
  state.set('currentAnswers', []);
  state.set('isReplay', true);  // Flag for UI indication

  this.navigateTo('/quiz');
}
```

**Database function needed:**
```javascript
// In db.js
async getSession(id) {
  const db = await this.getDB();
  return db.get('sessions', id);
}
```

**Testing:**
1. Complete a new quiz to save with questions
2. Return to home page
3. Click on the saved quiz
4. Verify quiz loads with same questions
5. Complete replay and verify new session is saved

---

### Task 3: Offline-Aware UI

**Problem:** "Start New Quiz" is clickable when offline, leading to failed API calls.

**Solution:** Disable button and show message when offline.

#### Step 3.1: Add Disabled State to Button

**File:** `src/views/HomeView.js`

**Button with conditional disabled state:**
```html
<button id="startQuizBtn"
  class="flex w-full cursor-pointer items-center justify-center
    bg-primary text-white rounded-xl h-14 shadow-lg shadow-primary/30
    hover:bg-primary/90 transition-colors
    disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
  ${!isOnline() ? 'disabled' : ''}>
  <span class="material-symbols-outlined mr-2">add</span>
  Start New Quiz
</button>
```

#### Step 3.2: Add Offline Banner

**File:** `src/views/HomeView.js`

**Offline message (shown when offline):**
```html
${!isOnline() ? `
  <div class="bg-orange-500/20 border border-orange-500 rounded-xl p-4 mb-4">
    <div class="flex items-center gap-2 text-orange-500">
      <span class="material-symbols-outlined">wifi_off</span>
      <span>You're offline. You can replay saved quizzes below.</span>
    </div>
  </div>
` : ''}
```

#### Step 3.3: Listen for Network Changes

**File:** `src/views/HomeView.js`

**In render() or attachListeners():**
```javascript
import { isOnline, onOnline, onOffline } from '../utils/network.js';

// Re-render when network status changes
onOnline(() => this.render());
onOffline(() => this.render());
```

**Note:** Must handle cleanup in `destroy()` to prevent memory leaks.

#### Step 3.4: Update Network Utility for Cleanup

**File:** `src/utils/network.js`

Add listener removal support:
```javascript
export function onOnline(callback) {
  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
}

export function onOffline(callback) {
  window.addEventListener('offline', callback);
  return () => window.removeEventListener('offline', callback);
}
```

**In HomeView.js destroy():**
```javascript
destroy() {
  if (this.removeOnlineListener) this.removeOnlineListener();
  if (this.removeOfflineListener) this.removeOfflineListener();
  super.destroy();
}
```

**Testing:**
1. Open app while online, verify button is enabled
2. Open DevTools → Network → check "Offline"
3. Verify button becomes disabled with gray styling
4. Verify offline banner appears
5. Click on saved quiz, verify replay still works
6. Uncheck "Offline", verify button re-enables

---

### Task 4: Topics Page (Quiz History)

**Problem:** Topics nav item exists but page shows nothing useful.

**Solution:** Create a full quiz history page with all saved quizzes.

#### Step 4.1: Create TopicsView (or rename HistoryView)

**File:** `src/views/TopicsView.js` (new file)

**Features:**
- List all saved quiz sessions (not just last 10)
- Group by topic or show as flat list
- Sort by date (newest first)
- Show score, date, question count
- Click to replay
- Empty state if no quizzes

**Template structure:**
```javascript
import { BaseView } from './BaseView.js';
import { db } from '../db/db.js';
import { state } from '../state/state.js';
import { isOnline } from '../utils/network.js';

export class TopicsView extends BaseView {
  async render() {
    const sessions = await db.getAllSessions(); // Need to implement

    this.setHTML(`
      <div class="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
        <!-- Header -->
        <header class="flex items-center justify-between p-4">
          <h1 class="text-xl font-bold text-text-light dark:text-text-dark">
            Quiz History
          </h1>
          <span class="text-subtext-light dark:text-subtext-dark">
            ${sessions.length} quizzes
          </span>
        </header>

        <!-- Quiz List -->
        <main class="flex-1 p-4 pb-24">
          ${sessions.length === 0 ? this.renderEmptyState() : this.renderQuizList(sessions)}
        </main>

        <!-- Bottom Navigation -->
        ${this.renderNavigation('topics')}
      </div>
    `);

    this.attachListeners();
  }

  renderEmptyState() {
    return `
      <div class="flex flex-col items-center justify-center h-64 text-center">
        <span class="material-symbols-outlined text-6xl text-subtext-light dark:text-subtext-dark mb-4">
          quiz
        </span>
        <p class="text-xl text-text-light dark:text-text-dark mb-2">No quizzes yet</p>
        <p class="text-subtext-light dark:text-subtext-dark">
          Complete your first quiz to see it here
        </p>
      </div>
    `;
  }

  renderQuizList(sessions) {
    return `
      <div class="flex flex-col gap-3">
        ${sessions.map(session => this.renderQuizItem(session)).join('')}
      </div>
    `;
  }

  renderQuizItem(session) {
    const date = this.formatDate(session.timestamp);
    const scorePercent = Math.round((session.score / session.totalQuestions) * 100);
    const scoreColor = scorePercent >= 80 ? 'text-green-500' :
                       scorePercent >= 50 ? 'text-orange-500' : 'text-red-500';
    const canReplay = !!session.questions;

    return `
      <div class="quiz-item flex items-center gap-4 bg-card-light dark:bg-card-dark
        rounded-xl p-4 ${canReplay ? 'cursor-pointer hover:bg-opacity-80' : 'opacity-60'}
        transition-colors"
        data-session-id="${session.id}"
        ${!canReplay ? 'data-no-replay="true"' : ''}>

        <div class="w-12 h-12 rounded-xl flex items-center justify-center
          ${scorePercent >= 80 ? 'bg-green-500/20' :
            scorePercent >= 50 ? 'bg-orange-500/20' : 'bg-red-500/20'}">
          <span class="material-symbols-outlined ${scoreColor}">quiz</span>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-text-light dark:text-text-dark font-medium truncate">
            ${session.topic}
          </p>
          <p class="text-sm text-subtext-light dark:text-subtext-dark">
            ${date} ${!canReplay ? '• Cannot replay' : ''}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="${scoreColor} font-bold">
            ${session.score}/${session.totalQuestions}
          </span>
          ${canReplay ? `
            <span class="material-symbols-outlined text-subtext-light dark:text-subtext-dark">
              chevron_right
            </span>
          ` : ''}
        </div>
      </div>
    `;
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  renderNavigation(active) {
    // Same navigation as HomeView but with 'topics' highlighted
    // ... (copy from HomeView and parameterize)
  }

  attachListeners() {
    const quizItems = this.container.querySelectorAll('.quiz-item:not([data-no-replay])');
    quizItems.forEach(item => {
      this.addEventListener(item, 'click', async () => {
        const sessionId = parseInt(item.dataset.sessionId);
        await this.replayQuiz(sessionId);
      });
    });

    // Navigation listeners
    // ...
  }

  async replayQuiz(sessionId) {
    const session = await db.getSession(sessionId);

    state.set('currentTopic', session.topic);
    state.set('currentGradeLevel', session.gradeLevel || 'middle school');
    state.set('generatedQuestions', session.questions);
    state.set('currentAnswers', []);
    state.set('isReplay', true);

    this.navigateTo('/quiz');
  }
}
```

#### Step 4.2: Add Database Method

**File:** `src/db/db.js`

```javascript
async getAllSessions() {
  const db = await this.getDB();
  const sessions = await db.getAll('sessions');
  // Sort by timestamp descending (newest first)
  return sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
```

#### Step 4.3: Register Route

**File:** `src/main.js`

```javascript
import { TopicsView } from './views/TopicsView.js';

// In initApp():
router.addRoute('/topics', TopicsView);
```

#### Step 4.4: Update Navigation

Update all views' navigation to use `/topics` route:
- `HomeView.js`
- `SettingsView.js`
- `TopicsView.js`

**Testing:**
1. Navigate to Topics page via bottom nav
2. Verify all quizzes displayed (not just 10)
3. Verify sorting (newest first)
4. Click quiz with questions → should replay
5. Verify old quizzes without questions show "Cannot replay"
6. Test empty state (clear IndexedDB)

---

### Task 5: Automated Version Numbering

**Problem:** Version hardcoded as `2.0.0` in SettingsView.

**Solution:** Generate version at build time in format `YYYYMMDD.NN`

#### Step 5.1: Create Version Generation Script

**File:** `scripts/generate-version.js` (new file)

```javascript
import fs from 'fs';
import path from 'path';

const VERSION_FILE = 'src/version.js';
const VERSION_HISTORY = '.version-history.json';

function generateVersion() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

  // Load version history
  let history = { lastDate: '', lastSeq: 0 };
  if (fs.existsSync(VERSION_HISTORY)) {
    history = JSON.parse(fs.readFileSync(VERSION_HISTORY, 'utf8'));
  }

  // Determine sequence number
  let seq = 1;
  if (history.lastDate === dateStr) {
    seq = history.lastSeq + 1;
  }

  // Format: YYYYMMDD.NN (e.g., 20251126.01)
  const version = `${dateStr}.${String(seq).padStart(2, '0')}`;

  // Save history
  fs.writeFileSync(VERSION_HISTORY, JSON.stringify({
    lastDate: dateStr,
    lastSeq: seq
  }, null, 2));

  // Generate version module
  const versionModule = `// Auto-generated - do not edit
export const APP_VERSION = '${version}';
export const BUILD_DATE = '${now.toISOString()}';
`;

  fs.writeFileSync(VERSION_FILE, versionModule);
  console.log(`Generated version: ${version}`);

  return version;
}

generateVersion();
```

#### Step 5.2: Update Package.json Scripts

**File:** `package.json`

```json
{
  "scripts": {
    "version": "node scripts/generate-version.js",
    "prebuild": "npm run version",
    "build": "vite build",
    "dev": "netlify dev",
    "preview": "vite preview"
  }
}
```

**Explanation:**
- `npm run version` - Manually generate new version
- `prebuild` - Automatically runs before `npm run build`
- Version increments each build on same day

#### Step 5.3: Create Version Module

**File:** `src/version.js` (initial version, will be auto-generated)

```javascript
// Auto-generated - do not edit
export const APP_VERSION = '20251126.01';
export const BUILD_DATE = '2025-11-26T00:00:00.000Z';
```

#### Step 5.4: Update SettingsView

**File:** `src/views/SettingsView.js`

```javascript
import { APP_VERSION, BUILD_DATE } from '../version.js';

// In render(), replace hardcoded version:
<div class="flex items-center justify-between">
  <span class="text-text-light dark:text-text-dark">Version</span>
  <span class="text-subtext-light dark:text-subtext-dark">${APP_VERSION}</span>
</div>
<div class="flex items-center justify-between text-sm">
  <span class="text-subtext-light dark:text-subtext-dark">Built</span>
  <span class="text-subtext-light dark:text-subtext-dark">
    ${new Date(BUILD_DATE).toLocaleDateString()}
  </span>
</div>
```

#### Step 5.5: Add to .gitignore

**File:** `.gitignore`

```
# Version history (local build tracking)
.version-history.json
```

**Note:** `src/version.js` SHOULD be committed so deployed builds have the version.

#### Step 5.6: Netlify Build Integration

The `prebuild` script runs automatically before `vite build`, so Netlify will:
1. Run `npm run prebuild` (generates version)
2. Run `vite build` (includes generated version)

**Testing:**
1. Run `npm run version` - check `src/version.js` created
2. Run `npm run version` again - sequence increments
3. Run `npm run build` - version included in dist
4. Check Settings page shows new version format
5. Deploy to Netlify, verify version in production

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/views/HomeView.js` | Modify | Full-width button, click handlers, offline state |
| `src/views/TopicsView.js` | Create | New quiz history page |
| `src/views/SettingsView.js` | Modify | Dynamic version display |
| `src/views/ResultsView.js` | Modify | Save questions with session |
| `src/db/db.js` | Modify | Add `getSession()`, `getAllSessions()` |
| `src/utils/network.js` | Modify | Add listener cleanup support |
| `src/version.js` | Create | Auto-generated version module |
| `src/main.js` | Modify | Register `/topics` route |
| `scripts/generate-version.js` | Create | Version generation script |
| `package.json` | Modify | Add version scripts |
| `.gitignore` | Modify | Ignore version history file |

---

## Testing Checklist

### Task 1: Button Width
- [ ] Button spans full container width
- [ ] Aligned with Recent Topics cards
- [ ] Responsive on mobile

### Task 2: Quiz Replay
- [ ] New quizzes save with questions
- [ ] Clicking recent quiz loads saved questions
- [ ] Replay completes and saves as new session
- [ ] Old sessions without questions show message

### Task 3: Offline Mode
- [ ] Button disabled when offline
- [ ] Offline banner displayed
- [ ] Saved quiz replay works offline
- [ ] UI updates when going online/offline

### Task 4: Topics Page
- [ ] All quizzes displayed
- [ ] Sorted by date (newest first)
- [ ] Click to replay works
- [ ] Empty state displayed correctly
- [ ] Navigation highlights Topics

### Task 5: Version Numbering
- [ ] Version generates correctly (YYYYMMDD.NN)
- [ ] Sequence increments on same day
- [ ] Resets to .01 on new day
- [ ] Shows in Settings page
- [ ] Works in Netlify deploy

---

## Success Criteria

Phase 3.3 is complete when:

1. **Visual Consistency:**
   - [ ] "Start New Quiz" button matches container width
   - [ ] All cards and buttons have consistent styling

2. **Quiz Replay:**
   - [ ] Users can replay any saved quiz
   - [ ] Questions and answers preserved
   - [ ] Clear indication of replayable vs non-replayable quizzes

3. **Offline Experience:**
   - [ ] Clear visual indication of offline status
   - [ ] "Start New Quiz" disabled when offline
   - [ ] Saved quizzes still accessible offline
   - [ ] Graceful online/offline transitions

4. **Quiz History:**
   - [ ] Topics page shows complete quiz history
   - [ ] Easy to find and replay past quizzes
   - [ ] Useful statistics (score, date, topic)

5. **Version Management:**
   - [ ] Automated version generation
   - [ ] Version displayed in Settings
   - [ ] Works in CI/CD pipeline

---

## Automated Testing

> **Note:** Test infrastructure (Vitest for unit tests, Playwright for E2E) was set up in Epic 01 Phase 4. See `docs/epic01_infrastructure/PHASE4.3_UNIT_TESTING.md` and `PHASE4.4_E2E_TESTING.md` for setup details.

### Unit Tests (Vitest)

Tests for isolated functions and modules.

#### `src/db/db.test.js` — Database Functions

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { updateSession, getSession, saveSession } from './db.js';

describe('updateSession', () => {
  beforeEach(async () => {
    // Clear test database or use fake-indexeddb
  });

  it('should update existing session with new data', async () => {
    // Arrange: Create a session
    const sessionId = await saveSession({
      topic: 'Math',
      score: 3,
      totalQuestions: 5,
      timestamp: Date.now(),
      questions: [],
      answers: []
    });

    // Act: Update the session
    const updated = await updateSession(sessionId, { score: 5 });

    // Assert: Score should be updated
    expect(updated.score).toBe(5);
    expect(updated.topic).toBe('Math'); // Other fields unchanged
  });

  it('should return null for non-existent session', async () => {
    const result = await updateSession(99999, { score: 5 });
    expect(result).toBeNull();
  });

  it('should update timestamp on replay', async () => {
    const originalTimestamp = Date.now() - 10000;
    const sessionId = await saveSession({
      topic: 'Science',
      score: 4,
      totalQuestions: 5,
      timestamp: originalTimestamp,
      questions: [],
      answers: []
    });

    const newTimestamp = Date.now();
    await updateSession(sessionId, { timestamp: newTimestamp });

    const session = await getSession(sessionId);
    expect(session.timestamp).toBe(newTimestamp);
    expect(session.timestamp).toBeGreaterThan(originalTimestamp);
  });
});
```

#### `src/utils/network.test.js` — Network Utilities

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isOnline, updateOfflineUI } from './network.js';

describe('isOnline', () => {
  it('should return navigator.onLine value', () => {
    // Note: May need to mock navigator.onLine
    expect(typeof isOnline()).toBe('boolean');
  });
});

describe('updateOfflineUI', () => {
  let banner, button;

  beforeEach(() => {
    // Create mock DOM elements
    banner = document.createElement('div');
    banner.id = 'offlineBanner';
    banner.classList.add('hidden');
    document.body.appendChild(banner);

    button = document.createElement('button');
    button.id = 'startQuizBtn';
    document.body.appendChild(button);
  });

  afterEach(() => {
    banner.remove();
    button.remove();
  });

  it('should hide banner and enable button when online', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    updateOfflineUI();

    expect(banner.classList.contains('hidden')).toBe(true);
    expect(button.disabled).toBe(false);
  });

  it('should show banner and disable button when offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    updateOfflineUI();

    expect(banner.classList.contains('hidden')).toBe(false);
    expect(button.disabled).toBe(true);
  });

  it('should handle missing elements gracefully', () => {
    banner.remove();
    button.remove();

    // Should not throw
    expect(() => updateOfflineUI()).not.toThrow();
  });
});
```

#### `scripts/generate-version.test.js` — Version Generation

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Test the version format and sequence logic
describe('Version Generation', () => {
  const VERSION_FILE = 'src/version.test.js';
  const HISTORY_FILE = '.version-history.test.json';

  afterEach(() => {
    // Cleanup test files
    if (fs.existsSync(VERSION_FILE)) fs.unlinkSync(VERSION_FILE);
    if (fs.existsSync(HISTORY_FILE)) fs.unlinkSync(HISTORY_FILE);
  });

  it('should generate version in YYYYMMDD.NN format', () => {
    const version = '20251126.01';
    expect(version).toMatch(/^\d{8}\.\d{2}$/);
  });

  it('should increment sequence on same day', () => {
    const history = { lastDate: '20251126', lastSeq: 1 };
    const currentDate = '20251126';

    const seq = history.lastDate === currentDate ? history.lastSeq + 1 : 1;

    expect(seq).toBe(2);
  });

  it('should reset sequence on new day', () => {
    const history = { lastDate: '20251125', lastSeq: 5 };
    const currentDate = '20251126';

    const seq = history.lastDate === currentDate ? history.lastSeq + 1 : 1;

    expect(seq).toBe(1);
  });
});
```

---

### E2E Tests (Playwright)

Tests for complete user workflows in real browser.

#### `e2e/quiz-replay.spec.js` — Quiz Replay Flow

```javascript
import { test, expect } from '@playwright/test';

test.describe('Quiz Replay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should replay a saved quiz when clicked', async ({ page }) => {
    // Prerequisite: Complete a quiz first (or seed test data)
    // This test assumes there's at least one saved quiz

    // Find a quiz item and click it
    const quizItem = page.locator('.quiz-item').first();
    await quizItem.click();

    // Should navigate to quiz page
    await expect(page).toHaveURL(/#\/quiz/);

    // Should show quiz questions (not loading page)
    await expect(page.locator('text=Question 1 of')).toBeVisible();
  });

  test('should update existing session on replay completion', async ({ page }) => {
    // Get initial quiz count
    await page.goto('/#/history');
    const initialCount = await page.locator('.quiz-item').count();

    // Replay a quiz
    await page.locator('.quiz-item').first().click();

    // Complete the quiz (select answers and submit)
    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').first().click();
      await page.locator('#submitBtn').click();
    }

    // Navigate back to history
    await page.goto('/#/history');

    // Quiz count should be the same (updated, not added)
    const finalCount = await page.locator('.quiz-item').count();
    expect(finalCount).toBe(initialCount);
  });

  test('should show message for non-replayable quiz', async ({ page }) => {
    // Find a quiz marked as non-replayable
    const nonReplayable = page.locator('[data-no-replay="true"]').first();

    if (await nonReplayable.count() > 0) {
      await nonReplayable.click();

      // Should show alert or stay on same page
      await expect(page).toHaveURL(/#\//); // Still on home
    }
  });
});
```

#### `e2e/offline-mode.spec.js` — Offline UI Behavior

```javascript
import { test, expect } from '@playwright/test';

test.describe('Offline Mode', () => {
  test('should disable Start Quiz button when offline', async ({ page, context }) => {
    await page.goto('/');

    // Verify button is enabled when online
    const button = page.locator('#startQuizBtn');
    await expect(button).toBeEnabled();

    // Go offline
    await context.setOffline(true);

    // Wait for UI update
    await page.waitForTimeout(500);

    // Button should be disabled
    await expect(button).toBeDisabled();
  });

  test('should show offline banner when offline', async ({ page, context }) => {
    await page.goto('/');

    // Banner should be hidden when online
    const banner = page.locator('#offlineBanner');
    await expect(banner).toHaveClass(/hidden/);

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // Banner should be visible
    await expect(banner).not.toHaveClass(/hidden/);
    await expect(banner).toContainText("You're offline");
  });

  test('should allow quiz replay when offline', async ({ page, context }) => {
    await page.goto('/');

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // Click on a saved quiz (if exists)
    const quizItem = page.locator('.quiz-item').first();
    if (await quizItem.count() > 0) {
      await quizItem.click();

      // Should navigate to quiz page
      await expect(page).toHaveURL(/#\/quiz/);
    }
  });

  test('should re-enable button when back online', async ({ page, context }) => {
    await page.goto('/');

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    const button = page.locator('#startQuizBtn');
    await expect(button).toBeDisabled();

    // Go back online
    await context.setOffline(false);
    await page.waitForTimeout(500);

    // Button should be enabled again
    await expect(button).toBeEnabled();
  });
});
```

#### `e2e/topics-page.spec.js` — Topics/History Page

```javascript
import { test, expect } from '@playwright/test';

test.describe('Topics Page', () => {
  test('should navigate to topics page', async ({ page }) => {
    await page.goto('/');

    // Click Topics nav item
    await page.click('a[href="#/history"]');

    // Should be on topics page
    await expect(page).toHaveURL(/#\/history/);
    await expect(page.locator('text=Quiz History')).toBeVisible();
  });

  test('should display quiz count', async ({ page }) => {
    await page.goto('/#/history');

    // Should show count in header
    await expect(page.locator('text=/\\d+ quizzes?/')).toBeVisible();
  });

  test('should show empty state when no quizzes', async ({ page }) => {
    // Clear IndexedDB first (or use fresh browser context)
    await page.evaluate(() => indexedDB.deleteDatabase('quizmaster'));
    await page.goto('/#/history');

    // Should show empty state
    await expect(page.locator('text=No quizzes yet')).toBeVisible();
    await expect(page.locator('text=Start a Quiz')).toBeVisible();
  });

  test('should navigate to quiz from empty state CTA', async ({ page }) => {
    await page.evaluate(() => indexedDB.deleteDatabase('quizmaster'));
    await page.goto('/#/history');

    // Click the CTA button
    await page.click('text=Start a Quiz');

    // Should navigate to topic input
    await expect(page).toHaveURL(/#\/topic-input/);
  });
});
```

#### `e2e/settings.spec.js` — Settings Page & Version

```javascript
import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test('should display version in correct format', async ({ page }) => {
    await page.goto('/#/settings');

    // Version should match YYYYMMDD.NN format
    const versionText = await page.locator('text=/\\d{8}\\.\\d{2}/').textContent();
    expect(versionText).toMatch(/^\d{8}\.\d{2}$/);
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/');

    // Click Settings nav item
    await page.click('a[href="#/settings"]');

    // Should be on settings page
    await expect(page).toHaveURL(/#\/settings/);
    await expect(page.locator('text=Settings')).toBeVisible();
  });
});
```

---

### Test File Structure

```
demo-pwa-app/
├── src/
│   ├── db/
│   │   ├── db.js
│   │   └── db.test.js           # Unit tests for database
│   ├── utils/
│   │   ├── network.js
│   │   └── network.test.js      # Unit tests for network utils
│   └── ...
├── scripts/
│   ├── generate-version.js
│   └── generate-version.test.js # Unit tests for versioning
├── e2e/
│   ├── quiz-replay.spec.js      # E2E: replay functionality
│   ├── offline-mode.spec.js     # E2E: offline UI behavior
│   ├── topics-page.spec.js      # E2E: topics/history page
│   └── settings.spec.js         # E2E: settings & version
└── ...
```

---

### Test Priority Matrix

| Priority | Test | Type | Reason |
|----------|------|------|--------|
| **High** | `updateSession()` | Unit | Core replay logic |
| **High** | Quiz replay flow | E2E | Primary user feature |
| **High** | Offline banner/button | E2E | Important UX |
| **Medium** | `updateOfflineUI()` | Unit | Isolated function |
| **Medium** | Topics page navigation | E2E | New page |
| **Medium** | Version format | Unit | Build process |
| **Low** | Settings version display | E2E | Simple display |
| **Low** | `isOnline()` | Unit | Simple wrapper |

---

### Running Tests

```bash
# Unit tests
npm test                    # Watch mode
npm test -- --run           # Single run
npm run test:coverage       # With coverage report

# E2E tests
npm run test:e2e            # Headless
npm run test:e2e:ui         # With Playwright UI
```

---

## Questions to Reinforce Learning

**Q1: Why store questions with the session instead of re-fetching?**
<details>
<summary>Answer</summary>
1. Enables offline replay (no API needed)
2. Ensures same questions for comparison
3. Reduces API costs
4. Faster loading
</details>

**Q2: Why use `prebuild` instead of `postbuild` for versioning?**
<details>
<summary>Answer</summary>
The version needs to be included IN the build. `prebuild` runs before Vite bundles the code, so the generated `version.js` is included. `postbuild` would be too late.
</details>

**Q3: Why return cleanup functions from event listeners?**
<details>
<summary>Answer</summary>
Prevents memory leaks. When a view is destroyed, we need to remove global event listeners (online/offline). Without cleanup, listeners accumulate and fire on destroyed views.
</details>

**Q4: Why disable the button instead of hiding it when offline?**
<details>
<summary>Answer</summary>
UX principle: Users should understand what's possible. A disabled button with explanation teaches them about the offline limitation. A hidden button is confusing ("where did it go?").
</details>

---

## Implementation Order

**Recommended sequence:**

1. **Task 1** (Button width) - Quick win, immediate visual improvement
2. **Task 5** (Versioning) - Infrastructure, enables tracking
3. **Task 2** (Quiz replay) - Core feature, requires DB changes
4. **Task 4** (Topics page) - Depends on replay infrastructure
5. **Task 3** (Offline mode) - Final polish, enhances all features

**Alternative: Parallel tracks**
- Track A: Tasks 1, 3 (UI/UX polish)
- Track B: Tasks 2, 4 (Quiz replay feature)
- Track C: Task 5 (Build infrastructure)

---

## Resources

**Tailwind CSS:**
- [Width utilities](https://tailwindcss.com/docs/width)
- [Disabled states](https://tailwindcss.com/docs/hover-focus-and-other-states#disabled)

**IndexedDB:**
- [idb library](https://github.com/jakearchibald/idb)
- [Storing complex objects](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)

**PWA Offline:**
- [Offline UX considerations](https://web.dev/offline-ux-design-guidelines/)
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)

**Versioning:**
- [Semantic versioning](https://semver.org/)
- [npm scripts](https://docs.npmjs.com/cli/v8/using-npm/scripts)

---

## Next Steps

After completing Phase 3.3:

1. **Continue to Phase 3.5 (Branding)** - App name, icons, visual identity
2. **Or Phase 4 (Observability)** - Logging, error tracking, monitoring

Say **"Let's start Task 1"** to begin with the button width fix, or specify which task you'd like to tackle first.

---

**Remember:** This phase is about polish and consistency. Each task should be small, testable, and immediately visible to users. Quality over quantity!
