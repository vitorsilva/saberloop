# Phase 1 Learning Notes: Backend Integration

**Epic:** 3 - QuizMaster V2
**Phase:** 1 - Backend Integration
**Status:** Completed
**Date:** November 22-23, 2025
**Duration:** 1 session

---

## Session Summary

Successfully built serverless backend infrastructure to integrate real Claude API with QuizMaster. Replaced mock API with production-ready Netlify Functions, implemented secure API key management, and tested end-to-end locally.

---

## What We Built

### Infrastructure
- ✅ Installed Netlify CLI for local serverless development
- ✅ Created `netlify/functions/` directory structure
- ✅ Configured `netlify.toml` for build and dev settings
- ✅ Set up environment variables (`.env`, `.env.example`)

### Serverless Functions (3 total)
1. **`generate-questions.js`** - Generates 5 quiz questions via Claude API
2. **`generate-explanation.js`** - Generates helpful explanations for wrong answers
3. **`health-check.js`** - Diagnostic endpoint to verify backend health

### Frontend Integration
- ✅ Created `src/api/api.real.js` - Frontend client for Netlify Functions
- ✅ Updated `src/api/index.js` - Smart loader (mock in dev, real in prod)
- ✅ Added environment variable control (`VITE_USE_REAL_API`)

### Configuration
- ✅ Environment-aware base path (Netlify vs GitHub Pages vs local dev)
- ✅ Proper CORS headers for all function responses
- ✅ Input validation and error handling

---

## Key Concepts Learned

### 1. Serverless Architecture

**Definition:**
Functions that run on-demand (not 24/7 servers). You only pay for execution time.

**How it works:**
```
Request arrives → Container spins up (cold start)
                → Execute function
                → Return response
                → Container shuts down after ~5-10 min idle
```

**Analogy:**
Taking an Uber vs owning a car. The car (serverless) only shows up when you need it.

**Key differences from traditional servers:**

| Aspect | Traditional Server | Serverless |
|--------|-------------------|------------|
| **Always running?** | Yes (24/7) | No (on-demand) |
| **Cost model** | Fixed monthly | Pay per execution |
| **Scaling** | Manual | Automatic |
| **State** | Can maintain state | Stateless (ephemeral) |
| **DevOps** | You manage everything | Provider manages infrastructure |

**When to use serverless:**
- ✅ Intermittent traffic (not constant 24/7 load)
- ✅ Unpredictable load spikes
- ✅ Want zero DevOps/infrastructure management
- ✅ Simple API endpoints (< 10 seconds execution)
- ❌ Long-running tasks (> 10-30 seconds depending on platform)
- ❌ Need persistent connections (WebSockets, long polling)

---

### 2. Netlify Functions Deep Dive

**Function signature:**
```javascript
export const handler = async (event, context) => {
  // event = HTTP request info (method, body, headers, path)
  // context = Execution metadata (function name, request ID)

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: 'response' })  // MUST be string!
  };
};
```

**Critical details:**
- **`event.body`** is a STRING (must parse it: `JSON.parse(event.body)`)
- **Response body** must be a STRING (must stringify it: `JSON.stringify(data)`)
- **CORS headers** required on EVERY response (including errors!)

**Why `export const handler` instead of `exports.handler`?**

Your `package.json` has `"type": "module"`, so all files use ES module syntax:
- ✅ ES Module: `export const handler = ...`
- ❌ CommonJS: `exports.handler = ...` (doesn't work when `"type": "module"`)

---

### 3. Environment Variables (Two Types!)

**Backend Environment Variables:**
```javascript
// In serverless function (Node.js)
const API_KEY = process.env.ANTHROPIC_API_KEY;
```
- **Scope:** Server-side only (never exposed to browser)
- **Security:** ✅ Secure for API keys and secrets
- **Set in:** `.env` file locally, Netlify dashboard for production

**Frontend Environment Variables:**
```javascript
// In browser/frontend (Vite)
const isProduction = import.meta.env.PROD;
const useRealAPI = import.meta.env.VITE_USE_REAL_API;
```
- **Scope:** Compiled into JavaScript bundle (visible in DevTools!)
- **Security:** ❌ NOT secure - anyone can see these values
- **Prefix:** Must start with `VITE_` to be exposed by Vite
- **Use for:** Non-sensitive config (API endpoints, feature flags, environment detection)

**Never put API keys in frontend environment variables!**

---

### 4. CORS (Cross-Origin Resource Sharing)

**The Problem:**
Browsers block requests to different domains by default (security feature to prevent malicious sites from stealing data).

**Example:**
```
Your app: https://myapp.netlify.app
API call to: https://api.anthropic.com  ← Different domain!
Browser: ❌ BLOCKED (without CORS headers)
```

**The Solution:**
Server adds CORS headers telling browser "it's safe to allow this cross-origin request."

**CORS Headers:**
```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',           // Allow all origins
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
```

**The OPTIONS Preflight:**
Before POST/PUT/DELETE requests, browser sends an OPTIONS request asking "is this safe?"

```
Browser: OPTIONS /api/endpoint (preflight check)
Server: 200 OK + CORS headers (yes, POST is allowed)
Browser: POST /api/endpoint (actual request)
Server: 200 OK + CORS headers + data
```

**Your function must handle OPTIONS:**
```javascript
if (event.httpMethod === 'OPTIONS') {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: ''  // Empty body for preflight
  };
}
```

**Why CORS on errors too?**
If error responses don't include CORS headers, browser blocks them and frontend sees generic CORS error instead of actual error message.

---

### 5. Input Validation (Defense in Depth)

**Never trust user input!** Even from your own frontend.

**Validation layers:**
```javascript
// Layer 1: Is it valid JSON?
try {
  body = JSON.parse(event.body);
} catch (error) {
  return { statusCode: 400, body: 'Invalid JSON' };
}

// Layer 2: Required fields present?
if (!body.topic) {
  return { statusCode: 400, body: 'Topic required' };
}

// Layer 3: Data types correct?
if (typeof body.topic !== 'string') {
  return { statusCode: 400, body: 'Topic must be string' };
}

// Layer 4: Length constraints?
if (body.topic.length < 2 || body.topic.length > 200) {
  return { statusCode: 400, body: 'Topic must be 2-200 chars' };
}
```

**Why so much validation?**
- Malicious users can send anything (ignore frontend validation)
- Prevents injection attacks
- Avoids crashes from unexpected data
- Provides clear error messages
- Ensures data quality

---

### 6. Prompt Engineering for Claude

**The Problem:**
Claude is powerful but literal. Vague prompts → inconsistent outputs.

**Original prompt attempt:**
```javascript
const prompt = "Generate 5 quiz questions about fractions";
```
**Result:** Sometimes 3 questions, sometimes 7. Sometimes JSON, sometimes markdown. Sometimes letters (A,B,C,D), sometimes numbers (1,2,3,4).

**Final prompt (specific instructions):**
```javascript
const prompt = `Generate exactly 5 multiple-choice questions about "${topic}" for ${gradeLevel}.

Requirements:
- Each question has 4 options (A, B, C, D)
- Only one correct answer
- Mix of difficulty: 2 easy, 2 medium, 1 challenging
- Clear, concise language

Return JSON array with this EXACT structure:
[{
  "question": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct": 0,
  "difficulty": "easy"
}]

IMPORTANT: "correct" must be NUMBER (0 for A, 1 for B, 2 for C, 3 for D)
Return ONLY JSON, no other text.`;
```

**Result:** Consistent, parseable, reliable output every time.

**Key lessons:**
- ✅ Be specific ("exactly 5", not "some")
- ✅ Provide format examples
- ✅ Use "IMPORTANT" for critical requirements
- ✅ Specify data types (NUMBER not STRING)
- ✅ Request specific output format ("ONLY JSON")

---

### 7. Development Workflow with Netlify CLI

**Two servers running simultaneously:**

```
Port 8888: Netlify Dev (proxy/orchestrator)
  ├── Forwards frontend requests → Vite (3000)
  ├── Handles function requests → Netlify Functions
  ├── Loads .env variables
  └── YOU ACCESS APP HERE ← http://localhost:8888

Port 3000: Vite (dev server)
  ├── Serves frontend files only
  ├── Hot module replacement (HMR)
  └── No access to functions (would 404)
```

**Command:** `npm run dev`
**Under the hood:**
1. npm runs `netlify dev` (from package.json)
2. Netlify CLI reads `netlify.toml`
3. Sees `[dev] command = "vite"`
4. Starts Vite on port 3000
5. Starts Netlify proxy on port 8888
6. Loads `.env` file
7. Makes functions available at `/.netlify/functions/`

**Always use port 8888 for testing!** Port 3000 doesn't have functions.

---

### 8. Environment-Aware Configuration

**Challenge:** Different base paths for different environments:
- Local dev: `/` (root)
- GitHub Pages: `/demo-pwa-app/` (subpath)
- Netlify production: `/` (root)

**Solution in `vite.config.js`:**
```javascript
export default defineConfig(({ command }) => ({
  base: command === 'serve'
    ? '/'  // Dev server (npm run dev)
    : (process.env.NETLIFY ? '/' : '/demo-pwa-app/'),  // Build
}));
```

**How `command` is set:**
- `npm run dev` → Vite runs dev server → `command = 'serve'`
- `npm run build` → Vite builds → `command = 'build'`

**How `NETLIFY` is set:**
- Netlify automatically sets `process.env.NETLIFY = 'true'` when building
- Locally, this variable doesn't exist

**Result:**
- ✅ Local dev: Always uses root path
- ✅ Build on Netlify: Uses root path
- ✅ Build locally (for GitHub Pages): Uses `/demo-pwa-app/`

---

### 9. Smart API Loader Pattern

**Goal:** Use mock API in dev, real API in production, without changing view code.

**Implementation (`src/api/index.js`):**
```javascript
const USE_REAL_API = import.meta.env.PROD || import.meta.env.VITE_USE_REAL_API === 'true';

let api;
if (USE_REAL_API) {
  api = await import('./api.real.js');
  console.log('🚀 Using real API');
} else {
  api = await import('./api.mock.js');
  console.log('🔧 Using mock API');
}

export const { generateQuestions, generateExplanation } = api;
```

**How it works:**
1. **Dynamic imports** - `await import()` loads modules conditionally
2. **Environment detection** - Checks `PROD` or `VITE_USE_REAL_API`
3. **Re-export** - Both APIs have identical function signatures

**Result:**
- Views import from `./api/index.js`
- Dev mode: Gets mock API (fast, free)
- Production: Gets real API (Claude)
- Override in dev: Set `VITE_USE_REAL_API=true` in `.env`

**No code changes needed in views!** They don't know which API they're using.

---

## Debugging Lessons Learned

### Issue 1: CommonJS vs ES Modules

**Error:**
```
The CommonJS "exports" variable is treated as a global variable in an ECMAScript module
```

**Cause:** `package.json` has `"type": "module"` but functions used `exports.handler`

**Fix:** Changed to `export const handler` (ES module syntax)

**Lesson:** When `"type": "module"` is set, ALL `.js` files must use ES module syntax.

---

### Issue 2: Base Path MIME Type Error

**Error:**
```
Failed to load module script: Expected JavaScript but got MIME type ""
```

**Cause 1:** Wrong base path (`/demo-pwa-app/` in dev mode)
**Cause 2:** Service worker caching old files
**Cause 3:** `netlify.toml` redirect catching all requests (including JS files)

**Fixes:**
1. Environment-aware base path (see section 8)
2. Unregister service worker: `navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))`
3. Removed unnecessary redirect from `netlify.toml` (hash routing doesn't need it)

**Lesson:**
- Base paths must match environment
- Service workers can cache bugs!
- Redirects meant for production can break dev mode

---

### Issue 3: Answer Comparison Bug

**Problem:** All answers showed as incorrect in ResultsView.

**Root cause:** Data type mismatch
- Frontend stores answers as **numbers** (0, 1, 2, 3)
- Claude returned correct answer as **letter** ("A", "B", "C", "D")
- Comparison: `0 === "A"` → always false!

**Two possible solutions:**
1. Convert letters to numbers in frontend (add conversion logic)
2. Ask Claude to return numbers instead (change prompt) ✅ **Chosen**

**Fix:** Updated Claude prompt:
```javascript
"correct": 0,  // NUMBER not "A"
// 0 for first option, 1 for second, 2 for third, 3 for fourth
```

**Lesson:** When integrating APIs, ensure data format matches expectations. Simpler to fix at source (prompt) than add conversion logic everywhere.

---

### Issue 4: Using Wrong Port

**Problem:** Accessing `localhost:3000` instead of `localhost:8888`

**Error:**
```
/.netlify/functions/generate-questions 404 (Not Found)
```

**Cause:** Vite (port 3000) only serves frontend. Functions only exist at Netlify proxy (port 8888).

**Fix:** Always use `http://localhost:8888` for development.

**Lesson:** When using Netlify CLI, access the **proxy port** (8888), not Vite directly (3000).

---

## Testing Methodology

### Local Testing Process

**1. Health Check (verify backend is running):**
```javascript
// Browser console
fetch('/.netlify/functions/health-check')
  .then(r => r.json())
  .then(console.log);

// Expected: { status: "healthy", hasApiKey: true, ... }
```

**2. Direct Function Test (verify Claude API works):**
```javascript
// Browser console
const response = await fetch('/.netlify/functions/generate-questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'Fractions', gradeLevel: '5th Grade' })
});
const data = await response.json();
console.log(data);

// Expected: { questions: [...] } with 5 real questions
```

**3. UI Integration Test:**
- Navigate to http://localhost:8888
- Click "Start New Quiz"
- Enter topic and grade level
- Verify real questions appear (not mock data)

---

## Files Created/Modified

### New Files
```
netlify/
└── functions/
    ├── generate-questions.js    (167 lines)
    ├── generate-explanation.js   (101 lines)
    └── health-check.js           (22 lines)

src/api/
└── api.real.js                   (51 lines)

netlify.toml                      (13 lines)
.env                              (2 lines, gitignored)
.env.example                      (2 lines)
```

### Modified Files
```
package.json                      (added netlify-cli)
vite.config.js                    (environment-aware base path)
src/api/index.js                  (smart loader with environment detection)
.gitignore                        (already had *.env)
```

### Lines of Code
- **Serverless functions:** ~290 lines
- **Frontend API client:** ~51 lines
- **Configuration:** ~28 lines
- **Total new code:** ~369 lines

---

## Cost Analysis

### Netlify Free Tier
- 125,000 function invocations/month
- 100GB bandwidth
- 300 build minutes
- **For family use:** Completely free ✅

### Claude API (Sonnet 4.5)
**Per quiz (5 questions):**
- Input tokens: ~500 (prompt)
- Output tokens: ~800 (5 questions)
- Cost: **~$0.01-0.02 per quiz**

**Monthly estimates:**
- 50 quizzes/month = **~$0.50-$1.00**
- 200 quizzes/month = **~$2.00-$4.00**
- 500 quizzes/month = **~$5.00-$10.00**

**Verdict:** Very affordable for personal/family use! 💰

---

## Next Steps

**Remaining Phase 1 Tasks:**
- [ ] Finalize Netlify deployment (GitHub integration)
- [ ] Set environment variable in Netlify dashboard
- [ ] Verify production deployment end-to-end
- [ ] Test production site with real API

**Then move to Phase 2:** Production Offline Capabilities
- Vite PWA Plugin configuration
- Workbox caching strategies
- Lighthouse PWA score: 100/100

---

## Resources Referenced

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Vite Environment Variables](https://vite.dev/guide/env-and-mode)
- [CORS Explained (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [ES Modules vs CommonJS](https://nodejs.org/api/esm.html)

---

## Reflection

**What went well:**
- ✅ Serverless functions worked first try after fixing ES modules
- ✅ Environment variable setup was straightforward
- ✅ Smart API loader pattern is elegant and maintainable
- ✅ Prompt engineering iteration led to consistent Claude outputs

**What was challenging:**
- ⚠️ Module system conflicts (CommonJS vs ES modules)
- ⚠️ Base path configuration across environments
- ⚠️ Service worker caching making debugging harder
- ⚠️ Understanding the double-server setup (Vite + Netlify)

**Key takeaways:**
1. **Serverless is perfect for this use case** - intermittent traffic, zero DevOps, auto-scaling
2. **Environment awareness is critical** - different configs for dev/staging/prod
3. **CORS must be on everything** - even error responses need headers
4. **Prompt engineering matters** - specific instructions = consistent output
5. **Security by design** - API keys stay server-side, never in frontend

**This phase transformed QuizMaster from a prototype to a production-ready backend!** 🚀

---

**Session completed:** November 23, 2025
**Total time:** ~3 hours
**Next session:** Finalize deployment, then Phase 2 (Offline Capabilities)
