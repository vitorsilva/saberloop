# Learning & Party Modes - MVP Plan

**Status:** Draft
**Created:** 2026-01-06
**Parent:** [Exploration Document](./LEARNING_PARTY_MODES_EXPLORATION.md)

---

## Executive Summary

Transform Saberloop from a solo learning tool into a social quiz platform with two modes:
- **Learning Mode** (existing, enhanced)
- **Party Mode** (new)

**Core insight**: Collaborative content creation solves the LLM generation time problem. Each friend generates 1 quiz → group has multiple quizzes ready in parallel.

---

## MVP Scope

### What's IN

| Phase | Feature | Priority |
|-------|---------|----------|
| **1** | Share quiz via URL | P0 - Core enabler |
| **2** | Mode toggle + theming | P1 - Visual identity |
| **3** | Real-time party session | P2 - Synchronous play |

### What's OUT (Post-MVP)

- Friend discovery + persistent groups
- Leaderboards
- Hypercore/true P2P
- Voice input/output
- Content mining from WhatsApp
- Community curation

---

## Phase 1: Share Quiz via URL

**Goal**: Enable users to share generated quizzes with friends

### User Story

> As a user, I want to share a quiz I generated so my friends can play it on their devices.

### Technical Approach

**Option A: Stateless URL (Base64 encoded)**
```
https://saberloop.com/app/quiz#eyJxdWVzdGlvbnMiOlsuLi5dfQ==
```
- Pros: No server storage, works offline, simple
- Cons: URL can get long for large quizzes

**Option B: Server-stored with short ID**
```
https://saberloop.com/app/quiz/ABC123
```
- Pros: Short URLs, analytics possible
- Cons: Requires VPS storage, data retention policy

**Recommendation**: Start with Option A (stateless). Add Option B later if URLs are too long.

### Data Model Change

Add to existing quiz schema in IndexedDB:

```javascript
{
  // existing fields...
  mode: "learning" | "party" | "both",  // NEW
  shareId: "abc123",                     // NEW (optional, for tracking)
  sharedAt: timestamp,                   // NEW (optional)
}
```

### Implementation Tasks

1. [ ] Add `mode` field to quiz schema
2. [ ] Create quiz serialization (JSON → compressed Base64)
3. [ ] Create quiz deserialization (URL → quiz object)
4. [ ] Add "Share" button to quiz results screen
5. [ ] Create `/quiz#data` route handler
6. [ ] Handle quiz import (save to local IndexedDB)
7. [ ] Add sharing telemetry events
8. [ ] Test URL length limits across platforms

### Telemetry Events

- `quiz_share_initiated` - user clicked share
- `quiz_share_completed` - share dialog closed (with method if available)
- `quiz_import_started` - opened shared URL
- `quiz_import_completed` - quiz saved locally
- `quiz_import_failed` - error during import

---

## Phase 2: Mode Toggle + Theming

**Goal**: Visual distinction between Learning and Party modes

### User Story

> As a user, I want to switch between Learning and Party modes so the app feels appropriate for each context.

### UI Design

**Header Toggle:**
```
┌─────────────────────────────────────────┐
│ SABERLOOP        [📚 Learn | 🎉 Party]  │
└─────────────────────────────────────────┘
```

### Color Schemes

| Element | Learning Mode | Party Mode |
|---------|---------------|------------|
| Primary | Blue (#3B82F6) | Orange (#F97316) |
| Background | Light (#F8FAFC) | Dark (#1E1E2E) |
| Text | Dark (#1E293B) | Light (#F8FAFC) |
| Success | Green (#22C55E) | Yellow (#FACC15) |
| Accent | Teal (#14B8A6) | Purple (#A855F7) |

### Implementation Tasks

1. [ ] Add mode state to global app state
2. [ ] Create CSS custom properties for theming
3. [ ] Create Learning theme CSS
4. [ ] Create Party theme CSS
5. [ ] Add toggle component to header
6. [ ] Persist mode preference in settings
7. [ ] Apply mode label when generating quizzes
8. [ ] Filter quiz list by mode (optional)

### Telemetry Events

- `mode_switched` - with `from` and `to` values

---

## Phase 3: Real-Time Party Session

**Goal**: Synchronous quiz play with friends

### User Story

> As a host, I want to start a party session so my friends can join and play together in real-time.

> As a guest, I want to join a party session using a code so I can play with friends.

### Architecture

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

### VPS Components (PHP)

1. **Room Management** (`/api/rooms.php`)
   - `POST /create` - Generate room code, store host info
   - `GET /join/{code}` - Get room info, add as participant
   - `DELETE /{code}` - Clean up room

2. **Signaling** (`/api/signaling.php`)
   - `POST /offer` - Store WebRTC offer
   - `GET /offer/{room}` - Poll for offers
   - `POST /answer` - Store WebRTC answer
   - `GET /answer/{room}` - Poll for answers

3. **Room Cleanup** (Cron job)
   - Delete rooms older than 2 hours
   - Delete orphaned signaling data

### App Components

1. **P2P Service** (`src/services/p2p.js`)
   - WebRTC connection management
   - Data channel for quiz state
   - Reconnection handling

2. **Party Session Manager** (`src/services/party-session.js`)
   - Host: manage participants, broadcast state
   - Guest: receive state, send answers
   - Time sync logic

3. **Party UI Components**
   - Create Session modal
   - Join Session modal
   - Participant list
   - Live scoreboard
   - Countdown timer

### Implementation Tasks

**VPS (PHP):**
1. [ ] Create rooms table in MySQL
2. [ ] Implement room creation endpoint
3. [ ] Implement room join endpoint
4. [ ] Implement signaling endpoints (offer/answer)
5. [ ] Add room cleanup cron job
6. [ ] Rate limiting for abuse prevention

**App (JavaScript):**
1. [ ] Create WebRTC wrapper service
2. [ ] Implement signaling client (polling)
3. [ ] Create party session state machine
4. [ ] Build host UI (create, manage, start)
5. [ ] Build guest UI (join, waiting, playing)
6. [ ] Implement time-based question sync
7. [ ] Build live scoreboard component
8. [ ] Handle disconnection gracefully
9. [ ] Add party session telemetry

### Configuration

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

### Telemetry Events

- `party_session_created` - host created room
- `party_session_joined` - guest joined room
- `party_session_started` - quiz started
- `party_session_ended` - quiz completed
- `party_participant_disconnected` - someone dropped
- `p2p_connection_attempt` - WebRTC connection started
- `p2p_connection_success` - direct connection established
- `p2p_connection_failed` - connection failed (with reason)

---

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| P2P Transport | WebRTC (browser native) | Proven, works today |
| Signaling | PHP polling on VPS | Simple, uses existing stack |
| State Consensus | Coordinator model | Simple for MVP; host = source of truth |
| Time Sync | Coordinator broadcasts startTime | Simple, effective with 30s questions |
| TURN Server | Accept failures + telemetry | Start simple, measure, optimize later |
| Room Codes | Both short codes + crypto ID | Flexibility for different contexts |
| Hypercore | Defer to post-MVP | Experimental in browsers |

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Quiz shares | 100 shares in first month | Telemetry: `quiz_share_completed` |
| Share conversion | 30% of shares → imports | Ratio of import to share events |
| Party sessions | 20 sessions in first month | Telemetry: `party_session_created` |
| Session completion | 70% sessions complete | Ratio of ended to created |
| P2P success rate | >85% | Telemetry: success/attempt ratio |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Feature creep | Strict phase boundaries; ship Phase 1 before starting Phase 2 |
| P2P failures | Telemetry to measure; fallback plan ready (VPS relay) |
| Low adoption | Validate each phase with real users before next |
| Clock sync issues | Generous timing (30s); telemetry to detect problems |

---

## Timeline Philosophy

No time estimates provided. Work in phases:
1. Complete Phase 1, ship, measure
2. If successful, proceed to Phase 2
3. If successful, proceed to Phase 3

Each phase is independently valuable. Stop if metrics don't justify continuation.

---

## Next Steps

1. Review this plan
2. Decide whether to proceed with Phase 1
3. If yes, create detailed implementation tasks
4. Begin Phase 1 development

---

**Last Updated:** 2026-01-06
