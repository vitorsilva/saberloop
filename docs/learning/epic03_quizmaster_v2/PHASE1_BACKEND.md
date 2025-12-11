# Phase 1: Backend Integration

**Epic:** 3 - QuizMaster V2
**Status:** ✅ Complete
**Completed:** November 22-24, 2025
**Time Spent:** 4 sessions (~6.5 hours)
**Prerequisites:** Epic 02 Phases 1-9 complete

---

## Overview

Phase 1 builds the serverless backend infrastructure to enable real Claude API integration. You'll create Netlify Functions that act as a secure proxy between your frontend and the Anthropic Claude API, replacing the mock API from Epic 02.

**What you'll build:**
- 3 serverless functions (generate-questions, generate-explanation, health-check)
- Secure API key management
- Environment-based API switching (mock in dev, real in prod)
- Full-stack deployment

**Why this matters:**
- Enables real AI-generated questions
- Keeps API keys secure (server-side only)
- Bypasses CORS restrictions
- Production-ready architecture

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Understand serverless architecture vs traditional servers
- ✅ Build and deploy Netlify Functions
- ✅ Implement secure API key management
- ✅ Proxy API requests safely
- ✅ Handle CORS properly
- ✅ Validate inputs and sanitize outputs
- ✅ Deploy full-stack application (frontend + backend)
- ✅ Test locally with Netlify CLI
- ✅ Switch between mock and real APIs based on environment

---

## Current State vs Target State

### Current State (Epic 02 Phase 3)
```
Browser → Mock API (api.mock.js) → Fake data
✅ Fast development
✅ No API costs
❌ Not using real AI
❌ Can't deploy with real features
❌ Not production-ready
```

### Target State (Epic 03 Phase 1)
```
Browser → Netlify Function → Claude API → Real AI responses
✅ Real AI-generated questions
✅ Secure (API key on server)
✅ Production-ready
✅ Bypasses CORS
✅ Mock API still available in dev
```

---

## Architecture

### System Flow

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │ HTTPS POST
       │ /netlify/functions/generate-questions
       │ { topic: "Math", gradeLevel: "5th" }
       ▼
┌──────────────────────────────────────┐
│    Netlify Function (Node.js)        │
│  ┌────────────────────────────────┐  │
│  │ 1. Validate input              │  │
│  │ 2. Get API key from env var    │  │
│  │ 3. Build prompt                │  │
│  │ 4. Call Anthropic API          │  │
│  │ 5. Parse response              │  │
│  │ 6. Return to browser           │  │
│  └────────────────────────────────┘  │
└──────────┬───────────────────────────┘
           │ HTTPS POST
           │ api.anthropic.com/v1/messages
           │ { model: "claude-sonnet-4-5", ... }
           ▼
    ┌──────────────┐
    │ Claude API   │
    │ (Anthropic)  │
    └──────────────┘
```

### Security Model

**Frontend (Insecure Zone):**
- No API keys
- Public code visible in DevTools
- Untrusted user input

**Backend (Secure Zone):**
- API key in environment variables
- Input validation
- Rate limiting (future)
- Server-side only

---

## Implementation Steps

### Step 1: Install Netlify CLI

**What:** Netlify CLI enables local testing of serverless functions.

**Why:** Test backend locally before deploying.

**Command:**
```bash
npm install -D netlify-cli
```

**Add scripts to package.json:**
```json
{
  "scripts": {
    "dev": "netlify dev",
    "build": "vite build",
    "build:functions": "echo 'Functions built automatically'",
    "deploy": "netlify deploy --prod"
  }
}
```

**What changed:**
- `dev` now uses `netlify dev` instead of `vite`
- This runs both Vite dev server AND functions locally

---

### Step 2: Create Project Structure

**Create directories:**
```bash
mkdir -p netlify/functions
```

**Final structure:**
```
demo-pwa-app/
├── netlify/
│   └── functions/
│       ├── generate-questions.js    # NEW
│       ├── generate-explanation.js  # NEW
│       └── health-check.js          # NEW
├── src/
│   ├── api/
│   │   ├── api.mock.js             # Existing
│   │   ├── api.real.js             # NEW
│   │   └── index.js                # NEW (smart loader)
│   └── ...
├── netlify.toml                     # NEW
└── .env                             # NEW (gitignored)
```

---

### Step 3: Create netlify.toml

**File:** `netlify.toml`

**Purpose:** Configure Netlify build and deployment.

**Content:**
```toml
# Netlify configuration file

[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

# Redirect all routes to index.html for SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Local development configuration
[dev]
  command = "vite"
  port = 3000
  targetPort = 3000
  autoLaunch = false
```

**What this does:**
- `build.command`: Runs when deploying
- `build.publish`: Which folder to deploy (Vite output)
- `build.functions`: Where serverless functions are
- `redirects`: Makes SPA routing work (/#/quiz, /#/results)
- `dev`: Local development settings

---

### Step 4: Environment Variables

**Create `.env` file:**
```bash
# .env (DO NOT COMMIT THIS FILE!)
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Add to `.gitignore`:**
```
.env
.env.local
.env.production
```

**Create `.env.example`:**
```bash
# .env.example (safe to commit)
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Get your API key:**
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create new key
5. Copy and paste into `.env`

---

### Step 5: Create `generate-questions` Function

**File:** `netlify/functions/generate-questions.js`

**Purpose:** Generate 5 quiz questions via Claude API.

**Code:**
```javascript
// netlify/functions/generate-questions.js

// CORS headers for all responses
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// Input validation helper
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

  return {
    valid: errors.length === 0,
    errors
  };
}

exports.handler = async (event, context) => {
  // Handle CORS preflight (browsers send this before POST)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse and validate request body
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

    const { topic, gradeLevel } = body;

    // Validate input
    const validation = validateRequest(body);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Validation failed',
          details: validation.errors
        })
      };
    }

    // Get API key from environment variable
    const API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!API_KEY) {
      console.error('ANTHROPIC_API_KEY not set');
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Create prompt
    const prompt = `You are an expert educational content creator. Generate exactly 5 multiple-choice questions about "${topic}" appropriate for ${gradeLevel || 'middle school'} students.

Requirements:
- Each question should have 4 answer options (A, B, C, D)
- Only one correct answer per question
- Include a mix of difficulty: 2 easy, 2 medium, 1 challenging
- Questions should test understanding, not just memorization
- Use clear, concise language appropriate for ${gradeLevel || 'middle school'}
- Avoid ambiguous phrasing
- No trick questions

Return your response as a JSON array with this exact structure:
[
  {
    "question": "The question text here?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correct": "A",
    "difficulty": "easy"
  }
]

IMPORTANT: Return ONLY the JSON array, no other text before or after.`;

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        temperature: 0.7,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    // Handle API errors
    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const error = await response.json();
        errorMessage = error.error?.message || errorMessage;
      } catch (parseError) {
        const textError = await response.text();
        errorMessage = textError || errorMessage;
      }

      console.error('Anthropic API error:', errorMessage);
      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: errorMessage })
      };
    }

    // Parse response
    const data = await response.json();
    const text = data.content[0].text;

    // Parse JSON from response
    let questions;
    try {
      questions = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse questions JSON:', text);
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

    // Return success
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ questions })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Failed to generate questions',
        message: error.message
      })
    };
  }
};
```

**Key concepts in this code:**

1. **CORS Headers** - Allow browser to call function from different origin
2. **Input Validation** - Protect against malformed/malicious input
3. **Environment Variables** - `process.env.ANTHROPIC_API_KEY` (secure)
4. **Error Handling** - Graceful degradation, user-friendly messages
5. **Prompt Engineering** - Clear instructions to Claude for quality output

---

### Step 6: Create `generate-explanation` Function

**File:** `netlify/functions/generate-explanation.js`

**Purpose:** Generate explanation for incorrect answers.

**Code:**
```javascript
// netlify/functions/generate-explanation.js

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
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

    const { question, userAnswer, correctAnswer, gradeLevel } = body;

    // Validate input
    if (!question || !userAnswer || !correctAnswer) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Create prompt
    const prompt = `You are a patient, encouraging tutor helping a ${gradeLevel || 'middle school'} student who answered a question incorrectly.

Question: ${question}
Student's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Provide a brief, helpful explanation (under 150 words) that:
1. Explains why their answer was incorrect (1 sentence, not critical)
2. Clarifies the correct concept (2-3 sentences)
3. Includes a relatable analogy or real-world example
4. Ends with an encouraging note

Tone: Friendly, supportive, not condescending
Format: Plain text, no markdown headers`;

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        temperature: 0.7,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const error = await response.json();
        errorMessage = error.error?.message || errorMessage;
      } catch (parseError) {
        const textError = await response.text();
        errorMessage = textError || errorMessage;
      }
      console.error('Anthropic API error:', errorMessage);
      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: errorMessage })
      };
    }

    const data = await response.json();
    const explanation = data.content[0].text;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ explanation })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Failed to generate explanation',
        message: error.message
      })
    };
  }
};
```

---

### Step 7: Create `health-check` Function

**File:** `netlify/functions/health-check.js`

**Purpose:** Simple endpoint to verify backend is working.

**Code:**
```javascript
// netlify/functions/health-check.js

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.DEPLOY_ID || 'local',
      hasApiKey: !!process.env.ANTHROPIC_API_KEY
    })
  };
};
```

**Usage:**
```bash
# Test backend is working
curl https://your-app.netlify.app/.netlify/functions/health-check
```

---

### Step 8: Create Frontend API Client (Real)

**File:** `src/api/api.real.js`

**Purpose:** Call Netlify Functions instead of mock data.

**Code:**
```javascript
// src/api/api.real.js

const FUNCTIONS_URL = '/.netlify/functions';

/**
 * Generate quiz questions (via backend)
 */
export async function generateQuestions(topic, gradeLevel = 'middle school') {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic, gradeLevel })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate questions');
    }

    const data = await response.json();
    return data.questions;

  } catch (error) {
    console.error('Question generation failed:', error);
    throw new Error('Failed to generate questions. Please try again.');
  }
}

/**
 * Generate explanation (via backend)
 */
export async function generateExplanation(question, userAnswer, correctAnswer, gradeLevel = 'middle school') {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/generate-explanation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question, userAnswer, correctAnswer, gradeLevel })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate explanation');
    }

    const data = await response.json();
    return data.explanation;

  } catch (error) {
    console.error('Explanation generation failed:', error);
    return 'Sorry, we couldn\'t generate an explanation at this time.';
  }
}
```

---

### Step 9: Create Smart API Loader

**File:** `src/api/index.js`

**Purpose:** Automatically use mock in dev, real in production.

**Code:**
```javascript
// src/api/index.js

// Dynamically import based on environment
const USE_REAL_API = import.meta.env.PROD;  // Use real API in production

let api;

if (USE_REAL_API) {
  api = await import('./api.real.js');
  console.log('🚀 Using real API via Netlify Functions');
} else {
  api = await import('./api.mock.js');
  console.log('🔧 Using mock API (development mode)');
}

export const { generateQuestions, generateExplanation } = api;
```

**How this works:**
- `import.meta.env.PROD` is `true` in production build
- `import.meta.env.PROD` is `false` in `npm run dev`
- Automatically picks correct API
- No manual switching needed!

---

### Step 10: Update Views to Use Smart Loader

**Files to update:**
- `src/views/TopicInputView.js`
- `src/views/ResultsView.js`
- Any other file importing from `api.mock.js`

**Change:**
```javascript
// Before (Epic 02):
import { generateQuestions } from '../api/api.mock.js';

// After (Epic 03):
import { generateQuestions } from '../api/index.js';
```

**That's it!** The smart loader handles the rest.

---

### Step 11: Local Testing

**Start Netlify dev server:**
```bash
npm run dev
```

**What this does:**
- Starts Vite dev server on port 3000
- Starts Netlify Functions on `/.netlify/functions/`
- Proxies function requests correctly
- Loads `.env` file automatically

**Test in browser console:**
```javascript
// Test health check
const health = await fetch('/.netlify/functions/health-check');
const healthData = await health.json();
console.log(healthData);
// { status: 'healthy', hasApiKey: true, ... }

// Test question generation
const response = await fetch('/.netlify/functions/generate-questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'Fractions', gradeLevel: '5th Grade' })
});
const data = await response.json();
console.log(data);
// { questions: [...] }
```

**Test via UI:**
1. Navigate to http://localhost:3000
2. Click "Start New Quiz"
3. Enter topic: "Math"
4. Select grade: "Middle School"
5. Click "Generate Questions"
6. Should see REAL questions (not mock)!

---

### Step 12: Deploy to Netlify

**Option 1: Connect GitHub Repository (Recommended)**

1. Go to https://app.netlify.com/
2. Click "New site from Git"
3. Choose GitHub
4. Select `demo-pwa-app` repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions` (auto-detected)
6. Click "Show advanced" → "New variable"
7. Add environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-your-key-here`
8. Click "Deploy site"

**Wait 2-3 minutes for deployment...**

**Option 2: Deploy via CLI**

```bash
# Login to Netlify
netlify login

# Initialize site
netlify init

# Add environment variable
netlify env:set ANTHROPIC_API_KEY sk-ant-your-key-here

# Deploy
netlify deploy --prod
```

---

### Step 13: Verify Production Deployment

**Check deployment:**
1. Open your Netlify URL: `https://your-app.netlify.app`
2. Open DevTools → Console
3. Should see: "🚀 Using real API via Netlify Functions"
4. Create a quiz
5. Questions should be REAL (not mock)!

**Test functions directly:**
```bash
# Health check
curl https://your-app.netlify.app/.netlify/functions/health-check

# Generate questions (replace YOUR_APP with actual subdomain)
curl -X POST https://your-app.netlify.app/.netlify/functions/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"topic": "JavaScript", "gradeLevel": "High School"}'
```

---

## Step 14: Update Unit Tests

**IMPORTANT:** Always update tests when adding new features!

### 14.1 Test API Client (Real)

**File:** `tests/unit/api.real.test.js` (NEW)

**Purpose:** Test real API client functions (without calling actual API)

**Code:**
```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateQuestions, generateExplanation } from '../../src/api/api.real.js';

describe('Real API Client', () => {
  beforeEach(() => {
    // Mock global fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateQuestions', () => {
    it('should call the generate-questions function endpoint', async () => {
      const mockQuestions = [
        { question: 'Test?', options: ['A', 'B', 'C', 'D'], correct: 'A', difficulty: 'easy' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ questions: mockQuestions })
      });

      const result = await generateQuestions('Math', '5th Grade');

      expect(global.fetch).toHaveBeenCalledWith(
        '/.netlify/functions/generate-questions',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'Math', gradeLevel: '5th Grade' })
        })
      );

      expect(result).toEqual(mockQuestions);
    });

    it('should handle API errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API Error' })
      });

      await expect(generateQuestions('Math', '5th Grade')).rejects.toThrow(
        'Failed to generate questions'
      );
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(generateQuestions('Math', '5th Grade')).rejects.toThrow(
        'Failed to generate questions'
      );
    });
  });

  describe('generateExplanation', () => {
    it('should call the generate-explanation function endpoint', async () => {
      const mockExplanation = 'This is why...';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ explanation: mockExplanation })
      });

      const result = await generateExplanation(
        'What is 2+2?',
        'B) 5',
        'A) 4',
        '5th Grade'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        '/.netlify/functions/generate-explanation',
        expect.objectContaining({
          method: 'POST'
        })
      );

      expect(result).toBe(mockExplanation);
    });

    it('should return fallback message on error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await generateExplanation('Test', 'A', 'B');

      expect(result).toContain('couldn\'t generate an explanation');
    });
  });
});
```

**Run tests:**
```bash
npm test -- api.real.test.js
```

### 14.2 Test Netlify Functions (Local)

**File:** `tests/unit/functions/generate-questions.test.js` (NEW)

**Purpose:** Test function logic without calling real Claude API

**Code:**
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock handler
const createMockEvent = (method, body) => ({
  httpMethod: method,
  body: body ? JSON.stringify(body) : null
});

describe('generate-questions function', () => {
  let handler;

  beforeEach(async () => {
    // Mock environment
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';

    // Import function
    const module = await import('../../../netlify/functions/generate-questions.js');
    handler = module.handler;

    // Mock fetch
    global.fetch = vi.fn();
  });

  it('should handle OPTIONS request (CORS preflight)', async () => {
    const event = createMockEvent('OPTIONS');
    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('should reject non-POST requests', async () => {
    const event = createMockEvent('GET');
    const response = await handler(event);

    expect(response.statusCode).toBe(405);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Method not allowed');
  });

  it('should validate required fields', async () => {
    const event = createMockEvent('POST', {});
    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Validation failed');
  });

  it('should validate topic length', async () => {
    const event = createMockEvent('POST', { topic: 'A' });
    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.details).toContain('Topic must be at least 2 characters');
  });

  it('should call Anthropic API with correct parameters', async () => {
    const mockQuestions = [
      { question: 'Test?', options: ['A', 'B', 'C', 'D'], correct: 'A', difficulty: 'easy' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(mockQuestions) }]
      })
    });

    const event = createMockEvent('POST', { topic: 'Math', gradeLevel: '5th Grade' });
    const response = await handler(event);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-api-key': 'sk-ant-test-key'
        })
      })
    );

    expect(response.statusCode).toBe(200);
  });
});
```

**Run tests:**
```bash
npm test -- generate-questions.test.js
```

---

## Step 15: Update E2E Tests

**IMPORTANT:** E2E tests should verify the full user flow with backend!

### 15.1 Update Quiz Creation E2E Test

**File:** `tests/e2e/quiz-flow.spec.js`

**Add backend testing:**
```javascript
import { test, expect } from '@playwright/test';

test.describe('Quiz Flow with Backend', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should generate real questions via backend (mock in test)', async ({ page }) => {
    // Mock the Netlify function response for E2E testing
    await page.route('**/.netlify/functions/generate-questions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          questions: [
            {
              question: 'What is 2+2?',
              options: ['A) 3', 'B) 4', 'C) 5', 'D) 6'],
              correct: 'B',
              difficulty: 'easy'
            },
            // ... 4 more questions
          ]
        })
      });
    });

    // Click "Start New Quiz"
    await page.click('button:has-text("Start New Quiz")');

    // Fill in topic
    await page.fill('input[placeholder*="topic"]', 'Mathematics');

    // Select grade level
    await page.selectOption('select', '5th Grade');

    // Generate questions
    await page.click('button:has-text("Generate Questions")');

    // Wait for quiz to load
    await page.waitForSelector('text=Question 1 of 5');

    // Verify question appears
    await expect(page.locator('.question-text')).toContainText('What is 2+2?');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/.netlify/functions/generate-questions', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.click('button:has-text("Start New Quiz")');
    await page.fill('input[placeholder*="topic"]', 'Math');
    await page.click('button:has-text("Generate Questions")');

    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Failed to generate questions');
  });

  test('should work offline after initial load', async ({ page, context }) => {
    // Load page online first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Should still navigate
    await page.click('a[href="#/"]');
    await expect(page.locator('h1')).toBeVisible();

    // Note: Generating new questions will fail offline (expected)
    // But previously cached content should work
  });
});
```

**Run E2E tests:**
```bash
npm run test:e2e
```

### 15.2 Add Backend Health Check Test

**File:** `tests/e2e/backend-health.spec.js` (NEW)

**Code:**
```javascript
import { test, expect } from '@playwright/test';

test.describe('Backend Health Check', () => {
  test('should verify backend is running', async ({ request }) => {
    const response = await request.get('/.netlify/functions/health-check');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.hasApiKey).toBeDefined();
  });

  test('should have CORS headers', async ({ request }) => {
    const response = await request.get('/.netlify/functions/health-check');

    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBe('*');
    expect(headers['content-type']).toContain('application/json');
  });
});
```

**Run test:**
```bash
npm run test:e2e -- backend-health
```

---

## Step 16: Configure Deployment Strategy

**IMPORTANT:** Separate testing from deployment!

We'll use **two separate systems** working together:
- **GitHub Actions** → Runs tests (CI - Continuous Integration)
- **Netlify** → Handles deployment (CD - Continuous Deployment)

---

### 16.1 Update GitHub Actions (Testing Only)

**Goal:** Keep `test.yml` for running tests, remove `deploy.yml`

**Why:**
- GitHub Pages can't run serverless functions
- Netlify handles deployment better (auto-deploy, previews, rollbacks)
- Separation of concerns: testing vs deployment

**File: `.github/workflows/test.yml`** (KEEP THIS!)

This workflow runs on every push and tests your code:
- ✅ Unit tests (Vitest)
- ✅ E2E tests (Playwright)
- ✅ Build verification

**File: `.github/workflows/deploy.yml`** (REMOVE THIS!)

This workflow deploys to GitHub Pages (no longer needed).

**Action:**
```bash
# Remove GitHub Pages deployment
git rm .github/workflows/deploy.yml
git commit -m "chore: remove GitHub Pages deployment (using Netlify auto-deploy)"
```

---

### 16.2 Configure Netlify Auto-Deploy

**Option A: Already Connected (Most Common)**

If you already set up Netlify in Step 12, it's watching your GitHub repo!

**Verify configuration:**
1. Go to https://app.netlify.com/ → Your site
2. **Site settings** → **Build & deploy** → **Continuous deployment**
3. Check:
   - Branch deploys: `main` (or your default branch)
   - Build settings: Should show `npm run build` and `dist`
   - Deploy contexts: Production branch is `main`

**Option B: First-Time Setup**

If Netlify isn't connected yet:
1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Select `demo-pwa-app` repository
5. Configure:
   - Branch: `main`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
6. Click "Deploy site"

---

### 16.3 Verify Environment Variables

**Critical:** Functions need your API key!

**In Netlify Dashboard:**
1. Go to **Site settings** → **Environment variables**
2. Verify `ANTHROPIC_API_KEY` exists
3. If not, add it:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-your-key-here`
   - Scopes: All (or at least Functions)
4. Click "Save"

**After adding/changing env vars:** Trigger a redeploy
- Site overview → "Trigger deploy" → "Deploy site"

---

### 16.4 The Complete Deployment Flow

**When you push code:**

```
git push origin main
    ↓
┌────────────────────────────────────────┐
│ GitHub: Receives push                  │
├────────────────────────────────────────┤
│                                        │
│ GitHub Actions (test.yml)             │
│   ├─ Runs unit tests                  │
│   ├─ Runs E2E tests                   │
│   ├─ Verifies build                   │
│   └─ Reports: ✅ or ❌                 │
│                                        │
└────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────┐
│ Netlify: Detects push (webhook)       │
├────────────────────────────────────────┤
│                                        │
│ Netlify Build Process                 │
│   ├─ Clones repo                      │
│   ├─ npm ci (install deps)            │
│   ├─ npm run build (Vite)             │
│   ├─ Deploys dist/ (frontend)         │
│   ├─ Deploys functions/ (backend)     │
│   └─ Live at yoursite.netlify.app     │
│                                        │
└────────────────────────────────────────┘
```

**Key points:**
- Tests run **independently** (GitHub Actions)
- Deployment happens **automatically** (Netlify)
- Both can succeed or fail independently
- You can see logs for both in their respective dashboards

---

### 16.5 Verify Complete Pipeline

**Step 1: Push code**
```bash
git add .
git commit -m "test: verify deployment pipeline"
git push origin main
```

**Step 2: Check GitHub Actions**
1. Go to https://github.com/[user]/demo-pwa-app/actions
2. Should see "Test" workflow running
3. Wait for ✅ green checkmark (or ❌ red X if tests fail)

**Step 3: Check Netlify Deployment**
1. Go to https://app.netlify.com/
2. Should see "Building" or "Published"
3. Wait for deployment to complete (~2-3 minutes)
4. Get production URL: `https://[your-site].netlify.app`

**Step 4: Test production site**
1. Open production URL
2. Open DevTools → Console
3. Should see: "🚀 Using real API via Netlify Functions"
4. Create a quiz → verify real questions (not mock)
5. Check Network tab → `/.netlify/functions/generate-questions` returns data

---

## Step 17: Deploy and Verify End-to-End

**Final comprehensive verification before Phase 1 completion!**

---

### 17.1 Pre-Deployment Checklist

**Before pushing to production:**

```bash
# 1. Verify local development with mock API
VITE_USE_REAL_API=false npm run dev
# → Open localhost:8888
# → Console should show: "🔧 Using mock API"
# → Create quiz → verify mock questions work

# 2. Verify local development with real API
VITE_USE_REAL_API=true npm run dev
# → Console should show: "🚀 Using real API via Netlify Functions"
# → Create quiz → verify real Claude questions work

# 3. Run all tests
npm test -- --run
npm run test:e2e

# 4. Verify production build
npm run build
# → Check dist/ folder was created
# → Check no build errors
```

---

### 17.2 Deploy to Production

**Remove GitHub Pages deployment:**
```bash
git rm .github/workflows/deploy.yml
git commit -m "chore: remove GitHub Pages deployment (using Netlify auto-deploy)"
```

**Push all changes:**
```bash
git push origin main
```

---

### 17.3 Monitor Deployment

**GitHub Actions (Testing):**
1. Go to: https://github.com/vitorsilva/demo-pwa-app/actions
2. Find latest "Test" workflow
3. Watch it run:
   - ✅ Unit tests pass
   - ✅ E2E tests pass
   - ✅ Build succeeds
4. Total time: ~3-5 minutes

**Netlify (Deployment):**
1. Go to: https://app.netlify.com/
2. Find your site → "Deploys"
3. Watch latest deploy:
   - ⏳ Building (runs `npm run build`)
   - ⏳ Deploying
   - ✅ Published
4. Total time: ~2-3 minutes
5. Get your URL: `https://[your-site].netlify.app`

---

### 17.4 Production Site Verification

**Open your Netlify URL in browser.**

**Test 1: Console Check**
```javascript
// Open DevTools → Console
// Should see:
"🚀 Using real API via Netlify Functions"
```
✅ Pass: Real API is being used

**Test 2: Health Check**
```javascript
// In DevTools Console
fetch('/.netlify/functions/health-check')
  .then(r => r.json())
  .then(console.log)

// Should return:
// { status: "healthy", hasApiKey: true, ... }
```
✅ Pass: Backend functions are working

**Test 3: Generate Questions**
1. Click "Start New Quiz"
2. Enter topic: "Fractions"
3. Grade level: "5th Grade"
4. Click "Generate Questions"
5. Wait ~3-5 seconds
6. Questions should be unique and realistic (not mock)

✅ Pass: Claude API integration works

**Test 4: Complete Quiz Flow**
1. Answer all 5 questions
2. Submit answers
3. View results page
4. Verify scores calculated correctly
5. Try "Try Another Topic"

✅ Pass: Full app flow works

**Test 5: Network Inspection**
1. Open DevTools → Network tab
2. Generate questions again
3. Find request: `generate-questions`
4. Check:
   - Status: 200 OK
   - Response: JSON with questions array
   - Time: 2-5 seconds

✅ Pass: API calls are successful

**Test 6: Text Display**
1. Look at quiz question answers
2. Verify long text wraps (not truncated with "...")
3. Look at results page
4. Verify all text is fully visible

✅ Pass: UI fixes are applied

**Test 7: No Dev Logs**
1. DevTools → Console
2. Generate questions
3. Check console output
4. Should NOT see debug logs like "[REAL API] Generated questions:"

✅ Pass: Dev-only logging works correctly

---

### 17.5 Troubleshooting Common Issues

**Issue: "Failed to generate questions"**
- **Cause:** Environment variable not set in Netlify
- **Fix:**
  1. Netlify dashboard → Site settings → Environment variables
  2. Add `ANTHROPIC_API_KEY` with your key
  3. Trigger redeploy

**Issue: 404 on functions**
- **Cause:** Functions not deployed
- **Fix:**
  1. Check `netlify.toml` has `functions = "netlify/functions"`
  2. Verify `netlify/functions/` folder exists in repo
  3. Trigger redeploy

**Issue: Still seeing mock data in production**
- **Cause:** API selection logic issue
- **Fix:**
  1. Check browser console for "Using mock API" or "Using real API"
  2. Verify `import.meta.env.PROD` is true (check console)
  3. Clear browser cache and hard refresh

**Issue: Tests fail in GitHub Actions**
- **Cause:** Dependency or test issues
- **Fix:**
  1. Check Actions tab for error details
  2. Run tests locally: `npm test -- --run && npm run test:e2e`
  3. Fix failing tests before pushing again

---

### 17.6 Success Criteria

**Phase 1 is complete when ALL of these are true:**

- ✅ Local development works with both mock and real API
- ✅ GitHub Actions test workflow runs on every push
- ✅ GitHub Pages deployment removed (no longer used)
- ✅ Netlify auto-deploys from main branch
- ✅ Production site loads successfully
- ✅ Production uses real Claude API (not mock)
- ✅ Functions respond successfully (200 OK)
- ✅ Health check endpoint works
- ✅ Quiz generation produces real questions
- ✅ Complete quiz flow works end-to-end
- ✅ UI text displays fully (no truncation)
- ✅ Dev-only logs don't appear in production
- ✅ No console errors in production

**If all checks pass → Phase 1 complete! 🎉**

**Next:** Phase 2 - Production Offline Capabilities
- No console errors
- Questions are unique and relevant
- Offline mode works (cached content)

---

## Cost Estimation

### Netlify (Free Tier)
- 125,000 function invocations/month
- 100GB bandwidth
- 300 build minutes

**For family use:** Completely free

### Claude API (Sonnet 4.5)
**Per quiz (5 questions):**
- Input: ~500 tokens (prompt)
- Output: ~800 tokens (5 questions)
- Cost: ~$0.01-0.02 per quiz

**Monthly estimates:**
- 50 quizzes/month = ~$0.50-$1.00
- 200 quizzes/month = ~$2.00-$4.00
- 500 quizzes/month = ~$5.00-$10.00

**Verdict:** Very affordable for personal/family use!

---

## Key Concepts Learned

### 1. Serverless vs Traditional Servers

**Traditional Server:**
- Always running (24/7)
- Fixed monthly cost
- You manage infrastructure
- Scale manually

**Serverless Functions:**
- Run only when called (on-demand)
- Pay per execution
- Provider manages infrastructure
- Auto-scaling

**When to use serverless:**
- ✅ Intermittent traffic (not 24/7)
- ✅ Unpredictable load
- ✅ Want zero DevOps
- ✅ Simple API endpoints
- ❌ Long-running tasks (> 10 seconds)
- ❌ Need persistent connections

### 2. Environment Variables

**`process.env` (Backend/Node.js):**
- Server-side only
- Never exposed to browser
- Secure for API keys
- Example: `process.env.ANTHROPIC_API_KEY`

**`import.meta.env` (Frontend/Vite):**
- Compiled into JavaScript bundle
- Visible in browser DevTools
- Only use for non-sensitive values
- Example: `import.meta.env.PROD`

**Never put API keys in frontend!**

### 3. CORS (Cross-Origin Resource Sharing)

**The problem:**
- Browser blocks requests to different domains
- Security feature prevents malicious sites from stealing data

**The solution:**
- Server adds CORS headers to response
- `Access-Control-Allow-Origin: *` means "allow all origins"
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

**OPTIONS request (preflight):**
- Browser sends OPTIONS before POST
- Checks if server allows cross-origin requests
- Your function must handle OPTIONS and return 200

### 4. Input Validation

**Why validate:**
- Protect against injection attacks
- Prevent crashes from malformed data
- Provide clear error messages
- Ensure data quality

**What to validate:**
- Data types (string, number, etc.)
- Length constraints (min/max)
- Format (email, URL, etc.)
- Required fields

**Where to validate:**
- ✅ Backend (always - never trust frontend)
- ✅ Frontend (better UX - instant feedback)

### 5. Error Handling

**Defensive error handling:**
```javascript
try {
  const error = await response.json();
} catch (parseError) {
  // Response might not be JSON (503, 500 errors)
  const textError = await response.text();
}
```

**User-friendly errors:**
- Don't expose internal errors to users
- Log details server-side
- Return generic message to frontend
- Example: "Server configuration error" instead of "ANTHROPIC_API_KEY not set"

---

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
**Cause:** Environment variable missing

**Fix:**
- Local: Check `.env` file exists and has correct key
- Production: Check Netlify dashboard → Site settings → Environment variables

### "Function not found" (404)
**Cause:** Function path incorrect or not deployed

**Fix:**
- Check `netlify.toml` has correct `functions` path
- Verify files exist in `netlify/functions/`
- For local: Run `netlify dev` (not just `vite`)
- For production: Check Netlify deploy logs

### CORS errors
**Cause:** Missing or incorrect CORS headers

**Fix:**
- Add `CORS_HEADERS` to all responses (including errors)
- Handle OPTIONS method (preflight)
- Check `Access-Control-Allow-Origin` header present

### "Invalid response format from API"
**Cause:** Claude didn't return valid JSON

**Fix:**
- Improve prompt clarity ("Return ONLY JSON")
- Add try/catch around JSON.parse
- Log the raw response for debugging
- Consider retry logic

### Timeout errors
**Cause:** Function took too long (> 10 seconds on free tier)

**Fix:**
- Optimize prompt (reduce token usage)
- Lower `max_tokens` in API call
- Upgrade Netlify plan (Pro = 26 second timeout)
- Split into smaller requests

---

## Success Criteria

**Phase 1 is complete when:**

- ✅ Netlify CLI installed
- ✅ Three functions created and working
- ✅ `netlify.toml` configured
- ✅ Environment variables set (local + production)
- ✅ Frontend API clients created (`api.real.js`, `index.js`)
- ✅ Views updated to use smart loader
- ✅ Local testing successful (real questions generated)
- ✅ Deployed to Netlify
- ✅ Production testing successful
- ✅ Mock API still works in development
- ✅ Real API works in production
- ✅ Health check endpoint responds
- ✅ Error handling robust
- ✅ No API keys exposed in frontend

**Verification checklist:**
```bash
# Local dev
npm run dev
# → Console shows "Using mock API (development mode)"
# → Can create quiz with mock data

# Production build
npm run build
npm run preview
# → Console shows "Using real API via Netlify Functions"
# → Can create quiz with real AI questions

# Production site
# → Visit https://your-app.netlify.app
# → Create quiz with real topic
# → Questions are unique and relevant
# → Explanations are helpful
```

---

## Next Steps

**After completing Phase 1:**
- ✅ You have a full-stack app (frontend + backend)
- ✅ Real AI integration working
- ✅ Secure API key management
- ✅ Production-ready architecture

**Move to Phase 2:**
- Implement production-grade offline capabilities
- Vite PWA Plugin configuration
- Lighthouse PWA score: 100/100

---

## References

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Serverless Architecture](https://www.serverless.com/learn/overview)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Related Documentation:**
- Epic 3 Plan: `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md`
- Epic 2 Phase 3 (Mock API): `docs/epic02_quizmaster_v1/PHASE3_API_INTEGRATION.md`
- Epic 2 Phase 11 (Backend - original): `docs/epic02_quizmaster_v1/PHASE11_BACKEND.md`
- Phase 1 Learning Notes: `docs/epic03_quizmaster_v2/PHASE1_LEARNING_NOTES.md`

---

## Phase 1 Completion Notes

**✅ Phase 1 completed successfully on November 24, 2025**

**Final deliverables:**
- 3 serverless functions deployed and tested
- Real Claude API integration working in production
- Complete CI/CD pipeline (GitHub Actions + Netlify auto-deploy)
- Comprehensive testing suite (unit + E2E)
- Production URL live and verified
- All success criteria met

**Sessions completed:**
1. Session 1 (Nov 22-23): Backend integration, serverless functions, local testing
2. Session 2 (Nov 24): Understanding deployment stack, testing strategies, UI fixes
3. Session 3 (Nov 24): GitHub Actions CI/CD debugging, npm dependency management
4. Session 4 (Nov 24): Production deployment verification and completion

**Known issues (deferred):**
- Tailwind CDN warning → Deferred to Phase 4 (Build Optimization)
  - See: Phase 4 documentation, "Build & Optimization Infrastructure" section
  - Non-blocking, app fully functional

**Production metrics at completion:**
- ✅ All tests passing
- ✅ All verification checks green (7/7)
- ✅ Automated deployment working
- ✅ First AI-generated quiz created successfully
- ✅ Zero dev logs in production
- ✅ Health check: 100% uptime

**Ready for Phase 2: Offline Capabilities**
