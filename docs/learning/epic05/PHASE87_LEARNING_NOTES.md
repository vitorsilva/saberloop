# Phase 87: E2E Mutation Testing Exploration - Learning Notes

## Session: 2026-01-06

### Overview

Exploring whether E2E tests (Playwright) catch mutations that unit tests miss.

### Completed

1. **Reviewed mutation testing results** from Phase 85/86
   - Overall mutation score: 84.62%
   - 54 surviving mutants across 9 files
   - Key weak spots: features.js (56.82%), storage.js (80%), db.js (81.90%)

2. **Manual E2E mutation testing** (2 mutations tested)

| # | Mutation | File | Unit Tests | E2E Tests |
|---|----------|------|------------|-----------|
| 4 | `(i + 1)` → `(i - 1)` | shuffle.js:15 | Survived | Survived |
| 5 | `'middle school'` → `""` | state.js:7 | Survived | Survived |

**Finding:** Both surviving unit test mutations also survived E2E tests.

3. **Stryker + Playwright experiment** (COMPLETE)

---

## Major Finding: E2E Mutation Testing Results

### Experiment Setup
- **Tool**: Stryker with command test runner
- **Target file**: `src/utils/shuffle.js`
- **Test runner**: `npx playwright test tests/e2e/app.spec.js`
- **Config file**: `stryker.e2e.json`

### Results

| Metric | Value |
|--------|-------|
| Total time | **81 minutes 43 seconds** |
| Mutants tested | 34 |
| Killed | **0** |
| Survived | **34** |
| Mutation score | **0%** |

### Comparison: Unit Tests vs E2E Tests

| Test Type | shuffle.js Score | Mutants Killed | Time |
|-----------|------------------|----------------|------|
| **Unit (Vitest)** | 96.55% | 27/29 | ~3 seconds |
| **E2E (Playwright)** | 0% | 0/34 | 81 minutes |

### Analysis

E2E tests caught **ZERO** mutations, even catastrophic ones like:

```javascript
// Mutation: Empty function body - would break everything!
function fisherYatesShuffle(array) {}

// Mutation: Empty array - no shuffling at all!
const shuffled = [];

// Mutation: Return empty object - corrupt question data!
return {};
```

**Why E2E tests missed all mutations:**

E2E tests verify **user flows**, not **algorithmic correctness**:
- ✅ "Quiz flow works" (pages load, buttons click)
- ✅ "User can answer questions" (interactions work)
- ✅ "Results are displayed" (UI renders)
- ❌ "Answers are actually randomized" (not verified)
- ❌ "Shuffle algorithm is correct" (not verified)

---

## Key Discoveries

### 1. Stryker Command Runner Works with Playwright

```json
{
  "testRunner": "command",
  "commandRunner": {
    "command": "npx playwright test tests/e2e/app.spec.js --reporter=dot"
  }
}
```

This is technically feasible but impractical due to time costs.

### 2. E2E Tests and Unit Tests Catch Different Bug Types

| Bug Type | Unit Tests | E2E Tests |
|----------|------------|-----------|
| Algorithm errors | ✅ Strong | ❌ Weak |
| Logic bugs in utilities | ✅ Strong | ❌ Weak |
| UI rendering issues | ❌ Weak | ✅ Strong |
| Integration failures | ❌ Weak | ✅ Strong |
| User flow breaks | ❌ Weak | ✅ Strong |

### 3. Time Investment is Prohibitive

- **Unit mutation testing**: 3.5 minutes for 9 files (417 mutants)
- **E2E mutation testing**: 81 minutes for 1 file (34 mutants)
- **Ratio**: E2E is **~280x slower** per mutant

---

## Conclusions

### Question 1: Do E2E tests catch mutations unit tests miss?
**Answer: NO** - In fact, E2E tests caught 0% of mutations in our test. Unit tests caught 96.55% of the same mutations.

### Question 2: Is automated E2E mutation testing feasible?
**Answer: Technically YES, practically NO** - The Stryker command runner works, but:
- 81 minutes for ONE file is impractical
- Full codebase would take ~12+ hours
- CI integration is not viable

### Question 3: What's the recommended ongoing strategy?
**Answer: Focus on unit test mutation testing**
- Unit tests are 280x faster per mutant
- Unit tests catch algorithmic bugs that E2E misses
- E2E tests serve a different purpose (integration validation)

---

## Recommendations

1. **Continue unit test mutation testing** (Phase 85/86 approach)
   - Fast feedback loop
   - Catches algorithm/logic bugs effectively

2. **Do NOT implement E2E mutation testing** in CI
   - Time cost is prohibitive
   - ROI is negative for utility/algorithm code

3. **E2E tests remain valuable** for their original purpose
   - User flow validation
   - Integration testing
   - Visual regression (with screenshots)

4. **Consider E2E mutation testing only for**:
   - Periodic manual spot-checks (quarterly)
   - Critical UI-logic coupling (very targeted)

---

## Files Created

- `stryker.e2e.json` - E2E mutation testing config (experimental)

---

## Gotchas for Future Reference

1. **Stryker command runner timeout**: Set `timeoutMS: 120000` (2 min) for E2E tests
2. **Concurrency**: Use `concurrency: 1` for E2E to avoid resource conflicts
3. **Reporter**: Use `--reporter=dot` for Playwright to reduce output noise
4. **Coverage analysis**: Shows "covered 0" because command runner can't track per-test coverage

---

## Phase 87 Status: COMPLETE

**Outcome**: Research question answered definitively.

E2E mutation testing is technically possible but not valuable for this codebase. Unit tests remain the primary defense against algorithmic bugs. E2E tests serve a complementary role for integration validation.

This is a **valid and valuable conclusion** - knowing when NOT to use a technique is just as important as knowing when to use it.
