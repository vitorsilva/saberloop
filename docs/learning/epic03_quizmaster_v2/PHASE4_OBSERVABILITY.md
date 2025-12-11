# Phase 4: Observability & Telemetry

**Epic:** 3 - QuizMaster V2
**Status:** Not Started
**Estimated Time:** 2-3 sessions
**Prerequisites:** Phases 1-3.6.1 complete

---

## Overview

Phase 4 implements structured logging, error tracking, and performance monitoring to make Saberloop production-ready. You'll replace scattered `console.log()` statements with a centralized logging system, implement global error handling, and add performance metrics.

**What you'll build:**
- Structured logging utility
- Global error handler
- Performance monitoring
- Error boundaries
- Log levels and filtering

**Why this matters:**
- Easier debugging in production
- Track errors and performance
- Monitor user experience
- Data-driven improvements
- Professional application quality

---

## Current State Analysis

**Updated: December 2025** - Reflects current codebase after Phase 3.6.1 (OpenRouter integration, sample quizzes, skip-auth flow).

### Current Architecture

```
Browser (SPA)
├── src/main.js                    # App initialization
├── src/views/*.js                 # UI components
├── src/api/
│   ├── api.real.js               # Uses OpenRouter directly
│   ├── api.mock.js               # Mock data for testing
│   ├── openrouter-client.js      # OpenRouter API calls
│   └── openrouter-auth.js        # OAuth PKCE flow
├── src/db/db.js                   # IndexedDB storage
├── src/utils/
│   ├── network.js                # Online/offline detection
│   ├── settings.js               # User preferences
│   ├── sample-loader.js          # Sample quiz loading
│   └── welcome-version.js        # Welcome screen versioning
└── src/components/
    └── ConnectModal.js           # Connection prompt modal
```

**Key Point:** No backend for LLM calls - browser calls OpenRouter directly.

---

### What You Already Have

#### 1. Console Logging (Current Patterns)

**Files with Logging:**

| File | Pattern | Example |
|------|---------|---------|
| `src/main.js` | Emoji prefixes | `🎓 ✅ ❌ 👋 🔐` |
| `src/api/api.real.js` | `devLog()` helper | `[OpenRouter API] Generating...` |
| `src/api/api.mock.js` | `devLog()` helper | `[MOCK API] Generating...` |
| `src/api/openrouter-client.js` | `DEBUG` flag + `log()` | `[OpenRouter Client]` |
| `src/api/openrouter-auth.js` | `DEBUG` flag + `log()` | `[OpenRouter Auth]` |
| `src/utils/network.js` | Emoji prefix | `✅ Network monitoring...` |
| `src/router/router.js` | `console.warn` | Route not found warnings |
| `src/views/WelcomeView.js` | `console.error` | Auth failures |

**Existing Helper Patterns:**

```javascript
// Pattern 1: devLog() - dev-only logging (api.real.js, api.mock.js)
const devLog = (...args) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

// Pattern 2: DEBUG flag (openrouter-client.js, openrouter-auth.js)
const DEBUG = false;
function log(...args) {
  if (DEBUG) console.log('[OpenRouter Client]', ...args);
}
```

**Quality Assessment:**
- ✅ Has dev-only logging pattern (can build on it)
- ✅ Consistent prefixes in some modules
- ✅ Human-readable messages
- ❌ No timestamps
- ❌ No log levels beyond console.log/error
- ❌ No structured format (JSON)
- ❌ DEBUG flags scattered (not centralized)

---

#### 2. Error Handling (Current State)

**Files with Error Handling:**

| File | Error Type | Pattern |
|------|-----------|---------|
| `src/main.js:59-61` | Initialization | Catch, log with emoji |
| `src/main.js:97-123` | OAuth callback | Catch, show error UI |
| `src/api/api.real.js:110-113` | Question generation | Catch, log, re-throw |
| `src/api/api.real.js:156-159` | Explanation generation | Catch, return fallback |
| `src/api/openrouter-client.js:76-92` | API errors | Status-specific messages |
| `src/views/WelcomeView.js:141-145` | Auth start | Catch, reset button |
| `src/components/ConnectModal.js:67-71` | Auth start | Catch, reset button |

**Current Error Patterns:**

```javascript
// Pattern 1: Catch and re-throw with context
try {
  const result = await callOpenRouter(apiKey, prompt, options);
} catch (error) {
  console.error('Question generation failed:', error);
  throw error;
}

// Pattern 2: Catch and return fallback
try {
  const result = await callOpenRouter(apiKey, prompt, options);
  return result.text.trim();
} catch (error) {
  console.error('Explanation generation failed:', error);
  return 'Sorry, we couldn\'t generate an explanation at this time.';
}

// Pattern 3: Status-specific error messages (openrouter-client.js)
if (response.status === 401) {
  throw new Error('Invalid API key. Please reconnect with OpenRouter.');
}
if (response.status === 429) {
  throw new Error('Rate limit exceeded. Free tier allows 50 requests/day.');
}
```

**Quality Assessment:**
- ✅ Strategic error catching at API boundaries
- ✅ User-friendly error messages
- ✅ Status-specific handling for OpenRouter
- ❌ No global error handler
- ❌ No error categorization
- ❌ Unhandled promise rejections not caught

---

#### 3. Service Worker (Vite PWA Plugin)

**Current:** Service worker is auto-generated by Vite PWA Plugin (Workbox).

**File:** Auto-generated at build time (not `public/sw.js`)

**Configuration:** `vite.config.js`

```javascript
VitePWA({
  registerType: 'prompt',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/openrouter\.ai\/api\/.*/i,
        handler: 'NetworkOnly'
      }
    ]
  }
})
```

**Logging in main.js:**
```javascript
const updateSW = registerSW({
  onOfflineReady() {
    console.log('✅ App ready to work offline');
  },
  onRegistered(registration) {
    console.log('✅ Service Worker registered');
  },
  onRegisterError(error) {
    console.error('❌ Service Worker registration failed:', error);
  }
});
```

**Quality Assessment:**
- ✅ Workbox handles caching automatically
- ✅ Registration events logged
- ❌ No cache hit/miss visibility
- ❌ No performance metrics

---

#### 4. Testing Infrastructure (Excellent)

**Vitest:** Unit tests with coverage
**Playwright:** E2E tests with video recording

**Current test counts:**
- Unit tests: 78 passing
- E2E tests: 16 passing

**Artifacts:**
- Coverage reports: `coverage/`
- Test videos: `test-results/` (all tests recorded)
- Playwright reports: `playwright-report/`

---

#### 5. Tailwind CSS (Still CDN - Needs Fix)

**Current:** `<script src="https://cdn.tailwindcss.com"></script>` in `index.html`

**Problem:**
- Downloads entire Tailwind library (~3MB) at runtime
- Console warning: `"cdn.tailwindcss.com should not be used in production"`

**Resolution (Part of Phase 4):**
1. Install Tailwind as PostCSS plugin
2. Remove CDN script
3. CSS will be ~10-20KB instead of ~3MB

---

### What's Missing

| Category | Status | Priority |
|----------|--------|----------|
| **Structured Logging** | ❌ Missing | High |
| **Global Error Handler** | ❌ Missing | High |
| **Performance Metrics** | ❌ Missing | Medium |
| **Log Levels** | ❌ Partial (DEBUG flags exist) | High |
| **Sensitive Data Redaction** | ❌ Missing | High |
| **Tailwind Build** | ❌ Still CDN | Medium |

---

## Learning Objectives

By the end of this phase, you will:
- Implement structured logging with log levels
- Create global error handlers for uncaught errors
- Monitor Core Web Vitals (LCP, FID, CLS)
- Track custom performance metrics
- Sanitize sensitive data in logs
- Fix Tailwind CSS build process

---

## Implementation Steps

### Part 1: Structured Logging

#### Step 1: Create Logger Utility

**File:** `src/utils/logger.js` (NEW)

```javascript
// src/utils/logger.js

/**
 * Log levels (in order of severity)
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

/**
 * Current log level (DEBUG in dev, INFO in prod)
 */
const CURRENT_LOG_LEVEL = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO;

/**
 * Sensitive keys to redact from logs
 */
const SENSITIVE_KEYS = ['apikey', 'key', 'password', 'token', 'secret', 'authorization'];

/**
 * Redact sensitive data from object
 */
function redactSensitive(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const redacted = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(k => lowerKey.includes(k))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitive(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Format log entry
 */
function formatLog(level, message, context = {}) {
  return {
    timestamp: new Date().toISOString(),
    level: Object.keys(LogLevel)[level],
    message,
    context: redactSensitive(context)
  };
}

/**
 * Output log to console
 */
function output(level, message, context) {
  if (level < CURRENT_LOG_LEVEL) {
    return;
  }

  const log = formatLog(level, message, context);
  const prefix = `[${log.level}]`;

  switch (level) {
    case LogLevel.DEBUG:
      console.debug(prefix, message, log.context);
      break;
    case LogLevel.INFO:
      console.log(prefix, message, log.context);
      break;
    case LogLevel.WARN:
      console.warn(prefix, message, log.context);
      break;
    case LogLevel.ERROR:
      console.error(prefix, message, log.context);
      break;
  }
}

/**
 * Logger API
 */
export const logger = {
  debug(message, context = {}) {
    output(LogLevel.DEBUG, message, context);
  },

  info(message, context = {}) {
    output(LogLevel.INFO, message, context);
  },

  warn(message, context = {}) {
    output(LogLevel.WARN, message, context);
  },

  error(message, context = {}) {
    output(LogLevel.ERROR, message, context);
  },

  /**
   * Log performance metric
   */
  perf(metric, data = {}) {
    this.info(`[PERF] ${metric}`, data);
  },

  /**
   * Log user action
   */
  action(action, data = {}) {
    this.info(`[ACTION] ${action}`, data);
  }
};
```

---

#### Step 2: Create Unit Tests for Logger

**File:** `src/utils/logger.test.js` (NEW)

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, LogLevel } from './logger.js';

describe('Logger', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log info messages', () => {
    logger.info('Test message');
    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    logger.error('Error occurred');
    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it('should include context in logs', () => {
    logger.info('Test', { userId: '123' });
    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.any(String),
      'Test',
      expect.objectContaining({ userId: '123' })
    );
  });

  it('should redact API keys', () => {
    logger.info('Settings', { apiKey: 'sk-secret-123' });
    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.any(String),
      'Settings',
      expect.objectContaining({ apiKey: '[REDACTED]' })
    );
  });

  it('should redact nested sensitive data', () => {
    logger.info('Config', {
      user: {
        name: 'John',
        token: 'secret-token'
      }
    });
    const callArgs = consoleSpy.log.mock.calls[0][2];
    expect(callArgs.user.name).toBe('John');
    expect(callArgs.user.token).toBe('[REDACTED]');
  });

  it('should log performance metrics', () => {
    logger.perf('Page Load', { duration: 234 });
    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.any(String),
      '[PERF] Page Load',
      expect.objectContaining({ duration: 234 })
    );
  });

  it('should log user actions', () => {
    logger.action('Quiz Started', { topic: 'Math' });
    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.any(String),
      '[ACTION] Quiz Started',
      expect.objectContaining({ topic: 'Math' })
    );
  });
});
```

---

#### Step 3: Replace console.log Throughout Codebase

**Files to update:**

| File | Changes |
|------|---------|
| `src/main.js` | Replace emoji logs with `logger.*` |
| `src/api/api.real.js` | Replace `devLog` with `logger.debug` |
| `src/api/api.mock.js` | Replace `devLog` with `logger.debug` |
| `src/api/openrouter-client.js` | Replace `log()` with `logger.debug` |
| `src/api/openrouter-auth.js` | Replace `log()` with `logger.debug` |
| `src/utils/network.js` | Replace console.log with `logger.info` |
| `src/utils/sample-loader.js` | Replace console.log with `logger.debug` |
| `src/router/router.js` | Replace console.warn with `logger.warn` |
| `src/views/WelcomeView.js` | Replace console.error with `logger.error` |
| `src/components/ConnectModal.js` | Replace console.error with `logger.error` |

**Example transformation (main.js):**

Before:
```javascript
console.log('🎓 Saberloop initializing...');
console.log('✅ Database initialized');
console.error('❌ Initialization failed:', error);
```

After:
```javascript
import { logger } from './utils/logger.js';

logger.info('Saberloop initializing');
logger.info('Database initialized');
logger.error('Initialization failed', { error: error.message });
```

---

### Part 2: Error Tracking

#### Step 4: Create Error Handler

**File:** `src/utils/errorHandler.js` (NEW)

```javascript
// src/utils/errorHandler.js

import { logger } from './logger.js';

/**
 * Initialize global error handling
 */
export function initErrorHandling() {
  // Catch uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
      stack: event.error?.stack
    });

    showErrorNotification('An unexpected error occurred.');
    return false;
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason?.message || String(event.reason)
    });

    showErrorNotification('Something went wrong. Please try again.');
    event.preventDefault();
  });

  logger.info('Error handling initialized');
}

/**
 * Show error notification to user
 */
function showErrorNotification(message) {
  const existing = document.getElementById('error-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'error-notification';
  notification.className = `
    fixed top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-xl
    shadow-lg z-50 flex items-center justify-between
  `;
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined">error</span>
      <span>${message}</span>
    </div>
    <button onclick="this.parentElement.remove()" class="material-symbols-outlined">close</button>
  `;

  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 5000);
}

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error, context = {}) {
  logger.error('API error', {
    message: error.message,
    ...context
  });

  if (error.message.includes('network') || error.message.includes('fetch')) {
    return 'Network error. Please check your connection.';
  }

  if (error.message.includes('API key') || error.message.includes('401')) {
    return 'API key error. Please check your settings.';
  }

  if (error.message.includes('Rate limit') || error.message.includes('429')) {
    return 'Rate limit reached. Please try again later.';
  }

  return 'An error occurred. Please try again.';
}
```

---

#### Step 5: Create Unit Tests for Error Handler

**File:** `src/utils/errorHandler.test.js` (NEW)

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleApiError } from './errorHandler.js';

// Mock the logger
vi.mock('./logger.js', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('Error Handler', () => {
  describe('handleApiError', () => {
    it('should return network error message for fetch errors', () => {
      const error = new Error('fetch failed');
      const message = handleApiError(error);
      expect(message).toContain('Network error');
    });

    it('should return API key message for 401 errors', () => {
      const error = new Error('401 Unauthorized');
      const message = handleApiError(error);
      expect(message).toContain('API key');
    });

    it('should return rate limit message for 429 errors', () => {
      const error = new Error('Rate limit exceeded');
      const message = handleApiError(error);
      expect(message).toContain('Rate limit');
    });

    it('should return generic message for unknown errors', () => {
      const error = new Error('Something weird happened');
      const message = handleApiError(error);
      expect(message).toContain('An error occurred');
    });
  });
});
```

---

#### Step 6: Initialize Error Handling in main.js

**Update `src/main.js`:**

```javascript
import { logger } from './utils/logger.js';
import { initErrorHandling } from './utils/errorHandler.js';

async function init() {
  try {
    // Initialize error handling first
    initErrorHandling();

    await initDatabase();
    logger.info('Database initialized');

    // ... rest of initialization
  } catch (error) {
    logger.error('Initialization failed', { error: error.message });
  }
}
```

---

### Part 3: Performance Monitoring

#### Step 7: Create Performance Monitor

**File:** `src/utils/performance.js` (NEW)

```javascript
// src/utils/performance.js

import { logger } from './logger.js';

const marks = new Map();

/**
 * Start performance measurement
 */
export function perfStart(name) {
  marks.set(name, performance.now());
}

/**
 * End performance measurement and log
 */
export function perfEnd(name, context = {}) {
  const start = marks.get(name);
  if (!start) {
    logger.warn('perfEnd called without perfStart', { name });
    return 0;
  }

  const duration = Math.round(performance.now() - start);
  marks.delete(name);

  logger.perf(name, { duration, ...context });
  return duration;
}

/**
 * Measure Core Web Vitals
 */
export function measureWebVitals() {
  if (!('PerformanceObserver' in window)) {
    return;
  }

  try {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      logger.perf('LCP', {
        value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
        element: lastEntry.element?.tagName
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        logger.perf('FID', {
          value: Math.round(entry.processingStart - entry.startTime),
          eventType: entry.name
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      logger.perf('CLS', { value: clsValue.toFixed(3) });
    }).observe({ entryTypes: ['layout-shift'] });

  } catch (error) {
    logger.warn('Failed to measure web vitals', { error: error.message });
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  measureWebVitals();
  logger.info('Performance monitoring initialized');
}
```

---

#### Step 8: Add Performance Tracking to Key Operations

**Example: Track quiz generation time in api.real.js:**

```javascript
import { perfStart, perfEnd } from '../utils/performance.js';

export async function generateQuestions(topic, gradeLevel = 'middle school') {
  perfStart('quiz-generation');

  // ... existing code ...

  const result = await callOpenRouter(apiKey, prompt, options);

  perfEnd('quiz-generation', { topic, gradeLevel });

  return result;
}
```

---

### Part 4: Tailwind CSS Build Fix

#### Step 9: Install Tailwind as Build Dependency

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### Step 10: Configure Tailwind

**File:** `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'background-light': '#ffffff',
        'background-dark': '#0f172a',
        'card-light': '#f8fafc',
        'card-dark': '#1e293b',
        'text-light': '#1e293b',
        'text-dark': '#f8fafc',
        'subtext-light': '#64748b',
        'subtext-dark': '#94a3b8',
        'border-light': '#e2e8f0',
        'border-dark': '#334155',
      }
    },
  },
  plugins: [],
}
```

#### Step 11: Create CSS Entry Point

**File:** `src/styles/main.css` (NEW)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Step 12: Import CSS in main.js

```javascript
import './styles/main.css';
```

#### Step 13: Remove CDN from index.html

Remove this line from `index.html`:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

---

## File Summary

### New Files

| File | Purpose |
|------|---------|
| `src/utils/logger.js` | Structured logging utility |
| `src/utils/logger.test.js` | Logger unit tests |
| `src/utils/errorHandler.js` | Global error handling |
| `src/utils/errorHandler.test.js` | Error handler tests |
| `src/utils/performance.js` | Performance monitoring |
| `src/styles/main.css` | Tailwind CSS entry point |
| `tailwind.config.js` | Tailwind configuration |
| `postcss.config.js` | PostCSS configuration |

### Modified Files

| File | Changes |
|------|---------|
| `src/main.js` | Import logger, init error handling & performance |
| `src/api/api.real.js` | Replace devLog with logger |
| `src/api/api.mock.js` | Replace devLog with logger |
| `src/api/openrouter-client.js` | Replace log() with logger |
| `src/api/openrouter-auth.js` | Replace log() with logger |
| `src/utils/network.js` | Replace console.log with logger |
| `src/utils/sample-loader.js` | Replace console.log with logger |
| `src/router/router.js` | Replace console.warn with logger |
| `src/views/WelcomeView.js` | Replace console.error with logger |
| `src/components/ConnectModal.js` | Replace console.error with logger |
| `index.html` | Remove Tailwind CDN script |

---

## Testing

### Unit Tests

```bash
npm test
```

Expected: All existing tests pass + new logger/errorHandler tests

### E2E Tests

```bash
npm run test:e2e
```

Expected: All 16 tests still pass

### Manual Verification

1. **Check log levels in dev:**
   - Open console, should see `[DEBUG]`, `[INFO]` logs

2. **Check log levels in prod:**
   ```bash
   npm run build
   npm run preview
   ```
   - Open console, should only see `[INFO]`, `[WARN]`, `[ERROR]` (no DEBUG)

3. **Test sensitive data redaction:**
   - Check that API keys show as `[REDACTED]` in logs

4. **Test error handling:**
   - Open console, run: `throw new Error('test')`
   - Should see error notification appear

5. **Test performance metrics:**
   - Check console for `[PERF] LCP`, `[PERF] FID`, `[PERF] CLS`

6. **Verify Tailwind build:**
   - Build should complete without CDN warning
   - CSS bundle should be small (~10-20KB)

---

## Success Criteria

Phase 4 is complete when:

- [ ] Logger utility created with all log levels
- [ ] All console.log/error replaced with logger.*
- [ ] Sensitive data redaction working
- [ ] Global error handler catching errors
- [ ] Error notifications showing to users
- [ ] Performance monitoring initialized
- [ ] Core Web Vitals being measured
- [ ] Tailwind CSS built properly (no CDN)
- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] Production logs filtered appropriately

---

## Next Steps

After completing Phase 4:
- **Phase 5:** Repository & Project Structure
- **Phase 6:** Validation & Iteration

---

**Related Documentation:**
- Epic 3 Plan: `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md`
- Phase 3.6.1 Notes: `docs/epic03_quizmaster_v2/PHASE3.6.1_LEARNING_NOTES.md`
