# Phase 52: Landing Page Improvements - Learning Notes

**Started:** January 3, 2026
**Status:** Phase 52.8 complete - Demo video and additional screenshots added

---

## Summary

Update the landing page to showcase all implemented features (13+) and increase visitor-to-user conversion. Currently only 4 features are highlighted.

## Session Log

### Session 1: Planning (January 3, 2026)

**What was accomplished:**
- Reviewed and updated Phase 52 plan with new features from Phase 49, 50, 51
- Completed screenshot assessment (reviewed existing Maestro and docs screenshots)
- Found 4 screenshots ready to use, 1 needs recapture (explanation modal)
- Added automated image processing script (Sharp) to the plan
- Organized implementation into 8 subphases (52.0-52.7)
- Added branching strategy and commit guidelines
- Added subphase progress tracking protocol
- Added reference section for Playwright & Maestro with common pitfalls
- Updated wireframes to include Phase 49/50 features

**Key Decisions:**
1. **Reuse existing screenshots** from Maestro tests instead of capturing new ones
2. **Automate image processing** with Sharp (Node.js) for resize, frame, optimize
3. **Privacy card** renamed to "Your Data, Your Control" to highlight data deletion feature
4. **Cost tracking** added to CTA section bullet points

**Screenshots Assessment:**

| Screenshot | Source | Status |
|------------|--------|--------|
| Quiz in action | `02-quiz-started.png` | Ready |
| Results + Continue | `03-results-page.png` | Ready |
| Settings | `06-settings-page.png` | Ready |
| Usage cost | `08-usage-cost-card.png` | Ready |
| Explanation modal | `phase27_explanation_modal.png` | Needs recapture (shows error) |

**What's Next (Session 2):**
1. Create branch: `feature/phase52-landing-page`
2. Phase 52.1: Create screenshot processing script
3. Phase 52.2: Process visual assets

### Session 2: Implementation (January 3, 2026)

**What was accomplished:**
- Implemented all subphases (52.0-52.7)
- Created PR #73

**Things That Didn't Work & How They Were Fixed:**

1. **CommonJS vs ES Modules confusion**
   - **Problem:** Plan showed `require('sharp')` but project uses `"type": "module"` in package.json
   - **Tried:** Initially considered using ES module syntax
   - **Fix:** Checked existing scripts, found project uses `.cjs` extension for CommonJS scripts (like `deploy-ftp.cjs`). Created `process-screenshots.cjs` to match the pattern.

2. **Screenshot path mismatch**
   - **Problem:** Processed screenshots saved to `docs/product-info/screenshots/landing/` but landing page HTML referenced `images/` relative path
   - **Fix:** Had to copy processed screenshots to `landing/images/` folder so relative paths would work when deployed

3. **File:// protocol breaks absolute paths**
   - **Problem:** When testing with Playwright using `file:///` protocol, images with absolute paths like `/app/icons/` showed broken image icons (alt text visible)
   - **Learning:** This is expected - absolute paths resolve to `file:///C:/app/icons/` which doesn't exist. In production on the web server, these paths work correctly. The new screenshots in `images/` folder use relative paths and loaded fine.

4. **Missing responsive breakpoint for 4-column grid**
   - **Problem:** Changed "How It Works" from 3 to 4 steps, but original CSS only had responsive rules for 3 columns
   - **Fix:** Added `@media (max-width: 1024px)` rule to make steps 2x2 on tablet before going to single column on mobile

5. **Sharp PNG quality parameter**
   - **Tried:** `sharp().png({ quality: 85 })`
   - **Learning:** Sharp's PNG quality option works differently than JPEG - PNG is lossless. The `quality` affects zlib compression, not visual quality. Used `compressionLevel: 9` for best file size.

**Key Implementation Decisions:**

1. **Device frames via SVG composite** - Created SVG rectangles with rounded corners as background, then composited screenshots on top. Simple and effective.

2. **Skipped explanation modal recapture** - Existing screenshot shows error state, but decided to proceed with 4 good screenshots rather than block on capturing a new one. Can be added later.

3. **Two-column CTA with feature differentiation** - "Try Free" emphasizes no-commitment browser experience, "Unlimited Learning" emphasizes power user features including cost tracking.

---

## New Skills & Concepts

### 1. Sharp (Image Processing Library)

**What it is:** High-performance Node.js image processing library

**Why we chose it:**
- Fast and efficient (uses libvips)
- Cross-platform (Windows, Mac, Linux)
- Supports resize, crop, composite (for device frames)
- Built-in optimization

**Key operations we'll use:**
```javascript
const sharp = require('sharp');

// Resize
await sharp(input).resize(280, 560).toFile(output);

// Add device frame (composite)
await sharp(frame).composite([{ input: screenshot }]).toFile(output);

// Optimize
await sharp(input).png({ quality: 85, compressionLevel: 9 }).toFile(output);
```

### 2. Landing Page Conversion Optimization

**Key principles learned during planning:**
- Highlight features users actually care about (not just technical features)
- Use benefit-driven copy ("Learn from mistakes" not "AI explanations")
- Show, don't tell (screenshots > text descriptions)
- Clear call-to-action hierarchy (Try Free vs Unlimited)

### 3. Feature Prioritization

**From 13+ features, selected 6 for feature cards:**
1. AI-Powered Learning (+ explanations)
2. Learn in Your Language (5 languages)
3. Adaptive Difficulty
4. All Skill Levels
5. Works Offline
6. Your Data, Your Control (privacy + deletion)

**Criteria used:**
- User value (what problems does it solve?)
- Differentiation (what makes Saberloop unique?)
- Visual appeal (can we show it in a screenshot?)

---

## Files Modified This Session

| File | Change |
|------|--------|
| `docs/learning/epic05/PHASE52_LANDING_PAGE.md` | Major updates: Phase 49/50/51 features, screenshot assessment, Sharp script, subphases, branching, Playwright/Maestro reference |
| `CLAUDE.md` | Updated status: Epic 05 current, Phase 52 in progress |
| `docs/learning/epic05/PHASE52_LEARNING_NOTES.md` | Created (this file) |

---

## Gotchas & Tips

### From Screenshot Assessment

1. **Maestro screenshots include device chrome** (status bar, browser bar) - may need to crop for cleaner marketing images
2. **Existing explanation modal screenshot shows error state** - needs to be recaptured with actual explanation text
3. **Maestro output directory** - Use `--test-output-dir` flag, config.yaml setting is ignored

### From Implementation

1. **Use `.cjs` extension for CommonJS scripts** - Project has `"type": "module"` so regular `.js` files are ES modules. Use `.cjs` for scripts that need `require()`.

2. **Landing page paths are relative to `landing/`** - When deployed, the landing page is at the root. Assets should be in `landing/images/` not `docs/`.

3. **Test with both desktop and mobile viewports** - CSS grid changes significantly between breakpoints. Use Playwright's `setViewportSize()` to test both.

4. **Sharp's PNG compression** - For PNGs, use `compressionLevel` (0-9) not `quality`. Higher = smaller file but slower encoding.

5. **SVG strings in Sharp** - Can create device frames by passing SVG as a Buffer: `Buffer.from('<svg>...</svg>')`. Works great for simple shapes with rounded corners.

### For Future Reference

1. **Create branch first** before any code changes
2. **Commit after each subphase** - don't batch multiple changes
3. **Update documentation** before moving to next subphase
4. **Test locally with file:// has limitations** - Absolute paths won't work. Deploy to staging for full testing.

---

## Resources

- **Phase 52 Plan:** `docs/learning/epic05/PHASE52_LANDING_PAGE.md`
- **Playwright Reference:** `docs/learning/epic01_infrastructure/PHASE4.4_E2E_TESTING.md`
- **Maestro Reference:** `docs/learning/epic04_saberloop_v1/PHASE60_LEARNING_NOTES.md`
- **Current Landing Page:** `landing/index.html`
- **Maestro Screenshots:** `.maestro/tests/screenshots/`

---

## Progress Tracking

- [x] Phase 52 Plan Review & Update
- [x] Screenshot Assessment
- [x] Sharp Script Design
- [x] Subphase Organization
- [x] Documentation & Learning Notes
- [x] Phase 52.0: Setup (branch, learning notes)
- [x] Phase 52.1: Screenshot Processing Tool
- [x] Phase 52.2: Visual Assets
- [x] Phase 52.3: Feature Cards & Hero
- [x] Phase 52.4: How It Works & Screenshots
- [x] Phase 52.5: Share & CTA Sections
- [x] Phase 52.6: Testing & Polish
- [x] Phase 52.7: Release (PR #73 created)
- [x] Phase 52.8: Demo Video & Additional Screenshots

### Session 3: Phase 52.8 Enhancement (January 4, 2026)

**What was accomplished:**
- Captured 3 new screenshots with Playwright: explanation modal, share results, usage cost
- Recorded demo video (~30s user journey walkthrough)
- Added demo video to hero section (replaces static image)
- Expanded "See It In Action" to 5 screenshots
- Updated process-screenshots.cjs to handle new screenshot patterns

**Things That Didn't Work & How They Were Fixed:**

1. **Explanation modal test failing on "Loading" check**
   - **Problem:** Test waited for explanation content by checking `not.toContainText('Loading')`, but the modal shows both explanations and a "Loading personalized feedback..." spinner simultaneously
   - **Tried:** `await expect(page.locator('#explanationContent')).not.toContainText('Loading');`
   - **Fix:** Changed to wait for actual explanation text instead: `await expect(page.locator('text=The correct answer is')).toBeVisible({ timeout: 10000 });`

2. **Test results cleaned up between test runs**
   - **Problem:** Ran explanation modal test after demo video test, and Playwright cleaned up the video file
   - **Learning:** Playwright deletes test-results folder on each run. Need to copy video immediately after capture, or re-run the video test.
   - **Fix:** Re-ran demo video test after all other tests completed

3. **ffmpeg not available for video conversion**
   - **Problem:** Plan called for converting webm to mp4 using ffmpeg, but ffmpeg not installed
   - **Tried:** `where ffmpeg` - not found
   - **Fix:** Used webm directly - modern browsers (Chrome, Firefox, Edge, Safari 15+) all support webm. Added fallback poster image for older browsers.

4. **Screenshot patterns not matching new files**
   - **Problem:** process-screenshots.cjs was looking for Maestro patterns like `02-quiz-started.png` but new files were `landing-*.png`
   - **Fix:** Updated CONFIG.includePatterns to include both Maestro and Playwright-captured patterns. Also added logic to avoid double-prefixing files already named `landing-*.png`.

5. **Video not styled correctly**
   - **Problem:** CSS selector `.hero-image img` didn't apply to video element
   - **Fix:** Updated selector to `.hero-image img, .hero-image video` in both main styles and responsive breakpoint

**Key Implementation Decisions:**

1. **Use webm video directly** - No conversion to mp4 needed. WebM has excellent browser support and smaller file size. Added poster attribute for fallback.

2. **Video attributes for auto-play** - Used `autoplay muted loop playsinline` - all required for auto-playing video on mobile without user interaction.

3. **Screenshot order in grid** - Reorganized to: Quiz → Explanation → Share → Usage Cost → Settings. This follows the user journey flow.

**New Files Created:**
- `tests/e2e/capture-landing-assets.spec.js` - Playwright tests for capturing screenshots and video
- `landing/images/demo.webm` - Demo video (~695KB)
- `landing/images/landing-explanation-modal.png` - Explanation modal screenshot
- `landing/images/landing-share-results.png` - Share results screenshot
- `landing/images/landing-usage-cost.png` - Usage cost screenshot
