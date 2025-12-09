# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a learning-focused Progressive Web App (PWA) project that has evolved through multiple epics:

- **Epic 01: Infrastructure** - PWA fundamentals (service workers, offline, installation)
- **Epic 02: QuizMaster V1** - Initial AI-powered quiz application with mock API
- **Epic 03: QuizMaster V2** - Production-ready version with real backend integration ✅ **Current**

The project follows a guided, incremental learning methodology with detailed documentation in `docs/epic0X_*/` directories.

**Current Status:** Epic 03 Phase 4 Complete | Next: Phase 5 Project Structure (Dec 9)

**Repository**: https://github.com/vitorsilva/demo-pwa-app

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

### Integration with Learning Plan

When user says "what's next" or similar:
1. Determine which epic/learning plan is active:
   - Epic 01 (Infrastructure): `docs/epic01_infrastructure/LEARNING_PLAN.md` and `docs/epic01_infrastructure/PHASE*_LEARNING_NOTES.md`
   - Epic 02 (QuizMaster V1): `docs/epic02_quizmaster_v1/QUIZMASTER_V1_LEARNING_PLAN.md` and phase files
   - Epic 03 (QuizMaster V2): `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md` and `docs/epic03_quizmaster_v2/PHASE*_*.md` files
2. Identify current phase and next step
3. **Present the next topic and ask if they want to proceed**
4. Once confirmed, **teach it step-by-step** (don't execute autonomously)

When user says "that's a wrap" or similar:
1. Document progress in appropriate learning notes file for the active epic
2. Note what was completed
3. Note what's next for resumption

---

## Working with the Learning Plan

### Continuing the Learning Journey

When the user asks **"what's next"** or similar phrases (e.g., "what should I do next", "next step", "continue"), always:

1. Determine the active epic/learning plan:
   - **Epic 01 (Infrastructure)**: Read `docs/epic01_infrastructure/LEARNING_PLAN.md` and check `docs/epic01_infrastructure/PHASE*_LEARNING_NOTES.md`
   - **Epic 02 (QuizMaster V1)**: Read `docs/epic02_quizmaster_v1/QUIZMASTER_V1_LEARNING_PLAN.md` and related phase files
   - **Epic 03 (QuizMaster V2)**: Read `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md` and related phase files
2. Identify the current phase and next steps in the learning progression
3. Guide the user through the next appropriate task or learning objective

### Pausing and Recording Progress

When the user says **"that's a wrap"**, **"let's call it a day"**, **"let's pause"**, or similar phrases indicating they want to stop, always:

1. Document the current state in the appropriate learning notes file for the active epic:
   - **Epic 01**: `docs/epic01_infrastructure/PHASE*_LEARNING_NOTES.md`
   - **Epic 02**: Create/update learning notes in `docs/epic02_quizmaster_v1/`
   - **Epic 03**: Update learning notes in `docs/epic03_quizmaster_v2/PHASE*_LEARNING_NOTES.md`
   - What was just completed in this session
   - Current phase and specific step/task
   - What's next when they resume
   - Any relevant notes, blockers, or context needed for next session
2. Ensure all recent work is properly documented so progress can be easily resumed

This is a learning-focused project with a structured progression - respect this flow and help the user advance through it systematically.

## Architecture

### Core PWA Structure

**Frontend** - Vanilla JavaScript SPA with build tools (Epic 03+):
- **index.html**: Main entry point with semantic HTML structure
- **src/main.js**: Application entry point, router initialization
- **src/router/**: SPA routing system
- **src/views/**: View components (QuizView, ResultsView, etc.)
- **src/state/**: Global state management
- **src/api/**: API clients (mock and real)
- **src/db/**: IndexedDB wrapper for offline storage
- **src/utils/**: Utility functions (network monitoring, etc.)
- **public/sw.js**: Service worker with cache-first strategy
- **manifest.json**: PWA manifest defining app metadata and icons
- **Build tools**: Vite for bundling and development

**Backend** - Serverless architecture (Epic 03+):
- **netlify/functions/generate-questions.js**: AI question generation via Claude API
- **netlify/functions/generate-explanation.js**: AI explanations for wrong answers
- **netlify/functions/health-check.js**: Backend health monitoring
- **Deployment**: Netlify Functions (serverless)
- **API Key**: Securely stored server-side only

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

**Current setup (Epic 03+)**: Use Netlify CLI for full-stack development:

```bash
# Start development server (runs Vite + Netlify Functions)
npm run dev

# Netlify CLI will:
# - Start Vite dev server on port 3000
# - Start Netlify Functions runtime
# - Proxy everything through port 8888
# - Access at: http://localhost:8888
```

**Legacy setup (Epic 01-02)**: Simple static file serving:

```bash
# Using Python 3
python -m http.server 8080

# Using Node's http-server (if installed)
npx http-server -p 8080

# Using VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

**Environment configuration**:
- Edit `.env` file to switch between mock and real API
- `VITE_USE_REAL_API=false` - Use mock API (no API costs)
- `VITE_USE_REAL_API=true` - Use real Netlify Functions (requires API key)
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
- Tests must pass before Netlify deploys

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

This repository contains extensive learning documentation organized by epic:

### Epic 01: Infrastructure (PWA Fundamentals)
Located in `docs/epic01_infrastructure/`:
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
Located in `docs/epic02_quizmaster_v1/`:
- **QUIZMASTER_V1_LEARNING_PLAN.md**: Complete 10-phase learning plan
- **QUIZMASTER_QUICK_START.md**: Navigation guide and getting started
- **PHASE1_ARCHITECTURE.md**: System architecture and data flow
- **PHASE2_INDEXEDDB.md**: IndexedDB fundamentals and implementation
- **PHASE3_API_INTEGRATION.md**: Anthropic Claude API integration
- **PHASES_4-10_SUMMARY.md**: Overview of remaining implementation phases

### Epic 03: QuizMaster V2 (Production-Ready Backend) ✅ Current
Located in `docs/epic03_quizmaster_v2/`:
- **EPIC3_QUIZMASTER_V2_PLAN.md**: Complete Epic 3 multi-phase plan
- **PHASE1_BACKEND.md**: Serverless backend integration (✅ Complete)
- **PHASE1_LEARNING_NOTES.md**: Detailed learning notes with 4 sessions
- **PHASE2_OFFLINE.md**: Offline capabilities (Next)
- **PHASE3_PROJECT_STRUCTURE.md**: Code organization
- **PHASE4_OBSERVABILITY.md**: Logging and monitoring
- **PHASE5_PROJECT_STRUCTURE.md**: Advanced architecture
- **PHASE6_VALIDATION.md**: Comprehensive testing

When making changes, respect the learning-focused nature of the project. Keep code simple and well-commented rather than introducing complex patterns or dependencies.

## Deployment

**Current deployment**: Netlify (auto-deploy from GitHub)

**Deployment URL**: Check Netlify dashboard for your site URL

**Deployment process**:
```bash
git add .
git commit -m "Description of changes"
git push origin main

# Automatically triggers:
# 1. GitHub Actions (runs tests)
# 2. Netlify (builds and deploys if tests pass)
```

**Deployment architecture**:
- **CI (Continuous Integration)**: GitHub Actions runs unit tests, E2E tests, and build verification
- **CD (Continuous Deployment)**: Netlify watches GitHub repo and auto-deploys on push to main
- **Functions**: Netlify Functions deployed to `/.netlify/functions/` endpoint
- **Frontend**: Vite builds to `dist/` and Netlify serves from CDN

**Configuration files**:
- `.github/workflows/test.yml` - CI pipeline (testing)
- `netlify.toml` - Build settings and function configuration
- `.env` - Local environment variables (not committed)
- Netlify Dashboard → Environment Variables - Production secrets

**Important**: When deploying, ensure:
1. Tests pass in GitHub Actions before merge
2. Environment variables set in Netlify dashboard (e.g., `ANTHROPIC_API_KEY`)
3. Service worker cache version incremented if cached files changed

## Testing on Mobile Devices

**On Android (Chrome)**:
1. Deploy to GitHub Pages or use local network IP
2. Open site in Chrome
3. Look for install prompt or "Add to Home Screen" in menu
4. Test offline functionality after installation

**On iOS (Safari)**:
1. Deploy to GitHub Pages (requires HTTPS)
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
