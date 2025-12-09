# Phase 4 Learning Notes: Observability & Telemetry

## Session 1 - December 9, 2025

### What We Built

Implemented a professional logging and monitoring system to replace scattered `console.log` statements.

### Completed Tasks

1. **Logger Utility** (`src/utils/logger.js`)
   - Installed `loglevel` library (~1KB)
   - Created wrapper with automatic sensitive data redaction
   - Log levels: debug, info, warn, error
   - Special methods: `perf()` for performance, `action()` for user actions
   - Environment-aware: DEBUG hidden in production

2. **Logger Tests** (`src/utils/logger.test.js`)
   - 13 tests covering all log levels
   - Tests for sensitive data redaction (apiKey, token, password, nested objects)
   - Tests for context handling and special methods

3. **Replaced console.log Across Codebase**
   - Updated 14 files to use the new logger
   - Files: main.js, api/*.js, utils/*.js, views/*.js, components/*.js, router/*.js
   - 42 console statements replaced with structured logging

4. **Error Handler** (`src/utils/errorHandler.js`)
   - Global error catching via `window.addEventListener('error')`
   - Unhandled promise rejection catching
   - User-friendly error notifications (red banner, auto-dismiss)
   - `handleApiError()` for API-specific error messages

5. **Error Handler Tests** (`src/utils/errorHandler.test.js`)
   - 9 tests for error classification
   - Tests for network, API key, rate limit, timeout errors
   - Tests for context logging

6. **Performance Monitoring** (`src/utils/performance.js`)
   - Installed `web-vitals` library (~1.5KB)
   - Core Web Vitals tracking: LCP, INP, CLS
   - Metrics logged with rating (good/needs-improvement/poor)

### Key Decisions

1. **loglevel over custom implementation**
   - Battle-tested (~12M weekly downloads)
   - ~1KB bundle size
   - Persistent log levels across page refreshes
   - We wrap it to add redaction and formatting

2. **loglevel over OpenTelemetry**
   - OpenTelemetry is overkill for a single-service app
   - OTel makes sense with multiple services + backend collector
   - Can migrate to OTel later if needed

3. **INP instead of FID**
   - FID (First Input Delay) was replaced by INP in 2024
   - INP (Interaction to Next Paint) measures ALL interactions, not just first
   - Google's new Core Web Vital for interactivity

4. **No E2E test for error notifications**
   - Unit tests cover error classification logic
   - Notification is simple DOM manipulation
   - Manual testing sufficient for now

### Files Created/Modified

| File | Action |
|------|--------|
| `src/utils/logger.js` | Created |
| `src/utils/logger.test.js` | Created |
| `src/utils/errorHandler.js` | Created |
| `src/utils/errorHandler.test.js` | Created |
| `src/utils/performance.js` | Created |
| `src/main.js` | Modified (imports, init calls) |
| `src/api/api.real.js` | Modified (logger) |
| `src/api/api.mock.js` | Modified (logger) |
| `src/api/index.js` | Modified (logger) |
| `src/api/openrouter-auth.js` | Modified (logger) |
| `src/api/openrouter-client.js` | Modified (logger) |
| `src/utils/network.js` | Modified (logger) |
| `src/utils/sample-loader.js` | Modified (logger) |
| `src/utils/settings.js` | Modified (logger) |
| `src/views/BaseView.js` | Modified (removed console.log) |
| `src/views/LoadingView.js` | Modified (logger) |
| `src/views/ResultsView.js` | Modified (logger) |
| `src/views/WelcomeView.js` | Modified (logger) |
| `src/components/ConnectModal.js` | Modified (logger) |
| `src/router/router.js` | Modified (logger) |

### Dependencies Added

| Package | Version | Purpose | Size |
|---------|---------|---------|------|
| `loglevel` | ^1.x | Logging library | ~1KB |
| `web-vitals` | ^4.x | Core Web Vitals | ~1.5KB |

### Key Learnings

1. **Vitest mocking with ESM modules**
   - `vi.mock()` must be before imports
   - Mock factory must be self-contained (no external variables)
   - Import the mocked module after `vi.mock()` to get the mock

2. **Sensitive data redaction pattern**
   - Check key names against list (apikey, token, password, secret)
   - Recursively handle nested objects
   - Replace with `[REDACTED]` string

3. **Core Web Vitals evolution**
   - FID → INP in 2024
   - INP better represents real-world interactivity
   - web-vitals library stays up-to-date with Google's standards

4. **Global error handling**
   - `window.addEventListener('error')` catches uncaught errors
   - `window.addEventListener('unhandledrejection')` catches promise rejections
   - Both needed for comprehensive error catching

### Console Output Now

```
[INFO] Using real API via OpenRouter
[INFO] Saberloop initializing
[INFO] Error handling initialized
[INFO] Performance monitoring initialized
[INFO] Database initialized
[DEBUG] Samples already loaded {version: '1.0'}
[INFO] Router initialized
[INFO] Network monitoring initialized
[INFO] Service Worker registered
[DEBUG] Show welcome check {showWelcome: false}
[INFO] [PERF] LCP {value: 416, rating: 'good'}
```

### What's Next

- [ ] Phase 5: Project Structure (code organization)
- [ ] Phase 6: Validation (comprehensive testing)
- [ ] Consider: Tailwind CSS build (move from CDN to PostCSS)

### Test Results

- **Unit Tests**: 100 tests passing (91 + 9 new)
- **E2E Tests**: All passing
