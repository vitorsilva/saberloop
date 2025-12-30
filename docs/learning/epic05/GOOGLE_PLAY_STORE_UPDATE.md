# Google Play Store Listing Update

**Goal:** Update Play Store listing to reflect new features added since initial publication.

**Status:** Planning
**Created:** 2025-12-29
**Related:** [LANDING_PAGE_IMPROVEMENTS.md](./LANDING_PAGE_IMPROVEMENTS.md)

---

## Background

The initial Play Store listing was created during Phase 9 (December 2025) with features available at that time. Since then, several significant features have been added that should be reflected in the store listing to improve discoverability and conversion.

---

## Gap Analysis

### Features in Current Play Store Listing
- AI-powered question generation
- Multiple difficulty levels
- Instant explanations for wrong answers
- Progress tracking and history
- Works offline
- No ads or tracking

### Features Added Since Publication (NOT in listing)

| Feature | Phase | User Value | Priority |
|---------|-------|------------|----------|
| **Multi-language support** (EN, PT, ES, FR, DE) | Phase 30 | Global reach, native language learning | HIGH |
| **Continue on topic** (adaptive difficulty) | Phase 28 | Progressive mastery, deeper learning | HIGH |
| **Share results to social** | Phase 70 | Social proof, engagement, virality | MEDIUM |
| **AI model selection** | Phase 47 | Choice, flexibility | LOW |
| **Configurable question count** (5/10/15) | Phase 46 | Flexibility | LOW |

---

## Update Plan

### 1. Short Description Update

**Current (80 chars):**
```
Learn any topic with AI-powered quizzes. Free, offline-capable, privacy-first.
```

**Proposed Options:**

**Option A - Language Focus (79 chars):**
```
Learn any topic in 5 languages with AI quizzes. Free, offline, privacy-first.
```

**Option B - Learning Focus (80 chars):**
```
AI quizzes on any topic with explanations. 5 languages, works offline, free.
```

**Option C - Feature Rich (78 chars):**
```
AI quizzes in 5 languages. Explanations, progress tracking, works offline.
```

---

### 2. Full Description Update

**Proposed Full Description (within 4000 char limit):**

```
Saberloop - Master Any Topic with AI-Powered Quizzes

🌍 LEARN IN YOUR LANGUAGE
Generate quizzes in English, Portuguese, Spanish, French, or German. Questions and interface adapt to your preferred language.

📚 LEARN ANY TOPIC
From history and science to coding and languages — just type what you want to learn and get instant AI-generated questions tailored to your level.

📈 ADAPTIVE LEARNING
Don't just take one quiz — continue on the same topic with increasing difficulty. Build true mastery through progressive challenges that avoid repeating questions.

💡 LEARN FROM MISTAKES
Get detailed AI explanations for every wrong answer. Understand WHY the correct answer is right, not just what it is.

📤 SHARE YOUR PROGRESS
Challenge friends by sharing your quiz results to Twitter, Facebook, or any app. Show off your knowledge and inspire others to learn.

🎓 ALL SKILL LEVELS
From elementary school to college level — questions adapt to your knowledge. Choose your difficulty and grow at your own pace.

📱 WORKS OFFLINE
Review past quizzes and replay topics even without internet. Your learning never stops.

🔒 PRIVACY FIRST
All data stays on your device. No accounts required, no tracking, no ads. Your learning journey is yours alone.

✨ KEY FEATURES
• AI-powered question generation (multiple AI models available)
• 5 languages: English, Portuguese, Spanish, French, German
• Adaptive difficulty with "Continue on Topic" feature
• Detailed explanations for wrong answers
• Share results to social media
• Customizable quiz length (5, 10, or 15 questions)
• Progress tracking and full quiz history
• Works completely offline
• No ads, no tracking, no accounts

🎯 PERFECT FOR
• Students preparing for exams
• Language learners practicing vocabulary
• Parents helping kids learn
• Lifelong learners exploring new topics
• Anyone wanting to test and expand their knowledge

Built with privacy in mind. Powered by AI. Free forever.

Download now and start your learning journey!
```

**Character count:** ~1,850 characters (well within 4,000 limit)

---

### 3. Screenshots Update

**Current:** 5 phone screenshots (from initial launch)

**Proposed:** Replace or add screenshots showing new features

#### Required Screenshots (Priority Order)

| # | Screen | What to Show | Why |
|---|--------|--------------|-----|
| 1 | Quiz in Action | Question with progress bar | Core experience |
| 2 | Explanation Modal | AI explanation for wrong answer | Key differentiator |
| 3 | Results + Continue | Score with "Continue on Topic" button | Adaptive learning |
| 4 | Settings | Language selector, model choice | Customization |
| 5 | Home with History | Quiz history with scores | Progress tracking |
| 6 | Share Modal | Share to social options | Social feature |
| 7 | Topic Input | Language/level selection | Customization |
| 8 | Multi-language | Quiz in Portuguese or Spanish | Language support |

**Note:** Play Store allows up to 8 screenshots. We should use all 8 slots.

---

### 4. Automated Screenshot Capture (Playwright)

Screenshots must be **1080x1920 pixels** (or 2:3.5 aspect ratio) for Play Store.

#### Playwright Script

Create file: `tests/e2e/capture-playstore-screenshots.spec.js`

```javascript
import { test } from '@playwright/test';

/**
 * Automated screenshot capture for Google Play Store.
 *
 * Run with: npx playwright test tests/e2e/capture-playstore-screenshots.spec.js
 *
 * Screenshots saved to: docs/product-info/screenshots/playstore/
 */

// Play Store requires 1080x1920 (9:16 ratio) or similar
// Using 360x640 viewport and scaling up, or direct 1080x1920
const PLAYSTORE_VIEWPORT = { width: 360, height: 640 };
const SCREENSHOT_DIR = 'docs/product-info/screenshots/playstore';

// Helper to set up authenticated state
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

test.describe('Capture Play Store Screenshots', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(PLAYSTORE_VIEWPORT);
  });

  test('01. Quiz in action - Question with answers', async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'World History');
    await page.selectOption('#gradeLevelSelect', 'high school');
    await page.click('#generateBtn');

    await page.waitForURL(/#\/quiz/, { timeout: 15000 });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/01-quiz-question.png`,
      fullPage: false
    });
    console.log('✓ 01: Quiz question');
  });

  test('02. Explanation modal - AI explanation', async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Science');
    await page.click('#generateBtn');
    await page.waitForURL(/#\/quiz/, { timeout: 15000 });

    // Answer first wrong, rest correct
    await page.locator('.option-btn').nth(0).click();
    await page.click('#submitBtn');
    for (let i = 1; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    await page.waitForURL(/#\/results/);
    await page.locator('.explain-btn').click();
    await page.waitForSelector('#explanationModal', { state: 'visible' });
    await page.waitForTimeout(800);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/02-explanation-modal.png`,
      fullPage: false
    });
    console.log('✓ 02: Explanation modal');
  });

  test('03. Results with Continue button', async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Geography');
    await page.selectOption('#gradeLevelSelect', 'middle school');
    await page.click('#generateBtn');
    await page.waitForURL(/#\/quiz/, { timeout: 15000 });

    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    await page.waitForURL(/#\/results/);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/03-results-continue.png`,
      fullPage: false
    });
    console.log('✓ 03: Results with Continue');
  });

  test('04. Settings - Language and model selection', async ({ page }) => {
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
    await page.waitForSelector('[data-testid="settings-title"]');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/04-settings.png`,
      fullPage: false
    });
    console.log('✓ 04: Settings');
  });

  test('05. Home with quiz history', async ({ page }) => {
    await setupAuthenticatedState(page);

    // Create a quiz for history
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

    await page.goto('/#/');
    await page.waitForSelector('[data-testid="welcome-heading"]');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/05-home-history.png`,
      fullPage: false
    });
    console.log('✓ 05: Home with history');
  });

  test('06. Share modal', async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Art History');
    await page.click('#generateBtn');
    await page.waitForURL(/#\/quiz/, { timeout: 15000 });

    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    await page.waitForURL(/#\/results/);

    // Click share button (if exists)
    const shareBtn = page.locator('#shareBtn');
    if (await shareBtn.isVisible()) {
      await shareBtn.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/06-share-modal.png`,
      fullPage: false
    });
    console.log('✓ 06: Share modal');
  });

  test('07. Topic input with options', async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto('/#/topic-input');
    await page.waitForTimeout(500);

    // Show the customization options
    await page.fill('#topicInput', 'Learn Spanish');

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/07-topic-input.png`,
      fullPage: false
    });
    console.log('✓ 07: Topic input');
  });

  test('08. Quiz in Portuguese (multi-language)', async ({ page }) => {
    await setupAuthenticatedState(page);

    // Set language to Portuguese
    await page.goto('/#/settings');
    await page.waitForSelector('[data-testid="settings-title"]');

    const langSelect = page.locator('#uiLanguage');
    if (await langSelect.isVisible()) {
      await langSelect.selectOption('pt-PT');
      await page.waitForTimeout(300);
    }

    // Generate quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'História de Portugal');
    await page.click('#generateBtn');
    await page.waitForURL(/#\/quiz/, { timeout: 15000 });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/08-portuguese-quiz.png`,
      fullPage: false
    });
    console.log('✓ 08: Portuguese quiz');
  });

});
```

#### Run Commands

```bash
# Create output directory
mkdir -p docs/product-info/screenshots/playstore

# Run Play Store screenshot capture
npx playwright test tests/e2e/capture-playstore-screenshots.spec.js

# Or run headed to see what's happening
npx playwright test tests/e2e/capture-playstore-screenshots.spec.js --headed
```

#### Post-Processing

Play Store requires specific dimensions. Scale up if needed:

```bash
# Scale screenshots to 1080x1920 (if captured at 360x640)
# Using ImageMagick
for f in docs/product-info/screenshots/playstore/*.png; do
  convert "$f" -resize 1080x1920! "$f"
done

# Or use a 3x scale for sharper images
for f in docs/product-info/screenshots/playstore/*.png; do
  convert "$f" -resize 300% "$f"
done
```

---

### 5. Feature Graphic Update (Optional)

**Current:** 1024x500 pixels feature graphic from initial launch

**Proposed Updates:**
- Add "5 Languages" badge/flag icons
- Add "AI Explanations" callout
- Refresh visual style if needed

**Tools:**
- Canva (free templates)
- Figma (design from scratch)
- Keep existing if still represents app well

---

### 6. Promotional Video Update (Optional)

**Current:** YouTube video from initial launch

**If updating:**
- Use Playwright video recording (already enabled with `video: 'on'`)
- Capture demo showing new features (explanation modal, language selection)
- Edit with captions highlighting features
- Upload to YouTube, link in Play Console

---

## Implementation Checklist

### Text Updates (No Review Required)
- [ ] Update short description (80 chars)
- [ ] Update full description with new features
- [ ] Add language keywords for discoverability

### Screenshot Updates
- [ ] Create `docs/product-info/screenshots/playstore/` directory
- [ ] Run Playwright screenshot script
- [ ] Scale to 1080x1920 if needed
- [ ] Upload 8 screenshots to Play Console
- [ ] Order screenshots strategically (best first)

### Optional Updates
- [ ] Update feature graphic with language badges
- [ ] Create new promotional video
- [ ] Add localized store listings (PT, ES, FR, DE)

---

## Play Console Update Process

1. **Login:** https://play.google.com/console
2. **Select App:** Saberloop
3. **Navigate:** Grow > Store presence > Main store listing
4. **Update:**
   - Short description
   - Full description
   - Screenshots (delete old, upload new)
   - Feature graphic (if updating)
5. **Save** changes
6. **Submit** for review (if required)

**Note:** Text/screenshot updates usually don't require full app review. Changes go live within hours.

---

## Localized Listings (Future Enhancement)

Since Saberloop now supports 5 languages, consider adding localized store listings:

| Language | Priority | Store Listing Title |
|----------|----------|---------------------|
| Portuguese (PT) | HIGH | Saberloop - Aprenda com Quizzes IA |
| Spanish (ES) | HIGH | Saberloop - Aprende con Quizzes IA |
| French (FR) | MEDIUM | Saberloop - Apprenez avec des Quiz IA |
| German (DE) | MEDIUM | Saberloop - Lernen mit KI-Quizzen |

This requires translating:
- Short description
- Full description
- Screenshots with localized UI (run Playwright with different language settings)

---

## Success Metrics

After updating, monitor in Play Console:
- **Store listing visitors** - Should increase with better discoverability
- **Install conversion rate** - Better screenshots/description = higher conversion
- **Keyword rankings** - New keywords like "multilingual quiz", "AI explanations"
- **Geographic installs** - More installs from PT, ES, FR, DE regions

---

## Timeline Recommendation

1. **Phase 1 (Quick Win):** Update descriptions only - 30 minutes
2. **Phase 2 (Medium Effort):** Add new screenshots - 1-2 hours
3. **Phase 3 (Optional):** Localized listings - 2-3 hours per language
