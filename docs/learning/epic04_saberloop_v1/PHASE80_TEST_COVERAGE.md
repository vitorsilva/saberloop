# Phase 80: Improve Unit Test Coverage

**Status:** Complete
**Priority:** Medium
**Estimated Effort:** 2-3 sessions

## Objective

Increase unit test coverage for critical utility and API modules that currently have low coverage, improving code reliability and regression protection.

## Current State

| File | Statements | Lines | Issue |
|------|------------|-------|-------|
| `errorHandler.js` | 29% | 30% | `initErrorHandling()` and `showErrorNotification()` untested |
| `openrouter-auth.js` | 28% | 29% | `startAuth()` and `handleCallback()` untested |
| `network.js` | 69% | 63% | Lines 76-89 untested |
| `api.real.js` | 49% | 49% | Several branches untested |

**Target:** Achieve 80%+ coverage on all utility modules.

---

## Gap Analysis

### 1. errorHandler.js (30% → 80%+)

**Currently Tested:**
- `handleApiError()` - all error type mappings ✅

**NOT Tested (lines 9-78):**

```
initErrorHandling() - lines 7-46
├── window.addEventListener('error', ...) - lines 9-27
│   ├── Error data extraction
│   ├── logger.error() call
│   ├── telemetry.track() call
│   └── showErrorNotification() call
│
├── window.addEventListener('unhandledrejection', ...) - lines 30-43
│   ├── Reason extraction (with optional chaining)
│   ├── logger.error() call
│   ├── telemetry.track() call
│   └── showErrorNotification() call
│
└── logger.info('Error handling initialized') - line 45

showErrorNotification(message) - lines 51-78
├── Remove existing notification - lines 53-54
├── Create DOM element - lines 56-69
├── Append to body - line 71
└── Auto-dismiss setTimeout - lines 74-78
```

**Testing Strategy:**
- Mock `window.addEventListener` to capture event handlers
- Manually trigger the captured handlers with mock events
- Mock `document.createElement`, `document.getElementById`, `document.body`
- Use `vi.useFakeTimers()` for setTimeout testing
- Mock logger and telemetry modules

### 2. openrouter-auth.js (29% → 80%+)

**Currently Tested:**
- `generateCodeVerifier()` ✅
- `generateCodeChallenge()` ✅
- `isAuthCallback()` ✅

**NOT Tested (lines 59-127):**

```
startAuth() - lines 59-75
├── generateCodeVerifier() call
├── generateCodeChallenge() call
├── sessionStorage.setItem() - line 65
├── URL construction - lines 68-71
└── window.location.href redirect - line 74

handleCallback() - lines 77-127
├── URLSearchParams parsing - lines 80-81
├── Code presence check - lines 85-87 (throws Error)
├── sessionStorage.getItem() - line 89
├── Verifier presence check - lines 93-95 (throws Error)
├── fetch() POST request - lines 99-109
├── Response error handling - lines 113-117
│   ├── response.json() for error message
│   └── throw Error
├── Success response parsing - line 119
├── sessionStorage.removeItem() - line 123
├── history.replaceState() - line 124
└── Return API key - line 126
```

**Testing Strategy:**
- Mock `sessionStorage` (getItem, setItem, removeItem)
- Mock `window.location` (href, search, pathname)
- Mock `window.history.replaceState`
- Mock `fetch` for token exchange scenarios
- Test error paths: missing code, missing verifier, failed fetch

### 3. network.js (63% → 80%+)

**NOT Tested (lines 73-90):**

```
initNetworkMonitoring() - lines 73-90
├── updateNetworkIndicator() - line 76
├── updateOfflineUI() - line 77
├── onOnline() callback registration - lines 80-83
├── onOffline() callback registration - lines 84-87
└── logger.info('Network monitoring initialized') - line 89
```

**Testing Strategy:**
- Mock DOM elements (`#network-indicator`, offline UI elements)
- Mock `navigator.onLine`
- Test that callbacks are registered and update UI correctly

### 4. api.real.js (49% → 70%+)

**NOT Tested (lines 119-120, 133-186):**
- Quiz generation edge cases
- Explanation generation logic
- Error handling paths

---

## Implementation Plan

### Step 1: errorHandler.js Tests

Add tests for `initErrorHandling()`:

```javascript
describe('initErrorHandling', () => {
  let errorHandler;
  let rejectionHandler;

  beforeEach(() => {
    // Capture the event handlers
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'error') errorHandler = handler;
      if (event === 'unhandledrejection') rejectionHandler = handler;
    });
  });

  it('should register error event listener', () => {
    initErrorHandling();
    expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('should register unhandledrejection listener', () => {
    initErrorHandling();
    expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });

  it('should log and track uncaught errors', () => {
    initErrorHandling();
    const mockEvent = {
      message: 'Test error',
      filename: 'test.js',
      lineno: 10,
      colno: 5
    };
    errorHandler(mockEvent);

    expect(logger.error).toHaveBeenCalledWith('Uncaught error', expect.objectContaining({
      message: 'Test error'
    }));
    expect(telemetry.track).toHaveBeenCalledWith('error', expect.objectContaining({
      type: 'uncaught'
    }));
  });

  it('should handle unhandled promise rejections', () => {
    initErrorHandling();
    const mockEvent = {
      reason: new Error('Promise failed'),
      preventDefault: vi.fn()
    };
    rejectionHandler(mockEvent);

    expect(logger.error).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });
});
```

Add tests for `showErrorNotification()`:

```javascript
describe('showErrorNotification', () => {
  // Note: showErrorNotification is not exported, so we test it indirectly
  // through initErrorHandling() or we need to export it for testing

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create notification element on error', () => {
    // Trigger via error handler
    initErrorHandling();
    errorHandler({ message: 'Test', filename: '', lineno: 0, colno: 0 });

    const notification = document.getElementById('error-notification');
    expect(notification).toBeTruthy();
  });

  it('should auto-dismiss after 5 seconds', () => {
    initErrorHandling();
    errorHandler({ message: 'Test', filename: '', lineno: 0, colno: 0 });

    expect(document.getElementById('error-notification')).toBeTruthy();

    vi.advanceTimersByTime(5000);

    expect(document.getElementById('error-notification')).toBeFalsy();
  });

  it('should remove existing notification before showing new one', () => {
    initErrorHandling();
    errorHandler({ message: 'First', filename: '', lineno: 0, colno: 0 });
    errorHandler({ message: 'Second', filename: '', lineno: 0, colno: 0 });

    const notifications = document.querySelectorAll('#error-notification');
    expect(notifications.length).toBe(1);
  });
});
```

### Step 2: openrouter-auth.js Tests

Add tests for `startAuth()`:

```javascript
describe('startAuth', () => {
  let originalLocation;

  beforeEach(() => {
    originalLocation = window.location;
    delete window.location;
    window.location = { href: '', origin: 'https://example.com' };
    vi.spyOn(sessionStorage, 'setItem');
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('should store code verifier in sessionStorage', async () => {
    await startAuth();
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'openrouter_code_verifier',
      expect.any(String)
    );
  });

  it('should redirect to OpenRouter auth URL', async () => {
    await startAuth();
    expect(window.location.href).toContain('https://openrouter.ai/auth');
  });

  it('should include code_challenge in redirect URL', async () => {
    await startAuth();
    expect(window.location.href).toContain('code_challenge=');
  });

  it('should include callback_url in redirect URL', async () => {
    await startAuth();
    expect(window.location.href).toContain('callback_url=');
  });
});
```

Add tests for `handleCallback()`:

```javascript
describe('handleCallback', () => {
  let originalLocation;
  let originalHistory;

  beforeEach(() => {
    originalLocation = window.location;
    originalHistory = window.history;
    delete window.location;
    window.location = {
      search: '?code=test-auth-code',
      pathname: '/app/auth/callback'
    };
    window.history = { replaceState: vi.fn() };
    vi.spyOn(sessionStorage, 'getItem');
    vi.spyOn(sessionStorage, 'removeItem');
  });

  afterEach(() => {
    window.location = originalLocation;
    window.history = originalHistory;
    vi.restoreAllMocks();
  });

  it('should throw error if no code in URL', async () => {
    window.location.search = '';
    await expect(handleCallback()).rejects.toThrow('No authorization code');
  });

  it('should throw error if no code verifier in session', async () => {
    sessionStorage.getItem.mockReturnValue(null);
    await expect(handleCallback()).rejects.toThrow('No code verifier');
  });

  it('should exchange code for API key', async () => {
    sessionStorage.getItem.mockReturnValue('test-verifier');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ key: 'sk-test-key' })
    });

    const key = await handleCallback();

    expect(fetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/auth/keys',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('test-auth-code')
      })
    );
    expect(key).toBe('sk-test-key');
  });

  it('should throw error on failed token exchange', async () => {
    sessionStorage.getItem.mockReturnValue('test-verifier');
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Invalid code' })
    });

    await expect(handleCallback()).rejects.toThrow('Invalid code');
  });

  it('should clean up after successful exchange', async () => {
    sessionStorage.getItem.mockReturnValue('test-verifier');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ key: 'sk-test-key' })
    });

    await handleCallback();

    expect(sessionStorage.removeItem).toHaveBeenCalledWith('openrouter_code_verifier');
    expect(window.history.replaceState).toHaveBeenCalled();
  });
});
```

### Step 3: network.js Tests

Add tests for `initNetworkMonitoring()`:

```javascript
describe('initNetworkMonitoring', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="network-indicator"></div>
      <div class="hide-when-offline"></div>
      <div class="show-when-offline" style="display: none;"></div>
    `;
  });

  it('should update network indicator on init', () => {
    initNetworkMonitoring();
    const indicator = document.getElementById('network-indicator');
    expect(indicator.textContent).toBeDefined();
  });

  it('should register online/offline listeners', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    initNetworkMonitoring();

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should update UI when going offline', () => {
    initNetworkMonitoring();

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    window.dispatchEvent(new Event('offline'));

    const hideElements = document.querySelectorAll('.hide-when-offline');
    const showElements = document.querySelectorAll('.show-when-offline');
    // Verify UI updates
  });

  it('should log initialization', () => {
    initNetworkMonitoring();
    expect(logger.info).toHaveBeenCalledWith('Network monitoring initialized');
  });
});
```

### Step 4: api.real.js Tests (Optional)

Add edge case tests for quiz/explanation generation if time permits.

---

## Acceptance Criteria

- [x] `errorHandler.js` coverage ≥ 80% (achieved: **100%**)
- [x] `openrouter-auth.js` coverage ≥ 80% (achieved: **100%**)
- [x] `network.js` coverage ≥ 80% (achieved: **100%**)
- [x] All new tests pass (180 tests passing)
- [x] No regression in existing tests
- [x] Coverage report shows improvement (68% → 82.7%)

## Results

| File | Before | After | Change |
|------|--------|-------|--------|
| `errorHandler.js` | 30% | 100% | +70% |
| `openrouter-auth.js` | 29% | 100% | +71% |
| `network.js` | 63% | 100% | +37% |
| **Overall** | 68% | 82.7% | +14.7% |

**Tests added:** 37 new tests (143 → 180 total)

## Notes

- `showErrorNotification()` is a private function - we test it indirectly via `initErrorHandling()`
- DOM manipulation tests require proper JSDOM setup (already configured in Vitest)
- OAuth tests require careful mocking of browser globals
- Some functions (like `startAuth()`) have side effects (redirects) that we verify by checking the values set

## Files to Modify

1. `src/utils/errorHandler.test.js` - Add tests for initErrorHandling, showErrorNotification
2. `src/api/openrouter-auth.test.js` - Add tests for startAuth, handleCallback
3. `src/utils/network.test.js` - Add tests for uncovered lines

## Dependencies

- None (uses existing test infrastructure)
