# Phase 3: Party Sessions - Learning Notes

**Status:** In Progress (Sub-Phases 3a, 3b, 3c, 3d Complete + Demo Video)
**Branch:** `feature/phase3-telemetry`
**Started:** 2026-01-09
**Depends on:** Phase 1 (Quiz Sharing) ✅, Phase 2 (Mode Toggle) ✅

---

## Session: 2026-01-09 (Sub-Phase 3a: VPS Backend)

### Prerequisites Completed

Before starting Phase 3a implementation, we needed to set up MySQL:

1. **Created MySQL database** via cPanel: `mdemaria_saberloop_party`
2. **Created MySQL user** via cPanel: `mdemaria_party`
3. **Granted limited permissions**: SELECT, INSERT, UPDATE, DELETE only
   - **Why limited?** Principle of least privilege - app only needs data operations, not schema modifications (DROP, ALTER, etc.)
4. **Tested connection** via temporary test-db.php script

### Completed

- [x] Create party backend directory structure (`php-api/party/`)
- [x] Create config.php with default settings
- [x] Create config.local.example.php template
- [x] Create .htaccess (security: block config.local.php and migrations/)
- [x] Create deploy-party.cjs deployment script
- [x] Add `npm run deploy:party` script
- [x] Deploy to VPS and test DB connection
- [x] Create config.local.php on server with real credentials
- [x] Create MySQL migration script (001_create_tables.sql)
- [x] Run migration via phpMyAdmin (since app user can't CREATE TABLE)
- [x] Implement Database.php (PDO singleton)
- [x] Implement RoomManager.php (room CRUD, rate limiting)
- [x] Implement SignalingManager.php (WebRTC signaling storage)
- [x] Implement ApiHelper.php (CORS, JSON responses)
- [x] Create rooms.php endpoint (create, get, join, leave, start, end)
- [x] Create signal.php endpoint (send, poll, get peers)
- [x] Create cleanup.php (cron script for expired data)
- [x] Deploy and test all endpoints ✅

### Key Decisions

- **Followed telemetry pattern**: Used same structure as `php-api/telemetry/` for consistency
- **Config override pattern**: `config.php` has defaults, `config.local.php` overrides (not committed)
- **Rate limiting table**: Added `party_rate_limits` table to track room creation by IP
- **Room code generation**: Excluded similar characters (0/O, 1/I/L) to avoid confusion

### Tips & Gotchas

1. **cPanel MySQL users are prefixed**: When you create user `party` in cPanel, it becomes `youruser_party`

2. **config.local.php security**:
   - Added to .htaccess block list (web access denied)
   - Already in .gitignore via `php-api/**/config.local.php` pattern

3. **Delete test files**: Always remove test-db.php and migrate.php after use (security)

4. **Limited DB permissions = can't run migrations from PHP**:
   - The app user only has data permissions (SELECT, INSERT, UPDATE, DELETE)
   - CREATE TABLE requires schema permissions
   - **Solution**: Run migrations directly in phpMyAdmin (logged in as admin)
   - This is actually good security practice!

5. **FTP deploy doesn't show individual files**: The deploy script's console output is static text - it doesn't reflect what was actually uploaded. FTP-deploy uploads changed files silently.

### Database Schema

Four tables created:
- `party_rooms` - Room sessions (code, host, quiz, status)
- `party_participants` - Players in rooms
- `party_signaling` - WebRTC signaling messages (offer/answer/ICE)
- `party_rate_limits` - Rate limiting tracking

### API Endpoints Implemented

**Room Operations** (`/party/endpoints/rooms.php`):
| Method | Path | Description |
|--------|------|-------------|
| POST | `/rooms` | Create room |
| GET | `/rooms/{code}` | Get room info |
| POST | `/rooms/{code}/join` | Join room |
| POST | `/rooms/{code}/leave` | Leave room |
| POST | `/rooms/{code}/start` | Start quiz (host only) |
| POST | `/rooms/{code}/quiz` | Update quiz data |
| DELETE | `/rooms/{code}` | End room (host only) |

**Signaling Operations** (`/party/endpoints/signal.php`):
| Method | Path | Description |
|--------|------|-------------|
| POST | `/signal` | Send signaling message |
| GET | `/signal/{code}/{participantId}` | Poll for messages |
| GET | `/signal/{code}/{participantId}/peers` | Get other participants |

### Test Results

All endpoints tested successfully:
```bash
# Create room
curl -X POST .../rooms.php -d '{"hostId":"...", "hostName":"..."}'
# Response: {"success":true,"data":{"code":"5LS54T",...}}

# Join room
curl -X POST .../rooms.php/5LS54T/join -d '{"participantId":"...", "name":"..."}'
# Response: {"success":true,"data":{...participants updated...}}

# Send signaling message
curl -X POST .../signal.php -d '{"roomCode":"5LS54T", "fromId":"...", "toId":"...", "type":"offer", "payload":{...}}'
# Response: {"success":true,"data":{"messageId":1,"sent":true}}

# Poll messages
curl .../signal.php/5LS54T/guest-456
# Response: {"success":true,"data":{"messages":[...],"count":1}}
```

### Commits Made

1. `feat(party-backend): add party backend infrastructure` - config, deploy script
2. `feat(party-backend): add database migration script` - SQL schema
3. `docs(party): add Phase 3 learning notes`
4. `feat(party-backend): add Database, RoomManager, SignalingManager`
5. `feat(party-backend): add API endpoints and helpers`

---

## Session: 2026-01-09 (Sub-Phase 3b: P2P Service)

### Completed

- [x] Create SignalingClient.js (HTTP polling client)
- [x] Create P2PService.js (WebRTC connection manager)
- [x] Implement WebRTC offer/answer flow
- [x] Handle ICE candidates
- [x] Implement reconnection logic (max 3 attempts)
- [x] Unit tests with WebRTC mocks (43 tests)
- [x] Integration test with VPS signaling ✅

### Implementation Details

**SignalingClient.js** (`src/services/signaling-client.js`):
- HTTP polling-based signaling for WebRTC setup
- Methods: `sendOffer()`, `sendAnswer()`, `sendIceCandidate()`, `getPeers()`
- Polling with configurable interval (default 500ms)
- Auto-stop after 5 consecutive errors
- Error handling with informative messages

**P2PService.js** (`src/services/p2p-service.js`):
- WebRTC connection management wrapper
- ICE servers: Google STUN servers (free, public)
- Data channel: ordered, labeled "party"
- Connection states: new → connecting → connected → disconnected/failed
- Automatic reconnection on failure (up to 3 attempts)
- Event callbacks: `onMessage()`, `onPeerConnected()`, `onPeerDisconnected()`
- Broadcast to all peers: `broadcast()`

### Test Results

**Unit Tests (43 total)**:
- SignalingClient: 17 tests
- P2PService: 26 tests

All tests use mocked WebRTC APIs (RTCPeerConnection, RTCDataChannel, etc.)

**VPS Integration Test**:
```bash
# Poll (empty)
curl "https://saberloop.com/party/endpoints/signal.php/ABC123/user-1"
# → {"success":true,"data":{"messages":[],"count":0}}

# Send offer
curl -X POST .../signal.php -d '{"roomCode":"ABC123","fromId":"user-1","toId":"user-2","type":"offer","payload":{"sdp":"test","type":"offer"}}'
# → {"success":true,"data":{"messageId":2,"sent":true}}

# Receive offer (as user-2)
curl "https://saberloop.com/party/endpoints/signal.php/ABC123/user-2"
# → {"success":true,"data":{"messages":[{...offer...}],"count":1}}
```

### Tips & Gotchas

1. **Async test timing**: When testing async callbacks (like polling handlers), add a small delay with `await new Promise(r => setTimeout(r, 10))` before assertions.

2. **JSON parse error fallback**: When server returns non-JSON error response, fall back to `HTTP ${status}` instead of "Unknown error" - more informative.

3. **WebRTC mocking strategy**: Create MockRTCPeerConnection and MockRTCDataChannel classes with helper methods like `_setConnectionState()` and `_receiveMessage()` to simulate events.

4. **ICE servers**: Using public Google STUN servers is fine for most cases. TURN servers (for relay) would require paid hosting.

### Commits Made

1. `feat(party): add SignalingClient for WebRTC signaling` - HTTP polling client
2. `feat(party): add P2PService for WebRTC connections` - WebRTC wrapper
3. `test: add unit tests for P2P and signaling services` - 43 tests + JSON error fix

---

## Session: 2026-01-09 (Sub-Phase 3c: Party UI - Bug Fixes)

### Problems Encountered

During E2E test development for Phase 3c, multiple issues were discovered that prevented tests from running:

#### Issue 1: App fails to load - blank screen

**Symptom**: All E2E tests timeout waiting for `[data-testid="welcome-heading"]`. Screenshot shows completely blank/dark page.

**Root Cause**: `logger.child()` method was being called in `JoinPartyView.js` and `CreatePartyView.js`, but the logger utility didn't implement this method.

```javascript
// JoinPartyView.js:13
const log = logger.child({ module: 'JoinPartyView' });
// TypeError: logger.child is not a function
```

**Fix**: Added `child()` method to `src/utils/logger.js`:
```javascript
child({ module }) {
  const prefix = `[${module}]`;
  return {
    debug: (message, context = {}) => logger.debug(`${prefix} ${message}`, context),
    info: (message, context = {}) => logger.info(`${prefix} ${message}`, context),
    // ... other methods
  };
}
```

**Learning**: When adding new logging patterns like `logger.child()`, ensure the logger utility implements the method. Check browser console for JavaScript errors when app shows blank screen.

---

#### Issue 2: Party buttons not visible after switching to Party mode

**Symptom**: Test "should show party buttons in party mode" times out. Screenshot shows mode toggle with "Party" selected, but Create Party / Join Party buttons are not visible.

**Root Cause**: `setMode()` in theme-manager.js wasn't dispatching a 'modechange' event, so HomeView's listener never fired to update party buttons visibility.

```javascript
// HomeView.js:280 - listening for event that was never dispatched
window.addEventListener('modechange', () => {
  this.updatePartyButtonsVisibility();
});
```

**Fix**: Added event dispatch to `src/services/theme-manager.js`:
```javascript
if (previousMode !== mode) {
  // ... telemetry tracking ...

  // Dispatch event so views can respond to mode changes
  window.dispatchEvent(new CustomEvent('modechange', {
    detail: { mode, previousMode }
  }));
}
```

**Learning**: When adding event listeners, verify the corresponding event is being dispatched somewhere. Check the event flow end-to-end.

---

#### Issue 3: E2E tests missing PARTY_SESSION feature flag

**Symptom**: Party button tests timeout because party buttons require `PARTY_SESSION` feature flag, but tests only enabled `MODE_TOGGLE`.

**Root Cause**: HomeView requires BOTH flags:
```javascript
const showPartyButtons =
  isFeatureEnabled('PARTY_SESSION') &&
  isFeatureEnabled('MODE_TOGGLE') &&
  getCurrentMode() === 'party';
```

**Fix**: Updated `tests/e2e/party-mode.spec.js` to enable both flags:
```javascript
await page.evaluate(() => {
  localStorage.setItem('__test_feature_MODE_TOGGLE', 'ENABLED');
  localStorage.setItem('__test_feature_PARTY_SESSION', 'ENABLED');
});
```

**Learning**: When writing E2E tests for features behind multiple flags, ensure ALL required flags are enabled. Check feature flag dependencies in the source code.

---

### Files Modified

1. `src/utils/logger.js` - Added `child()` method
2. `src/services/theme-manager.js` - Added `modechange` event dispatch
3. `tests/e2e/party-mode.spec.js` - Added `PARTY_SESSION` feature flag

### Test Results After Fixes

- **Unit tests**: 726 passed (all pass)
- **E2E party-mode tests**: 11/11 passed
- **Full E2E suite**: 114/119 passed (1 pre-existing dark mode failure, 1 flaky, 3 skipped)

### Key Takeaways

1. **Check browser console FIRST** when app shows blank screen - JavaScript errors are usually the cause
2. **Event-driven architecture requires both sides**: listener AND dispatcher
3. **Feature flags compound**: features depending on other features need ALL flags enabled
4. **Use Playwright's browser tools** to quickly identify runtime errors

---

## Session: 2026-01-09 (Party Mode Demo Video)

### Completed

- [x] Create video storyboard (`docs/learning/epic06_sharing/PARTY_MODE_DEMO_VIDEO.md`)
- [x] Create marketing assets README (`docs/product-info/README.md`)
- [x] Create Playwright capture script (`tests/e2e/capture-party-demo.spec.js`)
- [x] Fix script issues (ES modules, test.use placement)
- [x] Run capture and generate video
- [x] Save screenshots (7) to `docs/product-info/screenshots/party/`
- [x] Save video to `docs/product-info/videos/party-mode-demo.webm`

### Problems Encountered

#### Issue 4: Capture script using CommonJS in ES module project

**Symptom**: Script failed with `require is not defined` error.

**Root Cause**: Original script used CommonJS syntax (`const { test } = require(...)`), but the project uses ES modules (`"type": "module"` in package.json).

**Fix**: Changed to ES module imports:
```javascript
// Before (wrong)
const { test, expect } = require('@playwright/test');

// After (correct)
import { test, expect } from '@playwright/test';
```

**Learning**: Always check project's module system (`package.json` type field) before adding new scripts.

---

#### Issue 5: `test.use()` inside describe block error

**Symptom**: Playwright error: `test.use() can only be called in a test file`

**Root Cause**: `test.use()` was placed inside the `test.describe()` block, but Playwright requires it at the top level of the file.

```javascript
// Before (wrong)
test.describe('Capture Party Mode Demo', () => {
  test.use({ viewport: MOBILE_VIEWPORT, video: {...} }); // ❌ Error
});

// After (correct)
test.use({ viewport: MOBILE_VIEWPORT, video: {...} }); // ✅ Top level

test.describe('Capture Party Mode Demo', () => {
  // tests here
});
```

**Learning**: Playwright's `test.use()` configures the test file globally, not per-describe block. It must be at the top level, outside any describe/test blocks.

---

#### Issue 6: `__dirname` not available in ES modules

**Symptom**: `__dirname is not defined` when trying to use it for file paths.

**Root Cause**: ES modules don't have `__dirname` - it's a CommonJS global.

**Fix**: Used `import.meta.url` with `fileURLToPath`:
```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

**Learning**: In ES modules, derive `__dirname` from `import.meta.url` if needed. Or use relative paths from project root.

---

### Assets Generated

| Asset | Location | Size |
|-------|----------|------|
| 01-home-learning-mode.png | `docs/product-info/screenshots/party/` | ~50KB |
| 02-home-party-mode.png | `docs/product-info/screenshots/party/` | ~50KB |
| 03-create-party-select-quiz.png | `docs/product-info/screenshots/party/` | ~50KB |
| 04-room-code-created.png | `docs/product-info/screenshots/party/` | ~50KB |
| 05-party-lobby-participants.png | `docs/product-info/screenshots/party/` | ~50KB |
| 06-party-quiz-gameplay.png | `docs/product-info/screenshots/party/` | ~50KB |
| 07-party-results.png | `docs/product-info/screenshots/party/` | ~50KB |
| party-mode-demo.webm | `docs/product-info/videos/` | ~700KB |

### Regeneration Command

To regenerate the demo video in the future:
```bash
npx playwright test tests/e2e/capture-party-demo.spec.js --headed
# Then copy video from test-results/ to docs/product-info/videos/
```

### Key Takeaways

1. **ES modules vs CommonJS**: Check `package.json` type before writing scripts
2. **Playwright test.use()**: Must be at file top level, not inside describe
3. **Mock UI for demos**: Injecting mock HTML via `page.evaluate()` is effective for simulating multi-device scenarios
4. **Video capture**: Playwright's video recording captures the full test - just need to trim/copy afterward

### Commits Made

1. `docs(party): add party mode demo video plan and assets README`
2. `feat(party): add party mode demo video and screenshots`

---

## Session: 2026-01-09 (Landing Page Party Mode Update)

### Completed

- [x] Create implementation plan (`docs/learning/epic06_sharing/LANDING_PAGE_PARTY_UPDATE.md`)
- [x] Copy and add party gameplay screenshot to landing images
- [x] Update hero subtitle to mention Party Mode
- [x] Add Party Mode feature card (7th card in grid)
- [x] Add party screenshot to screenshots section
- [x] Update meta description and OG/Twitter tags
- [x] Deploy landing page to production

### Changes Made

| File | Change |
|------|--------|
| `landing/index.html` | Updated subtitle, added feature card, added screenshot, updated meta tags |
| `landing/images/landing-party-gameplay.png` | New screenshot showing party gameplay |
| `docs/learning/epic06_sharing/LANDING_PAGE_PARTY_UPDATE.md` | Implementation plan |

### Key Updates

1. **Hero subtitle:** "Learn solo or challenge friends in real-time Party Mode"
2. **New feature card:** Party Mode with description about room codes and live competition
3. **New screenshot:** Party gameplay showing live quiz with scoreboard
4. **SEO tags:** All meta descriptions updated to mention Party Mode

### Commits Made

1. `feat(landing): add Party Mode to landing page`

---

### Next Steps

- [x] ~~Sub-Phase 3c: Party UI~~ - Complete
- [x] ~~Sub-Phase 3d: Live Gameplay~~ - Complete (merged PR #98)
- [x] ~~Demo Video~~ - Complete
- [x] ~~Landing Page Update~~ - Complete
- [ ] Sub-Phase 3e: Testing & Polish (if planned)
- [ ] Phase 3 final review and merge to main

---

**Last Updated:** 2026-01-09
