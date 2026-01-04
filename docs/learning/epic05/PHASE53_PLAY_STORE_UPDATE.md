# Google Play Store Listing Update

**Status:** ✅ Complete (automation ready, manual upload pending)
**Priority:** Medium (User Acquisition)
**Estimated Effort:** 1 session (reduced due to reusable assets from Phase 52)
**Created:** 2025-12-29
**Updated:** 2026-01-04
**Completed:** 2026-01-04

## Session Log

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-29 | **Plan Created** | Gap analysis and copy drafts complete |
| 2025-12-30 | **Moved to Epic 5** | Promoted from parking lot to active epic |
| 2026-01-04 | **Plan Updated** | Identified reusable assets from Phase 52, simplified implementation |

---

## Overview

Update Play Store listing to reflect new features added since initial publication. This improves discoverability through better keywords and increases conversion by showcasing actual product capabilities.

**Key Goal:** Align store listing with current product state to improve rankings and conversion.

---

## What You'll Learn

### New Skills & Concepts

1. **App Store Optimization (ASO)** - Keywords, descriptions, and metadata for discovery
2. **Play Store Guidelines** - Character limits, formatting rules, policy compliance
3. **Screenshot Best Practices** - Showcasing features visually for store listings
4. **Copywriting for Mobile** - Writing compelling descriptions for app stores
5. **Keyword Research** - Finding search terms users actually use
6. **Localization** - Adapting store listings for different languages/markets
7. **Play Console** - Using Google's developer tools for updates

---

## Prerequisites

Before starting this phase, you should have:

- ✅ **Phase 9** complete (Initial Play Store publication)
- ✅ **Phase 30** complete (i18n - multi-language support)
- ✅ **Phase 70** complete (Share feature)
- ✅ **Phase 47** complete (Model selection)
- ✅ **Phase 52** complete (Landing page improvements - provides reusable assets)
- ✅ Access to Google Play Console
- ✅ Understanding of Play Store policies

---

## Reusable Assets from Phase 52

Phase 52 (Landing Page Improvements) created several assets we can leverage:

### Playwright Screenshot Capture Script
**File:** `tests/e2e/capture-landing-assets.spec.js`

Already captures these scenarios:
| Scenario | Status | Reusable for Play Store? |
|----------|--------|--------------------------|
| Explanation modal with actual text | ✅ Working | Yes - key differentiator |
| Results page with usage cost card | ✅ Working | Yes - shows transparency |
| Results page with share button | ✅ Working | Yes - social feature |
| Demo video (~30s journey) | ✅ Working | Maybe - for promo video |

### Screenshot Processing Script
**File:** `scripts/process-screenshots.cjs`

- Handles resize, frame overlay, optimization
- Already configured for both Maestro and Playwright patterns
- **Needs adaptation:** Play Store requires 1080x1920 px (vs 280x560 for landing)

### Existing Processed Screenshots
**Location:** `docs/product-info/screenshots/landing/`
- `landing-02-quiz-started.png` - Quiz in action
- `landing-03-results-page.png` - Results with Continue button
- `landing-06-settings-page.png` - Settings (language, model)
- `landing-08-usage-cost-card.png` - Usage cost card
- `landing-explanation-modal.png` - AI explanation
- `landing-share-results.png` - Share feature

### Raw Maestro Screenshots (34 files)
**Location:** `.maestro/tests/screenshots/`
- Higher resolution source images
- Full device frames included

---

## Key Differences: Landing Page vs Play Store

| Aspect | Landing Page (Phase 52) | Play Store (Phase 53) |
|--------|------------------------|----------------------|
| **Dimensions** | 280x560 px | 1080x1920 px |
| **Device frame** | Yes (dark overlay) | No (clean app content) |
| **Capture viewport** | 375x667 | 360x640 (9:16 ratio) |
| **Image count** | 5 | Up to 8 |
| **Quality** | Optimized for web | High-res for store |

---

## Implementation Strategy

### What We Reuse (saves ~50% effort)
1. **Playwright test scenarios** - Extend `capture-landing-assets.spec.js`
2. **Processing script** - Add Play Store config to `process-screenshots.cjs`
3. **Test flow logic** - Quiz generation, answering, modal interactions

### What We Add (new work)
1. **Play Store capture test** - New test file or extend existing
2. **Multi-language screenshot** - Portuguese or Spanish quiz (not in Phase 52)
3. **Topic input page** - Not captured in Phase 52
4. **Home with history** - Not captured in Phase 52
5. **Upscaling to 1080x1920** - New processing config

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

| # | Screen | What to Show | Source | Status |
|---|--------|--------------|--------|--------|
| 1 | Quiz in Action | Question with progress bar | Phase 52 | ✅ Reuse `capture-landing-assets.spec.js` logic |
| 2 | Explanation Modal | AI explanation for wrong answer | Phase 52 | ✅ Reuse test #1 |
| 3 | Results + Continue | Score with "Continue on Topic" button | Phase 52 | ✅ Reuse test #3 |
| 4 | Settings | Language selector, model choice | Phase 52 | ✅ Reuse (Maestro) |
| 5 | Home with History | Quiz history with scores | **NEW** | ⚠️ Add new test |
| 6 | Share Results | Share button visible on results | Phase 52 | ✅ Reuse test #3 |
| 7 | Topic Input | Language/level selection | **NEW** | ⚠️ Add new test |
| 8 | Multi-language | Quiz in Portuguese or Spanish | **NEW** | ⚠️ Add new test |

**Summary:** 5 reusable from Phase 52, 3 new tests needed

**Note:** Play Store allows up to 8 screenshots. We should use all 8 slots.

---

### 4. Automated Screenshot Capture (Playwright)

Screenshots must be **1080x1920 pixels** (or 9:16 aspect ratio) for Play Store.

#### Strategy: Extend Existing Script

Rather than creating a new script from scratch, we'll **extend** the existing `tests/e2e/capture-landing-assets.spec.js` to add Play Store-specific tests.

**Existing file:** `tests/e2e/capture-landing-assets.spec.js`
- Already has helper functions (`setupAuthenticatedState`, `clearSessions`)
- Already captures 4 scenarios we can reuse
- Uses 375x667 viewport (close to 360x640 for Play Store)

#### New Tests to Add (3 scenarios)

Add these tests to a new file: `tests/e2e/capture-playstore-screenshots.spec.js`

```javascript
import { test, expect } from '@playwright/test';
import { setupAuthenticatedState, clearSessions } from './helpers.js';

/**
 * Capture screenshots for Google Play Store.
 *
 * Run with: npx playwright test tests/e2e/capture-playstore-screenshots.spec.js --headed
 *
 * These complement the existing capture-landing-assets.spec.js tests.
 * Play Store requires 1080x1920 pixels (9:16 ratio).
 * We capture at 360x640 and upscale during post-processing.
 */

const PLAYSTORE_VIEWPORT = { width: 360, height: 640 };
const SCREENSHOT_DIR = 'docs/product-info/screenshots/playstore';

test.use({ viewport: PLAYSTORE_VIEWPORT });

test.describe('Capture Play Store Screenshots - New Scenarios', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(PLAYSTORE_VIEWPORT);
  });

  test('05. Home with quiz history', async ({ page }) => {
    await setupAuthenticatedState(page);
    await clearSessions(page);
    await page.reload();

    // Create a quiz to populate history
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Mathematics');
    await page.click('#generateBtn');
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });

    // Answer all questions
    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Go back to home to show history
    await page.goto('/#/');
    await page.waitForSelector('[data-testid="welcome-heading"]');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/05-home-history.png`,
      fullPage: false
    });
    console.log('✓ 05: Home with history');
  });

  test('07. Topic input with options', async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto('/#/topic-input');
    await page.waitForTimeout(500);

    // Fill in topic to show the form
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

    // Generate quiz in Portuguese
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'História de Portugal');
    await page.click('#generateBtn');
    await expect(page).toHaveURL(/#\/quiz/, { timeout: 15000 });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/08-portuguese-quiz.png`,
      fullPage: false
    });
    console.log('✓ 08: Portuguese quiz');
  });

});
```

#### Reusing Existing Tests

For tests 01-04 and 06, modify the existing `capture-landing-assets.spec.js`:
1. Change `SCREENSHOT_DIR` to `'docs/product-info/screenshots/playstore'`
2. Change `MOBILE_VIEWPORT` to `{ width: 360, height: 640 }`
3. Run tests and collect screenshots

**OR** create a shared config and run both landing + playstore captures.

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

### Phase 53.1: Setup
- [ ] Create branch: `feature/phase53-playstore-update`
- [ ] Create `docs/product-info/screenshots/playstore/` directory
- [ ] Create learning notes file

### Phase 53.2: Text Updates (No Review Required)
- [ ] Choose short description option (A, B, or C)
- [ ] Update short description in Play Console (80 chars)
- [ ] Update full description with new features
- [ ] Verify character count is within limit

### Phase 53.3: Screenshot Capture
- [ ] Create `capture-playstore-screenshots.spec.js` (3 new tests)
- [ ] Modify existing tests for Play Store viewport (360x640)
- [ ] Run Playwright tests to capture 8 screenshots
- [ ] Verify all screenshots captured successfully

### Phase 53.4: Screenshot Processing
- [ ] Update `process-screenshots.cjs` with Play Store config
- [ ] Scale screenshots to 1080x1920 pixels
- [ ] Remove device frames (Play Store doesn't need them)
- [ ] Optimize file sizes

### Phase 53.5: Upload to Play Console
- [ ] Login to Play Console
- [ ] Navigate to Store Listing
- [ ] Delete old screenshots
- [ ] Upload 8 new screenshots in priority order
- [ ] Save and verify preview

### Phase 53.6: Release
- [ ] Merge branch to main
- [ ] Update CLAUDE.md status
- [ ] Create learning notes

### Optional Enhancements (Future)
- [ ] Update feature graphic with language badges
- [ ] Add localized store listings (PT, ES, FR, DE)
- [ ] Create new promotional video from demo.webm

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
