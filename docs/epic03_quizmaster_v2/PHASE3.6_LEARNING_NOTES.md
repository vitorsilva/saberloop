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

## Where We Left Off

**Status:** Planning complete, ready to start implementation

**Next step:** Session 1 - Setup & OAuth Foundation
1. Create OpenRouter account
2. Explore OpenRouter OAuth docs
3. Create `src/api/openrouter-auth.js` with PKCE utilities
4. Test PKCE generation in browser console

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
