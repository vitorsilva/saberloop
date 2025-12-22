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
5. **Maestro** - Comprehensive mobile UI testing
6. **Google AdSense** - Non-intrusive monetization
7. **Self-hosted Telemetry** - VPS-based observability without paid services

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

**Status:** Ready to Implement

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
- [ ] `src/core/i18n.js` - i18next configuration
- [ ] `public/locales/` - Translation files (en, pt, es, fr, de)
- [ ] `src/utils/formatters.js` - Locale-aware formatters
- [ ] `scripts/translate.js` - CLI translation tool
- [ ] All views updated with `t()` function
- [ ] E2E tests migrated to data-testid
- [ ] Language selector in Settings

**Success Criteria:**
- 5+ languages supported
- UI updates immediately on language change
- Quiz questions generated in selected language
- All tests pass regardless of language
- CLI can generate new translations

---

### **Phase 40: Telemetry Enhancement** (4-6 sessions)

Self-hosted observability solution using VPS + local Docker analysis.

**Status:** Ready to Implement

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

**Deliverables:**
- [ ] `src/utils/telemetry.js` - Browser telemetry client
- [ ] VPS: `/telemetry/ingest.php` - Ingest endpoint
- [ ] `docker-compose.telemetry.yml` - Analysis stack
- [ ] `scripts/telemetry/` - Download and import scripts
- [ ] Grafana dashboards

**Success Criteria:**
- Telemetry data persisted on VPS
- Can analyze logs/traces/metrics locally
- Zero additional monthly cost
- Sensitive data still redacted

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

## Estimated Timeline

| Phase | Sessions | Focus | Status |
|-------|----------|-------|--------|
| Phase 5 | Ongoing | Epic03 Pending | In Progress |
| Phase 10 | 2-3 | OpenRouter Onboarding | ✅ Complete |
| Phase 15 | 2-3 | Dead Code Detection | ✅ Complete |
| Phase 20 | 3-4 | Architecture Testing | ✅ Complete |
| Phase 25 | 2-3 | Services Layer | ✅ Complete |
| Phase 30 | 8-11 | Internationalization | Ready |
| Phase 40 | 5-8 | Telemetry Enhancement | In Progress |
| Phase 50 | 3-4 | Maestro Testing | Ready |
| Phase 60 | 3-4 | Monetization | Ready |
| **Total** | **~30-42** | **Full Epic** | |

**Note:** Phase numbers use intervals of 10 to allow for inserting new phases if needed.

---

## Recommended Order

While phases can be worked on in any order, here's a suggested priority:

1. **Phase 5** - Complete Play Store release (ongoing, mostly waiting)
2. **Phase 10** - OpenRouter Onboarding (high user impact, quick win) ✅ Complete
3. **Phase 15** - Dead Code Detection (cleanup before architecture rules)
4. **Phase 20** - Architecture Testing (foundation for code quality)
5. **Phase 50** - Maestro Testing (builds on Phase 20)
6. **Phase 30** - i18n (larger effort, high user impact)
7. **Phase 40** - Telemetry (nice to have for debugging)
8. **Phase 60** - Monetization (after user base grows)

---

## Success Criteria (Epic 4 Complete)

### Technical Milestones
- [ ] Production release on Google Play Store
- [x] OpenRouter onboarding improved ✅
- [x] Dead code detected and cleaned up ✅
- [x] Architecture rules enforced in CI ✅
- [ ] 5+ languages supported
- [ ] Self-hosted telemetry operational
- [ ] Maestro tests in CI
- [ ] Monetization ready (if desired)

### User-Facing Milestones
- [x] Easier OpenRouter setup ✅
- [ ] App available in user's language
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
- `PHASE30_I18N.md`
- `PHASE40_TELEMETRY.md`
- `PHASE50_MAESTRO_TESTING.md`
- `PHASE60_MONETIZATION.md`

---

**Note**: This epic focuses on **maintenance and enhancement** of a live product. Quality, stability, and user experience are paramount. Take time to fix issues properly rather than shipping quickly.

**Ready to enhance Saberloop V1?**
