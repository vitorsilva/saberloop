# Phase 3.7: OpenAI Integration

## Overview

Add OpenAI as an alternative LLM provider alongside OpenRouter. OpenAI supports CORS for browser calls (unlike Anthropic), making it possible to call the API directly from the frontend using user-provided API keys.

## Why This Phase?

- **Widespread Recognition** - OpenAI is the most well-known LLM provider; many users already have accounts
- **Similar Architecture** - OpenAI's API is OpenAI-compatible (OpenRouter actually mimics it)
- **Free Credits** - Users may have existing credits or access to free models (gpt-4o-mini is very affordable)
- **Flexibility** - More provider options = better user experience
- **No Backend Needed** - OpenAI supports CORS, so direct browser calls work

## Research Summary

### OpenAI API Compatibility

Based on research ([source](https://blog.kowalczyk.info/til-calling-grok-openai-anthropic-google-openrouter-api-from-the-browser.html)):

| Provider | CORS Support | Direct Browser Calls |
|----------|--------------|---------------------|
| OpenAI | **Yes** | Supported |
| OpenRouter | Yes | Supported |
| Anthropic | No | Requires server proxy |
| Google | No | Requires server proxy |

### API Comparison

| Aspect | OpenRouter | OpenAI |
|--------|------------|--------|
| **Endpoint** | `https://openrouter.ai/api/v1/chat/completions` | `https://api.openai.com/v1/chat/completions` |
| **Auth Header** | `Authorization: Bearer {key}` | `Authorization: Bearer {key}` |
| **Request Format** | OpenAI-compatible | Native |
| **Response Format** | OpenAI-compatible | Native |
| **Auth Flow** | OAuth PKCE | Manual API key entry |
| **Free Tier** | 50 requests/day | No ongoing free tier |
| **Cost** | Various free models available | Pay-per-use (gpt-4o-mini ~$0.15/1M tokens) |

### Key Insight

OpenRouter's API format is **identical** to OpenAI's because OpenRouter intentionally uses OpenAI-compatible endpoints. This means:
1. Our existing `openrouter-client.js` structure can be reused
2. Same request/response parsing logic
3. Only the endpoint URL and authentication differ

### OpenAI Pricing Context

([source](https://openai.com/api/pricing/))

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| gpt-4o-mini | $0.15/1M | $0.60/1M | Most cost-effective, excellent for structured output |
| gpt-4o | $2.50/1M | $10/1M | High quality |
| gpt-3.5-turbo | $0.50/1M | $1.50/1M | Legacy, still works |

**Practical cost for QuizMaster:**
- 5-question quiz generation: ~500-700 tokens = ~$0.0001 per quiz
- User could generate ~10,000 quizzes for $1

**Free credits situation** ([source](https://www.architjn.com/blog/free-openai-api-credits-how-to-get-and-use)):
- OpenAI discontinued general free credits for new accounts
- Some organizations may still have access via data-sharing program
- Most users will need to add payment method ($5 minimum)

---

## Architecture Decision

### Option A: Separate Client per Provider (Recommended)

```
src/api/
├── openrouter-client.js    (existing)
├── openrouter-auth.js      (existing)
├── openai-client.js        (new - API calls)
├── providers.js            (new - provider abstraction)
└── api.real.js             (updated - uses active provider)
```

**Pros:**
- Clean separation of concerns
- Easy to add more providers later (Grok, etc.)
- Each client handles provider-specific quirks
- Testable in isolation

### Option B: Generic Client with Config

Single client that switches behavior based on provider. More DRY but harder to maintain.

**Decision: Option A** - Separate clients with a provider abstraction layer

---

## Implementation Plan

### Session 1: OpenAI Client Module

**Goal:** Create `openai-client.js` that mirrors `openrouter-client.js` structure

#### Step 1.1: Create `src/api/openai-client.js`

```javascript
/**
 * OpenAI API Client
 * Makes direct browser → OpenAI API calls (CORS supported)
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Default model - cost-effective and excellent for structured output
const DEFAULT_MODEL = 'gpt-4o-mini';

// Debug logging
const DEBUG = false;
function log(...args) {
  if (DEBUG) console.log('[OpenAI Client]', ...args);
}

/**
 * Call OpenAI Chat API
 * @param {string} apiKey - User's OpenAI API key
 * @param {string} prompt - The prompt to send
 * @param {object} options - Optional settings (model, maxTokens, temperature)
 * @returns {Promise<{text: string, model: string, usage: object}>}
 */
export async function callOpenAI(apiKey, prompt, options = {}) {
  const {
    model = DEFAULT_MODEL,
    maxTokens = 2048,
    temperature = 0.7
  } = options;

  log('Calling OpenAI:', { model, maxTokens, temperature });

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  log('Response status:', response.status);

  // Handle errors
  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();

  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('Empty response from OpenAI');
  }

  log('Response received, length:', text.length);

  return {
    text,
    model: data.model,
    usage: data.usage
  };
}

/**
 * Handle API errors with helpful messages
 */
async function handleApiError(response) {
  const error = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error('Invalid API key. Please check your OpenAI API key.');
  }

  if (response.status === 429) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  if (response.status === 402 || response.status === 403) {
    throw new Error('Insufficient credits or access denied. Check your OpenAI account.');
  }

  throw new Error(error.error?.message || `API error: ${response.status}`);
}

/**
 * Test if an API key is valid
 * @param {string} apiKey - API key to test
 * @returns {Promise<boolean>}
 */
export async function testOpenAIKey(apiKey) {
  try {
    await callOpenAI(apiKey, 'Say "ok"', { maxTokens: 10 });
    return true;
  } catch (error) {
    log('API key test failed:', error.message);
    return false;
  }
}
```

#### Step 1.2: Create unit tests `src/api/openai-client.test.js`

Mirror the structure of `openrouter-client.test.js`:
- Test correct URL is called
- Test headers are sent correctly
- Test default model is used
- Test custom model option
- Test response parsing
- Test error handling (401, 429, 402)
- Test empty response handling
- Test `testOpenAIKey()` function

---

### Session 2: Provider Abstraction & DB Updates

**Goal:** Create provider management system and update IndexedDB

#### Step 2.1: Create `src/api/providers.js`

```javascript
/**
 * Provider configuration and abstraction
 */

export const PROVIDERS = {
  OPENROUTER: 'openrouter',
  OPENAI: 'openai'
};

export const PROVIDER_INFO = {
  [PROVIDERS.OPENROUTER]: {
    name: 'OpenRouter',
    description: 'Free tier: 50 requests/day',
    icon: 'link', // Material symbol
    hasOAuth: true,
    keyPrefix: 'sk-or-',
    settingsKey: 'openrouter_api_key'
  },
  [PROVIDERS.OPENAI]: {
    name: 'OpenAI',
    description: 'Pay-per-use (very affordable)',
    icon: 'smart_toy', // Material symbol
    hasOAuth: false,
    keyPrefix: 'sk-',
    settingsKey: 'openai_api_key'
  }
};

/**
 * Validate API key format (basic check)
 */
export function validateKeyFormat(provider, key) {
  const info = PROVIDER_INFO[provider];
  if (!info) return false;

  // OpenRouter keys start with sk-or-
  // OpenAI keys start with sk- (but not sk-or-)
  if (provider === PROVIDERS.OPENROUTER) {
    return key.startsWith('sk-or-');
  }
  if (provider === PROVIDERS.OPENAI) {
    return key.startsWith('sk-') && !key.startsWith('sk-or-');
  }
  return false;
}
```

#### Step 2.2: Update `src/db/db.js`

Add OpenAI key storage functions (similar to OpenRouter):

```javascript
// ========== OPENAI ==========

const OPENAI_KEY = 'openai_api_key';

export async function storeOpenAIKey(apiKey) {
  return saveSetting(OPENAI_KEY, {
    key: apiKey,
    storedAt: new Date().toISOString()
  });
}

export async function getOpenAIKey() {
  const data = await getSetting(OPENAI_KEY);
  return data?.key || null;
}

export async function removeOpenAIKey() {
  const db = await getDB();
  return db.delete('settings', OPENAI_KEY);
}

export async function isOpenAIConnected() {
  const key = await getOpenAIKey();
  return !!key;
}

// ========== ACTIVE PROVIDER ==========

const ACTIVE_PROVIDER_KEY = 'active_provider';

export async function getActiveProvider() {
  const provider = await getSetting(ACTIVE_PROVIDER_KEY);
  return provider || 'openrouter'; // Default to OpenRouter
}

export async function setActiveProvider(provider) {
  return saveSetting(ACTIVE_PROVIDER_KEY, provider);
}
```

#### Step 2.3: Add unit tests for new db functions

Add tests to `src/db/db.test.js`:
- Test `storeOpenAIKey()` / `getOpenAIKey()`
- Test `removeOpenAIKey()` / `isOpenAIConnected()`
- Test `getActiveProvider()` / `setActiveProvider()`

---

### Session 3: Update API Layer

**Goal:** Update `api.real.js` to use the active provider

#### Step 3.1: Create `src/api/llm-service.js` (Provider Dispatcher)

```javascript
/**
 * LLM Service - Dispatches calls to the active provider
 */

import { callOpenRouter } from './openrouter-client.js';
import { callOpenAI } from './openai-client.js';
import { getActiveProvider, getOpenRouterKey, getOpenAIKey } from '../db/db.js';
import { PROVIDERS } from './providers.js';

/**
 * Call the active LLM provider
 * @param {string} prompt - The prompt to send
 * @param {object} options - Provider-specific options
 * @returns {Promise<{text: string, model: string, usage: object}>}
 */
export async function callLLM(prompt, options = {}) {
  const provider = await getActiveProvider();

  if (provider === PROVIDERS.OPENAI) {
    const apiKey = await getOpenAIKey();
    if (!apiKey) {
      throw new Error('Not connected to OpenAI. Please add your API key in Settings.');
    }
    return callOpenAI(apiKey, prompt, options);
  }

  // Default: OpenRouter
  const apiKey = await getOpenRouterKey();
  if (!apiKey) {
    throw new Error('Not connected to OpenRouter. Please connect in Settings.');
  }
  return callOpenRouter(apiKey, prompt, options);
}

/**
 * Check if any provider is connected
 */
export async function isAnyProviderConnected() {
  const provider = await getActiveProvider();

  if (provider === PROVIDERS.OPENAI) {
    const key = await getOpenAIKey();
    return !!key;
  }

  const key = await getOpenRouterKey();
  return !!key;
}
```

#### Step 3.2: Update `src/api/api.real.js`

Replace direct `callOpenRouter()` calls with `callLLM()`:

```javascript
import { callLLM } from './llm-service.js';

export async function generateQuestions(topic, gradeLevel = 'middle school') {
  devLog(`[LLM] Generating questions for "${topic}" (${gradeLevel})`);

  // Build the prompt (unchanged)
  const prompt = `...`; // Same prompt as before

  try {
    // Call active provider
    const result = await callLLM(prompt, {
      maxTokens: 2048,
      temperature: 0.7
    });

    // Parse JSON (unchanged)
    // ...
  } catch (error) {
    console.error('Question generation failed:', error);
    throw error;
  }
}
```

#### Step 3.3: Unit tests for `llm-service.js`

- Test dispatches to OpenRouter when active
- Test dispatches to OpenAI when active
- Test throws error when no provider connected
- Test `isAnyProviderConnected()`

---

### Session 4: UI - Settings Page Updates

**Goal:** Add OpenAI connection option to Settings

#### Step 4.1: Update Account Section in `SettingsView.js`

Change from single-provider to multi-provider display:

**Layout concept:**
```
Account
─────────────────────────────────
[Active Provider Indicator]

┌─────────────────────────────────┐
│ ✓ OpenRouter                    │
│   Connected • Free tier         │
│   [Disconnect]                  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ○ OpenAI                        │
│   Not connected                 │
│   [Connect]                     │
└─────────────────────────────────┘
```

When OpenAI "Connect" is clicked:
1. Show API key input modal (not OAuth - OpenAI doesn't have public OAuth)
2. Validate key format (`sk-` prefix, not `sk-or-`)
3. Test key with `testOpenAIKey()`
4. Store in IndexedDB
5. Set as active provider

#### Step 4.2: Create `src/components/ApiKeyModal.js`

A reusable modal for entering API keys manually:

```javascript
/**
 * Show modal for entering an API key
 * @param {object} options - { provider, title, description, placeholder }
 * @returns {Promise<string|null>} The API key or null if cancelled
 */
export function showApiKeyModal(options) {
  return new Promise((resolve) => {
    const { provider, title, description, placeholder } = options;

    // Create modal with:
    // - Title (e.g., "Connect to OpenAI")
    // - Description (e.g., "Enter your OpenAI API key")
    // - Input field (password type with show/hide toggle)
    // - "Get API key" link to provider's website
    // - Validate button
    // - Cancel button

    // On validate:
    // 1. Check key format
    // 2. Test key with API call
    // 3. Resolve with key if valid

    // On cancel:
    // resolve(null)
  });
}
```

#### Step 4.3: Update `loadAccountStatus()` in SettingsView

```javascript
async loadAccountStatus() {
  const accountSection = this.querySelector('#accountSection');
  const activeProvider = await getActiveProvider();
  const isOpenRouterConnected = await isOpenRouterConnected();
  const isOpenAIConnected = await isOpenAIConnected();

  accountSection.innerHTML = `
    <!-- Provider Cards -->
    ${this.renderProviderCard('openrouter', isOpenRouterConnected, activeProvider === 'openrouter')}
    ${this.renderProviderCard('openai', isOpenAIConnected, activeProvider === 'openai')}
  `;

  // Bind event listeners for connect/disconnect/switch buttons
}

renderProviderCard(provider, isConnected, isActive) {
  const info = PROVIDER_INFO[provider];
  // Return HTML for provider card
}
```

---

### Session 5: UI - Welcome Page & Modal Updates

**Goal:** Update Welcome page and ConnectModal to support provider choice

#### Step 5.1: Update WelcomeView.js

Options:
1. **Keep simple** - Default to OpenRouter OAuth (current behavior)
2. **Add choice** - Show both options on welcome screen

**Recommendation:** Keep welcome screen simple with OpenRouter as default (it's free, lower barrier). Add OpenAI option only in Settings.

**Minimal change to WelcomeView:**
- Keep existing "Get Started Free" button for OpenRouter
- Add small text link: "Or connect with your own API key"
- Link goes to Settings page

#### Step 5.2: Update ConnectModal.js

When modal is shown, offer both options:

```
┌─────────────────────────────────────┐
│        Connect to Generate          │
│                                     │
│  [Icon] Connect with OpenRouter     │
│         Free • 50 requests/day      │
│                                     │
│  [Icon] Connect with OpenAI         │
│         Bring your own API key      │
│                                     │
│              [Cancel]               │
└─────────────────────────────────────┘
```

---

### Session 6: Testing & Polish

**Goal:** E2E tests and final polish

#### Step 6.1: Update E2E tests

Add tests for:
- OpenAI key entry flow in Settings
- Provider switching
- Quiz generation with OpenAI (mocked)
- Disconnect flow for OpenAI

#### Step 6.2: Error message improvements

Ensure error messages are provider-specific:
- "OpenRouter: Rate limit exceeded. Free tier allows 50 requests/day."
- "OpenAI: Insufficient credits. Please add credits at platform.openai.com"

#### Step 6.3: Update learning notes

Document what was built and key learnings.

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/api/openai-client.js` | OpenAI API client |
| `src/api/openai-client.test.js` | Unit tests |
| `src/api/providers.js` | Provider configuration |
| `src/api/llm-service.js` | Provider dispatcher |
| `src/api/llm-service.test.js` | Unit tests |
| `src/components/ApiKeyModal.js` | Manual API key entry modal |
| `docs/epic03_quizmaster_v2/PHASE3.7_LEARNING_NOTES.md` | Learning notes |

### Modified Files

| File | Changes |
|------|---------|
| `src/db/db.js` | Add OpenAI key functions, active provider |
| `src/db/db.test.js` | Add tests for new functions |
| `src/api/api.real.js` | Use `callLLM()` instead of `callOpenRouter()` |
| `src/views/SettingsView.js` | Multi-provider account section |
| `src/components/ConnectModal.js` | Provider choice |
| `tests/e2e/app.spec.js` | Add OpenAI-related tests |

---

## Success Criteria

1. **OpenAI client works** - Can call OpenAI API from browser
2. **Provider switching** - User can switch between OpenRouter/OpenAI in Settings
3. **Key validation** - API keys are validated before storing
4. **Consistent UX** - Both providers work identically for quiz generation
5. **Tests pass** - All unit tests and E2E tests pass
6. **Error handling** - Provider-specific error messages

---

## Risks & Considerations

### 1. OpenAI Has No Free Tier
Unlike OpenRouter, OpenAI requires payment. Users need to:
- Create OpenAI account
- Add payment method ($5 minimum)
- Generate API key

**Mitigation:** Make OpenRouter the default, OpenAI as "advanced" option.

### 2. API Key Security
Users enter API keys manually (no OAuth for OpenAI).

**Mitigation:**
- Password input field (masked)
- Clear warning about key storage
- Key stored in IndexedDB (not localStorage - slightly better for PWA isolation)
- Option to disconnect and remove key

### 3. Different Model Capabilities
OpenAI models may produce different quality output than OpenRouter free models.

**Mitigation:**
- Use gpt-4o-mini by default (excellent for structured JSON)
- Same prompts work on both

---

## Future Enhancements (Out of Scope)

- **Grok integration** - Similar pattern, supports CORS
- **Model selection UI** - Let users choose specific models
- **Cost tracking** - Show estimated cost per quiz
- **API key encryption** - Additional security layer

---

## References

- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/introduction)
- [Blog: Calling APIs from Browser](https://blog.kowalczyk.info/til-calling-grok-openai-anthropic-google-openrouter-api-from-the-browser.html)
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [Free OpenAI Credits Guide](https://www.architjn.com/blog/free-openai-api-credits-how-to-get-and-use)
- Existing code: `src/api/openrouter-client.js`, `src/api/openrouter-auth.js`
