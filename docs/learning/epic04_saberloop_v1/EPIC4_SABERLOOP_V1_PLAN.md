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
2. **i18next** - Internationalization for multi-language support
3. **dependency-cruiser** - Architecture testing and enforcement
4. **Maestro** - Comprehensive mobile UI testing
5. **Google AdSense** - Non-intrusive monetization
6. **Self-hosted Telemetry** - VPS-based observability without paid services

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
│  │ (Phase 10)       │  │ (Phase 30)       │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  Developer Experience                                       │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Architecture     │  │ Maestro Testing  │                │
│  │ Testing          │  │ Expansion        │                │
│  │ (Phase 20)       │  │ (Phase 50)       │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  Infrastructure                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Telemetry        │  │ Monetization     │                │
│  │ Enhancement      │  │ Strategy         │                │
│  │ (Phase 40)       │  │ (Phase 60)       │                │
│  └──────────────────┘  └──────────────────┘                │
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

**Status:** In Progress (14-day closed testing: Dec 17-31) | Day 3 | 9/12 testers

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

### **Phase 10: OpenRouter Onboarding UX** (2-3 sessions)

Improve the OpenRouter connection experience with guided step-by-step instructions.

**Status:** Ready to Implement

**Key Features:**
- New "OpenRouter Free Account Guide" view
- Step-by-step visual instructions
- Multiple entry points (Welcome, Settings, Homepage)
- "Connection Confirmed!" celebration screen
- Feature flags for gradual rollout

**Learning Objectives:**
- Feature flag implementation (hand-rolled)
- Multi-step onboarding UX patterns
- OAuth flow enhancement
- Gradual feature rollout

**Deliverables:**
- [ ] `src/core/features.js` - Feature flag system
- [ ] `src/views/OpenRouterGuideView.js` - Guide with step cards
- [ ] `src/views/ConnectionConfirmedView.js` - Success screen
- [ ] Integration with existing Welcome and Settings views
- [ ] E2E tests for new flows

**Success Criteria:**
- Users guided through OpenRouter signup without confusion
- "Skip payment" step clearly highlighted
- Feature can be toggled via flags
- All existing tests pass

---

### **Phase 20: Architecture Testing** (3-4 sessions)

Implement architecture testing using dependency-cruiser to enforce structural rules.

**Status:** Ready to Implement

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
- [ ] `.dependency-cruiser.cjs` - Rule configuration
- [ ] `src/architecture.test.js` - Vitest integration
- [ ] GitHub Actions integration
- [ ] `docs/architecture/ARCHITECTURE_RULES.md`
- [ ] Services layer skeleton (optional)

**Success Criteria:**
- No circular dependencies
- Layer boundaries documented
- CI fails on architecture violations
- Transition rules for future refactoring

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
| Phase 10 | 2-3 | OpenRouter Onboarding | Ready |
| Phase 20 | 3-4 | Architecture Testing | Ready |
| Phase 30 | 8-11 | Internationalization | Ready |
| Phase 40 | 4-6 | Telemetry Enhancement | Ready |
| Phase 50 | 3-4 | Maestro Testing | Ready |
| Phase 60 | 3-4 | Monetization | Ready |
| **Total** | **~25-35** | **Full Epic** | |

**Note:** Phase numbers use intervals of 10 to allow for inserting new phases if needed.

---

## Recommended Order

While phases can be worked on in any order, here's a suggested priority:

1. **Phase 5** - Complete Play Store release (ongoing, mostly waiting)
2. **Phase 10** - OpenRouter Onboarding (high user impact, quick win)
3. **Phase 20** - Architecture Testing (foundation for code quality)
4. **Phase 50** - Maestro Testing (builds on Phase 20)
5. **Phase 30** - i18n (larger effort, high user impact)
6. **Phase 40** - Telemetry (nice to have for debugging)
7. **Phase 60** - Monetization (after user base grows)

---

## Success Criteria (Epic 4 Complete)

### Technical Milestones
- [ ] Production release on Google Play Store
- [ ] OpenRouter onboarding improved
- [ ] Architecture rules enforced in CI
- [ ] 5+ languages supported
- [ ] Self-hosted telemetry operational
- [ ] Maestro tests in CI
- [ ] Monetization ready (if desired)

### User-Facing Milestones
- [ ] Easier OpenRouter setup
- [ ] App available in user's language
- [ ] Stable, bug-free experience
- [ ] Clear onboarding flow

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
- `PHASE20_ARCH_TESTING.md`
- `PHASE30_I18N.md`
- `PHASE40_TELEMETRY.md`
- `PHASE50_MAESTRO_TESTING.md`
- `PHASE60_MONETIZATION.md`

---

**Note**: This epic focuses on **maintenance and enhancement** of a live product. Quality, stability, and user experience are paramount. Take time to fix issues properly rather than shipping quickly.

**Ready to enhance Saberloop V1?**
