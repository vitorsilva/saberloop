# Phase 11: Backend Integration

**Status**: ⚠️ **NOT EXECUTED - MOVED TO EPIC 3**

**Original Goal**: Build a serverless backend to enable real Claude API integration, bypassing CORS restrictions.

---

## ⚠️ IMPORTANT NOTICE

**This phase was NOT executed as part of Epic 02.**

After completing Epic 02 Phase 9 (Deployment), the project transitioned to Epic 3 for production readiness. Backend integration became the foundation of Epic 3, executed as Phase 1.

**Rationale:**
- Backend integration is a major architectural change
- Better suited as the foundation of a new epic
- Enables grouping related production features together
- Allows for comprehensive production readiness (backend + offline + UI + observability)

**Where this content went:**
- 📄 **Epic 3 Phase 1**: [Backend Integration](../../epic03_quizmaster_v2/PHASE1_BACKEND.md)
  - Same serverless architecture approach
  - Enhanced with production considerations
  - Updated implementation details
  - Integrated with Epic 3's overall production strategy

**Epic 02 Outcome:**
- ✅ Phases 1-9 completed successfully
- ✅ QuizMaster V1 functional with mock API
- ✅ All core features implemented
- ✅ Foundation ready for backend integration
- ➡️ Backend implementation moved to Epic 3 Phase 1

**Epic 3 Structure:**
Epic 3 reorganizes the remaining Epic 02 phases and adds production features:
- **Phase 1**: Backend Integration (was Epic 02 Phase 11)
- **Phase 2**: Production Offline Capabilities (enhancement of Epic 02 Phase 7)
- **Phase 3**: UI Polish (new - dynamic data, settings)
- **Phase 4**: Observability (new - logging, monitoring)
- **Phase 5**: Project Structure (new - documentation)
- **Phase 6**: Validation & Iteration (was Epic 02 Phase 10)

---

## Original Phase 11 Content (For Reference)

The content below represents the original plan for Phase 11. This methodology was enhanced and implemented in Epic 3 Phase 1.

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Understand serverless architecture
- ✅ Build serverless functions (Netlify or Vercel)
- ✅ Proxy API requests securely
- ✅ Manage environment variables
- ✅ Handle backend errors
- ✅ Deploy full-stack application
- ✅ Swap mock API for real API

---

## 11.1 Understanding the Problem

### Why We Need a Backend

**Recap from Phase 3:**
```
Browser → Direct API call → Anthropic API
          ❌ Blocked by CORS
          ❌ API key exposed in browser
```

**Solution: Backend Proxy**
```
Browser → Backend Function → Anthropic API
          ✅ No CORS issues
          ✅ API key secure on server
```

---

## 11.2 Serverless Architecture

### What is Serverless?

**Traditional Server:**
- Always running (24/7)
- You manage infrastructure
- Fixed costs
- Manual scaling

**Serverless Functions:**
- Run only when called (on-demand)
- Provider manages infrastructure
- Pay per execution
- Auto-scaling

### Popular Serverless Platforms

| Platform | Free Tier | Language | Ease |
|----------|-----------|----------|------|
| **Netlify Functions** | 125k requests/month | Node.js | Easy |
| **Vercel Functions** | 100k requests/month | Node.js | Easy |
| **AWS Lambda** | 1M requests/month | Many | Complex |
| **Cloudflare Workers** | 100k requests/day | JavaScript | Medium |

**For QuizMaster**: We'll use **Netlify Functions** (simple, great free tier, already hosting-friendly).

---

## 11.3 Netlify Functions Setup

### Project Structure

```
project-root/
├── src/                   # Frontend code
├── netlify/
│   └── functions/         # Backend functions
│       ├── generate-questions.js
│       └── generate-explanation.js
├── netlify.toml           # Netlify configuration
└── package.json
```

### Install Netlify CLI

```bash
npm install -D netlify-cli
```

**Add scripts to package.json:**
```json
{
  "scripts": {
    "dev": "netlify dev",
    "build": "vite build && npm run build:functions",
    "build:functions": "netlify functions:build",
    "deploy": "netlify deploy --prod"
  }
}
```

---

## 11.4 Creating Serverless Functions

### Function 1: Generate Questions

```javascript
// netlify/functions/generate-questions.js

// Note: fetch is built-in to Node.js 18+ (Netlify Functions runtime)
// No need to import node-fetch!

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
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        temperature: 0.7,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    // Handle API errors (improved error handling)
    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const error = await response.json();
        errorMessage = error.error?.message || errorMessage;
      } catch (parseError) {
        // Response might not be JSON (e.g., 503 Service Unavailable)
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
    const questions = JSON.parse(text);

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

### Function 2: Generate Explanation

```javascript
// netlify/functions/generate-explanation.js

// Note: fetch is built-in to Node.js 18+ (Netlify Functions runtime)

// CORS headers for all responses
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
        model: 'claude-sonnet-4-5',
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
        // Response might not be JSON (e.g., 503 Service Unavailable)
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

## 11.4 Understanding the Security Features

### CORS (Cross-Origin Resource Sharing)

**Why CORS headers are needed:**
- Browsers send a "preflight" OPTIONS request before POST for security
- Without CORS headers, the browser blocks the response
- The `CORS_HEADERS` constant ensures consistent headers across all responses

**Key headers:**
```javascript
'Access-Control-Allow-Origin': '*'  // Allow all origins (OK for public API)
'Access-Control-Allow-Methods': 'POST, OPTIONS'  // Allowed HTTP methods
'Access-Control-Allow-Headers': 'Content-Type'  // Allowed request headers
```

### Input Validation

**Why validation matters:**
- Protects against malformed requests
- Prevents injection attacks
- Provides clear error messages
- Validates data types and constraints

**The validateRequest() helper checks:**
- Topic is required and is a string
- Topic length is between 2-200 characters
- Grade level (if provided) is a string

### Error Handling

**Defensive error handling protects against:**
- Non-JSON error responses (503, 500 errors)
- Network failures
- Malformed responses
- API errors

**Pattern used:**
```javascript
try {
  const error = await response.json();
  errorMessage = error.error?.message || errorMessage;
} catch (parseError) {
  // Fallback to text if JSON parsing fails
  const textError = await response.text();
  errorMessage = textError || errorMessage;
}
```

### Native Fetch API

**Node.js 18+ includes fetch natively:**
- No need for `node-fetch` package
- Smaller bundle size
- Better performance
- One less dependency to manage

---

## 11.5 Netlify Configuration

### Create netlify.toml

```toml
# netlify.toml

[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[dev]
  command = "vite"
  port = 3000
  targetPort = 3000
  autoLaunch = false
```

### Environment Variables

**Local development (.env):**
```bash
# .env (DO NOT commit this file!)
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Add to .gitignore:**
```
.env
.env.local
```

**Netlify dashboard:**
1. Go to Site Settings → Environment Variables
2. Add `ANTHROPIC_API_KEY` = your key
3. Save

---

## 11.6 Update Frontend API Client

### Create api.real.js

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

### Use Environment Variable to Switch APIs

```javascript
// src/api/index.js

// Dynamically import based on environment
const USE_REAL_API = import.meta.env.PROD;  // Use real API in production

let api;

if (USE_REAL_API) {
  api = await import('./api.real.js');
  console.log('Using real API via backend');
} else {
  api = await import('./api.mock.js');
  console.log('Using mock API (development mode)');
}

export const { generateQuestions, generateExplanation } = api;
```

**Update imports in views:**
```javascript
// Instead of:
import { generateQuestions } from '../api/api.mock.js';

// Use:
import { generateQuestions } from '../api/index.js';
```

---

## 11.7 Testing Locally

### Start Netlify Dev Server

```bash
# Starts both Vite dev server and functions
npm run dev
```

**This runs:**
- Frontend on `http://localhost:3000`
- Functions on `http://localhost:3000/.netlify/functions/`

### Test Function Directly

```bash
# Using curl
curl -X POST http://localhost:3000/.netlify/functions/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"topic": "Fractions", "gradeLevel": "5th Grade"}'
```

### Test in Browser

```javascript
// In browser console
const response = await fetch('/.netlify/functions/generate-questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'Math', gradeLevel: '5th Grade' })
});

const data = await response.json();
console.log(data);
```

---

## 11.8 Deployment

### Deploy to Netlify

**Option 1: Connect GitHub Repo**
1. Go to Netlify dashboard
2. "New site from Git"
3. Connect your GitHub repo
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variable: `ANTHROPIC_API_KEY`
6. Deploy!

**Option 2: Deploy via CLI**
```bash
# Login
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

---

## 11.9 Monitoring and Debugging

### View Function Logs

**Netlify dashboard:**
- Functions → Select function → View logs

**Local logs:**
```bash
# In terminal where netlify dev is running
# Logs appear automatically
```

### Common Issues

**1. "ANTHROPIC_API_KEY not set"**
- Check environment variables in Netlify dashboard
- For local: check .env file exists and is loaded

**2. "Function not found"**
- Check netlify.toml functions path
- Verify function files are in correct directory
- Run `netlify dev` (not just `vite`)

**3. CORS errors**
- Add CORS headers to function response
- Check `Access-Control-Allow-Origin` header

**4. Timeout errors**
- Netlify functions timeout at 10 seconds (free tier)
- Optimize API calls
- Consider upgrading plan

---

## 11.10 Cost Estimation

### Netlify Free Tier

- 125,000 function requests/month
- 100GB bandwidth
- 300 build minutes

### Anthropic API Costs (Claude Sonnet 4.5)

**Per quiz (5 questions):**
- Input: ~500 tokens (prompt)
- Output: ~800 tokens (5 questions)
- Cost: ~$0.01-0.02 per quiz

**Monthly estimate:**
- 50 quizzes/month = ~$1
- 200 quizzes/month = ~$4
- 500 quizzes/month = ~$10

**Well within free tier for personal/family use!**

---

## Checkpoint Questions

**Q1**: Why can't we just use the API key from frontend with a "proxy" URL?

<details>
<summary>Answer</summary>

Even with a proxy URL, if the API key is in frontend code:
- It's visible in DevTools/source code
- Anyone can steal it and use it
- You'll get charged for their usage
- Security breach

With serverless functions:
- Key stored on server (environment variable)
- Never exposed to browser
- Only your app can use it
</details>

**Q2**: What's the difference between `process.env` and `import.meta.env`?

<details>
<summary>Answer</summary>

**`process.env`** (Node.js/Backend):
- Server-side environment variables
- Used in Netlify functions
- Never exposed to browser

**`import.meta.env`** (Vite/Frontend):
- Build-time environment variables
- Compiled into frontend code
- Only use for non-sensitive values (API URLs, feature flags)
</details>

**Q3**: Why do we need `Access-Control-Allow-Origin` header?

<details>
<summary>Answer</summary>

**CORS (Cross-Origin Resource Sharing)**:
- Browser security feature
- Blocks frontend from calling different domains
- Our functions are on same domain, but header still required
- `'*'` means "allow all origins" (OK for public API)
</details>

---

## Hands-On Exercise

### Build and Deploy Backend

**Task**: Create serverless functions and deploy full-stack app.

**Steps**:

1. **Setup structure**:
```bash
mkdir -p netlify/functions
```

2. **Create functions**:
   - `generate-questions.js`
   - `generate-explanation.js`

3. **Create netlify.toml**

4. **Create api.real.js and api/index.js**

5. **Update views to use api/index.js**

6. **Test locally**:
```bash
npm run dev
# Try generating quiz with real API
```

7. **Deploy**:
```bash
netlify init
netlify deploy --prod
```

8. **Test production**: Visit your Netlify URL and try a quiz

**Success Criteria**:
- ✅ Functions work locally
- ✅ Real API generates questions
- ✅ Deployed to Netlify
- ✅ Production app works
- ✅ No CORS errors
- ✅ Mock API still works in dev mode

---

## Next Steps

**Congratulations!** You've built a full-stack, AI-powered quiz application!

**What you've accomplished:**
- ✅ Frontend SPA with routing
- ✅ IndexedDB data persistence
- ✅ Serverless backend
- ✅ Real AI integration
- ✅ Deployed to production

**Possible enhancements:**
- Add authentication
- Implement spaced repetition
- Add more question types
- Build analytics dashboard
- Add social sharing

---

## Learning Notes

**Date Started**: ___________

**Key Concepts Understood**:
- [ ] Serverless architecture
- [ ] Environment variables
- [ ] API proxying
- [ ] CORS handling

**Code I Wrote**:
- [ ] Netlify functions
- [ ] netlify.toml
- [ ] api.real.js
- [ ] api/index.js

**Deployed To**: ___________ (Netlify URL)

**Date Completed**: ___________

---

## 11.X Bonus: Full-Stack CI/CD Pipeline

Now that you have both frontend (GitHub Pages) and backend (Netlify), let's set up a complete CI/CD workflow!

### Overview

**You learned CI/CD in Epic 01 Phase 4.5**, but that was frontend-only. Now you have:
- Frontend: GitHub Pages
- Backend: Netlify Functions

**Goal:** Unified workflow that tests and deploys everything.

---

### Strategy 1: Netlify for Everything (Recommended)

**Why:** Netlify can host both frontend AND backend.

**Architecture:**
```
GitHub Repo → Netlify
  ├── Builds frontend (Vite)
  ├── Builds functions (Node.js)
  ├── Runs tests (Vitest + Playwright)
  └── Deploys everything atomically
```

**Benefits:**
- Single deployment
- Frontend + backend deployed together
- No version mismatch
- Deploy previews for PRs

**Netlify Configuration:**

```toml
# netlify.toml (updated)

[build]
  command = "npm run build:all"
  publish = "dist"
  functions = "netlify/functions"

# Build command runs tests first
[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-lighthouse"

[context.production]
  command = "npm test && npm run build"

[context.deploy-preview]
  command = "npm test && npm run build"
```

**Add build:all script:**
```json
// package.json
{
  "scripts": {
    "build:all": "npm test && vite build && netlify functions:build",
    "test": "vitest run && playwright test",
    "build": "vite build",
    "build:functions": "netlify functions:build"
  }
}
```

**GitHub Actions (trigger Netlify):**
```yaml
# .github/workflows/netlify-deploy.yml

name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build:all
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod
```

**Add Secrets to GitHub:**
1. Go to repo Settings → Secrets → Actions
2. Add `NETLIFY_AUTH_TOKEN` (from Netlify dashboard)
3. Add `NETLIFY_SITE_ID` (from Netlify site settings)
4. Add `ANTHROPIC_API_KEY` (for tests)

---

### Strategy 2: Hybrid (GitHub Pages + Netlify Functions)

**Keep:** GitHub Pages for frontend
**Add:** Netlify for functions only

**Why:** If you prefer GitHub Pages hosting.

**Architecture:**
```
GitHub Repo
  ├── Frontend → GitHub Pages (via GitHub Actions)
  └── Functions → Netlify (via Netlify CLI)
```

**Separate workflows:**

```yaml
# .github/workflows/deploy-frontend.yml

name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run frontend tests
        run: npx vitest run

      - name: Build frontend
        run: vite build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

```yaml
# .github/workflows/deploy-backend.yml

name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'netlify/functions/**'

jobs:
  deploy-functions:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod --functions=netlify/functions
```

---

### Testing Full-Stack Integration

**Add E2E tests for real API:**

```javascript
// tests/e2e/integration.spec.js

import { test, expect } from '@playwright/test';

test.describe('Full-Stack Integration', () => {
  test('should generate quiz with real API', async ({ page }) => {
    // Set environment to use real API
    await page.addInitScript(() => {
      localStorage.setItem('USE_REAL_API', 'true');
    });

    await page.goto('https://your-app.netlify.app');

    // Start quiz
    await page.fill('#topicInput', 'JavaScript');
    await page.selectOption('#gradeSelect', 'High School');
    await page.click('#startBtn');

    // Wait for real API response (longer timeout)
    await expect(page.locator('.quiz-view')).toBeVisible({ timeout: 10000 });

    // Verify real questions loaded
    const question = await page.locator('.question-text').textContent();
    expect(question.length).toBeGreaterThan(10);

    // Questions should be unique (not mock data)
    expect(question).not.toContain('[MOCK]');
  });
});
```

**Run integration tests only in CI:**

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:e2e": "playwright test tests/e2e/*.spec.js",
    "test:integration": "playwright test tests/e2e/integration.spec.js",
    "test:ci": "npm test && npm run test:e2e && npm run test:integration"
  }
}
```

---

### Deployment Workflow Visualization

**Before (Epic 01):**
```
git push → GitHub Actions → Build → Deploy to GitHub Pages
```

**After (Epic 02 - Strategy 1):**
```
git push → GitHub Actions → Tests → Build → Netlify Deploy
  ├── Frontend (dist/)
  └── Backend (functions/)
```

**After (Epic 02 - Strategy 2):**
```
git push → GitHub Actions → Tests → Parallel Deploy
  ├── Frontend → GitHub Pages
  └── Backend → Netlify Functions
```

---

### Monitoring and Rollback

**Netlify Deploy Logs:**
- View in Netlify dashboard
- See build output
- Function logs
- Deploy history

**Rollback:**
```bash
# Via Netlify CLI
netlify rollback

# Or via dashboard
# Deploys → Previous deploy → Publish deploy
```

**Health Checks:**

```javascript
// netlify/functions/health.js

exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.DEPLOY_ID || 'local'
    })
  };
};
```

**Monitor in CI:**
```yaml
# .github/workflows/monitor.yml

name: Production Health Check

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  health-check:
    runs-on: ubuntu-latest

    steps:
      - name: Check frontend
        run: |
          curl -f https://your-app.netlify.app || exit 1

      - name: Check backend health
        run: |
          curl -f https://your-app.netlify.app/.netlify/functions/health || exit 1

      - name: Notify on failure
        if: failure()
        run: echo "Health check failed! Alert the team!"
```

---

### Checkpoint Questions

**Q1**: Why is atomic deployment (frontend + backend together) better than separate deployments?

<details>
<summary>Answer</summary>

**Atomic deployment:**
- Frontend and backend deploy at the same time
- Always compatible versions
- No intermediate broken state
- Rollback reverts everything

**Separate deployments:**
- Frontend might deploy, backend fails
- Version mismatch possible
- Users might hit new frontend with old backend
- Harder to rollback
</details>

**Q2**: What's the benefit of deploy previews for PRs?

<details>
<summary>Answer</summary>

**Deploy previews:**
- Every PR gets a unique URL
- Test changes before merging
- Share with teammates/stakeholders
- Catch integration issues early
- No impact on production

Example: PR #42 → `https://pr-42--your-app.netlify.app`
</details>

**Q3**: Why run tests in CI even if you ran them locally?

<details>
<summary>Answer</summary>

**CI tests catch:**
- Dependencies you forgot to commit
- Environment-specific issues
- Teammate's changes that conflict
- Build problems on clean machine
- Tests you forgot to run locally

Plus: Tests in CI are documented, teammates can see results.
</details>

---

### Hands-On Exercise

**Task**: Set up full-stack CI/CD pipeline.

**Steps:**

1. **Choose strategy** (Strategy 1 recommended)

2. **Update netlify.toml** with build commands

3. **Create GitHub Actions workflow**

4. **Add secrets** to GitHub repo

5. **Create health check function**

6. **Make a change** (update README)

7. **Create PR** and verify:
   - Tests run
   - Deploy preview created
   - Everything works

8. **Merge PR** and verify:
   - Production deploys
   - Health check passes
   - Both frontend and backend work

**Success Criteria:**
- ✅ Tests run automatically
- ✅ Deploy previews work
- ✅ Production deploys on merge
- ✅ Rollback works
- ✅ Health checks pass

---

## Summary

**What you've mastered across both epics:**

**Epic 01:**
- PWA fundamentals
- Service workers
- Vitest unit testing
- Playwright E2E testing
- GitHub Actions CI/CD
- GitHub Pages deployment

**Epic 02:**
- IndexedDB
- Client-side routing (SPA)
- State management
- Mock APIs
- Serverless functions
- Netlify deployment
- **Full-stack CI/CD** (this bonus section)

**You now have:**
- ✅ Complete frontend skills
- ✅ Serverless backend skills
- ✅ Testing infrastructure
- ✅ CI/CD pipeline
- ✅ Production deployment

🎉 **Congratulations on completing both epics!**
