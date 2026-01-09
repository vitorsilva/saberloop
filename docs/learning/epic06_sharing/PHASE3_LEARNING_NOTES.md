# Phase 3: Party Sessions - Learning Notes

**Status:** In Progress
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
- [x] Create migrate.php runner

### Key Decisions

- **Followed telemetry pattern**: Used same structure as `php-api/telemetry/` for consistency
- **Config override pattern**: `config.php` has defaults, `config.local.php` overrides (not committed)
- **Rate limiting table**: Added `party_rate_limits` table to track room creation by IP

### Tips & Gotchas

1. **cPanel MySQL users are prefixed**: When you create user `party` in cPanel, it becomes `youruser_party`
2. **config.local.php security**:
   - Added to .htaccess block list (web access denied)
   - Already in .gitignore via `php-api/**/config.local.php` pattern
3. **Delete test files**: Always remove test-db.php and migrate.php after use (security)

### Database Schema

Four tables created:
- `party_rooms` - Room sessions (code, host, quiz, status)
- `party_participants` - Players in rooms
- `party_signaling` - WebRTC signaling messages (offer/answer/ICE)
- `party_rate_limits` - Rate limiting tracking

### Next Steps

- [ ] Run migration on server to create tables
- [ ] Implement RoomManager.php
- [ ] Implement SignalingManager.php
- [ ] Create room endpoints (rooms.php)
- [ ] Create signaling endpoints (signal.php)
- [ ] Add rate limiting logic
- [ ] Unit tests for PHP classes
- [ ] Deploy and test endpoints

---

**Last Updated:** 2026-01-09
