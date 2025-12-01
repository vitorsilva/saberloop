# Phase 3.6 Learning Notes - OpenRouter Integration

## Session Log

### Planning Session - December 1, 2024

**What we accomplished:**

1. **Reviewed the original plan** - Found it was based on wrong assumptions (Netlify Functions instead of current PHP backend)

2. **Investigated OpenRouter CORS support** - Confirmed OpenRouter supports CORS for direct browser calls, unlike Anthropic which requires a server proxy

3. **Key architectural decision:** No backend needed for LLM calls!
   - Before: Frontend → PHP API → Anthropic
   - After: Frontend → OpenRouter directly (user's own API key)

4. **Completely rewrote Phase 3.6 document** with correct client-side architecture:
   - OAuth PKCE flow for authentication
   - Direct browser-to-OpenRouter API calls
   - User's API key stored in IndexedDB
   - Welcome screen for first-time users

5. **Added comprehensive planning:**
   - 5-session step-by-step teaching plan
   - Welcome screen design (adapted from mockup)
   - Unit tests for auth, client, and db modules
   - E2E tests for auth flow
   - Additional UX improvements (loading states, error handling, offline)

**Key learnings:**
- OpenRouter supports CORS, Anthropic does not
- OAuth PKCE is the standard for browser-based apps (no shared secrets)
- Free tier: 50 requests/day is enough for casual to moderate use
- User's own API key = zero cost for developer

---

### Session 1 - December 1, 2024

**What we accomplished:**

1. **Created OpenRouter account** - Explored the platform, models, and free tier

2. **Learned OAuth PKCE flow in depth:**
   - Why CORS matters (OpenRouter allows it, Anthropic doesn't)
   - The complete 6-step OAuth flow
   - Why two values (code_verifier + code_challenge) - security against interception
   - code_verifier stays in browser, code_challenge is a one-way hash

3. **Created `src/api/openrouter-auth.js`** with:
   - `generateCodeVerifier()` - cryptographically secure random string
   - `generateCodeChallenge()` - SHA-256 hash using Web Crypto API
   - `startAuth()` - begins OAuth flow, redirects to OpenRouter
   - `handleCallback()` - exchanges code for API key
   - `isAuthCallback()` - detects callback URL

4. **Tested module in browser console** - Functions load and export correctly

**Key learnings:**
- `crypto.getRandomValues()` vs `Math.random()` - security matters for auth
- Web Crypto API is async (`crypto.subtle.digest`)
- `sessionStorage` for temporary auth state (survives redirect, clears on tab close)
- Base64url encoding (replace +, /, = for URL safety)

**Files created:**
- `src/api/openrouter-auth.js`

---

### Session 2 - December 1, 2024

**What we accomplished:**

1. **Tested complete OAuth flow:**
   - Called `startAuth()` → Redirected to OpenRouter
   - Logged in and authorized → Redirected back with code
   - Called `handleCallback()` → Exchanged code for API key
   - Successfully received API key (`sk-or-v1-...`)

2. **Tested edge cases:**
   - No code in URL → "No authorization code found in URL"
   - No code_verifier (PKCE protection) → "No code verifier found"
   - Experienced PKCE security firsthand!

3. **Added debug logging with toggle:**
   - `DEBUG` constant to enable/disable logs
   - `log()` helper function for consistent logging

**Key learnings:**
- The OAuth flow actually works end-to-end!
- PKCE really does protect against code interception
- API keys should never be logged in production

---

### Session 3 - December 1, 2024

**What we accomplished:**

1. **Created `src/api/openrouter-client.js`:**
   - `callOpenRouter(apiKey, prompt, options)` - Makes LLM API calls
   - `testApiKey(apiKey)` - Validates an API key
   - Error handling for 401, 429, 402 status codes
   - Headers for app attribution (`HTTP-Referer`, `X-Title`)

2. **Added IndexedDB storage for API key:**
   - `storeOpenRouterKey(apiKey)` - Saves key with timestamp
   - `getOpenRouterKey()` - Retrieves stored key
   - `removeOpenRouterKey()` - Disconnects user
   - `isOpenRouterConnected()` - Checks connection status

3. **Tested full round-trip:**
   - Stored key in IndexedDB
   - Retrieved key
   - Made real API call to OpenRouter
   - Got response: "4" (for 2+2 prompt)

4. **Found working free model:**
   - Original `deepseek/deepseek-chat-v3-0324:free` was 404
   - Updated to `tngtech/deepseek-r1t2-chimera:free`

**Files created/modified:**
- `src/api/openrouter-client.js` (new)
- `src/db/db.js` (added OpenRouter functions)
- `src/api/openrouter-auth.js` (added debug logging)

**Key learnings:**
- Free models change over time - need to check OpenRouter dashboard
- Reasoning models use more tokens (141 for a simple answer)
- `HTTP-Referer` and `X-Title` headers for app attribution

---

### Session 4 - December 1, 2024

**What we accomplished:**

1. **Created `src/views/WelcomeView.js`:**
   - Beautiful onboarding screen for new users
   - Features list (Personalized Quizzes, Track Progress, Works Offline)
   - "Get Started Free" button with loading state
   - Offline detection and error handling

2. **Updated `src/main.js` for OAuth callback:**
   - Detect OAuth callback before router starts (`isAuthCallback()`)
   - Show "Completing connection..." loading screen
   - Exchange code for API key and store it
   - Redirect to HomeView on success
   - Show error screen on failure

3. **Conditional routing based on connection status:**
   - `/` route shows WelcomeView or HomeView based on `isOpenRouterConnected()`
   - Debugged issue: leftover `?code=` in URL from earlier testing

4. **Updated `src/views/SettingsView.js` with Account section:**
   - Shows connection status (green checkmark when connected)
   - "Disconnect" button with confirmation dialog
   - "Connect with OpenRouter" link when disconnected

5. **Tested complete user flows:**
   - New user: WelcomeView → OAuth → HomeView ✅
   - Returning user: HomeView directly ✅
   - Disconnect: Settings → Disconnect → WelcomeView ✅
   - Reconnect: WelcomeView → OAuth → HomeView ✅

**Files created/modified:**
- `src/views/WelcomeView.js` (new)
- `src/main.js` (OAuth callback handling, conditional routing)
- `src/views/SettingsView.js` (Account section with disconnect)

**Key learnings:**
- OAuth callback URL doesn't use hash routing - handle before router init
- Conditional routing: `isConnected ? HomeView : WelcomeView`
- Always clean up test URLs to avoid confusion
- User feedback is important (loading states, error messages)

---

### Session 5 - December 1, 2024

**What we accomplished:**

1. **Updated `src/api/api.real.js` to use OpenRouter:**
   - Replaced PHP backend calls with `callOpenRouter()`
   - Gets API key from IndexedDB via `getOpenRouterKey()`
   - Same prompts as Netlify functions (for consistency)
   - Handles JSON parsing including markdown code blocks
   - Proper error handling for missing API key

2. **Tested full quiz generation flow:**
   - Generated quiz about "Judo"
   - Got 5 questions with correct structure
   - Mix of difficulties (easy, medium, challenging)
   - Language detection working (EN-US)
   - All happening directly in browser → OpenRouter!

**Files modified:**
- `src/api/api.real.js` (complete rewrite)

**Key learnings:**
- Free models may wrap JSON in markdown code blocks (```json)
- Need to strip markdown before parsing JSON
- Same prompts work across different LLM providers
- Browser console shows full API flow for debugging

---

## Phase 3.6 Complete! 🎉

**Summary of what was built:**

| File | Purpose |
|------|---------|
| `src/api/openrouter-auth.js` | OAuth PKCE authentication flow |
| `src/api/openrouter-client.js` | Direct browser → OpenRouter API calls |
| `src/views/WelcomeView.js` | First-time user onboarding screen |
| `src/api/api.real.js` | Quiz generation using OpenRouter |
| `src/db/db.js` (additions) | API key storage in IndexedDB |
| `src/main.js` (updates) | OAuth callback handling, conditional routing |
| `src/views/SettingsView.js` (updates) | Account section with disconnect |

**Architecture transformation:**

```
BEFORE (Phase 3.4):
Browser → PHP Server (your VPS) → Anthropic API
         ↑ you pay for everything

AFTER (Phase 3.6):
Browser → OpenRouter API (directly!)
         ↑ user's own account (free tier: 50 req/day)
```

**Benefits achieved:**
- ✅ Zero cost for developer
- ✅ Users use free tier (50 requests/day)
- ✅ No backend needed for LLM calls
- ✅ OAuth PKCE for secure authentication
- ✅ One-click "Get Started" experience
- ✅ Full disconnect/reconnect flow

---

## Where We Left Off

**Status:** Phase 3.6 IN PROGRESS - Feature complete, tests pending

**Next:** Session 6 - Unit & E2E Tests
- Unit tests for `openrouter-auth.js` (PKCE functions)
- Unit tests for `openrouter-client.js` (API calls)
- Unit tests for `db.js` (key storage functions)
- E2E tests for OAuth flow
- E2E tests for quiz generation with OpenRouter

**⚠️ Phase NOT complete until tests are written and passing!**

---

## Reference Materials

- [OpenRouter OAuth PKCE Docs](https://openrouter.ai/docs/use-cases/oauth-pkce)
- [OpenRouter API Reference](https://openrouter.ai/docs/api-reference/overview)
- Working free model: `tngtech/deepseek-r1t2-chimera:free`

---

## Files Updated This Session

| File | Change |
|------|--------|
| `docs/epic03_quizmaster_v2/PHASE3.6_OPENROUTER.md` | Complete rewrite with correct architecture |
| `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md` | Added Phase 3.6 to timeline |
| `CLAUDE.md` | Updated current status |
| `docs/parking_lot/PHASE9_OPENROUTE_MIGRATION.md` | Deleted (moved to Phase 3.6) |

---

## Reference Materials

- [OpenRouter OAuth PKCE Docs](https://openrouter.ai/docs/use-cases/oauth-pkce)
- [CORS Support Confirmation](https://blog.kowalczyk.info/til-calling-grok-openai-anthropic-google-openrouter-api-from-the-browser.html)
- Welcome screen mockup: `product_info/mockups/app_mockups/welcome_screen/`
- OpenRouter research: `docs/epic03_quizmaster_v2/investigating_openroute.md`
