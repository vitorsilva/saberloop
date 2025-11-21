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
