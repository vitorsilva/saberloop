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

#### Placement Strategy

| Location | Priority | Rationale |
|----------|----------|-----------|
| **Results page** | HIGH | User completed action, natural break |
| **Home page** | MEDIUM | Between sections, not intrusive |
| **Topic selection** | LOW | Don't interrupt flow |
| **During quiz** | NEVER | Would ruin UX |
| **Settings** | NEVER | Utility page, feels spammy |

#### M4.1 Results View Integration

Update `src/views/ResultsView.js`:

```javascript
import AdManager from '../utils/adManager.js';

export function renderResultsView(session) {
  const score = session.score;
  const total = session.questions.length;
  const percentage = Math.round((score / total) * 100);

  return `
    <div class="results-view">
      <div class="results-header">
        <h1>Quiz Complete!</h1>
        <div class="score-display">
          <span class="score">${score}/${total}</span>
          <span class="percentage">(${percentage}%)</span>
        </div>
      </div>

      <div class="results-message">
        ${getResultMessage(percentage)}
      </div>

      <!-- PRIMARY AD PLACEMENT: After results, before actions -->
      <div id="results-ad" class="ad-container"></div>

      <div class="results-actions">
        <button class="btn-primary" data-action="new-quiz">
          Start New Quiz
        </button>
        <button class="btn-secondary" data-action="review">
          Review Answers
        </button>
        <button class="btn-tertiary" data-action="home">
          Back to Home
        </button>
      </div>
    </div>
  `;
}

// Call after rendering
export function initResultsAds() {
  AdManager.loadAd('results-ad', AdManager.slots.resultsPage);
}
```

#### M4.2 Home View Integration (Optional)

Update `src/views/HomeView.js`:

```javascript
import AdManager from '../utils/adManager.js';

export function renderHomeView(recentQuizzes) {
  return `
    <div class="home-view">
      <section class="hero">
        <h1>Welcome to SaberLoop</h1>
        <p>Test your knowledge on any topic</p>
        <button class="btn-primary" data-action="start-quiz">
          Start a Quiz
        </button>
      </section>

      <!-- AD: Between hero and recent quizzes -->
      <div id="home-ad" class="ad-container"></div>

      <section class="recent-quizzes">
        <h2>Recent Quizzes</h2>
        ${renderRecentQuizzes(recentQuizzes)}
      </section>
    </div>
  `;
}

export function initHomeAds() {
  // Only load home ad if user has taken quizzes (engaged user)
  if (hasRecentQuizzes()) {
    AdManager.loadAd('home-ad', AdManager.slots.homePage);
  }
}
```

#### M4.3 Router Integration

Update router to handle ad lifecycle:

```javascript
import AdManager from '../utils/adManager.js';

// In your router's navigation handler
function navigateTo(route) {
  // Reset ad tracking on navigation
  AdManager.resetForNavigation();

  // ... existing routing logic ...

  // After view renders, init ads for that view
  switch(route) {
    case '/results':
      initResultsAds();
      break;
    case '/':
    case '/home':
      initHomeAds();
      break;
    // Other routes don't have ads
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

#### M5.2 AdSense Testing Mode

For testing without affecting your account:

```javascript
// In development, use test mode
const AdManager = {
  // ... other code ...

  loadAd(containerId, slotId) {
    // In dev, show placeholder instead
    if (import.meta.env.DEV) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div style="background:#f0f0f0;padding:20px;text-align:center;border:1px dashed #ccc;">
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

#### M5.3 Performance Monitoring

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
| `src/styles/ads.css` | Create | Ad container styles |
| `src/views/ResultsView.js` | Modify | Add ad container |
| `src/views/HomeView.js` | Modify | Add ad container (optional) |
| `src/router/index.js` | Modify | Handle ad lifecycle |

---

## References

- [Google AdSense Help](https://support.google.com/adsense)
- [AdSense Program Policies](https://support.google.com/adsense/answer/48182)
- [Web.dev - Ads Best Practices](https://web.dev/vitals/#ads)
- [Coalition for Better Ads](https://www.betterads.org/standards/)

---

**Note:** This plan focuses on a user-friendly, policy-compliant implementation. Revenue will grow with traffic - focus on building a great product first, and monetization will follow naturally.
