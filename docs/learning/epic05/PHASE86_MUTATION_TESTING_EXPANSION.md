# Phase 86: Mutation Testing Expansion (Wave 2)

**Status:** Ready (after Phase 85)
**Priority:** Medium (Code Quality)
**Estimated Effort:** 3-4 sessions
**Created:** 2024-12-XX
**Updated:** 2026-01-04

## Session Log

| Date | Status | Notes |
|------|--------|-------|
| 2024-12-30 | **Moved to Epic 5** | Promoted from parking lot to active epic |
| 2026-01-04 | **Plan Updated** | Added branching strategy, commit points, and learning notes reminders |

---

## Overview

Expand mutation testing to core infrastructure modules (~400 lines). This phase targets state management, database operations, settings, and feature flags - the foundational code that supports all features.

**Key Goal:** Achieve >80% mutation score on critical infrastructure code.

---

## What You'll Learn

### New Technologies & Concepts

1. **State Management Testing** - Validating state transitions and pub/sub patterns
2. **IndexedDB Test Strategies** - Mocking database operations effectively
3. **Settings Validation Testing** - Configuration merge and default handling
4. **Feature Flag Testing** - Boolean logic and context-aware flags
5. **Infrastructure Mutation Patterns** - Common weak spots in foundational code
6. **Test Quality Metrics** - Moving beyond coverage to mutation scores

---

## Prerequisites

Before starting this phase, you should have:

- ✅ **Phase 85** complete (Mutation testing Wave 1 with >80% score)
- ✅ Stryker configured and working (`stryker.config.json`)
- ✅ Unit tests for all Wave 2 target files
- ✅ Understanding of mutation testing concepts (from Phase 85)
- ✅ Familiarity with state.js, db.js, settings.js, features.js

---

## Branching Strategy

### Branch Naming
```
feature/phase86-mutation-testing-wave2
```

### Workflow
1. Create branch from `main`
2. Make small, focused commits (see Commit Strategy below)
3. Push regularly to remote
4. Create PR when phase complete
5. Merge to `main` after review

### Commands
```bash
# Start the phase
git checkout main
git pull origin main
git checkout -b feature/phase86-mutation-testing-wave2

# During work (after each logical change)
git add <files>
git commit -m "type(scope): description"

# Push to remote regularly
git push -u origin feature/phase86-mutation-testing-wave2

# When complete
gh pr create --title "Phase 86: Mutation Testing Wave 2" --body "..."
```

---

## Commit Strategy

### Principles
- **Small commits**: One logical change per commit
- **Atomic**: Each commit should leave the codebase in a working state
- **Descriptive**: Clear commit messages following conventional commits

### Commit Points (Recommended)

| Step | Commit Message |
|------|----------------|
| Update Stryker config for Wave 2 | `chore(test): add core modules to mutation testing config` |
| Add tests for state.js mutants | `test(core): add tests to kill state.js mutants` |
| Add tests for db.js mutants | `test(core): add tests to kill db.js mutants` |
| Add tests for settings.js mutants | `test(core): add tests to kill settings.js mutants` |
| Add tests for features.js mutants | `test(core): add tests to kill features.js mutants` |
| Update Stryker config for Wave 3 | `chore(test): add API modules to mutation testing config` |
| Add tests for openrouter-auth.js | `test(api): add tests to kill openrouter-auth.js mutants` |
| Add tests for api.real.js | `test(api): add tests to kill api.real.js mutants` |
| Final documentation | `docs: add Phase 86 learning notes` |

### Commit Frequency
- Commit after completing each module's test improvements
- Commit before switching to a different file
- Commit when mutation score improves significantly

---

## Objective

Expand mutation testing coverage to include core infrastructure modules, building on the foundation established in Phase 85.

---

## Scope Overview

### Wave 2: Core Infrastructure (~400 lines)

| File | Lines | Tests | Complexity | Focus Areas |
|------|-------|-------|------------|-------------|
| `src/core/state.js` | 120 | ✅ Yes | Medium | State transitions, subscriptions |
| `src/core/db.js` | 159 | ✅ Yes | Medium | IndexedDB operations, data persistence |
| `src/core/settings.js` | 63 | ✅ Yes | Low | Settings merge, defaults |
| `src/core/features.js` | 59 | ✅ Yes | Low | Feature flag evaluation |

### Wave 3: API Layer (~340 lines)

| File | Lines | Tests | Complexity | Focus Areas |
|------|-------|-------|------------|-------------|
| `src/api/openrouter-auth.js` | 136 | ✅ Yes | High | OAuth PKCE flow, token exchange |
| `src/api/api.real.js` | 202 | ✅ Partial | High | Prompt engineering, API orchestration |

---

## Implementation Plan

> **Important Reminders:**
> - 📝 Update `PHASE86_LEARNING_NOTES.md` after completing each step
> - ✅ Update step status in this file (change `[ ]` to `[x]`)
> - 💾 Commit after each logical change (see Commit Strategy above)
> - 🔄 Push to remote regularly to avoid losing work

### Phase 86A: Wave 2 - Core Infrastructure (2 sessions)

#### Step 1: Setup Branch and Initial Config
**Status:** [ ] Not Started

1. Create feature branch from main
2. Expand `stryker.config.json` to include Wave 2 files:

```json
{
  "mutate": [
    "src/utils/gradeProgression.js",
    "src/utils/shuffle.js",
    "src/utils/formatters.js",
    "src/core/state.js",
    "src/core/db.js",
    "src/core/settings.js",
    "src/core/features.js"
  ]
}
```

**After completing:**
- [ ] Commit: `chore(test): add core modules to mutation testing config`
- [ ] Update learning notes with initial setup details
- [ ] Mark this step complete

---

#### Step 2: Run Baseline Mutation Testing
**Status:** [ ] Not Started

```bash
npm run test:mutation
```

**Expected mutant count increase:** ~80-120 additional mutants

**After completing:**
- [ ] Record baseline mutation scores in learning notes
- [ ] Document total mutants and initial survival rate per module
- [ ] Mark this step complete

---

#### Step 3: Analyze Core Module Mutations
**Status:** [ ] Not Started

Review the mutation report and identify surviving mutants per module:

**state.js - Key mutation targets:**
- State transition logic (`set()`, `reset()`)
- Subscription/unsubscription (`subscribe()`, `unsubscribe()`)
- Initialization values

**db.js - Key mutation targets:**
- Database operation conditions
- Data transformation logic
- Error handling paths

**settings.js - Key mutation targets:**
- Default value merging
- Type coercion logic
- Persistence operations

**features.js - Key mutation targets:**
- Flag evaluation logic (`isEnabled()`)
- Default values for unknown flags

**After completing:**
- [ ] Document top 10 surviving mutants in learning notes
- [ ] Categorize mutants by type (boundary, conditional, etc.)
- [ ] Mark this step complete

---

#### Step 4: Strengthen Tests for state.js
**Status:** [ ] Not Started

Add tests to kill surviving mutants in `state.js`:

```javascript
// Example: Testing state transitions
test('should notify subscribers on state change', () => {
  const callback = vi.fn();
  state.subscribe(callback);
  state.set('key', 'value');

  expect(callback).toHaveBeenCalledWith({ key: 'value' });
  // ^ This assertion kills mutations that remove the notify call
});
```

**After completing:**
- [ ] Commit: `test(core): add tests to kill state.js mutants`
- [ ] Document which mutants were killed in learning notes
- [ ] Run mutation testing to verify improvement
- [ ] Mark this step complete

---

#### Step 5: Strengthen Tests for db.js
**Status:** [ ] Not Started

Add tests to kill surviving mutants in `db.js`.

**After completing:**
- [ ] Commit: `test(core): add tests to kill db.js mutants`
- [ ] Document which mutants were killed in learning notes
- [ ] Run mutation testing to verify improvement
- [ ] Mark this step complete

---

#### Step 6: Strengthen Tests for settings.js
**Status:** [ ] Not Started

Add tests to kill surviving mutants in `settings.js`:

```javascript
// Example: Testing boundary conditions
test('should use default when setting undefined', () => {
  settings.set('theme', undefined);
  expect(settings.get('theme')).toBe('light'); // default value
  // ^ Kills mutations that change undefined handling
});
```

**After completing:**
- [ ] Commit: `test(core): add tests to kill settings.js mutants`
- [ ] Document which mutants were killed in learning notes
- [ ] Run mutation testing to verify improvement
- [ ] Mark this step complete

---

#### Step 7: Strengthen Tests for features.js
**Status:** [ ] Not Started

Add tests to kill surviving mutants in `features.js`.

**After completing:**
- [ ] Commit: `test(core): add tests to kill features.js mutants`
- [ ] Document which mutants were killed in learning notes
- [ ] Run mutation testing to verify improvement
- [ ] Mark this step complete

---

#### Step 8: Wave 2 Checkpoint
**Status:** [ ] Not Started

Run full mutation testing and verify Wave 2 target achieved:

```bash
npm run test:mutation
```

**Target:** >75% mutation score on core modules

**After completing:**
- [ ] Record final Wave 2 scores in learning notes
- [ ] Push all commits to remote
- [ ] Update CLAUDE.md status if Wave 2 complete
- [ ] Mark this step complete

---

### Phase 86B: Wave 3 - API Layer (2 sessions)

#### Step 9: Update Configuration for Wave 3
**Status:** [ ] Not Started

Add API files to `stryker.config.json`:

```json
{
  "mutate": [
    "src/utils/gradeProgression.js",
    "src/utils/shuffle.js",
    "src/utils/formatters.js",
    "src/core/state.js",
    "src/core/db.js",
    "src/core/settings.js",
    "src/core/features.js",
    "src/api/openrouter-auth.js",
    "src/api/api.real.js"
  ]
}
```

**After completing:**
- [ ] Commit: `chore(test): add API modules to mutation testing config`
- [ ] Update learning notes with Wave 3 setup
- [ ] Mark this step complete

---

#### Step 10: Run Baseline for Wave 3
**Status:** [ ] Not Started

```bash
npm run test:mutation
```

**After completing:**
- [ ] Record baseline mutation scores for API modules in learning notes
- [ ] Document total mutants and initial survival rate
- [ ] Mark this step complete

---

#### Step 11: Analyze API Module Mutations
**Status:** [ ] Not Started

**openrouter-auth.js - High-value mutations:**
- PKCE verifier/challenge generation
- URL construction for OAuth redirect
- Token exchange request body
- Error handling for missing code/verifier

**api.real.js - High-value mutations:**
- Prompt template construction
- Language parameter handling
- Response parsing
- Error categorization

**After completing:**
- [ ] Document surviving mutants in learning notes
- [ ] Identify which are "equivalent mutants" (can't be killed)
- [ ] Mark this step complete

---

#### Step 12: Strengthen Tests for openrouter-auth.js
**Status:** [ ] Not Started

```javascript
// Testing OAuth URL construction
test('auth URL should include required parameters', async () => {
  await startAuth();

  expect(window.location.href).toContain('code_challenge=');
  expect(window.location.href).toContain('callback_url=');
  expect(window.location.href).toContain('response_type=code');
  // ^ Each assertion kills mutations that remove parameters
});
```

**After completing:**
- [ ] Commit: `test(api): add tests to kill openrouter-auth.js mutants`
- [ ] Document which mutants were killed in learning notes
- [ ] Run mutation testing to verify improvement
- [ ] Mark this step complete

---

#### Step 13: Strengthen Tests for api.real.js
**Status:** [ ] Not Started

```javascript
// Testing prompt construction
test('quiz prompt should include language', () => {
  const prompt = buildQuizPrompt('science', 5, 'pt-PT');

  expect(prompt).toContain('Portuguese');
  expect(prompt).toContain('5 questions');
  // ^ Kills mutations that change prompt templates
});
```

**After completing:**
- [ ] Commit: `test(api): add tests to kill api.real.js mutants`
- [ ] Document which mutants were killed in learning notes
- [ ] Run mutation testing to verify improvement
- [ ] Mark this step complete

---

#### Step 14: Final Verification and Documentation
**Status:** [ ] Not Started

Run full mutation testing and finalize:

```bash
npm run test:mutation
```

**After completing:**
- [ ] Record final combined scores in learning notes
- [ ] Commit: `docs: add Phase 86 learning notes`
- [ ] Create PR for review
- [ ] Update CLAUDE.md with Phase 86 ✅
- [ ] Update Epic 5 plan with Phase 86 ✅
- [ ] Mark this step complete

---

## Performance Considerations

### Estimated Runtime

| Wave | Files | Est. Mutants | Est. Runtime |
|------|-------|--------------|--------------|
| Wave 1 | 3 | 60-95 | 3-5 min |
| Wave 2 | 4 | 80-120 | 5-8 min |
| Wave 3 | 2 | 50-80 | 3-5 min |
| **Total** | 9 | 190-295 | 11-18 min |

### Optimization Strategies

1. **Incremental Mode**: Only test changed files
   ```json
   {
     "incremental": true,
     "incrementalFile": ".stryker-cache/incremental.json"
   }
   ```

2. **Parallel Execution**: Increase concurrency
   ```json
   {
     "concurrency": 8
   }
   ```

3. **Selective Runs**: Test specific files
   ```bash
   npx stryker run --mutate "src/core/state.js"
   ```

---

## Expected Challenges

### 1. Async/Await Mutations
API modules use async operations. Stryker may create mutations like:
- Removing `await` keywords
- Changing Promise resolutions

**Solution:** Ensure tests verify async behavior explicitly:
```javascript
test('should wait for API response', async () => {
  const result = await generateQuiz('topic');
  expect(result).toBeDefined(); // Not just "no error"
});
```

### 2. Mock-Heavy Tests
Core modules may rely on mocks that don't trigger mutation detection.

**Solution:** Test real behavior, not implementation:
```javascript
// Weak (implementation-focused)
test('should call db.save', () => {
  saveSettings({ theme: 'dark' });
  expect(db.save).toHaveBeenCalled();
});

// Strong (behavior-focused)
test('settings should persist and reload', async () => {
  saveSettings({ theme: 'dark' });
  const loaded = await loadSettings();
  expect(loaded.theme).toBe('dark');
});
```

### 3. External Dependencies
API modules call external services. Mutations in fetch calls may be hard to detect.

**Solution:** Verify request parameters:
```javascript
test('should send correct API payload', async () => {
  await makeRequest();

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/v1/'),
    expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"topic"')
    })
  );
});
```

---

## Deliverables

### Initial Setup (Before Starting)
- [ ] Create `PHASE86_LEARNING_NOTES.md` file
- [ ] Create feature branch `feature/phase86-mutation-testing-wave2`

### Wave 2 (Core) - Steps 1-8
- [ ] `stryker.config.json` updated with Wave 2 files (Step 1)
- [ ] Baseline mutation report generated (Step 2)
- [ ] Surviving mutants analyzed and documented (Step 3)
- [ ] Tests added for state.js (Step 4)
- [ ] Tests added for db.js (Step 5)
- [ ] Tests added for settings.js (Step 6)
- [ ] Tests added for features.js (Step 7)
- [ ] Wave 2 mutation score >75% (Step 8)

### Wave 3 (API) - Steps 9-14
- [ ] `stryker.config.json` updated with Wave 3 files (Step 9)
- [ ] Baseline mutation report for API modules (Step 10)
- [ ] Surviving mutants analyzed (Step 11)
- [ ] Tests added for openrouter-auth.js (Step 12)
- [ ] Tests added for api.real.js (Step 13)
- [ ] Full scope mutation score >75% (Step 14)

### Documentation (Ongoing)
- [ ] `PHASE86_LEARNING_NOTES.md` updated after each step with:
  - Progress and completion status
  - Mutation scores at each checkpoint
  - Patterns that helped kill mutants
  - Challenging mutations and solutions
  - Performance observations
  - Any difficulties encountered and how they were resolved

### Final
- [ ] PR created and merged
- [ ] CLAUDE.md updated with Phase 86 ✅
- [ ] Epic 5 plan updated with Phase 86 ✅

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Wave 2 mutation score | >75% |
| Wave 3 mutation score | >75% |
| Combined mutation score | >75% |
| New tests added | 10-20 |
| No regression in existing tests | ✓ |

---

## Acceptance Criteria

- [ ] All 9 files included in mutation testing
- [ ] Combined mutation score >75%
- [ ] HTML report shows improvement from Wave 1
- [ ] Can explain why specific mutants survived
- [ ] Tests demonstrate behavior verification, not implementation checking
- [ ] Performance is acceptable (<20 min full run)

---

## Files to Exclude (Confirmed)

These files remain excluded from mutation testing:

| Category | Files | Reason |
|----------|-------|--------|
| Views | `src/views/**` | UI rendering, use E2E |
| Components | `src/components/**` | UI, use E2E |
| Entry | `src/main.js`, `src/app.js` | Initialization |
| Generated | `src/version.js` | Auto-generated |
| Data | `src/data/**` | JSON, not logic |
| Styles | `src/styles/**` | CSS |

---

## Learning Objectives

1. **Testing Core Infrastructure**
   - State management testing patterns
   - Database operation verification
   - Configuration/settings testing

2. **Testing API Modules**
   - OAuth flow verification
   - Request/response testing
   - Error path coverage

3. **Mutation Testing at Scale**
   - Managing larger mutation sets
   - Performance optimization
   - Incremental testing

4. **Test Quality Patterns**
   - Behavior vs implementation testing
   - Boundary condition focus
   - Async operation verification

---

## Dependencies

- Phase 85 complete (Stryker configured, Wave 1 done)
- Phase 80 complete (high test coverage baseline)

---

## Notes

- Wave 2 and 3 introduce more complex code patterns
- Expect lower initial mutation scores than Wave 1
- Some API mutations may be "equivalent" (can't be detected)
- Consider creating a `.stryker-tmp/` gitignore entry for cache files
