# Architecture Testing (ArchUnit-like for JavaScript)

## Overview

Implement architecture testing using **dependency-cruiser** to enforce structural rules, prevent architectural violations, and guide refactoring toward a better architecture.

**Status:** Planning Complete | Ready to Implement

---

## Why This Phase?

- **Prevent Architectural Drift** - Ensure code follows defined layer boundaries
- **Catch Violations Early** - Fail tests before bad patterns merge
- **Guide Refactoring** - Use rules to transition from current to target architecture
- **Document Architecture** - Rules serve as executable documentation
- **Learning Value** - Understand low coupling / high cohesion principles

---

## Requirements Summary

| Aspect | Decision |
|--------|----------|
| **Tool** | dependency-cruiser (existing, mature library) |
| **Rule Types** | All: imports, naming, layers, circular deps |
| **Integration** | Unit tests (Vitest) + CI (GitHub Actions) |
| **Approach** | Document current + Define target + Guide transition |
| **Default Strictness** | Error (configurable per rule) |

---

## Architecture Analysis

### Current State (High Coupling)

The current architecture has **too many direct dependencies** between layers:

```
                    main.js (entry point)
                        │
            ┌───────────┼───────────┐
            │           │           │
            ▼           ▼           ▼
        views/      router/     components/
            │                       │
            │ ←─── HIGH COUPLING ───┤
            │                       │
            ├──→ state/             │
            ├──→ db/     ←──────────┤
            ├──→ api/    ←──────────┘
            ├──→ utils/
            └──→ components/
                    │
                    └──→ api/  ← PROBLEM!
```

#### Current Allowed Dependencies (Problematic)

| From | Currently Imports | Issue |
|------|-------------------|-------|
| `views/` | state, db, api, utils, components | **5 dependencies!** Views know too much |
| `components/` | api | Components should be presentational only |
| `api/` | db (for keys) | API shouldn't know about storage |

#### Problems with Current Architecture

1. **Views are coupled to everything**
   - Views import directly from `db` → knows storage details
   - Views import directly from `api` → knows network details
   - Hard to test, hard to change

2. **Components aren't reusable**
   - Components import from `api` → tied to specific data fetching
   - Should receive data via props/callbacks instead

3. **API layer has wrong dependencies**
   - API imports from `db` to get keys
   - Should receive credentials as parameters

4. **No clear business logic layer**
   - Logic scattered across views
   - Coordination between api/db happens in views

---

### Target State (Low Coupling, High Cohesion)

Introduce a **services layer** to coordinate business logic:

```
                    main.js (entry point)
                        │
                        ▼
    ┌─────────────────────────────────────────┐
    │              views/                      │
    │         (UI / Presentation)              │
    │                                          │
    │  Only knows about: services, components  │
    └─────────────────┬───────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────┐
    │            services/                     │
    │       (Business Logic Layer)             │
    │                                          │
    │  Coordinates: api, db, state             │
    │  Exposes: high-level operations          │
    └─────────────────┬───────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
       api/        state/       db/
    (external)   (app state)  (storage)
          │                       │
          └───────────┬───────────┘
                      │
                      ▼
                   utils/
                 (pure helpers)
```

#### Target Allowed Dependencies

| From | Can Import | Reasoning |
|------|------------|-----------|
| `main.js` | All layers | Entry point orchestration |
| `views/` | services, components, utils | UI only knows about services |
| `components/` | utils only | Pure presentational, no side effects |
| `services/` | api, db, state, utils | Coordinates all business logic |
| `api/` | utils only | Receives credentials as params |
| `db/` | utils, external libs (idb) | Pure data layer |
| `state/` | Nothing | Pure singleton |
| `router/` | Nothing | Pure singleton |
| `utils/` | External libs only | Pure helpers |

#### Target Forbidden Dependencies

| From | Cannot Import | Why |
|------|---------------|-----|
| `views/` | api, db, state | Views shouldn't know about data fetching/storage |
| `views/` | other views | Prevents coupling between views |
| `components/` | api, db, state, services, views | Must be pure/presentational |
| `api/` | db, state, views, services | API receives params, doesn't fetch |
| `db/` | api, state, views, services | Pure data layer |
| `services/` | views, components | Services don't know about UI |

---

### Services Layer Design

The services layer provides high-level operations that views can call:

```javascript
// src/services/quiz-service.js
import { generateQuestions as apiGenerateQuestions } from '../api/index.js';
import { saveSession, getRecentSessions } from '../db/db.js';
import state from '../state/state.js';

/**
 * Generate a new quiz - coordinates API call and state update
 */
export async function generateQuiz(topic, gradeLevel) {
  // 1. Call API
  const questions = await apiGenerateQuestions(topic, gradeLevel);

  // 2. Update state
  state.set('currentQuestions', questions);
  state.set('currentTopic', topic);

  // 3. Return for UI
  return questions;
}

/**
 * Save quiz results - coordinates DB and state
 */
export async function saveQuizResults(sessionData) {
  // 1. Save to DB
  const sessionId = await saveSession(sessionData);

  // 2. Update state
  state.set('lastSessionId', sessionId);

  return sessionId;
}

/**
 * Get quiz history - pure data fetch
 */
export async function getQuizHistory(limit = 10) {
  return getRecentSessions(limit);
}
```

**Benefits:**
- Views become simpler: `await quizService.generateQuiz(topic, level)`
- Business logic is centralized and testable
- Easy to mock for testing views
- Clear separation of concerns

---

## Transition Strategy

### Phase A: Document Current State (Warnings Only)

First, document what currently exists with `warn` severity:

```javascript
// .dependency-cruiser.cjs - Phase A
{
  name: 'views-should-not-import-db-directly',
  severity: 'warn',  // Start as warning
  comment: 'TRANSITION: Views will use services layer instead',
  from: { path: '^src/views/' },
  to: { path: '^src/db/' }
}
```

### Phase B: Create Services Layer

Add the services layer alongside existing code:
1. Create `src/services/quiz-service.js`
2. Create `src/services/settings-service.js`
3. Add tests for services

### Phase C: Migrate Views

Update views one-by-one to use services:
1. Update `HomeView.js` to use `quiz-service`
2. Update `QuizView.js` to use `quiz-service`
3. Update `SettingsView.js` to use `settings-service`
4. Remove direct db/api imports from views

### Phase D: Enforce Target Architecture

Change rules from `warn` to `error`:

```javascript
// .dependency-cruiser.cjs - Phase D
{
  name: 'views-cannot-import-db',
  severity: 'error',  // Now enforced!
  from: { path: '^src/views/' },
  to: { path: '^src/db/' }
}
```

---

## Implementation Plan

### Session 1: Setup dependency-cruiser

**Goal:** Install tool and create initial configuration

**Steps:**

1. Install dependency-cruiser as dev dependency
   ```bash
   npm install --save-dev dependency-cruiser
   ```

2. Initialize configuration
   ```bash
   npx depcruise --init
   ```

3. Create `.dependency-cruiser.cjs` with base configuration

4. Add npm scripts to `package.json`:
   ```json
   {
     "scripts": {
       "arch:test": "depcruise src --config .dependency-cruiser.cjs",
       "arch:graph": "depcruise src --output-type dot | dot -T svg > docs/architecture/dependency-graph.svg"
     }
   }
   ```

5. Verify basic setup works
   ```bash
   npm run arch:test
   ```

**Deliverables:**
- `.dependency-cruiser.cjs` (basic config)
- Updated `package.json`

---

### Session 2: Document Current State Rules

**Goal:** Create rules that document current architecture (warnings)

**Rules to create:**

```javascript
module.exports = {
  forbidden: [
    // === ALWAYS FORBIDDEN (errors) ===
    {
      name: 'no-circular',
      severity: 'error',
      from: { path: '^src/' },
      to: { circular: true }
    },
    {
      name: 'no-view-to-view',
      severity: 'error',
      from: { path: '^src/views/.+View\\.js$' },
      to: { path: '^src/views/.+View\\.js$' }
    },
    {
      name: 'state-imports-nothing',
      severity: 'error',
      from: { path: '^src/state/' },
      to: { path: '^src/' }
    },
    {
      name: 'router-imports-nothing',
      severity: 'error',
      from: { path: '^src/router/' },
      to: { path: '^src/' }
    },

    // === TRANSITION RULES (warnings → will become errors) ===
    {
      name: 'views-should-not-import-db',
      severity: 'warn',
      comment: 'TRANSITION: Views should use services layer',
      from: { path: '^src/views/' },
      to: { path: '^src/db/' }
    },
    {
      name: 'views-should-not-import-api',
      severity: 'warn',
      comment: 'TRANSITION: Views should use services layer',
      from: { path: '^src/views/' },
      to: { path: '^src/api/' }
    },
    {
      name: 'components-should-not-import-api',
      severity: 'warn',
      comment: 'TRANSITION: Components should be presentational',
      from: { path: '^src/components/' },
      to: { path: '^src/api/' }
    },
    {
      name: 'api-should-not-import-db',
      severity: 'warn',
      comment: 'TRANSITION: API should receive credentials as params',
      from: { path: '^src/api/' },
      to: { path: '^src/db/' }
    }
  ]
};
```

**Deliverables:**
- Current state rules (errors + warnings)
- Baseline of existing violations

---

### Session 3: Create Services Layer Structure

**Goal:** Add services layer (doesn't require changing existing code yet)

**New files:**
- `src/services/quiz-service.js` - Quiz generation, saving, history
- `src/services/settings-service.js` - Settings management
- `src/services/index.js` - Service exports

**Example structure:**
```javascript
// src/services/quiz-service.js
export async function generateQuiz(topic, gradeLevel) { ... }
export async function saveQuizResults(session) { ... }
export async function getQuizHistory(limit) { ... }
export async function getQuizSession(id) { ... }
```

**Rules to add:**
```javascript
{
  name: 'services-can-import-api-db-state',
  severity: 'info',
  comment: 'Services coordinate api, db, and state',
  from: { path: '^src/services/' },
  to: { path: '^src/(api|db|state)/' }
}
```

**Deliverables:**
- Services layer skeleton
- Services can import from api/db/state

---

### Session 4: Add Naming Convention Rules

**Goal:** Enforce file naming patterns

**Rules:**
```javascript
// Naming conventions
{
  name: 'views-naming-convention',
  severity: 'error',
  comment: 'Files in views/ must be *View.js or BaseView.js',
  from: { },
  to: {
    path: '^src/views/(?!.*View\\.js$|BaseView\\.js$|index\\.js$).*\\.js$'
  }
},
{
  name: 'services-naming-convention',
  severity: 'error',
  comment: 'Files in services/ must be *-service.js or index.js',
  from: { },
  to: {
    path: '^src/services/(?!.*-service\\.js$|index\\.js$).*\\.js$'
  }
}
```

**Deliverables:**
- Naming rules configured

---

### Session 5: Vitest Integration

**Goal:** Run architecture checks as part of `npm test`

**Create `src/architecture.test.js`:**
```javascript
import { describe, it, expect } from 'vitest';
import { cruise } from 'dependency-cruiser';
import config from '../.dependency-cruiser.cjs';

describe('Architecture Rules', () => {
  it('should have no architecture errors', async () => {
    const result = cruise(['src'], config);

    const errors = result.output.summary.violations
      .filter(v => v.rule.severity === 'error');

    if (errors.length > 0) {
      console.error('Architecture violations:');
      errors.forEach(v => {
        console.error(`  [${v.rule.name}] ${v.from} → ${v.to}`);
      });
    }

    expect(errors).toHaveLength(0);
  });

  it('should report transition warnings (not blocking)', async () => {
    const result = cruise(['src'], config);

    const warnings = result.output.summary.violations
      .filter(v => v.rule.severity === 'warn');

    if (warnings.length > 0) {
      console.log('Transition warnings (to be fixed):');
      warnings.forEach(v => {
        console.log(`  [${v.rule.name}] ${v.from} → ${v.to}`);
      });
    }

    // Don't fail on warnings - just report them
  });
});
```

**Deliverables:**
- Architecture tests integrated with `npm test`

---

### Session 6: CI Integration

**Goal:** Add architecture check to GitHub Actions

**Update `.github/workflows/test.yml`:**
```yaml
- name: Architecture check
  run: npm run arch:test
```

**Deliverables:**
- CI runs architecture checks

---

### Session 7: Documentation

**Goal:** Document architecture rules and transition plan

**Create `docs/architecture/ARCHITECTURE_RULES.md`:**
- Current vs target architecture diagrams
- List of all rules with explanations
- Transition plan and timeline
- How to fix common violations

**Deliverables:**
- Architecture documentation

---

### Future Sessions: Migration

**Session 8+:** Migrate views to use services (separate epic/phase)

1. Migrate `HomeView.js`
2. Migrate `QuizView.js`
3. Migrate `SettingsView.js`
4. Migrate `ResultsView.js`
5. Update components to be presentational
6. Change transition rules from `warn` to `error`

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `.dependency-cruiser.cjs` | Configuration with all rules |
| `src/architecture.test.js` | Vitest integration |
| `src/services/quiz-service.js` | Quiz business logic |
| `src/services/settings-service.js` | Settings business logic |
| `src/services/index.js` | Service exports |
| `docs/architecture/ARCHITECTURE_RULES.md` | Rules documentation |
| `docs/architecture/dependency-graph.svg` | Visual graph (generated) |

### Modified Files

| File | Changes |
|------|---------|
| `package.json` | Add `arch:test` and `arch:graph` scripts |
| `.github/workflows/test.yml` | Add architecture check step |
| `CLAUDE.md` | Add architecture section |

---

## Success Criteria

### Phase A-B (This Plan)

1. **dependency-cruiser configured** - Tool installed and working
2. **Current state documented** - Rules capture existing architecture
3. **Transition rules in place** - Warnings for violations to fix
4. **Services layer skeleton** - Structure ready for migration
5. **Tests integrated** - `npm test` includes architecture checks
6. **CI enforced** - GitHub Actions fails on errors
7. **Documented** - Architecture and rules documented

### Phase C-D (Future - Migration)

1. **Views migrated** - All views use services
2. **Components pure** - No side effects in components
3. **API decoupled** - Receives credentials as params
4. **All rules errors** - No more warnings, full enforcement

---

## Architecture Principles Reference

### Low Coupling

**Definition:** Modules should have minimal dependencies on each other.

**Applied here:**
- Views only know about services (1 dependency for business logic)
- Components have zero app dependencies (pure)
- API/DB layers are independent

### High Cohesion

**Definition:** Related functionality should be grouped together.

**Applied here:**
- All quiz logic in `quiz-service.js`
- All settings logic in `settings-service.js`
- Views focus only on UI rendering

### Dependency Inversion

**Definition:** High-level modules shouldn't depend on low-level modules.

**Applied here:**
- Views (high-level) don't depend on DB/API (low-level)
- Services act as abstraction layer
- Easy to swap implementations

### Single Responsibility

**Definition:** Each module should have one reason to change.

**Applied here:**
- Views change for UI reasons only
- Services change for business logic reasons
- DB changes for storage reasons

---

## dependency-cruiser Quick Reference

### Common Commands

```bash
# Run architecture tests
npm run arch:test

# Generate dependency graph
npm run arch:graph

# Check specific folder
npx depcruise src/views --config .dependency-cruiser.cjs

# Output formats
npx depcruise src --output-type err    # Errors only
npx depcruise src --output-type json   # Full JSON report
npx depcruise src --output-type dot    # GraphViz format
```

### Rule Severity Levels

| Level | Behavior | Use For |
|-------|----------|---------|
| `error` | Fails the check | Hard rules, must fix |
| `warn` | Reports but passes | Transition rules |
| `info` | Informational | Documentation |

---

## References

- [dependency-cruiser Documentation](https://github.com/sverweij/dependency-cruiser)
- [dependency-cruiser Rules Reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)
- [ArchUnit (Java inspiration)](https://www.archunit.org/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- Phase 5 structure: `docs/epic03_quizmaster_v2/PHASE5_PROJECT_STRUCTURE.md`

---

**Created:** 2025-12-09
**Updated:** 2025-12-09
**Location:** `docs/parking_lot/ARCH_TESTING_JS_ARCHUNIT.md`
**Related:** [Epic 3 Plan](../epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md)
