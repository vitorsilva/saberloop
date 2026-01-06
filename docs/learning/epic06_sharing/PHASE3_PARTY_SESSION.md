# Phase 3: Real-Time Party Session

**Status:** Not Started
**Priority:** P2 - Synchronous play
**Parent:** [Epic 6 Plan](./EPIC6_SHARING_PLAN.md)
**Depends on:** [Phase 1](./PHASE1_QUIZ_SHARING.md) and [Phase 2](./PHASE2_MODE_TOGGLE.md) completed

---

## Goal

Synchronous quiz play with friends in real-time.

## User Stories

> As a host, I want to start a party session so my friends can join and play together in real-time.

> As a guest, I want to join a party session using a code so I can play with friends.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PARTY SESSION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. HOST creates session                                    │
│     → VPS generates room code (ABC123)                     │
│     → Host shares code verbally or via message             │
│                                                             │
│  2. GUESTS join with code                                   │
│     → VPS facilitates WebRTC signaling                     │
│     → Direct P2P connections established                   │
│                                                             │
│  3. HOST starts quiz                                        │
│     → Broadcasts: { quiz, startTime }                      │
│     → All peers calculate current question from time       │
│                                                             │
│  4. PLAY                                                    │
│     → Each peer sends answers to host                      │
│     → Host broadcasts score updates                        │
│     → Time-based question progression (30 sec default)     │
│                                                             │
│  5. END                                                     │
│     → Host broadcasts final scores                         │
│     → Session ends                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## VPS Components (PHP)

### Room Management (`/api/rooms.php`)

```php
// POST /create - Generate room code, store host info
// GET /join/{code} - Get room info, add as participant
// DELETE /{code} - Clean up room
```

### Signaling (`/api/signaling.php`)

```php
// POST /offer - Store WebRTC offer
// GET /offer/{room} - Poll for offers
// POST /answer - Store WebRTC answer
// GET /answer/{room} - Poll for answers
```

### Room Cleanup (Cron job)

- Delete rooms older than 2 hours
- Delete orphaned signaling data

---

## App Components

### P2P Service (`src/services/p2p.js`)

- WebRTC connection management
- Data channel for quiz state
- Reconnection handling

### Party Session Manager (`src/services/party-session.js`)

- Host: manage participants, broadcast state
- Guest: receive state, send answers
- Time sync logic

### Party UI Components

- Create Session modal
- Join Session modal
- Participant list
- Live scoreboard
- Countdown timer

---

## Configuration

```javascript
const PARTY_CONFIG = {
  defaultSecondsPerQuestion: 30,
  minSecondsPerQuestion: 15,
  maxSecondsPerQuestion: 60,
  maxParticipants: 20,
  roomCodeLength: 6,
  signalingPollInterval: 500, // ms
  roomExpiryHours: 2,
};
```

---

## Wireframes

### Screen 1: Create Party Session (Host)

```
┌─────────────────────────────────────────┐
│ Create Party Session                    │
├─────────────────────────────────────────┤
│                                         │
│  Room Code:                             │
│                                         │
│     ┌───────────────────┐               │
│     │     ABC123        │               │
│     └───────────────────┘               │
│                                         │
│  Share this code with friends           │
│                                         │
│  Participants (2):                      │
│  • You (host)                           │
│  • João                                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [▶️ Start Quiz]                │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Screen 2: Join Party (Guest Entry)

```
┌─────────────────────────────────────────┐
│ Join Party                              │
├─────────────────────────────────────────┤
│                                         │
│  Enter room code:                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ A B C 1 2 3                     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [Join]                         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ─────────────────────────────────────  │
│  or scan QR code                        │
│                                         │
└─────────────────────────────────────────┘
```

### Screen 3: Waiting Room (Guest View)

```
┌─────────────────────────────────────────┐
│ Party: ABC123                           │
├─────────────────────────────────────────┤
│                                         │
│            ⏳                            │
│                                         │
│     Waiting for host to start...        │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Participants (3):                      │
│  • Maria (host)                         │
│  • You                                  │
│  • João                                 │
│                                         │
│  Quiz: "History of Portugal"            │
│  10 questions • 30 sec each             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [Leave Party]                  │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Screen 4: Quiz Playing (All Players)

```
┌─────────────────────────────────────────┐
│ Party Quiz - Question 3/10     ⏱️ 0:24  │
├─────────────────────────────────────────┤
│                                         │
│  What year did...?                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ A) 1492                         │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ B) 1500                         │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ C) 1512                         │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ D) 1520                         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Live Scores:                           │
│  1. Maria: 25 pts                       │
│  2. You: 20 pts                         │
│  3. João: 15 pts                        │
│                                         │
└─────────────────────────────────────────┘
```

### Screen 5: Answer Feedback (After Selection)

```
┌─────────────────────────────────────────┐
│ Party Quiz - Question 3/10     ⏱️ 0:12  │
├─────────────────────────────────────────┤
│                                         │
│  What year did...?                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ A) 1492                         │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ B) 1500  ✅ +10 pts             │   │ ← Green highlight
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ C) 1512                         │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ D) 1520                         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Waiting for others...                  │
│  João answered • Maria thinking         │
│                                         │
└─────────────────────────────────────────┘
```

### Screen 6: Final Results (Session End)

```
┌─────────────────────────────────────────┐
│ 🎉 Party Complete!                      │
├─────────────────────────────────────────┤
│                                         │
│          🏆 WINNER 🏆                   │
│             Maria                        │
│            85 points                     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Final Standings:                       │
│                                         │
│  🥇 1. Maria     85 pts   (8/10)        │
│  🥈 2. You       70 pts   (7/10)        │
│  🥉 3. João      55 pts   (5/10)        │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [📤 Share Results]             │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  [🔄 Play Again]                │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  [🏠 Home]                      │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Screen 7: Connection Error / Disconnection

```
┌─────────────────────────────────────────┐
│ ⚠️ Connection Issue                     │
├─────────────────────────────────────────┤
│                                         │
│            📡                            │
│                                         │
│     Lost connection to party            │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Attempting to reconnect...             │
│  ████████░░░░░░░░ 50%                   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [🔄 Retry Now]                 │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  [❌ Leave Party]               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Your score: 45 pts (saved locally)     │
│                                         │
└─────────────────────────────────────────┘
```

### Screen 8: Host Left (Guest View)

```
┌─────────────────────────────────────────┐
│ Party Ended                             │
├─────────────────────────────────────────┤
│                                         │
│            👋                            │
│                                         │
│     Host has left the party             │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Your progress:                         │
│  • Score: 45 points                     │
│  • Answered: 5/10 questions             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [💾 Save Quiz Locally]         │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  [🏠 Home]                      │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Telemetry Events

- `party_session_created` - host created room
- `party_session_joined` - guest joined room
- `party_session_started` - quiz started
- `party_session_ended` - quiz completed
- `party_participant_disconnected` - someone dropped
- `p2p_connection_attempt` - WebRTC connection started
- `p2p_connection_success` - direct connection established
- `p2p_connection_failed` - connection failed (with reason)

---

## i18n Strings

```javascript
// Phase 3
"party.create": "Create Party",
"party.join": "Join Party",
"party.code": "Room Code",
"party.share_code": "Share this code with friends",
"party.participants": "Participants",
"party.start": "Start Quiz",
"party.waiting": "Waiting for host...",
"party.waiting_for_others": "Waiting for others...",
"party.scores": "Live Scores",
"party.time_remaining": "Time remaining",
"party.leave": "Leave Party",
"party.connection_issue": "Connection Issue",
"party.lost_connection": "Lost connection to party",
"party.reconnecting": "Attempting to reconnect...",
"party.retry": "Retry Now",
"party.host_left": "Host has left the party",
"party.your_progress": "Your progress",
"party.save_locally": "Save Quiz Locally",
"party.complete": "Party Complete!",
"party.winner": "Winner",
"party.final_standings": "Final Standings",
"party.share_results": "Share Results",
"party.play_again": "Play Again",
```

---

## Implementation Tasks

### VPS (PHP)

1. [ ] Create rooms table in MySQL
2. [ ] Implement room creation endpoint
3. [ ] Implement room join endpoint
4. [ ] Implement signaling endpoints (offer/answer)
5. [ ] Add room cleanup cron job
6. [ ] Rate limiting for abuse prevention

### App (JavaScript)

1. [ ] Create WebRTC wrapper service
2. [ ] Implement signaling client (polling)
3. [ ] Create party session state machine
4. [ ] Build host UI (create, manage, start)
5. [ ] Build guest UI (join, waiting, playing)
6. [ ] Implement time-based question sync
7. [ ] Build live scoreboard component
8. [ ] Handle disconnection gracefully
9. [ ] Add party session telemetry
10. [ ] Add i18n strings
11. [ ] Write unit tests
12. [ ] Write E2E tests (Playwright)
13. [ ] Write Maestro tests (mobile)

---

## Tests

### Unit Tests

```
p2p-service.test.js:
  - creates WebRTC peer connection
  - creates data channel
  - handles offer/answer exchange
  - sends messages through data channel
  - receives messages from data channel
  - handles connection close
  - handles reconnection attempts

party-session.test.js:
  - host can create session
  - host gets room code
  - guest can join with code
  - participant list updates
  - time sync calculates correct question
  - score calculation is accurate
  - host can start quiz
  - answers are received by host
  - scores broadcast to participants
  - session ends gracefully
```

### E2E Tests (Playwright)

```
party-session.spec.js:
  - host creates room, gets code
  - host sees participant list
  - guest joins with valid code
  - guest sees waiting room
  - invalid code shows error
  - host starts quiz
  - quiz plays synchronously
  - answers update scores
  - scores update live
  - session ends with results
  - guest can save quiz locally
  - host leaving ends session
```

### Maestro Tests (Mobile)

```yaml
# create-party.yaml
- launchApp
- tapOn: "Create Party"
- assertVisible: "Room Code"
- copyText: "roomCode"

# join-party.yaml
- launchApp
- tapOn: "Join Party"
- inputText:
    id: "roomCode"
    text: "ABC123"
- tapOn: "Join"
- assertVisible: "Waiting for host"

# party-gameplay.yaml
- launchApp
- createAndStartParty
- assertVisible: "Question 1"
- assertVisible: "Live Scores"
- selectAnswer: 0
- assertVisible: "Points"
```

---

## VPS Deployment (Phase 3 specific)

Phase 3 requires PHP backend changes for room management and signaling:

```
1. VPS Development
   └── Test locally with PHP built-in server
   └── Unit test PHP endpoints

2. Deploy to Staging VPS
   └── FTP php-api/ changes to staging server
   └── Test signaling flow end-to-end
   └── Test WebRTC connections

3. Deploy to Production VPS
   └── FTP php-api/ changes to production server
   └── Run database migrations (rooms table)
   └── Verify cleanup cron job

4. Monitor
   └── Track room creation/cleanup
   └── Monitor signaling latency
   └── Alert on error rates
```

---

## Phase 3 Complete Checklist

- [ ] **Design**
  - [ ] Wireframes reviewed and approved (8 screens)
  - [ ] VPS API design documented
  - [ ] i18n strings defined

- [ ] **Implementation (VPS)**
  - [ ] Room management API
  - [ ] Signaling API
  - [ ] Cleanup cron job
  - [ ] Rate limiting

- [ ] **Implementation (App)**
  - [ ] P2P service
  - [ ] Party session manager
  - [ ] Host UI (create session, manage participants)
  - [ ] Guest UI (join, waiting room)
  - [ ] Quiz playing UI (answer feedback, live scores)
  - [ ] Final results screen
  - [ ] Connection error handling
  - [ ] Host left handling
  - [ ] Telemetry events

- [ ] **Quality**
  - [ ] Unit tests (≥80% coverage)
  - [ ] E2E tests for all user flows (Playwright)
  - [ ] Maestro tests for mobile (parity with Playwright)
  - [ ] Mutation testing passed
  - [ ] JSDoc on all public functions
  - [ ] Architecture tests passing

- [ ] **Deployment (App)**
  - [ ] Deploy to staging (npm run deploy:staging)
  - [ ] Manual testing at https://saberloop.com/app-staging/
  - [ ] Test on real devices (Android/iOS)
  - [ ] Run Maestro tests on staging
  - [ ] Deploy to production (npm run deploy)
  - [ ] Verify feature flag is disabled

- [ ] **Deployment (VPS)**
  - [ ] Deploy PHP changes to staging VPS
  - [ ] Test signaling flow end-to-end
  - [ ] Test WebRTC connections
  - [ ] Deploy to production VPS
  - [ ] Run database migrations
  - [ ] Verify cleanup cron job

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
