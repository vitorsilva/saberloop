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

## Step-by-Step Teaching Plan

This phase is structured as 5 learning sessions. Each session builds on the previous one.

### Session 1: Setup & OAuth Foundation (~45 min)

| Step | What You'll Do | Learning Objective |
|------|---------------|-------------------|
| 1.1 | Create OpenRouter account | Understand the platform |
| 1.2 | Explore OpenRouter OAuth docs | Understand PKCE flow |
| 1.3 | Create `openrouter-auth.js` | Implement PKCE utilities |
| 1.4 | Test PKCE in browser console | Verify crypto functions work |

**Deliverables:**
- OpenRouter account created
- `src/api/openrouter-auth.js` with `generateCodeVerifier()` and `generateCodeChallenge()`

**Quiz yourself:**
- What is PKCE and why is it needed for browser apps?
- What's the difference between code_verifier and code_challenge?

---

### Session 2: Complete OAuth Flow (~60 min)

| Step | What You'll Do | Learning Objective |
|------|---------------|-------------------|
| 2.1 | Implement `startAuth()` | Build OAuth redirect URL |
| 2.2 | Implement `handleCallback()` | Exchange code for API key |
| 2.3 | Test OAuth flow manually | End-to-end verification |
| 2.4 | Handle edge cases | Error states, cancelled auth |

**Deliverables:**
- Complete `openrouter-auth.js` with all functions
- Successfully obtain API key through OAuth

**Quiz yourself:**
- Where is the code_verifier stored during the OAuth flow?
- What happens if someone intercepts the authorization code?

---

### Session 3: API Client & Storage (~45 min)

| Step | What You'll Do | Learning Objective |
|------|---------------|-------------------|
| 3.1 | Create `openrouter-client.js` | Direct browser API calls |
| 3.2 | Update IndexedDB schema | Add openrouter store |
| 3.3 | Implement key storage functions | Store/retrieve/delete key |
| 3.4 | Test API call with stored key | Verify full round-trip |

**Deliverables:**
- `src/api/openrouter-client.js` with `callOpenRouter()`
- Updated `src/db/db.js` with key storage functions

**Quiz yourself:**
- What headers does OpenRouter require?
- Why is it OK to store the API key in IndexedDB?

---

### Session 4: UI Integration (~60 min)

| Step | What You'll Do | Learning Objective |
|------|---------------|-------------------|
| 4.1 | Create WelcomeView | First-time user experience |
| 4.2 | Update router for OAuth callback | Handle redirect |
| 4.3 | Update HomeView for connected state | Conditional rendering |
| 4.4 | Update SettingsView | Disconnect option |

**Deliverables:**
- `src/views/WelcomeView.js` (new)
- Updated router, HomeView, SettingsView

**Quiz yourself:**
- How does the app know if a user is connected?
- What should happen when user clicks "Disconnect"?

---

### Session 5: Wire It Together & Polish (~60 min)

| Step | What You'll Do | Learning Objective |
|------|---------------|-------------------|
| 5.1 | Update `realApi.js` | Use OpenRouter instead of PHP |
| 5.2 | Add loading states | UX during OAuth |
| 5.3 | Add error handling UI | Graceful failures |
| 5.4 | End-to-end testing | Full user journey |
| 5.5 | Write unit tests | Test critical functions |

**Deliverables:**
- Updated `src/api/realApi.js`
- Loading and error UI components
- Unit tests passing

**Quiz yourself:**
- What happens if the API returns a 429 (rate limit)?
- How do you test the OAuth flow in E2E tests?

---

## Welcome Screen Design

The welcome screen appears for first-time users (no stored API key). Based on your existing mockup, adapted to current CSS.

### WelcomeView Layout

```
┌─────────────────────────────────────┐
│                                     │
│         [Hero Illustration]         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│      Unlock Your Knowledge          │
│                                     │
│   The fun way to learn and track    │
│          your progress.             │
│                                     │
├─────────────────────────────────────┤
│  ┌─────┐                            │
│  │ 🎯 │ Personalized Quizzes        │
│  └─────┘ Tailored to your learning  │
│                                     │
│  ┌─────┐                            │
│  │ 📈 │ Track Your Progress         │
│  └─────┘ See how much you've grown  │
│                                     │
│  ┌─────┐                            │
│  │ 📚 │ Diverse Topics              │
│  └─────┘ Explore quizzes on any     │
│          subject                    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│   ┌─────────────────────────────┐   │
│   │     Get Started Free        │   │
│   └─────────────────────────────┘   │
│                                     │
│   Free AI-powered quizzes           │
│   No credit card required           │
│                                     │
│   ℹ️ Free tier: data used for       │
│      model training. Learn more     │
│                                     │
└─────────────────────────────────────┘
```

### WelcomeView.js Code

**File:** `src/views/WelcomeView.js` (NEW)

```javascript
import BaseView from './BaseView.js';
import { startAuth } from '../api/openrouter-auth.js';

export default class WelcomeView extends BaseView {
  async render() {
    this.setHTML(`
      <div class="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
        <div class="flex w-full grow flex-col justify-between p-6 pt-12">

          <!-- Hero Section -->
          <div class="flex flex-col items-center">
            <!-- Hero Image -->
            <div class="relative w-full max-w-xs aspect-square flex items-center justify-center mb-8">
              <div class="w-full h-full bg-primary/10 dark:bg-primary/20 rounded-3xl flex items-center justify-center">
                <span class="material-symbols-outlined text-8xl text-primary">psychology</span>
              </div>
            </div>

            <!-- Headline -->
            <h1 class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight text-center">
              Unlock Your Knowledge
            </h1>
            <p class="text-subtext-light dark:text-subtext-dark text-base pt-2 text-center max-w-sm">
              The fun way to learn and track your progress.
            </p>
          </div>

          <!-- Benefits List -->
          <div class="mt-10 w-full max-w-md mx-auto space-y-4">
            <!-- Personalized Quizzes -->
            <div class="flex items-center gap-4 py-2">
              <div class="flex items-center justify-center rounded-xl bg-card-light dark:bg-card-dark size-14 shrink-0">
                <span class="material-symbols-outlined text-2xl text-primary">target</span>
              </div>
              <div class="flex flex-col">
                <p class="text-text-light dark:text-text-dark text-base font-medium">Personalized Quizzes</p>
                <p class="text-subtext-light dark:text-subtext-dark text-sm">Tailored to your learning style.</p>
              </div>
            </div>

            <!-- Track Progress -->
            <div class="flex items-center gap-4 py-2">
              <div class="flex items-center justify-center rounded-xl bg-card-light dark:bg-card-dark size-14 shrink-0">
                <span class="material-symbols-outlined text-2xl text-primary">trending_up</span>
              </div>
              <div class="flex flex-col">
                <p class="text-text-light dark:text-text-dark text-base font-medium">Track Your Progress</p>
                <p class="text-subtext-light dark:text-subtext-dark text-sm">See how much you've grown.</p>
              </div>
            </div>

            <!-- Diverse Topics -->
            <div class="flex items-center gap-4 py-2">
              <div class="flex items-center justify-center rounded-xl bg-card-light dark:bg-card-dark size-14 shrink-0">
                <span class="material-symbols-outlined text-2xl text-primary">category</span>
              </div>
              <div class="flex flex-col">
                <p class="text-text-light dark:text-text-dark text-base font-medium">Diverse Topics</p>
                <p class="text-subtext-light dark:text-subtext-dark text-sm">Explore quizzes on any subject.</p>
              </div>
            </div>
          </div>

          <!-- Action Area -->
          <div class="mt-12 flex w-full flex-col items-center gap-4 max-w-md mx-auto">
            <button
              id="getStartedBtn"
              class="flex h-14 w-full items-center justify-center rounded-xl bg-primary px-6 text-base font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </button>

            <p class="text-subtext-light dark:text-subtext-dark text-sm text-center">
              Free AI-powered quizzes. No credit card required.
            </p>

            <p class="text-subtext-light dark:text-subtext-dark text-xs text-center mt-2">
              <span class="material-symbols-outlined text-sm align-middle">info</span>
              Free tier uses data for model training.
              <a href="https://openrouter.ai/docs" target="_blank" rel="noopener" class="text-primary hover:underline">
                Learn more
              </a>
            </p>
          </div>

        </div>
      </div>
    `);

    this.attachListeners();
  }

  attachListeners() {
    const getStartedBtn = this.querySelector('#getStartedBtn');

    this.addEventListener(getStartedBtn, 'click', async () => {
      // Show loading state
      getStartedBtn.disabled = true;
      getStartedBtn.innerHTML = `
        <span class="material-symbols-outlined animate-spin mr-2">progress_activity</span>
        Connecting...
      `;

      try {
        await startAuth();
      } catch (error) {
        console.error('Failed to start auth:', error);
        getStartedBtn.disabled = false;
        getStartedBtn.textContent = 'Get Started Free';
        // Show error inline
        this.showError('Failed to connect. Please try again.');
      }
    });
  }

  showError(message) {
    // Remove existing error if any
    const existingError = document.getElementById('authError');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.id = 'authError';
    errorDiv.className = 'mt-4 p-3 bg-error/10 border border-error rounded-xl text-error text-sm text-center';
    errorDiv.textContent = message;

    const actionArea = this.querySelector('#getStartedBtn').parentElement;
    actionArea.insertBefore(errorDiv, actionArea.lastElementChild);
  }
}
```

---

## Additional UX Improvements

### Loading States

During OAuth flow, show visual feedback:

```javascript
// In WelcomeView - button loading state
getStartedBtn.innerHTML = `
  <span class="material-symbols-outlined animate-spin mr-2">progress_activity</span>
  Connecting...
`;
```

### OAuth Callback Loading Screen

Create a simple loading view for when user returns from OpenRouter:

**File:** `src/views/AuthCallbackView.js` (NEW)

```javascript
import BaseView from './BaseView.js';
import { handleCallback } from '../api/openrouter-auth.js';
import { storeOpenRouterKey } from '../db/db.js';

export default class AuthCallbackView extends BaseView {
  async render() {
    this.setHTML(`
      <div class="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div class="text-center">
          <span class="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p class="mt-4 text-text-light dark:text-text-dark text-lg font-medium">
            Completing connection...
          </p>
        </div>
      </div>
    `);

    await this.processCallback();
  }

  async processCallback() {
    try {
      const apiKey = await handleCallback();
      await storeOpenRouterKey(apiKey);

      // Success! Redirect to home
      this.navigateTo('/');
    } catch (error) {
      console.error('OAuth callback failed:', error);

      // Show error and redirect
      this.setHTML(`
        <div class="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark p-6">
          <div class="text-center max-w-sm">
            <span class="material-symbols-outlined text-5xl text-error">error</span>
            <p class="mt-4 text-text-light dark:text-text-dark text-lg font-medium">
              Connection Failed
            </p>
            <p class="mt-2 text-subtext-light dark:text-subtext-dark text-sm">
              ${error.message}
            </p>
            <button
              id="retryBtn"
              class="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      `);

      this.querySelector('#retryBtn')?.addEventListener('click', () => {
        this.navigateTo('/');
      });
    }
  }
}
```

### Offline Handling

Check network before attempting OAuth:

```javascript
// In WelcomeView attachListeners
this.addEventListener(getStartedBtn, 'click', async () => {
  if (!navigator.onLine) {
    this.showError('You\'re offline. Please connect to the internet to get started.');
    return;
  }
  // ... continue with OAuth
});
```

### Rate Limit Error Handling

In `openrouter-client.js`, provide helpful error messages:

```javascript
if (response.status === 429) {
  const resetTime = response.headers.get('X-RateLimit-Reset');
  const message = resetTime
    ? `Rate limit exceeded. Resets at ${new Date(resetTime * 1000).toLocaleTimeString()}`
    : 'Rate limit exceeded. Free tier allows 50 requests/day.';
  throw new Error(message);
}
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
| `src/views/WelcomeView.js` | **NEW** | First-time user onboarding |
| `src/views/AuthCallbackView.js` | **NEW** | OAuth callback handler |
| `src/db/db.js` | **MODIFY** | Add key storage functions |
| `src/api/realApi.js` | **MODIFY** | Use OpenRouter instead of PHP |
| `src/router/index.js` | **MODIFY** | Add routes for welcome & callback |
| `src/views/HomeView.js` | **MODIFY** | Check connection, redirect if needed |
| `src/views/SettingsView.js` | **MODIFY** | Disconnect option |
| `tests/unit/openrouter-auth.test.js` | **NEW** | Unit tests for auth |
| `tests/unit/openrouter-client.test.js` | **NEW** | Unit tests for API client |
| `tests/unit/openrouter-db.test.js` | **NEW** | Unit tests for key storage |
| `tests/e2e/openrouter-auth.spec.js` | **NEW** | E2E tests for auth flow |

---

## Testing Plan

### Unit Tests

Unit tests verify individual functions work correctly in isolation.

**File:** `tests/unit/openrouter-auth.test.js`

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock crypto API for Node environment
const mockCrypto = {
  getRandomValues: (arr) => {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    return arr;
  },
  subtle: {
    digest: vi.fn().mockResolvedValue(new ArrayBuffer(32))
  }
};

describe('OpenRouter Auth', () => {
  beforeEach(() => {
    global.crypto = mockCrypto;
    global.sessionStorage = {
      store: {},
      getItem: vi.fn((key) => this.store[key]),
      setItem: vi.fn((key, value) => { this.store[key] = value; }),
      removeItem: vi.fn((key) => { delete this.store[key]; })
    };
  });

  describe('generateCodeVerifier', () => {
    it('should generate a string of correct length', async () => {
      const { generateCodeVerifier } = await import('../../src/api/openrouter-auth.js');
      const verifier = generateCodeVerifier();

      expect(typeof verifier).toBe('string');
      expect(verifier.length).toBeGreaterThan(40);
    });

    it('should generate URL-safe characters only', async () => {
      const { generateCodeVerifier } = await import('../../src/api/openrouter-auth.js');
      const verifier = generateCodeVerifier();

      // Should not contain +, /, or =
      expect(verifier).not.toMatch(/[+/=]/);
    });

    it('should generate different values each time', async () => {
      const { generateCodeVerifier } = await import('../../src/api/openrouter-auth.js');
      const verifier1 = generateCodeVerifier();
      const verifier2 = generateCodeVerifier();

      expect(verifier1).not.toBe(verifier2);
    });
  });

  describe('generateCodeChallenge', () => {
    it('should generate a SHA-256 hash of verifier', async () => {
      const { generateCodeChallenge } = await import('../../src/api/openrouter-auth.js');
      const challenge = await generateCodeChallenge('test-verifier');

      expect(typeof challenge).toBe('string');
      expect(mockCrypto.subtle.digest).toHaveBeenCalledWith('SHA-256', expect.any(Uint8Array));
    });

    it('should generate URL-safe characters only', async () => {
      const { generateCodeChallenge } = await import('../../src/api/openrouter-auth.js');
      const challenge = await generateCodeChallenge('test-verifier');

      expect(challenge).not.toMatch(/[+/=]/);
    });
  });

  describe('isAuthCallback', () => {
    it('should return true when URL has code param', async () => {
      delete window.location;
      window.location = { search: '?code=abc123' };

      const { isAuthCallback } = await import('../../src/api/openrouter-auth.js');
      expect(isAuthCallback()).toBe(true);
    });

    it('should return false when URL has no code param', async () => {
      delete window.location;
      window.location = { search: '' };

      const { isAuthCallback } = await import('../../src/api/openrouter-auth.js');
      expect(isAuthCallback()).toBe(false);
    });
  });
});
```

**File:** `tests/unit/openrouter-client.test.js`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('OpenRouter Client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('callOpenRouter', () => {
    it('should send correct headers', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'test response' } }]
        })
      });

      const { callOpenRouter } = await import('../../src/api/openrouter-client.js');
      await callOpenRouter('test-key', 'test prompt');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
            'Content-Type': 'application/json',
            'X-Title': 'SaberLoop'
          })
        })
      );
    });

    it('should parse response correctly', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'AI response here' } }],
          model: 'test-model',
          usage: { prompt_tokens: 10, completion_tokens: 20 }
        })
      });

      const { callOpenRouter } = await import('../../src/api/openrouter-client.js');
      const result = await callOpenRouter('test-key', 'test prompt');

      expect(result.text).toBe('AI response here');
      expect(result.model).toBe('test-model');
    });

    it('should throw on 401 unauthorized', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Invalid key' } })
      });

      const { callOpenRouter } = await import('../../src/api/openrouter-client.js');

      await expect(callOpenRouter('bad-key', 'prompt'))
        .rejects.toThrow('Invalid API key');
    });

    it('should throw on 429 rate limit', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: { get: () => null },
        json: () => Promise.resolve({})
      });

      const { callOpenRouter } = await import('../../src/api/openrouter-client.js');

      await expect(callOpenRouter('key', 'prompt'))
        .rejects.toThrow('Rate limit exceeded');
    });

    it('should throw on empty response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '' } }]
        })
      });

      const { callOpenRouter } = await import('../../src/api/openrouter-client.js');

      await expect(callOpenRouter('key', 'prompt'))
        .rejects.toThrow('Empty response');
    });
  });
});
```

**File:** `tests/unit/openrouter-db.test.js`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock IndexedDB
const mockStore = {
  data: {},
  put: vi.fn(function(item) { this.data[item.id] = item; }),
  get: vi.fn(function(id) { return this.data[id]; }),
  delete: vi.fn(function(id) { delete this.data[id]; })
};

describe('OpenRouter Key Storage', () => {
  beforeEach(() => {
    mockStore.data = {};
    vi.resetAllMocks();
  });

  describe('storeOpenRouterKey', () => {
    it('should store key with timestamp', async () => {
      // Mock the db module
      vi.doMock('../../src/db/db.js', () => ({
        storeOpenRouterKey: async (key) => {
          mockStore.put({ id: 'api_key', key, storedAt: new Date().toISOString() });
        }
      }));

      const { storeOpenRouterKey } = await import('../../src/db/db.js');
      await storeOpenRouterKey('sk-or-test-key');

      expect(mockStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'api_key',
          key: 'sk-or-test-key'
        })
      );
    });
  });

  describe('getOpenRouterKey', () => {
    it('should return stored key', async () => {
      mockStore.data['api_key'] = { id: 'api_key', key: 'stored-key' };

      vi.doMock('../../src/db/db.js', () => ({
        getOpenRouterKey: async () => mockStore.data['api_key']?.key || null
      }));

      const { getOpenRouterKey } = await import('../../src/db/db.js');
      const key = await getOpenRouterKey();

      expect(key).toBe('stored-key');
    });

    it('should return null when no key stored', async () => {
      vi.doMock('../../src/db/db.js', () => ({
        getOpenRouterKey: async () => null
      }));

      const { getOpenRouterKey } = await import('../../src/db/db.js');
      const key = await getOpenRouterKey();

      expect(key).toBeNull();
    });
  });

  describe('isOpenRouterConnected', () => {
    it('should return true when key exists', async () => {
      vi.doMock('../../src/db/db.js', () => ({
        isOpenRouterConnected: async () => true
      }));

      const { isOpenRouterConnected } = await import('../../src/db/db.js');
      expect(await isOpenRouterConnected()).toBe(true);
    });

    it('should return false when no key', async () => {
      vi.doMock('../../src/db/db.js', () => ({
        isOpenRouterConnected: async () => false
      }));

      const { isOpenRouterConnected } = await import('../../src/db/db.js');
      expect(await isOpenRouterConnected()).toBe(false);
    });
  });
});
```

### Manual Testing Checklist

**OAuth Flow:**
- [ ] Click "Get Started Free" → Opens OpenRouter auth page
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
- [ ] Offline state → Shows offline message on welcome screen

**Settings:**
- [ ] Shows "Connected" status when connected
- [ ] Disconnect button → Removes key, shows welcome screen
- [ ] Reconnect → Full OAuth flow works again

**Loading States:**
- [ ] Button shows spinner while connecting
- [ ] Callback page shows loading spinner
- [ ] Error state shows retry button

### E2E Tests

```javascript
// tests/e2e/openrouter-auth.spec.js
import { test, expect } from '@playwright/test';

test.describe('OpenRouter Authentication', () => {
  test('shows welcome screen when not authenticated', async ({ page }) => {
    // Clear any stored keys
    await page.goto('/');
    await page.evaluate(() => indexedDB.deleteDatabase('saberloop'));
    await page.reload();

    await expect(page.locator('text=Unlock Your Knowledge')).toBeVisible();
    await expect(page.locator('#getStartedBtn')).toBeVisible();
  });

  test('get started button initiates OAuth flow', async ({ page }) => {
    await page.goto('/');

    // Click should redirect to OpenRouter
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('openrouter.ai/auth')),
      page.click('#getStartedBtn')
    ]);

    expect(request.url()).toContain('callback_url');
    expect(request.url()).toContain('code_challenge');
  });

  test('shows loading state while connecting', async ({ page }) => {
    await page.goto('/');

    await page.click('#getStartedBtn');

    await expect(page.locator('text=Connecting...')).toBeVisible();
  });

  test('shows error when offline', async ({ page }) => {
    await page.goto('/');

    // Simulate offline
    await page.context().setOffline(true);

    await page.click('#getStartedBtn');

    await expect(page.locator('text=offline')).toBeVisible();
  });
});

test.describe('Connected User', () => {
  test.beforeEach(async ({ page }) => {
    // Mock a stored API key
    await page.goto('/');
    await page.evaluate(() => {
      // Simulate stored key in IndexedDB
      const request = indexedDB.open('saberloop', 1);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('openrouter', 'readwrite');
        tx.objectStore('openrouter').put({
          id: 'api_key',
          key: 'test-key',
          storedAt: new Date().toISOString()
        });
      };
    });
    await page.reload();
  });

  test('shows home screen when authenticated', async ({ page }) => {
    await expect(page.locator('text=Welcome back!')).toBeVisible();
    await expect(page.locator('#startQuizBtn')).toBeVisible();
  });

  test('can disconnect from settings', async ({ page }) => {
    await page.click('a[href="#/settings"]');
    await page.click('#disconnect-openrouter');

    // Should show welcome screen again
    await expect(page.locator('text=Unlock Your Knowledge')).toBeVisible();
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
