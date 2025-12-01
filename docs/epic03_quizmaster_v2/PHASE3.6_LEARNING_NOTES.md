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

## Where We Left Off

**Status:** Session 1 complete, continuing to Session 2

**Next step:** Session 2 - Complete OAuth Flow
1. Test OAuth flow manually (full round-trip)
2. Handle edge cases (errors, cancelled auth)
3. Verify API key is returned

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
