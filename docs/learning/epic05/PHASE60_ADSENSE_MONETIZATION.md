# Phase 60: AdSense Monetization

**Status:** 📋 Planning
**Priority:** High (Revenue Generation - Break-Even Goal)
**Estimated Effort:** 4-5 days (plus Google approval: 1-7 days)
**Created:** January 5, 2026
**Updated:** January 5, 2026

## Session Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-01-05 | **Plan Created** | AdSense integration strategy defined for RevOps break-even goal |

---

## Overview

Integrate Google AdSense to generate passive revenue from free-tier users. Ads will be shown during natural wait times (quiz generation, results loading) to minimize UX disruption while contributing to the €31.25/month break-even target.

**Motivation:**
- Generate revenue to cover hosting and development costs (€31.25/month target)
- Non-intrusive monetization that respects user experience
- No backend infrastructure needed (client-side only)
- Part of hybrid monetization strategy (ads + premium)

**Key Insight:** Show ads during loading screens when users are already waiting 10-15 seconds for LLM responses. This creates zero UX disruption.

**Revenue Projection:**
- 50 MAU × 5 quizzes/month = 250 pageviews
- Estimated: €1-5/month from ads alone
- Combined with license key premium (Phase 62): €35-55/month total

---

## What You'll Learn

### New Technologies & Concepts

1. **Google AdSense** - Ad network integration and approval process
2. **Ad Manager Pattern** - Client-side ad loading for SPAs
3. **SPA Ad Refresh** - Reloading ads on navigation without page refresh
4. **Offline Ad Handling** - Gracefully hiding ads when offline (PWA)
5. **Privacy Compliance** - GDPR/CCPA requirements for ad-supported apps
6. **RPM & CTR** - Understanding ad revenue metrics
7. **AdSense Policies** - Avoiding policy violations and account bans

---

## Prerequisites

Before starting this phase, you should have:

- ✅ **Live deployment** at https://saberloop.com/app/
- ✅ **HTTPS working** (required by AdSense)
- ✅ **Public content** available (landing page, sample quizzes)
- ✅ **Privacy policy** page (required by AdSense) - exists at /privacy.html
- ✅ **LoadingView** component for quiz generation
- ✅ Understanding of SPA routing and component lifecycle
- ✅ Google account for AdSense registration

---

## Architecture: Ads in a PWA

### Ad Placement Strategy

**PRIMARY: Loading States (User Already Waiting)**

```
Quiz Flow with Ads:
┌─────────────────────────────────────┐
│ User enters topic → Clicks "Start" │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│ LoadingView (10-15s wait)           │
│ ┌─────────────────────────────────┐ │
│ │ "Creating Your Quiz..."         │ │
│ │ [spinner animation]             │ │
│ │                                 │ │
│ │ [RESPONSIVE AD]                 │ │ ← User sees ad while waiting
│ │                                 │ │
│ │ "This takes 10-15 seconds"      │ │
│ └─────────────────────────────────┘ │
└──────────────┬──────────────────────┘
               ▼
      (Quiz questions appear)
               ▼
      (User answers questions)
               ▼
┌─────────────────────────────────────┐
│ ResultsLoadingView (5-10s wait)     │
│ ┌─────────────────────────────────┐ │
│ │ "Calculating your results..."   │ │
│ │ [spinner animation]             │ │
│ │                                 │ │
│ │ [RESPONSIVE AD]                 │ │ ← User sees ad while waiting
│ │                                 │ │
│ └─────────────────────────────────┘ │
└──────────────┬──────────────────────┘
               ▼
         (Results page)
```

**Why Loading States?**
- Users are already waiting (10-15s for LLM responses)
- Zero interruption to user flow
- Natural placement that doesn't feel intrusive
- High viewability (users staring at loading screen)

**Ad Format:**
- Responsive Display Ads (auto-sized to container)
- Medium Rectangle (300x250) fallback
- Mobile Banner (320x100) for small screens

---

## Implementation Plan

### 60.1 AdSense Account Setup

**Time:** 1-2 hours

**Steps:**

1. **Sign up for AdSense**
   - Go to https://adsense.google.com
   - Sign in with Google account
   - Add site: `https://saberloop.com`
   - Fill payment info (Portugal address)
   - Accept terms

2. **Site verification**
   - Add verification script to `index.html` `<head>`:
   ```html
   <script async
     src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX"
     crossorigin="anonymous">
   </script>
   ```
   - Replace `XXXXXXXX` with your publisher ID

3. **Create ads.txt**
   - Create `public/ads.txt`:
   ```
   google.com, pub-XXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
   - Deploy to be accessible at `https://saberloop.com/ads.txt`

4. **Verify crawlable content**
   - Ensure landing page is public
   - Sample quizzes work without login
   - Privacy policy accessible

**Commit:** `feat(monetization): add AdSense account setup`

---

### 60.2 Update Privacy Policy

**Time:** 30 minutes

**Steps:**

1. **Update privacy.html**
   - Already exists at `/landing/privacy.html`
   - Verify AdSense disclosure is present
   - Add cookie consent notice if needed

2. **Add privacy link to app**
   - Settings page footer
   - About page

**Commit:** `docs(privacy): ensure AdSense compliance`

---

### 60.3 Create AdManager Utility

**Time:** 2-3 hours

**File:** `src/utils/adManager.js`

**Functions:**

```javascript
const AdManager = {
  publisherId: 'ca-pub-XXXXXXXX',

  slots: {
    quizLoading: 'XXXXXXXXXX',    // During quiz generation
    resultsLoading: 'XXXXXXXXXX', // During results calculation
  },

  loadedAds: new Set(),

  canLoadAds() {
    // Check online + adsbygoogle loaded
  },

  loadAd(containerId, slotId) {
    // Create ad element
    // Push to adsbygoogle
    // Handle errors
  },

  hideContainer(containerId) {
    // Hide when offline
  },

  resetForNavigation() {
    // Clear loaded ads set
  },

  init() {
    // Handle online/offline events
  }
};
```

**Features:**
- Online/offline detection
- Duplicate ad prevention
- Graceful error handling
- SPA navigation support

**Commit:** `feat(monetization): create AdManager utility`

---

### 60.4 Add Ad Containers to Loading Views

**Time:** 2-3 hours

**Files to modify:**
- `src/views/LoadingView.js` (quiz generation loading)
- Create `src/views/ResultsLoadingView.js` (results loading)

**Changes:**

1. **LoadingView.js**
   ```javascript
   export function renderLoadingView(topic) {
     return `
       <div class="loading-view">
         <h2>Creating Your Quiz</h2>
         <p>Generating questions about ${topic}...</p>

         <div class="spinner"></div>
         <p class="loading-tip">This takes 10-15 seconds</p>

         <!-- Ad container -->
         <div id="quiz-loading-ad" class="ad-container"></div>

         <p>Our AI is crafting questions just for you.</p>
       </div>
     `;
   }

   export function initQuizLoadingAds() {
     AdManager.loadAd('quiz-loading-ad', AdManager.slots.quizLoading);
   }
   ```

2. **ResultsLoadingView.js** (new file)
   ```javascript
   export function renderResultsLoadingView(questionsCount) {
     return `
       <div class="loading-view results-loading">
         <h2>Quiz Complete!</h2>
         <p>Calculating your results...</p>

         <div class="spinner"></div>

         <!-- Ad container -->
         <div id="results-loading-ad" class="ad-container"></div>

         <p>You answered ${questionsCount} questions!</p>
       </div>
     `;
   }

   export function initResultsLoadingAds() {
     AdManager.loadAd('results-loading-ad', AdManager.slots.resultsLoading);
   }
   ```

**Commit:** `feat(monetization): add ad containers to loading views`

---

### 60.5 Add Ad Styles

**Time:** 30 minutes

**File:** `src/styles/components/ads.css` (new)

```css
/* Ad Container */
.ad-container {
  width: 100%;
  max-width: 336px;
  margin: 2rem auto;
  min-height: 280px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ad-container:empty {
  display: none;
  min-height: 0;
}

/* Loading view ad positioning */
.loading-ad {
  margin: 2rem auto;
}

@media (max-width: 468px) {
  .ad-container {
    max-width: 320px;
    min-height: 100px;
  }
}
```

**Commit:** `style(monetization): add ad container styles`

---

### 60.6 Integrate Ads into Quiz Flow

**Time:** 1-2 hours

**Files to modify:**
- `src/core/router.js` (or wherever quiz flow is managed)

**Changes:**

1. When starting quiz → Show LoadingView with ads
2. After last question → Show ResultsLoadingView with ads
3. Call AdManager.resetForNavigation() on route changes

**Commit:** `feat(monetization): integrate ads into quiz flow`

---

### 60.7 Add i18n Translations

**Time:** 30 minutes

**Files:** `public/locales/*/translation.json`

**New keys:**
```json
{
  "ads": {
    "loading": "Advertisement",
    "supportMessage": "Ads help keep Saberloop free"
  }
}
```

**Commit:** `feat(i18n): add ad-related translations`

---

### 60.8 Feature Flag

**Time:** 15 minutes

**File:** `src/core/features.js`

```javascript
export const features = {
  SHOW_ADS: true,  // Can disable if issues
  // ... other flags
};
```

**Commit:** `feat(monetization): add ads feature flag`

---

### 60.9 Testing

**Unit Tests** (1 hour)

File: `tests/unit/adManager.test.js`

- Test `canLoadAds()` with online/offline states
- Test `loadAd()` creates ad elements
- Test duplicate ad prevention
- Test `resetForNavigation()` clears state

**E2E Tests** (1-2 hours)

File: `tests/e2e/ads.spec.js`

- Ad container visible during quiz loading
- Ad container visible during results loading
- No ads during active quiz
- Ads hidden when offline
- Ad containers have correct attributes

**Manual Testing:**
- Deploy to staging
- Test ad loading in browser
- Test offline behavior
- Test on mobile device

**Commit:** `test(monetization): add AdManager tests`

---

### 60.10 Submit for AdSense Review

**Time:** 15 minutes (then wait 1-7 days)

**Steps:**

1. Deploy all changes to production
2. Verify:
   - Verification script in `<head>`
   - `ads.txt` accessible
   - Privacy policy visible
   - Public content available
3. In AdSense dashboard → Submit for review
4. Wait for Google approval (1-7 days typically)

---

### 60.11 Post-Approval: Add Real Ad Units

**Time:** 1 hour

Once approved:

1. Create ad units in AdSense dashboard:
   - "Quiz Loading Ad" → Get slot ID
   - "Results Loading Ad" → Get slot ID

2. Update `src/utils/adManager.js` with real slot IDs:
   ```javascript
   slots: {
     quizLoading: '1234567890',    // Real ID from AdSense
     resultsLoading: '0987654321', // Real ID from AdSense
   }
   ```

3. Deploy updated code
4. Monitor in AdSense dashboard (24-48 hours for data)

**Commit:** `feat(monetization): add production ad unit IDs`

---

## Testing Requirements

### Unit Tests
- [ ] AdManager utility fully tested
- [ ] Online/offline handling
- [ ] Duplicate prevention
- [ ] Error handling

### E2E Tests
- [ ] Ads visible in loading states
- [ ] No ads during active quiz
- [ ] Offline ad hiding works
- [ ] Mobile responsive

### Manual Testing
- [ ] Test on real device
- [ ] Verify ad viewability
- [ ] Check loading times (ads shouldn't slow app)
- [ ] Test offline → online transitions

### AdSense Compliance
- [ ] No ads on 404/error pages
- [ ] No ads on privacy policy page
- [ ] No click incentives ("Click here!")
- [ ] No ads during active quiz (policy violation)

---

## Success Criteria

- [ ] AdSense account approved
- [ ] Ads serving in production
- [ ] Ad impressions visible in dashboard (24-48h after approval)
- [ ] No policy violations
- [ ] Offline gracefully hides ads
- [ ] Page load time < 3s with ads
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Revenue tracking in AdSense dashboard

---

## Revenue Expectations

**Conservative Projections:**

| Month | MAU | Pageviews | Est. Revenue |
|-------|-----|-----------|--------------|
| 1 | 5 | 15 | €0.30 |
| 2 | 10 | 40 | €0.80 |
| 3 | 30 | 150 | €3.00 |
| 6 | 50 | 250 | €5.00 |

**Note:** AdSense alone won't reach €31.25/month target. Must combine with Phase 62 (License Key Premium) for break-even.

---

## Common Pitfalls & Solutions

### Issue: Ads not showing
**Solution:**
- Wait 24-48 hours after approval
- Check browser console for errors
- Verify ad blocker is off during testing
- Check AdSense account status

### Issue: Policy violation warning
**Solution:**
- Never place ads during active quiz
- Don't ask users to click ads
- Ensure privacy policy is complete
- Remove ads from error pages

### Issue: Low revenue
**Solution:**
- Focus on user growth (more users = more pageviews)
- Ensure ads are viewable (loading states are good for this)
- Monitor RPM in AdSense dashboard
- Consider adding more ad placements later (home page, etc.)

---

## Future Enhancements (Out of Scope)

1. **Additional Ad Placements** - Home page, Topics page (after testing impact)
2. **A/B Testing** - Test different ad positions/sizes
3. **Ad-Free Premium** - Remove ads for paying users (Phase 62)
4. **Analytics Integration** - Track ad performance vs user engagement

---

## References

- [Google AdSense Help](https://support.google.com/adsense)
- [AdSense Program Policies](https://support.google.com/adsense/answer/48182)
- [PWA Ad Best Practices](https://web.dev/vitals/#ads)
- [Coalition for Better Ads Standards](https://www.betterads.org/standards/)
- [AdSense for SPAs](https://support.google.com/adsense/answer/10109088)

---

## Integration with RevOps Strategy

This phase is **Part 1** of the hybrid monetization strategy:

1. **Phase 60 (This)**: AdSense → €1-5/month (small but passive)
2. **Phase 61**: Donation button → €5-15/month (optional support)
3. **Phase 62**: License key premium → €30-50/month (removes ads + features)

**Combined target:** €35-55/month (exceeds €31.25 break-even)

---

**Next Steps:** After completing Phase 60, proceed to Phase 61 (Donation) and Phase 62 (License Key Premium) to complete the monetization strategy.
