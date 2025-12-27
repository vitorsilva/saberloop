# Phase 85: Mutation Testing Setup (Stryker + Vitest)

**Status:** Ready to Implement
**Priority:** Medium
**Estimated Effort:** 2-3 sessions

## Objective

Configure mutation testing with Stryker to assess test quality beyond code coverage. Mutation testing introduces small changes (mutations) to source code and verifies that tests catch these changes, revealing gaps in test effectiveness.

## Why Mutation Testing?

Traditional code coverage metrics (line, branch, statement) tell you **what code is executed** by tests, but not **how well those tests verify behavior**.

Example: A test might execute a function but never check its return value = 100% coverage but 0% real validation.

Mutation testing addresses this by:
1. Creating mutants (small code changes like `>` → `>=`, `+` → `-`)
2. Running tests against each mutant
3. Reporting which mutants "survived" (tests didn't catch the change)

**Mutation Score = Killed Mutants / Total Mutants × 100%**

---

## Tool Selection

### Why Stryker?

| Criteria | Stryker | Alternatives |
|----------|---------|--------------|
| JavaScript/TypeScript | ✅ Native | Limited |
| Vitest Support | ✅ Official plugin (v7+) | None |
| Active Maintenance | ✅ Dec 2024 updates | Unmaintained |
| Performance Features | ✅ Incremental, per-test | Basic |
| Enterprise Usage | Netflix, Sentry, Google | Unknown |
| GitHub Stars | 2.7k+ | <200 |

**Verdict:** Stryker is the only mature mutation testing tool for JavaScript with Vitest support.

**References:**
- [Stryker Official Site](https://stryker-mutator.io/)
- [Vitest Runner Documentation](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)
- [StrykerJS 7.0 - Vitest Support](https://stryker-mutator.io/blog/announcing-stryker-js-7/)

---

## Scope: Wave 1 (Conservative Start)

Focus on **pure algorithmic logic** with existing strong test coverage:

| File | Lines | Tests | Why Include |
|------|-------|-------|-------------|
| `src/utils/gradeProgression.js` | 54 | ~50 | Pure math, threshold logic |
| `src/utils/shuffle.js` | 74 | ~170 | Fisher-Yates algorithm |
| `src/utils/formatters.js` | 91 | ~150 | Locale-aware formatting |

**Total: ~220 lines of pure logic**

These files are ideal because:
1. Pure functions (no side effects)
2. Strong existing test coverage
3. Clear input/output contracts
4. Quick mutation testing feedback loop

---

## Implementation Plan

### Step 1: Install Stryker (5 min)

```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
```

**Q:** Why `--save-dev`? What's the difference from regular install?

### Step 2: Initialize Stryker Configuration (10 min)

Run the Stryker init wizard:

```bash
npx stryker init
```

When prompted:
- Test runner: **Vitest**
- Coverage analysis: **perTest** (recommended for performance)
- Config format: **JSON**

This creates `stryker.config.json`.

### Step 3: Configure Wave 1 Scope (10 min)

Edit `stryker.config.json` to focus on Wave 1 files:

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "testRunner": "vitest",
  "reporters": ["html", "clear-text", "progress"],
  "coverageAnalysis": "perTest",
  "mutate": [
    "src/utils/gradeProgression.js",
    "src/utils/shuffle.js",
    "src/utils/formatters.js"
  ],
  "vitest": {
    "configFile": "vitest.config.js"
  },
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": null
  },
  "timeoutMS": 10000,
  "concurrency": 4
}
```

**Configuration explained:**
- `mutate`: Files to mutate (Wave 1 only)
- `coverageAnalysis: "perTest"`: Only run tests that cover each mutant (faster)
- `thresholds`: Color coding for results (green/yellow/red)
- `timeoutMS`: Max time per mutant test run
- `concurrency`: Parallel mutant testing

### Step 4: Add npm Script (2 min)

Add to `package.json`:

```json
{
  "scripts": {
    "test:mutation": "stryker run"
  }
}
```

### Step 5: First Run (15-30 min)

Run mutation testing:

```bash
npm run test:mutation
```

**What to expect:**
1. Stryker creates mutants for each file
2. Runs your Vitest tests against each mutant
3. Reports which mutants were killed vs survived
4. Generates HTML report in `reports/mutation/mutation.html`

### Step 6: Analyze Results (20 min)

Open the HTML report and analyze:

```bash
# On macOS
open reports/mutation/mutation.html

# On Linux
xdg-open reports/mutation/mutation.html
```

**Understanding the report:**
- **Killed** (green): Test caught the mutation ✅
- **Survived** (red): Mutation went undetected ❌ → Test gap!
- **No Coverage**: No test runs this code
- **Timeout**: Mutation caused infinite loop

For each surviving mutant, ask:
1. Should this have been caught?
2. What test is missing?
3. Is this a false positive (equivalent mutant)?

### Step 7: Fix Surviving Mutants (Variable)

For each survived mutant:
1. Understand the mutation (what was changed?)
2. Write a test that would fail if that mutation existed
3. Verify the new test kills the mutant

**Example:**
```javascript
// Original
function isGradeReady(score) {
  return score >= 80; // Mutant: score > 80
}

// The mutant score > 80 survives if no test checks score = 80
// Fix: Add test for boundary condition
test('score of exactly 80 should be ready', () => {
  expect(isGradeReady(80)).toBe(true);
});
```

---

## Stryker Mutators (What Gets Changed)

Stryker applies these mutation types to JavaScript:

| Mutator | Original | Mutated |
|---------|----------|---------|
| ArithmeticOperator | `a + b` | `a - b` |
| EqualityOperator | `a === b` | `a !== b` |
| ConditionalExpression | `a > b` | `true`, `false` |
| BlockStatement | `{ code }` | `{ }` |
| BooleanLiteral | `true` | `false` |
| ArrayDeclaration | `[a, b]` | `[]` |
| StringLiteral | `"foo"` | `""` |

---

## Expected Outcomes

### Initial Run (Before Fixes)

| File | Mutants | Killed | Survived | Score |
|------|---------|--------|----------|-------|
| gradeProgression.js | ~15-25 | ? | ? | ? |
| shuffle.js | ~20-30 | ? | ? | ? |
| formatters.js | ~25-40 | ? | ? | ? |
| **Total** | ~60-95 | - | - | - |

**Target Mutation Score: 80%+**

### Interpreting Results

- **>80%**: Excellent test quality
- **60-80%**: Good, but gaps exist
- **<60%**: Significant test gaps

---

## Troubleshooting

### "No tests found for mutant"
- Ensure `coverageAnalysis: "perTest"` is set
- Check that tests import the mutated files directly

### Tests timing out
- Increase `timeoutMS` in config
- Some mutations cause infinite loops (expected)

### Too many mutants
- Wave 1 is intentionally small (~220 lines)
- Use `mutate` array to limit scope

### Performance
- First run is slow (creates baseline)
- Subsequent runs faster with incremental mode
- Consider running mutation tests less frequently than unit tests

---

## Deliverables

- [ ] Stryker installed and configured
- [ ] `stryker.config.json` with Wave 1 scope
- [ ] `npm run test:mutation` script working
- [ ] Initial mutation testing run completed
- [ ] HTML report reviewed and understood
- [ ] Surviving mutants analyzed (at least top 5)
- [ ] 2-3 tests added to kill survived mutants
- [ ] Mutation score >80% for Wave 1 files
- [ ] `PHASE85_LEARNING_NOTES.md` documenting findings

---

## Success Criteria

- [x] Stryker runs successfully with Vitest
- [ ] Wave 1 files achieve >80% mutation score
- [ ] Understand difference between code coverage and mutation score
- [ ] Can interpret mutation testing report
- [ ] Can write tests to kill specific mutants

---

## Learning Objectives

1. **Mutation Testing Concepts**
   - Mutants, killing, surviving
   - Mutation score vs code coverage
   - Equivalent mutants

2. **Stryker Configuration**
   - Test runner plugins
   - Coverage analysis modes
   - Mutator configuration

3. **Test Quality Assessment**
   - Identifying weak tests
   - Boundary condition testing
   - Writing effective assertions

4. **Practical Skills**
   - Running and interpreting mutation reports
   - Prioritizing test improvements
   - Balancing effort vs value

---

## Notes

- Mutation testing is computationally expensive (runs tests many times)
- Run periodically (weekly/monthly), not on every commit
- Focus on pure logic first (highest value, lowest cost)
- Some surviving mutants are false positives (equivalent mutants)
- Don't aim for 100% - diminishing returns after 80-85%

---

## Dependencies

- Phase 80 (Unit Test Coverage) - Provides baseline test coverage
- Vitest already configured

---

## References

- [Stryker Mutator](https://stryker-mutator.io/)
- [Vitest Runner Plugin](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)
- [Mutation Testing Guide](https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/)
- [Sentry's Mutation Testing Experience](https://sentry.engineering/blog/js-mutation-testing-our-sdks)
