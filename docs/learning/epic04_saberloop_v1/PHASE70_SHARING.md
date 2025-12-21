# Phase 70: Sharing Feature

**Epic:** 4 - Saberloop V1
**Status:** Ready for Implementation
**Priority:** High (iOS App Store preparation + User request)
**Related Issues:** [#11](https://github.com/vitorsilva/saberloop/issues/11)

---

## Overview

Add comprehensive sharing functionality to Saberloop, allowing users to share their quiz achievements on social media and messaging apps. This feature directly addresses user feedback (Issue #11) and prepares the app for iOS App Store submission where "Share TO" functionality can differentiate the app from a simple web wrapper.

### Goals
1. **Share FROM** (V1 - This Phase): Users can share their quiz results
2. **Share TO** (V2 - Future/iOS): Users can receive shared content to create quizzes

### What Users Will Be Able To Do
- Complete a quiz → tap "Share Results" → see achievement card preview → share to social/messaging apps
- Recipients see an attractive image + message with a link to try the same topic

---

## User Experience Flow

Based on Google Stitch mockups:

```
┌─────────────────────────────────────────────────────────────────┐
│                        RESULTS SCREEN                           │
│                                                                 │
│                          ┌──────┐                               │
│                          │ 80%  │                               │
│                          └──────┘                               │
│                        Great Job!                               │
│              You answered 4 out of 5 correctly.                 │
│                                                                 │
│              ┌─────────────────────────┐                        │
│              │     Share Results       │  ← NEW BUTTON          │
│              └─────────────────────────┘                        │
│                                                                 │
│                   Review Your Answers                           │
│                        [...]                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SHARE OPTIONS MODAL                          │
│                                                                 │
│     ┌───────────────────────────────────────┐                   │
│     │  🏆 SABERLOOP           Level 5       │                   │
│     │                                       │                   │
│     │      History Quiz Master!             │                   │
│     │      I scored 4/5 (80%)               │                   │
│     │      Can you beat my score?           │                   │
│     └───────────────────────────────────────┘                   │
│                                                                 │
│                   SHARE TO SOCIAL                               │
│          [X]    [Facebook]    [Stories]                         │
│                                                                 │
│              ┌─────────────────────────┐                        │
│              │       Copy Link         │                        │
│              └─────────────────────────┘                        │
│              ┌─────────────────────────┐                        │
│              │      More Options       │ ← Native share sheet   │
│              └─────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  (Native Share Sheet OR
                   Direct social share)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SHARE CONFIRMATION                            │
│                                                                 │
│                         ✓                                       │
│                                                                 │
│                Shared Successfully!                             │
│         Your friends can now see your score.                    │
│                                                                 │
│              ┌─────────────────────────┐                        │
│              │          Done          │                         │
│              └─────────────────────────┘                        │
│                 Share to another app                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Architecture

### Share Content Components

| Component | Description | Technical Approach |
|-----------|-------------|-------------------|
| **Text** | Achievement message | Template string with dynamic values |
| **Link** | Topic-specific URL | `saberloop.com/app/?topic={encoded_topic}` |
| **Image** | Achievement card | Canvas API → PNG blob |

### Share Methods

1. **Web Share API** (Primary)
   - Modern browsers + Android Chrome/WebView
   - Supports text, URL, and files (images)
   - Native share sheet experience

2. **Platform-Specific URLs** (Fallback for specific social)
   - Twitter/X: `https://twitter.com/intent/tweet?text={text}&url={url}`
   - Facebook: `https://www.facebook.com/sharer/sharer.php?u={url}&quote={text}`

3. **Clipboard + Toast** (Final fallback)
   - Copy text + link to clipboard
   - Show "Copied!" toast notification

### Image Generation

Generate achievement card using Canvas API:

```javascript
// Pseudocode for image generation
async function generateShareImage(quizData) {
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

  // Logo badge
  ctx.fillStyle = '#FF6B35';
  // ... draw rounded rect with "SABERLOOP"

  // Achievement level badge
  // ... "Level X" based on total quizzes completed

  // Trophy icon
  // ... using emoji or icon font

  // Title: "{Topic} Quiz Master!"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Inter';
  ctx.fillText(`${topic} Quiz Master!`, ...);

  // Score: "I scored X/Y (Z%)"
  ctx.font = '24px Inter';
  ctx.fillText(`I scored ${score}/${total} (${percentage}%)`, ...);

  // Challenge text
  ctx.fillStyle = '#888888';
  ctx.font = '18px Inter';
  ctx.fillText('Can you beat my score?', ...);

  // Return as blob
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}
```

---

## Implementation Plan

### Phase 70.1: Core Infrastructure
**Estimated effort:** 1-2 sessions

1. **Create share utility module** (`src/utils/share.js`)
   - Web Share API detection
   - Share with text/URL/image
   - Fallback to clipboard
   - Platform detection

2. **Create image generator** (`src/utils/share-image.js`)
   - Canvas-based achievement card
   - Dynamic content rendering
   - Return PNG blob

3. **Add share tests**
   - Unit tests for share utilities
   - Mock Web Share API

### Phase 70.2: UI Components
**Estimated effort:** 1-2 sessions

1. **Share button on ResultsView**
   - Positioned below score card
   - Icon + "Share Results" text
   - Match existing design system

2. **Share modal component** (`src/components/ShareModal.js`)
   - Achievement card preview
   - Social buttons row (optional - can simplify to just native share)
   - "Copy Link" button
   - "More Options" → native share sheet
   - Close button

3. **Success toast/confirmation**
   - Brief "Shared!" feedback
   - Auto-dismiss after 2 seconds

### Phase 70.3: Deep Link Handling
**Estimated effort:** 1 session

1. **Parse URL query params on app load**
   - Check for `?topic=` parameter
   - Pre-fill topic input if present

2. **Update topic input flow**
   - Support receiving topic from URL
   - Skip to quiz generation if topic provided

3. **Test deep link scenarios**
   - Direct link opening
   - PWA installed vs browser
   - Android TWA behavior

### Phase 70.4: Polish & Testing
**Estimated effort:** 1 session

1. **E2E tests for share flow**
   - Share button visibility
   - Modal interactions
   - Deep link navigation

2. **Cross-browser testing**
   - Chrome (desktop/mobile)
   - Firefox (no Web Share API → fallback)
   - Safari
   - Android WebView (TWA)

3. **Analytics events** (if telemetry enabled)
   - `share_initiated`
   - `share_completed`
   - `share_method` (native/twitter/facebook/clipboard)

---

## File Changes Summary

### New Files
```
src/utils/share.js           # Share API utilities
src/utils/share-image.js     # Canvas image generator
src/components/ShareModal.js # Share options modal
tests/unit/share.test.js     # Unit tests
tests/e2e/share.spec.js      # E2E tests
```

### Modified Files
```
src/views/ResultsView.js     # Add share button
src/main.js                  # Deep link handling on startup
vite.config.js              # (optional) Add share_target to manifest
```

---

## Share Message Templates

### Default Share Text
```
🏆 {Topic} Quiz Master!
I scored {score}/{total} ({percentage}%) on Saberloop!
Can you beat my score?

Try it: https://saberloop.com/app/?topic={encoded_topic}
```

### Twitter-Optimized (280 chars max)
```
🏆 I scored {score}/{total} ({percentage}%) on "{topic}" - Saberloop Quiz!
Can you beat my score? 👇
https://saberloop.com/app/?topic={encoded_topic}
```

### Image Alt Text (Accessibility)
```
Saberloop achievement card showing {score}/{total} ({percentage}%)
score on {topic} quiz
```

---

## Achievement Level System (Optional Enhancement)

Based on mockup showing "Level 5" badge:

| Level | Requirement | Badge Color |
|-------|-------------|-------------|
| 1 | First quiz completed | Bronze |
| 2 | 5 quizzes completed | Bronze |
| 3 | 10 quizzes completed | Silver |
| 4 | 25 quizzes completed | Silver |
| 5 | 50 quizzes completed | Gold |
| 6 | 100 quizzes completed | Gold |
| 7+ | 100+ quizzes | Platinum |

**Note:** This is optional for V1. Can show "New Player" or omit level entirely.

---

## Deep Link URL Scheme

### V1: Query Parameter Approach
```
https://saberloop.com/app/?topic=World%20History
```

**Pros:**
- Simple to implement
- Works with existing routing
- No server changes needed

**Cons:**
- Less "clean" URL
- Can't track specific quiz attempts

### V2 (Future): Path-Based Approach
```
https://saberloop.com/app/quiz/abc123
```

**Would require:**
- Server-side quiz storage
- Unique quiz IDs
- API endpoint to retrieve quiz

**Benefits:**
- "Challenge a friend" with exact same questions
- Track how many people attempted shared quiz

---

## Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Android WebView |
|---------|--------|---------|--------|-----------------|
| Web Share API | ✅ | ❌ | ✅ (15+) | ✅ |
| Web Share API + Files | ✅ | ❌ | ✅ (15+) | ✅ |
| Canvas toBlob | ✅ | ✅ | ✅ | ✅ |
| Clipboard API | ✅ | ✅ | ✅ | ✅ |

**Strategy:**
- Use Web Share API where available
- Fall back to clipboard + social intent URLs

---

## Security Considerations

1. **XSS Prevention**
   - Sanitize topic names before rendering
   - Use `encodeURIComponent` for URL params
   - Canvas text is inherently safe

2. **Content Validation**
   - Limit topic length in share message
   - Truncate with ellipsis if needed

3. **Privacy**
   - No PII in shared content
   - Score data is ephemeral (not server-stored)

---

## Success Criteria

### Must Have (V1)
- [ ] Share button visible on Results screen
- [ ] Can share text + link via Web Share API
- [ ] Fallback to clipboard works on Firefox
- [ ] Deep links open app with topic pre-filled
- [ ] All existing E2E tests pass
- [ ] New E2E tests for share flow

### Nice to Have (V1)
- [ ] Generated achievement card image
- [ ] Share modal with preview
- [ ] Social platform quick-share buttons

### Future (V2)
- [ ] Achievement level system
- [ ] "Challenge a friend" with same questions
- [ ] Share TO functionality (iOS)

---

## Decisions Made

1. **Scope**: Option B - Full mockup implementation
   - Share modal with achievement card preview
   - Generated image for sharing
   - ~5-6 sessions

2. **Social buttons**: ✅ Include direct Twitter/Facebook/Stories buttons
   - Plus native share sheet via "More Options"

3. **Achievement levels**: ❌ Defer to future phase
   - Will show topic name and score only (no "Level X" badge)

4. **Image sharing**: ✅ Required for V1
   - Canvas-generated achievement card

5. **Message format**: ✅ Approved as proposed
   ```
   🏆 {Topic} Quiz Master!
   I scored {score}/{total} ({percentage}%) on Saberloop!
   Can you beat my score?

   Try it: https://saberloop.com/app/?topic={encoded_topic}
   ```

---

## Dependencies

- No external packages required
- Canvas API is built-in
- Web Share API is built-in (with fallbacks)

---

## Estimated Timeline

| Phase | Sessions | Description |
|-------|----------|-------------|
| 70.1 | 1-2 | Core infrastructure |
| 70.2 | 1-2 | UI components |
| 70.3 | 1 | Deep link handling |
| 70.4 | 1 | Polish & testing |
| **Total** | **4-6** | **Full implementation** |

---

## References

- [Web Share API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [Web Share API - web.dev](https://web.dev/web-share/)
- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Issue #11](https://github.com/vitorsilva/saberloop/issues/11)
- [iOS App Store Phase](./IOS_APP_STORE.md) (Share TO details)

---

## Appendix: Google Stitch Mockup Summary

From the design session:

1. **Results Screen**: Added "Share Results" button below score card
2. **Share Options Modal**: Achievement card preview + social buttons + copy link + more options
3. **Share Image Preview**: Full-screen preview of achievement card with "Share Now" CTA
4. **Share Confirmation**: Success message with "Done" button and "Share to another app" option

---

**Last Updated:** 2025-12-21
**Status:** Ready for Review
