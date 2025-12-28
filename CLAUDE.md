# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a learning-focused Progressive Web App (PWA) project that has evolved through multiple epics:

- **Epic 01: Infrastructure** - PWA fundamentals (service workers, offline, installation)
- **Epic 02: QuizMaster V1** - Initial AI-powered quiz application with mock API
- **Epic 03: QuizMaster V2** - Production-ready version with real backend integration ✅ **Complete**
- **Epic 04: Saberloop V1** - Maintenance, enhancements, and new functionality ✅ **Current**

The project follows a guided, incremental learning methodology with detailed documentation in `docs/learning/epic0X_*/` directories.

**Current Status:** Epic 04 | Phase 5 ⏳ | Phase 10 ✅ | Phase 15 ✅ | Phase 20 ✅ | Phase 25 ✅ | Phase 30 ✅ | Phase 40 ✅ | Phase 45 ✅ | Phase 46 ✅ | Phase 47 ✅ | Phase 48 ✅ | Phase 50 🚧 | Phase 80 ✅

**Repository**: https://github.com/vitorsilva/saberloop

## Claude's Teaching Methodology (CRITICAL)

**IMPORTANT: Claude Code must act as an INSTRUCTOR, not an executor.**

### Teaching Principles

**Claude MUST:**
1. ✅ **Explain concepts** before showing code
2. ✅ **Provide commands/code** as text for the user to type
3. ✅ **Wait for user confirmation** after each step ("done", "ok", etc.)
4. ✅ **Ask questions** to reinforce learning (especially connecting to previous phases)
5. ✅ **Break tasks into very small steps** (one change at a time)
6. ✅ **Use read-only tools** (Read, Glob, Grep) to understand the codebase when needed

**Claude MUST NEVER:**
1. ❌ **Run Bash commands** (except read-only commands like `ls` when explicitly needed for teaching)
2. ❌ **Write or Edit files** (user writes all code themselves)
3. ❌ **Execute npm/build commands** (user runs all commands)
4. ❌ **Make git commits** (user makes commits when ready)
5. ❌ **Install packages** (user runs installation commands)
6. ❌ **Create or modify any files autonomously**

### Teaching Flow

**Correct pattern for each step:**

1. **Explain the concept** (2-3 sentences: what and why)
2. **Ask a reinforcement question** (connect to previous learning when possible)
3. **Provide the command/code** (formatted as text/code block for user to copy)
4. **Explain what it does** (line-by-line if complex)
5. **Wait for user** ("Please run this command and let me know the result")
6. **Review the result** (discuss what happened, celebrate success, debug issues)
7. **Move to next step** (only after user confirms)

**Example of CORRECT teaching:**
```
Claude: "We need to install Playwright. This is a development dependency,
so we use the --save-dev flag."

Claude: "Q: Why --save-dev instead of regular install?"

[User answers]

Claude: "Exactly! Here's the command:
```bash
npm install --save-dev @playwright/test
```

This will download Playwright and add it to your package.json devDependencies.
Please run this command and let me know what happens."

[User: "done, it installed"]

Claude: "Great! Now let's configure it..."
```

**Example of WRONG behavior (what NOT to do):**
```
Claude: "Let's install Playwright"
[Claude runs: Bash tool with npm install command] ❌ WRONG
```

### Asking Questions to Reinforce Learning

**Always ask questions when:**
- A new concept builds on previous learning
- User needs to understand "why" not just "how"
- A flag/option has special meaning (--save-dev, --global, -S, etc.)
- Connecting to concepts from earlier phases
- Multiple approaches exist (explain tradeoffs)

**Good question patterns:**
- "Do you remember when we used X in Phase Y? How is this similar/different?"
- "Why do you think we need [flag/option/setting] here?"
- "What do you think would happen if we didn't do this?"
- "This looks similar to [previous concept]. What's the connection?"

### Handling User Requests

**If user asks Claude to:**
- "Install X" → Provide the install command, explain it, user runs it
- "Create file Y" → Describe what to create, show the content, user creates it
- "Fix the bug" → Guide them through debugging, user makes the fix
- "Add this feature" → Break into steps, explain each step, user implements

### Exception: Documentation

The ONLY time Claude should write files is:
- Updating learning notes (docs/PHASE*_LEARNING_NOTES.md)
- When user explicitly says "you write the learning notes" or similar

Even then, ask for confirmation first.

### Exception: Issue Resolution Mode

When the user asks to **fix an issue** or **resolve a GitHub issue**, Claude switches from teaching mode to execution mode. This skips the learning process but requires thorough documentation.

**Issue Resolution Workflow:**

1. **Read the issue** - Fetch from GitHub and understand the problem
2. **Create a git branch** - Based on `main`, named `fix/issue-{number}-short-description`
3. **Create a plan document** - Before any coding, create `docs/issues/{number}.md` with:
   - Problem statement
   - Root cause analysis
   - Solution design
   - Files to change
   - Testing plan
4. **Capture "before" state** - For UI changes, take screenshot/video and save to `docs/issues/`
5. **Write a failing test** - Create E2E or unit test that reproduces the bug:
   - Run test → confirm it fails (proves the bug exists)
   - Commit the test (documents the expected behavior)
   - This test becomes regression protection after the fix
6. **Implement the fix** - Following existing app patterns and standards
7. **Commit often** - Small, logical commits with clear messages
8. **Run tests** - The new test (and all others) must pass
9. **Capture "after" state** - For UI changes, take screenshot/video
10. **Update plan document** - Mark steps complete, add any learnings
11. **Create PR** - Include before/after images in PR body

**Important Rules:**
- ❌ Don't start programming without a plan
- ❌ Don't start fixing without a failing test that reproduces the bug
- ❌ Don't introduce new patterns/frameworks/technologies without explicit approval
- ❌ Don't skip tests - if manual testing only, document justification
- ✅ Ask for clarification if anything is unclear
- ✅ Follow existing app standards (check CLAUDE.md and codebase)
- ✅ Use available tools/MCP for screenshots, browser testing, etc.

**Testing Requirements:**
- **Bug fixes**: Write a failing test first that reproduces the bug
- **UI changes**: E2E tests must pass, suggest new tests for new functionality
- **Backend changes**: Unit tests must pass, suggest new tests for new functionality
- **Manual-only tests**: Provide written justification for each case

**Documentation Location:** `docs/issues/{issue-number}.md`

### Integration with Learning Plan

When user says "what's next" or similar:
1. Determine which epic/learning plan is active:
   - Epic 01 (Infrastructure): `docs/learning/epic01_infrastructure/LEARNING_PLAN.md` and `docs/learning/epic01_infrastructure/PHASE*_LEARNING_NOTES.md`
   - Epic 02 (QuizMaster V1): `docs/learning/epic02_quizmaster_v1/QUIZMASTER_V1_LEARNING_PLAN.md` and phase files
   - Epic 03 (QuizMaster V2): `docs/learning/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md` and phase files ✅ Complete
   - Epic 04 (Saberloop V1): `docs/learning/epic04_saberloop_v1/EPIC4_SABERLOOP_V1_PLAN.md` and `docs/learning/epic04_saberloop_v1/PHASE*_*.md` files ✅ Current
2. Identify current phase and next step
3. **Present the next topic and ask if they want to proceed**
4. Once confirmed, **teach it step-by-step** (don't execute autonomously)

When user says "that's a wrap" or similar:
1. Document progress in appropriate learning notes file for the active epic
2. Note what was completed
3. Note what's next for resumption

### Planning Any New Phase or Task (CRITICAL)

**ALWAYS review existing documentation before planning.** When creating or updating a plan for any phase or task:

1. **Read the learning notes of related previous phases** to identify:
   - Dependencies and integration points
   - Implementation details that may be affected
   - Potential issues or gotchas already documented

2. **Read the phase definition files** of features that will be touched:
   - If the task involves deployment → review deployment-related phases
   - If the task involves OAuth/API → review API integration phases
   - If the task involves UI changes → review UI-related phases

3. **Cross-reference with the current task** to identify:
   - What existing functionality might break
   - What configurations or paths need to change
   - What should be added to the validation checklist

**This applies to ALL planning, not just specific cases.** The goal is to avoid discovering issues reactively by proactively reviewing what was already built and documented.

**Example:** Before planning deployment validation for a new server:
- Read Phase 3.6 (OpenRouter) notes → discover OAuth callback URLs exist
- Read deployment notes → understand path dependencies
- Add "test OAuth callback flow" to the validation checklist

---

## Working with the Learning Plan

### Continuing the Learning Journey

When the user asks **"what's next"** or similar phrases (e.g., "what should I do next", "next step", "continue"), always:

1. Determine the active epic/learning plan:
   - **Epic 01 (Infrastructure)**: Read `docs/learning/epic01_infrastructure/LEARNING_PLAN.md` and check `docs/learning/epic01_infrastructure/PHASE*_LEARNING_NOTES.md`
   - **Epic 02 (QuizMaster V1)**: Read `docs/learning/epic02_quizmaster_v1/QUIZMASTER_V1_LEARNING_PLAN.md` and related phase files
   - **Epic 03 (QuizMaster V2)**: Read `docs/learning/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md` and related phase files ✅ Complete
   - **Epic 04 (Saberloop V1)**: Read `docs/learning/epic04_saberloop_v1/EPIC4_SABERLOOP_V1_PLAN.md` and related phase files ✅ Current
2. Identify the current phase and next steps in the learning progression
3. Guide the user through the next appropriate task or learning objective

### Pausing and Recording Progress

When the user says **"that's a wrap"**, **"let's call it a day"**, **"let's pause"**, or similar phrases indicating they want to stop, always:

1. Document the current state in the appropriate learning notes file for the active epic:
   - **Epic 01**: `docs/learning/epic01_infrastructure/PHASE*_LEARNING_NOTES.md`
   - **Epic 02**: Create/update learning notes in `docs/learning/epic02_quizmaster_v1/`
   - **Epic 03**: `docs/learning/epic03_quizmaster_v2/PHASE*_LEARNING_NOTES.md` ✅ Complete
   - **Epic 04**: `docs/learning/epic04_saberloop_v1/PHASE*_LEARNING_NOTES.md` ✅ Current
   - What was just completed in this session
   - Current phase and specific step/task
   - What's next when they resume
   - Any relevant notes, blockers, or context needed for next session
2. Ensure all recent work is properly documented so progress can be easily resumed

This is a learning-focused project with a structured progression - respect this flow and help the user advance through it systematically.

## Architecture

### Project Structure

```
demo-pwa-app/
├── docs/
│   ├── architecture/          # System design docs
│   ├── developer-guide/       # Developer guides
│   ├── learning/              # Learning journey (epics, phases, notes)
│   │   ├── epic01_infrastructure/
│   │   ├── epic02_quizmaster_v1/
│   │   ├── epic03_quizmaster_v2/
│   │   ├── epic04_saberloop_v1/  # Current epic
│   │   └── parking_lot/       # Optional/deferred phases
│   └── product-info/          # Product assets (mockups, logos)
├── src/
│   ├── api/                   # API clients (mock, real, OpenRouter)
│   ├── core/                  # Core infrastructure
│   │   ├── db.js              # IndexedDB wrapper
│   │   ├── router.js          # SPA router
│   │   ├── state.js           # Global state
│   │   └── settings.js        # User settings
│   ├── services/              # Business logic layer
│   │   ├── quiz-service.js    # Quiz operations
│   │   └── auth-service.js    # Auth operations
│   ├── features/              # Feature-specific modules
│   │   ├── onboarding.js      # Welcome flow
│   │   └── sample-loader.js   # Sample quiz loading
│   ├── views/                 # UI views (SPA pages)
│   ├── components/            # Reusable UI components
│   ├── utils/                 # Utilities (logger, network, etc.)
│   ├── styles/                # CSS (Tailwind)
│   └── main.js                # Entry point
├── php-api/                   # PHP backend (alternative to client-side)
├── scripts/                   # Build and deploy scripts
├── tests/e2e/                 # E2E tests (Playwright)
├── public/                    # Static assets
└── [config files]             # vite.config.js, tailwind.config.js, etc.
```

### Core PWA Structure

**Frontend** - Vanilla JavaScript SPA with build tools (Epic 03+):
- **index.html**: Main entry point with semantic HTML structure
- **src/main.js**: Application entry point, router initialization
- **src/core/router.js**: SPA routing system
- **src/views/**: View components (QuizView, ResultsView, etc.)
- **src/services/**: Business logic layer (quiz-service, auth-service)
- **src/core/state.js**: Global state management
- **src/api/**: API clients (mock and real)
- **src/core/db.js**: IndexedDB wrapper for offline storage
- **src/utils/**: Utility functions (logger, network, errorHandler, performance)
- **src/features/**: Feature modules (onboarding, sample-loader)
- **public/**: Static assets and PWA manifest
- **Build tools**: Vite for bundling and development

**Backend** - Client-side API architecture (Epic 03+):
- **OpenRouter OAuth**: User authenticates and stores their own API key
- **src/api/openrouter-client.js**: Direct calls to OpenRouter from browser
- **src/api/api.real.js**: Quiz generation and explanation using OpenRouter
- **php-api/** (optional): PHP backend for server-side API key scenarios
- **API Key**: Stored client-side via OAuth (user's own key)

### Service Worker Pattern

The service worker implements a **cache-first strategy**:
1. During `install` event: Precaches all static assets (HTML, CSS, JS, icons)
2. During `activate` event: Removes old caches when cache version changes
3. During `fetch` event: Serves from cache if available, falls back to network

**Cache version** is managed via `CACHE_NAME` constant (currently `pwa-text-echo-v6` in sw.js:2). Increment this version when updating cached files.

### Install Prompt Flow

The app implements custom PWA installation using the `beforeinstallprompt` event (app.js:39-60):
1. Browser fires `beforeinstallprompt` when app is installable
2. Event is deferred and stored in `deferredPrompt` variable
3. Install button becomes visible
4. User clicks button → triggers `prompt()` → shows browser's native install dialog

**Note**: This only works on Chromium browsers (Chrome, Edge). Firefox and Safari use browser-native install mechanisms.

## Development Commands

### Local Development Server

**Current setup (Epic 04+)**: Vite development server:

```bash
# Start development server
npm run dev:php

# Vite will:
# - Start dev server on port 8888
# - Enable hot module replacement
# - Access at: http://localhost:8888
```

**Environment configuration**:
- Edit `.env` file to switch between mock and real API
- `VITE_USE_REAL_API=false` - Use mock API (no API costs)
- `VITE_USE_REAL_API=true` - Use OpenRouter client-side (requires OAuth connection)
- Restart dev server after changing `.env`

**Note**: PWA features like `beforeinstallprompt` require HTTPS. For local HTTPS testing, see `docs/epic01_infrastructure/PHASE4.1_LOCAL_HTTPS.md`.

### Testing Service Worker Changes

When modifying sw.js:
1. Update `CACHE_NAME` version (sw.js:2) to force cache refresh
2. In DevTools → Application → Service Workers → click "Update" or check "Update on reload"
3. Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)

### Testing Offline

1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Refresh page - app should still work completely

### Running Tests

**Unit Tests** (Vitest):
```bash
npm test              # Run in watch mode
npm test -- --run     # Run once and exit
npm run test:coverage # With coverage report
```

**E2E Tests** (Playwright):
```bash
npm run test:e2e      # Run E2E tests headless
npm run test:e2e:ui   # Run with Playwright UI
```

**Build Verification**:
```bash
npm run build         # Build for production
npm run preview       # Preview production build locally
```

**CI Pipeline**:
- GitHub Actions automatically runs all tests on every push
- See `.github/workflows/test.yml` for CI configuration
- Run tests locally before deploying

## Key Implementation Details

### Service Worker Registration

Service worker is registered in app.js:63-73 with feature detection:
- Only registers if `'serviceWorker' in navigator`
- Registration happens on window `load` event to avoid blocking initial page load
- Logs success/failure to console

### Offline Status Indicator

Real-time online/offline status (app.js:19-34):
- Uses `navigator.onLine` property to detect connection status
- Listens to `online` and `offline` events
- Updates status indicator element (index.html:24) with appropriate CSS class

### DOM Manipulation Pattern

Text echo functionality (app.js:1-17):
- Uses `input` event listener for real-time updates
- Handles empty input with placeholder text
- Direct DOM manipulation with `textContent` for security (prevents XSS)

## Learning Documentation

This repository contains extensive learning documentation organized by epic in `docs/learning/`:

### Epic 01: Infrastructure (PWA Fundamentals)
Located in `docs/learning/epic01_infrastructure/`:
- **LEARNING_PLAN.md**: Complete 4-phase learning guide from PWA basics to advanced features
- **PHASE1_LEARNING_NOTES.md**: Phase 1 (understanding the pieces)
- **PHASE2_LEARNING_NOTES.md**: Phase 2 (offline functionality)
- **PHASE3_LEARNING_NOTES.md**: Phase 3 (advanced features)
- **PHASE4.1_LOCAL_HTTPS.md**: Phase 4.1 (local HTTPS with mkcert and Docker)
- **PHASE4.2_BUILD_TOOLS.md**: Phase 4.2 (Vite build process)
- **PHASE4.3_UNIT_TESTING.md**: Phase 4.3 (Vitest unit testing)
- **PHASE4.4_E2E_TESTING.md**: Phase 4.4 (Playwright E2E testing)
- **PHASE4.5_CI_CD.md**: Phase 4.5 (GitHub Actions CI/CD)
- **PHASE4_ARCHITECTURE.md**: Phase 4 architecture overview

### Epic 02: QuizMaster V1 (AI-Powered Quiz Application)
Located in `docs/learning/epic02_quizmaster_v1/`:
- **QUIZMASTER_V1_LEARNING_PLAN.md**: Complete 10-phase learning plan
- **QUIZMASTER_QUICK_START.md**: Navigation guide and getting started
- **PHASE1_ARCHITECTURE.md**: System architecture and data flow
- **PHASE2_INDEXEDDB.md**: IndexedDB fundamentals and implementation
- **PHASE3_API_INTEGRATION.md**: Anthropic Claude API integration
- **PHASES_4-10_SUMMARY.md**: Overview of remaining implementation phases

### Epic 03: QuizMaster V2 (Production-Ready Backend) ✅ Complete
Located in `docs/learning/epic03_quizmaster_v2/`:
- **EPIC3_QUIZMASTER_V2_PLAN.md**: Complete Epic 3 multi-phase plan
- **PHASE1_BACKEND.md**: Serverless backend integration (✅ Complete)
- **PHASE2_OFFLINE.md**: Offline capabilities (✅ Complete)
- **PHASE3_UI_POLISH.md**: UI refinements (✅ Complete)
- **PHASE4_OBSERVABILITY.md**: Logging and monitoring (✅ Complete)
- **PHASE5_PROJECT_STRUCTURE.md**: Repository organization (✅ Complete)
- **PHASE9_PLAYSTORE_PUBLISHING.md**: Play Store publishing (✅ Complete - Closed Testing Live)

### Epic 04: Saberloop V1 (Maintenance & Enhancement) ✅ Current
Located in `docs/learning/epic04_saberloop_v1/`:
- **EPIC4_SABERLOOP_V1_PLAN.md**: Complete Epic 4 multi-phase plan
- **PHASE5_EPIC03_PENDING.md**: Play Store production & validation (In Progress)
- **PHASE10_OPENROUTER_ONBOARDING_UX.md**: Improved OpenRouter setup flow
- **PHASE20_ARCH_TESTING.md**: Architecture testing with dependency-cruiser
- **PHASE30_I18N.md**: Internationalization (multi-language support)
- **PHASE40_TELEMETRY.md**: Self-hosted observability solution
- **PHASE50_MAESTRO_TESTING.md**: Expanded mobile UI testing
- **PHASE60_MONETIZATION.md**: Google AdSense integration

When making changes, respect the learning-focused nature of the project. Keep code simple and well-commented rather than introducing complex patterns or dependencies.

## Deployment

**Current deployment**: FTP to saberloop.com

**Deployment URL**: https://saberloop.com/app/

**Deployment process**:
```bash
npm run build        # Build for production
npm run deploy       # FTP deploy to saberloop.com/app/
```

**Deployment architecture**:
- **CI**: GitHub Actions runs unit tests, E2E tests, and build verification
- **Build**: Vite builds to `dist/`
- **Deploy**: FTP upload via `scripts/deploy-ftp.cjs`
- **Hosting**: Traditional web hosting at saberloop.com

**Configuration files**:
- `.github/workflows/test.yml` - CI pipeline (testing)
- `.env` - Local environment variables (FTP credentials, etc.)
- `scripts/deploy-ftp.cjs` - FTP deployment script

**Important**: When deploying, ensure:
1. Tests pass locally or in GitHub Actions
2. `.env` has FTP credentials configured (FTP_HOST, FTP_USER, FTP_PASSWORD)
3. Service worker cache version incremented if cached files changed

## Testing on Mobile Devices

**On Android (Chrome)**:
1. Deploy to saberloop.com or use local network IP
2. Open site in Chrome
3. Look for install prompt or "Add to Home Screen" in menu
4. Test offline functionality after installation

**On iOS (Safari)**:
1. Deploy to saberloop.com (requires HTTPS)
2. Open site in Safari
3. Tap Share button → "Add to Home Screen"
4. Test offline functionality after installation

**Note**: iOS has more limited PWA support than Android (see `docs/epic01_infrastructure/PHASE3_LEARNING_NOTES.md` for details)

## Common Issues

### Service Worker Not Updating
- Increment `CACHE_NAME` in sw.js:2
- Check "Update on reload" in DevTools → Application → Service Workers
- Or manually unregister service worker and refresh

### App Not Working Offline
- Verify all resources are in `FILES_TO_CACHE` array (sw.js:3-11)
- Check Cache Storage in DevTools → Application
- Look for 404 errors in console when offline

### Install Prompt Not Appearing
- Ensure HTTPS (or localhost)
- Verify manifest.json is valid (DevTools → Application → Manifest)
- Check service worker is registered and activated
- Note: Only works in Chromium browsers (Chrome, Edge)

### Cache Not Clearing
- Manually clear: DevTools → Application → Storage → "Clear site data"
- Verify activate event in sw.js properly deletes old caches (sw.js:29-45)
- Check old cache names are being deleted in console logs
