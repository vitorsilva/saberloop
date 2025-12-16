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

## Section 9.0 In-App Help - COMPLETE ✅

**Completed:** 2025-12-12

### Implementation

Created a simple Help page with FAQ accordion accessible from Settings.

**Files created/modified:**
- `src/views/HelpView.js` - NEW: Help page with expandable FAQ
- `src/main.js` - Added import and `/help` route
- `src/views/SettingsView.js` - Added "Help & FAQ" link in About section

**FAQ Content:**
1. How do I create a quiz?
2. Does the app work offline?
3. How do I connect to OpenRouter?
4. Is my data private?
5. What is OpenRouter?

**Features:**
- Expandable accordion for each FAQ
- Back button to Settings
- GitHub issues link for reporting problems
- Consistent styling with rest of app

---

## Section 9.10 Landing Page - COMPLETE ✅

**Completed:** 2025-12-12

### Implementation

Created a marketing landing page for saberloop.com root.

**Files created:**
- `landing/index.html` - Complete responsive landing page
- `scripts/deploy-landing.cjs` - FTP deploy script for landing page
- `package.json` - Added `npm run deploy:landing` script

**Landing Page Sections:**
1. Header with logo and CTA
2. Hero section with tagline and buttons
3. Features grid (AI, Offline, Privacy, Free)
4. How it works (3 steps)
5. Screenshots
6. Final CTA
7. Footer with links

**Technical Details:**
- Static HTML with inline CSS (no build step)
- Fully responsive (mobile-first)
- Uses Saberloop branding (#FF6B35, #1a1a2e)
- References app icons/screenshots from `/app/icons/`
- Deployed separately from PWA via `npm run deploy:landing`

---

## Session 3 - December 13, 2025

### Play Store Assets Creation - COMPLETE ✅

Today we created all the visual assets needed for the Play Store listing using Playwright automation.

### Assets Created

#### 1. Phone Screenshots (1080x1920)
Used Playwright to capture high-resolution screenshots of key app screens:

| Screenshot | Content |
|------------|---------|
| `playstore-screenshot-1-welcome.png` | Welcome screen with feature highlights |
| `playstore-screenshot-2-home.png` | Home screen with recent quiz topics |
| `playstore-screenshot-3-quiz.png` | Quiz in progress (multiple choice question) |
| `playstore-screenshot-4-results.png` | Results screen with 100% score |
| `playstore-screenshot-5-settings.png` | Settings page with preferences |

**Location:** `.playwright-mcp/`

#### 2. Feature Graphic (1024x500)
Captured from the landing page hero section - shows logo, tagline, and app preview.

**File:** `.playwright-mcp/playstore-feature-graphic.png`

#### 3. Promotional Video (~30 seconds)
Created a Playwright script to record the app flow:
- Welcome screen → Home → Start quiz → Answer questions → Results → Settings

**Script:** `scripts/record-playstore-video.cjs`
**Output:** `.playwright-mcp/saberloop-promo-video.webm`

### Play Store Listing Completed

Successfully filled out all Play Store Console sections:
- ✅ App name and descriptions
- ✅ Category (Education)
- ✅ Content rating (IARC questionnaire)
- ✅ Target audience (13+)
- ✅ Data safety declaration
- ✅ Privacy policy (https://saberloop.com/privacy.html)
- ✅ App icon (512x512)
- ✅ Feature graphic (1024x500)
- ✅ Phone screenshots (5 images)
- ✅ Promotional video (uploaded to YouTube)

**Status:** "Pronto para enviar para verificação" (Ready to submit for review)

### Key Learnings

#### 1. Playwright for Asset Generation
Playwright is excellent for generating Play Store assets:
- Screenshots at exact required dimensions (1080x1920 for phones)
- Video recording with `recordVideo` context option
- Automated app flow capture ensures consistency

#### 2. Play Store Image Requirements
| Asset | Required Size | Format |
|-------|---------------|--------|
| App Icon | 512x512 | PNG |
| Feature Graphic | 1024x500 | PNG/JPEG |
| Phone Screenshots | 1080x1920 min | PNG/JPEG (16:9 or 9:16) |
| Tablet Screenshots | Optional for phone-only apps | - |

#### 3. Video for Play Store
- Must be hosted on YouTube (public or unlisted)
- Play Store accepts YouTube URL only
- Playwright can record `.webm` format which YouTube accepts

### Files Created This Session

| File | Purpose |
|------|---------|
| `scripts/record-playstore-video.cjs` | Playwright video recording script |
| `.playwright-mcp/playstore-screenshot-*.png` | 5 phone screenshots |
| `.playwright-mcp/playstore-feature-graphic.png` | Feature graphic |
| `.playwright-mcp/saberloop-promo-video.webm` | Promotional video |

### What's Next (Tomorrow)

1. **Generate Android Package with PWABuilder**
   - Go to https://www.pwabuilder.com
   - Enter https://saberloop.com/app/
   - Configure package settings (com.saberloop.app)
   - Download AAB and signing keys

2. **Upload AAB to Play Store**
   - Go to Release → Production → Create new release
   - Upload `app-release-signed.aab`

3. **Configure Digital Asset Links**
   - Create `.well-known/assetlinks.json`
   - Add SHA256 fingerprint from signing key
   - Deploy to saberloop.com

4. **Submit for Review**
   - Final review of all settings
   - Submit app for Google review

---

## Session 4 - December 13, 2025 (Afternoon)

### PWABuilder Package Generation - COMPLETE ✅

Generated Android package using PWABuilder for Play Store submission.

### Concepts Learned

#### 1. Trusted Web Activity (TWA)
- **WebView wrapper**: Creates shell app with embedded browser - always shows address bar, limited features
- **TWA**: Uses Chrome itself to render PWA - no address bar when verified, shares Chrome storage, full PWA features
- TWA requires **Digital Asset Links** to prove website-app ownership connection

#### 2. Digital Asset Links
- JSON file at `/.well-known/assetlinks.json`
- Contains package name and SHA256 fingerprint of signing key
- Chrome verifies this to remove address bar
- Must be accessible via HTTPS

#### 3. PWABuilder Configuration
Key settings configured:
- **Package ID**: `com.saberloop.app` (changed from default `com.saberloop.twa`)
- **Key alias**: `saberloop-key` (changed from default `my-key-alias`)
- **Country code**: `PT` (Portugal)
- **Display mode**: Standalone
- **Signing key**: New (generated by PWABuilder)

### Steps Completed

1. **PWABuilder Analysis**
   - Manifest score: 25/44 (all required fields present)
   - Added `id: '/app/'` to manifest for better identification
   - Service worker warning was false positive (works correctly)

2. **Package Generation**
   - Generated via PWABuilder with custom settings
   - Downloaded ZIP containing: APK, AAB, signing.keystore, assetlinks.json

3. **APK Testing**
   - Installed on Android phone
   - All features working correctly
   - Initially showed address bar (expected before asset links)

4. **Digital Asset Links**
   - Uploaded `assetlinks.json` to `/.well-known/` on server
   - Verified accessible at https://saberloop.com/.well-known/assetlinks.json
   - Reinstalled APK - address bar disappeared! ✅

5. **Play Console Upload**
   - Created internal test release
   - Uploaded AAB (940 KB, version 1.0.0.0)
   - Added release notes
   - **BLOCKED**: Account verification pending

### Google Play Requirements Discovered

**New Developer Account Requirements:**
1. Identity verification (documents submitted, 1-7 days review)
2. Phone number verification (available after identity verified)
3. Closed testing with 12+ testers for 14+ days before production

This means Phase 6 (Validation/Beta Testing) will happen naturally during the required closed testing period!

### Files Created/Modified

| File | Change |
|------|--------|
| `vite.config.js` | Added `id: '/app/'` to manifest |
| `package/` folder | New folder for APK/AAB (in .gitignore) |
| Server: `/.well-known/assetlinks.json` | Digital Asset Links file |

### Key Signing Files (Stored Securely)

**CRITICAL - Required for all future updates:**
- `signing.keystore` - The signing key file
- `signing-key-info.txt` - Contains passwords and key alias
- Stored securely outside of git repository

### Current Blockers

| Blocker | Status | Expected Resolution |
|---------|--------|---------------------|
| Google identity verification | Pending | 1-7 days |
| Phone number verification | Blocked (needs identity first) | After identity |
| 12 testers for 14 days | Not started | After account verified |

### What's Next (When Google Verifies Account)

1. Complete phone verification
2. Submit internal test release
3. Set up closed testing track with 12 testers
4. Run closed test for 14 days
5. Apply for production access
6. Submit to production

---

## Session 5 - December 14, 2025

### Section 9.5.5: Automated Testing with Maestro - IN PROGRESS

Setting up Maestro for automated TWA testing on Windows with WSL.

### Environment Setup Completed

#### 1. Android Studio Installation
- Downloaded and installed Android Studio (Otter 2 Feature Drop | 2025)
- Setup wizard downloaded SDK components (~2.45 GB):
  - Android Emulator (427 MB)
  - Android Emulator hypervisor driver (172 KB)
  - Android SDK Build-Tools 36.1 (56.6 MB)
  - Android SDK Platform 36 (62.8 MB)
  - Android SDK Platform-Tools (6.81 MB)
  - Google Play Intel x86_64 Atom System Image (1.86 GB)

#### 2. Android Emulator Created
- Default device: "Medium Phone API 36.1"
- Android 16.0 ("Baklava") | x86_64
- Successfully launched emulator

#### 3. APK Testing on Emulator
- Installed `Saberloop.apk` via drag-and-drop onto emulator
- App launched successfully
- **No address bar visible** - TWA verification working!
- Chrome first-run setup required (selected "Use without an account")

#### 4. Maestro Installation (WSL)
- Initial WSL was Docker Desktop minimal environment (no bash/curl)
- Installed Ubuntu WSL: `wsl --install -d Ubuntu`
- Installed dependencies:
  - Java: `sudo apt install -y openjdk-17-jdk`
  - Unzip: `sudo apt install -y unzip`
- Installed Maestro: `curl -Ls "https://get.maestro.mobile.dev" | bash`
- **Maestro version: 2.0.10**

### Key Learnings

#### 1. TWA Testing Workflow
- Android Studio is needed for the emulator, not for code development
- APKs can be installed via drag-and-drop onto emulator window
- TWA apps require Chrome setup on first launch

#### 2. WSL on Windows
- Docker Desktop WSL is minimal (missing bash, curl, etc.)
- Need full Ubuntu WSL for development tools
- Install via: `wsl --install -d Ubuntu`

#### 3. Maestro Dependencies
- Requires Java (openjdk-17-jdk works)
- Requires unzip
- Installs to `$HOME/.maestro/bin`
- Need to add to PATH: `export PATH="$PATH":"$HOME/.maestro/bin"`

### Experiment 1: WSL as Admin - FAILED
- Ran WSL as administrator
- ADB saw the device (`emulator-5554`)
- Maestro still reported "0 devices connected"
- **Root cause:** Maestro in WSL can't communicate with Windows emulator due to WSL/Windows boundary

### Experiment 2: Maestro on Windows Native - SUCCESS ✅

#### Installation Steps (Windows)
1. Download Maestro:
   ```powershell
   Invoke-WebRequest -Uri "https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro.zip" -OutFile "$env:USERPROFILE\Downloads\maestro.zip"
   ```

2. Extract (note: creates nested folder):
   ```powershell
   Expand-Archive -Path "$env:USERPROFILE\Downloads\maestro.zip" -DestinationPath "$env:USERPROFILE\maestro" -Force
   ```

3. Add to PATH (note the double `maestro\maestro` due to nested extraction):
   ```powershell
   $newPath = "$env:USERPROFILE\maestro\maestro\bin"
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$newPath", "User")
   ```

4. Set JAVA_HOME to Android Studio's JDK:
   ```powershell
   [Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
   ```

5. Restart PowerShell and verify:
   ```powershell
   maestro --version
   ```

**Result:** Maestro 2.0.10 working on Windows!

#### Key Learnings from Experiments
1. **WSL + Windows emulator = problematic** - Maestro in WSL cannot see devices on Windows host
2. **Native Windows installation works** - Download ZIP, extract, set PATH and JAVA_HOME
3. **Android Studio includes JDK** - Located at `C:\Program Files\Android\Android Studio\jbr`
4. **Nested ZIP extraction** - Maestro ZIP extracts to `maestro\maestro\bin`, not `maestro\bin`
5. **Always validate paths** - Check paths exist before setting environment variables

### What's Next

1. Run Maestro tests on Windows
2. Verify smoke test passes
3. (Optional) Add CI integration

---

## Session 6 - December 14, 2025 (Evening)

### Maestro Smoke Test - First Run

Successfully ran the first Maestro smoke test on the Android emulator.

#### Test Results

| Step | Status | Notes |
|------|--------|-------|
| Launch app | ✅ Pass | App launched successfully |
| Assert "Saberloop" visible | ✅ Pass | Home/Welcome screen detected |
| Screenshot 01-app-loaded | ✅ Pass | Captured |
| Tap Settings (83%, 97%) | ✅ Pass | Navigation attempted |
| Assert Settings text | ❌ Fail | Expected "Preferences/Connect/AI Provider" not found |

**Failure reason:** The Settings page text assertions don't match the actual UI text. Need to check screenshot and update assertions.

#### Issues Discovered

1. **Output directory not respected**
   - `config.yaml` has `testOutputDir: tests` but output still goes to `C:\Users\omeue\.maestro\tests\`
   - Workaround: Use `--output` flag explicitly: `maestro test .maestro/smoke-test.yaml --output .maestro/tests`

2. **Test assertions need adjustment**
   - Coordinate-based tapping (83%, 97%) worked for navigation
   - Text assertions need to match actual UI text

#### Commands Used

```bash
# Start emulator (via Android Studio Device Manager)

# Run Maestro test
maestro test .maestro/smoke-test.yaml

# Open test output folder
explorer "C:\Users\omeue\.maestro\tests\2025-12-14_191749"
```

### Smoke Test Fixed and Passing ✅

After reviewing the screenshot, discovered the app was resuming a previous quiz session. Fixed the test:

**Changes to `.maestro/smoke-test.yaml`:**
1. Updated first assertion to accept Quiz/Question screens (handles existing data)
2. Changed from coordinate-based tapping (`point: "83%,97%"`) to text-based (`tapOn: "Settings"`)
3. Simplified all assertions

**Output directory fix:**
- Correct flag is `--test-output-dir`, not `--output`
- Command: `maestro test .maestro/smoke-test.yaml --test-output-dir .maestro/tests`

**Final test results:**
```
✅ Launch app "com.saberloop.app"
✅ Assert that ".*Saberloop.*|.*Quiz.*|.*Question.*|.*Welcome.*" is visible
✅ Take screenshot 01-app-loaded
✅ Tap on "Settings"
✅ Assert that ".*Settings.*|.*API.*|.*Provider.*" is visible
✅ Take screenshot 02-settings-visible
✅ Tap on "Home"
✅ Take screenshot 03-back-to-home
```

### Section 9.5.5 Complete ✅

Maestro automated testing is now working:
- Smoke test passes
- Screenshots saved to project folder (`.maestro/tests/`)
- Text-based tapping is more reliable than coordinates

### What's Next

**Blocked by Google account verification:**
- Identity verification pending (submitted Dec 13)
- After verification: phone verification, then 12 testers for 14 days

**When unblocked:**
1. Complete phone verification
2. Submit internal test release
3. Set up closed testing with 12 testers
4. Run 14-day closed test
5. Apply for production access

---

## Session 7 - December 15, 2025

### Internal Testing Published - SUCCESS ✅

Google account verification completed! Successfully published Saberloop to Internal Testing track.

### Steps Completed

1. **Google Play Console Access**
   - Account verified and fully accessible
   - App already in "Rascunho" (Draft) status from previous session

2. **Internal Test Release Created**
   - AAB already uploaded (940 KB, version 1.0.0.0)
   - Release notes: "Initial release of Saberloop - Learn any topic with AI-powered quizzes."
   - Status: "Pronto para o lançamento" (Ready for launch)

3. **Testers Added**
   - Added personal email as tester
   - Published internal test (instant - no review wait for internal)

4. **Installation from Play Store**
   - Found internal testing link in Play Console
   - Opened link on Android phone
   - Accepted tester invitation
   - Installed Saberloop from Play Store

5. **Verification**
   - ✅ App installed successfully
   - ✅ **No address bar** - TWA verification working perfectly!
   - ✅ All features functional

### Key Learnings

#### 1. Manual APK vs Play Store Installation Conflict

**Situation:** Had previously installed APK directly on phone (from Section 9.5 testing).

**Behavior:** When clicking Play Store internal test link, it said "already installed but not from this link."

**Solution:** Uninstall the manually installed APK first, then install from Play Store link.

**Why this matters:** Play Store tracks installation source. For proper testing and future updates, install via Play Store, not direct APK.

#### 2. App Data Persists After Uninstall

**Discovery:** After uninstalling and reinstalling from Play Store:
- Welcome screen did NOT appear (should show on first launch)
- Settings (OpenRouter connection) were still configured

**Root cause:** Android does not clear app data (IndexedDB, localStorage) on uninstall by default.

**Implications:**
- Users who reinstall will have their data preserved
- For true "fresh install" testing, must manually clear app data:
  - Settings → Apps → Saberloop → Storage → Clear Data
- Consider adding "Reset App" option in Settings for users

#### 3. OpenRouter Reconnection After Fresh Install

**Issue:** First quiz generation attempt failed quickly after reinstall.

**Solution:** Went to Settings, disconnected from OpenRouter, reconnected.

**Hypothesis:** OAuth token may have been in an inconsistent state after the install/uninstall cycle. Reconnecting refreshed the token.

**Future consideration:** Add better error handling/auto-reconnect for stale OAuth tokens.

#### 4. TWA Verification Confirmed Working

**Result:** No address bar visible in Play Store installed version.

**This confirms:**
- `assetlinks.json` correctly deployed at `/.well-known/assetlinks.json`
- SHA256 fingerprint matches signing key
- Google/Chrome verified the domain-app connection

### Section 9.8 Status Update

| Requirement | Status |
|-------------|--------|
| Google account verified | ✅ Complete |
| Internal test published | ✅ Complete |
| Tester added | ✅ Complete |
| Installation verified | ✅ Complete |
| TWA verification (no address bar) | ✅ Complete |

### What's Next

**For Production Release:**
1. Set up **Closed Testing** track with 12+ testers
2. Run closed test for **14+ days** (Google requirement for new developers)
3. Apply for production access
4. Submit to production

**Optional improvements noted:**
- Add "Reset App Data" option in Settings
- Improve OAuth token error handling
- Add first-launch detection that survives reinstall (server-side tracking would be needed)

---

**Last Updated:** 2025-12-16
**Phase Status:** Closed Testing IN REVIEW 🔄
**Completed Sections:** 9.0.0, 9.0.1, 9.0, 9.1, 9.2, 9.3, 9.4, 9.5, 9.5.5, 9.6, 9.7, 9.8 (Internal + Closed), 9.10
**Next Step:** Await Google approval → 14-day testing period → Production release

---

## Summary of Phase 9 Progress

| Section | Description | Status |
|---------|-------------|--------|
| 9.0.0 | Deployment Validation | ✅ Complete |
| 9.0.1 | Repository Rename | ✅ Complete |
| 9.0 | In-App Help | ✅ Complete |
| 9.1 | Domain & Hosting Setup | ✅ Complete |
| 9.2 | Deploy via FTP | ✅ Complete |
| 9.3 | Google Play Developer Account | ✅ Complete |
| 9.4 | PWABuilder Package | ✅ Complete |
| 9.5 | APK Testing | ✅ Complete |
| 9.5.5 | Maestro Automated Testing | ✅ Complete |
| 9.6 | Digital Asset Links | ✅ Complete |
| 9.7 | Play Store Listing Assets | ✅ Complete |
| 9.8 | Internal Testing | ✅ LIVE |
| 9.10 | Landing Page | ✅ Complete |
| 9.8 | Closed Testing (14 testers) | 🔄 IN REVIEW |
| 9.8 | Google Approval | ⏳ Awaiting |
| 9.8 | 14-day Testing Period | ⏳ After approval |
| 9.8 | Production Release | ⏳ After 14-day test |

---

## Session 8 - December 16, 2025

### Closed Testing Submitted for Review ✅

Successfully set up and submitted Closed Testing to Google for review.

### Steps Completed

1. **Accessed Closed Testing (Alpha) track** in Play Console
2. **Selected testers:**
   - Used existing "lista testes 1" with 14 testers
   - Exceeds Google's 12-tester minimum requirement
3. **Created release:**
   - Added AAB from library (same v1.0.0.0 from Internal Testing)
   - Release name: "1 (1.0.0.0)"
   - Release notes carried over from Internal Testing
4. **Submitted for review:**
   - 14 changes submitted total
   - Includes: release, countries (176), testers, store listing, content rating, data safety, etc.

### What's Next

| Step | Status |
|------|--------|
| Google reviews Closed Testing | 🔄 IN REVIEW (usually hours to 1 day) |
| Testers receive invite emails | After approval |
| Testers install from Play Store | After approval |
| 14-day testing period begins | After first tester installs |
| Apply for Production access | After 14 days |
| Submit to Production | After production access granted |

### Key Learning

**Reusing releases:** Play Console allows adding AAB "from library" - no need to re-upload the same file for different testing tracks.

### Timeline Estimate

- **Closed Testing approval:** Within 24-48 hours (usually faster)
- **14-day testing period:** Starts when first tester opts in
- **Production eligibility:** ~2 weeks from now (around Dec 30-31)
