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

## Tool Selection: Why dependency-cruiser?

### Alternatives Considered

| Tool | Description | GitHub Stars | Last Update |
|------|-------------|--------------|-------------|
| **dependency-cruiser** | Comprehensive dependency analysis and validation | ~5.5k | Active |
| **ts-arch** | Architecture testing with fluent API + PlantUML | ~300 | Active (Dec 2024) |
| **ArchUnitTS** | TypeScript port of Java's ArchUnit | ~200 | Active |
| **eslint-plugin-import** | ESLint rules for import/export | ~5.5k | Active |
| **madge** | Circular dependency detection + visualization | ~8k | Active |
| **Custom solution** | Build with TypeScript compiler API or Babel | N/A | N/A |

### Detailed Comparison

#### 1. dependency-cruiser (Selected)

**Pros:**
- Comprehensive rule system (forbidden, allowed, required)
- Multiple output formats (text, JSON, dot/GraphViz, HTML)
- Circular dependency detection built-in
- Configurable severity levels (error, warn, info)
- Supports JavaScript, TypeScript, CoffeeScript, LiveScript
- Active development and maintenance
- Good documentation
- Can be integrated with CI easily
- Supports custom rules with regex patterns

**Cons:**
- Configuration can be verbose for complex rules
- Learning curve for rule syntax
- Not as fluent/readable as ArchUnit's DSL

**Best for:** Projects needing comprehensive dependency validation with CI integration

---

#### 2. ts-arch

**Pros:**
- Fluent, readable API similar to ArchUnit:
  ```typescript
  const rule = filesOfProject()
    .inFolder('views')
    .shouldNot()
    .dependOnFiles()
    .inFolder('db')

  await expect(rule).toPassAsync()
  ```
- **PlantUML diagram integration** - Define architecture in diagrams, enforce in tests
- **Nx monorepo support** - Works with Nx project graphs
- Cyclic dependency detection built-in
- Actively maintained (v5.4.1, Dec 2024)
- Works with any test runner (Jest integration provided)
- Slice-based architecture testing

**Cons:**
- Async-heavy (requires longer test timeouts)
- Tests can be slower than dependency-cruiser
- Smaller community than dependency-cruiser
- TypeScript-focused (works with JS but optimized for TS)
- Less output format options

**Best for:** Projects wanting fluent API + diagram-driven architecture validation

---

#### 3. ArchUnitTS

**Pros:**
- Fluent, readable API similar to Java's ArchUnit:
  ```typescript
  files()
    .inFolder('views')
    .shouldNot()
    .dependOnFiles()
    .inFolder('db')
  ```
- TypeScript-native with good type support
- Designed specifically for architecture testing
- Easy to understand rule definitions

**Cons:**
- Smaller community and ecosystem
- Fewer output formats
- Less mature than dependency-cruiser and ts-arch
- Primarily TypeScript-focused (our project is JavaScript)
- No built-in visualization
- No diagram support

**Best for:** TypeScript projects wanting readable, ArchUnit-style rules

---

#### 5. eslint-plugin-import

**Pros:**
- Integrates with existing ESLint setup
- Well-maintained, large community
- Rules like `no-restricted-paths` for layer boundaries
- Runs during development (IDE integration)
- Familiar to most JavaScript developers

**Cons:**
- Limited to what ESLint can express
- No visualization capabilities
- Circular dependency detection is basic (`import/no-cycle`)
- Harder to express complex layer rules
- Not designed for architecture testing specifically

**Best for:** Projects wanting basic import rules integrated with ESLint

---

#### 6. madge

**Pros:**
- Excellent visualization (generates graphs)
- Simple API for circular dependency detection
- Supports multiple module formats (ES6, CommonJS, AMD)
- CLI and programmatic usage
- Easy to set up

**Cons:**
- Limited rule system (mainly circular deps)
- No forbidden/allowed dependency rules
- No naming convention enforcement
- Visualization is main focus, not validation

**Best for:** Quick circular dependency detection and visualization

---

#### 7. Custom Solution

**Pros:**
- Complete control over rules and output
- Can be tailored exactly to project needs
- Learning opportunity (AST parsing, dependency graphs)
- No external dependencies

**Cons:**
- Significant development effort
- Need to maintain over time
- Reinventing the wheel
- Missing features that mature tools have
- Testing and edge cases to handle

**Best for:** Very specific requirements not met by existing tools

---

### Decision Matrix

| Criteria | Weight | dep-cruiser | ts-arch | ArchUnitTS | eslint-import | madge | Custom |
|----------|--------|-------------|---------|------------|---------------|-------|--------|
| Layer rules | High | 5 | 5 | 5 | 3 | 1 | 5 |
| Naming conventions | Med | 4 | 3 | 3 | 2 | 1 | 5 |
| Circular deps | High | 5 | 5 | 4 | 3 | 5 | 4 |
| Visualization | Low | 4 | 3 | 2 | 1 | 5 | 2 |
| Diagram support | Low | 2 | 5 | 1 | 1 | 1 | 3 |
| CI integration | High | 5 | 5 | 4 | 5 | 4 | 3 |
| Vitest integration | High | 4 | 4 | 4 | 5 | 3 | 5 |
| Maturity | Med | 5 | 4 | 3 | 5 | 4 | 1 |
| Documentation | Med | 5 | 4 | 3 | 4 | 4 | 1 |
| JS support | High | 5 | 4 | 3 | 5 | 5 | 5 |
| Fluent API | Med | 2 | 5 | 5 | 2 | 3 | 3 |
| Learning effort | Med | 3 | 4 | 4 | 5 | 5 | 1 |
| **Total** | | **49** | **51** | **41** | **41** | **41** | **38** |

*(Scale: 1=Poor, 5=Excellent)*

**Note:** ts-arch scores highest overall, but dependency-cruiser wins on **JS support** (our project is vanilla JS) and **output formats** (we want visualization + CI reports).

### Final Decision: dependency-cruiser

**Why not ts-arch (highest score)?**

ts-arch scored 51 vs dependency-cruiser's 49, but we chose dependency-cruiser because:

1. **Our project is vanilla JavaScript** - ts-arch is optimized for TypeScript projects
2. **Better output formats** - dependency-cruiser has JSON, dot/GraphViz, HTML, text
3. **More mature** - Larger community, more real-world usage, better docs
4. **No async overhead** - ts-arch requires longer test timeouts due to async nature

**Rationale for dependency-cruiser:**

1. **Best JS support** - Works natively with vanilla JavaScript (no TS compilation)
2. **Comprehensive rule system** - Covers all our requirements (layers, naming, circular deps)
3. **Multiple output formats** - Can generate reports, graphs, and CI-friendly output
4. **Mature and well-maintained** - ~5.5k stars, active development, proven in production
5. **Flexible configuration** - Can start simple, add complexity as needed
6. **CI-friendly** - Easy to integrate with GitHub Actions

**Trade-offs accepted:**

- Configuration is more verbose than ts-arch/ArchUnitTS fluent API
- Will need to learn dependency-cruiser's rule syntax
- Rule definitions are less "readable English" than ArchUnit style
- No PlantUML diagram support (could add madge for visualization if needed)

**Reconsidering ts-arch:**

If we migrate to TypeScript in the future, ts-arch becomes more attractive because:
- Fluent API is more readable
- PlantUML diagram integration is excellent for documentation
- Actively maintained with modern features

### Alternative Consideration: Hybrid Approach

For future consideration, we could use multiple tools:

```
dependency-cruiser  →  Layer rules, naming, CI enforcement
madge               →  Visualization for documentation
eslint-plugin-import →  Basic rules in IDE (immediate feedback)
```

This hybrid approach would give us:
- Best-in-class for each concern
- Immediate IDE feedback (ESLint)
- Comprehensive CI validation (dependency-cruiser)
- Beautiful documentation (madge graphs)

**Decision:** Start with dependency-cruiser alone, consider hybrid later if needed.

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

## Test Impact Analysis

### Current Test Structure

The existing tests likely have these patterns that will need updating:

#### Unit Tests (`src/**/*.test.js`)

| Current Pattern | Issue | Migration Required |
|-----------------|-------|-------------------|
| Views mock `db` directly | Views shouldn't know about db | Mock services instead |
| Views mock `api` directly | Views shouldn't know about api | Mock services instead |
| Components test API calls | Components should be pure | Remove API mocking, test props/callbacks |
| API tests mock `db` | API shouldn't fetch from db | Test API with credentials as params |

#### E2E Tests (`tests/e2e/`)

E2E tests should remain mostly unchanged - they test through the UI and don't care about internal architecture. However:
- May need to update test fixtures if service layer changes data flow
- Integration points might shift

### Test Migration Strategy

#### Phase 1: Add Services Tests (Before Migration)

Create comprehensive tests for new services layer:

```javascript
// src/services/quiz-service.test.js
import { describe, it, expect, vi } from 'vitest';
import * as quizService from './quiz-service.js';

// Mock the lower layers
vi.mock('../api/index.js');
vi.mock('../db/db.js');
vi.mock('../state/state.js');

describe('quiz-service', () => {
  describe('generateQuiz', () => {
    it('calls API and updates state', async () => {
      // Test service coordinates api + state correctly
    });
  });

  describe('saveQuizResults', () => {
    it('saves to DB and updates state', async () => {
      // Test service coordinates db + state correctly
    });
  });
});
```

#### Phase 2: Update View Tests (During Migration)

When migrating each view, update its tests:

**Before (current):**
```javascript
// HomeView.test.js - CURRENT
vi.mock('../db/db.js');
vi.mock('../api/index.js');

it('loads quiz history from db', async () => {
  db.getRecentSessions.mockResolvedValue([...]);
  // Test view calls db directly
});
```

**After (target):**
```javascript
// HomeView.test.js - TARGET
vi.mock('../services/quiz-service.js');

it('loads quiz history from service', async () => {
  quizService.getQuizHistory.mockResolvedValue([...]);
  // Test view calls service
});
```

#### Phase 3: Update Component Tests

Components become easier to test (pure/presentational):

**Before:**
```javascript
// ConnectModal.test.js - CURRENT
vi.mock('../api/openrouter-auth.js');

it('calls startAuth when connect clicked', () => {
  // Component knows about auth implementation
});
```

**After:**
```javascript
// ConnectModal.test.js - TARGET
it('calls onConnect callback when connect clicked', () => {
  const onConnect = vi.fn();
  render(<ConnectModal onConnect={onConnect} />);
  // Component just calls callback, doesn't know implementation
});
```

### Test Files to Review/Update

| File | Current Mocks | Target Mocks | Priority |
|------|---------------|--------------|----------|
| `src/db/db.test.js` | None (tests db) | No change | Low |
| `src/utils/network.test.js` | Browser APIs | No change | Low |
| `src/api/*.test.js` | External fetch | Remove db mocks | Medium |
| `src/views/*.test.js` | db, api | services | High |
| `src/components/*.test.js` | api | callbacks/props | High |
| `tests/e2e/*.spec.js` | None (E2E) | Minimal changes | Low |

### New Test Files to Create

| File | Purpose |
|------|---------|
| `src/services/quiz-service.test.js` | Quiz service unit tests |
| `src/services/settings-service.test.js` | Settings service unit tests |
| `src/architecture.test.js` | Architecture rules verification |

### Benefits of New Test Structure

1. **Views easier to test** - Just mock one service, not multiple layers
2. **Services highly testable** - Business logic in isolation
3. **Components trivially testable** - Pure functions of props
4. **Better coverage** - Services layer adds explicit test boundary
5. **Faster tests** - Less complex mocking setup

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

### Test Files to Modify (During Migration)

| File | Changes |
|------|---------|
| `src/views/*.test.js` | Mock services instead of db/api |
| `src/components/*.test.js` | Test callbacks/props, remove API mocks |
| `src/api/*.test.js` | Remove db mocks, test with params |

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
