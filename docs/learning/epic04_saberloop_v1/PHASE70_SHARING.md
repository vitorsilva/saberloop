# Phase 70: Sharing Feature

**Epic:** 4 - Saberloop V1
**Status:** ✅ Complete
**Priority:** High (iOS App Store preparation + User request)
**Related Issues:** [#11](https://github.com/vitorsilva/saberloop/issues/11)
**Branch:** `feature/phase-70-sharing`
**Completed:** 2025-12-27

---

## Overview

Add comprehensive sharing functionality to Saberloop, allowing users to share their quiz achievements on social media and messaging apps. This feature directly addresses user feedback (Issue #11).

### Goals (V1 - This Phase)
1. **Share FROM**: Users can share their quiz results with text, link, and image
2. **Deep Links**: Recipients can click link to start quiz on same topic

### Deferred to V2 (Parked)
See [PHASE70_V2_SHARING_FEATURES.md](../parking_lot/PHASE70_V2_SHARING_FEATURES.md) for:
- Achievement level system
- "Challenge a friend" with same questions
- Share TO functionality (iOS)
- Social platform optimization
- Share analytics

---

## Codebase Analysis (Current State)

### Existing Patterns to Follow

**Modal Components:**
- `ExplanationModal.js` - Bottom sheet pattern with animation
- `ConnectModal.js` - Centered modal with backdrop
- Pattern: Promise-based, append to body, handle backdrop click

**Utility Files:**
- Located in `src/utils/`
- Follow JSDoc patterns from Phase 48
- Include corresponding `.test.js` files

**Feature Flags:**
- `src/core/features.js` - Add `SHARE_FEATURE` flag
- Allows gradual rollout

**i18n:**
- Add keys to `public/locales/{lang}.json`
- Use `t('share.keyName')` pattern

**ResultsView.js:**
- Share button placement: After score card, before question review
- Follow existing button patterns (primary/secondary styling)

---

## Implementation Plan

### Branch Strategy
```
main → feature/phase-70-sharing
```

Merge back to main after all tests pass.

### Sub-Phase Breakdown

---

### Phase 70.1: Feature Flag & Share Utilities (Session 1)

**Commit 1: Add feature flag**
```javascript
// src/core/features.js
SHARE_FEATURE: {
  phase: 'ENABLED',
  description: 'Share quiz results to social media'
}
```

**Commit 2: Create share utility module**
```
src/utils/share.js
src/utils/share.test.js
```

Functions:
- `canShare()` - Check Web Share API support
- `shareText(title, text, url)` - Share via Web Share API
- `shareWithFallback(data)` - Fallback to clipboard
- `copyToClipboard(text)` - Clipboard API wrapper

**Commit 3: Add i18n keys**
```json
{
  "share": {
    "button": "Share Results",
    "copied": "Copied to clipboard!",
    "copyLink": "Copy Link",
    "shareVia": "Share via...",
    "title": "Share Your Score",
    "message": "I scored {{score}}/{{total}} ({{percentage}}%) on {{topic}}! Can you beat my score?",
    "challengeText": "Can you beat my score?"
  }
}
```

**Tests:**
- Unit tests for all share utility functions
- Mock `navigator.share` and `navigator.clipboard`

---

### Phase 70.2: Share Image Generation (Session 2)

**Commit 4: Create image generator utility**
```
src/utils/share-image.js
src/utils/share-image.test.js
```

Functions:
- `generateShareImage(options)` - Returns PNG blob
  - Options: topic, score, total, percentage
- Canvas dimensions: 600x400 (social-friendly)

Image content:
- Gradient background (brand colors)
- "SABERLOOP" logo badge
- Topic name
- Score display (X/Y - Z%)
- "Can you beat my score?" challenge text

**Tests:**
- Canvas rendering (mock canvas context)
- Blob generation

---

### Phase 70.3: Share Modal Component (Session 3)

**Commit 5: Create ShareModal component**
```
src/components/ShareModal.js
```

Features:
- Bottom sheet (like ExplanationModal)
- Achievement card preview (using canvas image)
- Quick share buttons: Twitter/X, Facebook, Copy Link
- "More Options" → Native share sheet
- Close on backdrop click / escape key

Pattern:
```javascript
export function showShareModal({ topic, score, total, percentage }) {
  return new Promise((resolve) => {
    // Create modal, handle events, resolve on close
  });
}
```

**Commit 6: Add ShareModal tests**
- E2E test for modal opening/closing
- Test share button interactions

---

### Phase 70.4: ResultsView Integration (Session 4)

**Commit 7: Add Share button to ResultsView**
- Position: After score card, before "Review Your Answers"
- Styling: Secondary button (outline style)
- Feature flag check: `isFeatureEnabled('SHARE_FEATURE')`

**Commit 8: Wire up share flow**
- Click handler → Show ShareModal
- Pass quiz data (topic, score, total, percentage)
- Track telemetry: `share_initiated`, `share_completed`

**Tests:**
- E2E: Share button visibility
- E2E: Modal opens on click
- E2E: Share actions work

---

### Phase 70.5: Deep Link Handling (Session 5)

**Commit 9: Parse URL query params on app load**
```javascript
// src/main.js or new src/utils/deep-link.js
function handleDeepLinks() {
  const params = new URLSearchParams(window.location.search);
  const topic = params.get('topic');
  if (topic) {
    state.set('prefilledTopic', decodeURIComponent(topic));
    // Clear query params from URL
    window.history.replaceState({}, '', window.location.pathname + window.location.hash);
  }
}
```

**Commit 10: Pre-fill topic in TopicInputView**
- Check `state.get('prefilledTopic')` on render
- Auto-fill input if present
- Clear after use

**Tests:**
- E2E: URL with `?topic=History` pre-fills input
- E2E: Topic cleared after use

---

### Phase 70.6: Polish & Final Testing (Session 6)

**Commit 11: Cross-browser testing & fixes**
- Chrome (desktop/mobile)
- Firefox (clipboard fallback)
- Safari
- Android WebView (TWA)

**Commit 12: Architecture test compliance**
- Run `npm run arch:test`
- Ensure new files follow dependency rules

**Commit 13: Documentation update**
- Update PHASE70_SHARING.md with completion status
- Add any learnings/notes

---

## File Changes Summary

### New Files
```
src/utils/share.js              # Share API utilities
src/utils/share.test.js         # Share utility tests
src/utils/share-image.js        # Canvas image generator
src/utils/share-image.test.js   # Image generator tests
src/components/ShareModal.js    # Share options modal
tests/e2e/share.spec.js         # E2E tests for share flow
```

### Modified Files
```
src/core/features.js            # Add SHARE_FEATURE flag
src/views/ResultsView.js        # Add share button
src/main.js                     # Deep link handling
src/views/TopicInputView.js     # Pre-fill topic from deep link
public/locales/en.json          # English share translations
public/locales/pt-PT.json       # Portuguese share translations
public/locales/es.json          # Spanish share translations
public/locales/fr.json          # French share translations
public/locales/de.json          # German share translations
```

---

## Technical Details

### Web Share API Usage
```javascript
if (navigator.share) {
  await navigator.share({
    title: 'Saberloop Quiz',
    text: 'I scored 4/5 (80%) on History!',
    url: 'https://saberloop.com/app/?topic=History',
    files: [imageBlob] // Optional: achievement card image
  });
}
```

### Canvas Image Generation
```javascript
async function generateShareImage({ topic, score, total, percentage }) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 600, 400);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 400);

  // Logo, text, etc...

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}
```

### Deep Link URL Format
```
https://saberloop.com/app/?topic=World%20History
```

---

## Share Message Template

```
🏆 {Topic} Quiz Master!
I scored {score}/{total} ({percentage}%) on Saberloop!
Can you beat my score?

Try it: https://saberloop.com/app/?topic={encoded_topic}
```

---

## Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Android WebView |
|---------|--------|---------|--------|-----------------|
| Web Share API | ✅ | ❌ | ✅ (15+) | ✅ |
| Web Share + Files | ✅ | ❌ | ✅ (15+) | ✅ |
| Canvas toBlob | ✅ | ✅ | ✅ | ✅ |
| Clipboard API | ✅ | ✅ | ✅ | ✅ |

**Strategy:** Use Web Share API where available, fall back to clipboard + toast.

---

## Success Criteria

### Must Have (V1)
- [x] Share button visible on Results screen (feature flagged)
- [x] Can share text + link via Web Share API
- [x] Fallback to clipboard works on Firefox
- [x] Deep links open app with topic pre-filled
- [x] Generated achievement card image
- [x] Share modal with preview
- [x] All existing tests pass
- [x] New unit tests (33 tests added: 21 share.js + 12 share-image.js)
- [x] New E2E tests for share flow
- [x] JSDoc on all new functions
- [x] Architecture tests pass
- [x] i18n for 2 supported languages (en, pt-PT - only languages in project)

### Nice to Have (V1)
- [x] Social platform quick-share buttons (Twitter/X, Facebook)
- [x] Toast notification for clipboard copy
- [x] Share count tracking (telemetry)

---

## Quality Checklist

Before each commit:
- [x] `npm test -- --run` passes (290 tests)
- [x] `npm run typecheck` passes
- [x] `npm run arch:test` passes

Before merge:
- [x] `npm run test:e2e` passes (45 passed, 1 skipped)
- [x] `npm run build` succeeds
- [ ] Manual testing on mobile (Android) - Pending deployment

---

## Estimated Timeline

| Phase | Sessions | Description |
|-------|----------|-------------|
| 70.1 | 1 | Feature flag + share utilities |
| 70.2 | 1 | Image generation |
| 70.3 | 1 | Share modal component |
| 70.4 | 1 | ResultsView integration |
| 70.5 | 1 | Deep link handling |
| 70.6 | 1 | Polish & testing |
| **Total** | **6** | **Full V1 implementation** |

---

## References

- [Web Share API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [Web Share API - web.dev](https://web.dev/web-share/)
- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Issue #11](https://github.com/vitorsilva/saberloop/issues/11)
- [V2 Features (Parked)](../parking_lot/PHASE70_V2_SHARING_FEATURES.md)

---

## Implementation Summary

### Commits (feature/phase-70-sharing branch)
1. `feat(share): add SHARE_FEATURE flag`
2. `feat(share): add share utility module with tests`
3. `feat(share): add i18n keys for sharing feature`
4. `feat(share): add share image generator with Canvas API`
5. `feat(share): add ShareModal component`
6. `feat(share): integrate share button in ResultsView`
7. `feat(share): add deep link handling for shared URLs`
8. `test(share): add E2E tests for share feature`

### Files Created
- `src/utils/share.js` - Share API utilities (175 lines)
- `src/utils/share.test.js` - 21 unit tests
- `src/utils/share-image.js` - Canvas image generator (200 lines)
- `src/utils/share-image.test.js` - 12 unit tests
- `src/components/ShareModal.js` - Bottom sheet modal (236 lines)
- `tests/e2e/share.spec.js` - E2E tests

### Files Modified
- `src/core/features.js` - Added SHARE_FEATURE flag
- `src/views/ResultsView.js` - Added share button and handler
- `src/main.js` - Added deep link handling
- `src/views/TopicInputView.js` - Added prefilled topic support
- `public/locales/en.json` - English translations
- `public/locales/pt-PT.json` - Portuguese translations

### Telemetry Events Added
- `share_modal_opened` - When share modal opens
- `share_completed` - When share succeeds (method: native/clipboard/twitter/facebook)
- `share_cancelled` - When user cancels share
- `share_failed` - When share fails
- `deep_link_opened` - When user opens shared link
- `share_initiated` - When share button clicked

---

**Last Updated:** 2025-12-27
**Status:** ✅ Complete
