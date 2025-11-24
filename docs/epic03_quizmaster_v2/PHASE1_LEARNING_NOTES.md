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

## Session 2: Understanding the Complete Deployment Stack

**Date:** November 24, 2025
**Focus:** Clarifying deployment workflow, testing strategies, and production readiness

---

### Understanding the Deployment Evolution

**The journey from static to serverless:**

```
Phase 4.1 (Epic 01): Static Files
├─ http-server or nginx
└─ Just serves HTML/CSS/JS

Phase 4.2 (Epic 01): Build Tools Added
├─ Vite transforms source → dist/
├─ Minification, bundling, cache busting
└─ GitHub Pages serves dist/

Phase 4.5 (Epic 01): CI/CD Added
├─ GitHub Actions automates build
├─ Runs tests before deploy
└─ Auto-deploys to GitHub Pages

Phase 1 (Epic 03): Serverless Backend
├─ Frontend: Vite (HMR, optimization)
├─ Backend: Netlify Functions (Node.js runtime)
└─ Full-stack deployment to Netlify
```

---

### The Complete Development Workflow

**Local Development Flow:**

```
npm run dev
  ↓
package.json: "dev": "netlify dev"
  ↓
Netlify CLI starts on port 8888
  ↓
Reads netlify.toml: [dev] command = "vite"
  ↓
Starts Vite on port 3000
  ↓
Vite reads vite.config.js
  ├─ server: { port: 3000, open: false }
  └─ base: '/' (dev mode uses root)
  ↓
Netlify CLI proxies requests:
  ├─ Frontend requests → Vite (:3000)
  └─ Function requests → Node.js runtime
  ↓
Access: http://localhost:8888
```

**Key insight:** You only need ONE command (`npm run dev`), not multiple servers!

---

### Understanding vite.config.js

**The `command` parameter:**

Vite provides this automatically:
- `command === 'serve'` - When running dev server (`vite` or `npm run dev`)
- `command === 'build'` - When building for production (`vite build`)

**Original base path logic (confusing):**
```javascript
base: command === 'serve' ? '/' : (process.env.NETLIFY ? '/' : '/demo-pwa-app/')
```

**Three scenarios:**
1. Dev mode → `/`
2. Build on Netlify → `/`
3. Build for GitHub Pages → `/demo-pwa-app/`

**Simplified (if only using Netlify):**
```javascript
base: '/'  // Always root - no conditionals!
```

**Learning:** Configuration can be simplified once you commit to one deployment platform.

---

### Testing Strategies: Mock vs Real API

**API Selection Logic (`src/api/index.js`):**
```javascript
const USE_REAL_API = import.meta.env.PROD || import.meta.env.VITE_USE_REAL_API === 'true';
```

**Three testing scenarios:**

| Scenario | .env Setting | API Used | Port | Cost |
|----------|--------------|----------|------|------|
| Local Mock | `VITE_USE_REAL_API=false` | Mock | 8888 | $0 |
| Local Real | `VITE_USE_REAL_API=true` | Claude | 8888 | $0.01/quiz |
| Production | (env var in Netlify) | Claude | - | $0.01/quiz |

**How to switch:**
1. Edit `.env` file: `VITE_USE_REAL_API=false` (mock) or `=true` (real)
2. Restart dev server: Stop (Ctrl+C) and run `npm run dev` again
3. Check console: `🔧 Using mock API` or `🚀 Using real API`

**Important:** Must restart! Vite only reads `.env` on startup.

---

### Dev-Only Logging Strategy

**The Problem:**
```javascript
console.log('Debug info');  // Runs in BOTH dev and production!
```

While production users might not see console, the code still executes and could expose data.

**The Solution:**
```javascript
// Helper function at top of file
const devLog = (...args) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

// Usage
devLog('[REAL API] Generated questions:', data.questions);
```

**How it works:**
- `import.meta.env.DEV` is `true` in development, `false` in production
- During production build, Vite sees `if (false) { ... }` and removes entire block
- Result: Zero bytes in production bundle, no security risk

**Best practice:**
- Use `devLog()` for debug information
- Keep `console.error()` for real errors (useful in production)

**Applied to:**
- `src/api/api.mock.js` - Log mock responses
- `src/api/api.real.js` - Log API responses

---

### UI Fixes: Text Truncation

**The Problem:**

Tailwind CSS classes were cutting off long text:
- `truncate` - Shows ellipsis (`...`) for overflow
- `line-clamp-1` - Limits to 1 line with ellipsis
- `line-clamp-2` - Limits to 2 lines with ellipsis

**Example:**
```html
<span class="truncate">A) He believes music should never...</span>
```

**The Fix:**

**QuizView.js (line 79):**
```javascript
// Before
<span class="truncate">${option}</span>

// After
<span class="text-left">${option}</span>
```

**ResultsView.js (lines 54, 55, 73, 74, 75):**
```javascript
// Before
<p class="... line-clamp-2">${question.question}</p>
<p class="... line-clamp-1">Your answer: ${userAnswer}</p>

// After (remove line-clamp)
<p class="... ">${question.question}</p>
<p class="... ">Your answer: ${userAnswer}</p>
```

**Also fixed:** Content hidden behind fixed button (ResultsView.js line 98)
```javascript
// Before
<main class="flex-grow px-4 pt-6 pb-28">

// After (more bottom padding)
<main class="flex-grow px-4 pt-6 pb-40">
```

**Result:** Full text wraps properly, buttons grow to fit content.

---

### Request Routing in Netlify CLI

**How Netlify CLI decides where to send requests:**

```
Request arrives at localhost:8888
    ↓
Is path "/.netlify/functions/*"?
    ↓
  YES                    NO
    ↓                     ↓
Execute function    Proxy to Vite (port 3000)
(Node.js runtime)   (Frontend files)
    ↓                     ↓
Return JSON         Return HTML/CSS/JS
```

**Examples:**

**Frontend request:**
```
GET http://localhost:8888/index.html
  → Netlify proxies to http://localhost:3000/index.html
  → Vite serves file
  → Returns HTML
```

**Function request:**
```
POST http://localhost:8888/.netlify/functions/generate-questions
  → Netlify loads netlify/functions/generate-questions.js
  → Executes function
  → Returns JSON
```

---

### Environment Variables: Two Types

**Frontend Environment Variables (Vite):**
```javascript
import.meta.env.DEV        // true in dev, false in prod
import.meta.env.PROD       // true in prod, false in dev
import.meta.env.VITE_USE_REAL_API  // Custom env var (must start with VITE_)
```

**Characteristics:**
- Compiled into JavaScript bundle
- Visible in DevTools (NOT secure!)
- Use for: Non-sensitive config (feature flags, API endpoints)

**Backend Environment Variables (Node.js):**
```javascript
process.env.ANTHROPIC_API_KEY
process.env.NETLIFY
```

**Characteristics:**
- Only exist on server/function runtime
- Never exposed to browser (secure!)
- Use for: API keys, secrets, credentials

**Configuration:**
- Local: `.env` file (gitignored)
- Production: Netlify dashboard → Environment variables

---

### Why Not Use http-server Anymore?

**Question:** Can't we use http-server (from Phase 4.1) for local testing?

**Answer:** No, because:

**http-server:**
```
✅ Serves static files (HTML, CSS, JS)
❌ Cannot execute Node.js functions
❌ No serverless runtime
```

**Netlify CLI:**
```
✅ Serves static files (via Vite proxy)
✅ Executes serverless functions
✅ Mimics production environment
```

**If you tried http-server:**
```
http://localhost:8080
  ↓
Frontend loads ✅
  ↓
Tries to call /.netlify/functions/generate-questions
  ↓
404 Not Found ❌ (http-server doesn't have functions!)
```

**Lesson:** Once you add a backend, you need a tool that can run both frontend AND backend. That's why we switched to Netlify CLI.

---

### The Streamlined Reality

**Old mental model (confusing):**
```
"I have http-server, nginx, Docker, Vite, Netlify CLI... which do I use?"
```

**New mental model (clear):**
```
Development:  npm run dev     (one command - Netlify CLI + Vite)
Production:   git push        (Netlify auto-deploys)
```

**That's it!** Two commands total.

---

### Tools Summary: What Each Does

| Tool | Purpose | When Used | Status |
|------|---------|-----------|--------|
| **http-server** | Simple static file server | Phase 4.1 learning | ⚪ Retired |
| **nginx (Docker)** | Production web server | Phase 4.1 learning | ⚪ Retired |
| **Vite** | Build tool + dev server | Development + builds | ✅ Active |
| **Netlify CLI** | Local serverless runtime | Development | ✅ Active |
| **Netlify** | Production hosting | Production | ✅ Active |

**Progression:** Simple → Complex → Simplified
- Started simple (http-server)
- Learned complexity (Docker, nginx)
- Ended with right tool for the job (Netlify CLI)

---

## Key Learnings from Session 2

**Conceptual:**

1. **Development stacks evolve** - From static to serverless, each tool serves a purpose at the right time
2. **Simplification comes after understanding** - Tried many tools, kept what's needed
3. **One command is powerful** - Good tooling hides complexity (`npm run dev` does everything)
4. **Environment variables have scope** - Frontend (visible) vs Backend (secure)
5. **Testing strategies matter** - Mock for speed, real for confidence

**Technical:**

1. **Vite config can be simplified** - Once you commit to one deployment platform
2. **Dev-only code is stripped** - `import.meta.env.DEV` lets Vite remove debug code
3. **CSS utility classes need care** - `truncate` and `line-clamp` can hide content
4. **Request routing is intelligent** - Netlify CLI knows where to send each request
5. **Restarts matter** - Vite only reads `.env` on startup

**Debugging:**

1. **Console messages reveal mode** - "Using mock API" vs "Using real API"
2. **Long text needs wrapping** - Remove truncation classes for full display
3. **Fixed elements need padding** - Bottom content needs space for fixed UI
4. **Network tab shows truth** - Check if functions are being called
5. **Environment vars need restart** - Change `.env` → restart server

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

**Session 1 completed:** November 23, 2025
**Total time:** ~3 hours
**Focus:** Backend integration, serverless functions, local testing

**Session 2 completed:** November 24, 2025
**Total time:** ~2 hours
**Focus:** Understanding deployment stack, testing strategies, UI fixes

---

## Session 3: Debugging GitHub Actions CI/CD Pipeline

**Date:** November 24, 2025
**Duration:** ~1 hour
**Status:** ✅ Resolved

### The Problem: npm ci Failing in GitHub Actions

After pushing code to GitHub, the test workflow (`.github/workflows/test.yml`) started failing with this error:

```
npm error code EBADPLATFORM
npm error notsup Unsupported platform for @rollup/rollup-android-arm-eabi@4.52.2:
wanted {"os":"android","cpu":"arm"} (current: {"os":"linux","cpu":"x64"})
```

**What was happening:**
- GitHub Actions runs on Ubuntu Linux (x64 architecture)
- `npm ci` was trying to install `@rollup/rollup-android-arm-eabi` - an Android ARM package
- The package is marked as "optional" but `npm ci` was treating it as required
- Build failed before tests could even run

### Debugging Journey

#### Attempt 1: Add `--omit=optional` flag
```yaml
run: npm ci --omit=optional
```
**Result:** ❌ Still failed - npm ci still tried to install the package

#### Attempt 2: Add `.npmrc` configuration
Created `.npmrc` with:
```
optional=true
```
**Result:** ❌ Still failed - npm ci is very strict about lockfile integrity

#### Attempt 3: Regenerate package-lock.json
```bash
rm package-lock.json
npm install
```
**Result:** ❌ Lockfile didn't change - local npm already handled it correctly

#### Attempt 4: Use `npm install --frozen-lockfile`
```yaml
run: npm install --frozen-lockfile --prefer-offline --no-audit
```
**Result:** ❌ Still failed - same optional dependency issue

#### Attempt 5: Add `--legacy-peer-deps` flag
```yaml
run: npm ci --legacy-peer-deps
```
**Result:** ❌ Still failed - doesn't help with platform-specific optional dependencies

### Root Cause Analysis

**Key question:** Where is `@rollup/rollup-android-arm-eabi` coming from?

Used git diff to compare with last working build:

```bash
git log --oneline 84b9e7990c7aef8a0ba7ba757a4b9d7ace5dc009..HEAD
git diff 84b9e7990c7aef8a0ba7ba757a4b9d7ace5dc009..HEAD -- package.json
```

**Findings:**
1. Only change in `package.json`: Added `netlify-cli` as devDependency
2. Checked package-lock.json structure:
   ```
   node_modules/netlify-cli/node_modules/@rollup/rollup-android-arm-eabi
   ```
3. **The problem package comes from netlify-cli's dependencies!**
4. Netlify CLI uses Rollup internally, which has platform-specific optional binaries

### The Solution: Install Only What CI Needs

**Key insight:** GitHub Actions doesn't need `netlify-cli` at all!

**Why netlify-cli exists:**
- For **local development**: `npm run dev` runs Netlify Dev server
- Proxies requests to Vite (frontend) and Netlify Functions (backend)
- Simulates Netlify's production environment locally

**Why GitHub Actions doesn't need it:**
- GitHub Actions only runs: unit tests, E2E tests, production build
- Netlify's cloud deployment has its own build system
- CI doesn't run the dev server

**Final solution:**

Modified `.github/workflows/test.yml`:

```yaml
- name: Install dependencies
  run: |
    npm install --no-save \
      vite@^7.1.12 \
      vitest@^4.0.1 \
      @vitest/coverage-v8@^4.0.1 \
      @playwright/test@^1.56.1 \
      fake-indexeddb@^6.2.4 \
      idb@^8.0.3 \
      jsdom@^27.0.1
```

**What this does:**
- Installs only the packages needed for CI
- `--no-save` prevents modifying package.json or package-lock.json
- **Skips netlify-cli entirely** - avoids the Rollup optional dependency problem
- All tests run successfully

**Result:** ✅ **Build passed!**

### Key Concepts Learned

#### 1. npm ci vs npm install

**`npm ci` (Continuous Integration):**
- Designed for automated environments (CI/CD)
- Deletes `node_modules/` and installs from lockfile
- Very strict - fails if lockfile doesn't match package.json
- Faster than `npm install` (no dependency resolution)
- **Cannot skip incompatible optional dependencies** - this was our problem!

**`npm install`:**
- For local development
- Updates lockfile if needed
- More lenient with optional dependencies
- Can use flags like `--frozen-lockfile` to simulate ci behavior

**`npm install --no-save <packages>`:**
- Installs specific packages without modifying package.json/lockfile
- Perfect for CI when you need a subset of dependencies
- Fast and predictable

#### 2. Optional Dependencies in npm

**What are optional dependencies?**
- Packages that enhance functionality but aren't required
- Often platform-specific binaries (e.g., native Node.js addons)
- If installation fails, npm should skip and continue

**Why do they exist?**
- Rollup has native binaries for different platforms (Linux, Windows, macOS, Android)
- Each platform gets its own package: `@rollup/rollup-linux-x64`, `@rollup/rollup-android-arm-eabi`, etc.
- All marked as optional - only the matching platform binary installs

**The npm ci problem:**
- When optional dependencies are in `package-lock.json`, `npm ci` tries to install them
- If the platform check fails, `npm ci` exits with error
- This is a known issue with npm ci's strict lockfile validation

#### 3. Dependency Trees and Transitive Dependencies

**What happened in our case:**

```
package.json
└── netlify-cli (devDependency)
    └── @netlify/build
        └── @netlify/config
            └── rollup
                └── @rollup/rollup-android-arm-eabi (optional)
```

**Lesson:** When you install a package, you get **all its dependencies** (and their dependencies, and so on).

**In our case:**
- We added `netlify-cli` for local development
- It brought along Rollup and all Rollup's optional platform binaries
- CI tried to install Android ARM binary on Linux x64 → failed

#### 4. Local Development vs CI Environment Needs

**Different environments have different needs:**

| Need | Local Dev | GitHub Actions CI | Netlify Cloud |
|------|-----------|------------------|---------------|
| Frontend build (Vite) | ✅ | ✅ | ✅ |
| Unit tests (Vitest) | ✅ | ✅ | ❌ |
| E2E tests (Playwright) | ✅ | ✅ | ❌ |
| Dev server (netlify dev) | ✅ | ❌ | ❌ |
| Functions runtime | ✅ (via netlify-cli) | ❌ | ✅ (native) |
| Database tools | ✅ | ❌ | ✅ |

**Key insight:** CI only needs **build + test tools**, not development tools!

#### 5. Git Forensics for Debugging

**How we found the root cause:**

1. **Identify last working commit:**
   - Looked at GitHub Actions history
   - Found commit hash: `84b9e7990c7aef8a0ba7ba757a4b9d7ace5dc009`

2. **Show all commits since then:**
   ```bash
   git log --oneline <last-working-commit>..HEAD
   ```

3. **Compare package.json:**
   ```bash
   git diff <last-working-commit>..HEAD -- package.json
   ```
   Found: `netlify-cli` was added

4. **Investigate the package:**
   ```bash
   grep -A 5 "@rollup/rollup-android-arm-eabi" package-lock.json
   ```
   Found: It's under `node_modules/netlify-cli/`

**This debugging process took 5 attempts, but git forensics gave us the answer!**

### Deployment Strategy Clarification

While debugging, we also clarified the complete deployment flow:

#### Option 1: Netlify Auto-Deploy (Our Choice)

```
Developer pushes to GitHub
         ↓
GitHub Actions (.github/workflows/test.yml)
├─ npm install (build + test tools only)
├─ Run unit tests (Vitest)
├─ Run E2E tests (Playwright)
└─ Run production build (Vite)
         ↓
    Tests pass ✅
         ↓
Netlify detects push to main branch
├─ npm ci (installs all dependencies including netlify-cli)
├─ npm run build (builds frontend)
└─ Deploys to production with Functions
         ↓
    Live at production URL ✅
```

**Key points:**
- GitHub Actions runs tests independently (quality gate)
- Netlify handles deployment automatically when tests pass
- Separation of concerns: CI tests, CD deploys
- Removed `.github/workflows/deploy.yml` (GitHub Pages workflow - no longer needed)

### Files Modified

**`.github/workflows/test.yml`**
```yaml
- name: Install dependencies
  run: |
    npm install --no-save \
      vite@^7.1.12 \
      vitest@^4.0.1 \
      @vitest/coverage-v8@^4.0.1 \
      @playwright/test@^1.56.1 \
      fake-indexeddb@^6.2.4 \
      idb@^8.0.3 \
      jsdom@^27.0.1
```

**Git commits:**
```bash
git rm .github/workflows/deploy.yml
git commit -m "chore: remove GitHub Pages deployment (using Netlify auto-deploy)"

# Multiple attempts to fix npm ci issue...

git commit -m "fix: install only required dependencies in CI, skip netlify-cli"
```

### Lessons Learned

**Technical:**
1. `npm ci` is strict - great for reproducibility, bad for platform-specific optional deps
2. Not all devDependencies are needed in all environments
3. Transitive dependencies can introduce unexpected problems
4. Git forensics (diff, log) are essential debugging tools

**Architectural:**
1. **Separate concerns:** CI for testing, CD for deployment
2. **Minimize CI dependencies:** Only install what you actually need
3. **Local dev ≠ CI ≠ Production:** Each environment has different requirements
4. **Optional dependencies aren't always optional:** npm ci treats them as required

**Process:**
1. When builds break, compare with last working state
2. Isolate the change that introduced the problem
3. Understand why that change breaks the build
4. Fix the root cause, not the symptoms

### Why This Matters

This debugging session taught us:
- How npm's package resolution works
- The difference between development and CI needs
- How to use git for forensic debugging
- That sometimes the simplest solution is to **not install something**

**Before:** Trying to make npm ci install everything without errors
**After:** Installing only what CI actually needs

**This is a common pattern in software engineering:** Sometimes the best solution is to do less, not more!

---

**Session 3 completed:** November 24, 2025
**Total time:** ~1 hour
**Focus:** CI/CD debugging, npm dependency management, git forensics

**Next step:** Complete production deployment verification, then Phase 2 (Offline Capabilities)
