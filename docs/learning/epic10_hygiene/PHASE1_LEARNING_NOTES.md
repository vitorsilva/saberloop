# Phase 1: Feature Flag Cleanup - Learning Notes

**Phase:** Feature Flag Cleanup (Wave 1)
**Status:** In Progress
**Started:** 2026-01-09

---

## Progress Tracker

| # | Flag | Status | Date |
|---|------|--------|------|
| 1 | `TELEMETRY` | ✅ Complete | 2026-01-09 |
| 2 | `CONTINUE_TOPIC` | ✅ Complete | 2026-01-09 |
| 3 | `EXPLANATION_FEATURE` | ✅ Complete | 2026-01-09 |
| 4 | `SHARE_FEATURE` | ✅ Complete | 2026-01-09 |
| 5 | `SHARE_QUIZ` | ✅ Complete | 2026-01-09 |
| 6 | `SHOW_USAGE_COSTS` | ✅ Complete | 2026-01-09 |
| 7 | `OPENROUTER_GUIDE` | ✅ Complete | 2026-01-09 |

---

## Baseline

**Before starting cleanup:**
- Unit tests: 726 passing
- E2E tests: 116 passed, 1 failed (pre-existing dark mode flaky test), 3 skipped
- Flags in features.js: 10

**Note:** Copied `.env` to worktree (gitignored file)

---

## Session Log

### Session: 2026-01-09

#### Setup
- [x] Created worktree at `../saberloop-hygiene`
- [x] Ran `npm install`
- [x] Ran baseline tests

#### Completed
- [x] Flag 1: TELEMETRY

#### Difficulties & Solutions

**Problem:** Telemetry tests failed after removing feature flag
**Cause:** Two tests in telemetry.test.js were specifically testing the feature flag behavior ("should not add event when feature flag is disabled", "should not send if disabled")
**Fix:** Removed those 2 tests since they tested the feature flag functionality that no longer exists
**Learning:** When removing a feature flag, also check for tests that specifically test the flag behavior

---

**Problem:** signaling-client test failure (unrelated)
**Cause:** Test expected `https://saberloop.com/party` but got `http://localhost:8080/party` - env config issue
**Fix:** Not fixed - documented as pre-existing issue, not related to our changes
**Learning:** Run baseline tests before making changes to identify pre-existing failures

---

#### Gotchas for Future Reference
- Tests may directly test feature flag behavior - need to remove those tests too
- CONFIG.enabled in telemetry.js is controlled by VITE_TELEMETRY_ENABLED env var, not the feature flag
- Pre-existing test failures should be documented but not block progress

#### Next Steps
- [x] Continue with CONTINUE_TOPIC flag

---

## Flag-Specific Notes

### TELEMETRY
*Notes specific to this flag removal*

---

### CONTINUE_TOPIC
*Notes specific to this flag removal*

---

### EXPLANATION_FEATURE
*Notes specific to this flag removal*

---

### SHARE_FEATURE
*Notes specific to this flag removal*

---

### SHARE_QUIZ
*Notes specific to this flag removal*

---

### SHOW_USAGE_COSTS
*Notes specific to this flag removal*

---

### OPENROUTER_GUIDE
*Notes specific to this flag removal (most complex)*

---

## Final Summary

### Results
- Flags removed: 7 / 7
- Flags remaining: 3 (`SHOW_ADS`, `MODE_TOGGLE`, `PARTY_SESSION`)
- Tests after: Unit 721 passing (5 tests removed: 2 telemetry flag tests, 3 OPENROUTER_GUIDE tests)
- Build: ✅ Pass

### Key Learnings
1. **Tests may test feature flag behavior directly** - Need to remove those tests when removing the flag
2. **Unused imports** - After removing flag usage, clean up any now-unused imports
3. **showConnectModal/startAuth** - Became unused in WelcomeView.js after simplification
4. **features.test.js** - Tests were entirely about OPENROUTER_GUIDE, rewrote to use remaining flags

### Commits Made
1. `refactor: remove TELEMETRY feature flag`
2. `refactor: remove CONTINUE_TOPIC feature flag`
3. `refactor: remove EXPLANATION_FEATURE flag`
4. `refactor: remove SHARE_FEATURE flag`
5. `refactor: remove SHARE_QUIZ feature flag`
6. `refactor: remove SHOW_USAGE_COSTS feature flag`
7. `refactor: remove OPENROUTER_GUIDE feature flag`

### Process Improvements
- Small commits per flag worked well - easy to review and bisect if needed
- Pattern emerged: remove variable → update template → update event listeners → remove from features.js

### Recommendations
- Consider adding a lint rule to detect unused feature flag imports
- Document feature flag lifecycle in CLAUDE.md

---

**Related:**
- [PHASE1_FEATURE_FLAG_CLEANUP.md](./PHASE1_FEATURE_FLAG_CLEANUP.md) - Main plan
- [EPIC10_HYGIENE_PLAN.md](./EPIC10_HYGIENE_PLAN.md) - Parent epic
