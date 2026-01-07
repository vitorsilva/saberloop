# Phase 60: AdSense Monetization - Learning Notes

**Status:** Awaiting AdSense Approval (implementation complete)
**Started:** 2026-01-07
**Branch:** `feature/phase60-adsense`
**Worktree:** `demo-pwa-app-phase60`

**Summary:** All implementation and testing complete. Waiting 1-7 days for Google AdSense approval before adding real ad unit IDs (Phase 60.11).

---

## Session: 2026-01-07

### Setup: Git Worktree for Parallel Development

**Problem:** Epic 6 (Phase 1 - Quiz Sharing) is being developed in parallel by another agent on branch `feature/phase1-quiz-sharing`. Running `git checkout` would disrupt that work.

**Solution:** Git worktrees allow multiple branches checked out simultaneously in separate directories.

**Commands used:**
```bash
# Check current branches
git branch

# Create worktree with new branch based on main
git worktree add ../demo-pwa-app-phase60 -b feature/phase60-adsense main
```

**Result:**
| Directory | Branch | Purpose |
|-----------|--------|---------|
| `demo-pwa-app` | `feature/phase1-quiz-sharing` | Epic 6 (other agent) |
| `demo-pwa-app-phase60` | `feature/phase60-adsense` | Epic 7 Phase 60 (this work) |

**Learning:** Worktrees are essential for parallel feature development on the same codebase. Each worktree is a full working directory linked to the same .git repository.

### Worktree Setup Gotchas

**Problem 1: `vite` not recognized when running build**
```
'vite' is not recognized as an internal or external command
```
- **Cause:** `node_modules` is not shared between worktrees - each directory needs its own
- **Fix:** Run `npm install` in the new worktree before building

**Problem 2: FTP deployment fails - missing credentials**
- **Cause:** `.env` file is gitignored, so it's not present in new worktree
- **Fix:** Copy `.env` from original project:
  ```bash
  copy "C:\Users\omeue\source\repos\demo-pwa-app\.env" "C:\Users\omeue\source\repos\demo-pwa-app-phase60\.env"
  ```

**Worktree Setup Checklist:**
1. Create worktree: `git worktree add <path> -b <branch> <base>`
2. Change to new directory: `cd <path>`
3. Install dependencies: `npm install`
4. Copy environment files: `copy ../<original>/.env .env`
5. Now ready to build/deploy

---

### Progress

#### 60.1 AdSense Account Setup (In Progress)

**Completed:**
- [x] Checked for existing AdSense account - none found for vitorsilva.com@gmail.com
- [x] Started AdSense sign-up process
- [x] Registered site: `https://saberloop.com`
- [x] Selected country: Portugal
- [x] Opted in for personalized help and performance suggestions
- [x] Accepted terms and conditions
- [x] Reached AdSense dashboard
- [x] Added verification script to `index.html` (line 19-21)
- [x] Created `public/ads.txt` with publisher ID
- [x] Committed changes: `feat(monetization): add AdSense verification script and ads.txt`
- [x] Deployed to production (saberloop.com)

**Publisher ID obtained:** `ca-pub-9849708569219157`

**Files modified:**
- `index.html` - Added AdSense script in `<head>`
- `public/ads.txt` - Created with Google AdSense entry

**Remaining onboarding tasks (in AdSense dashboard):**
1. **PAGAMENTOS** (Payments) - Required - Enter personal/tax info
2. **ANÚNCIOS** (Ads) - Optional - Preview ad appearance
3. **SITES** - ⏳ Pending verification - Script deployed, awaiting Google crawl

### Decisions Made

- Using `vitorsilva.com@gmail.com` for AdSense account
- Domain registered as `saberloop.com` (root domain, not /app/ path)
- Using git worktree for parallel development with Epic 6

### Next Steps

1. Complete AdSense payment info (PAGAMENTOS)
2. Add verification script to index.html
3. Create ads.txt file
4. Verify site ownership

---

## Difficulties & Solutions

### Parallel Development Challenge
- **Problem:** Two epics being developed simultaneously on same codebase
- **Solution:** Git worktrees - separate directories, same repository
- **Learning:** Always consider worktrees when multiple features are in progress

### AdSense Verification Failed - Wrong Deployment Location
- **Problem:** AdSense validation failed with "Não foi possível validar o seu site"
- **Root Cause:** App deploys to `/app/` subdirectory, but AdSense crawls the ROOT domain
  - AdSense script was in `index.html` (app) but not in `landing/index.html` (root)
  - `ads.txt` was at `saberloop.com/app/ads.txt` instead of `saberloop.com/ads.txt`
- **Fix:**
  1. Added AdSense script to `landing/index.html`
  2. Created `landing/ads.txt` (deploys to root)
  3. Deployed landing page with `npm run deploy:landing`
- **Learning:** When a site has separate landing page and app deployments:
  - `ads.txt` MUST be at root domain level
  - Verification scripts should be on the page Google will crawl (usually root)
  - Check where Google is actually looking, not where your app lives

---

## Learnings

### Git Worktrees
- `git worktree add <path> -b <branch> <base>` creates new worktree with new branch
- Each worktree is independent but shares git history
- Useful for parallel feature development or quick bug fixes

### AdSense Setup
- Requires live HTTPS site
- Country selection affects payment methods and tax requirements
- Publisher ID format: `ca-pub-XXXXXXXXXX` (appears in dashboard URL)
- Three onboarding steps: Payments, Ads preview, Site verification

### GDPR Consent (EU Requirement)
- AdSense requires a Consent Management Platform (CMP) for EU/UK/Swiss users
- Google provides a free built-in CMP with 2 or 3 options
- Option 1 (simplest): "Consent" + "Manage options"
- Option 2: "Consent" + "Don't consent" + "Manage options"
- Option 3: Use external CMP (Cookiebot, OneTrust, etc.)
- The consent banner is automatically shown to EU users
- No additional code needed - handled by the AdSense script

---

## Checklist

### 60.1 AdSense Account Setup
- [x] Check for existing AdSense account
- [x] Complete AdSense sign-up
- [x] Get publisher ID: `ca-pub-9849708569219157`
- [ ] Complete payment info (PAGAMENTOS)
- [x] Add verification script to index.html (app)
- [x] Add verification script to landing/index.html (root) - **required for validation**
- [x] Create ads.txt in public/ (app)
- [x] Create ads.txt in landing/ (root) - **required for validation**
- [x] Deploy app to production
- [x] Deploy landing page to production
- [x] Validate site in AdSense dashboard ✅
- [x] Set up GDPR consent banner (Google CMP with 2 options)
- [ ] Wait for Google approval (site review) - **IN PROGRESS** (1-7 days typical)

### 60.2 Privacy Policy Update
- [x] Added "Advertising" section to `landing/privacy.html`
- [x] Disclosed Google AdSense usage
- [x] Listed what data cookies collect
- [x] Added user opt-out options (Google Ads Settings, aboutads.info)
- [x] Mentioned consent banner
- [x] Updated "Last updated" date to January 7, 2026

### 60.3 AdManager Utility
- [x] Created `src/utils/adManager.js`
- [x] Functions: `canLoadAds`, `loadAd`, `hideContainer`, `resetForNavigation`, `initAdManager`
- [x] Features: duplicate prevention, offline handling, SPA navigation support
- [x] Placeholder mode until AdSense approval (no slot IDs = ads hidden)

### 60.8 Feature Flag (done early)
- [x] Added `SHOW_ADS` to `src/core/features.js`
- [x] Phase: ENABLED
- [x] AdManager checks this flag before loading ads

### 60.4 Ad Containers in Views
- [x] Added ad container div to `src/views/LoadingView.js`
- [x] Import `loadAd` and `resetForNavigation` from adManager
- [x] Call `loadAd('quiz-loading-ad', 'quizLoading')` after view renders
- [x] Call `resetForNavigation()` in cleanup method

### 60.5 Ad Styles
- [x] Added `.ad-container` styles to `src/styles/main.css`
- [x] Responsive sizing (336px desktop, 320px mobile)
- [x] Empty state handling (hidden when no ad)

### 60.6 Quiz Flow Integration
- [x] AdManager initialized in `src/main.js`
- [x] LoadingView loads ad when user is waiting for quiz generation
- [x] Ad state reset on navigation

### 60.7 i18n Translations
- [x] **Skipped** - Not needed
- Reason: Ad container is filled by Google AdSense, no custom text displayed
- Google handles ad localization internally

### 60.9 Testing
- [x] Unit tests: 21 tests in `src/utils/adManager.test.js`
  - canLoadAds: feature flag, offline, adsbygoogle checks
  - loadAd: container not found, no slot ID, duplicate prevention, successful load
  - hideContainer/showContainer: visibility and content management
  - resetForNavigation: clears loaded ads tracking
  - initAdManager: registers online/offline listeners
  - getPublisherId/setAdSlot: configuration functions
- [x] E2E tests: 3 tests in `tests/e2e/ads.spec.js`
  - Ad container exists in LoadingView with correct CSS class
  - Ad container behavior when offline (empty/hidden)
  - Loading UI coexists with ad container

**Test Results:**
- Unit tests: 21/21 passing (included in 436 total)
- E2E tests: 3/3 passing

### Remaining Phases
- [ ] 60.11 (Post-approval) Add real ad unit IDs - waiting for Google approval (1-7 days)
