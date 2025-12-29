# Epic 4: Saberloop V1 - Maintenance & Enhancement

## Overview

Epic 4 focuses on **maintaining** the production Saberloop app and **enhancing** it with new functionality. Building on the foundation from Epic 03 (production-ready release), this epic covers:

- **Maintenance** - Bug fixes, small improvements, issue resolution
- **User Experience** - OpenRouter onboarding, internationalization
- **Code Quality** - Architecture testing, improved telemetry
- **Testing** - Expanded Maestro test coverage
- **Business** - Monetization strategy

**Project Transition**: From "shipping a real product" to "growing and maintaining a live product"

**Target Users**: Existing users + new users from Play Store

---

## What You'll Learn

### New Technologies & Concepts

1. **Feature Flags** - Gradual rollout of new features
2. **Knip** - Dead code detection and cleanup
3. **i18next** - Internationalization for multi-language support
4. **dependency-cruiser** - Architecture testing and enforcement
5. **JSDoc** - Type checking without TypeScript
6. **Maestro** - Comprehensive mobile UI testing
7. **Google AdSense** - Non-intrusive monetization
8. **Self-hosted Telemetry** - VPS-based observability without paid services

---

## Prerequisites

Before starting Epic 4, you should have completed:

- **Epic 01**: PWA Infrastructure (all phases)
- **Epic 02**: QuizMaster V1 (all phases)
- **Epic 03**: QuizMaster V2 - Production Release (all core phases)
  - Phase 1: Backend Integration
  - Phase 2: Offline Capabilities
  - Phase 3: UI Polish (including 3.4-3.6)
  - Phase 4: Observability
  - Phase 5: Project Structure
  - Phase 9: Play Store Publishing (Closed Testing live)

---

## Epic 4 Architecture

### System Overview

```
                    Saberloop V1 (Epic 4)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  User-Facing Enhancements                                   │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ OpenRouter       │  │ i18n             │                │
│  │ Onboarding UX    │  │ Multi-language   │                │
│  │ (Phase 10) ✅    │  │ (Phase 30) ✅    │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐                                      │
│  │ Sharing Feature  │                                      │
│  │ (Phase 70) ✅    │                                      │
│  └──────────────────┘                                      │
│                                                             │
│  Code Quality                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Dead Code        │  │ Architecture     │                │
│  │ Detection        │  │ Testing          │                │
│  │ (Phase 15) ✅    │  │ (Phase 20) ✅    │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐                                      │
│  │ JSDoc Type       │                                      │
│  │ Checking         │                                      │
│  │ (Phase 48) ✅    │                                      │
│  └──────────────────┘                                      │
│                                                             │
│  Testing & Observability                                    │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Offline Mode     │  │ Telemetry        │                │
│  │ Testing          │  │ Enhancement      │                │
│  │ (Phase 50)       │  │ (Phase 40) ✅    │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐                                      │
│  │ Maestro Testing  │                                      │
│  │ Expansion        │                                      │
│  │ (Phase 60)       │                                      │
│  └──────────────────┘                                      │
│                                                             │
│  Ongoing                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Epic03 Pending: Play Store Production + Validation   │  │
│  │ (Phase 5)                                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase Structure

### **Phase 5: Epic03 Pending Items** (Ongoing)

Complete the remaining items from Epic03, primarily Play Store production release.

**Status:** In Progress (14-day closed testing: Dec 17-31) | Day 5 | 9/12 testers | Issue #16 Fixed

**Tasks:**
- Complete 14-day closed testing period
- Apply for production access
- Submit to production track
- User validation and feedback collection
- [x] Investigate Android 15/16 warnings (documented)

**Deliverables:**
- [ ] Closed testing completed successfully (need 3 more testers)
- [ ] Production release on Google Play Store
- [ ] User feedback documented
- [x] Android 15/16 warnings documented (`docs/issues/android-15-16-warnings.md`)

---

### **Phase 10: OpenRouter Onboarding UX** (2-3 sessions) ✅ Complete

Improve the OpenRouter connection experience with guided step-by-step instructions.

**Status:** ✅ Complete (December 21, 2024)

**Key Features:**
- New "OpenRouter Free Account Guide" view
- Step-by-step visual instructions with screenshots
- Multiple entry points (Welcome, Settings, Homepage)
- "Connection Confirmed!" celebration screen
- Feature flags for gradual rollout (now ENABLED)

**Learning Objectives:**
- Feature flag implementation (hand-rolled)
- Multi-step onboarding UX patterns
- OAuth flow enhancement
- Gradual feature rollout
- Subdirectory deployment asset paths
- CI vs local test timing differences

**Deliverables:**
- [x] `src/core/features.js` - Feature flag system
- [x] `src/views/OpenRouterGuideView.js` - Guide with step cards
- [x] `src/views/ConnectionConfirmedView.js` - Success screen
- [x] Integration with existing Welcome, Settings, and Home views
- [x] E2E tests for new flows (8 tests)
- [x] Screenshots for steps 2, 3, 4 (`public/images/onboarding/`)

**Success Criteria:**
- ✅ Users guided through OpenRouter signup without confusion
- ✅ "Skip payment" step clearly highlighted
- ✅ Feature can be toggled via flags
- ✅ All 26 E2E tests pass

---

### **Phase 15: Dead Code Detection** (2-3 sessions)

Implement dead code detection using Knip to identify and remove unused code from learning phases.

**Status:** ✅ Complete (December 21, 2025)

**Key Features:**
- Automated detection of unused files, exports, and dependencies
- Gradual rollout: warnings first, then blocking in CI
- Ignore list for intentionally kept educational/utility code
- Integration with existing GitHub Actions CI pipeline

**Learning Objectives:**
- Static analysis for dead code detection
- Knip configuration for Vite/vanilla JS
- Meaningful ignore patterns
- Gradual rollout (warning → blocking)

**Deliverables:**
- [x] `knip.json` - Configuration file
- [x] `npm run lint:dead-code` - npm script
- [x] GitHub Actions integration (warning mode)
- [x] Cleaned up unused code (TestView.js, cross-env, main field)
- [x] Documentation updated

**Success Criteria:**
- ✅ Knip installed and configured
- ✅ Unused code cleaned up
- ✅ CI integration working (warning mode)
- ✅ No false positives in regular development
- [ ] Promote to blocking mode after 1-2 weeks monitoring

---

### **Phase 20: Architecture Testing** (3-4 sessions)

Implement architecture testing using dependency-cruiser to enforce structural rules.

**Status:** Complete (ready for PR)

**Key Features:**
- Layer boundary enforcement (views, services, api, db)
- Circular dependency detection
- Naming convention rules
- CI integration
- Services layer design for future refactoring

**Learning Objectives:**
- dependency-cruiser configuration
- Low coupling / high cohesion principles
- Architecture documentation as code
- Transition strategy (warnings → errors)

**Deliverables:**
- [x] `.dependency-cruiser.cjs` - Rule configuration (5 custom rules)
- [ ] `src/architecture.test.js` - Vitest integration (optional, deferred)
- [x] GitHub Actions integration (warning mode)
- [x] `docs/architecture/ARCHITECTURE_RULES.md`
- [ ] Services layer skeleton (optional, future phase)

**Success Criteria:**
- ✅ No circular dependencies (verified)
- ✅ Layer boundaries documented (9 warnings tracking violations)
- ✅ CI reports architecture violations (warning mode)
- ✅ Transition rules for future refactoring (warn → error strategy)

---

### **Phase 22: Landing Page Analytics & Marketing** (1 session)

Connect analytics and implement SEO best practices for the landing page.

**Status:** Pending GA4 Validation

**Key Features:**
- Google Search Console verification and sitemap
- Google Analytics 4 with conversion tracking
- SEO meta tags (Open Graph, Twitter Cards)
- Structured data (JSON-LD)
- Performance optimization

**Learning Objectives:**
- GA4 setup and event tracking
- Search Console property management
- SEO meta tag implementation
- Structured data for rich results

**Deliverables:**
- [x] Google Search Console property verified
- [x] GA4 property with conversion events
- [x] sitemap.xml and robots.txt
- [x] Open Graph and Twitter Card meta tags
- [x] SoftwareApplication structured data
- [x] Social preview image (og-image.png)

**Success Criteria:**
- ✅ Rich Results Test passed (SoftwareApplication valid)
- ✅ Twitter/X Card validator passed
- ✅ Facebook debugger validated (all OG tags detected)
- ✅ Sitemap processed (3 pages discovered)
- ⏳ GA4 events verified in DebugView (pending)

---

### **Phase 25: Services Layer Implementation** (8-11 sessions)

Implement services layer to fix architectural violations and promote warning rules to errors.

**Status:** ✅ Complete (All 4 rules enforced)

**Key Features:**
- Services layer (`quiz-service`, `auth-service`)
- Systematic migration: one rule at a time
- Views only import from services
- Components become purely presentational
- API receives credentials as parameters

**Learning Objectives:**
- Services layer design patterns
- Refactoring with test coverage
- Incremental architecture migration
- Low coupling / high cohesion implementation

**Deliverables:**
- [x] `src/services/quiz-service.js` - Quiz business logic ✅
- [x] `src/services/auth-service.js` - Auth coordination ✅
- [x] All 4 warning rules promoted to errors ✅
- [x] E2E tests still passing ✅

**Success Criteria:**
- [x] `npm run arch:test` passes with 0 violations ✅
- [x] All unit tests pass ✅
- [x] All E2E tests pass ✅
- [x] No dead code detected ✅

**Rule Migration Order:**
1. `api-should-not-import-db` (1 session) ✅ PR #24
2. `components-should-not-import-api` (1 session) ✅ PR #25
3. `views-should-not-import-db` (1 session) ✅ PR #26
4. `views-should-not-import-api` (1 session) ✅ PR #27

---

### **Phase 30: Internationalization (i18n)** (8-11 sessions)

Transform Saberloop to support multiple languages.

**Status:** ✅ Complete (December 27, 2024)

**Key Features:**
- i18next integration for UI translation
- LLM content generation in user's language
- Locale-aware date/number formatting
- CLI translation utility
- Test migration to data-testid

**Learning Objectives:**
- i18next library and configuration
- Intl API for formatting
- Translation key organization
- Pluralization and interpolation
- data-testid testing pattern

**Deliverables:**
- [x] `src/core/i18n.js` - i18next configuration
- [x] `public/locales/` - Translation files (en, pt-PT)
- [x] `src/utils/formatters.js` - Locale-aware formatters
- [x] `scripts/translate.js` - CLI translation tool
- [x] All views updated with `t()` function
- [x] E2E tests migrated to data-testid
- [x] Language selector in Settings

**Success Criteria:**
- [x] 5+ languages supported (15 configured)
- [x] UI updates immediately on language change
- [x] Quiz questions generated in selected language
- [x] All tests pass regardless of language
- [x] CLI can generate new translations

---

### **Phase 40: Telemetry Enhancement** (4-6 sessions)

Self-hosted observability solution using VPS + local Docker analysis.

**Status:** ✅ Complete (December 2024)

**Key Features:**
- Browser telemetry batching and shipping
- PHP ingest endpoint on VPS
- JSONL storage with 30-day retention
- Local Docker stack for on-demand analysis
- Grafana dashboards

**Learning Objectives:**
- Telemetry collection patterns
- PHP REST API development
- JSONL data format
- Docker Compose for analysis tools
- Retrospective debugging
- Feature flag deployment process

**Deliverables:**
- [x] `src/utils/telemetry.js` - Browser telemetry client
- [x] VPS: `/telemetry/ingest.php` - Ingest endpoint
- [x] `docker-compose.telemetry.yml` - Analysis stack
- [x] `scripts/telemetry/` - Download and import scripts
- [x] Cron job for log rotation (daily at midnight)
- [x] Quiz generation timing metric
- [x] Test local analysis workflow ✅
- [x] Grafana dashboards (using Explore for queries) ✅

**Success Criteria:**
- [x] Telemetry data persisted on VPS
- [x] Can analyze logs locally (JSONL files)
- [x] Zero additional monthly cost
- [x] Sensitive data still redacted

---

### **Phase 45: Answer Position Randomization** (1 session)

Prevent answer position memorization by randomizing correct answer placement.

**Status:** ✅ Complete (December 27, 2024)

**Key Features:**
- LLM prompt enhancement for even answer distribution
- Fisher-Yates shuffle for replay randomization
- Options shuffled on every replay render

**Learning Objectives:**
- Fisher-Yates shuffle algorithm
- Immutable data transformation
- LLM prompt engineering for behavior control

**Deliverables:**
- [x] `src/utils/shuffle.js` - Fisher-Yates shuffle utility
- [x] `src/utils/shuffle.test.js` - 16 unit tests
- [x] QuizView integration (shuffle on replay)
- [x] LLM prompt enhancement for position distribution
- [x] `PHASE45_ANSWER_RANDOMIZATION.md` - Documentation

**Success Criteria:**
- [x] LLM distributes correct answers across A, B, C, D
- [x] Replayed quizzes have shuffled options
- [x] Correct answer tracking works after shuffle
- [x] All 235 unit tests pass
- [x] All 36 E2E tests pass

---

### **Phase 46: Configurable Questions Per Quiz** (1 session)

Enable the "Default Questions Per Quiz" setting to control quiz length.

**Status:** ✅ Complete (December 27, 2024)

**Key Features:**
- Settings dropdown enabled (5, 10, 15 questions)
- Dynamic question count in LLM prompt
- Mock API generates N questions by cycling templates
- Default changed to 5 for consistency

**Learning Objectives:**
- End-to-end feature wiring (Settings → API)
- Mock API template cycling
- Unit and E2E test coverage for new features

**Deliverables:**
- [x] `src/views/SettingsView.js` - Enabled dropdown
- [x] `src/views/LoadingView.js` - Pass questionCount to API
- [x] `src/api/api.real.js` - Dynamic count in prompt
- [x] `src/api/api.mock.js` - Generate N questions
- [x] 4 new unit tests
- [x] 1 new E2E test
- [x] `PHASE46_CONFIGURABLE_QUESTION_COUNT.md` - Documentation

**Success Criteria:**
- [x] Setting dropdown enabled and functional
- [x] Quiz generates requested number of questions
- [x] All 239 unit tests pass
- [x] All 37 E2E tests pass

---

### **Phase 47: AI Model Selection** (1 session)

Enable users to see and change the AI model used for quiz generation.

**Status:** ✅ Complete (December 27, 2025)

**Key Features:**
- Current model displayed in Settings (under Connection section)
- Expandable model selector with available free models
- Model selection persists across sessions
- Model included in telemetry for analytics

**Learning Objectives:**
- OpenRouter /models API integration
- Model caching strategy (24-hour cache)
- Dynamic UI components (expandable selector)
- Telemetry enhancement

**Deliverables:**
- [x] `src/core/settings.js` - Add selectedModel setting
- [x] `src/services/model-service.js` - Fetch/manage models (18 tests)
- [x] `src/api/openrouter-client.js` - Use selected model
- [x] `src/api/api.real.js` - Include model in telemetry
- [x] `src/views/SettingsView.js` - Model display & selector
- [x] `public/locales/*.json` - i18n translations
- [x] 5 new E2E tests
- [x] `PHASE47_MODEL_SELECTION.md` - Documentation

**Success Criteria:**
- [x] User can see current model in Settings
- [x] User can change to any available free model
- [x] Model selection persists after page refresh
- [x] All 257 unit tests pass
- [x] All 42 E2E tests pass (5 new)
- [x] Architecture tests pass (67 modules)

---

### **Phase 48: JSDoc Documentation & Type Checking** ✅ Complete

Enable JSDoc-based documentation generation and type checking for improved code quality and IDE experience.

**Status:** ✅ Complete

**Key Features:**
- `jsconfig.json` with `checkJs: true`
- `jsdoc.config.json` for documentation generation
- Custom type definitions (`@typedef`) for core data structures
- NPM scripts: `npm run docs`, `npm run typecheck`
- CI integration (strict mode - fails on type errors)
- Improved IDE autocomplete and error detection

**Learning Objectives:**
- Understanding `jsconfig.json` configuration
- Writing `@typedef` for complex object types
- TypeScript-style JSDoc annotations
- CI integration for type checking
- JSDoc documentation generation

**Deliverables:**
- [x] `jsconfig.json` - Enable JS type checking
- [x] `jsdoc.config.json` - Documentation generation config
- [x] `src/types.js` - Shared type definitions
- [x] `src/vite-env.d.ts` - Vite virtual module types
- [x] `npm run typecheck` - Type checking script
- [x] `npm run docs` - Documentation generation script
- [x] GitHub Actions integration (strict mode)
- [x] All type errors fixed across codebase

**Success Criteria:**
- [x] VS Code shows type info on hover
- [x] `npm run typecheck` runs successfully (0 errors)
- [x] CI runs typecheck in strict mode
- [x] Core types defined (Question, QuizSession, AuthState)
- [x] Documentation generated to `docs/api/`

---

### **Phase 50: Offline Mode Testing** (4-6 sessions)

Comprehensive testing of offline functionality to ensure excellent UX when used without internet.

**Status:** In Progress (5/55 E2E tests complete)

**Key Features:**
- Comprehensive offline test coverage (unit + E2E)
- Visual documentation of offline UX
- Edge case testing (rapid toggling, mid-operation loss)
- JSDoc documentation for network utilities
- i18n verification for offline messages

**Learning Objectives:**
- Playwright offline simulation (`context.setOffline()`)
- Visual regression testing with screenshots
- Edge case scenario design
- Network utility documentation

**Deliverables:**
- [x] `tests/e2e/offline.spec.js` - Dedicated offline E2E tests (5 tests done, 15+ target)
- [x] `tests/e2e/helpers.js` - Shared test helper functions
- [x] `PHASE50_LEARNING_NOTES.md` - Behavior documentation (replaces UX spec)
- [x] Screenshots documenting offline UX (5 screenshots)
- [x] Unit tests: Already at 100% coverage (skipped adding more - see notes)
- [ ] JSDoc added to `src/utils/network.js`
- [ ] i18n verification for offline messages

**Current Progress:**
- ✅ Phase 1: Documentation & screenshots complete
- ✅ Phase 2: Unit tests skipped (100% coverage exists, edge cases better at E2E level)
- ✅ Phase 3: E2E tests complete (7 tests)
  - Banner show/hide on connection change
  - Rapid offline/online toggling
  - Navigation while offline
  - Full quiz flow offline (sample quiz)
  - Mid-quiz connection loss
  - Full offline/online cycle with quiz replay (moved from app.spec.js)
  - Visual regression skipped (manual screenshots sufficient)
- ⏳ Phase 4: JSDoc for network utilities
- ⏳ Phase 5: i18n offline message audit
- ⏳ Phase 6: Architecture verification

**Success Criteria:**
- [x] `src/utils/network.js` at 100% coverage ✅
- [x] 7 offline E2E tests (consolidated in offline.spec.js)
- [ ] Visual regression tests with screenshots
- [ ] All offline messages have translation keys
- [ ] Architecture tests pass

**Related:** [PHASE50_OFFLINE_MODE_TESTING.md](./PHASE50_OFFLINE_MODE_TESTING.md)

---

### **Phase 60: Maestro Testing Expansion** (3-4 sessions)

Expand Maestro test coverage to match Playwright E2E tests.

**Status:** Ready to Implement

**Key Features:**
- 7 comprehensive test flows
- Sample quiz strategy (no API calls)
- State-resilient tests
- GitHub Actions integration

**Learning Objectives:**
- Maestro test organization
- TWA-specific testing challenges
- Android emulator in CI
- Mobile UI automation

**Deliverables:**
- [ ] `.maestro/flows/` - 7 test flow files
- [ ] `.github/workflows/maestro.yml` - CI workflow
- [ ] Shared navigation helpers
- [ ] Test documentation

**Success Criteria:**
- All 7 test flows pass locally
- Tests work on fresh or returning user state
- GitHub Actions runs tests on push/PR
- Screenshots uploaded as artifacts

---

### **Phase 70: Sharing Feature** (4-6 sessions)

Add sharing functionality to allow users to share quiz achievements on social media.

**Status:** ✅ Complete (December 27, 2024)

**Key Features:**
- Share button on Results screen
- Achievement card image generation (Canvas API)
- Web Share API with fallbacks
- Deep link handling (`?topic=` parameter)
- Share modal with preview

**Learning Objectives:**
- Web Share API and browser support
- Canvas API for image generation
- Deep linking in PWAs
- Social sharing best practices

**Deliverables:**
- [x] `src/utils/share.js` - Share API utilities
- [x] `src/utils/share-image.js` - Canvas image generator
- [x] `src/components/ShareModal.js` - Share options modal
- [x] Share button in ResultsView
- [x] Deep link handling in main.js
- [x] Unit and E2E tests

**Success Criteria:**
- [x] Share button visible on Results screen
- [x] Can share text + link via Web Share API
- [x] Fallback to clipboard works on Firefox
- [x] Deep links open app with topic pre-filled
- [x] Generated achievement card image

**Related:** [Issue #11](https://github.com/vitorsilva/saberloop/issues/11) ✅ Closed, [PHASE70_SHARING.md](./PHASE70_SHARING.md)

---

### **Phase 80: Unit Test Coverage Improvement** (1 session)

Improve unit test coverage for critical utility and API modules.

**Status:** ✅ Complete (December 27, 2024)

**Key Features:**
- Comprehensive tests for error handling initialization
- OAuth PKCE flow testing (startAuth, handleCallback)
- Network monitoring initialization tests
- DOM manipulation and timer testing patterns

**Learning Objectives:**
- Mocking browser globals (window.addEventListener, sessionStorage)
- Testing DOM manipulation in JSDOM
- Capturing and testing event handlers
- Using fake timers for setTimeout testing

**Deliverables:**
- [x] `src/utils/errorHandler.test.js` - +12 tests for initErrorHandling
- [x] `src/api/openrouter-auth.test.js` - +17 tests for OAuth flow
- [x] `src/utils/network.test.js` - +8 tests for initNetworkMonitoring
- [x] `PHASE80_TEST_COVERAGE.md` - Documentation

**Success Criteria:**
- [x] `errorHandler.js` coverage: 30% → 100%
- [x] `openrouter-auth.js` coverage: 29% → 100%
- [x] `network.js` coverage: 63% → 100%
- [x] Overall coverage: 68% → 82.7%
- [x] All 180 tests passing

---

### **Phase 85: Mutation Testing Setup** (2-3 sessions)

Configure mutation testing with Stryker to assess test quality beyond code coverage.

**Status:** Ready to Implement

**Key Features:**
- Stryker + Vitest integration
- Wave 1 scope: Pure algorithmic logic (gradeProgression, shuffle, formatters)
- HTML mutation report generation
- Per-test coverage analysis for performance

**Learning Objectives:**
- Mutation testing concepts (mutants, killing, mutation score)
- Stryker configuration and mutators
- Test quality assessment beyond code coverage
- Identifying and fixing test gaps

**Deliverables:**
- [ ] `stryker.config.json` - Stryker configuration
- [ ] `npm run test:mutation` - npm script
- [ ] HTML report generation
- [ ] Wave 1 mutation score >80%
- [ ] `PHASE85_LEARNING_NOTES.md` - Documentation

**Success Criteria:**
- [ ] Stryker runs successfully with Vitest
- [ ] Wave 1 files achieve >80% mutation score
- [ ] Can interpret mutation testing report
- [ ] Understand difference between code coverage and mutation score

---

## Estimated Timeline

| Phase | Sessions | Focus | Status |
|-------|----------|-------|--------|
| Phase 5 | Ongoing | Epic03 Pending | In Progress |
| Phase 10 | 2-3 | OpenRouter Onboarding | ✅ Complete |
| Phase 15 | 2-3 | Dead Code Detection | ✅ Complete |
| Phase 20 | 3-4 | Architecture Testing | ✅ Complete |
| Phase 22 | 1 | Landing Page Analytics | ✅ Complete |
| Phase 25 | 2-3 | Services Layer | ✅ Complete |
| Phase 28 | 1 | Continue on Topic | ✅ Complete |
| Phase 30 | 8-11 | Internationalization | ✅ Complete |
| Phase 40 | 5-8 | Telemetry Enhancement | ✅ Complete |
| Phase 45 | 1 | Answer Randomization | ✅ Complete |
| Phase 46 | 1 | Configurable Question Count | ✅ Complete |
| Phase 47 | 1 | AI Model Selection | ✅ Complete |
| Phase 48 | 2-3 | JSDoc Type Checking | ✅ Complete |
| Phase 50 | 4-6 | Offline Mode Testing | 🚧 In Progress |
| Phase 60 | 3-4 | Maestro Testing | Ready |
| Phase 70 | 4-6 | Sharing Feature | ✅ Complete |
| Phase 80 | 1 | Test Coverage | ✅ Complete |
| Phase 85 | 2-3 | Mutation Testing Setup | Ready |
| **Total** | **~35-50** | **Full Epic** | |

**Note:** Phase numbers use intervals of 10 to allow for inserting new phases if needed.

---

## Recommended Order

While phases can be worked on in any order, here's a suggested priority:

1. **Phase 5** - Complete Play Store release (ongoing, mostly waiting)
2. **Phase 10** - OpenRouter Onboarding ✅ Complete
3. **Phase 15** - Dead Code Detection ✅ Complete
4. **Phase 20** - Architecture Testing ✅ Complete
5. **Phase 22** - Landing Page Analytics ✅
6. **Phase 25** - Services Layer ✅
7. **Phase 28** - Continue on Topic ✅
8. **Phase 30** - i18n ✅ Complete
9. **Phase 40** - Telemetry ✅
10. **Phase 45** - Answer Randomization ✅
11. **Phase 46** - Configurable Question Count ✅
12. **Phase 47** - AI Model Selection ✅
13. **Phase 48** - JSDoc Type Checking ✅
14. **Phase 70** - Sharing Feature ✅ Complete
15. **Phase 80** - Test Coverage ✅ Complete
16. **Phase 50** - Offline Mode Testing
17. **Phase 60** - Maestro Testing
18. **Phase 85** - Mutation Testing Setup

---

## Success Criteria (Epic 4 Complete)

### Technical Milestones
- [ ] Production release on Google Play Store
- [x] OpenRouter onboarding improved ✅
- [x] Dead code detected and cleaned up ✅
- [x] Architecture rules enforced in CI ✅
- [x] 5+ languages supported (15 configured) ✅
- [x] Self-hosted telemetry operational ✅
- [x] Answer randomization prevents memorization ✅
- [x] Configurable questions per quiz ✅
- [x] Sharing feature with deep links ✅
- [ ] Maestro tests in CI

### User-Facing Milestones
- [x] Easier OpenRouter setup ✅
- [x] App available in user's language ✅
- [ ] Stable, bug-free experience
- [x] Clear onboarding flow ✅

### Business Milestones
- [ ] App on Play Store (production)
- [ ] Growing user base
- [ ] Feedback loop with users

---

## Parking Lot (Deferred to Future Epics)

The following items remain in the parking lot for consideration in future epics:

- **PHASE7_AZURE_MIGRATION.md** - Azure Functions as alternative backend
- **PHASE8_OAUTH.md** - OAuth integration (if Anthropic enables it)
- **PHASE3.7_OPENAI_INTEGRATION.md** - OpenAI as provider option
- **IOS_APP_STORE.md** - iOS App Store publishing
- **PHASE49_USAGE_COST_TRACKING.md** - Display LLM usage costs to users
- **PHASE60_MONETIZATION.md** - Google AdSense integration (defer until user base grows)
- **PHASE70_V2_SHARING_FEATURES.md** - Advanced sharing features (future enhancements)
- **PHASE86_MUTATION_TESTING_EXPANSION.md** - Extended mutation testing scope
- **PHASE87_MUTATION_TESTING_E2E_EXPLORATION.md** - E2E mutation testing research
- **DATA_DELETION_FEATURE.md** - GDPR-compliant data deletion
- **TELEMETRY_ANALYSIS_PLAN.md** - Advanced telemetry analysis workflows
- **investigation_decentralized_storage.md** - Decentralized storage research

---

## Teaching Methodology (Continued)

**Claude's Role:**
- Explain concepts before showing code
- Provide commands/code as text for you to implement
- Wait for your confirmation after each step
- Ask questions to reinforce learning
- Break tasks into small, manageable steps

**Your Role:**
- Type all code yourself
- Run all commands
- Ask questions when unclear
- Confirm completion of each step

**Exception:** Issue Resolution Mode (as defined in CLAUDE.md)

---

## Getting Started

When you're ready to begin Epic 4, say:
- **"Let's continue Phase 5"** (Play Store progress)
- **"Let's start Phase 10"** (OpenRouter Onboarding)
- **"What's next?"** (Claude will recommend based on status)

---

## References

**Previous Epics:**
- `docs/learning/epic01_infrastructure/LEARNING_PLAN.md`
- `docs/learning/epic02_quizmaster_v1/QUIZMASTER_V1_LEARNING_PLAN.md`
- `docs/learning/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md`

**Epic 4 Phase Documents:**
- `PHASE5_EPIC03_PENDING.md`
- `PHASE10_OPENROUTER_ONBOARDING_UX.md`
- `PHASE15_DEAD_CODE_DETECTION.md`
- `PHASE20_ARCH_TESTING.md`
- `PHASE22_LEARNING_NOTES.md`
- `PHASE25_SERVICES_LAYER.md`
- `PHASE27_EXPLANATION_FEATURE.md`
- `PHASE28_CONTINUE_TOPIC.md`
- `PHASE30_I18N.md`
- `PHASE40_TELEMETRY.md`
- `PHASE45_ANSWER_RANDOMIZATION.md`
- `PHASE46_CONFIGURABLE_QUESTION_COUNT.md`
- `PHASE47_MODEL_SELECTION.md`
- `PHASE48_JSDOC_CONFIGURATION.md`
- `PHASE50_OFFLINE_MODE_TESTING.md`
- `PHASE60_MAESTRO_TESTING.md`
- `PHASE70_SHARING.md`
- `PHASE80_TEST_COVERAGE.md`
- `PHASE85_MUTATION_TESTING.md`

---

**Note**: This epic focuses on **maintenance and enhancement** of a live product. Quality, stability, and user experience are paramount. Take time to fix issues properly rather than shipping quickly.

**Ready to enhance Saberloop V1?**
