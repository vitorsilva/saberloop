# Mutation Testing Plan: Stryker as an Exploratory Tool

## Purpose

Use mutation testing to validate unit test quality by uncovering:
- Weak assertions that don't catch behavior changes
- Missing edge case coverage
- "Coverage theater" (tests that execute but don't verify)

## Thesis

Mutation testing is an **exploratory tool**, not a CI gate. Run it manually when you want to evaluate whether existing unit tests are actually catching edge cases and behavior changes.

## Scope

**In Scope (files with existing tests):**
- `src/utils/errorHandler.js`
- `src/utils/logger.js`
- `src/utils/network.js`
- `src/utils/settings.js`
- `src/db/db.js`
- `src/api/openrouter-client.js`
- `src/api/openrouter-auth.js`
- `src/app.js`

**Out of Scope:**
- Views (no unit tests, tested via E2E)
- Service worker (excluded from unit testing)
- Config files

---

## Phase 1: Setup

**Install Stryker with Vitest runner:**
```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
```

**Create `stryker.config.mjs`:**
```javascript
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  timeoutMS: 30000,
  concurrency: 2,
  // Default mutate pattern - override via CLI for exploration
  mutate: ['src/**/*.js', '!src/**/*.test.js', '!src/views/**']
};
```

**Add npm script for convenience:**
```json
{
  "scripts": {
    "mutate": "stryker run",
    "mutate:file": "stryker run --mutate"
  }
}
```

---

## Phase 2: Exploration Workflow

**Single-file exploration (primary use case):**
```bash
# Explore test quality for one module
npm run mutate:file "src/utils/errorHandler.js"

# Open report
open reports/mutation/html/index.html
```

**Interpreting results:**

| Mutation Score | Interpretation |
|----------------|----------------|
| 90-100% | Tests are thorough |
| 70-89% | Some gaps, review survivors |
| 50-69% | Significant weaknesses |
| <50% | Tests need major improvement |

**For each surviving mutant, ask:**
1. Is this an equivalent mutant? (mutation doesn't change behavior)
2. Should my tests catch this?
3. What assertion would kill it?

---

## Phase 3: Learning Loop

```
┌─────────────────────────────────────────┐
│  1. Pick a file with tests              │
│              ↓                          │
│  2. Run mutation testing                │
│              ↓                          │
│  3. Review surviving mutants            │
│              ↓                          │
│  4. Decide: strengthen test or ignore?  │
│              ↓                          │
│  5. Document insights                   │
│              ↓                          │
│  6. Repeat for next file                │
└─────────────────────────────────────────┘
```

---

## Suggested Exploration Order

| Order | File | Rationale |
|-------|------|-----------|
| 1 | `errorHandler.js` | Clear input/output, good learning start |
| 2 | `settings.js` | Simple state logic |
| 3 | `network.js` | Event handling edge cases |
| 4 | `logger.js` | Conditional logic |
| 5 | `db.js` | Async operations, more complex |
| 6 | `openrouter-client.js` | API integration, most complex |

---

## What NOT to Do

- **Don't** chase 100% mutation score (diminishing returns)
- **Don't** add to CI pipeline (defeats exploratory purpose)
- **Don't** run on entire codebase regularly (too slow, too noisy)
- **Don't** kill equivalent mutants (wastes time)

---

## Success Criteria

After exploring each file:
- [ ] Understand which mutants survived and why
- [ ] Identified at least one test improvement opportunity
- [ ] Documented insights about test quality patterns
- [ ] Made informed decision about which gaps matter

---

## Future Considerations

Once comfortable with the tool:
- Consider periodic "health check" runs before releases
- Track mutation scores over time for critical modules
- Use insights to establish team testing guidelines

---

## Tool Choice: Stryker Mutator

**Why Stryker:**
- Most mature mutation testing framework for JavaScript
- Native Vitest plugin (`@stryker-mutator/vitest-runner`)
- Excellent HTML report generation
- Supports incremental mutation testing
- Active community and documentation

**Alternatives considered:**
- mutode: Abandoned (last update 2019)
- Native Vitest support: Does not exist

---

## References

- [Stryker Mutator Documentation](https://stryker-mutator.io/)
- [Vitest Runner Plugin](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)
