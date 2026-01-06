# Share TO Functionality (iOS)

**Status:** Planning
**Priority:** Medium (Required for full iOS integration)
**Estimated Effort:** 2-3 sessions
**Prerequisites:** iOS App Store submission (IOS_APP_STORE.md Phase 5)

---

## Overview

Receive shared content to create quizzes. This is a key iOS-native feature that transforms Saberloop from "a website" to "an iOS learning tool."

**User Flow:**
1. User sees interesting article/content in Safari, News, or any app
2. Taps Share → Saberloop
3. Saberloop opens with content as topic suggestion
4. User generates quiz based on shared content

**Why This Matters:**
- Genuine iOS integration that can't be done with a website
- Significantly increases approval chances on App Store
- Provides unique value to iOS users
- Natural fit for learning app workflow

---

## Technical Requirements

- `share_target` in web manifest (for PWA approach)
- iOS Share Extension (for native approach)
- Handle incoming share data
- Parse shared text/URL for topic extraction
- Deep linking via URL scheme

---

## Implementation

This feature is implemented as part of **Phase 5: Native Enhancement** in [IOS_APP_STORE.md](./IOS_APP_STORE.md#57-add-share-to-share-extension---the-big-feature).

### Key Components

1. **Share Extension** (native Swift code)
   - Receives shared content from other apps
   - Extracts text or URL
   - Opens main app via URL scheme

2. **URL Scheme Handler** (JavaScript)
   - Listens for `saberloop://share` URLs
   - Extracts topic from query parameters
   - Pre-fills topic input

3. **Topic Extraction** (JavaScript)
   - Parses shared content
   - Extracts meaningful topic from text or URL
   - Handles various input formats

---

## Reference

See [IOS_APP_STORE.md](./IOS_APP_STORE.md) Section 5.7 for complete implementation details including:
- Swift code for Share Extension
- URL scheme configuration
- JavaScript handler code
- Testing procedures

---

## Related Documents

- [IOS_APP_STORE.md](./IOS_APP_STORE.md) - Full iOS publishing guide
- [Epic 6: Quiz Sharing](../epic06_sharing/PHASE1_QUIZ_SHARING.md) - Share FROM functionality

---

**Last Updated:** 2026-01-06
