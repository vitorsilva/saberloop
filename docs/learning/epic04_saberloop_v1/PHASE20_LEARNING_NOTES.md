# Phase 20 Learning Notes - Architecture Testing

## Session Log

### Session 1 - December 21, 2025

**What we accomplished:**

1. **Setup**
   - Created feature branch `feat/architecture-testing`
   - Installed dependency-cruiser (`npm install --save-dev dependency-cruiser`)
   - Ran init wizard (`npx depcruise --init`)

2. **Init Wizard Questions & Answers**

   | Question | Answer | Reasoning |
   |----------|--------|-----------|
   | It looks like this is an ESM package. Is that correct? | Yes | Project uses `import`/`export` syntax (ES Modules) |
   | Where do your source files live? | `src` | Main source directory |
   | Do your test files live in a separate folder? | No | Unit tests are co-located (`src/**/*.test.js`), E2E tests in `tests/e2e/` are outside `src/` anyway |
   | Do you want to detect JSDoc imports (slightly slower)? | No | Project doesn't heavily use JSDoc type imports |
   | Do you want to detect process.getBuiltinModule imports (slightly slower)? | No | Browser app, not Node.js - doesn't use this pattern |

   **Note:** The wizard questions were different than documented in PHASE20_ARCH_TESTING.md (which mentioned TypeScript and bundler questions). This may be due to dependency-cruiser version differences or the wizard adapting based on earlier answers.

3. **Files Created**
   - `.dependency-cruiser.cjs` - Generated configuration file

4. **First Scan & Fixing Issues**

   Ran first scan: `npx depcruise src --config .dependency-cruiser.cjs`

   Found 2 violations:

   | Violation | Rule | Resolution |
   |-----------|------|------------|
   | `src/main.js → virtual:pwa-register` | `not-to-unresolvable` | False positive - added `pathNot: "^virtual:"` exception |
   | `src/core/db.js → idb` | `not-to-dev-dep` | **Real issue!** Moved `idb` from devDependencies to dependencies |

5. **Configuration Updates**
   - Modified `not-to-unresolvable` rule to ignore Vite virtual modules
   - Added npm scripts: `arch:test`, `arch:graph`

6. **Final State**
   - `npm run arch:test` passes with 0 violations
   - 49 modules, 102 dependencies analyzed

---

## Key Learnings

### Questions I Asked

1. **"Why feature branches?"**
   - Keep new development independent from production code
   - Ability to revert easily
   - Safe experimentation

2. **"What makes a project ESM vs CommonJS?"**
   - ESM: Uses `import`/`export` syntax
   - CommonJS: Uses `require()`/`module.exports`
   - Check `"type": "module"` in package.json

3. **"Why does devDependencies vs dependencies matter?"**
   - `npm install --production` skips devDependencies
   - Production code should never import from devDependencies
   - In our case, Vite bundles everything so it worked anyway, but semantically wrong
   - dependency-cruiser's `not-to-dev-dep` rule caught this real issue

4. **"What are Vite virtual modules?"**
   - Modules like `virtual:pwa-register` don't exist as files
   - Created dynamically by Vite plugins at build time
   - Need to exclude from "unresolvable" checks with `pathNot: "^virtual:"`

### Default Rules in dependency-cruiser

The generated config includes sensible defaults:
- `no-circular` - Prevents A imports B, B imports A
- `no-orphans` - Flags files not imported anywhere (like Knip!)
- `not-to-unresolvable` - Can't import non-existent modules
- `not-to-dev-dep` - Production code can't use devDependencies

---

## Files Changed

| File | Change |
|------|--------|
| `.dependency-cruiser.cjs` | New - configuration with virtual module exception |
| `package.json` | Moved `idb` to dependencies, added `arch:test` and `arch:graph` scripts |

---

## Next Steps

- [x] Examine the generated `.dependency-cruiser.cjs` file
- [x] Run first architecture scan
- [x] Fix violations found
- [x] Add custom rules for layer boundaries
- [ ] Integrate with CI
- [ ] Document architecture rules

---

### Session 2 - Architecture Analysis & Rules

**Architecture Review:**

Reviewed existing documentation:
- `docs/architecture/SYSTEM_OVERVIEW.md` - High-level architecture
- `PHASE20_ARCH_TESTING.md` - Current vs target state analysis

**Current State (High Coupling):**

| From | Currently Imports | Issue |
|------|-------------------|-------|
| `views/` | api, db, state, utils, components | Views know too much (5 dependencies!) |
| `components/` | api | Should be presentational only |
| `api/` | db (for keys) | Should receive credentials as params |

**Target State (Low Coupling):**

Introduce a `services/` layer:
- Views only import from: `services/`, `components/`, `utils/`
- Services coordinate: `api/`, `db/`, `state/`
- Components are pure: only `utils/`

**Actual Import Patterns Found:**

Ran: `npx depcruise src/views --output-type text --config .dependency-cruiser.cjs`

| Pattern | Files Affected |
|---------|----------------|
| Views → db | HomeView, ResultsView, SettingsView, TopicsView (4 files) |
| Views → api | LoadingView, QuizView, OpenRouterGuideView (3 files) |
| Views → state | HomeView, LoadingView, QuizView, ResultsView, TopicInputView, TopicsView (6 files) |
| Components → api | ConnectModal (1 file) |
| API → db | api.real.js (1 file) |
| Views → BaseView | All views (OK - inheritance) |

**Custom Rules Added:**

| Rule Name | Severity | Purpose |
|-----------|----------|---------|
| `no-view-to-view` | error | Views shouldn't import other views (except BaseView) |
| `views-should-not-import-db` | warn | Transition: use services layer |
| `views-should-not-import-api` | warn | Transition: use services layer |
| `components-should-not-import-api` | warn | Components should be presentational |
| `api-should-not-import-db` | warn | API should receive credentials as params |

**Final Scan Results:**

```
x 9 dependency violations (0 errors, 9 warnings). 49 modules, 102 dependencies cruised.
```

| Rule | Violations |
|------|------------|
| `views-should-not-import-db` | 4 (TopicsView, SettingsView, ResultsView, HomeView) |
| `views-should-not-import-api` | 3 (QuizView, OpenRouterGuideView, LoadingView) |
| `components-should-not-import-api` | 1 (ConnectModal) |
| `api-should-not-import-db` | 1 (api.real.js) |
| `no-view-to-view` | 0 (good!) |

**What We Achieved:**

Architecture-as-code - architectural decisions documented in executable rules that:
1. Run on every `npm run arch:test`
2. Will be visible in CI
3. Guide future refactoring to services layer

---

## Files Changed (Updated)

| File | Change |
|------|--------|
| `.dependency-cruiser.cjs` | Added 5 custom Saberloop architecture rules |
| `package.json` | Moved `idb` to dependencies, added `arch:test` and `arch:graph` scripts |

---

### Session 3 - CI Integration

**What we accomplished:**

1. Added `dependency-cruiser@^17.3.5` to CI install step
2. Added "Check architecture rules (warning)" step to workflow
3. Uses `|| true` so warnings don't fail the build (matches dead code pattern)

**Files Changed:**

| File | Change |
|------|--------|
| `.github/workflows/test.yml` | Added dependency-cruiser install and arch check step |

**CI Pipeline Order (after changes):**

1. Checkout code
2. Setup Node.js
3. Install dependencies (now includes dependency-cruiser)
4. Check for dead code (warning)
5. **Check architecture rules (warning)** ← New!
6. Run unit tests
7. Install Playwright browsers
8. Run E2E tests
9. Build production bundle

---

## Next Steps

- [x] Examine the generated `.dependency-cruiser.cjs` file
- [x] Run first architecture scan
- [x] Fix violations found
- [x] Add custom rules for layer boundaries
- [x] Integrate with CI
- [x] Document architecture rules (`docs/architecture/ARCHITECTURE_RULES.md`)
- [ ] Create PR and merge to main

---

### Session 4 - Documentation

**What we accomplished:**

1. Created `docs/architecture/ARCHITECTURE_RULES.md` with:
   - Current vs target architecture diagrams
   - All rules documented with descriptions
   - How to fix each type of violation
   - CI integration details
   - Transition plan

2. Updated `docs/architecture/SYSTEM_OVERVIEW.md` to link to new doc

**Documentation style matched:**
- Same format as existing architecture docs
- ASCII diagrams for architecture
- Tables for structured information
- Related Documentation section

---

## Phase 20 Complete - Summary

**What was accomplished:**
- Installed and configured dependency-cruiser
- Fixed real bug: `idb` was in devDependencies (should be dependencies)
- Added 5 custom architecture rules (1 error, 4 warnings)
- Integrated with CI (warning mode)
- Created comprehensive documentation

**Files created/modified:**
- `.dependency-cruiser.cjs` (new)
- `package.json` (idb moved, scripts added)
- `.github/workflows/test.yml` (CI step added)
- `docs/architecture/ARCHITECTURE_RULES.md` (new)
- `docs/architecture/SYSTEM_OVERVIEW.md` (link added)

**What's next:**
- Create PR for Phase 20 changes
- Phase 25: Services Layer Implementation (8-11 sessions)
  - Fix 9 violations by introducing services layer
  - Promote warning rules to error rules

---

**Last Updated:** 2025-12-21
**Status:** Complete (ready for PR)
