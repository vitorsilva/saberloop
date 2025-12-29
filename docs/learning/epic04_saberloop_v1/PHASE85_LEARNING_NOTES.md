# Phase 85: Mutation Testing Setup - Learning Notes

**Status:** In Progress
**Started:** December 29, 2024

---

## Session 1: Concept & Setup

### What We Learned

#### Mutation Testing Concept

**Key insight:** Code coverage tells you what code runs, but not whether your tests actually verify anything.

Example of the problem:
```javascript
function isPassingGrade(score) {
  return score >= 70;
}

// This test achieves 100% coverage but catches ZERO bugs:
test('check grade', () => {
  isPassingGrade(85);  // Runs the code... but never checks the result!
});
```

**Mutation testing** addresses this by:
1. Making small changes to code (called **mutants**)
2. Running tests against each mutant
3. If tests pass → mutant **survived** → test gap exists!
4. If tests fail → mutant **killed** → tests are working

**Mutation Score = Killed Mutants / Total Mutants × 100%**

#### Key Terminology

| Term | Meaning |
|------|---------|
| **Mutant** | A small deliberate change to your code |
| **Killed** | A test failed → good! It caught the bug |
| **Survived** | Tests all passed → bad! Tests missed the change |
| **Mutation Score** | (Killed / Total) × 100% |

#### Why Stryker?

- Industry-standard mutation testing tool for JavaScript
- Used by Netflix, Sentry, Google
- Has official Vitest plugin (`@stryker-mutator/vitest-runner`)
- Active maintenance (Dec 2024 updates)

### What We Did

1. **Installed Stryker packages:**
   ```bash
   npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
   ```

2. **Ran Stryker init wizard:**
   ```bash
   npx stryker init
   ```

3. **Configuration choices:**
   - Framework preset: None/other (vanilla JS with Vite)
   - Test runner: vitest
   - Build command: none (Vitest handles transformation)
   - Reporters: html, clear-text, progress
   - Package manager: npm
   - Config format: JSON

### Questions & Answers

**Q: If you have 100% code coverage but only 50% mutation score, what does that tell you about your tests?**
A: That they are not really testing everything - they're executing the code but not verifying its behavior.

**Q: Why use `--save-dev` for Stryker?**
A: Because we only use it in tests, so we don't add it to the production build.

**Q: Why no build command before tests?**
A: Vitest runs tests directly on source files - it handles transformation internally using Vite.

---

## Next Steps

- [ ] Review generated `stryker.config.json`
- [ ] Configure Wave 1 scope (gradeProgression, shuffle, formatters)
- [ ] Add npm script for mutation testing
- [ ] Run first mutation test
- [ ] Analyze results and interpret report

---

## References

- [Stryker Official Site](https://stryker-mutator.io/)
- [Vitest Runner Documentation](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)
- [Phase 85 Plan](./PHASE85_MUTATION_TESTING.md)
