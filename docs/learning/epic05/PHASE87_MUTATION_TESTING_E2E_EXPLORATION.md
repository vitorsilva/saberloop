# Phase 87: E2E Mutation Testing Exploration (Wave 3)

**Status:** Experimental / Research
**Priority:** Low (Exploratory)
**Estimated Effort:** 1-2 sessions
**Created:** 2024-12-XX
**Updated:** 2024-12-30

## Session Log

| Date | Status | Notes |
|------|--------|-------|
| 2024-12-30 | **Moved to Epic 5** | Promoted from parking lot to active epic |

---

## Overview

Explore the feasibility and value of mutation testing with E2E tests (Playwright). This is an **experimental/research phase** to understand what's possible, not to implement a production solution.

**Key Goal:** Answer "Do E2E tests catch mutations that unit tests miss?"

---

## What You'll Learn

### New Technologies & Concepts

1. **Manual Mutation Testing** - Hand-crafted mutations to validate test effectiveness
2. **E2E Test Quality Assessment** - Understanding what E2E tests actually verify
3. **Test Strategy Gaps** - Finding holes in test coverage at integration level
4. **Performance Tradeoffs** - Why mutation testing E2E tests is challenging
5. **Research Methodology** - How to explore experimental testing approaches
6. **Tool Limitations** - Understanding when tools don't exist yet

---

## Prerequisites

Before starting this phase, you should have:

- ✅ **Phase 85** complete (Mutation testing Wave 1)
- ✅ **Phase 86** complete (Mutation testing Wave 2)
- ✅ E2E tests with Playwright working
- ✅ Understanding of mutation testing concepts
- ✅ Curiosity and willingness to experiment!

---

## Objective

Explore the feasibility and value of mutation testing with E2E tests (Playwright). This is an **experimental phase** to understand what's possible, not necessarily to implement a production solution.

---

## Background: The Challenge

### Why This is Difficult

Stryker does **not** officially support Playwright as a test runner. From [Sentry's engineering blog](https://sentry.engineering/blog/js-mutation-testing-our-sdks):

> "The obvious problem was that we couldn't get mutation testing to run in our integration and E2E tests."

From [Stryker GitHub discussions](https://github.com/stryker-mutator/stryker-js/issues/2483):

> "Imagine mutation testing a test suite that takes 2 hours to run normally! Mutation testing seems to be more suited to low-level tests because of their speed."

### The Math Problem

| Test Type | Avg Test Time | 100 Mutants | 500 Mutants |
|-----------|---------------|-------------|-------------|
| Unit (Vitest) | 5ms | 30 sec | 2.5 min |
| E2E (Playwright) | 3 sec | 5 min | 25 min |

E2E tests are **600x slower** than unit tests. This makes traditional mutation testing impractical.

---

## Exploration Goals

This phase is about **learning and assessment**, not production implementation.

### Questions to Answer

1. **Feasibility**: Can we run mutations against Playwright tests at all?
2. **Performance**: What's the realistic runtime?
3. **Value**: Do E2E tests catch different mutations than unit tests?
4. **Approach**: What's the best strategy for our codebase?

---

## Exploration Approaches

### Approach A: Manual Mutation Testing (Recommended Start)

Instead of automated tools, manually introduce mutations and verify E2E tests catch them.

**Process:**
1. Pick a mutation from Stryker's unit test report (one that was killed)
2. Manually apply that mutation to the source code
3. Run Playwright tests
4. Document whether E2E tests caught it
5. Revert the mutation
6. Repeat with 5-10 mutations

**Example mutations to test:**
```javascript
// Mutation 1: gradeProgression.js - Change threshold
- if (score >= PASSING_THRESHOLD) {
+ if (score > PASSING_THRESHOLD) {

// Mutation 2: shuffle.js - Break shuffle algorithm
- [array[i], array[j]] = [array[j], array[i]];
+ // Removed: no swap

// Mutation 3: formatters.js - Wrong date format
- return date.toLocaleDateString(locale);
+ return date.toISOString();
```

**What we learn:**
- Which mutations are caught by E2E but not unit tests
- Which unit-tested behaviors are also validated at E2E level
- Where E2E tests are weak

---

### Approach B: Custom Stryker Runner (Advanced)

Write a custom Stryker test runner plugin for Playwright.

**Complexity:** High
**Time:** 4-8 hours minimum
**Viability:** Possible but not recommended for this project

**If pursued, key components:**
1. `stryker-playwright-runner` package
2. Test discovery (parse Playwright test files)
3. Test execution (spawn Playwright process)
4. Result parsing (convert Playwright output to Stryker format)

**Reference:** [Stryker Plugin Development](https://stryker-mutator.io/docs/stryker-js/plugins/)

---

### Approach C: Hybrid Strategy (Practical)

Use the existing Stryker + Vitest setup, but add a manual E2E validation step.

**Workflow:**
1. Run `npm run test:mutation` (unit tests)
2. Identify surviving mutants
3. Ask: "Would an E2E test catch this?"
4. If yes → mutation is actually "soft killed" by E2E
5. Document in mutation report

**Example documentation:**
```markdown
## Surviving Mutants Analysis

| Mutant | File | Line | Unit Killed | E2E Would Catch |
|--------|------|------|-------------|-----------------|
| M1 | shuffle.js | 24 | No | Yes (quiz displays wrong order) |
| M2 | formatters.js | 15 | No | Yes (date shows wrong format) |
| M3 | state.js | 45 | No | No (internal optimization) |
```

---

## Implementation Plan

### Step 1: Select Mutation Sample (15 min)

From Phase 85/86 Stryker report, identify:
- 3 mutations killed by unit tests
- 3 mutations that survived unit tests
- 3 mutations from core business logic

### Step 2: Manual E2E Validation (1-2 hours)

For each mutation:

```bash
# 1. Apply mutation manually (edit source file)

# 2. Run E2E tests
npm run test:e2e

# 3. Record results
# - Did any test fail?
# - Which test(s)?
# - What was the failure message?

# 4. Revert mutation
git checkout src/path/to/file.js
```

### Step 3: Document Findings (30 min)

Create analysis document:

```markdown
## E2E Mutation Coverage Analysis

### Summary
- Mutations tested: 9
- Caught by E2E: X
- Missed by E2E: Y
- Already killed by unit tests: Z

### Detailed Results
[Table with each mutation and result]

### Conclusions
- E2E tests catch: [types of mutations]
- E2E tests miss: [types of mutations]
- Recommendation: [continue exploring / not worth it]
```

### Step 4: Assess Custom Runner Viability (Optional, 1-2 hours)

If results are promising, explore:
1. Read Stryker plugin documentation
2. Examine existing test runner implementations
3. Estimate effort for Playwright runner
4. Decide: build, wait for official support, or skip

---

## Expected Outcomes

### Optimistic Scenario
- E2E tests catch 50%+ of surviving unit test mutations
- Clear patterns emerge (E2E catches UI-visible mutations)
- Justifies periodic manual E2E mutation validation

### Realistic Scenario
- E2E tests catch 20-40% of mutations
- Overlap is high with unit tests (redundant coverage)
- Automated E2E mutation testing not worth the effort

### Pessimistic Scenario
- E2E tests catch few mutations unit tests miss
- Runtime is prohibitive for any automation
- Conclusion: Unit mutation testing is sufficient

---

## Deliverables

- [ ] 9 mutations manually tested against E2E
- [ ] Analysis document with findings
- [ ] Recommendation: pursue further or stop
- [ ] `PHASE87_LEARNING_NOTES.md` documenting the exploration

---

## Success Criteria

This phase succeeds if we can answer:
1. ✓ Do E2E tests catch mutations unit tests miss?
2. ✓ Is automated E2E mutation testing feasible for us?
3. ✓ What's the recommended ongoing strategy?

The answer might be "E2E mutation testing is not worth it" - and that's a valid outcome!

---

## Learning Objectives

1. **Mutation Testing Limitations**
   - Performance vs thoroughness tradeoffs
   - When automation isn't worth it

2. **E2E Testing Value**
   - What E2E tests actually validate
   - Overlap with unit tests

3. **Research Methodology**
   - Structured exploration
   - Evidence-based decision making
   - Knowing when to stop

4. **Tool Ecosystem**
   - Stryker's plugin architecture
   - Why Playwright support doesn't exist
   - Community patterns

---

## Alternative: Playwright Component Testing

If full E2E is too slow, consider Playwright's component testing mode:

```javascript
// Component test (faster than full E2E)
import { test, expect } from '@playwright/experimental-ct-react';
import { QuizCard } from './QuizCard';

test('displays shuffled answers', async ({ mount }) => {
  const component = await mount(<QuizCard answers={['A', 'B', 'C', 'D']} />);
  // Test component in isolation
});
```

**Note:** This requires component testing setup, which may be its own phase.

---

## References

- [Stryker GitHub - E2E Discussion](https://github.com/stryker-mutator/stryker-js/issues/2483)
- [Sentry's Mutation Testing Experience](https://sentry.engineering/blog/js-mutation-testing-our-sdks)
- [Stryker Plugin Development](https://stryker-mutator.io/docs/stryker-js/plugins/)
- [Playwright Component Testing](https://playwright.dev/docs/test-components)

---

## Decision Tree

After completing this phase:

```
Did E2E catch mutations unit tests missed?
├── YES (>30%) → Consider periodic manual validation
│   └── Is automated E2E mutation feasible?
│       ├── YES → Consider Phase 88: Custom Stryker Plugin
│       └── NO → Document manual process, use periodically
│
└── NO (<30%) → E2E mutation testing not valuable
    └── Focus on improving unit test quality instead
```

---

## Notes

- This is **exploratory research**, not production implementation
- "Not worth it" is a valid and valuable conclusion
- Manual testing gives insights automation can't
- Don't over-invest in tooling before proving value
- Consider revisiting if Stryker adds Playwright support

---

## Dependencies

- Phase 85 complete (Stryker baseline)
- Phase 86 complete (full mutation scope)
- Playwright E2E tests working
