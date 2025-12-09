# Monetization Strategy Plan - Google AdSense Integration

**Epic:** 3 - QuizMaster V2

**Type:** Revenue Generation / Business Development

**Status:** Planning

**Estimated Time:** 2-3 sessions (plus approval wait time)

**Prerequisites:**
- Phase 3.5 (Branding) complete - Professional identity established
- Phase 3.6.1 (OpenRouter) complete - Core functionality working
- Live deployed site with public content

---

## Overview

This plan outlines the monetization strategy for QuizMaster (SaberLoop) using **Google AdSense** to generate passive revenue through non-intrusive advertising. The approach balances revenue generation with user experience, especially considering the educational nature of the app and PWA offline capabilities.

### Why Google AdSense?

| Factor | Benefit |
|--------|---------|
| **Low barrier** | Free to join, no minimum traffic |
| **Passive income** | Earn while users engage with quizzes |
| **Non-intrusive** | Responsive ads that fit your design |
| **Trusted platform** | Google handles ad quality and payments |
| **PWA compatible** | Works with SPAs, graceful offline fallback |

### Revenue Expectations (Realistic)

| Traffic Level | Monthly Pageviews | Est. Monthly Revenue |
|---------------|-------------------|---------------------|
| Starting out | 1,000 - 5,000 | $1 - $10 |
| Growing | 10,000 - 50,000 | $20 - $100 |
| Established | 100,000+ | $200+ |

**Note:** Educational/quiz apps typically have moderate RPM (Revenue Per Mille). Focus on user growth first, revenue will follow.

---

## Architecture: Ads in a Vanilla JS PWA

### Current QuizMaster Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    QuizMaster (SaberLoop)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Views (SPA)                    Ad Integration          │
│  ┌──────────────────┐          ┌──────────────────┐    │
│  │ HomeView         │◄────────►│ Ad: Below hero   │    │
│  │ TopicInputView   │          │ (optional)       │    │
│  │ QuizView         │          └──────────────────┘    │
│  │ ResultsView      │◄────────►┌──────────────────┐    │
│  │ SettingsView     │          │ Ad: After results│    │
│  └──────────────────┘          │ (primary spot)   │    │
│         │                      └──────────────────┘    │
│         │                                               │
│  ┌──────▼──────────┐                                   │
│  │ Router          │──── On navigation ──► Reload ads  │
│  └─────────────────┘                                   │
│                                                         │
│  ┌─────────────────┐          ┌──────────────────┐    │
│  │ Service Worker  │          │ AdManager        │    │
│  │ - Offline mode  │◄────────►│ - Online check   │    │
│  │ - Cache assets  │          │ - Graceful hide  │    │
│  └─────────────────┘          └──────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Considerations for PWA

1. **SPA Navigation**: Ads must reload when views change
2. **Offline Mode**: Ads gracefully hide when offline
3. **Performance**: Lazy load ads, don't block initial render
4. **UX**: Non-intrusive placement, never during active quiz

---

## Implementation Plan

### Phase M1: AdSense Account Setup (Day 1)

#### M1.1 Sign Up for AdSense

1. Go to **https://adsense.google.com**
2. Sign in with Google account
3. Add site URL: `https://your-quizmaster-domain.com`
4. Fill in payment information (Portugal address)
5. Accept terms and conditions

#### M1.2 Site Verification

Add verification script to `index.html` inside `<head>`:

```html
<!-- Google AdSense Verification -->
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossorigin="anonymous">
</script>
```

**Note:** Replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual publisher ID from AdSense dashboard.

#### M1.3 Create ads.txt

Create `public/ads.txt` (will be served at root):

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

This file is required by Google to verify ad inventory authorization.

#### M1.4 Ensure Crawlable Content

AdSense reviewers need to see content. Ensure these are publicly accessible:

- [ ] Landing/Home page with app description
- [ ] Sample quiz or demo mode
- [ ] About section explaining the app
- [ ] Privacy policy page (required!)
- [ ] Contact information

**Tip:** The home page should work without requiring OpenRouter login for the crawler to evaluate content.

---

### Phase M2: Privacy Policy & Legal (Day 1-2)

#### M2.1 Create Privacy Policy Page

**Required by AdSense.** Create `src/views/PrivacyView.js`:

```javascript
// Privacy Policy View
export function renderPrivacyView() {
  return `
    <div class="privacy-policy">
      <h1>Privacy Policy</h1>
      <p>Last updated: [DATE]</p>

      <h2>Information We Collect</h2>
      <p>QuizMaster stores quiz history locally on your device using IndexedDB.
      We do not collect or transmit personal information to our servers.</p>

      <h2>Third-Party Services</h2>

      <h3>OpenRouter</h3>
      <p>When you connect your OpenRouter account, API calls are made directly
      from your browser to OpenRouter's servers. Please review
      <a href="https://openrouter.ai/privacy">OpenRouter's Privacy Policy</a>.</p>

      <h3>Google AdSense</h3>
      <p>We use Google AdSense to display advertisements. Google may use cookies
      and collect data to show personalized ads. You can:</p>
      <ul>
        <li>Learn more at <a href="https://policies.google.com/privacy">Google's Privacy Policy</a></li>
        <li>Opt out of personalized ads at <a href="https://adssettings.google.com">Google Ad Settings</a></li>
        <li>Use <a href="https://optout.aboutads.info">DAA's opt-out tool</a></li>
      </ul>

      <h2>Cookies</h2>
      <p>Google AdSense uses cookies to serve ads based on your interests.
      These are third-party cookies managed by Google.</p>

      <h2>Data Storage</h2>
      <p>All quiz data is stored locally in your browser. We do not have access
      to your quiz history or results.</p>

      <h2>Contact</h2>
      <p>Questions? Contact us at [YOUR EMAIL]</p>
    </div>
  `;
}
```

#### M2.2 Add Privacy Link to Footer/Settings

Ensure privacy policy is accessible from:
- Footer on all pages
- Settings page
- About section

---

### Phase M3: Ad Manager Implementation (Day 2-3)

#### M3.1 Create Ad Manager Utility

Create `src/utils/adManager.js`:

```javascript
/**
 * AdManager - Handles Google AdSense integration for SPA
 *
 * Features:
 * - Loads ads on SPA navigation
 * - Handles offline gracefully
 * - Prevents duplicate ad loads
 * - Respects user experience (no ads during quiz)
 */

const AdManager = {
  // Your AdSense publisher ID (from dashboard)
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',

  // Ad slot IDs (create these in AdSense dashboard)
  slots: {
    resultsPage: 'XXXXXXXXXX',  // Primary: after quiz results
    homePage: 'XXXXXXXXXX',     // Secondary: on home page
  },

  // Track loaded ads to prevent duplicates
  loadedAds: new Set(),

  /**
   * Check if ads can be loaded
   */
  canLoadAds() {
    return navigator.onLine && typeof adsbygoogle !== 'undefined';
  },

  /**
   * Create and load an ad in a container
   * @param {string} containerId - DOM element ID for ad
   * @param {string} slotId - AdSense ad slot ID
   */
  loadAd(containerId, slotId) {
    if (!this.canLoadAds()) {
      this.hideContainer(containerId);
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    // Prevent duplicate loads
    const adKey = `${containerId}-${slotId}`;
    if (this.loadedAds.has(adKey)) return;

    // Create ad element
    container.innerHTML = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${this.publisherId}"
           data-ad-slot="${slotId}"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    `;

    // Load the ad with small delay for DOM
    setTimeout(() => {
      try {
        (adsbygoogle = window.adsbygoogle || []).push({});
        this.loadedAds.add(adKey);
      } catch (e) {
        console.log('[AdManager] Error loading ad:', e);
        this.hideContainer(containerId);
      }
    }, 100);
  },

  /**
   * Hide ad container (offline or error)
   */
  hideContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.style.display = 'none';
    }
  },

  /**
   * Reset for new page navigation
   */
  resetForNavigation() {
    this.loadedAds.clear();
  },

  /**
   * Handle online/offline transitions
   */
  init() {
    window.addEventListener('offline', () => {
      document.querySelectorAll('.ad-container').forEach(el => {
        el.style.display = 'none';
      });
    });

    window.addEventListener('online', () => {
      // Ads will load on next navigation
      console.log('[AdManager] Back online');
    });
  }
};

export default AdManager;
```

#### M3.2 Ad Container Styles

Add to your CSS (`src/styles/main.css` or equivalent):

```css
/* Ad Container Styles */
.ad-container {
  width: 100%;
  max-width: 728px;
  margin: 1.5rem auto;
  min-height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
}

/* Hide empty containers */
.ad-container:empty {
  display: none;
  min-height: 0;
}

/* Mobile responsive */
@media (max-width: 468px) {
  .ad-container {
    min-height: 50px;
    margin: 1rem auto;
  }
}

/* Label for transparency (optional) */
.ad-container::before {
  content: '';
  /* Uncomment to show "Advertisement" label:
  content: 'Advertisement';
  display: block;
  font-size: 0.7rem;
  color: #999;
  text-align: center;
  margin-bottom: 0.25rem;
  */
}
```

---

### Phase M4: Strategic Ad Placement (Day 3)

#### Placement Strategy - Loading States (Optimal UX)

The key insight is to show ads **during natural wait times** when the user is already idle waiting for LLM responses. This creates **zero disruption** to user flow.

| Location | Wait Time | User State | Priority | Rationale |
|----------|-----------|------------|----------|-----------|
| **Quiz generation** | 10-15s | Waiting for LLM | **PRIMARY** | Natural wait, user expects delay |
| **After last question** | 5-10s | Waiting for results | **PRIMARY** | Already waiting for processing |
| **Results page** | 0s | Ready to act | LOW | Delays next action |
| **Home page** | 0s | Browsing | LOW | Clutters UI |
| **During quiz questions** | 0s | Actively engaged | **NEVER** | Ruins focus |
| **Settings** | 0s | Utility task | **NEVER** | Feels spammy |

#### Why Loading States Are Better

```
Traditional Approach (Worse UX):
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Results     │ --> │ AD BLOCKS   │ --> │ Next Action │
│ (instant)   │     │ USER FLOW   │     │ (delayed)   │
└─────────────┘     └─────────────┘     └─────────────┘

Loading State Approach (Better UX):
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ User clicks │ --> │ AD + LOADER │ --> │ Content     │
│ "Start"     │     │ (10s wait)  │     │ (ready!)    │
└─────────────┘     └─────────────┘     └─────────────┘
                    User is already
                    waiting anyway!
```

#### Ad Format: Responsive Display (NOT Full-Page Interstitial)

**Important:** Ads are displayed **alongside** app feedback, NOT as full-page takeovers.

The user always sees:
- Status message ("Creating Your Quiz", "Calculating Results")
- Visual progress indicator (spinner)
- The ad (partial screen, responsive)
- Additional context/reassurance

```
┌─────────────────────────────────────────┐
│                                         │
│        🎯 Creating Your Quiz            │  ← Header (always visible)
│   Generating questions about Math...    │
│                                         │
│              ⏳ [spinner]               │  ← Loading indicator
│        This takes 10-15 seconds         │
│                                         │
│    ┌─────────────────────────────┐      │
│    │                             │      │
│    │     [RESPONSIVE AD]        │      │  ← Ad (partial screen)
│    │      ~300x250 max          │      │     NOT full-page
│    │                             │      │
│    └─────────────────────────────┘      │
│                                         │
│    Our AI is crafting 5th grade         │  ← Context (always visible)
│    questions just for you.              │
│                                         │
└─────────────────────────────────────────┘

Mobile Layout (same principle):
┌───────────────────────┐
│  Creating Your Quiz   │ ← Header
│  Math questions...    │
│                       │
│      ⏳ spinner       │ ← Progress
│    10-15 seconds      │
│                       │
│  ┌─────────────────┐  │
│  │  [RESPONSIVE]   │  │ ← Ad
│  │      AD         │  │
│  └─────────────────┘  │
│                       │
│  Crafting questions   │ ← Context
│  for you...           │
└───────────────────────┘
```

**Ad Formats to Use:**
| Format | Size | Best For |
|--------|------|----------|
| Responsive Display | Auto-sized | Recommended - adapts to container |
| Medium Rectangle | 300x250 | Good fallback for loading screens |
| Mobile Banner | 320x100 | Smaller option for mobile |

**Formats to AVOID:**
| Format | Why Avoid |
|--------|-----------|
| Interstitial (full-page) | Blocks app feedback, feels intrusive |
| Vignette | Covers content, bad UX |
| Anchor/Sticky | Persists beyond loading state |

#### M4.1 Quiz Generation Loading Screen (PRIMARY)

When user starts a new quiz, show ad while questions are being generated:

Update `src/views/LoadingView.js` (or create):

```javascript
import AdManager from '../utils/adManager.js';

/**
 * Loading view shown while LLM generates quiz questions
 * Perfect ad placement - user is waiting 10-15 seconds anyway
 */
export function renderQuizLoadingView(topic, gradeLevel) {
  return `
    <div class="loading-view">
      <div class="loading-header">
        <h2>Creating Your Quiz</h2>
        <p>Generating questions about <strong>${topic}</strong>...</p>
      </div>

      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-tip">This usually takes 10-15 seconds</p>
      </div>

      <!-- PRIMARY AD: User is already waiting for LLM -->
      <div id="quiz-loading-ad" class="ad-container loading-ad"></div>

      <div class="loading-info">
        <p>Our AI is crafting ${gradeLevel} level questions just for you.</p>
      </div>
    </div>
  `;
}

// Call immediately after rendering loading view
export function initQuizLoadingAds() {
  AdManager.loadAd('quiz-loading-ad', AdManager.slots.quizLoading);
}
```

#### M4.2 Results Loading Screen (PRIMARY)

After answering the last question, show ad while results/explanation are generated:

```javascript
import AdManager from '../utils/adManager.js';

/**
 * Loading view shown while calculating results / generating explanation
 * Another perfect ad moment - user finished quiz and is waiting
 */
export function renderResultsLoadingView(questionsAnswered) {
  return `
    <div class="loading-view results-loading">
      <div class="loading-header">
        <h2>Quiz Complete!</h2>
        <p>Calculating your results...</p>
      </div>

      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-tip">Preparing your score and feedback</p>
      </div>

      <!-- PRIMARY AD: User just finished, waiting for results -->
      <div id="results-loading-ad" class="ad-container loading-ad"></div>

      <div class="completion-message">
        <p>You answered ${questionsAnswered} questions!</p>
      </div>
    </div>
  `;
}

// Call immediately after rendering
export function initResultsLoadingAds() {
  AdManager.loadAd('results-loading-ad', AdManager.slots.resultsLoading);
}
```

#### M4.3 Updated Ad Slots Configuration

Update `src/utils/adManager.js` slots:

```javascript
const AdManager = {
  // Your AdSense publisher ID
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',

  // Ad slot IDs - focused on loading states
  slots: {
    // PRIMARY: Loading states (user already waiting)
    quizLoading: 'XXXXXXXXXX',      // While generating questions
    resultsLoading: 'XXXXXXXXXX',   // While calculating results

    // SECONDARY: Static pages (optional, lower priority)
    homePage: 'XXXXXXXXXX',         // Only if needed
  },

  // ... rest of implementation
};
```

#### M4.4 Quiz Flow Integration

Update your quiz flow to show ads during loading:

```javascript
// In your quiz controller/state management

async function startNewQuiz(topic, gradeLevel) {
  // 1. Show loading view WITH ad
  renderQuizLoadingView(topic, gradeLevel);
  initQuizLoadingAds();  // Ad loads while LLM works

  // 2. Call LLM API (10-15 seconds)
  const questions = await generateQuestions(topic, gradeLevel);

  // 3. Transition to quiz (ad was viewed during wait!)
  renderQuizView(questions);
}

async function submitFinalAnswer(answer) {
  // 1. Record answer
  recordAnswer(answer);

  // 2. Show results loading WITH ad
  renderResultsLoadingView(session.questions.length);
  initResultsLoadingAds();  // Ad loads while processing

  // 3. Calculate results / generate explanations (5-10 seconds)
  const results = await calculateResults(session);

  // 4. Show final results (ad was viewed during wait!)
  renderResultsView(results);
}
```

#### M4.5 Loading Ad Styles

```css
/* Loading screen ad container */
.loading-ad {
  margin: 2rem auto;
  max-width: 336px;  /* Medium rectangle works well in loading contexts */
}

/* Ensure ad doesn't shift layout when loading */
.loading-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Loading spinner above ad */
.loading-spinner {
  margin-bottom: 1.5rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-tip {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
```

#### M4.6 Fallback: Static Page Ads (Optional)

If you want additional ad placements beyond loading states:

```javascript
// Only add these if loading state ads aren't generating enough revenue

// Home page - between sections (low priority)
export function initHomeAds() {
  // Only for engaged users who have completed quizzes
  if (getCompletedQuizCount() > 3) {
    AdManager.loadAd('home-ad', AdManager.slots.homePage);
  }
}

// Results page - after viewing results (low priority)
// User already saw ad during loading, so this is optional
export function initResultsPageAds() {
  // Consider skipping if user saw loading ad recently
  if (!AdManager.recentlyShowedAd('resultsLoading', 60000)) {
    AdManager.loadAd('results-page-ad', AdManager.slots.resultsPage);
  }
}
```

---

### Phase M5: Testing & Optimization (Day 4+)

#### M5.1 Testing Checklist

**Before AdSense Approval:**
- [ ] Verification script in `<head>`
- [ ] `ads.txt` accessible at root
- [ ] Privacy policy page complete
- [ ] Site has crawlable public content
- [ ] No policy violations (adult content, copyright, etc.)

**After Approval:**
- [ ] Ad containers appear in correct locations
- [ ] Ads load on live domain (not localhost)
- [ ] Ads hide gracefully when offline
- [ ] SPA navigation loads new ads correctly
- [ ] No ads during active quiz
- [ ] Mobile responsive ads work
- [ ] Page speed still acceptable

#### M5.2 Unit Tests (Vitest)

Create `tests/unit/adManager.test.js`:

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AdManager from '../../src/utils/adManager.js';

describe('AdManager', () => {
  let mockContainer;

  beforeEach(() => {
    // Reset AdManager state
    AdManager.loadedAds.clear();

    // Create mock container
    mockContainer = document.createElement('div');
    mockContainer.id = 'test-ad-container';
    document.body.appendChild(mockContainer);

    // Mock adsbygoogle global
    window.adsbygoogle = [];
  });

  afterEach(() => {
    document.body.removeChild(mockContainer);
    delete window.adsbygoogle;
  });

  describe('canLoadAds', () => {
    it('returns true when online and adsbygoogle exists', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
      expect(AdManager.canLoadAds()).toBe(true);
    });

    it('returns false when offline', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
      expect(AdManager.canLoadAds()).toBe(false);
    });

    it('returns false when adsbygoogle not loaded', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
      delete window.adsbygoogle;
      expect(AdManager.canLoadAds()).toBe(false);
    });
  });

  describe('loadAd', () => {
    it('creates ad element in container', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

      AdManager.loadAd('test-ad-container', '12345');

      const adElement = mockContainer.querySelector('.adsbygoogle');
      expect(adElement).toBeTruthy();
      expect(adElement.dataset.adSlot).toBe('12345');
    });

    it('prevents duplicate ad loads for same container/slot', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

      AdManager.loadAd('test-ad-container', '12345');
      const firstContent = mockContainer.innerHTML;

      AdManager.loadAd('test-ad-container', '12345');

      // Should not have changed (no duplicate)
      expect(mockContainer.innerHTML).toBe(firstContent);
      expect(AdManager.loadedAds.size).toBe(1);
    });

    it('hides container when offline', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
      mockContainer.style.display = 'block';

      AdManager.loadAd('test-ad-container', '12345');

      expect(mockContainer.style.display).toBe('none');
    });

    it('does nothing if container not found', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

      // Should not throw
      expect(() => {
        AdManager.loadAd('nonexistent-container', '12345');
      }).not.toThrow();
    });
  });

  describe('resetForNavigation', () => {
    it('clears loaded ads set', () => {
      AdManager.loadedAds.add('test-key');
      expect(AdManager.loadedAds.size).toBe(1);

      AdManager.resetForNavigation();

      expect(AdManager.loadedAds.size).toBe(0);
    });
  });

  describe('hideContainer', () => {
    it('hides the specified container', () => {
      mockContainer.style.display = 'block';

      AdManager.hideContainer('test-ad-container');

      expect(mockContainer.style.display).toBe('none');
    });

    it('does nothing if container not found', () => {
      expect(() => {
        AdManager.hideContainer('nonexistent');
      }).not.toThrow();
    });
  });
});
```

#### M5.3 E2E Tests (Playwright)

Create `tests/e2e/ads.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test.describe('Ad Integration', () => {

  test.describe('Quiz Generation Loading - Ad Placement', () => {
    test('shows ad container during quiz generation', async ({ page }) => {
      await page.goto('/');

      // Start a new quiz
      await page.fill('[data-testid="topic-input"]', 'Math');
      await page.click('[data-testid="start-quiz-btn"]');

      // Should show loading view with ad container
      await expect(page.locator('.loading-view')).toBeVisible();
      await expect(page.locator('#quiz-loading-ad')).toBeVisible();

      // Ad placeholder should be visible (dev mode shows placeholder)
      await expect(page.locator('#quiz-loading-ad')).toContainText('Ad Placeholder');
    });

    test('ad container has correct attributes', async ({ page }) => {
      await page.goto('/');
      await page.fill('[data-testid="topic-input"]', 'Science');
      await page.click('[data-testid="start-quiz-btn"]');

      const adContainer = page.locator('#quiz-loading-ad');
      await expect(adContainer).toHaveClass(/ad-container/);
      await expect(adContainer).toHaveClass(/loading-ad/);
    });
  });

  test.describe('Results Loading - Ad Placement', () => {
    test('shows ad container while calculating results', async ({ page }) => {
      // Setup: Complete a quiz first
      await page.goto('/');
      await page.fill('[data-testid="topic-input"]', 'History');
      await page.click('[data-testid="start-quiz-btn"]');

      // Wait for quiz to load and answer all questions
      await expect(page.locator('.quiz-view')).toBeVisible({ timeout: 20000 });

      // Answer questions (5 questions by default)
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="answer-option"]:first-child');
        await page.click('[data-testid="next-btn"]');
      }

      // After last question, should show results loading with ad
      await expect(page.locator('.results-loading')).toBeVisible();
      await expect(page.locator('#results-loading-ad')).toBeVisible();
    });
  });

  test.describe('Offline Handling', () => {
    test('hides ad containers when offline', async ({ page, context }) => {
      await page.goto('/');

      // Start quiz to get to loading screen
      await page.fill('[data-testid="topic-input"]', 'Geography');
      await page.click('[data-testid="start-quiz-btn"]');

      // Verify ad container is visible while online
      await expect(page.locator('#quiz-loading-ad')).toBeVisible();

      // Go offline
      await context.setOffline(true);

      // Trigger offline event
      await page.evaluate(() => {
        window.dispatchEvent(new Event('offline'));
      });

      // Ad containers should be hidden
      await expect(page.locator('.ad-container')).toBeHidden();
    });

    test('ad containers remain functional after coming back online', async ({ page, context }) => {
      await page.goto('/');

      // Go offline then online
      await context.setOffline(true);
      await page.evaluate(() => window.dispatchEvent(new Event('offline')));

      await context.setOffline(false);
      await page.evaluate(() => window.dispatchEvent(new Event('online')));

      // Start a quiz - ads should work
      await page.fill('[data-testid="topic-input"]', 'Art');
      await page.click('[data-testid="start-quiz-btn"]');

      await expect(page.locator('#quiz-loading-ad')).toBeVisible();
    });
  });

  test.describe('No Ads During Active Quiz', () => {
    test('quiz question view has no ad containers', async ({ page }) => {
      await page.goto('/');
      await page.fill('[data-testid="topic-input"]', 'Music');
      await page.click('[data-testid="start-quiz-btn"]');

      // Wait for actual quiz (not loading)
      await expect(page.locator('.quiz-view')).toBeVisible({ timeout: 20000 });

      // Should NOT have any ad containers during active quiz
      await expect(page.locator('.quiz-view .ad-container')).toHaveCount(0);
    });
  });

  test.describe('Settings Page - No Ads', () => {
    test('settings page has no ad containers', async ({ page }) => {
      await page.goto('/settings');

      await expect(page.locator('.settings-view')).toBeVisible();
      await expect(page.locator('.ad-container')).toHaveCount(0);
    });
  });

  test.describe('Privacy Policy Accessibility', () => {
    test('privacy policy page is accessible', async ({ page }) => {
      await page.goto('/privacy');

      await expect(page.locator('h1')).toContainText('Privacy Policy');
      await expect(page.locator('text=Google AdSense')).toBeVisible();
    });

    test('privacy link is visible in footer/settings', async ({ page }) => {
      await page.goto('/settings');

      const privacyLink = page.locator('a[href="/privacy"], a[href*="privacy"]');
      await expect(privacyLink).toBeVisible();
    });
  });
});
```

#### M5.4 Test Configuration

Add to `playwright.config.js` (if not already configured):

```javascript
// Extend existing config for ad testing
export default {
  // ... existing config ...

  projects: [
    // ... existing projects ...
    {
      name: 'ads-integration',
      testMatch: '**/ads.spec.js',
      use: {
        // Longer timeouts for LLM responses
        timeout: 30000,
        actionTimeout: 15000,
      },
    },
  ],
};
```

#### M5.5 AdSense Dev Mode (Placeholders)

For testing without affecting your account:

```javascript
// In development, use test mode
const AdManager = {
  // ... other code ...

  loadAd(containerId, slotId) {
    // In dev/test, show placeholder instead
    if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div class="ad-placeholder" data-testid="ad-placeholder" style="background:#f0f0f0;padding:20px;text-align:center;border:1px dashed #ccc;">
            [Ad Placeholder: ${slotId}]
          </div>
        `;
      }
      return;
    }

    // Production code...
  }
};
```

#### M5.6 Performance Monitoring

Track ad performance in your observability:

```javascript
// Log ad events for analysis
function trackAdEvent(event, data) {
  console.log('[AdManager]', event, data);
  // Could integrate with your logger from Phase 4
}

// In AdManager
loadAd(containerId, slotId) {
  trackAdEvent('load_attempt', { containerId, slotId, online: navigator.onLine });
  // ...
}
```

---

## Revenue Optimization Tips

### Short Term (First 3 months)
1. **Focus on traffic growth** - More users = more revenue
2. **Optimize ad placement** - Results page is highest value
3. **Ensure mobile works** - Most users are mobile
4. **Track performance** - Monitor RPM and CTR in AdSense

### Medium Term (3-6 months)
1. **A/B test placements** - Try different positions
2. **Add more pages** - Blog, quiz categories, leaderboards
3. **Improve engagement** - Longer sessions = more ad views
4. **Consider ad types** - Display vs in-feed vs matched content

### Long Term (6+ months)
1. **Evaluate alternatives** - Media.net, Carbon Ads (if tech-focused)
2. **Consider premium tier** - Ad-free subscription option
3. **Sponsorships** - Direct deals with educational brands
4. **Affiliate content** - Book/course recommendations

---

## Alternative/Complementary Monetization

### Future Considerations

| Model | Pros | Cons | When to Add |
|-------|------|------|-------------|
| **Premium (ad-free)** | Recurring revenue | Need enough users | 10k+ MAU |
| **Donations** | User goodwill | Unpredictable | Anytime |
| **Sponsorships** | Higher CPM | Need niche audience | 50k+ MAU |
| **Affiliate** | Passive | Needs relevant products | When content fits |

### Donation Option (Quick Win)

Add a "Buy Me a Coffee" or Ko-fi link:

```html
<a href="https://ko-fi.com/yourusername" target="_blank" class="support-link">
  Support SaberLoop
</a>
```

Low effort, complements ads, builds community goodwill.

---

## Timeline & Milestones

| Phase | Duration | Milestone |
|-------|----------|-----------|
| M1: Setup | Day 1 | AdSense account created, verification submitted |
| M2: Legal | Day 1-2 | Privacy policy live |
| M3: Code | Day 2-3 | AdManager implemented |
| M4: Placement | Day 3 | Ads integrated in views |
| M5: Testing | Day 4+ | All tests passing |
| **Approval** | 1-14 days | Google reviews and approves |
| **Go Live** | After approval | Ads serving, revenue tracking |

---

## Success Criteria

### Technical
- [ ] AdSense verification complete
- [ ] `ads.txt` properly served
- [ ] Privacy policy accessible
- [ ] AdManager handles SPA navigation
- [ ] Offline mode gracefully hides ads
- [ ] No console errors from ad code
- [ ] Page load time < 3s with ads

### Business
- [ ] AdSense account approved
- [ ] First ad impressions recorded
- [ ] Revenue visible in dashboard
- [ ] No policy violations
- [ ] User feedback neutral/positive on ad placement

### User Experience
- [ ] Ads never interrupt quiz flow
- [ ] Ads responsive on all devices
- [ ] Offline experience unaffected
- [ ] Ad placement feels natural, not spammy

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `index.html` | Modify | Add AdSense verification script |
| `public/ads.txt` | Create | Ad inventory authorization |
| `src/views/PrivacyView.js` | Create | Privacy policy page |
| `src/utils/adManager.js` | Create | Ad loading utility |
| `src/styles/ads.css` | Create | Ad container & loading styles |
| `src/views/LoadingView.js` | Create/Modify | Quiz generation loading with ad |
| `src/views/ResultsLoadingView.js` | Create | Results loading with ad |
| `src/state/quizState.js` | Modify | Integrate ads into quiz flow |
| `src/router/index.js` | Modify | Handle loading states with ads |
| `tests/unit/adManager.test.js` | Create | Unit tests for AdManager |
| `tests/e2e/ads.spec.js` | Create | E2E tests for ad placements |
| `playwright.config.js` | Modify | Add ads-integration test project |

---

## References

- [Google AdSense Help](https://support.google.com/adsense)
- [AdSense Program Policies](https://support.google.com/adsense/answer/48182)
- [Web.dev - Ads Best Practices](https://web.dev/vitals/#ads)
- [Coalition for Better Ads](https://www.betterads.org/standards/)

---

**Note:** This plan focuses on a user-friendly, policy-compliant implementation. Revenue will grow with traffic - focus on building a great product first, and monetization will follow naturally.
