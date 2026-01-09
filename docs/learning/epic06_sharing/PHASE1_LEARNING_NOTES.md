# Phase 1: Quiz Sharing - Learning Notes

**Status:** ✅ Complete (Merged)
**Branch:** `feature/phase1-quiz-sharing`
**Started:** 2026-01-07
**PR:** https://github.com/vitorsilva/saberloop/pull/84

---

## Session: 2026-01-07

### Completed

- [x] Updated `QuizSession` type definitions with new sharing fields (`src/types.js`)
  - Added: `mode`, `isImported`, `shareId`, `sharedAt`, `importedAt`, `originalCreator`
- [x] Installed `lz-string` library for URL compression
- [x] Created quiz serialization service (`src/services/quiz-serializer.js`)
  - `serializeQuiz()` - converts quiz to URL-safe compressed string
  - `deserializeQuiz()` - converts URL string back to quiz object
  - `canShareQuiz()` - checks if quiz fits within URL size limits
  - Short key mapping (t, g, q, o, c, d) for smaller payloads
  - Excludes explanations to keep URLs short
- [x] Created quiz import service (`src/services/quiz-import.js`)
  - `importQuizFromUrl()` - decodes and adds import metadata
  - `saveImportedQuiz()` - persists to IndexedDB
  - Telemetry events for import flow
- [x] Unit tests for serializer (18 tests passing)
- [x] Unit tests for import service (10 tests passing)
- [x] Created quiz share service (`src/services/quiz-share.js`)
  - `generateShareUrl()` - creates shareable URL
  - `copyShareUrl()` - clipboard with fallback
  - `nativeShare()` - Web Share API integration
  - `isNativeShareSupported()` - feature detection
- [x] Unit tests for share service (12 tests passing)
- [x] Updated router to detect `/quiz/<data>` shared URLs
- [x] Created ImportView (`src/views/ImportView.js`)
  - Loading, preview, error, and success states
  - "Play Now" and "Save for Later" actions
- [x] Registered `/import` route in main.js
- [x] Added i18n strings for import UI in all 9 languages
- [x] Created ShareQuizModal component (`src/components/ShareQuizModal.js`)
  - Bottom sheet modal with quiz info, copy link, native share
  - Error state for oversized quizzes
- [x] Added i18n strings for shareQuiz in all 9 languages
- [x] Added SHARE_QUIZ feature flag (`src/core/features.js`)
- [x] Added Share Quiz button to ResultsView
  - Imports showShareQuizModal
  - New button alongside existing Share Results button
  - handleShareQuizClick handler
- [x] Added Share Quiz button to TopicsView (history list)
  - Share icon button on each quiz row (per wireframe Screen 1b)
  - stopPropagation to prevent triggering replay
  - shareQuiz method loads session and shows modal
- [x] Added QR code generation (`qrcode` library)
  - Only generates QR for URLs ≤300 characters (longer URLs create unscannable dense QR codes)
  - Uses error correction level 'H' for better scanning reliability
- [x] Test validation completed
  - Unit tests: 455 passing
  - Architecture tests: passing
  - Mutation testing scores:
    - quiz-serializer.js: 65.57% (most survivors are equivalent mutants for optional fields)
    - quiz-import.js: 56.10% (most survivors are telemetry mutations)
    - quiz-share.js: 52.94% (most survivors are telemetry mutations)
  - Added targeted tests to kill important mutations

### Difficulties & Solutions

- **Problem**: LZ-string's `compressToEncodedURIComponent` produces `+` characters which aren't truly URL-safe
- **Cause**: The `+` character can be interpreted as a space in query strings, and some apps may mangle it
- **Fix**: Post-process the output to replace `+` with `_` (underscore), which is not in LZ-string's alphabet
- **Learning**: Always test URL encoding with `encodeURIComponent()` - if the string changes, it's not truly URL-safe

- **Problem**: First attempted to replace `+` with `-`, but tests failed
- **Cause**: `-` is already part of LZ-string's character set (`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$`)
- **Fix**: Use `_` instead, which is not in the LZ-string alphabet
- **Learning**: When choosing replacement characters, always check the library's alphabet first

- **Problem**: Used wrong telemetry API (`trackEvent` instead of `telemetry.track`)
- **Cause**: Didn't check existing codebase patterns before writing code
- **Fix**: Changed to `telemetry.track('event', { name: '...' })` pattern
- **Learning**: Always check existing patterns in the codebase before introducing new code

- **Tip**: When adding buttons inside clickable list items (like share button inside quiz row)
- **Pattern**: Use `e.stopPropagation()` in the button click handler to prevent triggering parent click
- **Example**: Share button click should open modal, not replay the quiz

- **Problem**: QR codes generated for quiz share URLs were unscannable on mobile devices
- **Cause**: Data URLs with compressed quiz content are 500+ characters, creating extremely dense QR codes
- **Fix**: Only generate QR codes when URL length ≤300 characters; longer quizzes just use Copy Link/Share buttons
- **Learning**: QR codes work best for short URLs (<300 chars). For data-heavy URLs, provide alternative sharing methods

- **Finding**: Mutation testing scores for telemetry code are inherently low
- **Cause**: Telemetry calls are "fire and forget" - they don't affect return values or observable behavior
- **Decision**: Accept lower mutation scores for telemetry mutations since they're observability, not business logic
- **Learning**: When reviewing mutation test results, categorize survivors into: (1) business logic bugs - must fix, (2) equivalent mutants - can ignore, (3) observability/telemetry - acceptable to ignore

- **Problem**: E2E test `locator('text=Share Quiz')` matched 2 elements (button + modal heading)
- **Cause**: Both the Share Quiz button and modal title contain the same text
- **Fix**: Use `getByRole('heading', { name: 'Share Quiz' })` to specifically target the modal heading
- **Learning**: Prefer semantic locators (getByRole, getByTestId) over text locators when text appears multiple times

- **Problem**: E2E tests expected URL to change to `/import` when navigating to shared quiz URL
- **Cause**: Router renders ImportView without changing URL (URL stays at `/quiz/<data>`)
- **Fix**: Check for visible content (e.g., "Play Now" button) instead of URL change
- **Learning**: When testing SPA routing, the URL may not always change even when the view changes. Test for visible content, not just URL patterns

- **Tip**: When generating test data for E2E tests (like encoded quiz URLs), pre-generate and hardcode the value rather than trying to generate dynamically in the browser context

- **Problem**: Maestro tests fail with "Element not found: Share Quiz"
- **Cause**: The emulator was running a version deployed by another agent. Need to deploy your branch and clear app cache.
- **Fix**: Build, deploy (`npm run build && npm run deploy`), clear app cache (`adb shell pm clear com.saberloop.app`)
- **Learning**: Maestro tests run against deployed code. Always redeploy after code changes.

- **Problem**: Share Quiz button used 'send' icon which looked like a play button
- **Fix**: Changed to 'link' icon which clearly represents "share a URL"
- **Learning**: Choose icons that convey the action clearly - 'link' for URL sharing, 'share' for social sharing

- **Problem**: Share Quiz button had gray/secondary styling, inconsistent with Share Results
- **Fix**: Changed from `border-secondary text-secondary` to `border-primary text-primary`
- **Learning**: Keep related buttons visually consistent - both share buttons should use same color scheme

- **Problem**: Google consent dialog appeared during Maestro test, blocking the flow
- **Cause**: Google services/fonts triggering consent on fresh emulator
- **Fix**: Clear app data and retry, or dismiss dialog manually
- **Learning**: Flaky tests can be caused by external dialogs - consider adding optional dismissal steps

### Commits Made

1. `docs(sharing): add QuizSession type definitions for sharing fields`
2. `chore(sharing): add lz-string for URL compression`
3. `feat(sharing): add quiz serialization service`
4. `test(sharing): add unit tests for quiz serializer`
5. `feat(sharing): add quiz import service`
6. `test(sharing): add unit tests for quiz import service`
7. `feat(sharing): add quiz share service with tests`
8. `docs(sharing): add Phase 1 learning notes`
9. `feat(sharing): add import view and route handler`

### Next Steps

- [x] Add QR code generation (install `qrcode` library)
- [x] Test validation (unit tests, arch tests, mutation testing)
- [x] Write E2E tests (Playwright) - 8 tests covering share flow, import flow, clipboard
- [x] Write Maestro tests (mobile) - 6 tests matching E2E coverage (all passing)
- [x] Deploy to staging and test
- [x] Manual testing on real devices

**Test Coverage Parity Note:**
- E2E (Playwright): 8 tests
- Maestro: 6 tests

The 2 E2E-only tests are for **import quiz from URL** (tests 6-7), which require:
- Navigating to a specific URL with encoded quiz data
- This is a web-only feature - cannot be tested in Maestro without deep link configuration

The 6 Maestro tests cover the same scenarios as the other 6 E2E tests:
1. Share button visibility on results (09)
2. Share button visibility on history (10)
3. Open modal on results (11)
4. Close modal (12)
5. Copy link (13)
6. Open modal from history (14)

---

**Last Updated:** 2026-01-07
