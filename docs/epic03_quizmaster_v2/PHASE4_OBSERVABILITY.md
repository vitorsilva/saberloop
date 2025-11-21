# Phase 4: Observability & Telemetry

**Epic:** 3 - QuizMaster V2
**Status:** Not Started
**Estimated Time:** 2-3 sessions
**Prerequisites:** Phases 1-3 and Phase 3.5 (Branding) complete

---

## Overview

Phase 4 implements structured logging, error tracking, and performance monitoring to make QuizMaster production-ready. You'll replace scattered `console.log()` statements with a centralized logging system, implement global error handling, and add performance metrics.

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

Before implementing Phase 4, it's important to understand what telemetry infrastructure already exists from Epic 01 and Epic 02. This analysis was conducted across all documentation and codebase files.

### What You Already Have ✅

#### 1. Console Logging (Scattered Throughout)

**Pattern**: Ad-hoc `console.log/error/warn` statements across the codebase.

**Files with Logging**:

| File | Lines | Logging Type | Pattern |
|------|-------|--------------|---------|
| `src/main.js` | 9, 15, 25, 31, 42, 45 | Initialization | `🎓✅❌` emoji prefixes |
| `src/api/api.js` | 73, 98 | Errors | `console.error()` |
| `src/api/api.mock.js` | 13, 88 | Debug | `[MOCK API]` prefix |
| `public/sw.js` | 13, 19, 23, 31, 39, 45, 53, 69, 82, 87 | Cache lifecycle | `[SW] QuizMaster` prefix |
| `src/utils/network.js` | 60 | Initialization | `✅` prefix |
| `src/views/QuizView.js` | 29 | Error | `console.error()` |
| `src/router/router.js` | 40 | Warning | `console.warn()` |
| `src/views/BaseView.js` | 6 | Debug | `console.log()` |
| `src/app.js` | 42, 44, 70, 73 | Installation | Install prompt events |

**Example Patterns Found**:
```javascript
// Initialization with emojis (src/main.js)
console.log('🎓 QuizMaster initializing...');
console.log('✅ Database initialized');
console.error('❌ Initialization failed:', error);

// Service Worker with [SW] prefix (public/sw.js)
console.log('[SW] QuizMaster: Installing...');
console.log('[SW] QuizMaster: Caching app shell');
console.log('[SW] QuizMaster: Clearing old cache:', cache);

// Mock API logs (src/api/api.mock.js)
console.log(`[MOCK API] Generating questions for "${topic}" (${gradeLevel})`);

// Error handling (src/views/QuizView.js)
console.error('Question generation failed:', error);
```

**Quality Assessment**:
- ✅ Consistent prefixes ([SW], [MOCK API], emojis)
- ✅ Human-readable messages
- ❌ No timestamps
- ❌ No log levels beyond console.log/error
- ❌ No structured format (JSON)
- ❌ Not easily searchable programmatically

---

#### 2. Error Handling (Basic)

**Pattern**: Try-catch blocks with error logging at critical points.

**Files with Error Handling**:

| File | Lines | Error Type | Handler Pattern |
|------|-------|-----------|-----------------|
| `src/main.js` | 30-32 | Initialization | Catch, log, console.error |
| `src/api/api.js` | 39-41, 72-75, 97-100 | API calls | Catch, log, throw/return fallback |
| `src/views/QuizView.js` | 25-33 | Question generation | Catch, log, show alert, navigate back |

**Error Handling Patterns**:

```javascript
// Pattern 1: Catch and log (API)
try {
  const questions = JSON.parse(response);
} catch (error) {
  console.error('Question generation failed:', error);
  throw new Error('Failed to generate questions. Please try again.');
}

// Pattern 2: Catch, log, and continue (Explanation)
try {
  const response = await callClaude([...]);
  return response;
} catch (error) {
  console.error('Explanation generation failed:', error);
  return 'Sorry, we couldn\'t generate an explanation at this time.';
}

// Pattern 3: Initialization catch-all
try {
  await initDatabase();
} catch (error) {
  console.error('❌ Initialization failed:', error);
}
```

**Quality Assessment**:
- ✅ Strategic error catching (API, initialization)
- ✅ User-friendly fallback messages
- ✅ Error propagation when needed
- ❌ No error categorization (NetworkError, ValidationError, etc.)
- ❌ No error tracking/reporting service
- ❌ Stack traces lost in production

---

#### 3. Service Worker Monitoring (Good)

**File**: `public/sw.js`

**Best telemetry in the codebase!** Detailed cache lifecycle logging.

**Lifecycle Logging**:

| Event | Lines | Log Output |
|-------|-------|-----------|
| Install | 12-26 | `[SW] QuizMaster: Installing...`, `[SW] QuizMaster: Caching app shell`, `[SW] QuizMaster: Skip waiting` |
| Activate | 30-48 | `[SW] QuizMaster: Activated`, `[SW] QuizMaster: Clearing old cache: [name]`, `[SW] QuizMaster: Claiming clients` |
| Fetch | 52-90 | `Service Worker: Fetching [url]`, `[SW] QuizMaster: Serving from cache: [url]`, `[SW] QuizMaster: Fetching from network: [url]`, `[SW] QuizMaster: Serving index.html for navigation` |

**Current Implementation**:
```javascript
console.log('Service Worker: Fetching', event.request.url);
console.log('[SW] QuizMaster: Serving index.html for navigation');
console.log('[SW] QuizMaster: Serving from cache:', request.url);
console.log('[SW] QuizMaster: Fetching from network:', request.url);
```

**Quality Assessment**:
- ✅ Good cache lifecycle visibility
- ✅ Network vs cache serving is visible
- ✅ Helpful for debugging offline issues
- ❌ Not quantified (no hit/miss counts)
- ❌ No performance metrics (fetch time)
- ❌ No error tracking for failed requests

---

#### 4. Testing Infrastructure (Excellent - From Epic 01)

**Vitest Configuration** (`vitest.config.js`):
```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html'],  // Line 19
  exclude: [
    'node_modules/',
    'dist/',
    '*.config.js',
    'sw.js',
    'tests/e2e/**'
  ]
}
```

**What it produces**:
- ✅ HTML coverage report in `coverage/index.html`
- ✅ Text coverage summary in console
- ✅ Line-by-line coverage data

**Playwright Configuration** (`playwright.config.js`):
```javascript
use: {
  baseURL: 'http://localhost:3000',
  screenshot: 'only-on-failure',  // Screenshots on failure
  video: 'retain-on-failure',     // Videos on failure
},
```

**Test Artifacts Generated**:
- ✅ Screenshots: `.png` files on test failure
- ✅ Videos: `.webm` files on test failure
- ✅ Test reports: `playwright-report/`

**Quality Assessment**:
- ✅ Visual debugging aids (screenshots, videos)
- ✅ Failure-only artifacts (saves space)
- ✅ Report directory created automatically
- ❌ No custom test metrics
- ❌ No performance benchmarking
- ❌ No integration with external tools

---

#### 5. CI/CD Pipeline Logging (Good - From Epic 01 Phase 4.5)

**GitHub Actions: test.yml**

```yaml
- name: Run unit tests
  run: npm test -- --run

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test artifacts
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: |
      test-results/
      playwright-report/
    retention-days: 7
```

**What Gets Logged**:
- ✅ Vitest console output (pass/fail counts, coverage %)
- ✅ Playwright test results (pass/fail counts, timing)
- ✅ Build errors/warnings
- ✅ Dependency installation logs

**What Gets Persisted**:
- ✅ `test-results/` - Vitest coverage data
- ✅ `playwright-report/` - Playwright HTML reports
- ✅ Artifacts available in Actions tab for 7 days

**GitHub Actions: deploy.yml**

```yaml
- name: Build production bundle
  run: npm run build

- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

**What Gets Logged**:
- ✅ Vite build output (bundle sizes, file list)
- ✅ Build time
- ✅ Deployment status
- ✅ GitHub Pages deployment URL

**Quality Assessment**:
- ✅ Professional CI/CD setup
- ✅ Test artifacts preserved on failure
- ✅ Build logs captured
- ❌ No long-term historical data (7-day retention)
- ❌ No test performance metrics
- ❌ No coverage trend tracking

---

#### 6. Network Status Monitoring (Basic)

**File**: `src/utils/network.js`

```javascript
export function initNetworkMonitoring() {
  updateNetworkIndicator();
  onOnline(updateNetworkIndicator);
  onOffline(updateNetworkIndicator);
  console.log('✅ Network monitoring initialized');
}
```

**What's Monitored**:
- ✅ Online/offline state changes
- ✅ UI indicator updated (green dot = online, orange dot = offline)

**Quality Assessment**:
- ✅ Real-time network status
- ✅ Used for UI state
- ❌ No event logging (when changes happen)
- ❌ No duration tracking (how long offline)
- ❌ No connection quality metrics

---

#### 7. Build & Optimization Infrastructure

**Vite Configuration** (`vite.config.js`):
- ✅ Source maps enabled (`sourcemap: true`)
- ✅ Production build optimization (minification, bundling)
- ✅ Asset optimization (hashed filenames for cache busting)

**Quality Impact**:
- Helps with error debugging (source maps in production)
- Optimized bundle delivery

---

### What's Missing ❌

#### Critical Gaps for Production:

| Category | Status | Impact |
|----------|--------|--------|
| **Structured Logging** | ❌ Missing | Can't parse/filter logs programmatically |
| **Log Aggregation** | ❌ Missing | Logs only visible locally/in CI artifacts |
| **Error Tracking Service** | ❌ Missing | Can't track error trends or patterns |
| **Performance Metrics** | ❌ Missing | No visibility into response times, Core Web Vitals |
| **User Analytics** | ❌ Missing | No session tracking, feature usage |
| **Distributed Tracing** | ❌ Missing | Can't follow requests across frontend/backend |
| **Health Monitoring** | ❌ Missing | No uptime, availability, service health tracking |
| **Alerting** | ❌ Missing | Can't proactively detect issues |
| **Production Logging** | ❌ Missing | No persistent logs in production |
| **Log Retention** | ❌ Missing | GitHub Actions artifacts deleted after 7 days |

---

#### Specific Missing Components:

**A. Structured Logging Library**
- No winston, pino, bunyan, or similar
- No JSON structured logs
- No log levels beyond console.log/error
- No context/correlation IDs for request tracing

**B. Error Tracking Service**
- No Sentry, Rollbar, Bugsnag integration
- No source map uploads
- No error rate tracking
- No alert notifications for errors

**C. Performance Monitoring**
- No Web Vitals tracking (LCP, FID, CLS)
- No API response time monitoring
- No bundle size tracking
- No database query performance logging

**D. Application Insights**
- No feature flag logging
- No A/B test tracking
- No user session tracking
- No custom business metrics

**E. Backend Logging (From Phase 1 - Backend Integration)**
- No logging specified in Netlify Functions
- No error tracking for API calls
- No request/response logging
- No performance monitoring

---

### Documentation Coverage

**Epic 01 Coverage**:
- ✅ Phase 4.3: Unit Testing (Vitest, jsdom, coverage reporting)
- ✅ Phase 4.4: E2E Testing (Playwright, visual debugging)
- ✅ Phase 4.5: CI/CD (GitHub Actions, artifact collection)
- ❌ **No telemetry/observability phase documented**

**Epic 02 Coverage**:
- Phase 1-10: QuizMaster V1 implementation
- Phase 11: Backend Integration (mentions error handling)
- ❌ **No telemetry/logging requirements specified**

---

### Current Logging Style & Patterns

**Consistent Elements**:
1. **Emoji prefixes** for initialization: 🎓, ✅, ❌
2. **[SW] prefixes** for service worker logs
3. **[MOCK API] prefixes** for mock data
4. **Human-readable messages** (not machine-parseable)
5. **Error propagation** with specific messages

**Inconsistencies**:
- Some files use prefixes, others don't
- Mixed use of `console.error` and error throwing
- No timestamp or context information
- No request/response body logging

---

### Recommendations for Phase 4

Based on this analysis, Phase 4 should focus on:

**High Priority** (Foundation):
1. ✅ **Structured Logging Module** - Create `src/utils/logger.js` with log levels, JSON output
2. ✅ **Request/Correlation IDs** - Track requests across frontend/backend
3. ✅ **Error Categorization** - Define error types (NetworkError, ValidationError, APIError)
4. ✅ **Global Error Handler** - Catch unhandled exceptions and promise rejections

**Medium Priority** (Metrics):
5. ✅ **Performance Monitoring** - Web Vitals (LCP, FID, CLS), API response times
6. ✅ **Custom Metrics** - Quiz generation time, session duration, storage usage
7. ✅ **Service Worker Metrics** - Cache hit/miss rates, fetch timing

**Optional/Phase 5+** (Advanced):
8. **Error Tracking Service** - Sentry or similar (requires external service)
9. **Distributed Tracing** - OpenTelemetry for cross-service tracing
10. **Real-time Dashboards** - Datadog, New Relic, or similar
11. **Alerting System** - Error rate thresholds, notification channels

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Implement structured logging
- ✅ Create global error handlers
- ✅ Monitor performance metrics
- ✅ Track Core Web Vitals
- ✅ Handle errors gracefully
- ✅ Sanitize sensitive data in logs
- ✅ Use log levels appropriately

---

## Current State vs Target State

### Current State
```javascript
// Scattered throughout codebase
console.log('Quiz started');
console.log('API call failed', error);
console.error(error);
```

**Problems:**
- ❌ Inconsistent format
- ❌ No context or metadata
- ❌ Can't filter by severity
- ❌ No timestamp
- ❌ Sensitive data might leak
- ❌ Hard to debug production issues

### Target State
```javascript
// Centralized, structured logging
logger.info('Quiz started', { topic, gradeLevel });
logger.error('API call failed', { error, endpoint });
logger.performance('Page load', { duration: 234 });
```

**Benefits:**
- ✅ Consistent format
- ✅ Rich context
- ✅ Filterable by level
- ✅ Automatic timestamps
- ✅ Sensitive data redacted
- ✅ Easy to track issues

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
 * Current log level (only logs at this level or higher)
 * DEBUG in development, INFO in production
 */
const CURRENT_LOG_LEVEL = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO;

/**
 * Sensitive keys to redact from logs
 */
const SENSITIVE_KEYS = ['apiKey', 'password', 'token', 'secret', 'authorization'];

/**
 * Redact sensitive data from object
 */
function redactSensitive(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const redacted = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    // Check if key is sensitive
    if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      // Recursively redact nested objects
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
    context: redactSensitive(context),
    url: window.location.href,
    userAgent: navigator.userAgent
  };
}

/**
 * Output log to console
 */
function output(level, message, context) {
  // Skip if below current log level
  if (level < CURRENT_LOG_LEVEL) {
    return;
  }

  const log = formatLog(level, message, context);

  // Console output with appropriate method
  switch (level) {
    case LogLevel.DEBUG:
      console.debug('[DEBUG]', message, log.context);
      break;
    case LogLevel.INFO:
      console.log('[INFO]', message, log.context);
      break;
    case LogLevel.WARN:
      console.warn('[WARN]', message, log.context);
      break;
    case LogLevel.ERROR:
      console.error('[ERROR]', message, log.context);
      break;
  }

  // In production, you could send to remote logging service here
  if (import.meta.env.PROD && level >= LogLevel.ERROR) {
    // Example: Send to remote service
    // sendToLoggingService(log);
  }
}

/**
 * Logger API
 */
export const logger = {
  debug(message, context) {
    output(LogLevel.DEBUG, message, context);
  },

  info(message, context) {
    output(LogLevel.INFO, message, context);
  },

  warn(message, context) {
    output(LogLevel.WARN, message, context);
  },

  error(message, context) {
    output(LogLevel.ERROR, message, context);
  },

  /**
   * Log performance metric
   */
  performance(metric, data) {
    this.info(`[PERF] ${metric}`, data);
  },

  /**
   * Log user action
   */
  action(action, data) {
    this.info(`[ACTION] ${action}`, data);
  }
};
```

---

#### Step 2: Replace console.log() Throughout Codebase

**Example: main.js**

**Before:**
```javascript
console.log('✅ Database initialized');
console.log('✅ Router initialized');
console.log('✅ Network monitoring initialized');
```

**After:**
```javascript
import { logger } from './utils/logger.js';

logger.info('Database initialized');
logger.info('Router initialized');
logger.info('Network monitoring initialized');
```

**Example: TopicInputView.js**

**Before:**
```javascript
console.log('[MOCK API] Generating questions for', topic);
console.error('Failed to generate questions:', error);
```

**After:**
```javascript
logger.debug('Generating questions', { topic, gradeLevel });
logger.error('Failed to generate questions', { error: error.message, topic });
```

**Files to update:**
- `src/main.js`
- `src/views/*.js` (all views)
- `src/api/*.js`
- `src/db/db.js`
- `src/utils/network.js`

---

### Part 2: Error Tracking

#### Step 3: Create Error Handler

**File:** `src/utils/errorHandler.js` (NEW)

```javascript
// src/utils/errorHandler.js

import { logger } from './logger.js';

/**
 * Global error handler for uncaught errors
 */
export function initErrorHandling() {
  // Catch uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
      error: event.error?.stack
    });

    // Show user-friendly message
    showErrorNotification('An unexpected error occurred. Please refresh the page.');

    // Don't prevent default error handling
    return false;
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason,
      promise: event.promise
    });

    showErrorNotification('Something went wrong. Please try again.');

    // Prevent default handling
    event.preventDefault();
  });

  logger.info('Error handling initialized');
}

/**
 * Show error notification to user
 */
function showErrorNotification(message) {
  // Simple implementation - could be more sophisticated
  const existingNotification = document.getElementById('error-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'error-notification';
  notification.className = 'fixed top-4 left-4 right-4 bg-error text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined">error</span>
      <span>${message}</span>
    </div>
    <button onclick="this.parentElement.remove()" class="material-symbols-outlined">close</button>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

/**
 * Handle API errors
 */
export function handleApiError(error, context = {}) {
  logger.error('API error', {
    message: error.message,
    ...context
  });

  // Return user-friendly message
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return 'Network error. Please check your connection.';
  }

  if (error.message.includes('API key')) {
    return 'API key error. Please check your settings.';
  }

  return 'An error occurred. Please try again.';
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error, context = {}) {
  logger.error('Database error', {
    message: error.message,
    ...context
  });

  return 'Failed to access local storage. Please try again.';
}
```

---

#### Step 4: Initialize Error Handling

**File:** `src/main.js`

**Add initialization:**
```javascript
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

#### Step 5: Create Performance Monitor

**File:** `src/utils/performance.js` (NEW)

```javascript
// src/utils/performance.js

import { logger } from './logger.js';

/**
 * Performance marks for tracking
 */
const marks = new Map();

/**
 * Start performance measurement
 */
export function performanceStart(name) {
  marks.set(name, performance.now());
}

/**
 * End performance measurement and log
 */
export function performanceEnd(name, context = {}) {
  const start = marks.get(name);
  if (!start) {
    logger.warn('Performance end called without start', { name });
    return;
  }

  const duration = performance.now() - start;
  marks.delete(name);

  logger.performance(name, {
    duration: Math.round(duration),
    ...context
  });

  return duration;
}

/**
 * Measure Core Web Vitals
 */
export function measureWebVitals() {
  // Only run if PerformanceObserver is supported
  if (!('PerformanceObserver' in window)) {
    return;
  }

  try {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      logger.performance('LCP (Largest Contentful Paint)', {
        value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
        element: lastEntry.element?.tagName
      });
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        logger.performance('FID (First Input Delay)', {
          value: Math.round(entry.processingStart - entry.startTime),
          eventType: entry.name
        });
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }

      logger.performance('CLS (Cumulative Layout Shift)', {
        value: clsValue.toFixed(3)
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

  } catch (error) {
    logger.warn('Failed to measure web vitals', { error: error.message });
  }
}

/**
 * Measure navigation timing
 */
export function measureNavigationTiming() {
  // Wait for page load
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];

    if (navigation) {
      logger.performance('Navigation timing', {
        dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
        tcp: Math.round(navigation.connectEnd - navigation.connectStart),
        request: Math.round(navigation.responseStart - navigation.requestStart),
        response: Math.round(navigation.responseEnd - navigation.responseStart),
        domProcessing: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        onLoad: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        total: Math.round(navigation.loadEventEnd - navigation.fetchStart)
      });
    }
  });
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  measureWebVitals();
  measureNavigationTiming();

  logger.info('Performance monitoring initialized');
}
```

---

#### Step 6: Track Performance in Views

**Example: QuizView.js**

```javascript
import { performanceStart, performanceEnd } from '../utils/performance.js';

export default class QuizView {
  async render() {
    performanceStart('quiz-render');

    // ... render logic

    performanceEnd('quiz-render', { questionCount: this.questions.length });
  }

  async submitAnswer() {
    performanceStart('submit-answer');

    // ... submit logic

    performanceEnd('submit-answer', { questionNumber: this.currentQuestion });
  }
}
```

---

#### Step 7: Initialize Performance Monitoring

**File:** `src/main.js`

```javascript
import { initPerformanceMonitoring } from './utils/performance.js';

async function init() {
  try {
    initErrorHandling();
    initPerformanceMonitoring(); // NEW

    // ... rest of initialization
  } catch (error) {
    logger.error('Initialization failed', { error: error.message });
  }
}
```

---

### Part 4: User Action Tracking

#### Step 8: Track User Actions

**Add to key user interactions:**

```javascript
// When user starts quiz
logger.action('Quiz started', { topic, gradeLevel });

// When user submits answer
logger.action('Answer submitted', {
  questionNumber,
  correct: isCorrect,
  timeSpent: timeToAnswer
});

// When user completes quiz
logger.action('Quiz completed', {
  topic,
  score: `${score}/${totalQuestions}`,
  percentage,
  duration: totalTime
});

// When user changes settings
logger.action('Settings updated', {
  apiKeySet: !!apiKey,
  gradeLevel: defaultGradeLevel
});
```

---

## Testing

### Test Logging

**1. Check different log levels:**
```javascript
logger.debug('Debug message'); // Only in dev
logger.info('Info message');   // In both dev and prod
logger.warn('Warning message');
logger.error('Error message');
```

**2. Verify context logging:**
```javascript
logger.info('Quiz started', { topic: 'Math', gradeLevel: '5th' });
// Should log with timestamp, level, message, and context
```

**3. Test sensitive data redaction:**
```javascript
logger.info('Settings saved', {
  apiKey: 'sk-ant-secret123', // Should be [REDACTED]
  gradeLevel: 'middle school'  // Should appear normally
});
```

### Test Error Handling

**1. Trigger uncaught error:**
```javascript
// In console
throw new Error('Test error');
// Should log error and show notification
```

**2. Trigger promise rejection:**
```javascript
// In console
Promise.reject('Test rejection');
// Should log and show notification
```

### Test Performance

**1. Check console for:**
```
[INFO] [PERF] LCP (Largest Contentful Paint) { value: 234 }
[INFO] [PERF] FID (First Input Delay) { value: 12 }
[INFO] [PERF] Navigation timing { total: 567, ... }
```

**2. Verify custom metrics:**
```javascript
performanceStart('custom-operation');
// ... do something
performanceEnd('custom-operation');
// Should log duration
```

---

## Testing and Deployment

**IMPORTANT:** See [TESTING_AND_DEPLOYMENT_GUIDE.md](./TESTING_AND_DEPLOYMENT_GUIDE.md) for comprehensive testing and deployment procedures that apply to ALL Epic 3 phases.

### Phase 4 Specific Tests

**Unit Tests - Logger:**
```javascript
// tests/unit/logger.test.js
import { describe, it, expect } from 'vitest';
import { logger } from '../../src/utils/logger.js';

describe('Logger', () => {
  it('should redact API keys', () => {
    const message = logger.formatMessage('info', 'Test', {
      apiKey: 'sk-ant-secret123'
    });
    expect(message).toContain('[REDACTED]');
    expect(message).not.toContain('sk-ant-secret123');
  });

  it('should include context in logs', () => {
    const message = logger.info('Test', { userId: '123' });
    expect(message).toContain('userId');
  });
});
```

**Unit Tests - Error Handler:**
```javascript
// tests/unit/errorHandler.test.js
import { describe, it, expect, vi } from 'vitest';
import { handleError } from '../../src/utils/errorHandler.js';

describe('Error Handler', () => {
  it('should catch and log errors', () => {
    const spy = vi.spyOn(console, 'error');
    handleError(new Error('Test error'));
    expect(spy).toHaveBeenCalled();
  });
});
```

**E2E Tests - Error Tracking:**
```javascript
// tests/e2e/error-handling.spec.js
import { test, expect } from '@playwright/test';

test('should show user-friendly error on API failure', async ({ page }) => {
  // Mock API error
  await page.route('**/.netlify/functions/*', route => {
    route.fulfill({ status: 500, body: 'Server error' });
  });

  await page.goto('/');
  await page.click('button:has-text("Start New Quiz")');

  // Should show error notification
  await expect(page.locator('.error-notification')).toBeVisible();
  await expect(page.locator('.error-notification')).not.toContainText('500');
  await expect(page.locator('.error-notification')).toContainText('something went wrong');
});
```

**Run tests:**
```bash
npm test
npm run test:e2e
```

### Deployment Verification

**1. Local Development:**
- Logs appear in console
- Errors are caught and logged
- No sensitive data in logs

**2. Production Build:**
```bash
npm run build
npm run preview

# Check console:
# - Logs are filtered (less verbose)
# - Performance metrics logged
# - Errors still caught
```

**3. Production Verification:**
- Open browser console
- Check logs are structured
- Trigger an error intentionally
- Verify error is caught and logged
- Verify user sees friendly message

---

## Success Criteria

**Phase 4 is complete when:**

- ✅ Logger utility created with all log levels
- ✅ All `console.log()` replaced with `logger.*()` calls
- ✅ Sensitive data redaction working
- ✅ Global error handler catching errors
- ✅ Error notifications showing to users
- ✅ Performance monitoring initialized
- ✅ Core Web Vitals being measured
- ✅ Custom performance tracking working
- ✅ User actions being logged
- ✅ Logs include proper context and metadata
- ✅ Production logs filtered appropriately

---

## Next Steps

**After completing Phase 4:**
- ✅ Comprehensive observability
- ✅ Easy debugging in production
- ✅ Performance insights

**Move to Phase 5:**
- Repository & Project Structure
- Professional documentation
- Code organization
- Contributing guidelines

---

**Related Documentation:**
- Epic 3 Plan: `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md`
- Phase 3 (UI Polish): `docs/epic03_quizmaster_v2/PHASE3_UI_POLISH.md`
