# Landing Page Improvement Plan

**Status:** Planning
**Priority:** Medium (User Acquisition)
**Estimated Effort:** 2-3 sessions
**Created:** 2025-12-28
**Updated:** 2025-12-30

## Session Log

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-28 | **Plan Created** | Gap analysis and wireframes complete |
| 2025-12-30 | **Moved to Epic 5** | Promoted from parking lot to active epic |

---

## Overview

Increase visitor-to-user conversion by showcasing the full value of Saberloop's features. The current landing page highlights only 4 basic features, missing 9+ powerful capabilities that could convince visitors to try the app.

**Key Goal:** Update landing page to reflect actual product capabilities and increase conversion rate.

---

## What You'll Learn

### New Skills & Concepts

1. **Conversion Optimization** - How to structure landing pages for maximum sign-ups
2. **Feature Prioritization** - Deciding which features to highlight for target audience
3. **Copywriting** - Writing benefit-driven copy that resonates with users
4. **Social Proof** - Using badges, numbers, and testimonials effectively
5. **Visual Hierarchy** - Organizing content for scanning and comprehension
6. **A/B Testing Setup** - Preparing for data-driven improvements
7. **Responsive Design** - Mobile-first approach for landing pages

---

## Prerequisites

Before starting this phase, you should have:

- ✅ **Phase 30** complete (i18n - multi-language support)
- ✅ **Phase 70** complete (Share feature)
- ✅ **Phase 47** complete (Model selection)
- ✅ Understanding of HTML/CSS for landing pages
- ✅ Access to landing page source code
- ✅ Screenshots of all major features
- ✅ Understanding of user journey (visit → try → install)

---

## Current State Analysis

### What the Landing Page Shows (4 features)
1. AI-Generated Questions
2. Works Offline
3. Privacy First
4. Free to Use

### What's Actually Implemented (but hidden)
| Feature | User Value | Priority |
|---------|------------|----------|
| **Multi-language support** (EN, PT, ES, FR, DE) | Global reach, native language learning | HIGH |
| **AI explanations for wrong answers** | Deeper understanding, not just scores | HIGH |
| **Adaptive difficulty (Continue Topic)** | Progressive learning, mastery path | HIGH |
| **Share results to social** | Social proof, engagement | MEDIUM |
| **AI model selection** | Choice, cost control | MEDIUM |
| **Configurable question count** (5/10/15) | Flexibility, time control | MEDIUM |
| **Full quiz history & replay** | Long-term tracking | MEDIUM |
| **Grade level customization** | Age-appropriate content | HIGH |
| **Progress tracking with score badges** | Motivation, gamification | MEDIUM |

---

## Wireframes

### BEFORE: Current Landing Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Saberloop                              [Try Free]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │                             │  │                         │  │
│  │  Learn Anything,            │  │    ┌─────────────┐      │  │
│  │  Practice Anything          │  │    │             │      │  │
│  │                             │  │    │  Screenshot │      │  │
│  │  AI-powered quizzes on any  │  │    │     #1      │      │  │
│  │  topic...                   │  │    │             │      │  │
│  │                             │  │    └─────────────┘      │  │
│  │  [Google Play] [Download]   │  │                         │  │
│  │  Or try in browser          │  │                         │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      Why Saberloop?                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │    🧠    │ │    📱    │ │    🔒    │ │    🆓    │           │
│  │   AI     │ │ Offline  │ │ Privacy  │ │   Free   │           │
│  │Questions │ │          │ │  First   │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│       4 CARDS IN A ROW (current)                                │
├─────────────────────────────────────────────────────────────────┤
│                      How It Works                               │
│       ┌───┐           ┌───┐           ┌───┐                    │
│       │ 1 │           │ 2 │           │ 3 │                    │
│       └───┘           └───┘           └───┘                    │
│      Enter          Get Quiz        Learn &                    │
│      Topic          Questions       Improve                    │
│                                                                 │
│            3 STEPS (current)                                    │
├─────────────────────────────────────────────────────────────────┤
│                     See It In Action                            │
│           ┌─────────────┐  ┌─────────────┐                     │
│           │ Screenshot  │  │ Screenshot  │                     │
│           │     #1      │  │     #2      │                     │
│           └─────────────┘  └─────────────┘                     │
│                                                                 │
│            2 SCREENSHOTS (current)                              │
├─────────────────────────────────────────────────────────────────┤
│  ████████████████ CTA GRADIENT ████████████████                │
│           Ready to Start Learning?                              │
│      [Google Play] [Download APK]                               │
│           Or try in browser                                     │
├─────────────────────────────────────────────────────────────────┤
│  [Footer: GitHub | Report Issue | Privacy]                      │
└─────────────────────────────────────────────────────────────────┘
```

### AFTER: Improved Landing Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Saberloop                              [Try Free]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │                             │  │                         │  │
│  │  Learn Anything,            │  │    ┌─────────────┐      │  │
│  │  Practice Anything          │  │    │             │      │  │
│  │                             │  │    │  Screenshot │      │  │
│  │  AI-powered quizzes on any  │  │    │ (Quiz view) │      │  │
│  │  topic, in 5 languages,     │  │    │             │      │  │
│  │  with explanations...       │  │    └─────────────┘      │  │
│  │        ▲ ENHANCED SUBTITLE  │  │                         │  │
│  │  [Google Play] [Download]   │  │                         │  │
│  │  Or try in browser          │  │                         │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      Why Saberloop?                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │    🧠    │ │    🌍    │ │    📈    │                        │
│  │    AI    │ │  Multi-  │ │ Adaptive │                        │
│  │ Learning │ │ Language │ │Difficulty│                        │
│  │  + expl  │ │ 🇺🇸🇧🇷🇪🇸🇫🇷🇩🇪│ │          │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │    🎓    │ │    📱    │ │    🔒    │                        │
│  │   All    │ │  Works   │ │ Privacy  │                        │
│  │  Levels  │ │ Offline  │ │  First   │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
│       6 CARDS IN 2 ROWS (new layout)                           │
├─────────────────────────────────────────────────────────────────┤
│                      How It Works                               │
│    ┌───┐        ┌───┐        ┌───┐        ┌───┐                │
│    │ 1 │        │ 2 │        │ 3 │        │ 4 │                │
│    └───┘        └───┘        └───┘        └───┘                │
│   Enter       Customize     Take the     Learn From            │
│   Topic        Quiz          Quiz        Mistakes               │
│              (level,       (AI gen)    (explanations           │
│             language)                  + continue)              │
│                                                                 │
│            4 STEPS (new - adds customization + explanation)    │
├─────────────────────────────────────────────────────────────────┤
│                     See It In Action                            │
│   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                  │
│   │ Quiz   │ │Explain │ │Results │ │Settings│                  │
│   │  in    │ │ Modal  │ │  with  │ │ (lang, │                  │
│   │ action │ │        │ │Continue│ │ level) │                  │
│   └────────┘ └────────┘ └────────┘ └────────┘                  │
│                                                                 │
│            4 SCREENSHOTS (expanded)                             │
├─────────────────────────────────────────────────────────────────┤
│                   Share Your Progress            ◀── NEW       │
│           ┌───────────────────────────┐                        │
│           │   📤 Share Card Preview   │                        │
│           │   ┌───────────────────┐   │                        │
│           │   │ I scored 80% on   │   │                        │
│           │   │ "World History"   │   │                        │
│           │   │ quiz on Saberloop │   │                        │
│           │   └───────────────────┘   │                        │
│           │  Challenge friends!       │                        │
│           └───────────────────────────┘                        │
├─────────────────────────────────────────────────────────────────┤
│  ████████████████ CTA GRADIENT ████████████████                │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │     Try Free        │  │  Unlimited Learning │              │
│  │  ─────────────────  │  │  ─────────────────  │              │
│  │  • Sample quizzes   │  │  • Your OpenRouter  │              │
│  │  • No account       │  │  • Choose AI model  │              │
│  │  • Web app link     │  │  • Unlimited quizzes│              │
│  │                     │  │                     │              │
│  │  [Try in Browser]   │  │  [Get on Play Store]│              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                 │
│            TWO-COLUMN CTA (new layout)                         │
├─────────────────────────────────────────────────────────────────┤
│  [Footer: GitHub | Report Issue | Privacy]                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Improvement Plan

### Phase 1: Feature Cards Expansion (High Impact)

**Current:** 4 feature cards
**Proposed:** 6 feature cards (replace/reorganize)

Replace current cards with these 6:

1. **🧠 AI-Powered Learning** (keep, enhance)
   - "Unique questions on any topic, with detailed explanations when you get it wrong"

2. **🌍 Learn in Your Language** (NEW)
   - "Quizzes in English, Portuguese, Spanish, French, or German"

3. **📈 Adaptive Difficulty** (NEW)
   - "Continue on any topic with increasing difficulty. Master subjects step by step"

4. **🎓 All Skill Levels** (NEW)
   - "From elementary to college level — questions adapted to your knowledge"

5. **📱 Works Offline** (keep)
   - "Review past quizzes and replay topics even without internet"

6. **🔒 Privacy First** (keep)
   - "All data stays on your device. No accounts, no tracking"

**Remove:** "Free to Use" card (becomes part of CTA section messaging instead)

---

### Phase 2: How It Works Enhancement

**Current:** 3 steps
**Proposed:** 4 steps (add explanation step)

1. **Enter Any Topic** (keep)
   - "Type any subject — history, science, coding, languages, anything!"

2. **Customize Your Quiz** (NEW)
   - "Choose your level, language, and number of questions"

3. **Take the Quiz** (rename from "Get Quiz Questions")
   - "AI generates unique multiple-choice questions instantly"

4. **Learn From Mistakes** (enhance from "Learn & Improve")
   - "Get AI explanations for wrong answers. Continue to master the topic"

---

### Phase 3: New Screenshots

**Current:** 2 screenshots (Welcome, Home)
**Proposed:** 4 screenshots showing key differentiators

1. **Quiz in action** — showing question with progress bar
2. **Explanation modal** — showing AI explanation for wrong answer
3. **Results with Continue button** — showing score + "Continue Topic" option
4. **Settings screen** — showing language/level/model customization

**Action:** Create new screenshots using automated Playwright script (see below)

---

### Phase 4: Social Proof & Engagement Section (NEW)

Add section between Screenshots and CTA:

**"Share Your Progress"**
- Show share card preview (what gets shared to Twitter/Facebook)
- "Challenge friends and track your learning journey"
- Visual: mockup of share card with score

---

### Phase 5: CTA Section Enhancement

**Current:** "Ready to Start Learning?"
**Proposed:** Two-column approach

**Left column: "Try Free"**
- Sample quizzes available immediately
- No account needed
- Web app link prominent

**Right column: "Unlimited Learning"**
- Connect your OpenRouter account
- Choose your AI model
- Generate unlimited quizzes

---

### Phase 6: Quick Wins (CSS/Copy)

1. **Hero subtitle enhancement:**
   - Current: "AI-powered quizzes on any topic you want to master. Free, works offline, and your data stays private."
   - New: "AI-powered quizzes on any topic, in 5 languages, with explanations that help you truly understand. Free to try, works offline."

2. **Add language flags/badges** near "multi-language" feature for visual appeal

3. **Add testimonial/stat placeholder** for future social proof
   - "X quizzes generated" (if we track this)
   - Or prepare section structure for future testimonials

---

## Asset Location

All promotional assets are stored in `docs/product-info/`:

```
docs/product-info/
├── logos/           # App icons, maskable icons (48px to 512px)
├── mockups/         # UI design mockups (Stitch-generated, phase concepts)
├── screenshots/     # Feature screenshots for marketing
│   ├── phase27_*.png      # Explanation modal screenshots
│   ├── phase28_*.png      # Results page screenshots
│   └── landing-*.png      # NEW: Landing page promotional shots
└── quiz-generator-exploration.md
```

This structure was established in **Phase 3.5: Branding & Identity** (see `docs/learning/epic03_quizmaster_v2/PHASE3.5_BRANDING.md`).

---

## Automated Screenshot Capture

### Playwright Script for Landing Page Screenshots

Create a new file: `tests/e2e/capture-screenshots.spec.js`

```javascript
import { test } from '@playwright/test';

/**
 * Automated screenshot capture for landing page assets.
 *
 * Run with: npx playwright test tests/e2e/capture-screenshots.spec.js
 *
 * Screenshots will be saved to: public/icons/
 */

// Mobile viewport for app screenshots (matches current landing page images)
const MOBILE_VIEWPORT = { width: 375, height: 667 };
const SCREENSHOT_DIR = 'docs/product-info/screenshots';

// Helper to set up authenticated state (copied from app.spec.js)
async function setupAuthenticatedState(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.evaluate(async () => {
    const dbName = 'quizmaster';
    const dbVersion = 1;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          sessionStore.createIndex('byTopicId', 'topicId');
          sessionStore.createIndex('byTimestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('topics')) {
          const topicStore = db.createObjectStore('topics', { keyPath: 'id' });
          topicStore.createIndex('byName', 'name');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');

        store.put({
          key: 'openrouter_api_key',
          value: { key: 'sk-or-v1-test-key-for-screenshots', storedAt: new Date().toISOString() }
        });
        store.put({ key: 'welcomeScreenVersion', value: '999.0.0' });

        transaction.oncomplete = () => { db.close(); resolve(); };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  });

  await page.goto('/#/');
  await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 15000 });
}

test.describe('Capture Landing Page Screenshots', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test('1. Quiz in action - Question with progress bar', async ({ page }) => {
    await setupAuthenticatedState(page);

    // Navigate to quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'World History');
    await page.selectOption('#gradeLevelSelect', 'high school');
    await page.click('#generateBtn');

    // Wait for quiz to load
    await page.waitForURL(/#\/quiz/, { timeout: 15000 });
    await page.waitForTimeout(500); // Let animations settle

    // Capture screenshot
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-quiz-action.png`,
      fullPage: false
    });

    console.log('✓ Captured: Quiz in action');
  });

  test('2. Explanation modal - AI explanation for wrong answer', async ({ page }) => {
    await setupAuthenticatedState(page);

    // Complete a quiz with one wrong answer
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Science');
    await page.click('#generateBtn');
    await page.waitForURL(/#\/quiz/, { timeout: 15000 });

    // Answer first question wrong (option 0), rest correct (option 1)
    await page.locator('.option-btn').nth(0).click();
    await page.click('#submitBtn');

    for (let i = 1; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Wait for results page
    await page.waitForURL(/#\/results/);
    await page.waitForTimeout(500);

    // Click the explain button to open modal
    await page.locator('.explain-btn').click();
    await page.waitForSelector('#explanationModal', { state: 'visible' });
    await page.waitForTimeout(800); // Wait for animation + explanation to load

    // Capture screenshot with modal open
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-explanation-modal.png`,
      fullPage: false
    });

    console.log('✓ Captured: Explanation modal');
  });

  test('3. Results with Continue button', async ({ page }) => {
    await setupAuthenticatedState(page);

    // Complete a quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Geography');
    await page.selectOption('#gradeLevelSelect', 'middle school');
    await page.click('#generateBtn');
    await page.waitForURL(/#\/quiz/, { timeout: 15000 });

    // Answer all questions correctly
    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Wait for results page
    await page.waitForURL(/#\/results/);
    await page.waitForTimeout(500);

    // Scroll to show Continue button prominently
    await page.locator('#continueTopicBtn').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Capture screenshot
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-results-continue.png`,
      fullPage: false
    });

    console.log('✓ Captured: Results with Continue button');
  });

  test('4. Settings screen - Language/Level/Model customization', async ({ page }) => {
    // Mock models API for consistent screenshot
    await page.route('**/api/v1/models', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B', context_length: 8192, pricing: { prompt: '0', completion: '0' } },
            { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'DeepSeek R1T2', context_length: 65536, pricing: { prompt: '0', completion: '0' } }
          ]
        })
      });
    });

    await setupAuthenticatedState(page);
    await page.goto('/#/settings');

    // Wait for settings to load
    await page.waitForSelector('[data-testid="settings-title"]');
    await page.waitForTimeout(500);

    // Capture screenshot
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-settings.png`,
      fullPage: false
    });

    console.log('✓ Captured: Settings screen');
  });

  test('5. Home screen with quiz history', async ({ page }) => {
    await setupAuthenticatedState(page);

    // Create a quiz first so there's history
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Mathematics');
    await page.click('#generateBtn');
    await page.waitForURL(/#\/quiz/, { timeout: 15000 });

    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Go back to home
    await page.goto('/#/');
    await page.waitForSelector('[data-testid="welcome-heading"]');
    await page.waitForTimeout(500);

    // Capture screenshot
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-home-history.png`,
      fullPage: false
    });

    console.log('✓ Captured: Home with quiz history');
  });

});
```

### How to Run Screenshot Capture

```bash
# Run the screenshot capture script
npx playwright test tests/e2e/capture-screenshots.spec.js

# Or run with headed browser to see what's happening
npx playwright test tests/e2e/capture-screenshots.spec.js --headed

# Screenshots will be saved to docs/product-info/screenshots/
# - landing-quiz-action.png
# - landing-explanation-modal.png
# - landing-results-continue.png
# - landing-settings.png
# - landing-home-history.png
```

### Post-Processing (Optional)

After capturing, you may want to:

1. **Add device frame** - Use a tool like `mockuphone.com` or ImageMagick to add phone bezels
2. **Optimize file size** - Use `optipng` or `pngquant` to reduce file size
3. **Consistent dimensions** - Ensure all images are the same size (375x667 or scaled)

```bash
# Example: Optimize all new screenshots
for f in docs/product-info/screenshots/landing-*.png; do
  pngquant --quality=80-90 --ext .png --force "$f"
done
```

---

## Animated Demo Video (Playwright)

Video recording is already enabled in `playwright.config.js:12`:

```javascript
video: 'on', // Record video for all tests (for documentation)
```

### Demo Video Script

Add to `tests/e2e/capture-screenshots.spec.js`:

```javascript
test('6. Demo video - Complete user journey', async ({ page }) => {
  await setupAuthenticatedState(page);

  // Start from home - pause to show the UI
  await page.waitForTimeout(1000);

  // Navigate to topic input
  await page.goto('/#/topic-input');
  await page.waitForTimeout(500);

  // Type topic slowly (character by character for visual effect)
  const topic = 'World History';
  for (const char of topic) {
    await page.type('#topicInput', char, { delay: 100 });
  }
  await page.waitForTimeout(500);

  // Select grade level
  await page.selectOption('#gradeLevelSelect', 'high school');
  await page.waitForTimeout(500);

  // Generate quiz
  await page.click('#generateBtn');

  // Show loading state briefly
  await page.waitForURL(/#\/loading/);
  await page.waitForTimeout(1500);

  // Wait for quiz
  await page.waitForURL(/#\/quiz/, { timeout: 15000 });
  await page.waitForTimeout(800);

  // Answer questions with deliberate pauses
  // Get one wrong to show explanation feature
  await page.locator('.option-btn').nth(0).click(); // Wrong answer
  await page.waitForTimeout(400);
  await page.click('#submitBtn');
  await page.waitForTimeout(600);

  // Answer rest correctly
  for (let i = 1; i < 5; i++) {
    await page.locator('.option-btn').nth(1).click();
    await page.waitForTimeout(300);
    await page.click('#submitBtn');
    await page.waitForTimeout(500);
  }

  // Show results
  await page.waitForURL(/#\/results/);
  await page.waitForTimeout(1000);

  // Click explain button to show modal
  await page.locator('.explain-btn').click();
  await page.waitForSelector('#explanationModal', { state: 'visible' });
  await page.waitForTimeout(2000); // Let user read explanation

  // Close modal
  await page.click('#gotItBtn');
  await page.waitForTimeout(800);

  // Show Continue button
  await page.locator('#continueTopicBtn').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  console.log('✓ Captured: Demo video (~30s journey)');
});
```

### How to Generate Demo Video

```bash
# Run just the demo video test
npx playwright test tests/e2e/capture-screenshots.spec.js -g "Demo video"

# Video saved to: test-results/capture-screenshots-6-Demo-video/video.webm

# Convert to MP4 for web (requires ffmpeg)
ffmpeg -i test-results/*/video.webm -c:v libx264 -crf 23 docs/product-info/demo-video.mp4

# Or convert to GIF for landing page (smaller, auto-plays)
ffmpeg -i test-results/*/video.webm -vf "fps=10,scale=320:-1" -loop 0 docs/product-info/demo.gif
```

### Embedding on Landing Page

**Option A: Video element (MP4)**
```html
<video autoplay muted loop playsinline>
  <source src="/app/demo-video.mp4" type="video/mp4">
</video>
```

**Option B: GIF (simpler, auto-plays everywhere)**
```html
<img src="/app/demo.gif" alt="Saberloop app demo" loading="lazy">
```

**Option C: Poster + Play button (saves bandwidth)**
```html
<video poster="/app/demo-poster.png" controls>
  <source src="/app/demo-video.mp4" type="video/mp4">
</video>
```

---

## Implementation Checklist

### Content Changes
- [ ] Update feature cards (4 → 6)
- [ ] Update "How It Works" steps (3 → 4)
- [ ] Revise hero subtitle
- [ ] Add "Share Your Progress" section
- [ ] Enhance CTA section with two-column layout

### Visual Assets Needed
- [ ] Run Playwright screenshot script
- [ ] Screenshot: Quiz question with progress bar
- [ ] Screenshot: Explanation modal (bottom sheet)
- [ ] Screenshot: Results page with Continue button visible
- [ ] Screenshot: Settings page showing customization options
- [ ] Optional: Share card mockup image
- [ ] Demo video: Complete user journey (~30s)
- [ ] Convert video to MP4/GIF for landing page

### Technical Changes
- [ ] Add CSS for 6-column feature grid (or 3x2 layout)
- [ ] Add CSS for two-column CTA section
- [ ] Add new section HTML structure
- [ ] Update tracking data-attributes for new CTAs

---

## Success Metrics

Track in Google Analytics (already set up):
- **Click-through rate** on "Try in browser" vs Play Store vs APK
- **Scroll depth** (existing) — expect higher with more content
- **Time on page** — should increase with more compelling content
- **Bounce rate** — should decrease

---

## Out of Scope (Future Considerations)

1. **Interactive demo** — embedded mini-quiz on landing page
2. **A/B testing** — test different value propositions
3. **Localized landing pages** — landing page in PT, ES, FR, DE
4. **PWA install prompt on landing page** — for web visitors
