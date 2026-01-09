# Phase 1: Feature Flag Cleanup (Wave 1)

**Status:** Planning
**Created:** 2026-01-09
**Branch:** `hygiene/feature-flag-cleanup-wave1`

---

## Objective

Remove feature flags that are permanently ENABLED and no longer serve a purpose. These flags were used for deployment validation but are now technical debt - every check returns `true` unconditionally.

---

## Summary

| Flags to Remove | 7 |
|-----------------|---|
| Flags to Keep | 3 |
| Files Affected | ~8 |
| Risk Level | Low |

---

## Flags to Remove

Each flag has its own detailed plan document:

| # | Flag | Document | Status |
|---|------|----------|--------|
| 1 | `TELEMETRY` | [FLAG_TELEMETRY.md](./FLAG_TELEMETRY.md) | Planning |
| 2 | `CONTINUE_TOPIC` | [FLAG_CONTINUE_TOPIC.md](./FLAG_CONTINUE_TOPIC.md) | Planning |
| 3 | `EXPLANATION_FEATURE` | [FLAG_EXPLANATION_FEATURE.md](./FLAG_EXPLANATION_FEATURE.md) | Planning |
| 4 | `SHARE_FEATURE` | [FLAG_SHARE_FEATURE.md](./FLAG_SHARE_FEATURE.md) | Planning |
| 5 | `SHARE_QUIZ` | [FLAG_SHARE_QUIZ.md](./FLAG_SHARE_QUIZ.md) | Planning |
| 6 | `SHOW_USAGE_COSTS` | [FLAG_SHOW_USAGE_COSTS.md](./FLAG_SHOW_USAGE_COSTS.md) | Planning |
| 7 | `OPENROUTER_GUIDE` | [FLAG_OPENROUTER_GUIDE.md](./FLAG_OPENROUTER_GUIDE.md) | Planning |

**Execution order:** Lowest risk first (single file → multiple files → complex routing)

---

## Flags to Keep (Future Cleanup)

These flags have documented removal criteria - see individual plans:

| Flag | Reason | Removal Plan |
|------|--------|--------------|
| `SHOW_ADS` | Future premium/ad-free tier (Epic 07) | [FLAG_SHOW_ADS.md](./FLAG_SHOW_ADS.md) |
| `MODE_TOGGLE` | Not yet released (Epic 06 Phase 2) | [FLAG_MODE_TOGGLE.md](./FLAG_MODE_TOGGLE.md) |
| `PARTY_SESSION` | Not yet released (Epic 06 Phase 3) | [FLAG_PARTY_SESSION.md](./FLAG_PARTY_SESSION.md) |

---

## Getting Started

### 1. Set Up Worktree

```bash
# From main repo directory
git worktree add -b hygiene/feature-flag-cleanup-wave1 ../saberloop-hygiene main

# Navigate to hygiene worktree
cd ../saberloop-hygiene

# Install dependencies
npm install
```

### 2. Run Baseline Tests

```bash
npm test && npm run test:e2e
```

Document baseline:
- Unit tests: ___ passing
- E2E tests: ___ passing

### 3. Work Through Flags

Follow each flag document in order:
1. [FLAG_TELEMETRY.md](./FLAG_TELEMETRY.md)
2. [FLAG_CONTINUE_TOPIC.md](./FLAG_CONTINUE_TOPIC.md)
3. [FLAG_EXPLANATION_FEATURE.md](./FLAG_EXPLANATION_FEATURE.md)
4. [FLAG_SHARE_FEATURE.md](./FLAG_SHARE_FEATURE.md)
5. [FLAG_SHARE_QUIZ.md](./FLAG_SHARE_QUIZ.md)
6. [FLAG_SHOW_USAGE_COSTS.md](./FLAG_SHOW_USAGE_COSTS.md)
7. [FLAG_OPENROUTER_GUIDE.md](./FLAG_OPENROUTER_GUIDE.md)

### 4. Final Cleanup

After all flags removed:

```bash
# Check for any remaining references
grep -r "isFeatureEnabled" src/ --include="*.js" | grep -v "MODE_TOGGLE\|PARTY_SESSION\|SHOW_ADS"

# Run full test suite
npm test && npm run test:e2e

# Run mutation testing
npm run test:mutation

# Build
npm run build
```

### 5. Create PR

```bash
git push -u origin hygiene/feature-flag-cleanup-wave1
gh pr create --title "refactor(hygiene): remove 7 permanently-enabled feature flags" --body "$(cat <<'EOF'
## Summary

Remove feature flags that are permanently ENABLED and no longer serve their deployment validation purpose.

### Removed Flags
- `TELEMETRY` - CONFIG.enabled is sufficient
- `CONTINUE_TOPIC` - Feature is permanent
- `EXPLANATION_FEATURE` - Feature is permanent
- `SHARE_FEATURE` - Feature is permanent
- `SHARE_QUIZ` - Feature is permanent
- `SHOW_USAGE_COSTS` - Feature is permanent
- `OPENROUTER_GUIDE` - New guide is permanent

### Kept Flags
- `SHOW_ADS` - Future premium tier
- `MODE_TOGGLE` - Not yet released
- `PARTY_SESSION` - Not yet released

## Test Plan
- [x] All unit tests pass
- [x] All E2E tests pass
- [x] Mutation testing passes
- [x] Manual smoke test completed
- [x] No behavior changes

## Documentation
- See `docs/learning/epic10_hygiene/` for detailed plans and learning notes

---
Part of Epic 10: Project Hygiene
EOF
)"
```

### 6. Cleanup Worktree

After PR is merged:

```bash
# From main repo
cd ../demo-pwa-app
git worktree remove ../saberloop-hygiene
git pull origin main
```

---

## Success Criteria

- [ ] 7 flags removed from `src/core/features.js`
- [ ] All `isFeatureEnabled()` calls for removed flags eliminated
- [ ] Only 3 flags remain: `SHOW_ADS`, `MODE_TOGGLE`, `PARTY_SESSION`
- [ ] All tests passing
- [ ] No behavior changes
- [ ] Learning notes captured for each flag
- [ ] PR merged

---

**Related:**
- [PHASE1_LEARNING_NOTES.md](./PHASE1_LEARNING_NOTES.md) - Learning notes for this phase
- [EPIC10_HYGIENE_PLAN.md](./EPIC10_HYGIENE_PLAN.md) - Parent epic
- [Feature Flag Lifecycle](./EPIC10_HYGIENE_PLAN.md#feature-flag-lifecycle-reference) - When to create/remove flags

---

**Last Updated:** 2026-01-09
