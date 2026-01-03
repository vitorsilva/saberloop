# Landing Page Improvement Plan

**Status:** Planning
**Priority:** Medium (User Acquisition)
**Estimated Effort:** 2-3 sessions
**Created:** 2025-12-28
**Updated:** 2026-01-03

## Session Log

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-28 | **Plan Created** | Gap analysis and wireframes complete |
| 2025-12-30 | **Moved to Epic 5** | Promoted from parking lot to active epic |
| 2026-01-03 | **Planning Complete** | Added Phase 49/50/51 features, screenshot assessment, Sharp script, subphases, branching strategy, Playwright/Maestro reference. Ready to implement. |

---

## Branching Strategy

**Branch name:** `feature/phase52-landing-page`

**Workflow:**
1. Create branch from `main` before starting implementation
2. Commit frequently with clear messages (one logical change per commit)
3. Push to remote regularly for backup
4. Create PR to `main` when complete

**Branch commands:**
```bash
git checkout main
git pull origin main
git checkout -b feature/phase52-landing-page
```

**Commit Guidelines:**
- One logical change per commit
- Use conventional commit messages:
  - `feat(landing): add multi-language feature card`
  - `feat(landing): update hero subtitle`
  - `feat(landing): add screenshot processing script`
  - `style(landing): update feature grid to 3x2 layout`
  - `docs(landing): update Phase 52 plan with progress`

---

## Subphase Progress Tracking

**IMPORTANT:** When completing each subphase, update documentation before moving to the next:

### 1. Update this plan document
- Mark the subphase as complete in the checklist
- Add a session log entry with date and notes

### 2. Update learning notes (`PHASE52_LEARNING_NOTES.md`)
- Document what was learned during the subphase
- Note any challenges encountered and how they were resolved
- Record any deviations from the original plan
- Include code snippets or patterns worth remembering

### 3. Commit the documentation updates
```bash
git add docs/learning/epic05/PHASE52_*.md
git commit -m "docs: complete Phase 52.X - [description]"
```

This ensures we always know where we left off if resuming later and captures learning for future reference.

---

## Reference: Playwright & Maestro

This phase may require capturing new screenshots using Playwright or Maestro. Reference these previous phases for guidance:

### Related Documentation

| Phase | Document | Content |
|-------|----------|---------|
| **Phase 4.4** | `docs/learning/epic01_infrastructure/PHASE4.4_E2E_TESTING.md` | Playwright setup, configuration, writing tests |
| **Phase 60** | `docs/learning/epic04_saberloop_v1/PHASE60_MAESTRO_TESTING.md` | Maestro test strategy, CI integration |
| **Phase 60 Notes** | `docs/learning/epic04_saberloop_v1/PHASE60_LEARNING_NOTES.md` | Common issues, gotchas, local testing commands |

### Quick Reference: Playwright

**Run E2E tests:**
```bash
npm run test:e2e              # Run all tests
npm run test:e2e:ui           # Interactive UI mode
```

**Take screenshot in test:**
```javascript
await page.screenshot({ path: 'screenshot.png' });
```

**Common Pitfalls:**
- Selectors must match HTML exactly (`#textInput` vs `#text-input`)
- Use `.trim()` when comparing text content (whitespace from HTML formatting)
- Service worker needs time to install - use `waitForTimeout` before offline tests
- Tests are async - always `await` browser operations

### Quick Reference: Maestro

**Run tests locally (Windows):**
```powershell
# List available emulators
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator" -list-avds

# Start emulator
Start-Process -FilePath "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator" -ArgumentList "-avd AVD_NAME -no-snapshot-load"

# Install APK
adb install "package/Saberloop - Google Play package/Saberloop.apk"

# Run tests
maestro test .maestro/flows/ --test-output-dir .maestro/tests

# Run single test
maestro test .maestro/flows/01-onboarding.yaml --test-output-dir .maestro/tests
```

**Take screenshot in flow:**
```yaml
- takeScreenshot: screenshot-name
```

**Screenshot location:** `.maestro/tests/screenshots/`

**Common Pitfalls (Gotchas from Phase 60):**
1. **Text matching** - Maestro uses regex; escape special chars
2. **Timing** - TWA loads slower than web; may need waits
3. **State persistence** - Can't clear app data easily in tests
4. **Airplane mode** - Flaky in CI; excluded from workflow
5. **APK path** - Spaces in path require proper handling
6. **Windows vs WSL** - Use native Windows Maestro, NOT WSL
7. **Output directory** - Use `--test-output-dir` flag, `config.yaml` setting is ignored
8. **runScript NOT supported** - Requires file path, NOT inline script
9. **runFlow with when** - Can hang; use `optional: true` on tapOn instead
10. **Leave Quiz Dialog** - App shows confirmation dialog when navigating away; handle with `optional: true`

### Existing Screenshots Available

See "Existing Screenshots (Reusable Assets)" section below for full list of:
- Maestro screenshots in `.maestro/tests/screenshots/`
- Docs screenshots in `docs/product-info/screenshots/`

---

## Overview

Increase visitor-to-user conversion by showcasing the full value of Saberloop's features. The current landing page highlights only 4 basic features, missing 9+ powerful capabilities that could convince visitors to try the app.

**Key Goal:** Update landing page to reflect actual product capabilities and increase conversion rate.

---

## What You'll Learn

### New Skills & Concepts

1. **Conversion Optimization** - How to structure landing pages for maximum sign-ups
2. **Feature Prioritization** - Deciding which features to highlight for target audience
3. **Copywriting** - Writing benefit-driven copy that resonates with users
4. **Social Proof** - Using badges, numbers, and testimonials effectively
5. **Visual Hierarchy** - Organizing content for scanning and comprehension
6. **A/B Testing Setup** - Preparing for data-driven improvements
7. **Responsive Design** - Mobile-first approach for landing pages
8. **Image Processing Automation** - Using Sharp (Node.js) for batch resizing, framing, and optimization

---

## Prerequisites

Before starting this phase, you should have:

- ✅ **Phase 30** complete (i18n - multi-language support)
- ✅ **Phase 70** complete (Share feature)
- ✅ **Phase 47** complete (Model selection)
- ✅ Understanding of HTML/CSS for landing pages
- ✅ Access to landing page source code
- ✅ Screenshots of all major features
- ✅ Understanding of user journey (visit → try → install)

---

## Current State Analysis

### What the Landing Page Shows (4 features)
1. AI-Generated Questions
2. Works Offline
3. Privacy First
4. Free to Use

### What's Actually Implemented (but hidden)
| Feature | User Value | Priority | Phase |
|---------|------------|----------|-------|
| **Multi-language support** (EN, PT, ES, FR, DE) | Global reach, native language learning | HIGH | 30 |
| **AI explanations for wrong answers** | Deeper understanding, not just scores | HIGH | 27 |
| **Adaptive difficulty (Continue Topic)** | Progressive learning, mastery path | HIGH | 28 |
| **Share results to social** | Social proof, engagement | MEDIUM | 70 |
| **AI model selection** | Choice, cost control | MEDIUM | 47 |
| **Configurable question count** (5/10/15) | Flexibility, time control | MEDIUM | - |
| **Full quiz history & replay** | Long-term tracking | MEDIUM | - |
| **Grade level customization** | Age-appropriate content | HIGH | - |
| **Progress tracking with score badges** | Motivation, gamification | MEDIUM | - |
| **Usage & cost tracking** | Cost transparency, budget control | MEDIUM | 49 |
| **Data deletion** | Privacy control, GDPR compliance | HIGH | 50 |
| **Cached explanations** | Instant offline explanations | LOW | 51 |

---

## Wireframes

### BEFORE: Current Landing Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Saberloop                              [Try Free]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │                             │  │                         │  │
│  │  Learn Anything,            │  │    ┌─────────────┐      │  │
│  │  Practice Anything          │  │    │             │      │  │
│  │                             │  │    │  Screenshot │      │  │
│  │  AI-powered quizzes on any  │  │    │     #1      │      │  │
│  │  topic...                   │  │    │             │      │  │
│  │                             │  │    └─────────────┘      │  │
│  │  [Google Play] [Download]   │  │                         │  │
│  │  Or try in browser          │  │                         │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      Why Saberloop?                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │    🧠    │ │    📱    │ │    🔒    │ │    🆓    │           │
│  │   AI     │ │ Offline  │ │ Privacy  │ │   Free   │           │
│  │Questions │ │          │ │  First   │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│       4 CARDS IN A ROW (current)                                │
├─────────────────────────────────────────────────────────────────┤
│                      How It Works                               │
│       ┌───┐           ┌───┐           ┌───┐                    │
│       │ 1 │           │ 2 │           │ 3 │                    │
│       └───┘           └───┘           └───┘                    │
│      Enter          Get Quiz        Learn &                    │
│      Topic          Questions       Improve                    │
│                                                                 │
│            3 STEPS (current)                                    │
├─────────────────────────────────────────────────────────────────┤
│                     See It In Action                            │
│           ┌─────────────┐  ┌─────────────┐                     │
│           │ Screenshot  │  │ Screenshot  │                     │
│           │     #1      │  │     #2      │                     │
│           └─────────────┘  └─────────────┘                     │
│                                                                 │
│            2 SCREENSHOTS (current)                              │
├─────────────────────────────────────────────────────────────────┤
│  ████████████████ CTA GRADIENT ████████████████                │
│           Ready to Start Learning?                              │
│      [Google Play] [Download APK]                               │
│           Or try in browser                                     │
├─────────────────────────────────────────────────────────────────┤
│  [Footer: GitHub | Report Issue | Privacy]                      │
└─────────────────────────────────────────────────────────────────┘
```

### AFTER: Improved Landing Page Structure

*Updated 2026-01-03: Includes Phase 49 (Cost Tracking), Phase 50 (Data Deletion)*

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Saberloop                              [Try Free]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │                             │  │                         │  │
│  │  Learn Anything,            │  │    ┌─────────────┐      │  │
│  │  Practice Anything          │  │    │             │      │  │
│  │                             │  │    │  Screenshot │      │  │
│  │  AI-powered quizzes on any  │  │    │ (Quiz view) │      │  │
│  │  topic, in 5 languages,     │  │    │             │      │  │
│  │  with explanations...       │  │    └─────────────┘      │  │
│  │        ▲ ENHANCED SUBTITLE  │  │                         │  │
│  │  [Google Play] [Download]   │  │                         │  │
│  │  Or try in browser          │  │                         │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      Why Saberloop?                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │    🧠    │ │    🌍    │ │    📈    │                        │
│  │    AI    │ │  Multi-  │ │ Adaptive │                        │
│  │ Learning │ │ Language │ │Difficulty│                        │
│  │  + expl  │ │ 🇺🇸🇧🇷🇪🇸🇫🇷🇩🇪│ │          │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │    🎓    │ │    📱    │ │    🔒    │  ◀── UPDATED          │
│  │   All    │ │  Works   │ │Your Data │                        │
│  │  Levels  │ │ Offline  │ │Your Ctrl │  (Phase 50: Delete)   │
│  └──────────┘ └──────────┘ └──────────┘                        │
│       6 CARDS IN 2 ROWS (new layout)                           │
├─────────────────────────────────────────────────────────────────┤
│                      How It Works                               │
│    ┌───┐        ┌───┐        ┌───┐        ┌───┐                │
│    │ 1 │        │ 2 │        │ 3 │        │ 4 │                │
│    └───┘        └───┘        └───┘        └───┘                │
│   Enter       Customize     Take the     Learn From            │
│   Topic        Quiz          Quiz        Mistakes               │
│              (level,       (AI gen)    (explanations           │
│             language)                  + continue)              │
│                                                                 │
│            4 STEPS (new - adds customization + explanation)    │
├─────────────────────────────────────────────────────────────────┤
│                     See It In Action                            │
│   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                  │
│   │ Quiz   │ │Explain │ │Results │ │Settings│                  │
│   │  in    │ │ Modal  │ │  with  │ │ (lang, │                  │
│   │ action │ │        │ │Continue│ │ level) │                  │
│   └────────┘ └────────┘ └────────┘ └────────┘                  │
│                                                                 │
│            4 SCREENSHOTS (expanded)                             │
├─────────────────────────────────────────────────────────────────┤
│                   Share Your Progress            ◀── NEW       │
│           ┌───────────────────────────┐                        │
│           │   📤 Share Card Preview   │                        │
│           │   ┌───────────────────┐   │                        │
│           │   │ I scored 80% on   │   │                        │
│           │   │ "World History"   │   │                        │
│           │   │ quiz on Saberloop │   │                        │
│           │   └───────────────────┘   │                        │
│           │  Challenge friends!       │                        │
│           └───────────────────────────┘                        │
├─────────────────────────────────────────────────────────────────┤
│  ████████████████ CTA GRADIENT ████████████████                │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │     Try Free        │  │  Unlimited Learning │              │
│  │  ─────────────────  │  │  ─────────────────  │              │
│  │  • Sample quizzes   │  │  • Your OpenRouter  │              │
│  │  • No account       │  │  • Choose AI model  │              │
│  │  • Web app link     │  │  • Unlimited quizzes│              │
│  │                     │  │  • See token usage  │  ◀── Phase 49│
│  │  [Try in Browser]   │  │  [Get on Play Store]│              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                 │
│            TWO-COLUMN CTA (new layout)                         │
├─────────────────────────────────────────────────────────────────┤
│  [Footer: GitHub | Report Issue | Privacy]                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Improvement Plan

### Phase 1: Feature Cards Expansion (High Impact)

**Current:** 4 feature cards
**Proposed:** 6 feature cards (replace/reorganize)

Replace current cards with these 6:

1. **🧠 AI-Powered Learning** (keep, enhance)
   - "Unique questions on any topic, with detailed explanations when you get it wrong"

2. **🌍 Learn in Your Language** (NEW)
   - "Quizzes in English, Portuguese, Spanish, French, or German"

3. **📈 Adaptive Difficulty** (NEW)
   - "Continue on any topic with increasing difficulty. Master subjects step by step"

4. **🎓 All Skill Levels** (NEW)
   - "From elementary to college level — questions adapted to your knowledge"

5. **📱 Works Offline** (keep)
   - "Review past quizzes and replay topics even without internet"

6. **🔒 Your Data, Your Control** (enhance from "Privacy First")
   - "All data stays on your device. Delete everything anytime with one tap"
   - *Note: Updated to highlight the Data Deletion feature from Phase 50*

**Remove:** "Free to Use" card (becomes part of CTA section messaging instead)

**Alternative card to consider:**

7. **💰 Cost Transparency** (optional, from Phase 49)
   - "See exactly how many tokens each quiz uses. No surprise charges"
   - *Could replace one of the above if cost is a key user concern*

---

### Phase 2: How It Works Enhancement

**Current:** 3 steps
**Proposed:** 4 steps (add explanation step)

1. **Enter Any Topic** (keep)
   - "Type any subject — history, science, coding, languages, anything!"

2. **Customize Your Quiz** (NEW)
   - "Choose your level, language, and number of questions"

3. **Take the Quiz** (rename from "Get Quiz Questions")
   - "AI generates unique multiple-choice questions instantly"

4. **Learn From Mistakes** (enhance from "Learn & Improve")
   - "Get AI explanations for wrong answers. Continue to master the topic"

---

### Phase 3: New Screenshots

**Current:** 2 screenshots (Welcome, Home)
**Proposed:** 4 screenshots showing key differentiators

1. **Quiz in action** — showing question with progress bar
2. **Explanation modal** — showing AI explanation for wrong answer
3. **Results with Continue button** — showing score + "Continue Topic" option
4. **Settings screen** — showing language/level/model customization

**Action:** Create new screenshots using automated Playwright script (see below)

---

### Phase 4: Social Proof & Engagement Section (NEW)

Add section between Screenshots and CTA:

**"Share Your Progress"**
- Show share card preview (what gets shared to Twitter/Facebook)
- "Challenge friends and track your learning journey"
- Visual: mockup of share card with score

---

### Phase 5: CTA Section Enhancement

**Current:** "Ready to Start Learning?"
**Proposed:** Two-column approach

**Left column: "Try Free"**
- Sample quizzes available immediately
- No account needed
- Web app link prominent

**Right column: "Unlimited Learning"**
- Connect your OpenRouter account
- Choose your AI model
- Generate unlimited quizzes

---

### Phase 6: Quick Wins (CSS/Copy)

1. **Hero subtitle enhancement:**
   - Current: "AI-powered quizzes on any topic you want to master. Free, works offline, and your data stays private."
   - New: "AI-powered quizzes on any topic, in 5 languages, with explanations that help you truly understand. Free to try, works offline."

2. **Add language flags/badges** near "multi-language" feature for visual appeal

3. **Add testimonial/stat placeholder** for future social proof
   - "X quizzes generated" (if we track this)
   - Or prepare section structure for future testimonials

---

## Asset Location

All promotional assets are stored in `docs/product-info/`:

```
docs/product-info/
├── logos/           # App icons, maskable icons (48px to 512px)
├── mockups/         # UI design mockups (Stitch-generated, phase concepts)
├── screenshots/     # Feature screenshots for marketing
│   ├── phase27_*.png      # Explanation modal screenshots
│   ├── phase28_*.png      # Results page screenshots
│   └── landing-*.png      # NEW: Landing page promotional shots
└── quiz-generator-exploration.md
```

This structure was established in **Phase 3.5: Branding & Identity** (see `docs/learning/epic03_quizmaster_v2/PHASE3.5_BRANDING.md`).

---

## Existing Screenshots (Reusable Assets)

**Review completed:** 2026-01-03

### Screenshot Assessment

| Landing Page Need | Source File | Status | Quality | Notes |
|-------------------|-------------|--------|---------|-------|
| **Quiz in action** | `.maestro/tests/screenshots/02-quiz-started.png` | ✅ Ready | Excellent | Shows "Famous Scientists Quiz", progress bar, 4 options, mobile frame with status bar |
| **Results with Continue** | `.maestro/tests/screenshots/03-results-page.png` | ✅ Ready | Excellent | Shows 40% score, Share button, Continue button, wrong answer review |
| **Settings/Customization** | `.maestro/tests/screenshots/06-settings-page.png` | ✅ Ready | Excellent | Shows Grade Level, Questions per Quiz, Language (with flag), OpenRouter connection |
| **Usage Cost Card** | `.maestro/tests/screenshots/08-usage-cost-card.png` | ✅ Ready | Excellent | Shows 60% score, Share button, wrong/correct answers, Continue button |
| **Explanation Modal** | `docs/product-info/screenshots/phase27_explanation_modal.png` | ⚠️ Needs update | Good layout | Shows "Failed to generate explanation" - need one with actual explanation text |
| **Home with History** | `.maestro/tests/screenshots/01-home-with-samples.png` | ✅ Ready | Good | Shows offline banner, Recent Topics with scores, but shows offline state |
| **Perfect Score** | `docs/product-info/screenshots/phase28_results_after.png` | ✅ Ready | Excellent | Desktop view, 100% score, Continue button visible |

### Screenshots to Capture (Missing)

| Need | Description | Suggested Test to Modify |
|------|-------------|-------------------------|
| **Explanation with text** | Modal showing actual AI explanation (not error state) | Add to `03-quiz-results.yaml` or create dedicated test |
| **Home online state** | Home screen without offline banner | Modify `01-onboarding.yaml` |
| **Data deletion modal** | Settings showing "Delete All Data" confirmation | Add to `06-settings.yaml` |

### Format Notes

- **Maestro screenshots**: Mobile format (720x1280), includes Android status bar and browser chrome - ideal for landing page
- **Docs screenshots**: Desktop format (wider), good for showing full UI but need cropping for mobile display
- **Recommendation**: Prefer Maestro screenshots for consistency; crop status bar if needed

### Ready to Use (No Changes Needed)

These 4 screenshots can be processed immediately:

```javascript
// Update CONFIG.includePatterns in process-screenshots.js
includePatterns: [
  '02-quiz-started.png',      // Quiz in action - READY
  '03-results-page.png',      // Results with Continue - READY
  '06-settings-page.png',     // Settings/customization - READY
  '08-usage-cost-card.png',   // Alternative results view - READY
],
```

---

## Automated Image Processing Script

A reusable Node.js script for processing marketing screenshots.

### Setup

```bash
# Install Sharp (high-performance image processing)
npm install --save-dev sharp
```

### Script: `scripts/process-screenshots.js`

```javascript
/**
 * Automated screenshot processor for landing page assets.
 *
 * Features:
 * - Resize to consistent dimensions
 * - Add device frame overlay
 * - Optimize file size
 * - Batch process multiple images
 *
 * Usage:
 *   node scripts/process-screenshots.js
 *   node scripts/process-screenshots.js --input .maestro/tests/screenshots --output landing/images
 *   node scripts/process-screenshots.js --no-frame  # Skip device frame
 *
 * @requires sharp
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  // Input/output directories (can be overridden via CLI)
  inputDir: '.maestro/tests/screenshots',
  outputDir: 'docs/product-info/screenshots/landing',

  // Target dimensions (mobile screenshot)
  targetWidth: 280,
  targetHeight: 560,

  // Device frame settings
  useDeviceFrame: true,
  frameColor: '#1a1a2e', // Match landing page background
  framePadding: 12,
  frameRadius: 24,

  // Optimization
  quality: 85,

  // Files to process (can specify specific files or use wildcard patterns)
  includePatterns: [
    '02-quiz-started.png',
    '03-results-page.png',
    '06-settings-page.png',
    '08-usage-cost-card.png',
  ],
};

/**
 * Add a device frame around the screenshot
 */
async function addDeviceFrame(inputBuffer, options = {}) {
  const {
    padding = CONFIG.framePadding,
    radius = CONFIG.frameRadius,
    frameColor = CONFIG.frameColor
  } = options;

  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  const newWidth = metadata.width + (padding * 2);
  const newHeight = metadata.height + (padding * 2);

  // Create frame with rounded corners
  const frame = Buffer.from(`
    <svg width="${newWidth}" height="${newHeight}">
      <rect x="0" y="0" width="${newWidth}" height="${newHeight}"
            rx="${radius}" ry="${radius}" fill="${frameColor}"/>
    </svg>
  `);

  // Composite: frame background + screenshot
  return sharp(frame)
    .composite([{
      input: inputBuffer,
      top: padding,
      left: padding,
    }])
    .png()
    .toBuffer();
}

/**
 * Process a single screenshot
 */
async function processScreenshot(inputPath, outputPath, options = {}) {
  const {
    width = CONFIG.targetWidth,
    height = CONFIG.targetHeight,
    useFrame = CONFIG.useDeviceFrame,
    quality = CONFIG.quality
  } = options;

  console.log(`Processing: ${path.basename(inputPath)}`);

  // Read and resize
  let buffer = await sharp(inputPath)
    .resize(width, height, {
      fit: 'cover',
      position: 'top',
    })
    .png({ quality })
    .toBuffer();

  // Add device frame if enabled
  if (useFrame) {
    buffer = await addDeviceFrame(buffer);
  }

  // Optimize and save
  await sharp(buffer)
    .png({
      quality,
      compressionLevel: 9,
    })
    .toFile(outputPath);

  const stats = await fs.stat(outputPath);
  console.log(`  → ${path.basename(outputPath)} (${(stats.size / 1024).toFixed(1)} KB)`);
}

/**
 * Process all screenshots in batch
 */
async function processAll() {
  const args = process.argv.slice(2);

  // Parse CLI arguments
  const inputDir = args.includes('--input')
    ? args[args.indexOf('--input') + 1]
    : CONFIG.inputDir;
  const outputDir = args.includes('--output')
    ? args[args.indexOf('--output') + 1]
    : CONFIG.outputDir;
  const useFrame = !args.includes('--no-frame');

  console.log('\n📸 Screenshot Processor');
  console.log('========================');
  console.log(`Input:  ${inputDir}`);
  console.log(`Output: ${outputDir}`);
  console.log(`Frame:  ${useFrame ? 'Yes' : 'No'}`);
  console.log('');

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Get list of files to process
  const files = await fs.readdir(inputDir);
  const toProcess = files.filter(f =>
    CONFIG.includePatterns.some(pattern => f.includes(pattern.replace('.png', '')))
  );

  if (toProcess.length === 0) {
    console.log('No matching files found. Check includePatterns in CONFIG.');
    console.log('Available files:', files.filter(f => f.endsWith('.png')).join(', '));
    return;
  }

  console.log(`Found ${toProcess.length} files to process:\n`);

  // Process each file
  for (const file of toProcess) {
    const inputPath = path.join(inputDir, file);
    const outputName = `landing-${file}`;
    const outputPath = path.join(outputDir, outputName);

    try {
      await processScreenshot(inputPath, outputPath, { useFrame });
    } catch (err) {
      console.error(`  ✗ Error processing ${file}:`, err.message);
    }
  }

  console.log('\n✅ Done!\n');
}

// Run if called directly
if (require.main === module) {
  processAll().catch(console.error);
}

module.exports = { processScreenshot, addDeviceFrame, processAll };
```

### NPM Script

Add to `package.json`:

```json
{
  "scripts": {
    "screenshots:process": "node scripts/process-screenshots.js",
    "screenshots:process:no-frame": "node scripts/process-screenshots.js --no-frame"
  }
}
```

### Usage Examples

```bash
# Process with default settings (Maestro screenshots → landing assets)
npm run screenshots:process

# Process without device frames
npm run screenshots:process:no-frame

# Custom input/output directories
node scripts/process-screenshots.js --input docs/product-info/screenshots --output landing/images

# Process specific Playwright test output
node scripts/process-screenshots.js --input test-results --output landing/images
```

### Customization

Edit `CONFIG.includePatterns` in the script to specify which screenshots to process:

```javascript
includePatterns: [
  '02-quiz-started.png',      // Quiz in progress
  '03-results-page.png',      // Results with score
  '06-settings-page.png',     // Settings screen
  '08-usage-cost-card.png',   // Cost tracking feature
  'phase27_explanation',      // Explanation modal (partial match)
  'phase28_results',          // Results with Continue button
],
```

---

## Automated Screenshot Capture

### Playwright Script for Landing Page Screenshots

Create a new file: `tests/e2e/capture-screenshots.spec.js`

```javascript
import { test } from '@playwright/test';

/**
 * Automated screenshot capture for landing page assets.
 *
 * Run with: npx playwright test tests/e2e/capture-screenshots.spec.js
 *
 * Screenshots will be saved to: public/icons/
 */

// Mobile viewport for app screenshots (matches current landing page images)
const MOBILE_VIEWPORT = { width: 375, height: 667 };
const SCREENSHOT_DIR = 'docs/product-info/screenshots';

// Helper to set up authenticated state (copied from app.spec.js)
async function setupAuthenticatedState(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.evaluate(async () => {
    const dbName = 'quizmaster';
    const dbVersion = 1;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          sessionStore.createIndex('byTopicId', 'topicId');
          sessionStore.createIndex('byTimestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('topics')) {
          const topicStore = db.createObjectStore('topics', { keyPath: 'id' });
          topicStore.createIndex('byName', 'name');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');

        store.put({
          key: 'openrouter_api_key',
          value: { key: 'sk-or-v1-test-key-for-screenshots', storedAt: new Date().toISOString() }
        });
        store.put({ key: 'welcomeScreenVersion', value: '999.0.0' });

        transaction.oncomplete = () => { db.close(); resolve(); };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  });

  await page.goto('/#/');
  await page.waitForSelector('[data-testid="welcome-heading"]', { timeout: 15000 });
}

test.describe('Capture Landing Page Screenshots', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test('1. Quiz in action - Question with progress bar', async ({ page }) => {
    await setupAuthenticatedState(page);

    // Navigate to quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'World History');
    await page.selectOption('#gradeLevelSelect', 'high school');
    await page.click('#generateBtn');

    // Wait for quiz to load
    await page.waitForURL(/#\/quiz/, { timeout: 15000 });
    await page.waitForTimeout(500); // Let animations settle

    // Capture screenshot
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-quiz-action.png`,
      fullPage: false
    });

    console.log('✓ Captured: Quiz in action');
  });

  test('2. Explanation modal - AI explanation for wrong answer', async ({ page }) => {
    await setupAuthenticatedState(page);

    // Complete a quiz with one wrong answer
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Science');
    await page.click('#generateBtn');
    await page.waitForURL(/#\/quiz/, { timeout: 15000 });

    // Answer first question wrong (option 0), rest correct (option 1)
    await page.locator('.option-btn').nth(0).click();
    await page.click('#submitBtn');

    for (let i = 1; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Wait for results page
    await page.waitForURL(/#\/results/);
    await page.waitForTimeout(500);

    // Click the explain button to open modal
    await page.locator('.explain-btn').click();
    await page.waitForSelector('#explanationModal', { state: 'visible' });
    await page.waitForTimeout(800); // Wait for animation + explanation to load

    // Capture screenshot with modal open
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-explanation-modal.png`,
      fullPage: false
    });

    console.log('✓ Captured: Explanation modal');
  });

  test('3. Results with Continue button', async ({ page }) => {
    await setupAuthenticatedState(page);

    // Complete a quiz
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Geography');
    await page.selectOption('#gradeLevelSelect', 'middle school');
    await page.click('#generateBtn');
    await page.waitForURL(/#\/quiz/, { timeout: 15000 });

    // Answer all questions correctly
    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Wait for results page
    await page.waitForURL(/#\/results/);
    await page.waitForTimeout(500);

    // Scroll to show Continue button prominently
    await page.locator('#continueTopicBtn').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Capture screenshot
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-results-continue.png`,
      fullPage: false
    });

    console.log('✓ Captured: Results with Continue button');
  });

  test('4. Settings screen - Language/Level/Model customization', async ({ page }) => {
    // Mock models API for consistent screenshot
    await page.route('**/api/v1/models', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B', context_length: 8192, pricing: { prompt: '0', completion: '0' } },
            { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'DeepSeek R1T2', context_length: 65536, pricing: { prompt: '0', completion: '0' } }
          ]
        })
      });
    });

    await setupAuthenticatedState(page);
    await page.goto('/#/settings');

    // Wait for settings to load
    await page.waitForSelector('[data-testid="settings-title"]');
    await page.waitForTimeout(500);

    // Capture screenshot
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-settings.png`,
      fullPage: false
    });

    console.log('✓ Captured: Settings screen');
  });

  test('5. Home screen with quiz history', async ({ page }) => {
    await setupAuthenticatedState(page);

    // Create a quiz first so there's history
    await page.goto('/#/topic-input');
    await page.fill('#topicInput', 'Mathematics');
    await page.click('#generateBtn');
    await page.waitForURL(/#\/quiz/, { timeout: 15000 });

    for (let i = 0; i < 5; i++) {
      await page.locator('.option-btn').nth(1).click();
      await page.waitForTimeout(200);
      await page.click('#submitBtn');
      await page.waitForTimeout(300);
    }

    // Go back to home
    await page.goto('/#/');
    await page.waitForSelector('[data-testid="welcome-heading"]');
    await page.waitForTimeout(500);

    // Capture screenshot
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/landing-home-history.png`,
      fullPage: false
    });

    console.log('✓ Captured: Home with quiz history');
  });

});
```

### How to Run Screenshot Capture

```bash
# Run the screenshot capture script
npx playwright test tests/e2e/capture-screenshots.spec.js

# Or run with headed browser to see what's happening
npx playwright test tests/e2e/capture-screenshots.spec.js --headed

# Screenshots will be saved to docs/product-info/screenshots/
# - landing-quiz-action.png
# - landing-explanation-modal.png
# - landing-results-continue.png
# - landing-settings.png
# - landing-home-history.png
```

### Post-Processing (Optional)

After capturing, you may want to:

1. **Add device frame** - Use a tool like `mockuphone.com` or ImageMagick to add phone bezels
2. **Optimize file size** - Use `optipng` or `pngquant` to reduce file size
3. **Consistent dimensions** - Ensure all images are the same size (375x667 or scaled)

```bash
# Example: Optimize all new screenshots
for f in docs/product-info/screenshots/landing-*.png; do
  pngquant --quality=80-90 --ext .png --force "$f"
done
```

---

## Animated Demo Video (Playwright)

Video recording is already enabled in `playwright.config.js:12`:

```javascript
video: 'on', // Record video for all tests (for documentation)
```

### Demo Video Script

Add to `tests/e2e/capture-screenshots.spec.js`:

```javascript
test('6. Demo video - Complete user journey', async ({ page }) => {
  await setupAuthenticatedState(page);

  // Start from home - pause to show the UI
  await page.waitForTimeout(1000);

  // Navigate to topic input
  await page.goto('/#/topic-input');
  await page.waitForTimeout(500);

  // Type topic slowly (character by character for visual effect)
  const topic = 'World History';
  for (const char of topic) {
    await page.type('#topicInput', char, { delay: 100 });
  }
  await page.waitForTimeout(500);

  // Select grade level
  await page.selectOption('#gradeLevelSelect', 'high school');
  await page.waitForTimeout(500);

  // Generate quiz
  await page.click('#generateBtn');

  // Show loading state briefly
  await page.waitForURL(/#\/loading/);
  await page.waitForTimeout(1500);

  // Wait for quiz
  await page.waitForURL(/#\/quiz/, { timeout: 15000 });
  await page.waitForTimeout(800);

  // Answer questions with deliberate pauses
  // Get one wrong to show explanation feature
  await page.locator('.option-btn').nth(0).click(); // Wrong answer
  await page.waitForTimeout(400);
  await page.click('#submitBtn');
  await page.waitForTimeout(600);

  // Answer rest correctly
  for (let i = 1; i < 5; i++) {
    await page.locator('.option-btn').nth(1).click();
    await page.waitForTimeout(300);
    await page.click('#submitBtn');
    await page.waitForTimeout(500);
  }

  // Show results
  await page.waitForURL(/#\/results/);
  await page.waitForTimeout(1000);

  // Click explain button to show modal
  await page.locator('.explain-btn').click();
  await page.waitForSelector('#explanationModal', { state: 'visible' });
  await page.waitForTimeout(2000); // Let user read explanation

  // Close modal
  await page.click('#gotItBtn');
  await page.waitForTimeout(800);

  // Show Continue button
  await page.locator('#continueTopicBtn').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  console.log('✓ Captured: Demo video (~30s journey)');
});
```

### How to Generate Demo Video

```bash
# Run just the demo video test
npx playwright test tests/e2e/capture-screenshots.spec.js -g "Demo video"

# Video saved to: test-results/capture-screenshots-6-Demo-video/video.webm

# Convert to MP4 for web (requires ffmpeg)
ffmpeg -i test-results/*/video.webm -c:v libx264 -crf 23 docs/product-info/demo-video.mp4

# Or convert to GIF for landing page (smaller, auto-plays)
ffmpeg -i test-results/*/video.webm -vf "fps=10,scale=320:-1" -loop 0 docs/product-info/demo.gif
```

### Embedding on Landing Page

**Option A: Video element (MP4)**
```html
<video autoplay muted loop playsinline>
  <source src="/app/demo-video.mp4" type="video/mp4">
</video>
```

**Option B: GIF (simpler, auto-plays everywhere)**
```html
<img src="/app/demo.gif" alt="Saberloop app demo" loading="lazy">
```

**Option C: Poster + Play button (saves bandwidth)**
```html
<video poster="/app/demo-poster.png" controls>
  <source src="/app/demo-video.mp4" type="video/mp4">
</video>
```

---

## Implementation Checklist

### Phase 52.0: Setup
- [ ] Create branch: `git checkout -b feature/phase52-landing-page`
- [ ] Create `PHASE52_LEARNING_NOTES.md` file
- [ ] **Commit:** `docs: start Phase 52 - landing page improvements`

---

### Phase 52.1: Screenshot Processing Tool
- [ ] Install Sharp: `npm install --save-dev sharp`
- [ ] Create script: `scripts/process-screenshots.js`
- [ ] Add npm scripts to `package.json`
- [ ] Test script with existing Maestro screenshots
- [ ] **Commit:** `feat(scripts): add screenshot processing tool`
- [ ] Update documentation → move to Phase 52.2

---

### Phase 52.2: Visual Assets

**Review existing screenshots** ✅ COMPLETE (2026-01-03)
- [x] Review Maestro screenshots in `.maestro/tests/screenshots/`
- [x] Review docs screenshots in `docs/product-info/screenshots/`

**Findings:**
| Screenshot | Source | Status |
|------------|--------|--------|
| Quiz in action | `02-quiz-started.png` | ✅ Ready |
| Results + Continue | `03-results-page.png` | ✅ Ready |
| Settings | `06-settings-page.png` | ✅ Ready |
| Usage cost | `08-usage-cost-card.png` | ✅ Ready |
| Explanation modal | `phase27_explanation_modal.png` | ⚠️ Shows error state, needs recapture |

**Create missing screenshots:**
- [x] Quiz question with progress bar → `02-quiz-started.png` ✅ EXISTS
- [ ] Explanation modal with actual text → **NEEDS CAPTURE**
- [x] Results page with Continue button → `03-results-page.png` ✅ EXISTS
- [x] Settings page → `06-settings-page.png` ✅ EXISTS
- [x] Usage cost card → `08-usage-cost-card.png` ✅ EXISTS
- [ ] Optional: Home screen (online state, no offline banner)
- [ ] Optional: Data deletion confirmation modal

**Process screenshots:**
- [ ] Run `npm run screenshots:process`
- [ ] Verify output in `docs/product-info/screenshots/landing/`
- [ ] Copy final assets to `landing/images/`
- [ ] **Commit:** `feat(landing): add processed screenshots for landing page`
- [ ] Update documentation → move to Phase 52.3

---

### Phase 52.3: Feature Cards & Hero
- [ ] Update hero subtitle with enhanced copy
- [ ] Update feature cards (4 → 6) with 3x2 grid layout
- [ ] Add CSS for new grid layout
- [ ] **Commit:** `feat(landing): update feature cards and hero section`
- [ ] Update documentation → move to Phase 52.4

---

### Phase 52.4: How It Works & Screenshots
- [ ] Update "How It Works" steps (3 → 4)
- [ ] Update "See It In Action" with 4 screenshots
- [ ] **Commit:** `feat(landing): update how-it-works and screenshots sections`
- [ ] Update documentation → move to Phase 52.5

---

### Phase 52.5: Share & CTA Sections
- [ ] Add "Share Your Progress" section
- [ ] Enhance CTA section with two-column layout
- [ ] Add CSS for two-column CTA
- [ ] Update tracking data-attributes for new CTAs
- [ ] **Commit:** `feat(landing): add share section and enhanced CTA`
- [ ] Update documentation → move to Phase 52.6

---

### Phase 52.6: Testing & Polish
- [ ] Test on mobile viewport
- [ ] Test on desktop viewport
- [ ] Verify all links work
- [ ] Verify GA tracking events fire
- [ ] **Commit:** `fix(landing): polish and responsive fixes` (if needed)
- [ ] Update documentation

---

### Phase 52.7: Release
- [ ] Deploy to staging (if available) or test locally
- [ ] Create PR to `main`
- [ ] Merge after review
- [ ] Deploy to production
- [ ] Verify live site
- [ ] **Commit:** `docs: complete Phase 52 - landing page improvements`

---

### Phase 52.8: Demo Video & Additional Screenshots (Enhancement)

**Status:** Ready to implement
**Added:** 2026-01-03

This phase adds a demo video and expands the "See It In Action" section with more feature screenshots.

#### Screenshot Assessment

| Need | Existing Screenshot | Status | Notes |
|------|---------------------|--------|-------|
| **Share Results UX** | `03-results-page.png` | Ready | Shows Share Results button, 40% score, Continue button |
| **Explanation Modal** | `phase27_explanation_modal.png` | Needs recapture | Shows "Failed to generate explanation" error |
| **Usage Cost Tracking** | None found | Needs capture | Need screenshot showing token/cost info after quiz |

#### Screenshots to Capture

1. **Explanation Modal with actual text**
   - Run a quiz with real API connection (or mock with valid response)
   - Click info button on wrong answer
   - Capture modal showing "Why it's [correct answer]" with actual explanation text
   - **Source:** Playwright test or manual capture

2. **Usage Cost Tracking**
   - Complete a quiz with OpenRouter connected
   - Results page should show token usage (if visible) OR
   - Settings page showing usage stats OR
   - Need to verify where cost info is displayed in the app

#### Implementation Checklist

**Screenshots:**
- [ ] Process `03-results-page.png` for Share UX → `landing-share-results.png`
- [ ] Capture new explanation modal screenshot with actual explanation text
- [ ] Capture usage cost tracking screenshot (verify location in app first)
- [ ] Process new screenshots with device frames
- [ ] Copy to `landing/images/`

**Update Landing Page HTML:**
- [ ] Add Share Results screenshot to "See It In Action" grid
- [ ] Add Explanation Modal screenshot
- [ ] Add Usage Cost screenshot (if captured)
- [ ] Update grid CSS if needed (4 → 6 or 7 images)

**Demo Video:**
- [ ] Create Playwright test for demo video (`tests/e2e/capture-demo-video.spec.js`)
- [ ] Record ~30s user journey:
  1. Home screen (1s)
  2. Enter topic "World History" (2s typing)
  3. Select grade level (1s)
  4. Generate quiz (loading 2s)
  5. Answer questions (10s - mix of right/wrong)
  6. View results (2s)
  7. Click explanation button (2s)
  8. View explanation modal (3s)
  9. Close modal, show Continue button (2s)
- [ ] Convert webm → mp4 (or gif for auto-play)
- [ ] Add video/gif to hero section or "See It In Action"
- [ ] **Commit:** `feat(landing): add demo video and additional screenshots`

#### Video Options

**Option A: Hero section replacement**
Replace static hero image with auto-playing video/gif showing the app in action.

**Option B: Dedicated demo section**
Add video between Screenshots and Share sections.

**Option C: Inline in Screenshots section**
Replace one screenshot slot with the video.

**Recommendation:** Option A (hero) for maximum impact, or Option B for less intrusive.

---

## Success Metrics

Track in Google Analytics (already set up):
- **Click-through rate** on "Try in browser" vs Play Store vs APK
- **Scroll depth** (existing) — expect higher with more content
- **Time on page** — should increase with more compelling content
- **Bounce rate** — should decrease

---

## Out of Scope (Future Considerations)

1. **Interactive demo** — embedded mini-quiz on landing page
2. **A/B testing** — test different value propositions
3. **Localized landing pages** — landing page in PT, ES, FR, DE
4. **PWA install prompt on landing page** — for web visitors
