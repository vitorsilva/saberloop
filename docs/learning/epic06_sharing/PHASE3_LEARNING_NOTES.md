# Phase 3: Party Sessions - Learning Notes

**Status:** In Progress (Sub-Phase 3a Complete)
**Branch:** `feature/phase3a-party-backend`
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

### Next Steps (Sub-Phase 3c: Party UI)

- [ ] Create PartyLobbyView (host/join screens)
- [ ] Create PartyGameView (in-game UI)
- [ ] Create PartyResultsView (leaderboard)
- [ ] Add party mode routing
- [ ] Integrate with P2PService
- [ ] Real-time participant list updates

---

**Last Updated:** 2026-01-09
