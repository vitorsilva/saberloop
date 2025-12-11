# Phase 5 Learning Notes: Repository & Project Structure

## Session 1 - December 10, 2025

### Planning Discussion

Before implementing, we discussed the organization plan with Claude to refine the approach.

### Key Decisions Made

#### 1. Documentation Structure

**Original plan (from PHASE5_PROJECT_STRUCTURE.md):**
```
docs/
├── architecture/     # System design
├── guides/           # User guides
└── epic*/            # Learning notes (stay where they are)
```

**Revised plan (after discussion):**
```
docs/
├── architecture/     # System design docs
├── developer-guide/  # Developer-focused (renamed from guides/)
├── learning/         # All learning materials (NEW location)
│   ├── epic01_infrastructure/
│   ├── epic02_quizmaster_v1/
│   ├── epic03_quizmaster_v2/
│   └── parking_lot/
└── product-info/     # Product identity (moved from product_info/)
```

**Rationale:**
- `guides/` renamed to `developer-guide/` - clearer purpose
- Learning materials moved to `docs/learning/` - better organization
- `parking_lot/` moved inside `docs/learning/` - keeps optional phases together
- `product_info/` → `docs/product-info/` - consolidates all docs in one place
- In-app help deferred to Phase 9 (Play Store Publishing)

#### 2. Code Organization

**Original structure:**
```
src/
├── db/            # 1 file
├── router/        # 1 file
├── state/         # 1 file
├── utils/         # Mixed utilities + settings + welcome-version
└── ...
```

**Issues identified:**
- Single-file folders add unnecessary navigation overhead
- `settings.js` and `welcome-version.js` aren't really "utilities"
- `sample-loader.js` is feature-specific, not a generic utility

**Revised structure (Group by Domain):**
```
src/
├── api/           # Keep as-is
├── components/    # Keep as-is
├── views/         # Keep as-is
├── core/          # NEW: App infrastructure
│   ├── db.js
│   ├── db.test.js
│   ├── router.js
│   ├── state.js
│   └── settings.js
├── features/      # NEW: Feature-specific modules
│   ├── onboarding.js      # Renamed from welcome-version.js
│   └── sample-loader.js   # Moved from utils/
├── utils/         # True utilities only
│   ├── logger.js
│   ├── logger.test.js
│   ├── errorHandler.js
│   ├── errorHandler.test.js
│   ├── performance.js
│   └── network.js
├── styles/
└── main.js
```

**Rationale:**
- `core/` groups infrastructure that everything depends on
- `features/` groups feature-specific code
- `utils/` now contains only generic utilities
- Clearer mental model of code organization

#### 3. E2E Test Location

**Decision:** Keep `tests/e2e/` as-is

**Rationale:**
- E2E tests test user journeys across multiple views
- Conventional structure that Playwright expects
- Mixing with unit tests in views/ would be confusing

#### 4. In-App Help

**Decision:** Defer to Phase 9 (Play Store Publishing)

**Rationale:**
- Not strictly "project structure" work
- Can be combined with user-facing improvements before store listing
- Added as a task in Phase 9 plan

### What We're Building

**Documentation changes:**
- Create `docs/learning/` and move all epic folders
- Move `parking_lot/` to `docs/learning/parking_lot/`
- Move `product_info/` to `docs/product-info/`
- Create `docs/architecture/` with 4 files
- Create `docs/developer-guide/` with 4 files

**Code changes:**
- Create `src/core/` with db, router, state, settings
- Create `src/features/` with onboarding (renamed), sample-loader
- Update all import paths
- Delete empty folders

**Root file changes:**
- Overhaul README.md
- Create CONTRIBUTING.md
- Create CHANGELOG.md
- Create .env.example
- Update CLAUDE.md

### Files to Create

| File | Purpose |
|------|---------|
| `docs/architecture/SYSTEM_OVERVIEW.md` | High-level architecture |
| `docs/architecture/DATABASE_SCHEMA.md` | IndexedDB schema |
| `docs/architecture/API_DESIGN.md` | API endpoints |
| `docs/architecture/DEPLOYMENT.md` | Deployment process |
| `docs/developer-guide/INSTALLATION.md` | Setup instructions |
| `docs/developer-guide/CONFIGURATION.md` | Environment config |
| `docs/developer-guide/TROUBLESHOOTING.md` | Common issues |
| `docs/developer-guide/FAQ.md` | Frequently asked |
| `README.md` | Product-focused (overhaul) |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CHANGELOG.md` | Version history |
| `.env.example` | Example env file |

### Files to Move

| From | To |
|------|-----|
| `docs/epic01_infrastructure/` | `docs/learning/epic01_infrastructure/` |
| `docs/epic02_quizmaster_v1/` | `docs/learning/epic02_quizmaster_v1/` |
| `docs/epic03_quizmaster_v2/` | `docs/learning/epic03_quizmaster_v2/` |
| `parking_lot/` | `docs/learning/parking_lot/` |
| `product_info/` | `docs/product-info/` |
| `src/db/db.js` | `src/core/db.js` |
| `src/db/db.test.js` | `src/core/db.test.js` |
| `src/router/router.js` | `src/core/router.js` |
| `src/state/state.js` | `src/core/state.js` |
| `src/utils/settings.js` | `src/core/settings.js` |
| `src/utils/welcome-version.js` | `src/features/onboarding.js` |
| `src/utils/sample-loader.js` | `src/features/sample-loader.js` |

### Key Learnings

1. **Documentation audience matters**
   - `developer-guide/` is for developers running/contributing to the project
   - End-user docs should be in-app (not markdown files users won't find)

2. **Single-file folders are overhead**
   - Navigation cost without benefit
   - Better to group by domain (core/, features/)

3. **Distinguish utils from features**
   - Utils: Generic, could be used in any project (logger, network)
   - Features: Specific to this app's functionality (onboarding, sample-loader)
   - Core: Infrastructure everything depends on (db, router, state, settings)

4. **E2E tests are different from unit tests**
   - Test user journeys, not individual units
   - Should stay separate from source code
   - Conventional location helps with tooling

### Implementation Notes

Claude implemented this as "housekeeping" since:
- No new code logic to learn
- Mainly file moves and documentation
- Learning was in the planning discussion
- Tests verified nothing broke

## Session 1 - Implementation Complete

### What Was Done

1. **Documentation reorganization:**
   - Created `docs/learning/` and moved all epic folders
   - Moved `docs/parking_lot/` to `docs/learning/parking_lot/`
   - Moved `product_info/` to `docs/product-info/`
   - Created `docs/architecture/` with 4 documentation files
   - Created `docs/developer-guide/` with 4 documentation files

2. **Code reorganization:**
   - Created `src/core/` with db.js, router.js, state.js, settings.js and tests
   - Created `src/features/` with onboarding.js (renamed), sample-loader.js
   - Updated all import paths across 12+ files
   - Deleted empty folders (db/, router/, state/)

3. **Root documentation:**
   - Created professional README.md
   - Created CONTRIBUTING.md
   - Created CHANGELOG.md
   - Updated .env.example with better comments

4. **CLAUDE.md updates:**
   - Updated all path references to `docs/learning/`
   - Added new project structure diagram
   - Updated phase status

5. **Phase 9 update:**
   - Added in-app help as Section 9.0 (prerequisite before Play Store)

### Test Results

- **Unit Tests:** 100 passed
- **E2E Tests:** 16 passed
- **Build:** Successful (73KB main bundle)

### Files Changed Summary

| Category | Created | Modified | Moved |
|----------|---------|----------|-------|
| Architecture docs | 4 | - | - |
| Developer guides | 4 | - | - |
| Learning docs | - | 1 | 4 folders |
| Product info | - | - | 1 folder |
| Source code | 2 folders | 12 files | 7 files |
| Root files | 3 | 2 | - |

### What's Next

- [ ] Phase 6: Validation (comprehensive testing with real users)

