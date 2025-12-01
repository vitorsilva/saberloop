# Phase 3.6: OpenRouter Integration (Client-Side)

**Epic:** 3 - QuizMaster V2

**Phase:** 3.6

**Type:** Architecture Change / User Authentication

**Status:** Pending

**Estimated Time:** 2-3 sessions

**Prerequisites:** Phase 3.5 (Branding) complete

---

## Overview

This phase integrates **OpenRouter** with **OAuth PKCE authentication**, allowing users to connect their own OpenRouter accounts. Because OpenRouter supports CORS, LLM calls happen **directly from the browser** - no backend server required for AI functionality.

**Key Discovery:** Unlike Anthropic (which blocks browser requests), OpenRouter fully supports CORS. This means we can eliminate the PHP backend dependency for LLM calls entirely.

**Why This Phase is Critical:**
- **Zero cost for you** - Users use their own OpenRouter accounts
- **Free tier for users** - 50 requests/day at no cost
- **Frictionless onboarding** - OAuth login instead of copy-pasting API keys
- **Simpler architecture** - No backend needed for LLM calls

---

## Architecture Comparison

### Before (Phase 3.4 - PHP Backend)

```
User → Frontend (PWA) → PHP API on VPS → Anthropic API
                        ├── generate-questions.php
                        ├── generate-explanation.php
                        └── YOUR API key in .env

Problem: YOU pay for all API usage
```

### After (Phase 3.6 - Client-Side)

```
User → Frontend (PWA) → OpenRouter API (directly!)
       │                 ├── User's own API key
       │                 ├── CORS enabled ✓
       │                 └── Free tier: 50 req/day
       │
       └── OAuth PKCE flow to get user's key

Benefit: User pays (or uses free tier), you pay nothing
```

**No backend needed for LLM calls!** The PHP API becomes unused for AI functionality.

---

## Why OpenRouter?

### CORS Support Comparison

| Provider | CORS Support | Browser Calls? |
|----------|--------------|----------------|
| **OpenRouter** | ✅ Yes | ✅ Direct from browser |
| OpenAI | ✅ Yes | ✅ Direct from browser |
| xAI (Grok) | ✅ Yes | ✅ Direct from browser |
| Anthropic | ❌ No | ❌ Requires server proxy |
| Google | ❌ No | ❌ Requires server proxy |

This is why we needed PHP for Anthropic. With OpenRouter, the browser calls the API directly.

### Other Benefits

| Benefit | Description |
|---------|-------------|
| **Free Tier** | 50 requests/day for users without payment |
| **Multi-Model Access** | Claude, GPT-4, Gemini, Llama, DeepSeek via single API |
| **OAuth PKCE** | One-click login instead of API key copy-paste |
| **Automatic Fallbacks** | Route to backup models if primary unavailable |
| **User Control** | Users manage their own usage and billing |

---

## OpenRouter Free Tier Analysis

### Rate Limits

| User Type | Daily Requests | Per Minute |
|-----------|---------------|------------|
| Free users (no purchase) | 50 requests/day | 20 requests/minute |
| Users with $10+ credits | 1000 requests/day | 20 requests/minute |

### SaberLoop Usage Per Session

| Action | API Calls |
|--------|-----------|
| Generate 5 questions | 1 call |
| Generate explanation (per wrong answer) | 0-5 calls |
| **Typical session** | **2-4 calls** |

### Will Free Tier Suffice?

| User Type | Quizzes/Day | Requests/Day | Free Tier? |
|-----------|-------------|--------------|------------|
| Casual user | 1 quiz | ~3 requests | ✅ Plenty |
| Active student | 3-5 quizzes | ~15-25 requests | ✅ Comfortable |
| Heavy cramming | 10+ quizzes | ~30-50 requests | ⚠️ Near limit |

**Conclusion:** Free tier covers casual to moderate use. Heavy users can add $10 credit for 1000/day.

### Free Models Available

| Model | Parameters | Notes |
|-------|------------|-------|
| `deepseek/deepseek-chat-v3-0324:free` | Large | Excellent for structured JSON |
| `meta-llama/llama-4-maverick:free` | 400B | Good general purpose |
| `google/gemini-2.0-flash-exp:free` | - | Fast, good for simple quizzes |

**Important:** Free models require opting-in to data training. Disclose this to users.

---

## User Flow

### First-Time User

```
1. User opens SaberLoop
   └── Sees: "Connect with OpenRouter to start"

2. User clicks "Connect with OpenRouter"
   └── Browser opens: openrouter.ai/auth?callback_url=...

3. User on OpenRouter site:
   ├── Creates new account (if needed)
   ├── Logs in
   └── Clicks "Authorize SaberLoop"

4. Redirect back to SaberLoop
   └── URL contains: ?code=abc123...

5. SaberLoop exchanges code for API key
   └── POST to openrouter.ai/api/v1/auth/keys

6. API key stored in IndexedDB
   └── User can now generate quizzes!
```

### Returning User

```
1. User opens SaberLoop
   └── App checks IndexedDB for stored API key

2. Key found → Ready to use
   └── No login required

3. Key missing/expired → Show "Connect" button
```

---

## Implementation Steps

### Step 1: Create OpenRouter Authentication Module

**File:** `src/api/openrouter-auth.js` (NEW)

**Purpose:** Handle OAuth PKCE flow for OpenRouter authentication.

```javascript
/**
 * OpenRouter OAuth PKCE Authentication
 *
 * Flow:
 * 1. Generate code_verifier and code_challenge
 * 2. Redirect user to OpenRouter /auth
 * 3. User authorizes, redirected back with code
 * 4. Exchange code for API key
 * 5. Store key in IndexedDB
 */

const OPENROUTER_AUTH_URL = 'https://openrouter.ai/auth';
const OPENROUTER_KEY_EXCHANGE_URL = 'https://openrouter.ai/api/v1/auth/keys';
const CALLBACK_URL = window.location.origin + '/auth/callback';

// Generate random string for PKCE
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// SHA-256 hash for code challenge
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Start OAuth PKCE flow
 * Redirects user to OpenRouter for authentication
 */
export async function startAuth() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store verifier for later (needed for token exchange)
  sessionStorage.setItem('openrouter_code_verifier', codeVerifier);

  // Build auth URL
  const authUrl = new URL(OPENROUTER_AUTH_URL);
  authUrl.searchParams.set('callback_url', CALLBACK_URL);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  // Redirect to OpenRouter
  window.location.href = authUrl.toString();
}

/**
 * Handle OAuth callback
 * Called when user returns from OpenRouter with authorization code
 */
export async function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (!code) {
    throw new Error('No authorization code in callback');
  }

  const codeVerifier = sessionStorage.getItem('openrouter_code_verifier');
  if (!codeVerifier) {
    throw new Error('No code verifier found. Please try again.');
  }

  // Exchange code for API key
  const response = await fetch(OPENROUTER_KEY_EXCHANGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code,
      code_verifier: codeVerifier,
      code_challenge_method: 'S256'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to exchange code for API key');
  }

  const data = await response.json();

  // Clean up
  sessionStorage.removeItem('openrouter_code_verifier');

  // Clear URL params
  window.history.replaceState({}, '', window.location.pathname);

  return data.key; // The user's API key
}

/**
 * Check if we're on the OAuth callback page
 */
export function isAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('code');
}
```

---

### Step 2: Create OpenRouter API Client

**File:** `src/api/openrouter-client.js` (NEW)

**Purpose:** Make LLM API calls directly from browser using user's key.

```javascript
/**
 * OpenRouter API Client
 * Makes direct browser → OpenRouter API calls (CORS supported)
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Default free model - DeepSeek is excellent for structured JSON
const DEFAULT_MODEL = 'deepseek/deepseek-chat-v3-0324:free';

/**
 * Call OpenRouter API
 * @param {string} apiKey - User's OpenRouter API key
 * @param {string} prompt - The prompt to send
 * @param {object} options - Optional settings
 */
export async function callOpenRouter(apiKey, prompt, options = {}) {
  const {
    model = DEFAULT_MODEL,
    maxTokens = 2048,
    temperature = 0.7
  } = options;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'SaberLoop'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    // Handle specific error cases
    if (response.status === 401) {
      throw new Error('Invalid API key. Please reconnect with OpenRouter.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Free tier allows 50 requests/day.');
    }

    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();

  // OpenAI-compatible response format
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('Empty response from OpenRouter');
  }

  return {
    text,
    model: data.model,
    usage: data.usage
  };
}

/**
 * Test if API key is valid
 */
export async function testApiKey(apiKey) {
  try {
    await callOpenRouter(apiKey, 'Say "ok"', { maxTokens: 10 });
    return true;
  } catch (error) {
    return false;
  }
}
```

---

### Step 3: Update IndexedDB Schema for API Key Storage

**File:** `src/db/index.js` (MODIFY)

**Changes:** Add storage for OpenRouter API key.

```javascript
// Add to existing IndexedDB setup

const OPENROUTER_STORE = 'openrouter';

// In database upgrade handler, add:
if (!db.objectStoreNames.contains(OPENROUTER_STORE)) {
  db.createObjectStore(OPENROUTER_STORE, { keyPath: 'id' });
}

/**
 * Store OpenRouter API key
 */
export async function storeOpenRouterKey(apiKey) {
  const db = await getDB();
  const tx = db.transaction(OPENROUTER_STORE, 'readwrite');
  const store = tx.objectStore(OPENROUTER_STORE);

  await store.put({
    id: 'api_key',
    key: apiKey,
    storedAt: new Date().toISOString()
  });
}

/**
 * Get stored OpenRouter API key
 */
export async function getOpenRouterKey() {
  const db = await getDB();
  const tx = db.transaction(OPENROUTER_STORE, 'readonly');
  const store = tx.objectStore(OPENROUTER_STORE);

  const result = await store.get('api_key');
  return result?.key || null;
}

/**
 * Remove OpenRouter API key (disconnect)
 */
export async function removeOpenRouterKey() {
  const db = await getDB();
  const tx = db.transaction(OPENROUTER_STORE, 'readwrite');
  const store = tx.objectStore(OPENROUTER_STORE);

  await store.delete('api_key');
}

/**
 * Check if user is connected to OpenRouter
 */
export async function isOpenRouterConnected() {
  const key = await getOpenRouterKey();
  return !!key;
}
```

---

### Step 4: Update Real API Client

**File:** `src/api/realApi.js` (MODIFY)

**Changes:** Replace PHP backend calls with direct OpenRouter calls.

```javascript
import { callOpenRouter } from './openrouter-client.js';
import { getOpenRouterKey } from '../db/index.js';
import { PROMPTS } from './prompts.js';

/**
 * Generate quiz questions using OpenRouter
 */
export async function generateQuestions(topic, gradeLevel = 'High School') {
  const apiKey = await getOpenRouterKey();

  if (!apiKey) {
    throw new Error('Not connected to OpenRouter. Please connect first.');
  }

  const prompt = PROMPTS.generateQuestions(topic, gradeLevel);

  const result = await callOpenRouter(apiKey, prompt, {
    maxTokens: 2048,
    temperature: 0.7
  });

  // Parse JSON response
  let data;
  try {
    data = JSON.parse(result.text);
  } catch (e) {
    throw new Error('Invalid response format from AI');
  }

  // Validate structure
  if (!data.questions || !Array.isArray(data.questions) || data.questions.length !== 5) {
    throw new Error('Invalid questions format from AI');
  }

  return {
    language: data.language || 'EN-US',
    questions: data.questions
  };
}

/**
 * Generate explanation for wrong answer using OpenRouter
 */
export async function generateExplanation(question, correctAnswer, userAnswer) {
  const apiKey = await getOpenRouterKey();

  if (!apiKey) {
    throw new Error('Not connected to OpenRouter. Please connect first.');
  }

  const prompt = PROMPTS.generateExplanation(question, correctAnswer, userAnswer);

  const result = await callOpenRouter(apiKey, prompt, {
    maxTokens: 500,
    temperature: 0.7
  });

  return result.text;
}
```

---

### Step 5: Create Auth Callback Route

**File:** `src/router/index.js` (MODIFY)

**Changes:** Add route handler for OAuth callback.

```javascript
import { isAuthCallback, handleCallback } from '../api/openrouter-auth.js';
import { storeOpenRouterKey } from '../db/index.js';

// In router initialization, check for OAuth callback
export async function initRouter() {
  // Handle OAuth callback before normal routing
  if (isAuthCallback()) {
    try {
      const apiKey = await handleCallback();
      await storeOpenRouterKey(apiKey);

      // Redirect to home or previous page
      window.location.href = '/';
      return;
    } catch (error) {
      console.error('OAuth callback failed:', error);
      // Show error to user
      alert('Failed to connect with OpenRouter: ' + error.message);
      window.location.href = '/';
      return;
    }
  }

  // Normal routing continues...
}
```

---

### Step 6: Update UI - Connection Status

**File:** `src/views/HomeView.js` (MODIFY)

**Changes:** Show connection status and connect button.

```javascript
import { isOpenRouterConnected } from '../db/index.js';
import { startAuth } from '../api/openrouter-auth.js';

export async function renderHomeView() {
  const isConnected = await isOpenRouterConnected();

  if (!isConnected) {
    return `
      <div class="connect-prompt">
        <h2>Welcome to SaberLoop!</h2>
        <p>To generate quizzes, connect your free OpenRouter account.</p>
        <p class="free-tier-info">
          Free tier includes 50 quiz generations per day - no credit card required!
        </p>
        <button id="connect-openrouter" class="btn-primary">
          Connect with OpenRouter
        </button>
        <p class="privacy-note">
          Note: Free tier uses your data for model training.
          <a href="https://openrouter.ai/docs" target="_blank">Learn more</a>
        </p>
      </div>
    `;
  }

  // User is connected - show normal quiz interface
  return `
    <div class="quiz-setup">
      <!-- Normal quiz creation UI -->
    </div>
  `;
}

// Event handler for connect button
export function attachHomeViewEvents() {
  const connectBtn = document.getElementById('connect-openrouter');
  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      startAuth();
    });
  }
}
```

---

### Step 7: Update Settings View - Disconnect Option

**File:** `src/views/SettingsView.js` (MODIFY)

**Changes:** Allow users to disconnect/reconnect.

```javascript
import { isOpenRouterConnected, removeOpenRouterKey } from '../db/index.js';
import { startAuth } from '../api/openrouter-auth.js';

export async function renderOpenRouterSection() {
  const isConnected = await isOpenRouterConnected();

  if (isConnected) {
    return `
      <div class="settings-section">
        <h3>OpenRouter Connection</h3>
        <p class="status connected">✓ Connected</p>
        <p>Free tier: 50 requests/day</p>
        <button id="disconnect-openrouter" class="btn-secondary">
          Disconnect
        </button>
      </div>
    `;
  }

  return `
    <div class="settings-section">
      <h3>OpenRouter Connection</h3>
      <p class="status disconnected">Not connected</p>
      <button id="connect-openrouter" class="btn-primary">
        Connect with OpenRouter
      </button>
    </div>
  `;
}

export function attachSettingsEvents() {
  const disconnectBtn = document.getElementById('disconnect-openrouter');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', async () => {
      await removeOpenRouterKey();
      location.reload();
    });
  }

  const connectBtn = document.getElementById('connect-openrouter');
  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      startAuth();
    });
  }
}
```

---

## What Happens to PHP Backend?

The PHP backend on your VPS becomes **unused for LLM calls**. Options:

### Option A: Leave It (Recommended for Now)
- Keep the PHP files but don't use them
- Can repurpose later for analytics, admin features, etc.
- Zero maintenance needed

### Option B: Remove It
- Delete the PHP API files
- Remove from VPS if not needed for other purposes
- Simpler but loses flexibility

**Recommendation:** Leave it for now. Focus on getting OpenRouter working.

---

## Files Changed Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/api/openrouter-auth.js` | **NEW** | OAuth PKCE flow |
| `src/api/openrouter-client.js` | **NEW** | Direct API calls |
| `src/db/index.js` | **MODIFY** | Store API key |
| `src/api/realApi.js` | **MODIFY** | Use OpenRouter instead of PHP |
| `src/router/index.js` | **MODIFY** | Handle OAuth callback |
| `src/views/HomeView.js` | **MODIFY** | Show connect prompt |
| `src/views/SettingsView.js` | **MODIFY** | Disconnect option |

---

## Testing Plan

### Manual Testing Checklist

**OAuth Flow:**
- [ ] Click "Connect with OpenRouter" → Opens OpenRouter auth page
- [ ] Create new OpenRouter account → Works
- [ ] Authorize app → Redirects back to SaberLoop
- [ ] API key stored in IndexedDB → Can verify in DevTools
- [ ] Returning user → Key persists, no re-auth needed

**Quiz Generation:**
- [ ] Generate quiz → Calls OpenRouter directly (check Network tab)
- [ ] Questions returned → Valid JSON structure
- [ ] Explanation generation → Works

**Error Handling:**
- [ ] Invalid/expired key → Shows "reconnect" message
- [ ] Rate limit exceeded → Shows appropriate error
- [ ] Network error → Graceful failure

**Settings:**
- [ ] Shows "Connected" status when connected
- [ ] Disconnect button → Removes key, shows connect prompt
- [ ] Reconnect → Full OAuth flow works again

### E2E Tests

```javascript
// tests/e2e/openrouter-auth.spec.js
import { test, expect } from '@playwright/test';

test.describe('OpenRouter Authentication', () => {
  test('shows connect prompt when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#connect-openrouter')).toBeVisible();
  });

  test('connect button redirects to OpenRouter', async ({ page }) => {
    await page.goto('/');

    const [popup] = await Promise.all([
      page.waitForURL(/openrouter\.ai\/auth/),
      page.click('#connect-openrouter')
    ]);

    expect(popup.url()).toContain('openrouter.ai/auth');
  });
});
```

---

## Security Considerations

### API Key Storage

| Aspect | Implementation |
|--------|----------------|
| **Where stored** | IndexedDB (browser) |
| **Encryption** | Browser-native (same as localStorage) |
| **Visibility** | User can see in DevTools (it's THEIR key) |
| **Exposure risk** | Minimal - key is user's own |

### Why Browser Storage is OK

1. **It's the user's own key** - Not a shared secret
2. **OpenRouter designed for this** - Their OAuth flow expects browser storage
3. **Same as other apps** - ChatGPT, Poe, etc. store tokens in browser
4. **User control** - They can revoke on openrouter.ai anytime

### PKCE Security

- **Code verifier** - Random 32-byte string, never sent to OpenRouter
- **Code challenge** - SHA-256 hash of verifier, sent in auth URL
- **Protection** - Even if someone intercepts the auth code, they can't exchange it without the verifier

---

## Success Criteria

**Phase complete when:**

- [ ] OAuth PKCE flow implemented and working
- [ ] User can connect OpenRouter account with one click
- [ ] API key stored securely in IndexedDB
- [ ] Quiz generation works via direct browser → OpenRouter calls
- [ ] Explanation generation works
- [ ] Settings shows connection status
- [ ] User can disconnect and reconnect
- [ ] Error handling for invalid key, rate limits
- [ ] No PHP backend calls for LLM functionality
- [ ] Free tier (50 req/day) is sufficient for testing

**Verification:**

```
1. Clear all site data
2. Open SaberLoop
3. Click "Connect with OpenRouter"
4. Create free OpenRouter account
5. Authorize SaberLoop
6. Generate a quiz → Should work!
7. Check Network tab → Calls go to openrouter.ai, not your PHP API
```

---

## Cost Summary

| Who | Cost |
|-----|------|
| **You (developer)** | $0 - No API keys, no server costs for LLM |
| **User (free tier)** | $0 - 50 requests/day |
| **User (power user)** | $10 one-time for 1000 req/day |

---

## References

- [OpenRouter OAuth PKCE Documentation](https://openrouter.ai/docs/use-cases/oauth-pkce)
- [OpenRouter API Reference](https://openrouter.ai/docs/api-reference/overview)
- [OpenRouter Free Models](https://openrouter.ai/models?q=free)
- [CORS Support Confirmation](https://blog.kowalczyk.info/til-calling-grok-openai-anthropic-google-openrouter-api-from-the-browser.html)
- [Web Crypto API (for PKCE)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

## Related Documentation

- Epic 3 Plan: `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md`
- Phase 3.4 (PHP Backend - now optional): `docs/epic03_quizmaster_v2/PHASE3.4_PHP_MIGRATION.md`
- OpenRouter Research: `docs/epic03_quizmaster_v2/investigating_openroute.md`
