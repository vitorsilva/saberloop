# Phase 60: AdSense Monetization - Learning Notes

**Status:** In Progress
**Started:** 2026-01-07
**Branch:** `feature/phase60-adsense`
**Worktree:** `demo-pwa-app-phase60`

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

---

## Checklist

### 60.1 AdSense Account Setup
- [x] Check for existing AdSense account
- [x] Complete AdSense sign-up
- [x] Get publisher ID: `ca-pub-9849708569219157`
- [ ] Complete payment info (PAGAMENTOS)
- [x] Add verification script to index.html
- [x] Create ads.txt
- [x] Deploy to production
- [ ] Validate site in AdSense dashboard
- [ ] Wait for Google approval

### Remaining Phases
- [ ] 60.2 Update Privacy Policy
- [ ] 60.3 Create AdManager utility
- [ ] 60.4 Add ad containers to loading views
- [ ] 60.5 Add ad styles
- [ ] 60.6 Integrate into quiz flow
- [ ] 60.7 Add i18n translations
- [ ] 60.8 Add feature flag
- [ ] 60.9 Write unit tests
- [ ] 60.9 Write E2E tests
- [ ] 60.10 Submit for AdSense review
- [ ] 60.11 (Post-approval) Add real ad unit IDs
