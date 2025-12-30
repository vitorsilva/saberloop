# Phase 86: Mutation Testing Expansion (Wave 2 & 3)

**Status:** Ready (after Phase 85)
**Priority:** Medium
**Estimated Effort:** 3-4 sessions
**Prerequisites:** Phase 85 complete with >80% mutation score on Wave 1

## Objective

Expand mutation testing coverage to include core infrastructure and API modules, building on the foundation established in Phase 85.

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

### Phase 86A: Wave 2 - Core Infrastructure (2 sessions)

#### Step 1: Update Stryker Configuration

Expand `stryker.config.json` to include Wave 2 files:

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

#### Step 2: Run Mutation Testing on Wave 2

```bash
npm run test:mutation
```

**Expected mutant count increase:** ~80-120 additional mutants

#### Step 3: Analyze Core Module Mutations

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

#### Step 4: Strengthen Tests for Surviving Mutants

Common patterns for core modules:

```javascript
// Example: Testing state transitions
test('should notify subscribers on state change', () => {
  const callback = vi.fn();
  state.subscribe(callback);
  state.set('key', 'value');

  expect(callback).toHaveBeenCalledWith({ key: 'value' });
  // ^ This assertion kills mutations that remove the notify call
});

// Example: Testing boundary conditions
test('should use default when setting undefined', () => {
  settings.set('theme', undefined);
  expect(settings.get('theme')).toBe('light'); // default value
  // ^ Kills mutations that change undefined handling
});
```

---

### Phase 86B: Wave 3 - API Layer (2 sessions)

#### Step 1: Update Configuration for Wave 3

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

#### Step 2: API Module Analysis

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

#### Step 3: API-Specific Testing Patterns

```javascript
// Testing OAuth URL construction
test('auth URL should include required parameters', async () => {
  await startAuth();

  expect(window.location.href).toContain('code_challenge=');
  expect(window.location.href).toContain('callback_url=');
  expect(window.location.href).toContain('response_type=code');
  // ^ Each assertion kills mutations that remove parameters
});

// Testing prompt construction
test('quiz prompt should include language', () => {
  const prompt = buildQuizPrompt('science', 5, 'pt-PT');

  expect(prompt).toContain('Portuguese');
  expect(prompt).toContain('5 questions');
  // ^ Kills mutations that change prompt templates
});
```

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

### Wave 2 (Core)
- [ ] `stryker.config.json` updated with Wave 2 files
- [ ] Mutation report generated for Wave 2
- [ ] Surviving mutants analyzed (document top 10)
- [ ] Tests added to kill surviving mutants
- [ ] Wave 2 mutation score >75%

### Wave 3 (API)
- [ ] `stryker.config.json` updated with Wave 3 files
- [ ] Mutation report generated for full scope
- [ ] API-specific surviving mutants addressed
- [ ] Full scope mutation score >75%

### Documentation
- [ ] `PHASE86_LEARNING_NOTES.md` with:
  - Patterns that helped kill mutants
  - Challenging mutations and solutions
  - Performance observations
  - Recommendations for ongoing use

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
