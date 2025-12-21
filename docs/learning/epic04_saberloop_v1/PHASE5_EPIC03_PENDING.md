# Phase 5: Epic03 Pending Items - Play Store & Validation

**Epic:** 4 - Saberloop V1
**Phase:** 5 - Epic03 Pending Items
**Status:** In Progress
**Created:** 2025-12-19

---

## Overview

This phase contains the pending and ongoing items from Epic03 that need to be completed. These are primarily related to the Play Store release process and user validation.

---

## Background

Epic03 (QuizMaster V2) achieved its core goals:
- Real AI integration via OpenRouter
- Production deployment at saberloop.com
- Google Play Store submission (Closed Testing approved)
- Professional branding and identity
- Comprehensive observability and testing

However, the following items remain to be completed:

---

## Pending Items

### 5.1 Play Store: Complete Closed Testing (In Progress)

**Status:** Day 5 of 14-day testing period (Dec 17-31, 2025)

**Tester Progress:** 9 of 12 required testers participating (need 3 more)

**What's Done:**
- [x] Domain & hosting setup (saberloop.com)
- [x] Google Play Developer account verified
- [x] PWABuilder package generated (AAB + signing keys)
- [x] Digital Asset Links configured (no address bar!)
- [x] Store listing complete (screenshots, descriptions, video)
- [x] Privacy policy published
- [x] Content rating & data safety completed
- [x] Internal testing published and verified
- [x] Closed testing submitted and approved by Google
- [x] 14 testers invited via WhatsApp
- [x] Android 15/16 warnings investigated and documented
- [x] OpenRouter follow-up message sent to testers (Day 3)

**What's Remaining:**
- [ ] Recruit 3 more testers to meet 12-tester minimum
- [ ] Monitor tester feedback during 14-day period
- [ ] Address any critical bugs reported
- [ ] Collect usage metrics and feedback

**Timeline:** Dec 17-31, 2025

**Success Criteria:**
- At least 10 testers have installed and used the app
- No critical bugs blocking production release
- Feedback collected and documented

---

### 5.2 Play Store: Production Release

**Status:** Blocked (waiting for closed testing to complete)

**Prerequisites:**
- [x] Closed testing approved
- [ ] 14-day closed testing period completed
- [ ] Critical bugs fixed (if any)
- [ ] Tester feedback addressed

**Steps:**
1. [ ] Apply for production access in Google Play Console
2. [ ] Prepare production release notes
3. [ ] Submit app to production track
4. [ ] Wait for Google review (typically 3-7 days)
5. [ ] Production release goes live

**Expected Timeline:** Early January 2025

**Success Criteria:**
- App available on Google Play Store for all users
- No critical issues in first week post-launch

---

### 5.3 User Validation (Phase 6 from Epic03)

**Status:** Running concurrently with closed testing

**Goals:**
- Collect feedback from real users (family members)
- Identify usability issues
- Prioritize improvements for future development

**Activities:**

#### Feedback Collection
- [ ] Create simple feedback form (Google Forms or similar)
- [ ] Share with testers during closed testing
- [ ] Schedule brief interviews with 3-5 testers
- [ ] Document common pain points and feature requests

#### Metrics to Track
- Quizzes created per user
- Completion rate (started vs finished)
- Error rate (API failures, crashes)
- Feature usage patterns

#### Iteration Plan
- Address critical bugs immediately
- Document enhancement requests for future phases
- Update documentation based on user questions

**Success Criteria:**
- Feedback collected from at least 5 users
- Top 3 pain points identified
- Improvement roadmap created

---

## Files and Resources

**Related Documentation:**
- `docs/learning/epic03_quizmaster_v2/PHASE9_PLAYSTORE_PUBLISHING.md`
- `docs/learning/epic03_quizmaster_v2/PHASE6_VALIDATION.md`
- `docs/learning/epic03_quizmaster_v2/PHASE9_LEARNING_NOTES.md`
- `docs/issues/android-15-16-warnings.md` - Android 15/16 compatibility investigation

**Key Links:**
- [Google Play Console](https://play.google.com/console)
- [Saberloop Production](https://saberloop.com/app/)
- [GitHub Repository](https://github.com/vitorsilva/saberloop)

---

## Progress Tracking

| Item | Status | Target Date | Notes |
|------|--------|-------------|-------|
| Closed Testing Period | In Progress | Dec 31, 2025 | Day 5 of 14 |
| Production Submission | Pending | Jan 1-3, 2025 | After testing |
| Production Approval | Pending | Jan 3-10, 2025 | 3-7 day review |
| User Validation | In Progress | Dec 31, 2025 | Parallel with testing |

---

## Notes

- This phase is mostly about waiting and monitoring
- Use this time to work on other Epic04 phases
- Keep checking Play Console for tester feedback
- Document any issues that arise for future reference

---

## Session Log

### 2025-12-19: Android 15/16 Warnings Investigation

**What was done:**
- Reviewed Play Console warnings for Android 15 (SDK 35) and Android 16 compatibility
- Investigated three warnings:
  1. Edge-to-edge display may not work for all users
  2. Deprecated APIs for edge-to-edge presentation
  3. Resizing/orientation restrictions for large screens
- Researched PWABuilder GitHub issues (found #4863 - marked done but still affecting users)
- Confirmed root cause is PWABuilder/Bubblewrap templates, not our PWA code
- Documented findings in `docs/issues/android-15-16-warnings.md`

**Key findings:**
- Warnings are from PWABuilder-generated wrapper, not our code
- No action needed - warnings don't block production release
- PWABuilder team aware but fix still pending
- Will need to regenerate AAB when PWABuilder releases updated templates

**Current status:**
- 9 of 12 testers participating (need 3 more)
- Day 3 of 14-day closed testing period
- No critical bugs reported yet

**Next steps:**
- Recruit 3 more testers to meet minimum requirement
- Continue monitoring tester feedback
- Consider starting Phase 10 (OpenRouter Onboarding) while waiting

---

### 2025-12-19: OpenRouter Follow-up Message Sent

Sent the OpenRouter setup reminder to testers via WhatsApp:

```
Olá! Já conseguiste experimentar a app?

Para criar quizzes sobre qualquer tema, precisas de ligar ao OpenRouter (é grátis):
1. Abre Definições na app
2. Clica em "Connect to OpenRouter"
3. Cria conta ou faz login

Depois podes gerar quizzes sobre qualquer tema que quiseres!

Se tiveres dúvidas, diz-me que eu ajudo. 😊
```

**Purpose:** Help testers discover the full app functionality (AI-generated quizzes) beyond sample quizzes.

**Awaiting:** Tester responses and feedback.

---

---

## 5.4 Landing Page: Dual Installation Options ✅

**Status:** Complete (2025-12-19)

**Goal:** Add Google Play Store and direct APK download buttons to the landing page.

### UI Changes (Schematic)

**Hero Section - BEFORE:**
```
┌─────────────────────────────────────────────────────────┐
│   Learn Anything, Practice Anything    [Phone Screenshot]│
│   AI-powered quizzes on any topic...                    │
│                                                         │
│   [Try Web App Free]  [View on GitHub]                  │
└─────────────────────────────────────────────────────────┘
```

**Hero Section - AFTER:**
```
┌─────────────────────────────────────────────────────────┐
│   Learn Anything, Practice Anything    [Phone Screenshot]│
│   AI-powered quizzes on any topic...                    │
│                                                         │
│   [▶ Get on Play Store]  [⬇ Download APK]               │
│                                                         │
│        Or try in your browser - no install needed       │
└─────────────────────────────────────────────────────────┘
```

**CTA Section (Bottom) - BEFORE:**
```
┌─────────────────────────────────────────────────────────┐
│             Ready to Start Learning?                    │
│        No sign-up required. Try it free right now.      │
│                                                         │
│               [Launch Saberloop]                        │
└─────────────────────────────────────────────────────────┘
```

**CTA Section (Bottom) - AFTER:**
```
┌─────────────────────────────────────────────────────────┐
│             Ready to Start Learning?                    │
│        No sign-up required. Get the app now.            │
│                                                         │
│   [▶ Get on Play Store]  [⬇ Download APK]               │
│                                                         │
│        Or try in your browser - no install needed       │
└─────────────────────────────────────────────────────────┘
```

### Implementation Plan

#### Step 1: Host APK for Download
- Copy APK to `landing/downloads/saberloop-v1.0.0.apk`
- The `landing/` folder deploys via FTP (`npm run deploy:landing`)

#### Step 2: Update Hero Section
- Replace "Try Web App Free" → "Get on Play Store" (primary)
- Replace "View on GitHub" → "Download APK" (secondary)
- Add Play Store and Download SVG icons to buttons
- Add text link: "Or try in your browser - no install needed"

#### Step 3: Update Bottom CTA Section
- Same dual buttons as hero
- Change text from "Try it free right now" → "Get the app now"
- Add browser link below buttons

#### Step 4: Add CSS for new elements
- Style for `.web-link` text below buttons
- Ensure button icons align properly

### Files to Modify

| File | Changes |
|------|---------|
| `landing/index.html` | Hero buttons, CTA section, add icons |
| `landing/downloads/saberloop-v1.0.0.apk` | New file (copy from package/) |

### Deployment

```bash
npm run deploy:landing   # FTP deploy to saberloop.com
```

### Decisions

1. **Play Store Link**: Use real Play Store URL now (non-testers will see "not available" - acceptable during closed testing)

### Success Criteria

- [x] Landing page has Play Store button with icon
- [x] Landing page has APK download button with icon
- [x] "Try in browser" link visible in both sections
- [x] APK downloads correctly
- [x] Mobile-friendly layout preserved

---

---

### 2025-12-19: Landing Page Dual Installation Options

**What was done:**
- Added Google Play Store button with Play icon (SVG)
- Added APK download button with download icon (SVG)
- Added "try in your browser" links below both button groups
- Hosted APK at `landing/downloads/saberloop-v1.0.0.apk`
- Fixed Play Store URL: `com.pwabuilder.pwa.saberloop` → `com.saberloop.app`
- Deployed to saberloop.com via FTP

**Files changed:**
- `landing/index.html` - Hero section, CTA section, CSS styles
- `landing/downloads/saberloop-v1.0.0.apk` - New file

**Next session:**
- Continue monitoring closed testing (Day 3 of 14)
- Recruit 3 more testers (9/12 currently)
- Consider starting Phase 10 (OpenRouter Onboarding UX)

---

### 2025-12-21: Issue #16 - Sticky Navigation Fix

**Issue:** #16 - Bottom navigation should be always visible on all pages

**Problem:** Bottom navigation was disappearing when scrolling on Home and Settings pages due to CSS `position: sticky` not working reliably with varying container structures.

**Solution:** Changed bottom navigation from `sticky` to `fixed` positioning across all 5 views:
- `HomeView.js` - Removed `h-auto`, `sticky` → `fixed`
- `SettingsView.js` - Removed `h-auto`, `sticky` → `fixed`
- `TopicsView.js` - `sticky` → `fixed`
- `TopicInputView.js` - `sticky` → `fixed`
- `QuizView.js` - `sticky` → `fixed`

**Testing:**
- All 26 E2E tests pass
- Manual verification on all pages

**PR:** https://github.com/vitorsilva/saberloop/pull/20
**Documentation:** `docs/issues/16.md`
**Status:** Merged and deployed to production

---

**Last Updated:** 2025-12-21
