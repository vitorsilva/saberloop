# OpenRouter Onboarding UX Enhancement

**Created:** 2025-12-19
**Status:** Parking Lot / Ready to Implement
**Goal:** Improve the AI provider connection experience with guided step-by-step instructions

### Session Log

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-19 | **Plan Created** | Full plan drafted with UI mockup reference, feature flags (hand-rolled), branching strategy, and 5-phase implementation. Ready to start Phase 1 when desired. |

---

## Executive Summary

Enhance the OpenRouter connection flow to reduce user anxiety about the external OAuth process by:

1. **New "OpenRouter Free Account Guide"** - A dedicated view with step-by-step visual instructions
2. **Multiple Entry Points** - Consistent access from Welcome screen, Settings, and Homepage prompts
3. **Feature Flags** - Gradual rollout to protect existing users during closed testing
4. **"Connection Confirmed!" Screen** - Celebration moment after successful connection

**Key Principle:** Guide users through each step of the OpenRouter signup process, emphasizing it's FREE and no credit card is required.

---

## Background & Motivation

### Current Pain Points

| Issue | Impact |
|-------|--------|
| **Abrupt redirect to OpenRouter** | Users may feel lost/confused when leaving the app |
| **No guidance on free tier** | Users might think they need to pay |
| **Skip payment screen not obvious** | OpenRouter shows credit selection first |
| **No confirmation/celebration** | Users don't feel accomplished after connecting |
| **Single entry point** | Only from Welcome screen (misses reconnection scenarios) |

### User Research Insights

From Phase 3.6.1 implementation notes:
- Sample quizzes reduce friction for first-time users
- Users want to explore before committing to external account
- The OpenRouter payment screen confuses free-tier users

---

## Proposed Solution

### New "OpenRouter Free Account Guide" View

A dedicated educational screen based on the mockup design (`docs/product-info/mockups/stitch_quiz_generator/`):

```
┌─────────────────────────────────────┐
│ ← Set up OpenRouter                 │ (Sticky header with back button)
├─────────────────────────────────────┤
│                                     │
│ Create your free account            │
│                                     │
│ Follow these steps to get your      │
│ API key. No credit card is          │
│ required for the free tier.         │
│                                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ ✓ Free Access                   │ │ (Info box)
│ │ You do not need to add credits  │ │
│ │ initially. Several models are   │ │
│ │ completely free to test.        │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│                                     │
│ [Continue to OpenRouter ↗]          │ (Primary CTA)
│                                     │
│      I'll do it later               │ (Secondary link)
│                                     │
├─────────────────────────────────────┤
│ See instructions for free account   │
│ creation                            │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 1  Sign Up                      │ │ (Step card with illustration)
│ │    Visit OpenRouter.ai...       │ │
│ │    [Browser mockup illustration]│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 2  Create Account               │ │
│ │    Choose Google, GitHub, or... │ │
│ │    [Login modal illustration]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │ (Highlighted - most important!)
│ │ 3  Skip Payment Screen          │ │
│ │ ⚠️ CRUCIAL: Do not pay.         │ │
│ │    Find "continue with free     │ │
│ │    account link" below button.  │ │
│ │    [Payment screen illustration]│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 4  Authorize Request            │ │
│ │    Review and click Authorize   │ │
│ │    [Auth modal illustration]    │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ [Continue to OpenRouter ↗]          │ (Fixed bottom CTA)
└─────────────────────────────────────┘
```

### User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              ENTRY POINTS                                │
├─────────────────┬─────────────────┬─────────────────┬───────────────────┤
│   Welcome View  │   Settings      │   Homepage      │   "Start Quiz"    │
│  "Connect to AI │  "Connect with  │  (future popup) │   when not        │
│    Provider"    │   OpenRouter"   │                 │   connected       │
└────────┬────────┴────────┬────────┴────────┬────────┴─────────┬─────────┘
         │                 │                 │                  │
         └─────────────────┼─────────────────┘                  │
                           ▼                                    │
              ┌────────────────────────┐                        │
              │  OpenRouter Free       │                        │
              │  Account Guide         │◄───────────────────────┘
              │  (New View)            │
              └───────────┬────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               │               ▼
    "I'll do it later"    │         "Continue to
          │               │          OpenRouter"
          ▼               │               │
    ┌──────────┐          │               ▼
    │ Homepage │          │    ┌──────────────────┐
    │ (sample  │          │    │ OpenRouter.ai    │
    │ quizzes) │          │    │ (OAuth flow)     │
    └──────────┘          │    └────────┬─────────┘
                          │             │
                          │             ▼
                          │    ┌──────────────────┐
                          │    │ OAuth Callback   │
                          │    │ (existing)       │
                          │    └────────┬─────────┘
                          │             │
                          │    ┌────────┴────────┐
                          │    ▼                 ▼
                          │ Success           Error
                          │    │                 │
                          │    ▼                 ▼
                          │ ┌────────────┐  ┌────────────┐
                          │ │Connection  │  │ Error      │
                          │ │Confirmed!  │  │ Screen     │
                          │ │(New View)  │  │(retry link)│
                          │ └─────┬──────┘  └────────────┘
                          │       │
                          │       ▼
                          └───►Homepage
```

### "Connection Confirmed!" Screen

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         ✓ (large checkmark)         │
│                                     │
│      Connection Confirmed!          │
│                                     │
│   You're all set! Your free         │
│   OpenRouter account is connected.  │
│                                     │
│   Free tier includes:               │
│   • 50 quiz generations per day     │
│   • No credit card required         │
│                                     │
│   [Start Your First Quiz →]         │
│                                     │
└─────────────────────────────────────┘
```

---

## Git Branching & Commit Strategy

### Branch Strategy

**Create a new branch based on `main`:**

```bash
git checkout main
git pull origin main
git checkout -b feature/openrouter-onboarding-ux
```

**Branch naming:** `feature/openrouter-onboarding-ux`

### Commit Guidelines

**Commit often!** At minimum once per phase, but preferably for every atomic unit of work.

| Phase | Suggested Commits |
|-------|-------------------|
| **Phase 1** | 1. Feature flag system, 2. View shells, 3. Router updates, 4. Unit tests |
| **Phase 2** | 1. Header + hero, 2. Info box + CTAs, 3. Step cards 1-2, 4. Step cards 3-4, 5. Fixed bottom CTA |
| **Phase 3** | 1. Settings integration, 2. Welcome integration, 3. OAuth callback update |
| **Phase 4** | 1. ConnectionConfirmed view |
| **Phase 5** | 1. Phase toggle to SETTINGS_ONLY, 2. Phase toggle to ENABLED, 3. E2E tests |

**Commit message format:**
```
feat(onboarding): add feature flag system

- Create src/core/features.js with phase-based flags
- Add isFeatureEnabled() helper function
- Unit tests for all phases
```

**Atomic commits allow:**
- Easy rollback if something breaks
- Clear history of changes
- Bisect debugging if issues arise

---

## Feature Flag System

### Why Feature Flags?

We're in **closed testing** (Day 2 of 14-day period). Real users have the app installed. We need to:

1. **Ship code safely** - Deploy without activating new features
2. **Test in production** - Verify nothing breaks
3. **Gradual rollout** - Settings first, then everywhere

### Feature Flag Library Options

For this project, we have two approaches:

#### Option A: Hand-Rolled (Recommended for Simplicity)

Our app is simple and only needs one feature flag. A hand-rolled solution:
- Zero dependencies
- Full control
- Easy to understand
- No external services

**Best for:** Simple apps, single feature flags, learning projects

#### Option B: Open-Source Libraries

If we want a more robust solution or plan to add many feature flags:

| Library | Pros | Cons | Best For |
|---------|------|------|----------|
| [**OpenFeature**](https://openfeature.dev/) | Vendor-agnostic standard, upgrade path | Needs provider setup | Future-proofing |
| [**Flags SDK**](https://flags-sdk.dev/) | Lightweight, no backend | Next.js/SvelteKit focused | Modern frameworks |
| [**FeatBit**](https://www.featbit.co/) | 100% free, good JS SDK | Requires self-hosting | Full feature management |
| [**Unleash**](https://github.com/Unleash/unleash) | Most popular, 15+ SDKs | Server component needed | Enterprise scale |
| [**GrowthBook**](https://www.growthbook.io/) | Free self-hosted, A/B testing | More complex setup | Analytics + flags |

**Decision: Hand-Rolled** - We're going with the hand-rolled approach for this feature. Zero dependencies, full control, and perfectly suited for our single feature flag use case. If we need more feature flags in the future, we can consider migrating to OpenFeature.

### Feature Flag Implementation (Hand-Rolled)

**File:** `src/core/features.js` (NEW)

```javascript
/**
 * Feature Flags for Gradual Rollout
 *
 * Rollout phases:
 * 1. DISABLED - Code deployed but not active
 * 2. SETTINGS_ONLY - Available only in Settings page
 * 3. ENABLED - Available everywhere
 */

export const FEATURE_FLAGS = {
  // OpenRouter onboarding guide
  OPENROUTER_GUIDE: {
    // Current phase: DISABLED | SETTINGS_ONLY | ENABLED
    phase: 'DISABLED',

    // Feature description for debugging
    description: 'New OpenRouter connection guide with step-by-step instructions',

    // When to fully enable (reminder for developer)
    enableAfter: 'Verify Settings page works correctly'
  }
};

/**
 * Check if a feature is enabled
 * @param {string} featureName - Key from FEATURE_FLAGS
 * @param {string} context - Where the feature is being used ('settings' | 'welcome' | 'home')
 * @returns {boolean}
 */
export function isFeatureEnabled(featureName, context = 'default') {
  const feature = FEATURE_FLAGS[featureName];

  if (!feature) {
    console.warn(`[Features] Unknown feature: ${featureName}`);
    return false;
  }

  switch (feature.phase) {
    case 'DISABLED':
      return false;
    case 'SETTINGS_ONLY':
      return context === 'settings';
    case 'ENABLED':
      return true;
    default:
      return false;
  }
}

/**
 * Get current phase for a feature (useful for debugging)
 */
export function getFeaturePhase(featureName) {
  return FEATURE_FLAGS[featureName]?.phase || 'UNKNOWN';
}
```

### Usage in Views

```javascript
// In SettingsView.js
import { isFeatureEnabled } from '../core/features.js';

// Check if new guide should be used
if (isFeatureEnabled('OPENROUTER_GUIDE', 'settings')) {
  // Navigate to new OpenRouter Guide view
  this.navigateTo('/setup-openrouter');
} else {
  // Use existing ConnectModal behavior
  this.navigateTo('/welcome');
}
```

```javascript
// In WelcomeView.js
import { isFeatureEnabled } from '../core/features.js';

// "Connect to AI Provider" button
if (isFeatureEnabled('OPENROUTER_GUIDE', 'welcome')) {
  this.navigateTo('/setup-openrouter');
} else {
  await showConnectModal();
}
```

### Rollout Plan

| Phase | `OPENROUTER_GUIDE.phase` | What Happens | Duration |
|-------|--------------------------|--------------|----------|
| **1. Deploy Inactive** | `'DISABLED'` | Code deployed, no UI changes | 1-2 days |
| **2. Settings Only** | `'SETTINGS_ONLY'` | Available from Settings | 3-5 days |
| **3. Full Rollout** | `'ENABLED'` | Available everywhere | Permanent |

---

## Implementation Phases

### Phase 1: Foundation (2-3 sessions)

**Goal:** Create feature flag system and new view files without activating.

| Step | What to Create | Notes |
|------|----------------|-------|
| 1.1 | `src/core/features.js` | Feature flag system |
| 1.2 | `src/views/OpenRouterGuideView.js` | New guide view (shell) |
| 1.3 | `src/views/ConnectionConfirmedView.js` | Success celebration view |
| 1.4 | Update router to register new routes | `/setup-openrouter`, `/connection-confirmed` |
| 1.5 | Unit tests for feature flags | Verify phase logic works |

**Deliverables:**
- Feature flag system working
- Routes registered but not linked from UI
- All E2E tests still passing

---

### Phase 2: OpenRouter Guide UI (2-3 sessions)

**Goal:** Implement the full guide UI based on mockup.

| Step | What to Implement | Notes |
|------|-------------------|-------|
| 2.1 | Header with back button | Sticky, "Set up OpenRouter" |
| 2.2 | Hero section | Title, subtitle, "No credit card" emphasis |
| 2.3 | "Free Access" info box | Blue accent, verified_user icon |
| 2.4 | Primary CTA buttons | "Continue to OpenRouter" with external link icon |
| 2.5 | Step-by-step cards | 4 cards with illustrations |
| 2.6 | Fixed bottom CTA | Duplicate of primary button |
| 2.7 | "I'll do it later" link | Returns to homepage |

**UI Components to Create:**

```javascript
// Step card component structure
const StepCard = {
  number: 1,
  title: 'Sign Up',
  description: 'Visit OpenRouter.ai. Look for...',
  illustration: 'browser-mockup', // or 'login-modal', 'payment-skip', 'auth-request'
  highlighted: false // true for step 3 (payment skip)
};
```

**Color Mapping from Mockup:**

| Mockup Color | App Color Variable |
|--------------|-------------------|
| `#4A90E2` (primary blue) | `primary` (already matches) |
| `#181220` (dark bg) | `background-dark` |
| `#231a2e` (surface dark) | `card-dark` |
| `#f7f6f8` (light bg) | `background-light` |

**Deliverables:**
- Full OpenRouter Guide view implemented
- Matches mockup design closely
- Responsive on mobile devices

---

### Phase 3: Integration & Routing (1-2 sessions)

**Goal:** Wire up the guide to existing flows.

| Step | What to Update | Notes |
|------|----------------|-------|
| 3.1 | SettingsView | "Connect with OpenRouter" → Guide view |
| 3.2 | WelcomeView | "Connect to AI Provider" → Guide view |
| 3.3 | OAuth callback | Redirect to ConnectionConfirmedView on success |
| 3.4 | ConnectModal | When shown from homepage, go to Guide |
| 3.5 | Feature flag checks | All entry points respect flag phase |

**Routing Changes:**

```javascript
// Current flow:
// Settings → /welcome → ConnectModal → OpenRouter OAuth

// New flow (when enabled):
// Settings → /setup-openrouter → Guide View → OpenRouter OAuth → /connection-confirmed
```

**Deliverables:**
- All entry points properly routed
- Feature flags control which flow is used
- OAuth callback handles new route

---

### Phase 4: Connection Confirmed View (1 session)

**Goal:** Create celebration screen after successful connection.

| Step | What to Implement | Notes |
|------|-------------------|-------|
| 4.1 | Success animation | Large checkmark, fade-in |
| 4.2 | Welcome message | "Connection Confirmed!" |
| 4.3 | Free tier info | Benefits list |
| 4.4 | Primary CTA | "Start Your First Quiz" |
| 4.5 | Auto-redirect (optional) | After 5 seconds, go to homepage |

**Deliverables:**
- ConnectionConfirmedView complete
- Proper routing from OAuth callback
- Pleasant user experience

---

### Phase 5: Gradual Rollout & Testing (1-2 sessions)

**Goal:** Enable feature progressively and verify.

| Step | Action | Verification |
|------|--------|--------------|
| 5.1 | Set phase to `'SETTINGS_ONLY'` | Settings page shows new guide |
| 5.2 | Test Settings flow | Connect from Settings works |
| 5.3 | Test existing Welcome flow | Still uses old ConnectModal |
| 5.4 | Set phase to `'ENABLED'` | All entry points use guide |
| 5.5 | Test Welcome flow | Guide appears correctly |
| 5.6 | E2E tests updated | Cover new flows |

**Deliverables:**
- Feature fully rolled out
- All flows tested
- E2E tests passing

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `src/core/features.js` | Feature flag system |
| `src/views/OpenRouterGuideView.js` | Guide view with step-by-step instructions |
| `src/views/ConnectionConfirmedView.js` | Success celebration screen |
| `tests/unit/features.test.js` | Unit tests for feature flags |

### Modified Files

| File | Changes |
|------|---------|
| `src/core/router.js` | Add routes for new views |
| `src/views/SettingsView.js` | Check feature flag, link to guide |
| `src/views/WelcomeView.js` | Check feature flag, link to guide |
| `src/components/ConnectModal.js` | Check feature flag (optional) |
| `src/main.js` | Handle OAuth callback for new flow |

---

## Testing Strategy

### Unit Tests

```javascript
// tests/unit/features.test.js
describe('Feature Flags', () => {
  test('DISABLED phase returns false for all contexts', () => {
    // ...
  });

  test('SETTINGS_ONLY returns true only for settings context', () => {
    // ...
  });

  test('ENABLED returns true for all contexts', () => {
    // ...
  });
});
```

### E2E Tests

```javascript
// tests/e2e/openrouter-guide.spec.js (NEW)
describe('OpenRouter Guide Flow', () => {
  test.beforeEach(() => {
    // Set feature flag to ENABLED
  });

  test('Settings → Guide → OpenRouter', async ({ page }) => {
    // Navigate to settings
    // Click "Connect with OpenRouter"
    // Verify guide page appears
    // Verify step cards visible
  });

  test('Guide "I\'ll do it later" returns to home', async ({ page }) => {
    // Navigate to guide
    // Click "I'll do it later"
    // Verify at homepage with sample quizzes
  });

  test('Connection confirmed screen after OAuth', async ({ page }) => {
    // Mock OAuth callback
    // Verify celebration screen appears
    // Click "Start Your First Quiz"
    // Verify at homepage
  });
});
```

### Manual Testing Checklist

**Phase 1 (DISABLED):**
- [ ] New routes registered but not accessible from UI
- [ ] Existing Welcome flow unchanged
- [ ] Existing Settings flow unchanged
- [ ] All 18 E2E tests pass

**Phase 2 (SETTINGS_ONLY):**
- [ ] Settings → "Connect with OpenRouter" → Guide view
- [ ] Guide view renders all 4 steps
- [ ] "Continue to OpenRouter" opens OAuth
- [ ] "I'll do it later" returns to homepage
- [ ] Welcome screen still uses old ConnectModal
- [ ] OAuth callback → ConnectionConfirmed → Homepage

**Phase 3 (ENABLED):**
- [ ] Welcome → "Connect to AI Provider" → Guide view
- [ ] Settings flow still works
- [ ] Homepage prompt (if triggered) → Guide view
- [ ] All entry points consistent

---

## Design Specifications

### Step Card Illustrations

Each step card has a simplified illustration showing what the user will see:

| Step | Illustration Style | Key Element |
|------|-------------------|-------------|
| **1. Sign Up** | Browser window with header | "Sign Up" button highlighted |
| **2. Create Account** | Login modal | Google/GitHub buttons + email field |
| **3. Skip Payment** | Payment screen (blurred) | "OpenRouter" back link highlighted with "Click here to skip!" tooltip |
| **4. Authorize** | Auth request modal | "Authorize" button highlighted |

### Color Usage

```javascript
// Primary action buttons
bg-primary hover:bg-primary-dark

// Info box (Free Access)
bg-primary/10 border-primary/20

// Step number circles
bg-primary/20 text-primary  // Normal steps
bg-primary text-white        // Highlighted step (Step 3)

// Step 3 highlight border
border-2 border-primary ring-4 ring-primary/10

// Warning/crucial box (Step 3)
bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500
```

### Typography

```javascript
// Page title
text-3xl font-bold

// Subtitle
text-base text-subtext-light dark:text-subtext-dark

// Section headers
text-lg font-bold

// Step titles
text-lg font-semibold

// Body text
text-sm text-subtext-light dark:text-subtext-dark
```

---

## Accessibility Considerations

| Aspect | Implementation |
|--------|----------------|
| **Keyboard navigation** | All buttons focusable, logical tab order |
| **Screen readers** | Proper aria-labels for icons and illustrations |
| **Color contrast** | All text meets WCAG AA standards |
| **Reduced motion** | Animations respect `prefers-reduced-motion` |
| **Touch targets** | All buttons minimum 44x44px |

---

## Success Criteria

**Feature complete when:**

- [ ] Feature flag system implemented and tested
- [ ] OpenRouter Guide view matches mockup design
- [ ] ConnectionConfirmed view shows celebration
- [ ] All entry points (Welcome, Settings) route to guide
- [ ] "I'll do it later" returns to homepage with samples
- [ ] OAuth flow works end-to-end with new routing
- [ ] Feature can be toggled between phases
- [ ] All E2E tests pass (existing + new)
- [ ] No regressions in existing functionality
- [ ] Works on mobile devices (responsive)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **Breaking existing users** | Feature flags allow instant rollback |
| **OAuth callback URL changes** | Keep existing callback, just change redirect after |
| **Illustrations load slowly** | Use CSS illustrations (mockup style) or inline SVG |
| **Users still confused** | Step 3 is heavily highlighted with warning box |

---

## Future Enhancements

After initial implementation, consider:

1. **Video walkthrough** - Short video showing the process
2. **Progress indicator** - Show which step user is on (if detectable)
3. **Localization** - Translate guide to other languages
4. **A/B testing** - Compare conversion rates with old flow

---

## References

- **Mockup Files:** `docs/product-info/mockups/stitch_quiz_generator/`
- **Phase 3.6 (OpenRouter):** `docs/learning/epic03_quizmaster_v2/PHASE3.6_OPENROUTER.md`
- **Phase 3.6.1 (Sample Quizzes):** `docs/learning/epic03_quizmaster_v2/PHASE3.6.1_SAMPLE_QUIZZES.md`
- **Current WelcomeView:** `src/views/WelcomeView.js`
- **Current SettingsView:** `src/views/SettingsView.js`

---

## Related Documentation

- [Epic 3 Plan](../epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md)
- [Parking Lot README](./README.md)
- [OpenRouter OAuth PKCE Docs](https://openrouter.ai/docs/use-cases/oauth-pkce)

---

**Last Updated:** 2025-12-19
**Author:** Claude Code
**Status:** Ready for Review
