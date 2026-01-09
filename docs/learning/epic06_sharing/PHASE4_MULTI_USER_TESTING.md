# Phase 4: Multi-User Testing (Real P2P)

**Status:** Planning
**Priority:** P3 - Quality Assurance
**Prerequisites:** Phase 3 (Party Session), Docker PHP stack

---

## Overview

Phase 4 enables **real multi-user Party Mode testing** using actual WebRTC P2P connections through the local Docker signaling server, replacing the DOM injection simulation used for demo videos.

### Why This Matters

The demo video (`capture-party-demo.spec.js`) used DOM injection to fake participants - no real P2P connections were established. With the local Docker setup (PHP + MySQL), we can now:

- Test actual WebRTC connections between browser tabs
- Verify signaling message flow through the backend
- Validate timing synchronization across participants
- Catch real-world P2P issues before production

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
