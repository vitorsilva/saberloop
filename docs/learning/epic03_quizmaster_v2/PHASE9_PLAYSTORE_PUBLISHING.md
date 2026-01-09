# Phase 9: Google Play Store Publishing

**Epic:** 3 - QuizMaster V2
**Status:** 🔄 Production Access Application SUBMITTED | Awaiting Google review (up to 7 days)
**Started:** 2025-12-11
**Last Updated:** 2026-01-09
**Learning Notes:** [PHASE9_LEARNING_NOTES.md](./PHASE9_LEARNING_NOTES.md)

---

## Overview

This phase covers publishing Saberloop to the Google Play Store using PWABuilder. PWAs can be packaged as Android apps using Trusted Web Activities (TWA), allowing distribution through the Play Store while maintaining all PWA benefits.

**Why Publish to Play Store?**
- **Discoverability** - Users find apps in the Play Store, not through web search
- **Credibility** - App store presence builds trust
- **Installation** - One-tap install, no browser prompts
- **Updates** - Web updates are instant (no app store review needed for content changes)

---

## Prerequisites

Before starting this phase, ensure:

- [x] **Domain** - saberloop.com registered ✅
- [ ] **HTTPS hosting** - Saberloop deployed at https://saberloop.com/app/
- [x] **Valid manifest.json** with:
  - [x] App name: "Saberloop - Learn Through Quizzes"
  - [x] short_name: "Saberloop"
  - [x] Icons: 192x192 and 512x512 PNG
  - [x] start_url: "/app/", display: "standalone"
  - [x] theme_color: "#FF6B35"
  - [x] background_color: "#1a1a2e"
- [x] **Service worker** for offline capability
- [x] **FTP deployment script** configured (`npm run build:deploy`)
- [x] **No backend required** - App uses client-side OpenRouter integration
- [ ] **Google Play Developer Account** ($25 one-time fee)

**Current Status:**
- Domain registered: ✅ saberloop.com
- Deployment working: ✅ https://saberloop.com/app/
- SSL certificate: ✅ Working
- FTP credentials: ✅ Configured in `.env`
- PWA manifest: ✅ Valid with icons and screenshots
- Lighthouse scores: ✅ 97/87/96/100

---

## Phase Structure

### 9.0.0 Deployment Validation (Pre-requisite) ✅ COMPLETE

**Time:** 30 minutes - 1 hour
**Completed:** 2025-12-12

Before proceeding with Play Store publishing, validate the current deployment status after the server migration.

#### 9.0.0.1 Verify Current State

1. **Check live site**: https://saberloop.com/app/
   - Does it load?
   - Any SSL/HTTPS errors?
   - Any CORS errors in console?

2. **Check PWA features**:
   - DevTools → Application → Manifest (valid?)
   - DevTools → Application → Service Workers (registered?)
   - Install prompt works?

3. **Test core functionality**:
   - Can you start a quiz with sample data (offline)?
   - Can you generate questions with an OpenRouter API key?
   - Do settings persist?

#### 9.0.0.2 Fix Any Issues Found

Common issues to address:
- SSL certificate not issued → Issue via cPanel AutoSSL
- SPA routing broken → Verify .htaccess configuration
- Assets not loading → Check file paths after build
- Service worker errors → Clear cache and redeploy

#### 9.0.0.3 Success Criteria

- [x] https://saberloop.com/app/ loads without errors
- [x] HTTPS working (green padlock)
- [x] PWA manifest recognized by browser
- [x] Service worker registers successfully
- [x] Sample quizzes work offline
- [x] API calls work (with valid OpenRouter key)
- [x] Lighthouse PWA score acceptable (97/87/96/100)

---

### 9.0.1 Repository Rename: demo-pwa-app → saberloop ✅ COMPLETE

**Time:** 30-60 minutes
**Completed:** 2025-12-12

Before publishing to Play Store, rename the GitHub repository to match the product branding. This ensures all public links, documentation, and references use the final product name.

#### Why Rename Before Play Store?

- **Consistency** - Play Store listing will link to GitHub; URLs should match branding
- **Professionalism** - "demo-pwa-app" suggests a test project, not a real product
- **SEO** - Repository name affects discoverability
- **One-time effort** - Better to do now than after Play Store launch

#### Pre-Rename Checklist

Before renaming on GitHub:

- [ ] Ensure all local changes are committed and pushed
- [ ] Note current clone URL: `https://github.com/vitorsilva/demo-pwa-app.git`
- [ ] Backup any local branches not pushed to remote

#### Step 1: Rename Repository on GitHub

1. Go to https://github.com/vitorsilva/demo-pwa-app
2. Click **Settings** (top menu)
3. In "Repository name" field, change `demo-pwa-app` to `saberloop`
4. Click **Rename**
5. GitHub will automatically redirect old URLs (temporarily)

**Note:** GitHub provides automatic redirects from old URL to new URL, but these redirects can break if you create a new repo with the old name. Update all references promptly.

#### Step 2: Update Local Git Remote

After renaming on GitHub, update your local repository:

```bash
# Check current remote
git remote -v

# Update to new URL
git remote set-url origin https://github.com/vitorsilva/saberloop.git

# Verify the change
git remote -v

# Test connection
git fetch
```

#### Step 3: Update Critical Files

These files contain repository URLs that will break:

**3.1 package.json** (lines 5, 7, 11)

Update these three fields:
```json
{
  "homepage": "https://github.com/vitorsilva/saberloop#readme",
  "bugs": {
    "url": "https://github.com/vitorsilva/saberloop/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/vitorsilva/saberloop.git"
  }
}
```

**3.2 README.md** (lines 30-31)

Update clone instructions:
```markdown
git clone https://github.com/vitorsilva/saberloop.git
cd saberloop
```

**3.3 CONTRIBUTING.md** (lines 15, 16, 19, 171)

Update all repository URLs:
- Line 15: `git clone https://github.com/YOUR_USERNAME/saberloop.git`
- Line 16: `cd saberloop`
- Line 19: `git remote add upstream https://github.com/vitorsilva/saberloop.git`
- Line 171: `[Issues](https://github.com/vitorsilva/saberloop/issues)`

**3.4 CHANGELOG.md** (lines 94-97)

Update release comparison URLs:
```markdown
[Unreleased]: https://github.com/vitorsilva/saberloop/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/vitorsilva/saberloop/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/vitorsilva/saberloop/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/vitorsilva/saberloop/releases/tag/v0.1.0
```

**3.5 landing/index.html** (lines 390, 482, 483)

Update GitHub links:
- Line 390: `href="https://github.com/vitorsilva/saberloop"`
- Line 482: `href="https://github.com/vitorsilva/saberloop"`
- Line 483: `href="https://github.com/vitorsilva/saberloop/issues"`

**3.6 CLAUDE.md** (line 17)

Update repository reference:
```markdown
**Repository**: https://github.com/vitorsilva/saberloop
```

**3.7 docker-compose.yml** (line 8)

Update container name:
```yaml
container_name: saberloop
```

#### Step 4: Update Developer Guide Files

**docs/developer-guide/INSTALLATION.md** (lines 32-33):
```markdown
git clone https://github.com/vitorsilva/saberloop.git
cd saberloop
```

**docs/developer-guide/FAQ.md** (lines 29-30, 227):
```markdown
git clone https://github.com/vitorsilva/saberloop.git
cd saberloop
...
[GitHub Issues](https://github.com/vitorsilva/saberloop/issues)
```

**docs/developer-guide/TROUBLESHOOTING.md** (line 286):
```markdown
[GitHub Issues](https://github.com/vitorsilva/saberloop/issues)
```

**docs/README.md** (line 5):
```markdown
Live version available at [https://saberloop.com/app/](https://saberloop.com/app/)
```

#### Step 5: Update Learning Documentation

These files contain historical references that need updating for consistency:

**Epic 01 - Infrastructure:**

| File | Lines to Update | Content |
|------|-----------------|---------|
| `LEARNING_PLAN.md` | 869, 1014 | Project structure examples, deployment paths |
| `PHASE3_LEARNING_NOTES.md` | 409, 430, 442, 623 | GitHub Pages URLs |
| `PHASE4.1_LOCAL_HTTPS.md` | 244, 245, 934 | Windows/WSL paths, Docker container name |
| `PHASE4.2_BUILD_TOOLS.md` | 155, 740 | Package name examples |
| `PHASE4.5_CI_CD.md` | 163, 173, 246, 252, 697-777, 803, 808, 957, 1044 | Multiple deployment examples |

**Epic 02 - QuizMaster V1:**

| File | Lines to Update | Content |
|------|-----------------|---------|
| `PHASE5_LEARNING_NOTES.md` | 33 | Development URL |
| `PHASE7_PWA.md` | 77-171 | PWA configuration examples |
| `PHASE9_DEPLOYMENT.md` | 63, 77-171, 206, 270, 275, 508, 540, 601, 625 | Deployment examples |
| `PHASE9_LEARNING_NOTES.md` | 101, 113, 167, 354, 509, 584, 593, 668 | GitHub Pages URLs |

#### Step 6: Commit and Push Changes

```bash
# Stage all updated files
git add -A

# Commit with descriptive message
git commit -m "chore: rename repository from demo-pwa-app to saberloop

- Update package.json repository URLs
- Update all documentation links
- Update clone instructions
- Update landing page GitHub links
- Update CLAUDE.md project reference
- Update docker-compose container name
- Update all learning documentation references"

# Push to new repository URL
git push origin main
```

#### Step 7: Post-Rename Verification

- [ ] `git push` works without errors
- [ ] https://github.com/vitorsilva/saberloop loads correctly
- [ ] Old URL https://github.com/vitorsilva/demo-pwa-app redirects
- [ ] All links in README work (click-test them)
- [ ] Clone with new URL works: `git clone https://github.com/vitorsilva/saberloop.git`

#### Files Updated Summary

| Category | Files | Priority |
|----------|-------|----------|
| Package config | `package.json` | Critical |
| Main docs | `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md` | Critical |
| Project config | `CLAUDE.md`, `docker-compose.yml` | High |
| Landing page | `landing/index.html` | High |
| Developer guides | 4 files in `docs/developer-guide/` | Medium |
| Learning docs | 9+ files in `docs/learning/` | Medium |

#### Success Criteria

- [x] Repository renamed on GitHub
- [x] Local git remote updated
- [x] All critical files updated (package.json, README, CONTRIBUTING, CHANGELOG)
- [x] Landing page links updated
- [x] CLAUDE.md updated
- [x] Developer guide files updated
- [x] Learning documentation updated
- [x] All changes committed and pushed
- [x] Old URL redirects to new URL

#### Learning Notes

**What we did:**
1. Analyzed full impact of repository rename across entire codebase
2. Updated 20+ files with new repository URLs and references
3. Renamed repository on GitHub (demo-pwa-app → saberloop)
4. Updated local git remote
5. Verified GitHub automatic redirect works

**Key learnings:**
- GitHub automatically redirects old URLs to new repository name
- Repository rename affects: package.json, all documentation, landing page, CI/CD configs
- Important to update before Play Store publishing (URLs in store listing should be final)
- Using `grep -r "old-name" .` helps find all references

**Files updated:**
- Critical: package.json, README.md, CONTRIBUTING.md, CHANGELOG.md, CLAUDE.md
- Config: docker-compose.yml
- Landing: landing/index.html
- Docs: 4 developer guide files, 15+ learning documentation files

**Time spent:** ~30 minutes

---

### 9.0 In-App Help (Pre-requisite) ✅ COMPLETE

**Time:** 1-2 hours
**Completed:** 2025-12-12

Before publishing to the Play Store, add user-facing help documentation within the app.

#### 9.0.1 Help Page Implementation

Create a simple Help view accessible from Settings:

**Tasks:**
1. Create `src/views/HelpView.js` with:
   - FAQ section (common questions)
   - Quick start guide
   - Contact/feedback information
   - Link to full documentation (if available)

2. Add `/help` route in `src/main.js`

3. Add "Help" link in Settings page

**Why before Play Store:**
- Play Store reviewers may check for help/support options
- Users from Play Store expect in-app guidance
- Reduces support requests

#### 9.0.2 Help Content Structure

```
Help
├── Getting Started
│   ├── How to create a quiz
│   ├── How to connect your API key
│   └── Using sample quizzes offline
├── FAQ
│   ├── Does it work offline?
│   ├── How do I get an API key?
│   ├── Is my data private?
│   └── How do I report issues?
└── Contact
    └── GitHub issues link
```

---

### 9.1 Domain & Hosting Setup (LAMP + cPanel)

**Time:** 1-2 hours

#### 9.1.1 DNS Configuration

1. **Log into your domain registrar** (where you bought saberloop.com)
2. **Update nameservers** to point to your LAMP host (get these from cPanel)
   - Or add A record pointing to your host's IP address:
   ```
   Type: A
   Host: @
   Value: YOUR_SERVER_IP
   TTL: 3600
   ```
3. **Add www subdomain** (optional but recommended):
   ```
   Type: CNAME
   Host: www
   Value: saberloop.com
   TTL: 3600
   ```
4. **Wait for DNS propagation** (can take 15 minutes to 48 hours)
   - Check with: https://dnschecker.org/#A/saberloop.com

#### 9.1.2 cPanel Domain Setup

1. **Log into cPanel**
2. **Add the domain** (if not primary):
   - Go to "Domains" or "Addon Domains"
   - Add saberloop.com
   - Note the document root (e.g., `/public_html/saberloop.com/`)
3. **Verify domain is accessible** via HTTP first

#### 9.1.3 SSL Certificate Setup

1. **In cPanel, go to "SSL/TLS Status"** or "Let's Encrypt"
2. **Issue free SSL certificate** for saberloop.com
   - Select saberloop.com (and www.saberloop.com if added)
   - Click "Issue" or "Run AutoSSL"
3. **Wait for certificate issuance** (usually 5-15 minutes)
4. **Verify HTTPS works**: https://saberloop.com

**Troubleshooting SSL:**
- If AutoSSL fails, ensure DNS is fully propagated
- Check "SSL/TLS" → "Manage SSL Sites" for manual installation
- Contact host support if issues persist

---

### 9.2 Deploy Saberloop via FTP

**Time:** 15-30 minutes

**Note:** Saberloop uses client-side OpenRouter integration - **no PHP backend needed!** Only static files are deployed.

#### 9.2.1 Configure FTP Credentials

Update your `.env` file with saberloop.com FTP credentials:

```bash
# FTP Deployment for saberloop.com
FTP_HOST=ftp.saberloop.com  # or your server IP
FTP_USER=your-ftp-username
FTP_PASSWORD=your-ftp-password
```

#### 9.2.2 Build and Deploy

```bash
# Build and deploy in one command
npm run build:deploy

# Or separately:
npm run build    # Creates dist/ folder
npm run deploy   # FTP uploads to /app/ on server
```

The deploy script (`scripts/deploy-ftp.cjs`) uploads `dist/` contents to `/app/` subdirectory on the server.

#### 9.2.3 FTP Manual Setup (if needed)

If automated deploy doesn't work, use FTP client (FileZilla, Cyberduck):

```
Host: ftp.saberloop.com (or server IP)
Username: your_ftp_username
   Password: your_ftp_password
   Port: 21
   ```

#### 9.2.4 Configure .htaccess for SPA Routing

Create `.htaccess` in the `/app/` directory on the server:

```apache
# Enable RewriteEngine
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle SPA routing - serve index.html for all non-file requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]

# Correct MIME types
AddType application/javascript .js
AddType application/json .json
AddType text/css .css

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 week"
    ExpiresByType text/css "access plus 1 week"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
</IfModule>
```

**Note:** No API configuration needed - Saberloop uses client-side OpenRouter calls directly from the browser.

#### 9.2.5 Verify Deployment

1. **Test the app**: https://saberloop.com/app/
2. **Check PWA features**:
   - Open DevTools → Application → Manifest (should load)
   - Open DevTools → Application → Service Workers (should register)
3. **Test quiz generation** (requires user to connect OpenRouter API key in Settings)
4. **Test offline mode** (disconnect and refresh - sample quizzes should work)

---

### 9.3 Google Play Developer Account Setup

**Time:** 30 minutes

**Steps:**
1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Pay the $25 registration fee (one-time)
4. Complete developer profile (name, address, etc.)
5. Wait for account approval (usually instant, can take 48 hours)

**Important Notes:**
- Use a personal or business Google account you control
- The $25 fee is non-refundable
- Account name will be visible to users

---

### 9.4 Generate Android Package with PWABuilder

**Time:** 15-30 minutes

**Steps:**

1. **Navigate to PWABuilder**
   - Go to https://www.pwabuilder.com
   - Enter your PWA URL: `https://saberloop.com`
   - Click "Start"

2. **Review PWA Score**
   - PWABuilder analyzes your PWA
   - Review scores for manifest and service worker
   - Address any critical issues before proceeding

3. **Build Android Package**
   - Click "Build My PWA"
   - Select **Android** platform
   - Configure the following options:

**Package Configuration:**
```
Package ID:        com.saberloop.app
App name:          Saberloop
Short name:        Saberloop
Version name:      1.0.0
Version code:      1
Display mode:      Standalone
Status bar color:  #1a1a2e
Navigation bar:    #1a1a2e
```

4. **Signing Key Setup (CRITICAL)**
   - Select **"Generate new signing key"** (first release)
   - PWABuilder creates a signing key for you
   - Download the ZIP file

5. **Save the ZIP Contents**
   The ZIP contains:
   ```
   /output/
   ├── app-release-signed.apk     # For testing
   ├── app-release-signed.aab     # For Play Store upload
   ├── signing.keystore           # YOUR SIGNING KEY (CRITICAL!)
   └── signing-key-info.txt       # Key passwords and alias
   ```

**⚠️ CRITICAL: Keep the signing files safe!**
- `signing.keystore` and `signing-key-info.txt` are required for ALL future updates
- Store them securely (password manager, secure backup)
- Without these, you CANNOT update your app ever

---

### 9.5 Test APK on Android Device

**Time:** 15 minutes

**Prerequisites:**
- Android phone or tablet
- USB cable (or file transfer method)

**Steps:**

1. **Enable Developer Mode on Phone**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - You'll see "Developer mode enabled"

2. **Enable Unknown Sources**
   - Settings → Security → Unknown sources (or Apps from unknown sources)
   - Enable it for your file manager or browser

3. **Transfer and Install APK**
   - Transfer `app-release-signed.apk` to your phone
   - Open the APK file
   - Tap "Install"

4. **Test the App**
   - Open Saberloop from your app drawer
   - Test all features (quiz generation, offline, etc.)
   - **Note:** You'll see an address bar initially - this is normal and will disappear after Digital Asset Links verification

**Expected Behavior:**
- App opens in standalone mode (but with address bar)
- All features work as expected
- App icon appears correctly

---

### 9.5.5 Automated Testing with Maestro (Optional but Recommended)

For repeatable TWA testing without manual device interaction, use Maestro - a simple mobile UI testing framework.

**Time:** 30-45 minutes (first-time setup)

#### Why Automate?
- **Repeatable** - Run same tests after each PWA update
- **CI-friendly** - Can integrate with GitHub Actions
- **Fast** - Emulator tests run in ~30 seconds
- **Free** - Open source tool

#### Prerequisites

1. **Install Maestro CLI**
   ```bash
   # macOS
   curl -Ls "https://get.maestro.mobile.dev" | bash

   # Windows (via WSL) or Linux
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. **Install Android Studio** (for emulator)
   - Download from https://developer.android.com/studio
   - During setup, ensure "Android Virtual Device" is selected
   - Create an emulator (Pixel 6, API 33 recommended)

3. **Start the emulator**
   ```bash
   # List available emulators
   emulator -list-avds

   # Start emulator (replace with your AVD name)
   emulator -avd Pixel_6_API_33
   ```

#### Create Test Files

Create directory for Maestro tests:
```bash
mkdir -p .maestro
```

**File: `.maestro/smoke-test.yaml`**
```yaml
appId: com.saberloop.app
---
# Test 1: App launches and shows home screen
- launchApp
- assertVisible:
    text: ".*Saberloop.*"
    timeout: 15000
- takeScreenshot: 01-home-loaded

# Test 2: Navigate to Settings
- tapOn: "Settings"
- assertVisible: "API"
- takeScreenshot: 02-settings-visible

# Test 3: Return to Home
- tapOn: "Home"
- assertVisible: "Start"
- takeScreenshot: 03-back-to-home
```

**File: `.maestro/quiz-flow.yaml`**
```yaml
appId: com.saberloop.app
---
# Full quiz generation flow
- launchApp
- assertVisible:
    text: ".*Saberloop.*"
    timeout: 15000

# Start a quiz
- tapOn: "Start"
- assertVisible: "topic"
- inputText: "Basic math addition"
- tapOn: "Generate"

# Wait for questions (API call)
- assertVisible:
    text: "Question"
    timeout: 30000
- takeScreenshot: 04-quiz-started

# Answer a question (tap first option)
- tapOn:
    index: 0
- takeScreenshot: 05-answered-question
```

#### Run Tests

```bash
# Install APK to emulator first
adb install app-release-signed.apk

# Run smoke test
maestro test .maestro/smoke-test.yaml

# Run full quiz flow
maestro test .maestro/quiz-flow.yaml

# Run all tests in directory
maestro test .maestro/
```

#### CI Integration (GitHub Actions)

Add to `.github/workflows/android-test.yml`:
```yaml
name: Android TWA Tests

on:
  workflow_dispatch:  # Manual trigger
  # Or trigger on release:
  # push:
  #   tags: ['v*']

jobs:
  test-twa:
    runs-on: macos-latest  # macOS has better emulator support
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash

      - name: Start emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 33
          arch: x86_64
          script: |
            adb install app-release-signed.apk
            ~/.maestro/bin/maestro test .maestro/smoke-test.yaml

      - name: Upload screenshots
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: maestro-screenshots
          path: ~/.maestro/tests/
```

#### Expected Output

Successful test run:
```
Running smoke-test.yaml

 ✅ launchApp
 ✅ assertVisible: Saberloop
 ✅ takeScreenshot: 01-home-loaded
 ✅ tapOn: Settings
 ✅ assertVisible: API
 ✅ takeScreenshot: 02-settings-visible
 ✅ tapOn: Home
 ✅ assertVisible: Start
 ✅ takeScreenshot: 03-back-to-home

Test passed in 12.4s
```

#### Troubleshooting

| Issue | Solution |
|-------|----------|
| App not found | Ensure `appId` matches package ID in PWABuilder |
| Element not found | Increase timeout, check element text matches exactly |
| Emulator slow | Use x86_64 image with hardware acceleration |
| Screenshots black | Wait for app to fully render before screenshot |

#### When to Run These Tests

- **Before Play Store submission** - Verify APK works
- **After major PWA updates** - Ensure TWA still functions
- **After regenerating APK** - Verify new builds work
- **Optionally in CI** - Automated regression testing

---

### 9.6 Configure Digital Asset Links

Digital Asset Links prove ownership of both the website and the app, enabling true standalone mode (no address bar).

**Time:** 30 minutes

**Option A: Using Peter's Asset Link Tool (Easier)**

1. Install "Asset Link Tool" from Play Store on your test device
2. Open the tool and select your installed Saberloop APK
3. The tool generates the required JSON
4. Copy the generated JSON

**Option B: Manual Creation**

1. Find your SHA256 fingerprint in `signing-key-info.txt`
2. Create the following JSON:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.saberloop.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT_FROM_SIGNING_KEY_INFO"]
  }
}]
```

**Deploy the Asset Links File:**

1. Create the directory via FTP/cPanel: `/.well-known/`
2. Create file: `.well-known/assetlinks.json`
3. Paste your JSON content
4. Upload to saberloop.com

**Verify Deployment:**
```
https://saberloop.com/.well-known/assetlinks.json
```

The file must be accessible at this exact path.

**Note:** The `.htaccess` from section 9.2.4 should already handle serving this correctly. If issues persist, ensure the `.well-known` directory exists and is readable.

---

### 9.7 Prepare Play Store Listing Assets

**Time:** 1-2 hours

Before uploading to Play Store, prepare these required assets:

**Screenshots (Required):**
- **Phone screenshots:** At least 2, up to 8
  - Size: 1080x1920 (portrait) or 1920x1080 (landscape)
  - Show key features: home screen, quiz in progress, results

- **Tablet screenshots:** Optional but recommended
  - Size: 1920x1200 or similar

**Feature Graphic (Required):**
- Size: 1024x500 pixels
- Displayed at top of store listing
- Should showcase app branding

**App Icon (Required):**
- Size: 512x512 PNG
- Already have: `public/icons/icon-512x512.png`

**Text Content:**

| Field | Max Length | Content |
|-------|------------|---------|
| Title | 30 chars | Saberloop |
| Short Description | 80 chars | Learn any topic with AI-powered quizzes. Track progress and master subjects. |
| Full Description | 4000 chars | See template below |

**Full Description Template:**
```
Saberloop - The Fun Way to Learn Through Quizzes

📚 LEARN ANY TOPIC
Generate quizzes on any subject - from math and science to history and languages. Our AI creates personalized questions tailored to your learning level.

🎯 TRACK YOUR PROGRESS
See your quiz history, track scores, and watch your knowledge grow over time.

📱 WORKS OFFLINE
Study anywhere, even without internet. Your quizzes and progress are saved locally.

✨ KEY FEATURES
• AI-powered question generation
• Multiple difficulty levels
• Instant explanations for wrong answers
• Progress tracking and history
• Works offline
• No ads or tracking

🎓 PERFECT FOR
• Students preparing for exams
• Parents helping kids learn
• Anyone wanting to test their knowledge
• Self-directed learners

Built with privacy in mind - no tracking, no ads, no data collection.

Download now and start learning!
```

---

### 9.8 Submit to Google Play Store

**Time:** 30-60 minutes

**Steps:**

1. **Create App in Play Console**
   - Go to [Play Console](https://play.google.com/console)
   - Click "Create app"
   - Fill in:
     - App name: Saberloop
     - Default language: English
     - App or game: App
     - Free or paid: Free

2. **Complete Store Listing**
   - Upload all screenshots and graphics
   - Enter title, descriptions
   - Select category: Education
   - Add contact email

3. **Complete Content Rating**
   - Answer the IARC questionnaire
   - Saberloop should qualify for "Everyone" rating

4. **Set Up Pricing & Distribution**
   - Select: Free
   - Choose countries for distribution

5. **Upload AAB File**
   - Go to Release → Production → Create new release
   - Upload `app-release-signed.aab`

   **About Play App Signing:**
   - Google recommends using Play App Signing
   - If you use it, you'll need to add Google's signing key to your `assetlinks.json`
   - Alternatively, opt out to use only your key (simpler)

6. **Review and Submit**
   - Review all information
   - Click "Start rollout to Production"
   - App goes into review queue

**Review Timeline:**
- First submission: Usually 1-7 days
- Updates: Usually 1-3 days
- May take longer if flagged for manual review

---

### 9.9 Post-Publication: Digital Asset Links Update

**Important:** If you used Play App Signing, Google signs your app with their key. You'll need to:

1. Go to Play Console → Release → Setup → App integrity
2. Find the SHA256 fingerprint under "App signing key certificate"
3. Add this fingerprint to your `assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.saberloop.app",
    "sha256_cert_fingerprints": [
      "YOUR_UPLOAD_KEY_FINGERPRINT",
      "GOOGLE_PLAY_SIGNING_KEY_FINGERPRINT"
    ]
  }
}]
```

4. Upload updated `assetlinks.json` to saberloop.com via FTP
5. The address bar will disappear within hours once Google verifies

---

## Updating Your App

### Web Content Updates (Instant)
Changes to your PWA (UI, features, bug fixes) are **instant** - users get updates automatically when they open the app. No Play Store review needed!

### Play Store Metadata Updates
To update screenshots, description, or app info:
1. Go to Play Console
2. Make changes
3. Submit for review

### APK/AAB Updates (Version Bumps)
Only needed for:
- Android-specific changes
- Major version announcements
- Minimum SDK requirements changes

**To update the app package:**

1. Go to PWABuilder
2. In Signing key section, select **"Use mine"**
3. Upload your `signing.keystore` file
4. Enter credentials from `signing-key-info.txt`:
   - Key alias
   - Key password
   - Keystore password
5. **Increment version code** (e.g., 1 → 2)
6. Generate new AAB
7. Upload to Play Console

---

## Cost Breakdown

| Item | Cost | Frequency |
|------|------|-----------|
| saberloop.com domain | ~$10-15 | Yearly |
| LAMP hosting (cPanel) | Varies | Monthly/Yearly |
| Google Play Developer Account | $25 | One-time |
| PWABuilder | Free | - |
| **Total to Start** | **$25 + hosting** | **One-time + recurring** |

---

## Checklist

### Domain & Hosting Setup (9.1-9.2) ✅ COMPLETE
- [x] saberloop.com DNS configured (A record pointing to host)
- [x] Domain added in cPanel
- [x] SSL certificate issued (Let's Encrypt/AutoSSL)
- [x] HTTPS verified working: https://saberloop.com
- [x] Production build created (`npm run build`)
- [x] Frontend files uploaded via FTP
- [x] .htaccess configured for SPA routing
- [x] App tested and working at https://saberloop.com/app/

### Play Store Setup (9.3-9.6) ✅ COMPLETE
- [x] Google Play Developer account created and approved
- [x] PWABuilder package generated
- [x] APK tested on Android device (manual)
- [x] Maestro tests passing
- [x] Signing files backed up securely
- [x] assetlinks.json deployed and accessible

### Store Listing (9.7) ✅ COMPLETE
- [x] App icon (512x512)
- [x] Phone screenshots (5 images)
- [x] Feature graphic (1024x500)
- [x] Promotional video (YouTube)
- [x] Short description (80 chars)
- [x] Full description (4000 chars)
- [x] Category selected (Education)
- [x] Content rating completed (IARC questionnaire)
- [x] Target audience configured (13+)
- [x] Data safety declaration completed
- [x] Privacy policy published (https://saberloop.com/privacy.html)

### Submission (9.8) - PRODUCTION ACCESS APPLICATION
- [x] AAB file uploaded (940 KB, v1.0.0.0)
- [x] Pricing set (Free)
- [x] Countries selected (176 countries)
- [x] Internal testing published ✅
- [x] Closed testing setup (14 testers in "lista testes 1") ✅
- [x] Closed testing submitted for review ✅ (2025-12-16)
- [x] Closed testing approved by Google ✅
- [x] 14-day closed testing period completed ✅
- [x] Production access application submitted ✅ (2026-01-09 at 17:15)
  - [x] Step 1: About closed testing - completed ✅
  - [x] Step 2: About your app - completed ✅
  - [x] Step 3: Production readiness - completed ✅
- [ ] Production access approved by Google ← AWAITING (up to 7 days)
- [ ] Production release live

### Post-Publication Status
- [x] Internal testing live and verified ✅
- [x] assetlinks.json working (TWA verified) ✅
- [x] Address bar removed (no browser chrome!) ✅
- [x] Test installation from Play Store verified ✅
- [x] Closed testing approved (14 testers) ✅
- [x] 14-day closed testing period completed ✅
- [x] Production access application submitted ✅ (2026-01-09 at 17:15)
- [ ] Production access approved by Google ← AWAITING (up to 7 days)
- [ ] Production release live

---

## 9.8.5 Production Access Application

**Time:** 15-30 minutes
**Started:** 2026-01-09

After completing the closed testing period, Google requires you to apply for production access before your app can be published to all users. This is a 3-step wizard.

### Step 1: About Closed Testing (Acerca do teste fechado) ✅

This step confirms that closed testing was completed. It's automatically marked as done if you've met the testing requirements.

### Step 2: About Your App (Acerca da sua app) 🔄 IN PROGRESS

Google asks three questions to understand your app:

#### Question 1: What is your app's target audience? (Qual é o público-alvo da sua app?)
**Character limit:** 300

**Suggested answer:**
```
Estudantes, autodidatas e curiosos de todas as idades que desejam aprender sobre qualquer tópico através de quizzes interativos gerados por IA. A app é especialmente útil para quem quer testar conhecimentos, preparar-se para exames ou simplesmente aprender de forma divertida.
```

**English translation:**
```
Students, self-learners, and curious people of all ages who want to learn about any topic through AI-generated interactive quizzes. The app is especially useful for testing knowledge, preparing for exams, or simply learning in a fun way.
```

#### Question 2: How is your app useful for users? (Descreva de que forma a sua app é útil para os utilizadores)
**Character limit:** 300

**Suggested answer:**
```
Saberloop permite criar quizzes personalizados sobre qualquer tema em segundos usando IA. Os utilizadores podem estudar offline, acompanhar o seu progresso e aprender com explicações detalhadas para cada resposta errada. Ideal para estudo autónomo e revisão de matérias.
```

**English translation:**
```
Saberloop allows creating personalized quizzes on any topic in seconds using AI. Users can study offline, track their progress, and learn from detailed explanations for each wrong answer. Ideal for self-study and subject review.
```

#### Question 3: Expected installations in first year? (Quantas instalações prevê que a app tenha no primeiro ano?)
**Options:**
- **0 - 10 mil** ← Recommended for new apps (selected)
- 10 mil - 100 mil
- 100 mil - 1 milhão
- Mais de 1 milhão
- Não sei

**Why 0-10k?** For a new app without marketing budget, this is a realistic estimate. Being conservative here is fine - Google uses this for capacity planning, not app evaluation.

### Step 3: Production Readiness (Prontidão para a produção) ✅ COMPLETE

Google asks about your testing process and readiness:

#### Question 1: What changes did you make based on closed testing? (Que alterações fez à sua app com base no que aprendeu durante o teste fechado?)
**Character limit:** 300

**Suggested answer:**
```
Durante o teste fechado, validámos a estabilidade da aplicação e a experiência do utilizador. Fizemos ajustes menores na interface e corrigimos pequenos bugs identificados pelos testadores. Confirmámos que a funcionalidade offline e a integração com a API de IA funcionam corretamente em diferentes dispositivos Android.
```

**English translation:**
```
During closed testing, we validated the application stability and user experience. We made minor interface adjustments and fixed small bugs identified by testers. We confirmed that offline functionality and AI API integration work correctly across different Android devices.
```

#### Question 2: How did you decide your app is ready for production? (Como decidiu que a sua app está pronta para produção?)
**Character limit:** 300

**Suggested answer:**
```
A app passou por testes internos e teste fechado com 14 utilizadores. Todos os fluxos principais foram validados: criação de quizzes, modo offline, explicações de respostas e gestão de progresso. Os testes E2E automatizados passam consistentemente e não foram reportados problemas críticos durante o período de teste.
```

**English translation:**
```
The app went through internal testing and closed testing with 14 users. All main flows were validated: quiz creation, offline mode, answer explanations, and progress management. Automated E2E tests pass consistently and no critical issues were reported during the testing period.
```

After completing these questions, click **"Aplicar"** (Apply) to submit your production access application.

**Application Submitted:** 2026-01-09 at 17:15
**Expected Review Time:** Up to 7 days (Google will send email notification)

---

## Troubleshooting

### Address Bar Won't Disappear
- Verify `assetlinks.json` is accessible at `/.well-known/assetlinks.json`
- Check SHA256 fingerprint matches (both upload and Play signing keys if applicable)
- Wait 24-48 hours for Google verification
- Clear app data and reinstall

### App Rejected
Common reasons:
- Missing privacy policy (required for apps collecting any data)
- Screenshots show incorrect content
- Description doesn't match app functionality
- Metadata policy violations

### PWABuilder Issues
- Ensure manifest.json is valid (use PWABuilder's validator)
- Check service worker is registered correctly
- Verify HTTPS is working

---

## Success Criteria

- [x] Saberloop deployed and working at https://saberloop.com/app/
- [x] Landing page live at https://saberloop.com/
- [x] Privacy policy published at https://saberloop.com/privacy.html
- [x] Saberloop on Google Play Store (Internal Testing) ✅
- [x] App installs successfully from Play Store ✅
- [x] No address bar (TWA verification complete) ✅
- [x] All features work in Android app ✅
- [x] Content rating completed (all ages) ✅
- [x] Signing files securely stored for future updates ✅
- [x] Closed testing approved by Google ✅
- [x] 14-day closed testing period completed ✅
- [x] Production access application submitted ✅ (2026-01-09 at 17:15)
- [ ] Production access approved by Google ← AWAITING (up to 7 days)
- [ ] Production release live

---

## 9.10 Landing Page (saberloop.com root) ✅ COMPLETE

**Time:** 1-2 hours
**Completed:** 2025-12-12

The root of saberloop.com will host a landing page that promotes the app and directs users to install it.

### 9.10.1 Landing Page Purpose

- **Marketing** - Explain what Saberloop is and why users should try it
- **App Store Links** - Direct link to Google Play Store listing
- **Web App Link** - "Try it now" button to https://saberloop.com/app/
- **SEO** - Help users discover Saberloop via search

### 9.10.2 Landing Page Structure

```
saberloop.com/
├── index.html       # Landing page
├── styles.css       # Landing page styles (or inline)
├── images/          # Screenshots, hero images
│   ├── hero.png
│   ├── screenshot-1.png
│   └── screenshot-2.png
└── app/             # PWA lives here (separate deployment)
```

### 9.10.3 Landing Page Sections

1. **Hero Section**
   - App name and tagline: "Learn Any Topic with AI-Powered Quizzes"
   - Hero image or app screenshot
   - CTA buttons: "Try Web App" | "Get on Google Play"

2. **Features Section**
   - 🧠 AI-Generated Questions
   - 📱 Works Offline
   - 🔒 Privacy-First (your data stays on your device)
   - 🆓 Free to Use (bring your own API key)

3. **How It Works**
   - Step 1: Enter any topic
   - Step 2: Get 5 quiz questions instantly
   - Step 3: Learn from explanations

4. **Screenshots**
   - Mobile screenshots showing the app in action

5. **Footer**
   - Links: Privacy Policy, GitHub, Contact
   - Copyright

### 9.10.4 Technical Considerations

- **Static HTML** - Simple, fast-loading, no build step needed
- **Responsive** - Must look good on mobile (most visitors)
- **Separate from PWA** - Landing page is NOT part of the PWA build
- **Manual deployment** - Upload via FTP to root, separate from `/app/`

### 9.10.5 Deployment

```bash
# Landing page files go to server root
/public_html/saberloop.com/
├── index.html        # Landing page
├── styles.css
├── images/
└── app/              # PWA (deployed via npm run deploy)
```

**Note:** The landing page is deployed separately from the PWA. Use FTP to upload landing page files to the root.

---

## Learning Notes: Play Console Configuration

### Content Rating (IARC Questionnaire)
**Completed:** 2025-12-12

Answers for Saberloop:
- Violence: Não
- Sexual content: Não
- Gambling: Não
- Drugs/alcohol: Não
- Profanity: Não
- **Educational product: Sim** (Important! Saberloop is an educational quiz app)

**Result:** Ratings suitable for all ages (L, 3+, etc.)

### Target Audience (Público-alvo)
**Completed:** 2025-12-12

Selected age groups: **13-15, 16-17, 18+**

**Why not younger?** Selecting under-13 triggers Google's "Families Policy" requirements which adds complexity. Since Saberloop doesn't specifically target children and has no child-specific features, targeting 13+ is appropriate and simpler.

### Data Safety (Segurança dos dados)
**Completed:** 2025-12-12

This section declares what data the app collects/shares. Key answers:

| Question | Answer | Reason |
|----------|--------|--------|
| App collects/shares user data? | **Sim** | Quiz topics sent to OpenRouter API |
| Data encrypted in transit? | **Sim** | OpenRouter uses HTTPS |
| Account creation method | **No accounts** | Saberloop doesn't require login |
| Users can sign in with external accounts? | **Não** | No login functionality |
| Data deletion request URL | **Não** | Data stored locally, users delete via browser |

**Data Types NOT Collected:**
- ❌ Location (approximate or exact)
- ❌ Personal info (name, email, phone, address, etc.)
- ❌ Financial info
- ❌ Health & fitness
- ❌ Messages
- ❌ Photos & videos
- ❌ Audio files
- ❌ Files & documents
- ❌ Calendar
- ❌ Contacts
- ❌ Web browsing history
- ❌ App performance/diagnostics
- ❌ Device IDs

**Data Type Collected:**
- ✅ **Other user-generated content** (quiz topics entered by user, sent to AI API)

### Privacy Policy
**URL:** https://saberloop.com/privacy.html

Created privacy policy page with:
- Local data storage explanation (IndexedDB)
- AI Provider (OpenRouter) data transmission disclosure
- Future-proofing clauses for additional providers and anonymized analytics
- Data deletion instructions
- Link in landing page footer

### Store Listing (Ficha da loja)
**In Progress:** 2025-12-12

Completed:
- ✅ App name: Saberloop
- ✅ Category: Educação (Education)
- ✅ Contact email: vitorsilva.com@gmail.com
- ✅ Website: https://saberloop.com/

**Next steps when resuming:**
1. Add short description (80 chars max)
2. Add full description (4000 chars max)
3. Upload app icon (512x512)
4. Upload screenshots (phone)
5. Upload feature graphic (1024x500)

**Prepared descriptions:**

Short (80 chars):
```
Learn any topic with AI-powered quizzes. Free, offline-capable, privacy-first.
```

Full description - see PHASE9_PLAYSTORE_PUBLISHING.md section 9.7

### Future Improvements Noted
- Add data deletion request functionality (URL for Play Store)
- Consider in-app data management/export features

---

## Future Enhancements

### Phase 9.5: Apple App Store (Optional)
PWABuilder also supports iOS packaging, though with more limitations:
- Requires Apple Developer account ($99/year)
- Uses Web Clips or PWA wrapper
- iOS PWA limitations apply

### AdMob Integration (Optional)
If monetization is desired:
- Create AdMob account
- Integrate AdMob SDK
- Update privacy policy
- Consider user experience impact

---

## References

- [PWABuilder Documentation](https://docs.pwabuilder.com/)
- [Trusted Web Activities Overview](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Digital Asset Links](https://developers.google.com/digital-asset-links/)
- [Play Console Help](https://support.google.com/googleplay/android-developer/)
- [David Rousset's PWABuilder Guide](https://www.davrous.com/2020/02/07/publishing-your-pwa-in-the-play-store-in-a-couple-of-minutes-using-pwa-builder/)

---

**Ready to publish Saberloop to Google Play Store? Start with Section 7.1!**
