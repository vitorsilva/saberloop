# Architecture Testing (ArchUnit-like for JavaScript)

## Overview

Implement architecture testing using **dependency-cruiser** to enforce structural rules, prevent architectural violations, and maintain code quality as the codebase evolves.

**Status:** Planning Complete | Ready to Implement

---

## Why This Phase?

- **Prevent Architectural Drift** - Ensure code follows defined layer boundaries
- **Catch Violations Early** - Fail tests before bad patterns merge
- **Document Architecture** - Rules serve as executable documentation
- **Learning Value** - Understand how architecture testing works in JS ecosystem

---

## Requirements Summary

| Aspect | Decision |
|--------|----------|
| **Tool** | dependency-cruiser (existing, mature library) |
| **Rule Types** | All: imports, naming, layers, circular deps |
| **Integration** | Unit tests (Vitest) + CI (GitHub Actions) |
| **Target Structure** | Phase 5 (future structure) |
| **Default Strictness** | Error (configurable per rule) |

---

## Architecture Rules to Implement

### Layer Dependency Rules

Based on Phase 5 target structure:

```
                    main.js (entry point)
                        │
            ┌───────────┼───────────┐
            │           │           │
            ▼           ▼           ▼
        views/      router/     components/
        (UI)       (singleton)  (reusable UI)
            │                       │
            └───────────┬───────────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
            ▼           ▼           ▼
         api/        state/       db/
      (external)   (singleton)  (IndexedDB)
            │                       │
            └───────────┬───────────┘
                        │
                        ▼
                     utils/
                   (helpers)
```

#### Allowed Dependencies

| From | Can Import |
|------|------------|
| `main.js` | All layers (entry point orchestration) |
| `views/` | state, db, api, utils, components, BaseView.js |
| `components/` | api, utils |
| `api/` | db (for keys), utils, external libs |
| `db/` | utils, external libs (idb) |
| `utils/` | external libs only |
| `state/` | Nothing (pure singleton) |
| `router/` | Nothing (pure singleton) |

#### Forbidden Dependencies

| From | Cannot Import | Reason |
|------|---------------|--------|
| `views/` | other views (except BaseView) | Prevents tight coupling |
| `views/` | main.js | Entry point should not be imported |
| `api/` | views, state, router, components | API layer should be UI-agnostic |
| `db/` | views, api, state, router, components | DB layer should be pure data |
| `utils/` | views, api, state, router, components | Utils should have no app dependencies |
| `components/` | views, db, state, router | Components should be reusable |
| `state/` | Anything | Singleton pattern |
| `router/` | Anything | Singleton pattern |

### Naming Convention Rules

| Location | Required Pattern | Example |
|----------|-----------------|---------|
| `src/views/*.js` | `*View.js` or `BaseView.js` | `HomeView.js`, `QuizView.js` |
| `src/api/*.js` | `api.*.js`, `*-client.js`, `*-auth.js`, `index.js`, `providers.js`, `llm-service.js` | `api.mock.js`, `openrouter-client.js` |
| `src/db/*.js` | `db.js` or `*.db.js` | `db.js` |
| `**/*.test.js` | Test files pattern | `network.test.js` |

### Circular Dependency Detection

- **Severity:** Error (blocks build)
- **Scope:** All `src/` files
- **Output:** Full cycle path for debugging

Example violation output:
```
ERROR: Circular dependency detected:
  src/views/HomeView.js
    → src/api/index.js
    → src/views/HomeView.js
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

### Session 2: Define Layer Rules

**Goal:** Implement forbidden/allowed dependency rules

**Steps:**

1. Define `forbidden` rules array in config:
   - Views cannot import other views
   - API cannot import views
   - DB cannot import views/api/state
   - Utils cannot import app layers
   - State/Router cannot import anything

2. Define `allowed` rules for valid patterns

3. Test each rule:
   - Create intentional violation
   - Verify rule catches it
   - Remove violation

**Configuration structure:**
```javascript
module.exports = {
  forbidden: [
    {
      name: 'no-view-to-view',
      severity: 'error',
      from: { path: '^src/views/.+View\\.js$' },
      to: { path: '^src/views/.+View\\.js$' }
    },
    // ... more rules
  ]
};
```

**Deliverables:**
- Complete layer rules in `.dependency-cruiser.cjs`
- Test results showing rules work

---

### Session 3: Naming Convention Rules

**Goal:** Enforce file naming patterns

**Steps:**

1. Add naming rules to config:
   ```javascript
   {
     name: 'views-naming-convention',
     severity: 'error',
     from: { path: '^src/views/' },
     to: { },
     comment: 'Files in views/ must be named *View.js or BaseView.js',
     module: {
       path: '^src/views/(?!.*View\\.js$|BaseView\\.js$).*\\.js$'
     }
   }
   ```

2. Test naming rules work

**Deliverables:**
- Naming rules added to config

---

### Session 4: Circular Dependency Detection

**Goal:** Enable and configure cycle detection

**Steps:**

1. Enable cycle detection in config:
   ```javascript
   {
     name: 'no-circular',
     severity: 'error',
     from: { path: '^src/' },
     to: { circular: true }
   }
   ```

2. Verify with test case

**Deliverables:**
- Circular dependency rule configured

---

### Session 5: Vitest Integration

**Goal:** Run architecture checks as part of `npm test`

**Steps:**

1. Create `src/architecture.test.js`:
   ```javascript
   import { describe, it, expect } from 'vitest';
   import { cruise } from 'dependency-cruiser';
   import config from '../.dependency-cruiser.cjs';

   describe('Architecture Rules', () => {
     it('should have no architecture violations', async () => {
       const result = cruise(['src'], config);

       const violations = result.output.summary.violations;

       if (violations.length > 0) {
         console.error('Architecture violations found:');
         violations.forEach(v => {
           console.error(`  ${v.rule.name}: ${v.from} -> ${v.to}`);
         });
       }

       expect(violations).toHaveLength(0);
     });

     it('should have no circular dependencies', async () => {
       const result = cruise(['src'], config);

       const cycles = result.output.summary.violations
         .filter(v => v.rule.name === 'no-circular');

       expect(cycles).toHaveLength(0);
     });
   });
   ```

2. Verify `npm test` includes architecture tests

3. Test failure scenario

**Deliverables:**
- `src/architecture.test.js`
- Architecture tests run with `npm test`

---

### Session 6: CI Integration

**Goal:** Add architecture check to GitHub Actions

**Steps:**

1. Update `.github/workflows/test.yml`:
   ```yaml
   jobs:
     test:
       steps:
         - name: Install dependencies
           run: npm ci

         - name: Architecture check
           run: npm run arch:test

         - name: Unit tests
           run: npm test

         - name: E2E tests
           run: npm run test:e2e
   ```

2. Test CI pipeline with PR

**Deliverables:**
- Updated GitHub Actions workflow
- CI runs architecture checks

---

### Session 7: Documentation

**Goal:** Document rules and usage

**Steps:**

1. Create `docs/architecture/ARCHITECTURE_RULES.md`:
   - Why we have architecture rules
   - List of all rules with explanations
   - How to run checks locally
   - How to add/modify rules
   - Common violations and fixes

2. Update `CLAUDE.md` with architecture testing info

3. Add architecture section to `CONTRIBUTING.md`

**Deliverables:**
- `docs/architecture/ARCHITECTURE_RULES.md`
- Updated `CLAUDE.md`
- Updated `CONTRIBUTING.md`

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `.dependency-cruiser.cjs` | Configuration with all rules |
| `src/architecture.test.js` | Vitest integration |
| `docs/architecture/ARCHITECTURE_RULES.md` | Rules documentation |
| `docs/architecture/dependency-graph.svg` | Visual dependency graph (generated) |

### Modified Files

| File | Changes |
|------|---------|
| `package.json` | Add `arch:test` and `arch:graph` scripts |
| `.github/workflows/test.yml` | Add architecture check step |
| `CLAUDE.md` | Add architecture testing section |
| `CONTRIBUTING.md` | Add architecture rules info |

---

## Success Criteria

1. **All layer rules enforced** - Violations fail the build
2. **Naming conventions enforced** - Wrong file names are caught
3. **No circular dependencies** - Cycles are detected and reported
4. **Integrated with tests** - `npm test` includes architecture checks
5. **CI enforcement** - GitHub Actions fails on violations
6. **Documented** - Rules are documented for contributors
7. **Visual graph** - Dependency graph can be generated

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

| Level | Behavior |
|-------|----------|
| `error` | Fails the check (exit code 1) |
| `warn` | Reports but doesn't fail |
| `info` | Informational only |

### Rule Structure

```javascript
{
  name: 'rule-name',           // Unique identifier
  severity: 'error',           // error | warn | info
  comment: 'Why this rule exists',
  from: {
    path: '^src/views/'        // Regex for source files
  },
  to: {
    path: '^src/api/',         // Regex for target files
    pathNot: '^src/api/index'  // Exceptions
  }
}
```

---

## Risks & Considerations

### 1. False Positives

Some valid patterns might be flagged initially.

**Mitigation:**
- Start with `warn` severity, promote to `error` after tuning
- Add exceptions for known valid cases
- Review each rule carefully

### 2. Performance

Large codebases can slow down analysis.

**Mitigation:**
- This is a small codebase (~30 files), not a concern
- Can add caching if needed later

### 3. Developer Friction

Strict rules might slow development initially.

**Mitigation:**
- Document all rules clearly
- Provide fix suggestions in error messages
- Start with core rules, add more gradually

### 4. Rule Maintenance

Rules need updating as architecture evolves.

**Mitigation:**
- Keep rules in sync with `docs/architecture/`
- Review rules during Phase 5 structure changes
- Use comments to explain rule purpose

---

## Future Enhancements (Out of Scope)

- **Custom reporters** - Format output for specific tools
- **IDE integration** - Show violations in editor
- **Git hooks** - Pre-commit architecture checks
- **Metrics tracking** - Track violation trends over time
- **Interactive graph** - HTML visualization with click-through

---

## References

- [dependency-cruiser Documentation](https://github.com/sverweij/dependency-cruiser)
- [dependency-cruiser Rules Reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)
- [ArchUnit (Java inspiration)](https://www.archunit.org/)
- [ArchUnitTS](https://lukasniessen.github.io/ArchUnitTS/)
- Phase 5 target structure: `docs/epic03_quizmaster_v2/PHASE5_PROJECT_STRUCTURE.md`

---

**Created:** 2025-12-09
**Location:** `docs/parking_lot/ARCH_TESTING_JS_ARCHUNIT.md`
**Related:** [Epic 3 Plan](../epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md), [Phase 5](../epic03_quizmaster_v2/PHASE5_PROJECT_STRUCTURE.md)
