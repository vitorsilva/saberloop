# Architecture Rules

## Overview

Saberloop uses **dependency-cruiser** to enforce architectural rules and prevent violations. This document describes the current architecture, target architecture, and the rules that enforce them.

## Running Architecture Checks

```bash
# Run architecture validation
npm run arch:test

# Generate dependency graph (DOT format)
npm run arch:graph
```

## Current Architecture

The current architecture has **high coupling** - views directly access multiple layers:

```
                    main.js (entry point)
                        │
            ┌───────────┼───────────┐
            │           │           │
            ▼           ▼           ▼
        views/      router/     components/
            │                       │
            ├──→ core/state.js      │
            ├──→ core/db.js  ←──────┤
            ├──→ api/        ←──────┘
            ├──→ utils/
            └──→ components/
```

### Current Import Patterns

| From | Imports | Issue |
|------|---------|-------|
| `views/` | api, db, state, utils, components | Views know too much (5 dependencies) |
| `components/` | api | Should be presentational only |
| `api/` | db (for keys) | Should receive credentials as params |

### Current Violations (Tracked as Warnings)

| Rule | Count | Files |
|------|-------|-------|
| `views-should-not-import-db` | 4 | TopicsView, SettingsView, ResultsView, HomeView |
| `views-should-not-import-api` | 3 | QuizView, OpenRouterGuideView, LoadingView |
| `components-should-not-import-api` | 1 | ConnectModal |
| `api-should-not-import-db` | 1 | api.real.js |

---

## Target Architecture

The target architecture introduces a **services layer** for low coupling:

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
    └─────────────────┬───────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
       api/        core/       core/
    (external)    state.js     db.js
```

### Target Allowed Dependencies

| From | Can Import | Reasoning |
|------|------------|-----------|
| `main.js` | All layers | Entry point orchestration |
| `views/` | services, components, utils | UI only knows about services |
| `components/` | utils only | Pure presentational, no side effects |
| `services/` | api, db, state, utils | Coordinates all business logic |
| `api/` | utils only | Receives credentials as params |
| `core/db.js` | utils, external libs | Pure data layer |
| `core/state.js` | Nothing | Pure singleton |

---

## Rule Definitions

### Immediate Enforcement (Errors)

These rules fail the build immediately:

| Rule | Description |
|------|-------------|
| `no-circular` | No circular dependencies (A → B → A) |
| `no-view-to-view` | Views cannot import other views (except BaseView) |
| `not-to-dev-dep` | Production code cannot import devDependencies |
| `not-to-unresolvable` | Cannot import non-existent modules |

### Transition Rules (Warnings)

These rules flag violations but don't fail the build. They will become errors after the services layer is implemented:

| Rule | Description | Fix |
|------|-------------|-----|
| `views-should-not-import-db` | Views should use services layer | Move db calls to services |
| `views-should-not-import-api` | Views should use services layer | Move API calls to services |
| `components-should-not-import-api` | Components should be presentational | Pass callbacks as props |
| `api-should-not-import-db` | API should receive credentials as params | Pass API key to functions |

---

## Fixing Violations

### Views Importing from db/api

**Before:**
```javascript
// src/views/HomeView.js
import { getRecentSessions } from '../core/db.js';
import { generateQuestions } from '../api/index.js';

// In the view
const sessions = await getRecentSessions();
const questions = await generateQuestions(topic);
```

**After (with services layer):**
```javascript
// src/views/HomeView.js
import { getQuizHistory, generateQuiz } from '../services/quiz-service.js';

// In the view
const sessions = await getQuizHistory();
const questions = await generateQuiz(topic);
```

### Components Importing from api

**Before:**
```javascript
// src/components/ConnectModal.js
import { startAuth } from '../api/openrouter-auth.js';

// In the component
button.onclick = () => startAuth();
```

**After:**
```javascript
// src/components/ConnectModal.js
// Receives onConnect as a callback prop

// In the component
button.onclick = () => this.props.onConnect();

// Parent view handles the auth
```

---

## Configuration

Architecture rules are defined in `.dependency-cruiser.cjs`. Key sections:

```javascript
// Custom Saberloop rules
{
  name: 'no-view-to-view',
  severity: 'error',
  from: { path: '^src/views/.*View\\.js$' },
  to: {
    path: '^src/views/.*View\\.js$',
    pathNot: 'BaseView\\.js$'
  }
},
{
  name: 'views-should-not-import-db',
  severity: 'warn',  // Will become 'error' after services layer
  from: { path: '^src/views/' },
  to: { path: '^src/core/db\\.js$' }
}
```

### Severity Levels

| Level | Behavior | Use For |
|-------|----------|---------|
| `error` | Fails the check | Hard rules, must fix |
| `warn` | Reports but passes | Transition rules |
| `info` | Informational | Documentation only |

---

## CI Integration

Architecture checks run in GitHub Actions as part of the test workflow:

```yaml
- name: Check architecture rules (warning)
  run: npm run arch:test || true
```

The `|| true` allows warnings without failing the build. Remove it to enforce strictly.

---

## Transition Plan

1. **Current State** - Rules as warnings, violations documented
2. **Add Services Layer** - Create `src/services/` with business logic
3. **Migrate Views** - Update views to use services instead of direct access
4. **Enforce Rules** - Change transition rules from `warn` to `error`

---

## Related Documentation

- [System Overview](./SYSTEM_OVERVIEW.md)
- [API Design](./API_DESIGN.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Phase 20 Plan](../learning/epic04_saberloop_v1/PHASE20_ARCH_TESTING.md)
