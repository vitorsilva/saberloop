# OpenRouter Integration Plan

 

**Epic:** 3 - QuizMaster V2

**Type:** Enhancement / Alternative Backend Provider

**Status:** Planning

**Estimated Time:** 1-2 sessions

**Prerequisites:** Phase 1 (Backend Integration) complete

 

---

 

## Overview

 

This document outlines the plan to integrate **OpenRouter** as an alternative (or replacement) to direct Anthropic Claude API access. OpenRouter provides a unified API gateway to 400+ AI models from multiple providers through a single endpoint.

 

**What you'll build:**

- OpenRouter-compatible API calls in Netlify Functions

- Environment-based provider switching (Anthropic vs OpenRouter)

- Model selection configuration

- Fallback model support for resilience

 

**Why OpenRouter?**

 

| Benefit | Description |

|---------|-------------|

| **Multi-Model Access** | Access Claude, GPT-4, Gemini, Llama, and 400+ other models with one API key |

| **Provider Flexibility** | Switch between models without code changes |

| **Automatic Fallbacks** | OpenRouter can route to backup models if primary is unavailable |

| **Unified Billing** | Single billing relationship instead of multiple provider accounts |

| **Cost Optimization** | Compare model pricing, choose cost-effective options |

| **Resilience** | Less vendor lock-in, automatic failover options |

 

---

 

## Current State vs Target State

 

### Current State (Direct Anthropic API)

 

```

Frontend (SPA) → Netlify Functions → Anthropic API

                                     ├── Endpoint: https://api.anthropic.com/v1/messages

                                     ├── Auth: x-api-key header

                                     ├── Model: claude-sonnet-4-20250514

                                     └── Format: Anthropic Messages API

```

 

**Current Implementation:**

- **Endpoint:** `https://api.anthropic.com/v1/messages`

- **Authentication:** `x-api-key: ANTHROPIC_API_KEY`

- **Headers:** `anthropic-version: 2023-06-01`

- **Model:** `claude-sonnet-4-20250514` (hardcoded)

- **Request Format:** Anthropic Messages API format

 

### Target State (OpenRouter Integration)

 

```

Frontend (SPA) → Netlify Functions → OpenRouter API → Multiple Providers

                                     ├── Endpoint: https://openrouter.ai/api/v1/chat/completions

                                     ├── Auth: Bearer token

                                     ├── Models: anthropic/claude-sonnet-4, openai/gpt-4o, etc.

                                     └── Format: OpenAI Chat Completions API

```

 

**Target Implementation:**

- **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

- **Authentication:** `Authorization: Bearer OPENROUTER_API_KEY`

- **Headers:** `HTTP-Referer` (required), `X-Title` (optional)

- **Model:** Configurable via environment variable

- **Request Format:** OpenAI Chat Completions API format (industry standard)

- **Provider Switching:** Environment variable to choose Anthropic or OpenRouter

 

---

 

## Key API Differences

 

### Authentication

 

| Aspect | Anthropic API | OpenRouter API |

|--------|---------------|----------------|

| **Header** | `x-api-key: sk-ant-xxx` | `Authorization: Bearer sk-or-xxx` |

| **Version Header** | `anthropic-version: 2023-06-01` | Not required |

| **Referer Header** | Not required | `HTTP-Referer: https://your-app.com` (required) |

| **App Name** | Not applicable | `X-Title: QuizMaster` (optional, for leaderboards) |

 

### API Endpoint & Format

 

| Aspect | Anthropic API | OpenRouter API |

|--------|---------------|----------------|

| **Endpoint** | `https://api.anthropic.com/v1/messages` | `https://openrouter.ai/api/v1/chat/completions` |

| **Request Format** | Anthropic Messages API | OpenAI Chat Completions API |

| **Response Format** | `data.content[0].text` | `data.choices[0].message.content` |

 

### Request Body Structure

 

**Anthropic API (Current):**

```javascript

{

  model: 'claude-sonnet-4-20250514',

  max_tokens: 2048,

  temperature: 0.7,

  messages: [

    { role: 'user', content: 'Your prompt here' }

  ]

}

```

 

**OpenRouter API (Target):**

```javascript

{

  model: 'anthropic/claude-sonnet-4',

  max_tokens: 2048,

  temperature: 0.7,

  messages: [

    { role: 'user', content: 'Your prompt here' }

  ],

  // Optional: Fallback models

  route: 'fallback',

  models: [

    'anthropic/claude-sonnet-4',

    'openai/gpt-4o',

    'google/gemini-2.5-pro-preview'

  ]

}

```

 

### Response Structure

 

**Anthropic API (Current):**

```javascript

{

  content: [

    { type: 'text', text: 'Response content here' }

  ],

  model: 'claude-sonnet-4-20250514',

  usage: { input_tokens: 100, output_tokens: 500 }

}

```

 

**OpenRouter API (Target):**

```javascript

{

  choices: [

    {

      message: {

        role: 'assistant',

        content: 'Response content here'

      }

    }

  ],

  model: 'anthropic/claude-sonnet-4',

  usage: { prompt_tokens: 100, completion_tokens: 500 }

}

```

 

---

 

## Model Identifier Mapping

 

OpenRouter uses the format `provider/model-name`. Here are the equivalent models:

 

| Current (Anthropic) | OpenRouter Equivalent | Notes |

|--------------------|-----------------------|-------|

| `claude-sonnet-4-20250514` | `anthropic/claude-sonnet-4` | Same Claude Sonnet 4 |

| `claude-3-5-sonnet-20241022` | `anthropic/claude-3.5-sonnet` | Claude 3.5 Sonnet |

| `claude-3-haiku-20240307` | `anthropic/claude-3-haiku` | Fastest, cheapest Claude |

| - | `openai/gpt-4o` | Alternative: OpenAI GPT-4o |

| - | `google/gemini-2.5-pro-preview` | Alternative: Google Gemini |

| - | `meta-llama/llama-3.3-70b-instruct` | Alternative: Open source |

 

---

 

## Architecture

 

### Provider Abstraction Layer

 

```

┌─────────────────────────────────────────────────────────────────┐

│                    Netlify Functions                             │

├─────────────────────────────────────────────────────────────────┤

│                                                                  │

│  ┌──────────────────────────────────────────────────────────┐   │

│  │               API Provider Abstraction                     │   │

│  │                                                            │   │

│  │   Environment Variables:                                   │   │

│  │   ├── API_PROVIDER = 'openrouter' | 'anthropic'           │   │

│  │   ├── OPENROUTER_API_KEY = sk-or-xxx                      │   │

│  │   ├── ANTHROPIC_API_KEY = sk-ant-xxx                      │   │

│  │   ├── AI_MODEL = 'anthropic/claude-sonnet-4'              │   │

│  │   └── FALLBACK_MODELS = 'openai/gpt-4o,google/gemini...'  │   │

│  └──────────────────────────────────────────────────────────┘   │

│                           │                                      │

│              ┌────────────┴────────────┐                        │

│              │                         │                        │

│              ▼                         ▼                        │

│  ┌─────────────────────┐   ┌─────────────────────┐             │

│  │  Anthropic Client   │   │  OpenRouter Client  │             │

│  │                     │   │                     │             │

│  │  POST /v1/messages  │   │  POST /v1/chat/     │             │

│  │  x-api-key header   │   │    completions      │             │

│  │  Anthropic format   │   │  Bearer token       │             │

│  │                     │   │  OpenAI format      │             │

│  │                     │   │  Fallback support   │             │

│  └─────────────────────┘   └─────────────────────┘             │

│              │                         │                        │

│              └────────────┬────────────┘                        │

│                           │                                      │

│                           ▼                                      │

│              ┌─────────────────────────┐                        │

│              │   Unified Response      │                        │

│              │   Adapter               │                        │

│              │   (Normalize format)    │                        │

│              └─────────────────────────┘                        │

│                           │                                      │

└───────────────────────────┼──────────────────────────────────────┘

                            │

                            ▼

                  { text: 'Generated content' }

```

 

---

 

## Implementation Steps

 

### Step 1: Create Provider Configuration Module

 

**File:** `netlify/functions/lib/ai-config.js` (NEW)

 

**Purpose:** Centralize AI provider configuration and client selection.

 

```javascript

// AI Provider Configuration

// Supports both direct Anthropic API and OpenRouter

 

export const AI_PROVIDERS = {

  ANTHROPIC: 'anthropic',

  OPENROUTER: 'openrouter'

};

 

export function getConfig() {

  const provider = process.env.API_PROVIDER || AI_PROVIDERS.ANTHROPIC;

 

  if (provider === AI_PROVIDERS.OPENROUTER) {

    return {

      provider: AI_PROVIDERS.OPENROUTER,

      endpoint: 'https://openrouter.ai/api/v1/chat/completions',

      apiKey: process.env.OPENROUTER_API_KEY,

      model: process.env.AI_MODEL || 'anthropic/claude-sonnet-4',

      fallbackModels: (process.env.FALLBACK_MODELS || '').split(',').filter(Boolean),

      headers: {

        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,

        'Content-Type': 'application/json',

        'HTTP-Referer': process.env.APP_URL || 'https://quizmaster.netlify.app',

        'X-Title': 'QuizMaster'

      }

    };

  }

 

  // Default: Anthropic

  return {

    provider: AI_PROVIDERS.ANTHROPIC,

    endpoint: 'https://api.anthropic.com/v1/messages',

    apiKey: process.env.ANTHROPIC_API_KEY,

    model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',

    fallbackModels: [],

    headers: {

      'x-api-key': process.env.ANTHROPIC_API_KEY,

      'anthropic-version': '2023-06-01',

      'Content-Type': 'application/json'

    }

  };

}

 

export function hasValidApiKey() {

  const provider = process.env.API_PROVIDER || AI_PROVIDERS.ANTHROPIC;

 

  if (provider === AI_PROVIDERS.OPENROUTER) {

    return !!process.env.OPENROUTER_API_KEY;

  }

 

  return !!process.env.ANTHROPIC_API_KEY;

}

```

 

---

 

### Step 2: Create AI Client Abstraction

 

**File:** `netlify/functions/lib/ai-client.js` (NEW)

 

**Purpose:** Unified interface for making AI API calls regardless of provider.

 

```javascript

import { getConfig, AI_PROVIDERS } from './ai-config.js';

 

/**

 * Build request body based on provider

 */

function buildRequestBody(config, prompt, options = {}) {

  const { maxTokens = 2048, temperature = 0.7 } = options;

 

  if (config.provider === AI_PROVIDERS.OPENROUTER) {

    const body = {

      model: config.model,

      max_tokens: maxTokens,

      temperature,

      messages: [{ role: 'user', content: prompt }]

    };

 

    // Add fallback models if configured

    if (config.fallbackModels.length > 0) {

      body.route = 'fallback';

      body.models = [config.model, ...config.fallbackModels];

    }

 

    return body;

  }

 

  // Anthropic format

  return {

    model: config.model,

    max_tokens: maxTokens,

    temperature,

    messages: [{ role: 'user', content: prompt }]

  };

}

 

/**

 * Extract text from response based on provider

 */

function extractResponseText(config, data) {

  if (config.provider === AI_PROVIDERS.OPENROUTER) {

    // OpenAI format: choices[0].message.content

    return data.choices?.[0]?.message?.content || '';

  }

 

  // Anthropic format: content[0].text

  return data.content?.[0]?.text || '';

}

 

/**

 * Make AI API call with provider abstraction

 */

export async function callAI(prompt, options = {}) {

  const config = getConfig();

 

  if (!config.apiKey) {

    throw new Error(`API key not configured for provider: ${config.provider}`);

  }

 

  const requestBody = buildRequestBody(config, prompt, options);

 

  const response = await fetch(config.endpoint, {

    method: 'POST',

    headers: config.headers,

    body: JSON.stringify(requestBody)

  });

 

  if (!response.ok) {

    let errorMessage = `API request failed (${response.status})`;

    try {

      const error = await response.json();

      // Handle both OpenRouter and Anthropic error formats

      errorMessage = error.error?.message || error.message || errorMessage;

    } catch (parseError) {

      errorMessage = await response.text() || errorMessage;

    }

    throw new Error(errorMessage);

  }

 

  const data = await response.json();

  const text = extractResponseText(config, data);

 

  if (!text) {

    throw new Error('Empty response from AI API');

  }

 

  return {

    text,

    provider: config.provider,

    model: data.model || config.model,

    usage: data.usage

  };

}

```

 

---

 

### Step 3: Update generate-questions.js

 

**File:** `netlify/functions/generate-questions.js`

 

**Changes:** Replace direct Anthropic API call with AI client abstraction.

 

```javascript

import { callAI } from './lib/ai-client.js';

import { hasValidApiKey } from './lib/ai-config.js';

 

const CORS_HEADERS = {

  'Content-Type': 'application/json',

  'Access-Control-Allow-Origin': '*',

  'Access-Control-Allow-Methods': 'POST, OPTIONS',

  'Access-Control-Allow-Headers': 'Content-Type'

};

 

function validateRequest(body) {

  const errors = [];

 

  if (!body.topic || typeof body.topic !== 'string') {

    errors.push('Topic is required and must be a string');

  } else {

    if (body.topic.trim().length < 2) {

      errors.push('Topic must be at least 2 characters');

    }

    if (body.topic.length > 200) {

      errors.push('Topic must be less than 200 characters');

    }

  }

 

  if (body.gradeLevel && typeof body.gradeLevel !== 'string') {

    errors.push('Grade level must be a string');

  }

 

  return { valid: errors.length === 0, errors };

}

 

export const handler = async (event, context) => {

  // Handle CORS preflight

  if (event.httpMethod === 'OPTIONS') {

    return { statusCode: 200, headers: CORS_HEADERS, body: '' };

  }

 

  if (event.httpMethod !== 'POST') {

    return {

      statusCode: 405,

      headers: CORS_HEADERS,

      body: JSON.stringify({ error: 'Method not allowed' })

    };

  }

 

  try {

    // Parse request

    let body;

    try {

      body = JSON.parse(event.body);

    } catch (parseError) {

      return {

        statusCode: 400,

        headers: CORS_HEADERS,

        body: JSON.stringify({ error: 'Invalid JSON in request body' })

      };

    }

 

    // Validate input

    const validation = validateRequest(body);

    if (!validation.valid) {

      return {

        statusCode: 400,

        headers: CORS_HEADERS,

        body: JSON.stringify({ error: 'Validation failed', details: validation.errors })

      };

    }

 

    // Check API key

    if (!hasValidApiKey()) {

      console.error('AI API key not configured');

      return {

        statusCode: 500,

        headers: CORS_HEADERS,

        body: JSON.stringify({ error: 'Server configuration error' })

      };

    }

 

    const { topic, gradeLevel } = body;

 

    // Create prompt (same as before)

    const prompt = `You are an expert educational content creator...`; // Keep existing prompt

 

    // Call AI using abstraction layer

    const result = await callAI(prompt, { maxTokens: 2048, temperature: 0.7 });

 

    // Parse JSON response

    let questions;

    try {

      questions = JSON.parse(result.text);

    } catch (parseError) {

      console.error('Failed to parse questions JSON:', result.text);

      return {

        statusCode: 500,

        headers: CORS_HEADERS,

        body: JSON.stringify({ error: 'Invalid response format from API' })

      };

    }

 

    // Validate structure

    if (!Array.isArray(questions) || questions.length !== 5) {

      return {

        statusCode: 500,

        headers: CORS_HEADERS,

        body: JSON.stringify({ error: 'Invalid response format from API' })

      };

    }

 

    return {

      statusCode: 200,

      headers: CORS_HEADERS,

      body: JSON.stringify({

        questions,

        // Optional: Include provider info for debugging

        _meta: { provider: result.provider, model: result.model }

      })

    };

 

  } catch (error) {

    console.error('Function error:', error);

    return {

      statusCode: 500,

      headers: CORS_HEADERS,

      body: JSON.stringify({ error: 'Failed to generate questions', message: error.message })

    };

  }

};

```

 

---

 

### Step 4: Update generate-explanation.js

 

Apply the same pattern to the explanation function.

 

---

 

### Step 5: Update Environment Variables

 

**File:** `.env.example`

 

```env

# AI Provider Configuration

# Options: 'anthropic' (default) or 'openrouter'

API_PROVIDER=anthropic

 

# Anthropic API (used when API_PROVIDER=anthropic)

ANTHROPIC_API_KEY=sk-ant-your-key-here

 

# OpenRouter API (used when API_PROVIDER=openrouter)

OPENROUTER_API_KEY=sk-or-your-key-here

 

# Model Selection (OpenRouter format: provider/model)

# For Anthropic: claude-sonnet-4-20250514

# For OpenRouter: anthropic/claude-sonnet-4, openai/gpt-4o, etc.

AI_MODEL=anthropic/claude-sonnet-4

 

# Fallback Models (OpenRouter only, comma-separated)

FALLBACK_MODELS=openai/gpt-4o,google/gemini-2.5-pro-preview

 

# App URL (for OpenRouter HTTP-Referer header)

APP_URL=https://quizmaster.netlify.app

 

# Frontend toggle

VITE_USE_REAL_API=false

```

 

**Netlify Dashboard Environment Variables:**

 

For production deployment, add these in Netlify → Site Settings → Environment Variables:

 

| Variable | Value | Notes |

|----------|-------|-------|

| `API_PROVIDER` | `openrouter` | or `anthropic` |

| `OPENROUTER_API_KEY` | `sk-or-xxx` | Get from openrouter.ai |

| `AI_MODEL` | `anthropic/claude-sonnet-4` | Or any supported model |

| `FALLBACK_MODELS` | `openai/gpt-4o` | Optional, comma-separated |

| `APP_URL` | `https://your-app.netlify.app` | For OpenRouter referer |

 

---

 

### Step 6: Update Health Check

 

**File:** `netlify/functions/health-check.js`

 

Update to report which provider is configured:

 

```javascript

import { getConfig, hasValidApiKey } from './lib/ai-config.js';

 

export const handler = async (event, context) => {

  const config = getConfig();

 

  return {

    statusCode: 200,

    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify({

      status: 'healthy',

      timestamp: new Date().toISOString(),

      version: process.env.COMMIT_REF || 'local',

      aiProvider: config.provider,

      aiModel: config.model,

      hasApiKey: hasValidApiKey(),

      hasFallbackModels: config.fallbackModels.length > 0

    })

  };

};

```

 

---

 

## Model Selection Strategy

 

### Recommended Models by Use Case

 

| Use Case | Recommended Model | Why |

|----------|-------------------|-----|

| **Best Quality** | `anthropic/claude-sonnet-4` | Latest Claude, best reasoning |

| **Cost-Effective** | `anthropic/claude-3-haiku` | 10x cheaper, still good quality |

| **Fast Response** | `anthropic/claude-3-haiku` | Lowest latency |

| **Alternative** | `openai/gpt-4o` | Different perspective on questions |

| **Budget** | `meta-llama/llama-3.3-70b-instruct` | Open source, lower cost |

 

### Fallback Strategy

 

Configure fallbacks for resilience:

 

```env

AI_MODEL=anthropic/claude-sonnet-4

FALLBACK_MODELS=anthropic/claude-3.5-sonnet,openai/gpt-4o

```

 

This means:

1. Try Claude Sonnet 4 first

2. If unavailable, try Claude 3.5 Sonnet

3. If still unavailable, try GPT-4o

 

---

 

## Testing Plan

 

### Unit Tests

 

**File:** `tests/unit/ai-client.test.js` (NEW)

 

```javascript

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { callAI } from '../../netlify/functions/lib/ai-client.js';

 

describe('AI Client', () => {

  beforeEach(() => {

    vi.resetModules();

  });

 

  it('should use Anthropic format when provider is anthropic', async () => {

    process.env.API_PROVIDER = 'anthropic';

    process.env.ANTHROPIC_API_KEY = 'test-key';

 

    // Mock fetch

    global.fetch = vi.fn().mockResolvedValue({

      ok: true,

      json: () => Promise.resolve({

        content: [{ text: 'Test response' }]

      })

    });

 

    const result = await callAI('Test prompt');

 

    expect(result.text).toBe('Test response');

    expect(result.provider).toBe('anthropic');

  });

 

  it('should use OpenRouter format when provider is openrouter', async () => {

    process.env.API_PROVIDER = 'openrouter';

    process.env.OPENROUTER_API_KEY = 'test-key';

 

    global.fetch = vi.fn().mockResolvedValue({

      ok: true,

      json: () => Promise.resolve({

        choices: [{ message: { content: 'Test response' } }]

      })

    });

 

    const result = await callAI('Test prompt');

 

    expect(result.text).toBe('Test response');

    expect(result.provider).toBe('openrouter');

  });

 

  it('should include fallback models for OpenRouter', async () => {

    process.env.API_PROVIDER = 'openrouter';

    process.env.OPENROUTER_API_KEY = 'test-key';

    process.env.FALLBACK_MODELS = 'model-a,model-b';

 

    global.fetch = vi.fn().mockResolvedValue({

      ok: true,

      json: () => Promise.resolve({

        choices: [{ message: { content: 'Test' } }]

      })

    });

 

    await callAI('Test prompt');

 

    const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);

    expect(requestBody.route).toBe('fallback');

    expect(requestBody.models).toContain('model-a');

  });

});

```

 

### Integration Tests

 

1. **Test Anthropic Provider:**

   ```bash

   API_PROVIDER=anthropic npm run test:functions

   ```

 

2. **Test OpenRouter Provider:**

   ```bash

   API_PROVIDER=openrouter npm run test:functions

   ```

 

### Manual Testing Checklist

 

- [ ] Generate questions with Anthropic provider

- [ ] Generate questions with OpenRouter provider

- [ ] Test with Claude model via OpenRouter

- [ ] Test with GPT-4o model via OpenRouter

- [ ] Test fallback behavior (mock primary failure)

- [ ] Verify health-check shows correct provider

- [ ] Test error handling for invalid API key

- [ ] Test error handling for invalid model

 

---

 

## Migration Path

 

### Option A: Switch Completely to OpenRouter

 

**Pros:**

- Single API key for multiple models

- Built-in fallbacks

- Simplified billing

 

**Cons:**

- Additional latency (~100-200ms)

- Dependency on OpenRouter availability

 

**Steps:**

1. Create OpenRouter account at openrouter.ai

2. Generate API key

3. Set `API_PROVIDER=openrouter` in Netlify

4. Set `OPENROUTER_API_KEY` in Netlify

5. Deploy and test

 

### Option B: Keep Both Providers (Recommended)

 

**Pros:**

- Flexibility to switch

- Fallback to direct Anthropic if needed

- Test different providers

 

**Cons:**

- Two API keys to manage

- Slightly more complex config

 

**Steps:**

1. Implement abstraction layer (Steps 1-4)

2. Keep both API keys configured

3. Switch via `API_PROVIDER` variable

4. Default to Anthropic for now

 

### Option C: OpenRouter with Anthropic Fallback

 

Use OpenRouter as primary, fall back to direct Anthropic if OpenRouter is down.

 

**Implementation:** Add logic to ai-client.js to catch OpenRouter errors and retry with Anthropic.

 

---

 

## Cost Comparison

 

### Anthropic Direct Pricing (as of Nov 2024)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |

|-------|----------------------|------------------------|

| Claude Sonnet 4 | $3.00 | $15.00 |

| Claude 3.5 Sonnet | $3.00 | $15.00 |

| Claude 3 Haiku | $0.25 | $1.25 |

 

### OpenRouter Pricing (markup ~10-20%)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |

|-------|----------------------|------------------------|

| anthropic/claude-sonnet-4 | $3.30 | $16.50 |

| anthropic/claude-3-haiku | $0.275 | $1.375 |

| openai/gpt-4o | $2.50 | $10.00 |

 

**Note:** OpenRouter adds a small markup but provides multi-model access and fallback capabilities.

 

### QuizMaster Usage Estimate

 

Per quiz session (5 questions + 1-2 explanations):

- ~500 input tokens (prompt)

- ~1500 output tokens (questions + explanations)

 

**Cost per quiz:**

- Claude Sonnet 4 (direct): ~$0.024

- Claude Sonnet 4 (OpenRouter): ~$0.026

- Claude 3 Haiku (OpenRouter): ~$0.002

 

For 100 quizzes/month: $0.20 - $2.60

 

---

 

## Security Considerations

 

### API Key Storage

 

| Location | Security Level | Notes |

|----------|---------------|-------|

| Netlify Environment Variables | **Secure** | Never exposed to frontend |

| `.env` file (local) | Development only | Add to `.gitignore` |

| Frontend code | **Never** | API keys must stay server-side |

 

### OpenRouter-Specific

 

- **HTTP-Referer Header:** Required by OpenRouter. Set to your app's URL to prevent abuse.

- **X-Title Header:** Optional. Helps identify your app in OpenRouter dashboard.

- **Rate Limiting:** OpenRouter has rate limits. Free tier: 50 req/day. Paid: higher limits.

 

---

 

## Success Criteria

 

**Phase complete when:**

 

- [ ] AI client abstraction implemented (`ai-client.js`)

- [ ] AI config module implemented (`ai-config.js`)

- [ ] `generate-questions.js` uses abstraction

- [ ] `generate-explanation.js` uses abstraction

- [ ] `health-check.js` reports provider info

- [ ] Environment variables documented

- [ ] Unit tests for both providers

- [ ] Manual testing complete

- [ ] Can switch providers via environment variable

- [ ] Fallback models work (OpenRouter)

- [ ] Documentation updated

 

**Verification:**

 

```bash

# Test with Anthropic

API_PROVIDER=anthropic npm run dev

# Create quiz, verify questions generated

 

# Test with OpenRouter

API_PROVIDER=openrouter npm run dev

# Create quiz, verify questions generated

 

# Check health endpoint

curl http://localhost:8888/.netlify/functions/health-check

# Should show { aiProvider: 'openrouter', ... }

```

 

---

 

## Next Steps After Implementation

 

1. **Monitor Usage:** Track API costs and usage patterns

2. **Optimize Model Selection:** Based on quality/cost tradeoff

3. **Add Analytics:** Log which provider/model was used per request

4. **Consider Caching:** Cache identical prompts to reduce API calls

5. **Explore Other Models:** Test GPT-4o, Gemini for question quality

 

---

 

## References

 

- [OpenRouter Documentation](https://openrouter.ai/docs/quickstart)

- [OpenRouter API Reference](https://openrouter.ai/docs/api-reference/overview)

- [OpenRouter Models](https://openrouter.ai/models)

- [DataCamp OpenRouter Tutorial](https://www.datacamp.com/tutorial/openrouter)

- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

- [OpenRouter GitHub Examples](https://github.com/OpenRouterTeam/openrouter-examples)

 

---

 

**Related Documentation:**

- Epic 3 Plan: `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md`

- Phase 1 (Backend): `docs/epic03_quizmaster_v2/PHASE1_BACKEND.md`

- Current Implementation: `netlify/functions/generate-questions.js`