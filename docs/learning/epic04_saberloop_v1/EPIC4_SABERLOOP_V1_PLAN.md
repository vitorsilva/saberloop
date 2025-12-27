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
│  │ (Phase 10) ✅    │  │ (Phase 30)       │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  Code Quality                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Dead Code        │  │ Architecture     │                │
│  │ Detection        │  │ Testing          │                │
│  │ (Phase 15)       │  │ (Phase 20)       │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐                                      │
│  │ JSDoc Type       │                                      │
│  │ Checking         │                                      │
│  │ (Phase 48)       │                                      │
│  └──────────────────┘                                      │
│                                                             │
│  Testing & Observability                                    │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Maestro Testing  │  │ Telemetry        │                │
│  │ Expansion        │  │ Enhancement      │                │
│  │ (Phase 50)       │  │ (Phase 40)       │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  Business                                                   │
│  ┌──────────────────┐                                      │
│  │ Monetization     │                                      │
│  │ Strategy         │                                      │
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

### **Phase 48: JSDoc Configuration & Type Checking** (2-3 sessions)

Enable JSDoc-based type checking for improved code quality and IDE experience.

**Status:** Ready to Implement

**Key Features:**
- `jsconfig.json` with `checkJs: true`
- Custom type definitions (`@typedef`) for core data structures
- NPM script for type checking
- CI integration (warning mode)
- Improved IDE autocomplete and error detection

**Learning Objectives:**
- Understanding `jsconfig.json` configuration
- Writing `@typedef` for complex object types
- TypeScript-style JSDoc annotations
- CI integration for type checking

**Deliverables:**
- [ ] `jsconfig.json` - Enable JS type checking
- [ ] `src/types.js` - Shared type definitions
- [ ] `npm run typecheck` - Type checking script
- [ ] GitHub Actions integration (warning mode)
- [ ] Improved JSDoc in core modules (db.js, state.js)
- [ ] `PHASE48_JSDOC_CONFIGURATION.md` - Documentation

**Success Criteria:**
- [ ] VS Code shows type info on hover
- [ ] `npm run typecheck` runs successfully
- [ ] CI runs typecheck in warning mode
- [ ] Core types defined (Question, QuizSession, AuthState)

---

### **Phase 50: Maestro Testing Expansion** (3-4 sessions)

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

### **Phase 60: Monetization Strategy** (3-4 sessions)

Implement Google AdSense integration for passive revenue.

**Status:** Ready to Implement

**Key Features:**
- Ads during loading states (non-intrusive)
- Offline graceful handling
- SPA navigation support
- Privacy policy compliance

**Learning Objectives:**
- Google AdSense setup and policies
- Ad placement strategy (loading states)
- PWA monetization patterns
- Legal compliance (GDPR, privacy)

**Deliverables:**
- [ ] AdSense account setup
- [ ] `public/ads.txt` - Ad inventory authorization
- [ ] `src/utils/adManager.js` - Ad loading utility
- [ ] `src/views/PrivacyView.js` - Privacy policy
- [ ] Loading views with ad placements
- [ ] Unit and E2E tests

**Success Criteria:**
- AdSense account approved
- Ads display during natural wait times
- No ads during active quiz
- Offline mode unaffected
- User experience remains positive

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

### **Phase 86: Mutation Testing Expansion** (3-4 sessions)

Expand mutation testing to core infrastructure and API modules.

**Status:** Ready (after Phase 85)

**Key Features:**
- Wave 2: Core infrastructure (state, db, settings, features)
- Wave 3: API layer (openrouter-auth, api.real)
- Performance optimization with incremental mode
- ~960 lines of additional coverage

**Learning Objectives:**
- Testing core infrastructure patterns
- API module mutation testing
- Managing larger mutation sets
- Behavior vs implementation testing

**Deliverables:**
- [ ] Wave 2 and Wave 3 files in Stryker config
- [ ] Combined mutation score >75%
- [ ] Performance optimizations applied
- [ ] `PHASE86_LEARNING_NOTES.md` - Documentation

**Success Criteria:**
- [ ] All 9 target files included in mutation testing
- [ ] Combined mutation score >75%
- [ ] Runtime <20 min for full scope
- [ ] 10-20 new tests added to kill mutants

---

### **Phase 87: E2E Mutation Testing Exploration** (1-2 sessions)

Experimental research phase to assess feasibility of E2E mutation testing.

**Status:** Experimental / Research (after Phase 86)

**Key Features:**
- Manual mutation testing against Playwright E2E tests
- Feasibility and value assessment
- Custom Stryker runner exploration (optional)
- Decision framework for future investment

**Learning Objectives:**
- Mutation testing limitations
- E2E testing value assessment
- Research methodology
- Evidence-based decision making

**Deliverables:**
- [ ] 9 mutations manually tested against E2E
- [ ] Analysis document with findings
- [ ] Recommendation: pursue further or stop
- [ ] `PHASE87_LEARNING_NOTES.md` - Documentation

**Success Criteria:**
- [ ] Can answer: Do E2E tests catch mutations unit tests miss?
- [ ] Can answer: Is automated E2E mutation testing feasible?
- [ ] Clear recommendation for ongoing strategy

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
| Phase 48 | 2-3 | JSDoc Type Checking | Ready |
| Phase 50 | 3-4 | Maestro Testing | Ready |
| Phase 60 | 3-4 | Monetization | Ready |
| Phase 80 | 1 | Test Coverage | ✅ Complete |
| Phase 85 | 2-3 | Mutation Testing Setup | Ready |
| Phase 86 | 3-4 | Mutation Testing Expansion | Ready (after 85) |
| Phase 87 | 1-2 | E2E Mutation Exploration | Experimental |
| **Total** | **~40-56** | **Full Epic** | |

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
13. **Phase 48** - JSDoc Type Checking
14. **Phase 50** - Maestro Testing
15. **Phase 60** - Monetization (after user base grows)

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
- [ ] Maestro tests in CI
- [ ] Monetization ready (if desired)

### User-Facing Milestones
- [x] Easier OpenRouter setup ✅
- [x] App available in user's language ✅
- [ ] Stable, bug-free experience
- [x] Clear onboarding flow ✅

### Business Milestones
- [ ] App on Play Store (production)
- [ ] Growing user base
- [ ] Revenue stream established (optional)
- [ ] Feedback loop with users

---

## Parking Lot (Deferred to Future Epics)

The following items remain in the parking lot for consideration in future epics:

- **PHASE7_AZURE_MIGRATION.md** - Azure Functions as alternative backend
- **PHASE8_OAUTH.md** - OAuth integration (if Anthropic enables it)
- **PHASE3.7_OPENAI_INTEGRATION.md** - OpenAI as provider option
- **IOS_APP_STORE.md** - iOS App Store publishing

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
- `PHASE22_LANDING_PAGE_ANALYTICS.md`
- `PHASE30_I18N.md`
- `PHASE40_TELEMETRY.md`
- `PHASE46_CONFIGURABLE_QUESTION_COUNT.md`
- `PHASE48_JSDOC_CONFIGURATION.md`
- `PHASE50_MAESTRO_TESTING.md`
- `PHASE60_MONETIZATION.md`
- `PHASE80_TEST_COVERAGE.md`
- `PHASE85_MUTATION_TESTING.md`
- `PHASE86_MUTATION_TESTING_EXPANSION.md`
- `PHASE87_MUTATION_TESTING_E2E_EXPLORATION.md`

---

**Note**: This epic focuses on **maintenance and enhancement** of a live product. Quality, stability, and user experience are paramount. Take time to fix issues properly rather than shipping quickly.

**Ready to enhance Saberloop V1?**
