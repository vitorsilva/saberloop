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

### Next Steps (Sub-Phase 3b: P2P Service)

- [ ] Create SignalingClient.js (frontend HTTP polling)
- [ ] Create P2PService.js (WebRTC wrapper)
- [ ] Implement WebRTC connection flow
- [ ] Handle ICE candidates
- [ ] Implement reconnection logic
- [ ] Unit tests with WebRTC mocks
- [ ] Integration test with VPS signaling

---

**Last Updated:** 2026-01-09
