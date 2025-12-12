# Phase 9: Google Play Store Publishing - Learning Notes

**Epic:** 3 - QuizMaster V2
**Phase:** 9 - Play Store Publishing
**Status:** In Progress
**Started:** 2025-12-11

---

## Session 1 - December 11, 2025

### Planning & Documentation Updates

**Context:** Phase 9 was originally marked as optional, but was prioritized before Phase 6 (Validation) to enable easier distribution for beta testing.

### Key Discoveries

#### 1. Architecture Has Changed Since Phase 9 Was Written

The Phase 9 plan was written when the app used a PHP backend on VPS. However, Phase 3.6 (OpenRouter Integration) changed the architecture significantly:

| Component | Original Plan | Current State |
|-----------|---------------|---------------|
| AI Integration | PHP backend (server-side) | OpenRouter (client-side) |
| API Keys | Server-side only | User-provided, stored in IndexedDB |
| Backend Required | Yes (PHP on VPS) | No (fully static PWA) |
| Deployment | Frontend + PHP backend | Frontend only |

**Implication:** Deployment is now much simpler - only static files need to be deployed!

#### 2. Deployment Configuration Was Outdated

The project had configuration for deploying to `osmeusapontamentos.com/quiz-generator/`, but we need to deploy to `saberloop.com/app/`.

**Files that needed updates:**
- `vite.config.js` - Base path, PWA scope/start_url
- `scripts/deploy-ftp.cjs` - Remote root path
- `docs/architecture/DEPLOYMENT.md` - Complete rewrite
- `docs/architecture/SYSTEM_OVERVIEW.md` - Backend section

#### 3. Architecture Documentation Was Outdated

The `docs/architecture/` files still referenced Netlify Functions, but the project migrated to VPS in Phase 3.4 and then to client-side OpenRouter in Phase 3.6.

### Changes Made This Session

#### Documentation Reordering (Phase 9 before Phase 6)
- Updated `CLAUDE.md` - Status: "Next: Phase 9 Play Store Publishing"
- Updated `PHASE5_LEARNING_NOTES.md` - "What's Next" section
- Updated `EPIC3_QUIZMASTER_V2_PLAN.md` - Timeline reordered
- Updated `PHASE6_VALIDATION.md` - Prerequisites updated

#### Architecture Documentation Updates
- **DEPLOYMENT.md** - Complete rewrite for VPS/FTP deployment
- **SYSTEM_OVERVIEW.md** - Updated for client-side OpenRouter architecture

#### Phase 9 Plan Updates
- Updated prerequisites to reflect current state
- Updated deployment sections (removed PHP backend references)
- Added Section 9.10: Landing Page for saberloop.com root

#### Configuration Updates (Note: Claude made these directly - should have been user)
- `vite.config.js` - Base path changed to `/app/`
- `scripts/deploy-ftp.cjs` - Remote root changed to `/app`

### Current Deployment Status

| Item | Status |
|------|--------|
| Domain registered | ✅ saberloop.com |
| Manual deploy attempted | ❌ http://saberloop.com/app/ not working |
| SSL certificate | ❓ Needs verification |
| FTP credentials | ❓ Need to configure for saberloop.com |
| .htaccess for SPA routing | ❓ Needs to be created on server |

### What's Next (Tomorrow)

1. **Configure FTP credentials** in `.env` for saberloop.com
2. **Verify SSL** is working on saberloop.com
3. **Troubleshoot deployment** - why isn't http://saberloop.com/app/ working?
4. **Create .htaccess** for SPA routing in `/app/` directory
5. **Deploy and verify** the PWA works

### Key Learnings

1. **Documentation gets outdated fast** - Architecture docs should be updated with each major change
2. **Client-side API integration simplifies deployment** - No backend = simpler infrastructure
3. **Phase ordering is flexible** - Reordering phases based on practical needs is OK
4. **Subdirectory deployment requires config changes** - Base path, PWA scope, FTP remote root all need to match

---

## Session 2 - December 12, 2025

### Section 9.0.0 Deployment Validation - COMPLETE ✅

Today we completed the deployment validation that was added as a prerequisite before Play Store publishing.

### Issues Found & Fixed

#### 1. FTP Deployment Authentication
- **Problem:** `npm run deploy` failed with "Login authentication failed"
- **Cause:** Server requires FTPS (FTP over TLS), not plain FTP
- **Fix:** Added `secure: true` and `secureOptions: { rejectUnauthorized: false }` to `scripts/deploy-ftp.cjs`

#### 2. Hardcoded Paths for Subdirectory Deployment
Multiple files had paths hardcoded without the `/app/` prefix:

| File | Issue | Fix |
|------|-------|-----|
| `index.html` | Icon paths `/icons/...` | Changed to `/app/icons/...` |
| `src/views/WelcomeView.js` | Logo path `/icons/...` | Changed to `/app/icons/...` |
| `vite.config.js` | Icon src in manifest | Changed to `/app/icons/...` |
| `src/api/openrouter-auth.js` | OAuth callback URL `/auth/callback` | Changed to `/app/auth/callback` |
| `src/main.js` | Post-OAuth redirect `/#/` | Changed to `/app/#/` |

#### 3. PWA Manifest Warnings
- **Problem:** DevTools showed warnings about icons and screenshots
- **Cause 1:** Icons had `purpose: 'any maskable'` which is discouraged
- **Fix 1:** Created separate maskable icons with proper padding, updated manifest to have distinct `purpose: 'any'` and `purpose: 'maskable'` icons
- **Cause 2:** Missing screenshots for Richer Install UI
- **Fix 2:** Added mobile and desktop screenshots to manifest

#### 4. Old manifest.json Overriding Generated Manifest
- **Problem:** Browser showing old manifest name despite config changes
- **Root Cause:** Old `public/manifest.json` was being deployed alongside Vite PWA's generated `manifest.webmanifest`, and `index.html` was linking to the old one
- **Fix:**
  - Deleted `public/manifest.json`
  - Removed `<link rel="manifest">` from `index.html` (Vite PWA auto-injects)
  - Removed `manifest.json` from `includeAssets` in `vite.config.js`

### Validation Checklist Results

- [x] https://saberloop.com/app/ loads without errors
- [x] HTTPS working (green padlock)
- [x] PWA manifest recognized by browser
- [x] Service worker registers successfully
- [x] Sample quizzes work offline
- [x] API calls work (OAuth/PKCE with OpenRouter)
- [x] Lighthouse scores: Performance 97%, Accessibility 87%, Best Practices 96%, SEO 100%

### Key Learnings

#### 1. Planning Must Include Documentation Review (CRITICAL)
**Added to CLAUDE.md:** Before planning any phase, always review learning notes of related previous phases to identify dependencies and potential issues.

Example: If we had reviewed Phase 3.6 (OpenRouter) notes before planning deployment validation, we would have known OAuth callbacks exist and added them to the checklist.

#### 2. OAuth vs PKCE Clarified
- **OAuth 2.0** is the authorization framework/protocol
- **PKCE** (Proof Key for Code Exchange) is a security extension for public clients
- Saberloop uses: OAuth 2.0 with PKCE

#### 3. Subdirectory Deployment is Tricky
When deploying a PWA to a subdirectory (e.g., `/app/`), ALL of these need updating:
- Vite `base` path
- PWA manifest `scope` and `start_url`
- Icon paths in manifest
- OAuth callback URLs
- Post-auth redirects
- Any hardcoded absolute paths in the codebase

#### 4. Dual Manifest Files Cause Confusion
If `public/manifest.json` exists AND Vite PWA generates `manifest.webmanifest`, both get deployed. The `index.html` link determines which one is used. Best practice: Let Vite PWA handle manifest generation entirely.

### Files Modified This Session

| File | Change |
|------|--------|
| `scripts/deploy-ftp.cjs` | Added FTPS support |
| `index.html` | Fixed icon paths, removed manual manifest link |
| `src/views/WelcomeView.js` | Fixed logo path |
| `vite.config.js` | Fixed icon paths, added maskable icons, added screenshots |
| `src/api/openrouter-auth.js` | Fixed OAuth callback URL |
| `src/main.js` | Fixed post-OAuth redirect |
| `public/manifest.json` | DELETED |
| `public/icons/` | Added maskable icons and screenshots |
| `CLAUDE.md` | Added planning instruction about reviewing docs |
| `PHASE9_PLAYSTORE_PUBLISHING.md` | Added section 9.0.0 |

### What's Next

Section 9.0.0 (Deployment Validation) is complete. Next up:
- **Section 9.0: In-App Help** - Add help documentation to the app
- Then continue with PWABuilder and Play Store submission

---

**Last Updated:** 2025-12-12
**Phase Status:** In Progress - Section 9.0.0 Complete
**Next Session:** Section 9.0 In-App Help
