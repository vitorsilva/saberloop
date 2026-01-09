# Phase 1: Feature Flag Cleanup - Learning Notes

**Phase:** Feature Flag Cleanup (Wave 1)
**Status:** In Progress
**Started:** 2026-01-09

---

## Progress Tracker

| # | Flag | Status | Date |
|---|------|--------|------|
| 1 | `TELEMETRY` | Pending | |
| 2 | `CONTINUE_TOPIC` | Pending | |
| 3 | `EXPLANATION_FEATURE` | Pending | |
| 4 | `SHARE_FEATURE` | Pending | |
| 5 | `SHARE_QUIZ` | Pending | |
| 6 | `SHOW_USAGE_COSTS` | Pending | |
| 7 | `OPENROUTER_GUIDE` | Pending | |

---

## Baseline

**Before starting cleanup:**
- Unit tests: 726 passing
- E2E tests: 116 passed, 1 failed (pre-existing dark mode flaky test), 3 skipped
- Flags in features.js: 10

**Note:** Copied `.env` to worktree (gitignored file)

---

## Session Log

### Session: [Date]

#### Setup
- [ ] Created worktree at `../saberloop-hygiene`
- [ ] Ran `npm install`
- [ ] Ran baseline tests

#### Completed
- [ ] Flag 1: TELEMETRY
- [ ] Flag 2: CONTINUE_TOPIC
- [ ] ...

#### Difficulties & Solutions

**Problem:** [Description]
**Cause:** [Root cause]
**Fix:** [How it was resolved]
**Learning:** [Key takeaway]

---

**Problem:** [Description]
**Cause:** [Root cause]
**Fix:** [How it was resolved]
**Learning:** [Key takeaway]

---

#### Gotchas for Future Reference
- [Note anything unexpected]
- [Patterns discovered]
- [Things to watch out for]

#### Next Steps
- [ ] Continue with flag X...

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

*To be filled after cleanup is complete*

### Results
- Flags removed: ___ / 7
- Flags remaining: 3 (`SHOW_ADS`, `MODE_TOGGLE`, `PARTY_SESSION`)
- Tests after: Unit ___ passing, E2E ___ passing
- Build: Pass / Fail

### Time Spent
- Setup: ___
- Flag removals: ___
- Testing & verification: ___
- PR & review: ___
- **Total:** ___

### Process Improvements
*What would make this easier next time?*

### Recommendations
*Should we automate detection of stale flags? Other improvements?*

---

**Related:**
- [PHASE1_FEATURE_FLAG_CLEANUP.md](./PHASE1_FEATURE_FLAG_CLEANUP.md) - Main plan
- [EPIC10_HYGIENE_PLAN.md](./EPIC10_HYGIENE_PLAN.md) - Parent epic
