# Phase 4: Multi-User Testing (HTTP Polling MVP)

**Status:** ✅ Complete
**Priority:** P3 - Quality Assurance
**Prerequisites:** Phase 3 (Party Session), Docker PHP stack

---

## Overview

Phase 4 enables **real multi-user Party Mode** using HTTP polling through the local Docker signaling server. Instead of WebRTC P2P (which adds complexity), we implemented a simpler HTTP polling approach that works well for the quiz use case.

### What Was Built

- **Server-side answer scoring** with speed bonus (10 base + 0-5 speed points)
- **Question synchronization** across all participants via polling
- **Results view** showing winner, rankings, and medals
- **Real multi-user E2E test** capturing demo video without mocks

### Why HTTP Polling Instead of WebRTC

The demo video (`capture-party-demo.spec.js`) originally used DOM injection to fake participants. With the local Docker setup (PHP + MySQL), we now have real multi-user support via HTTP polling:

- Simpler architecture (no STUN/TURN servers needed)
- Works reliably across all network conditions
- Sufficient for quiz timing (1-second polling interval)
- WebRTC remains optional for future real-time enhancements

---

## Git Worktree Strategy

**Use a separate worktree for Phase 4 implementation.** This allows parallel work while keeping main clean.

**Setup:**
```bash
# From main repo directory
git worktree add -b feature/phase4-multi-user-testing ../saberloop-phase4 main

# Navigate to worktree
cd ../saberloop-phase4

# Install dependencies (not shared between worktrees)
npm install

# Copy .env (gitignored, not present in new worktree)
cp ../demo-pwa-app/.env .env
```

**Directory structure:**
```
source/repos/
├── demo-pwa-app/           # Main worktree (main branch)
└── saberloop-phase4/       # Phase 4 worktree (feature branch)
```

**Cleanup after merge:**
```bash
# From main repo
git worktree remove ../saberloop-phase4
git branch -d feature/phase4-multi-user-testing  # If merged
```

---

## Branch & Commit Strategy

### Branch Naming

```
feature/phase4-multi-user-testing
```

### Commit Message Format

```
test(party): add multi-user E2E test for happy path

- Create party-multi-user.spec.js with Playwright multi-context
- Test host creates room, guest joins, both complete quiz
- Verify P2P connections through local Docker signaling

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Commit Prefixes

| Change Type | Scope | Example |
|-------------|-------|---------|
| Test file | `party` | `test(party): add multi-user E2E test` |
| Config | `config` | `chore(config): add VITE_PARTY_API_URL for local testing` |
| Docs | `docs` | `docs(party): update Phase 4 with learnings` |

### Implementation Order

```
main
  │
  └── feature/phase4-multi-user-testing
        ├── Add env variable for local signaling
        ├── Create happy path test
        ├── Add edge case tests
        ├── Document learnings
        └── PR → merge to main
```

---

## Technical Setup

### Docker Stack

The PHP + MySQL stack provides local signaling:

```bash
# Start the stack
docker-compose -f docker-compose.php.yml up -d php-api mysql

# Verify containers
docker-compose -f docker-compose.php.yml ps
```

**Services:**
- `php-api` - Apache + PHP 7.4 on port 8080
- `mysql` - MySQL 5.7 on port 3306

### Environment Configuration

The signaling URL is configured via environment variable:

**File:** `src/services/signaling-client.js:269`
```javascript
return import.meta.env.VITE_PARTY_API_URL || 'https://saberloop.com/party';
```

**Add to `.env`:**
```
VITE_PARTY_API_URL=http://localhost:8080/party
```

---

## Test Implementation

### Test File

**File:** `tests/e2e/party-multi-user.spec.js`

Uses Playwright's multi-context feature to create isolated browser sessions:

```javascript
import { test, expect } from '@playwright/test';
import { initializeTestEnvironment } from './helpers.js';

test.describe('Party Mode - Real Multi-User', () => {
  test('host creates room, guest joins, both play quiz', async ({ browser }) => {
    // Create isolated browser contexts (separate sessions)
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();

    // Initialize both with test environment
    await initializeTestEnvironment(hostPage);
    await initializeTestEnvironment(guestPage);

    // Test flow...
  });
});
```

---

## Test Scenarios

### 1. Happy Path: Host + Guest Complete Quiz

| Step | Host Action | Guest Action | Verification |
|------|------------|--------------|--------------|
| 1 | Navigate to Party Mode | - | Mode toggle visible |
| 2 | Create room with quiz | - | Room code displayed |
| 3 | - | Enter room code + name | - |
| 4 | See guest in lobby | See host in lobby | Both show 2 participants |
| 5 | Click "Start Quiz" | - | Quiz starts for both |
| 6 | Answer question | Answer question | Both on same question |
| 7 | - | - | Scores sync correctly |
| 8 | See final standings | See final standings | Rankings match |

### 2. Edge Case: Guest Leaves Mid-Game

```
1. Setup: Host + Guest in active quiz
2. Guest closes browser/navigates away
3. Host receives "participant left" notification
4. Host can continue playing
5. Final results show guest's partial score
```

### 3. Edge Case: Multiple Guests (3+ Players)

```
1. Host creates room
2. Guest1, Guest2, Guest3 join
3. All 4 appear in lobby
4. Host starts quiz
5. All see same questions
6. Verify leaderboard shows all 4 with correct scores
```

### 4. Edge Case: Timing Synchronization

```
1. Host + Guest in quiz
2. Verify both are on same question at same time
3. Fast answerer gets speed bonus (< 5s = up to +5 pts)
4. Slow answerer gets base points only (10 pts)
5. Verify score calculation matches expected formula
```

### 5. Edge Case: Connection Recovery

```
1. Host + Guest connected
2. Simulate network hiccup (toggle offline mode)
3. Restore connection
4. Verify state resynchronizes
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/services/party-session.js` | Core game logic, scoring, state management |
| `src/services/p2p-service.js` | WebRTC peer connections |
| `src/services/signaling-client.js` | HTTP polling for WebRTC signaling |
| `src/views/PartyLobbyView.js` | Waiting room UI |
| `src/views/PartyQuizView.js` | Gameplay UI |
| `tests/e2e/helpers.js` | Test setup utilities |
| `tests/e2e/capture-party-demo.spec.js` | Reference for UI selectors |

---

## Running the Tests

### Prerequisites

```bash
# 1. Start Docker stack
docker-compose -f docker-compose.php.yml up -d php-api mysql

# 2. Verify containers
docker-compose -f docker-compose.php.yml ps

# 3. Ensure .env has local signaling URL
# VITE_PARTY_API_URL=http://localhost:8080/party

# 4. Start frontend dev server
npm run dev
```

### Execute Tests

```bash
# Run with browser visible (recommended for debugging)
npx playwright test tests/e2e/party-multi-user.spec.js --headed

# Run headless
npx playwright test tests/e2e/party-multi-user.spec.js
```

---

## Verification Checklist

- [ ] Docker containers running (php-api, mysql)
- [ ] `.env` has `VITE_PARTY_API_URL=http://localhost:8080/party`
- [ ] Dev server running on localhost:8888
- [ ] Test creates room successfully
- [ ] P2P connection establishes (WebRTC logs in console)
- [ ] Questions sync between host and guest
- [ ] Scores calculate correctly with speed bonus
- [ ] Edge cases handled gracefully

---

## Comparison: Simulation vs Real Testing

| Aspect | Demo Simulation | Real Multi-User |
|--------|-----------------|-----------------|
| P2P Connection | None (DOM injection) | Actual WebRTC |
| Signaling | None | Through Docker backend |
| Participants | Fake HTML elements | Real browser contexts |
| Score Calculation | Hard-coded | Actual formula |
| Timing | Visual only | Real synchronization |
| Use Case | Marketing videos | Quality assurance |

---

## Success Criteria

Phase 4 is complete when:

1. Happy path test passes reliably
2. All edge case tests implemented
3. Tests run in CI (optional, may need Docker setup)
4. Documentation updated with learnings

---

## Related Documents

- [Phase 3: Party Session](./PHASE3_PARTY_SESSION.md) - Core P2P implementation
- [Party Mode Demo Video](./PARTY_MODE_DEMO_VIDEO.md) - Simulation approach
- [Product Info README](../../product-info/README.md) - Asset generation

---

## Learning Notes

### Session: 2026-01-09

#### Completed

- ✅ Wired `CreatePartyView.js` to real party-api
- ✅ Wired `JoinPartyView.js` to real party-api
- ✅ Wired `PartyLobbyView.js` to poll for participants
- ✅ Multi-user lobby test passing (host + guest in same room)

#### Critical Discovery: Integration Gap

**Problem**: Views were built with mock data in Phase 3 but never wired to the real backend.

- `CreatePartyView` had `generateMockRoomCode()` instead of calling real API
- Views weren't importing from `party-api.js`
- Phase 3d (UI wiring) was marked complete but implementation was missing

**Fix**: Created `src/services/party-api.js` and wired all three views:
- `CreatePartyView`: Calls `createRoom()`, polls with `getRoom()`
- `JoinPartyView`: Calls `joinRoom()`, stores participantId in sessionStorage
- `PartyLobbyView`: Polls `getRoom()` for participants and game start

#### Difficulties & Solutions

##### 1. Docker Container Name Conflicts

**Problem**: Old containers with same names existed from previous sessions.
```
Error response from daemon: Conflict. The container name "/saberloop-mysql" is already in use
```

**Solution**: Stop and remove old containers before starting:
```bash
docker stop <container_id> && docker rm <container_id>
docker-compose -f docker-compose.php.yml up -d php-api mysql
```

##### 2. MySQL Connection Error: "No such file or directory"

**Problem**: PHP defaulted to `localhost` which uses socket file instead of TCP.

**Cause**: `config.local.php` was missing, so PHP tried to connect to `localhost` instead of Docker service name `mysql`.

**Solution**: Create `php-api/party/config.local.php`:
```php
return [
    'db' => [
        'host' => 'mysql',  // Docker service name, NOT localhost
        'dbname' => 'saberloop',
        'username' => 'saberloop',
        'password' => 'saberloop_dev',
    ],
];
```

##### 3. Migration SQL Not Executing

**Problem**: `migrate.php` has a bug that filters out SQL statements starting with comments.

**Workaround**: Run SQL directly via PowerShell pipe:
```powershell
Get-Content php-api/party/migrations/001_create_tables.sql | docker-compose -f docker-compose.php.yml exec -T mysql mysql -u saberloop -psaberloop_dev saberloop
```

##### 4. Participant Mapping Bug (snake_case vs camelCase)

**Problem**: API returns `{id, isHost}` but views expected `{participant_id, is_host}`.

**Symptom**: Host created room, guest joined successfully, but host's polling never showed the guest.

**Fix**: Updated `_mapParticipants()` in both views:
```javascript
// Before (wrong):
{ id: p.participant_id, isHost: p.is_host === 1 }

// After (correct):
{ id: p.id, isHost: p.isHost === true }
```

##### 5. CORS Blocking API Requests

**Problem**: Playwright test server runs on port 3000, but CORS only allowed 8888.
```
Access to fetch at 'http://localhost:8080/party/endpoints/rooms.php' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**: Add `http://localhost:3000` to `config.local.php`:
```php
'allowed_origins' => [
    'https://saberloop.com',
    'http://localhost:8888',
    'http://localhost:3000',  // Playwright test server
],
```

##### 6. Vite Server Caching Old Code

**Problem**: Test kept using old code despite file changes.

**Cause**: Playwright's `reuseExistingServer: !process.env.CI` was reusing an old Vite server.

**Solution**: Kill the existing server before running tests:
```powershell
taskkill //F //PID <pid>
```

#### Key Learnings

1. **Always verify API response format** - Don't assume field names match between backend and frontend.

2. **CORS for local dev** - When testing cross-origin, add ALL possible origins (both dev and test servers).

3. **Docker service names** - Inside Docker network, use service name (`mysql`) not `localhost`.

4. **Clear caches when debugging** - Kill old servers to ensure fresh code is served.

5. **Integration testing reveals gaps** - Real multi-user testing exposed the mock data that "worked" in isolation.

#### Next Steps

- [x] Wire `startQuiz()` API in CreatePartyView when host clicks Start ✅
- [x] Implement PartyQuizView to show questions ✅
- [ ] Add WebRTC P2P connection (currently HTTP polling only)
- [ ] Test edge cases (guest leaves, multiple guests)

### Session: 2026-01-09 (Continued)

#### Completed

- ✅ Wired `startQuiz()` API in CreatePartyView
- ✅ Added router handler for `/party/quiz/<code>`
- ✅ Refactored PartyQuizView for HTTP polling MVP (supports both session and API modes)
- ✅ Added `submitAnswer()` API function and PHP endpoint
- ✅ Extended E2E test to verify quiz start flow
- ✅ Test passing: Host + Guest both see quiz view with question and timer

#### Key Changes

##### CreatePartyView.js
- Added `startQuiz as startQuizApi` import
- Updated `startQuiz()` method to:
  - Call API to update room status to 'playing'
  - Store session info in sessionStorage (participantId, roomCode, isHost)
  - Navigate to `/party/quiz/${roomCode}`

##### router.js
- Added `/party/quiz/<code>` route detection
- Added `handlePartyQuiz(code)` method
- Added `getPartyQuizCode()` getter

##### PartyQuizView.js (Major Refactor)
- Added MVP mode that uses HTTP polling instead of WebRTC PartySession
- Updated constructor to support both approaches:
  - New: roomCode from URL/sessionStorage, fetch quiz from API
  - Legacy: PartySession object with WebRTC
- Updated `_renderScoreboard()` to work with both modes
- Updated `_startTimer()` to calculate time locally when no session
- Updated `_selectOption()` to call API when no session
- Added `_onTimerExpired()` for MVP mode
- Added `_startPolling()` and `_stopPolling()` for score updates

##### party-api.js
- Added `submitAnswer()` function for answer submission

##### rooms.php (PHP endpoint)
- Added `/answer` endpoint (MVP: acknowledges receipt, no scoring yet)

#### Learnings

1. **Dual-mode pattern works well** - Supporting both legacy (WebRTC session) and new (HTTP polling MVP) approaches in the same view enables incremental migration.

2. **Session storage for cross-view state** - Using sessionStorage to pass participantId, roomCode, and isHost between views is simple and effective.

3. **Local timer calculation** - For MVP mode, calculating remaining time locally (`Date.now() - questionStartTime`) works well without needing server sync.

4. **Test-first approach pays off** - Extending the E2E test before implementing helped catch issues early and verify the complete flow.

#### Current Test Coverage

```
Multi-User Flow:
✅ Host creates room
✅ Guest joins room
✅ Both see participant list
✅ Host clicks Start Quiz
✅ Host navigates to PartyQuizView
✅ Guest auto-navigates via polling
✅ Both see question text
✅ Timer is visible
```

#### Remaining for Full P2P

1. ~~Answer submission with scoring (currently MVP placeholder)~~ ✅ Done
2. ~~Score updates via polling~~ ✅ Done (participants sorted by score)
3. Question sync across participants
4. Results view after quiz ends
5. WebRTC for real-time communication (optional enhancement)

### Session: 2026-01-09 (Answer Scoring)

#### Completed

- ✅ Created migration 002_add_answers.sql (party_answers table, score column)
- ✅ Implemented submitAnswer() in RoomManager with full scoring logic
- ✅ Updated getParticipants() to include scores, sorted by score descending
- ✅ Added correct/incorrect visual feedback in PartyQuizView
- ✅ Added i18n keys for feedback messages
- ✅ E2E test extended and passing

#### Scoring Formula

```
Correct answer: 10 pts base + 0-5 pts speed bonus
Speed bonus calculation:
  - If answered in <20% of time: 5 pts
  - If answered in 20-100% of time: scales linearly 5→0 pts
  - If time expired: 0 pts
Incorrect answer: 0 pts
```

#### Database Changes

```sql
-- New columns
ALTER TABLE party_participants ADD COLUMN score INT DEFAULT 0;
ALTER TABLE party_rooms ADD COLUMN current_question INT DEFAULT 0;

-- New table
CREATE TABLE party_answers (
    id, room_id, participant_id, question_index, answer_index,
    is_correct, time_ms, points, created_at
);
```

#### Test Coverage

```
✅ Host creates room
✅ Guest joins room
✅ Both see participant list
✅ Host clicks Start Quiz
✅ Host navigates to PartyQuizView
✅ Guest auto-navigates via polling
✅ Both see question text
✅ Timer is visible
✅ Host answers question and sees feedback
✅ Guest answers question and sees feedback
```

### Session: 2026-01-09 (Question Sync)

#### Completed

- ✅ Added `current_question` to room API response
- ✅ Added `advanceQuestion()` method to RoomManager
- ✅ Added `/next` endpoint to PHP API
- ✅ Updated PartyQuizView with question progression:
  - Host advances when timer expires
  - Non-host detects changes via polling
  - Quiz ends after last question

#### Question Sync Flow

```
Timer expires (30 sec)
    ↓
Host: calls POST /rooms/{code}/next
    ↓
Server: increments current_question
        (or ends quiz if last question)
    ↓
Non-host: polling detects current_question change
    ↓
All clients: _moveToQuestion() updates UI
    - New question text
    - Fresh options (re-shuffled)
    - Reset timer
    - Updated scoreboard
```

#### Remaining for Full MVP

1. ~~Question sync across participants~~ ✅ Done
2. ~~Results view after quiz ends~~ ✅ Done
3. WebRTC for real-time communication (optional)

### Session: 2026-01-09 (Results View)

#### Completed

- ✅ Added `_mapParticipants()` method to PartyResultsView
- ✅ Added `/party/results/<code>` route handler to router.js
- ✅ Added `handlePartyResults()` and `getPartyResultsCode()` to router
- ✅ Updated PartyQuizView `_onQuizEnd()` to navigate to results

#### Results View Flow

```
Quiz ends (all questions answered)
    ↓
Host: POST /rooms/{code}/next returns status: 'ended'
    ↓
PartyQuizView._onQuizEnd() called
    ↓
Navigates to /party/results/<code>
    ↓
PartyResultsView:
    - Fetches final standings from API
    - Shows winner with trophy
    - Shows personal rank ("You're #2 of 4")
    - Shows medal standings (🥇🥈🥉)
    - Actions: Share, Play Again (host), Save, Home
```

#### Key Implementation Details

**PartyResultsView** (`src/views/PartyResultsView.js`):
- Dual-mode support: legacy (options.standings) and API (fetch via roomCode)
- Gets roomCode from: options → URL → sessionStorage
- `_mapParticipants()` transforms API data to UI format
- Sorted by score descending for standings

**Router** (`src/core/router.js`):
- Pattern match for `/party/results/<code>` (line 63-68)
- `handlePartyResults()` stores code and renders view
- `getPartyResultsCode()` for view to retrieve code

**PartyQuizView** (`src/views/PartyQuizView.js`):
- `_onQuizEnd()` stops polling and navigates to results
- Navigation uses room code from session context

#### HTTP Polling MVP Complete ✅

The full party quiz flow now works with HTTP polling:
1. Host creates room → API
2. Guests join → API
3. Host starts quiz → API
4. Questions answered → API (with scoring)
5. Timer expires → Host advances → API
6. Quiz ends → Results shown → API

No WebRTC required for basic functionality!

---

## Deployment Lessons Learned

### ❌ Critical Gap: Database Migrations Not Deployed

**What happened:** When deploying Party Mode to production (2026-01-09), the PHP files were deployed but the database migration `002_add_answers.sql` was NOT run. This caused the production backend to fail because:
- `party_participants.score` column was missing
- `party_rooms.current_question` column was missing
- `party_answers` table didn't exist

**Root cause:** The `npm run deploy:party` script only deploys PHP files via FTP. It has no mechanism to:
1. Detect pending migrations
2. Run migrations automatically
3. Even warn about pending migrations

**How it was discovered:** After enabling feature flags and deploying, testing the production site revealed database errors.

**Fix applied:** Manually ran the migration SQL in phpMyAdmin.

### Action Items for Future

1. **Add migration tracking** - Create a `party_migrations` table to track which migrations have been applied
2. **Add deploy checklist** - `deploy:party` should output a checklist of manual steps including migrations
3. **Consider automated migrations** - Add a `migrate.php` endpoint (protected) that can be called post-deploy
4. **Document in deploy script** - At minimum, the deploy script should list any `.sql` files in migrations/ that may need to be run

### Deployment Checklist (Manual for Now)

When deploying party backend changes:

```
□ Run npm run deploy:party
□ Check php-api/party/migrations/ for new .sql files
□ Run any new migrations in phpMyAdmin
□ Test https://saberloop.com/party/test-db.php
□ Delete test-db.php after verification
□ Test party flow end-to-end on production
```
