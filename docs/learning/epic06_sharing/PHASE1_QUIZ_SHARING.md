# Phase 1: Share Quiz via URL

**Status:** Not Started
**Priority:** P0 - Core enabler
**Parent:** [Epic 6 Plan](./EPIC6_SHARING_PLAN.md)

---

## Goal

Enable users to share generated quizzes with friends via URL.

## User Story

> As a user, I want to share a quiz I generated so my friends can play it on their devices.

---

## Technical Approach

**Decision**: Option A - Stateless URL (Base64 encoded)

```
https://saberloop.com/app/quiz#eyJxdWVzdGlvbnMiOlsuLi5dfQ==
```

### Feasibility Analysis (based on real quiz data)

| Data Scenario | JSON Size | Compressed | Base64 URL | Feasible? |
|---------------|-----------|------------|------------|-----------|
| 5 questions WITH explanations | ~3,200 bytes | ~1,800 bytes | ~2,400 chars | ⚠️ Borderline |
| 5 questions WITHOUT explanations | ~1,200 bytes | ~700 bytes | ~1,000 chars | ✅ Good |
| 10 questions WITHOUT explanations | ~2,200 bytes | ~1,300 bytes | ~1,800 chars | ✅ Good |

### URL Length Limits

- Chrome: ~2MB (no practical limit)
- Safari: ~80,000 chars
- WhatsApp: ~65,000 chars
- Safe universal limit: ~2,000 chars

### Key Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| Include explanations? | No - exclude from share payload | Keeps URLs short; recipient can play without them |
| If URL too long? | Show error + track via telemetry | MVP simplicity; measure to inform future decisions |

---

## Share Payload Schema (Minimal)

```javascript
// What gets encoded in URL (explanations EXCLUDED)
{
  t: "topic string",           // topic (shortened key)
  g: "middle school",          // gradeLevel
  c: "João",                   // creator name (optional)
  m: "learning",               // mode (optional)
  q: [                         // questions
    {
      q: "Question text?",     // question
      o: ["A", "B", "C", "D"], // options
      c: 2,                    // correct answer index
      d: "easy"                // difficulty (optional)
    }
  ]
}
```

**Key optimization**: Use short property names (t, g, q, o, c, d) to reduce JSON size.

---

## Data Model Change

Add to existing quiz schema in IndexedDB:

```javascript
{
  // existing fields...
  mode: "learning" | "party" | "both",  // NEW - required, default "learning"
  isImported: boolean,                   // NEW - required, default false
  shareId: "abc123",                     // NEW - required when shared (generated on share)
  sharedAt: timestamp,                   // NEW - required when shared (set on share)
  importedAt: timestamp,                 // NEW - required when imported (set on import)
  originalCreator: "string",             // NEW - required when imported (from URL or "Anonymous")
}
```

**Field Requirements:**

| Field | When Required | Default | Notes |
|-------|---------------|---------|-------|
| `mode` | Always | `"learning"` | Set by user or inherited from import |
| `isImported` | Always | `false` | `true` if quiz came from shared URL |
| `shareId` | When shared | N/A | Generated unique ID on first share |
| `sharedAt` | When shared | N/A | Timestamp of first share |
| `importedAt` | When imported | N/A | Timestamp when imported from URL |
| `originalCreator` | When imported | N/A | Creator name from URL or "Anonymous" |

---

## Wireframes

### Share Entry Points

*Screen 1a: Share from Quiz Results*
```
┌─────────────────────────────────────────┐
│ Quiz Results                            │
├─────────────────────────────────────────┤
│                                         │
│  Score: 8/10                            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [📤 Share Quiz]                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Share with friends so they can play!  │
│                                         │
└─────────────────────────────────────────┘
```

*Screen 1b: Share from Recent Quizzes List*
```
┌─────────────────────────────────────────┐
│ Recent Quizzes                          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ History of Portugal        [📤] │   │
│  │ 10 questions • 8/10 score       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Math Basics               [📤] │   │
│  │ 5 questions • 4/5 score         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Science Quiz              [📤] │   │
│  │ 8 questions • not played yet    │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

*Screen 1c: Share from Quiz Detail (Topics)*
```
┌─────────────────────────────────────────┐
│ ← History of Portugal                   │
├─────────────────────────────────────────┤
│                                         │
│  10 questions • Middle School           │
│  Created: Jan 5, 2026                   │
│  Best score: 8/10                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [▶️ Play Again]               │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  [📤 Share Quiz]               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Questions:                             │
│  1. What year did...                    │
│  2. Who was the king...                 │
│  ...                                    │
│                                         │
└─────────────────────────────────────────┘
```

### Share Modal

*Screen 2: Share Modal (with all options)*
```
┌─────────────────────────────────────────┐
│ Share Quiz                          ✕   │
├─────────────────────────────────────────┤
│                                         │
│  "History of Portugal"                  │
│  10 questions • Middle School           │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Share link:                            │
│  ┌─────────────────────────────────┐   │
│  │ https://saberloop.com/app/qu... │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌───────┐ ┌───────┐ ┌─────────────┐   │
│  │ 📋    │ │ 📱    │ │ 📤          │   │
│  │ Copy  │ │ QR    │ │ Share...    │   │
│  └───────┘ └───────┘ └─────────────┘   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ℹ️ Note: Explanations not included     │
│     to keep the link short              │
│                                         │
└─────────────────────────────────────────┘
```

*Screen 3a: Copy Success Feedback*
```
┌─────────────────────────────────────────┐
│ Share Quiz                          ✕   │
├─────────────────────────────────────────┤
│                                         │
│  ...                                    │
│                                         │
│  ┌───────┐ ┌───────┐ ┌─────────────┐   │
│  │ ✅    │ │ 📱    │ │ 📤          │   │
│  │Copied!│ │ QR    │ │ Share...    │   │
│  └───────┘ └───────┘ └─────────────┘   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ✅ Link copied to clipboard!           │
│     Paste it in WhatsApp, SMS, etc.     │
│                                         │
└─────────────────────────────────────────┘
```

*Screen 3b: QR Code View*
```
┌─────────────────────────────────────────┐
│ Share Quiz                          ✕   │
├─────────────────────────────────────────┤
│                                         │
│  "History of Portugal"                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      ██████████████████        │   │
│  │      ██              ██        │   │
│  │      ██  ██████████  ██        │   │
│  │      ██  ██      ██  ██        │   │
│  │      ██  ██████████  ██        │   │
│  │      ██              ██        │   │
│  │      ██████████████████        │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Scan with phone camera to play         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [💾 Save QR Image]             │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  [← Back to Share Options]      │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

*Screen 3c: Native Share (OS Sheet)*
```
┌─────────────────────────────────────────┐
│ Share Quiz                          ✕   │
├─────────────────────────────────────────┤
│                                         │
│  ...modal content...                    │
│                                         │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │         OS Native Share Sheet       │ │
│ │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │ │
│ │  │ 💬  │ │ 📱  │ │ ✉️  │ │ 📋  │   │ │
│ │  │Whats│ │Teleg│ │Email│ │Copy │   │ │
│ │  └─────┘ └─────┘ └─────┘ └─────┘   │ │
│ │                                     │ │
│ │  "Play this quiz on Saberloop!"     │ │
│ │  https://saberloop.com/app/quiz#... │ │
│ │                                     │ │
│ │  [Cancel]                           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

*Screen 4: Share Error (URL Too Long)*
```
┌─────────────────────────────────────────┐
│ Share Quiz                          ✕   │
├─────────────────────────────────────────┤
│                                         │
│  ⚠️ Quiz Too Large to Share             │
│                                         │
│  This quiz has too many questions       │
│  to fit in a shareable link.            │
│                                         │
│  Maximum: ~10 questions                 │
│  This quiz: 25 questions                │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Suggestions:                           │
│  • Create a shorter quiz                │
│  • Share the topic instead              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [Close]                        │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Import Flow

**Complete User Journey:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                     IMPORT QUIZ USER FLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. SENDER generates quiz and clicks "Share"                        │
│     └── App generates URL: saberloop.com/app/quiz#eyJxdWVz...       │
│     └── Sender copies link or uses native share                     │
│                                                                     │
│  2. SENDER shares link (via WhatsApp, SMS, email, etc.)             │
│     └── Message: "Try this quiz! https://saberloop.com/app/..."     │
│                                                                     │
│  3. RECEIVER clicks link                                            │
│     ├── IF app NOT installed:                                       │
│     │   └── Opens in browser (PWA still works!)                     │
│     │   └── Shows "Add to Home Screen" prompt                       │
│     │                                                               │
│     └── IF app IS installed (PWA):                                  │
│         └── Opens directly in app (via PWA scope)                   │
│                                                                     │
│  4. APP detects shared quiz in URL hash                             │
│     └── Router sees /quiz#data pattern                              │
│     └── Calls importQuizFromUrl()                                   │
│                                                                     │
│  5. APP shows Import Preview screen                                 │
│     └── Decodes and validates quiz data                             │
│     └── Shows quiz info (title, questions count, sender)            │
│                                                                     │
│  6. RECEIVER chooses action                                         │
│     ├── "Play Now" → Start quiz immediately                         │
│     └── "Save for Later" → Save to local DB, go to home             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

*Screen 5a: Import Loading*
```
┌─────────────────────────────────────────┐
│ Saberloop                               │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│            ⏳ Loading quiz...            │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

*Screen 5b: Import Preview (Valid Quiz)*
```
┌─────────────────────────────────────────┐
│ Quiz Shared With You                    │
├─────────────────────────────────────────┤
│                                         │
│            📚                            │
│                                         │
│  "History of Portugal"                  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  📝 10 questions                        │
│  🎓 Middle School level                 │
│  👤 Shared by: João                     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [▶️ Play Now]                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [💾 Save for Later]            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [✕ Dismiss]                    │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

*Screen 5c: Import Error (Invalid/Corrupted)*
```
┌─────────────────────────────────────────┐
│ Import Failed                           │
├─────────────────────────────────────────┤
│                                         │
│            ⚠️                            │
│                                         │
│  Could not load quiz                    │
│                                         │
│  The link may be:                       │
│  • Incomplete (got cut off)             │
│  • Corrupted                            │
│  • From an older version                │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [🏠 Go to Home]                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [🔄 Try Again]                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

*Screen 5d: Import Success (After Save)*
```
┌─────────────────────────────────────────┐
│ Quiz Saved!                             │
├─────────────────────────────────────────┤
│                                         │
│            ✅                            │
│                                         │
│  "History of Portugal" saved to         │
│  your quiz library.                     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [▶️ Play Now]                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [🏠 Go to Home]                │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Technical Specifications

### Share Button Availability Matrix

| Location | Share Button | Condition |
|----------|--------------|-----------|
| Quiz Results | Primary CTA | Always after completing quiz |
| Recent Quizzes List | Icon button per row | Quiz has questions |
| Quiz Detail View | Secondary CTA | Quiz has questions |
| During Quiz Play | Hidden | N/A (can't share mid-quiz) |

### Copy to Clipboard

```javascript
// Uses Clipboard API (93% browser support)
async function copyShareLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    showFeedback("Link copied!");
    trackEvent("quiz_share_copy_success");
  } catch (err) {
    // Fallback: create temporary input element
    fallbackCopyToClipboard(url);
  }
}
```

### QR Code Generation

```javascript
// Uses qrcode library (lightweight, ~5KB gzipped)
// npm install qrcode

import QRCode from 'qrcode';

async function generateQRCode(url, canvasElement) {
  try {
    await QRCode.toCanvas(canvasElement, url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    trackEvent("quiz_share_qr_generated");
  } catch (err) {
    showError("Could not generate QR code");
    trackEvent("quiz_share_qr_failed", { error: err.message });
  }
}

// Save QR as image
async function saveQRImage(canvasElement, quizTitle) {
  const link = document.createElement('a');
  link.download = `saberloop-quiz-${sanitize(quizTitle)}.png`;
  link.href = canvasElement.toDataURL('image/png');
  link.click();
  trackEvent("quiz_share_qr_saved");
}
```

### Native Share API

```javascript
// Uses Web Share API (supported: Chrome, Safari, Edge mobile; ~70% support)
async function nativeShare(quiz, url) {
  const shareData = {
    title: `Play "${quiz.topic}" on Saberloop!`,
    text: `I challenge you to this ${quiz.questions.length}-question quiz!`,
    url: url
  };

  // Check if Web Share API is supported
  if (navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      trackEvent("quiz_share_native_success");
    } catch (err) {
      if (err.name !== 'AbortError') {
        // User didn't cancel, actual error
        trackEvent("quiz_share_native_failed", { error: err.message });
      }
    }
  } else {
    // Fallback: show copy button prominently
    showCopyFallback(url);
    trackEvent("quiz_share_native_unsupported");
  }
}
```

### Import Service

**URL Structure:**
```
https://saberloop.com/app/quiz#<encoded_data>

Where <encoded_data> is:
1. Quiz JSON with short keys
2. Compressed with LZ-string
3. Base64 encoded (URL-safe)
```

**Router Detection:**
```javascript
// src/core/router.js
function handleRoute(path, hash) {
  // Check for shared quiz pattern
  if (path === '/quiz' && hash && hash.length > 10) {
    return handleSharedQuizImport(hash);
  }
  // ... normal routing
}
```

**Import Service:**
```javascript
// src/services/quiz-import.js

/**
 * Imports a quiz from a shared URL hash.
 * @param {string} encodedData - The Base64+LZ compressed quiz data from URL hash
 * @returns {Promise<{success: boolean, quiz?: Object, error?: string}>}
 */
export async function importQuizFromUrl(encodedData) {
  trackEvent("quiz_import_started");

  try {
    // 1. Decode Base64
    const compressed = atob(encodedData.replace(/-/g, '+').replace(/_/g, '/'));

    // 2. Decompress LZ-string
    const jsonString = LZString.decompressFromUTF16(compressed);
    if (!jsonString) {
      throw new Error("Decompression failed");
    }

    // 3. Parse JSON
    const shortQuiz = JSON.parse(jsonString);

    // 4. Expand short keys to full keys
    const quiz = expandQuizKeys(shortQuiz);

    // 5. Validate quiz structure
    const validation = validateQuizStructure(quiz);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 6. Add import metadata
    quiz.isImported = true;
    quiz.importedAt = Date.now();
    quiz.originalCreator = shortQuiz.c || "Anonymous";
    quiz.mode = shortQuiz.m || "learning";

    trackEvent("quiz_import_parsed", {
      questionCount: quiz.questions.length
    });

    return { success: true, quiz };

  } catch (err) {
    trackEvent("quiz_import_failed", { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Saves an imported quiz to local IndexedDB.
 * @param {Object} quiz - The validated quiz object
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function saveImportedQuiz(quiz) {
  try {
    // Generate new local ID
    quiz.id = generateQuizId();
    quiz.createdAt = Date.now();

    // Save to IndexedDB
    await db.quizzes.add(quiz);

    trackEvent("quiz_import_saved", { id: quiz.id });
    return { success: true, id: quiz.id };

  } catch (err) {
    trackEvent("quiz_import_save_failed", { error: err.message });
    return { success: false, error: err.message };
  }
}
```

**Key Expansion Map:**
```javascript
// Short keys → Full keys for URL compression
const KEY_MAP = {
  t: 'topic',
  g: 'gradeLevel',
  q: 'questions',
  c: 'creator',      // who shared it
  m: 'mode',         // learning/party/both
};

const QUESTION_KEY_MAP = {
  q: 'question',
  o: 'options',
  c: 'correctIndex',
  d: 'difficulty',
};
```

---

## Telemetry Events

- `quiz_share_initiated` - user clicked share
- `quiz_share_completed` - share dialog closed (with method if available)
- `quiz_share_copy_success` - copy to clipboard succeeded
- `quiz_share_qr_generated` - QR code was generated
- `quiz_share_qr_saved` - QR image was downloaded
- `quiz_share_native_success` - native share completed
- `quiz_share_native_failed` - native share failed (with reason)
- `quiz_share_native_unsupported` - native share not available
- `quiz_share_failed_too_large` - quiz exceeded URL size limit (**important for measuring**)
- `quiz_import_started` - opened shared URL
- `quiz_import_parsed` - quiz successfully decoded
- `quiz_import_saved` - quiz saved to local DB
- `quiz_import_completed` - quiz saved locally
- `quiz_import_failed` - error during import (with reason)

---

## i18n Strings

```javascript
// Phase 1 - Share Feature
"share.button": "Share Quiz",
"share.modal.title": "Share Quiz",
"share.modal.link_label": "Share link:",
"share.copy": "Copy",
"share.copy_success": "Copied!",
"share.copy_feedback": "Link copied to clipboard!",
"share.copy_feedback_hint": "Paste it in WhatsApp, SMS, etc.",
"share.qr": "QR",
"share.qr_instruction": "Scan with phone camera to play",
"share.qr_save": "Save QR Image",
"share.qr_back": "Back to Share Options",
"share.native": "Share...",
"share.note_no_explanations": "Note: Explanations not included to keep the link short",
"share.error.too_large.title": "Quiz Too Large to Share",
"share.error.too_large.description": "This quiz has too many questions to fit in a shareable link.",
"share.error.too_large.maximum": "Maximum: ~10 questions",
"share.error.too_large.current": "This quiz: {count} questions",
"share.error.too_large.suggestion1": "Create a shorter quiz",
"share.error.too_large.suggestion2": "Share the topic instead",

// Phase 1 - Import Feature
"import.loading": "Loading quiz...",
"import.title": "Quiz Shared With You",
"import.questions_count": "{count} questions",
"import.grade_level": "{level} level",
"import.shared_by": "Shared by: {name}",
"import.play": "Play Now",
"import.save": "Save for Later",
"import.dismiss": "Dismiss",
"import.saved.title": "Quiz Saved!",
"import.saved.description": "\"{title}\" saved to your quiz library.",
"import.saved.go_home": "Go to Home",
"import.error.title": "Import Failed",
"import.error.description": "Could not load quiz",
"import.error.reason.incomplete": "Incomplete (got cut off)",
"import.error.reason.corrupted": "Corrupted",
"import.error.reason.old_version": "From an older version",
"import.error.go_home": "Go to Home",
"import.error.try_again": "Try Again",
```

---

## Implementation Tasks

1. [ ] Add `mode` field to quiz schema
2. [ ] Create quiz serialization service
   - [ ] `serializeQuiz()` - JSON → compressed Base64
   - [ ] `deserializeQuiz()` - Base64 → quiz object
   - [ ] Short key mapping (t, g, q, o, c, d)
   - [ ] LZ-string compression
   - [ ] URL-safe Base64 encoding
3. [ ] Create quiz import service
   - [ ] `importQuizFromUrl()` - decode and validate
   - [ ] `saveImportedQuiz()` - persist to IndexedDB
   - [ ] `validateQuizStructure()` - ensure data integrity
4. [ ] Add share UI components
   - [ ] Share button on Quiz Results screen
   - [ ] Share button (icon) on Recent Quizzes list
   - [ ] Share button on Quiz Detail view
   - [ ] Share Modal component
   - [ ] Copy button with feedback
   - [ ] QR code generation (using qrcode library)
   - [ ] Native Share API integration
   - [ ] Error state for oversized quizzes
5. [ ] Create `/quiz#data` route handler
   - [ ] Detect shared quiz hash in URL
   - [ ] Show Import Preview screen
   - [ ] Handle "Play Now" action
   - [ ] Handle "Save for Later" action
   - [ ] Handle invalid/corrupted data
6. [ ] Add size validation
   - [ ] Check URL length before sharing
   - [ ] Show user-friendly error if too large
7. [ ] Add sharing telemetry events
8. [ ] Add i18n strings for all new UI
9. [ ] Write unit tests
10. [ ] Write E2E tests (Playwright)
11. [ ] Write Maestro tests (mobile)

---

## Tests

### Unit Tests

```
quiz-serializer.test.js:
  - serialize() produces valid Base64
  - serialize() uses short property keys
  - serialize() excludes explanations
  - deserialize() recovers original quiz data
  - deserialize() handles missing optional fields
  - handles empty quiz gracefully
  - handles maximum size quiz (10 questions)
  - compression reduces size by >40%
  - URL-safe characters only (no +, /, =)

quiz-import.test.js:
  - importQuizFromUrl() decodes valid data
  - importQuizFromUrl() rejects corrupted data
  - importQuizFromUrl() rejects incomplete data
  - importQuizFromUrl() adds import metadata
  - saveImportedQuiz() persists to IndexedDB
  - saveImportedQuiz() generates new ID
  - validateQuizStructure() catches missing fields
  - validateQuizStructure() catches invalid types

share-modal.test.js:
  - renders quiz info correctly
  - copy button copies URL to clipboard
  - QR code generates successfully
  - native share opens when supported
  - native share fallback shows copy button
  - oversized quiz shows error state
```

### E2E Tests (Playwright)

```
share-quiz.spec.js:
  - user can share quiz after completing (results screen)
  - user can share quiz from recent quizzes list
  - user can share quiz from quiz detail view
  - share modal displays correct URL
  - copy button copies URL and shows feedback
  - QR code displays and can be saved
  - native share opens OS sheet (mobile)
  - oversized quiz shows error with helpful message

import-quiz.spec.js:
  - opening shared URL shows import preview
  - import preview shows quiz info (title, count, sender)
  - "Play Now" starts quiz immediately
  - "Save for Later" saves and shows confirmation
  - invalid URL shows error screen
  - corrupted data shows error screen
  - dismiss returns to home
  - saved quiz appears in recent quizzes
```

### Maestro Tests (Mobile)

```yaml
# share-from-results.yaml
- launchApp
- generateAndCompleteQuiz
- assertVisible: "Share Quiz"
- tapOn: "Share Quiz"
- assertVisible: "Share link"
- assertVisible: "Copy"
- assertVisible: "QR"
- tapOn: "Copy"
- assertVisible: "Link copied"

# share-from-list.yaml
- launchApp
- assertVisible: "Recent Quizzes"
- tapOn:
    id: "share-button-0"  # First quiz share icon
- assertVisible: "Share Quiz"

# import-play-now.yaml
- openLink: "https://saberloop.com/app/quiz#validEncodedData"
- assertVisible: "Quiz Shared With You"
- assertVisible: "Play Now"
- tapOn: "Play Now"
- assertVisible: "Question 1"

# import-save.yaml
- openLink: "https://saberloop.com/app/quiz#validEncodedData"
- tapOn: "Save for Later"
- assertVisible: "Quiz Saved"
- tapOn: "Go to Home"
- assertVisible: "Recent Quizzes"

# import-invalid.yaml
- openLink: "https://saberloop.com/app/quiz#invalidData123"
- assertVisible: "Could not load quiz"
- tapOn: "Go to Home"
```

---

## Phase 1 Complete Checklist

- [ ] **Design**
  - [ ] Wireframes reviewed and approved
  - [ ] i18n strings defined

- [ ] **Implementation**
  - [ ] Quiz serializer service
  - [ ] Share button and modal
  - [ ] Import flow and route
  - [ ] Telemetry events

- [ ] **Quality**
  - [ ] Unit tests (≥80% coverage)
  - [ ] E2E tests for all user flows (Playwright)
  - [ ] Maestro tests for mobile (parity with Playwright)
  - [ ] Mutation testing passed
  - [ ] JSDoc on all public functions
  - [ ] Architecture tests passing

- [ ] **Deployment**
  - [ ] Deploy to staging (npm run deploy:staging)
  - [ ] Manual testing at https://saberloop.com/app-staging/
  - [ ] Test on real devices (Android/iOS)
  - [ ] Run Maestro tests on staging
  - [ ] Deploy to production (npm run deploy)
  - [ ] Verify feature flag is disabled

- [ ] **Release**
  - [ ] Feature flag created (disabled)
  - [ ] Branch merged to main
  - [ ] Learning notes documented
  - [ ] Status updated in CLAUDE.md
  - [ ] Flag enabled for internal testing
  - [ ] Monitor telemetry
  - [ ] Gradual rollout begun (10% → 100%)

---

**Last Updated:** 2026-01-06
