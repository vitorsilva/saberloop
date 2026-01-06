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

**Decision**: Option A - Stateless URL (Base64 encoded)

```
https://saberloop.com/app/quiz#eyJxdWVzdGlvbnMiOlsuLi5dfQ==
```

**Feasibility Analysis (based on real quiz data):**

| Data Scenario | JSON Size | Compressed | Base64 URL | Feasible? |
|---------------|-----------|------------|------------|-----------|
| 5 questions WITH explanations | ~3,200 bytes | ~1,800 bytes | ~2,400 chars | ⚠️ Borderline |
| 5 questions WITHOUT explanations | ~1,200 bytes | ~700 bytes | ~1,000 chars | ✅ Good |
| 10 questions WITHOUT explanations | ~2,200 bytes | ~1,300 bytes | ~1,800 chars | ✅ Good |

**URL Length Limits:**
- Chrome: ~2MB (no practical limit)
- Safari: ~80,000 chars
- WhatsApp: ~65,000 chars
- Safe universal limit: ~2,000 chars

**Decisions (Q24, Q25):**

| Question | Decision | Rationale |
|----------|----------|-----------|
| Include explanations? | No - exclude from share payload | Keeps URLs short; recipient can play without them |
| If URL too long? | Show error + track via telemetry | MVP simplicity; measure to inform future decisions |

### Share Payload Schema (Minimal)

```javascript
// What gets encoded in URL (explanations EXCLUDED)
{
  t: "topic string",           // topic (shortened key)
  g: "middle school",          // gradeLevel
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

### Data Model Change

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

### Implementation Tasks

1. [ ] Add `mode` field to quiz schema
2. [ ] Create quiz serialization (JSON → compressed Base64)
   - Use short property names
   - Exclude explanations
   - Use LZ-string compression
3. [ ] Create quiz deserialization (URL → quiz object)
4. [ ] Add "Share" button to quiz results screen
5. [ ] Create `/quiz#data` route handler
6. [ ] Handle quiz import (save to local IndexedDB)
7. [ ] Add size validation with error message
8. [ ] Add sharing telemetry events
9. [ ] Test URL length limits across platforms

### Telemetry Events

- `quiz_share_initiated` - user clicked share
- `quiz_share_completed` - share dialog closed (with method if available)
- `quiz_share_failed_too_large` - quiz exceeded URL size limit (**important for measuring**)
- `quiz_import_started` - opened shared URL
- `quiz_import_completed` - quiz saved locally
- `quiz_import_failed` - error during import (with reason)

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

## Development Standards

### Mockups & Wireframes

Each phase must include wireframes before implementation:

**Phase 1 - Share Quiz via URL:**
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

┌─────────────────────────────────────────┐
│ Share Modal                             │
├─────────────────────────────────────────┤
│                                         │
│  Share this quiz:                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ https://saberloop.com/app/qu... │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [📋 Copy] [📱 QR] [📤 Native Share]   │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Import Quiz (from shared URL)           │
├─────────────────────────────────────────┤
│                                         │
│  Quiz shared with you:                  │
│                                         │
│  "History of Portugal"                  │
│  10 questions • by Friend               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [▶️ Play Now]                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [💾 Save for Later]                   │
│                                         │
└─────────────────────────────────────────┘
```

**Phase 2 - Mode Toggle:**
```
┌─────────────────────────────────────────┐
│ SABERLOOP        [📚 Learn | 🎉 Party]  │
├─────────────────────────────────────────┤
│                                         │
│  (Learning mode - blue theme)           │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SABERLOOP        [📚 Learn | 🎉 Party]  │
├─────────────────────────────────────────┤
│                                         │
│  (Party mode - orange/dark theme)       │
│                                         │
└─────────────────────────────────────────┘
```

**Phase 3 - Party Session:**

*Screen 1: Create Party Session (Host)*
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

*Screen 2: Join Party (Guest Entry)*
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

*Screen 3: Waiting Room (Guest View)*
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

*Screen 4: Quiz Playing (All Players)*
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

*Screen 5: Answer Feedback (After Selection)*
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

*Screen 6: Final Results (Session End)*
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

*Screen 7: Connection Error / Disconnection*
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

*Screen 8: Host Left (Guest View)*
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

### Testing Requirements

**Per Phase Checklist:**

| Requirement | Phase 1 | Phase 2 | Phase 3 |
|-------------|---------|---------|---------|
| Unit tests for new services | ✅ | ✅ | ✅ |
| E2E tests for user flows (Playwright) | ✅ | ✅ | ✅ |
| Maestro tests for mobile (parity) | ✅ | ✅ | ✅ |
| Coverage ≥80% on new code | ✅ | ✅ | ✅ |
| Mutation testing on new code | ✅ | ✅ | ✅ |
| JSDoc on public functions | ✅ | ✅ | ✅ |
| Architecture tests (dependency-cruiser) | ✅ | ✅ | ✅ |
| Deploy to staging + test | ✅ | ✅ | ✅ |
| Deploy to production | ✅ | ✅ | ✅ |

**Phase 1 Tests:**
```
Unit Tests:
- quiz-serializer.test.js
  - serialize() produces valid Base64
  - deserialize() recovers original quiz
  - handles empty quiz
  - handles maximum size quiz
  - compression reduces size

E2E Tests:
- share-quiz.spec.js
  - user can share quiz after completing
  - share modal displays correct URL
  - copy button works
  - native share opens (if supported)
- import-quiz.spec.js
  - shared URL opens import screen
  - user can play imported quiz
  - user can save imported quiz
  - invalid URL shows error
```

**Phase 2 Tests:**
```
Unit Tests:
- theme-manager.test.js
  - switches theme correctly
  - persists preference
  - applies CSS variables

E2E Tests:
- mode-toggle.spec.js
  - toggle switches visual theme
  - mode persists across sessions
  - quiz generation respects mode
```

**Phase 3 Tests:**
```
Unit Tests:
- p2p-service.test.js
  - creates WebRTC connection
  - handles signaling
  - sends/receives messages
- party-session.test.js
  - host can create session
  - guest can join session
  - time sync works
  - score calculation correct

E2E Tests:
- party-session.spec.js
  - host creates room, gets code
  - guest joins with code
  - quiz plays synchronously
  - scores update live
  - session ends gracefully
```

### i18n (Internationalization)

All user-facing strings must be internationalized:

**New translation keys per phase:**

```javascript
// Phase 1
"share.button": "Share Quiz",
"share.modal.title": "Share this quiz",
"share.copy": "Copy",
"share.qr": "QR Code",
"share.native": "Share",
"import.title": "Quiz shared with you",
"import.play": "Play Now",
"import.save": "Save for Later",
"import.error": "Could not load quiz",

// Phase 2
"mode.learn": "Learn",
"mode.party": "Party",
"mode.switch.learn": "Switch to Learning Mode",
"mode.switch.party": "Switch to Party Mode",

// Phase 3
"party.create": "Create Party",
"party.join": "Join Party",
"party.code": "Room Code",
"party.share_code": "Share this code with friends",
"party.participants": "Participants",
"party.start": "Start Quiz",
"party.waiting": "Waiting for host...",
"party.scores": "Live Scores",
"party.time_remaining": "Time remaining",
"party.host_left": "Host disconnected. Session ended.",
```

### JSDoc Requirements

All new public functions must have JSDoc:

```javascript
/**
 * Serializes a quiz object to a URL-safe string.
 * Uses LZ-string compression and Base64 encoding.
 *
 * @param {Object} quiz - The quiz object to serialize
 * @param {string} quiz.id - Unique quiz identifier
 * @param {Array<Object>} quiz.questions - Array of question objects
 * @param {string} quiz.mode - Quiz mode: "learning" | "party" | "both"
 * @returns {string} URL-safe Base64 encoded string
 * @throws {Error} If quiz is invalid or too large
 *
 * @example
 * const encoded = serializeQuiz(myQuiz);
 * const url = `https://saberloop.com/app/quiz#${encoded}`;
 */
export function serializeQuiz(quiz) { ... }
```

### Maestro Testing (Mobile E2E)

**Parity with Playwright:** All E2E tests must have Maestro equivalents for mobile testing.

**Phase 1 Maestro Tests:**
```yaml
# share-quiz.yaml
- launchApp
- completeQuiz:
    topic: "Test Topic"
- assertVisible: "Share Quiz"
- tapOn: "Share Quiz"
- assertVisible: "Copy"
- tapOn: "Copy"
- assertVisible: "Link copied"

# import-quiz.yaml
- launchApp:
    link: "https://saberloop.com/app/quiz#encodedData"
- assertVisible: "Quiz shared with you"
- tapOn: "Play Now"
- assertVisible: "Question 1"
```

**Phase 2 Maestro Tests:**
```yaml
# mode-toggle.yaml
- launchApp
- assertVisible: "Learn"
- tapOn: "Party"
- assertVisible: "Party mode active"  # Visual theme change
- restart
- assertVisible: "Party"  # Persisted

# quiz-with-mode.yaml
- launchApp
- tapOn: "Party"
- generateQuiz:
    topic: "Fun Trivia"
- assertVisible: "party"  # Mode indicator on quiz
```

**Phase 3 Maestro Tests:**
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

**Test Organization:**
```
tests/
├── e2e/                    # Playwright (web)
│   ├── share-quiz.spec.js
│   ├── import-quiz.spec.js
│   ├── mode-toggle.spec.js
│   └── party-session.spec.js
└── maestro/                # Maestro (mobile)
    ├── share-quiz.yaml
    ├── import-quiz.yaml
    ├── mode-toggle.yaml
    └── party-session.yaml
```

### Deployment Strategy

**Deployment follows existing Saberloop pattern:**

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local | `localhost:8888` | Development |
| Staging | `staging.saberloop.com/app/` | Pre-production testing |
| Production | `saberloop.com/app/` | Live users |

**Per-Phase Deployment Process:**

```
1. Feature Development (local)
   └── npm run dev:php
   └── Run unit tests: npm test
   └── Run E2E tests: npm run test:e2e
   └── Run Maestro tests: maestro test tests/maestro/

2. Deploy to Staging
   └── npm run build
   └── npm run deploy:staging  # FTP to staging.saberloop.com
   └── Manual testing on staging
   └── Test on real devices (Android/iOS)
   └── Run Maestro tests on staging URL

3. Deploy to Production
   └── npm run deploy  # FTP to saberloop.com
   └── Verify feature flag is disabled
   └── Smoke test critical paths
   └── Enable feature flag for internal testing

4. Gradual Rollout
   └── Monitor telemetry
   └── Enable for 10% of users
   └── Monitor for issues
   └── Enable for 100% of users
   └── Remove feature flag (after stable)
```

**VPS Deployment (Phase 3 only):**

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

**Pre-Deployment Checklist:**

- [ ] All tests passing (unit, E2E, Maestro)
- [ ] Coverage ≥80% on new code
- [ ] Mutation testing passed
- [ ] Feature flag configured (disabled by default)
- [ ] Telemetry events verified
- [ ] Staging tested manually
- [ ] Real device testing completed
- [ ] Rollback plan documented

### Architecture Tests (dependency-cruiser)

Add rules for new modules:

```javascript
// New rules for Phase 1-3
{
  name: "p2p-service-isolation",
  comment: "P2P service should not depend on UI components",
  from: { path: "^src/services/p2p" },
  to: { path: "^src/(views|components)" },
  severity: "error"
},
{
  name: "party-session-uses-p2p",
  comment: "Party session must use P2P service, not raw WebRTC",
  from: { path: "^src/services/party-session" },
  to: { path: "RTCPeerConnection" },
  severity: "error"
}
```

### Feature Flag Strategy

All new features behind flags for gradual rollout:

```javascript
// src/core/feature-flags.js

export const FEATURE_FLAGS = {
  // Phase 1
  QUIZ_SHARING: {
    key: 'quiz_sharing',
    default: false,
    description: 'Enable quiz sharing via URL',
  },

  // Phase 2
  MODE_TOGGLE: {
    key: 'mode_toggle',
    default: false,
    description: 'Enable Learning/Party mode toggle',
  },

  // Phase 3
  PARTY_SESSION: {
    key: 'party_session',
    default: false,
    description: 'Enable real-time party sessions',
  },
};

// Usage in code:
if (isFeatureEnabled(FEATURE_FLAGS.QUIZ_SHARING)) {
  showShareButton();
}
```

**Rollout Strategy:**
1. Feature ships disabled (flag = false)
2. Enable for internal testing
3. Enable for 10% of users
4. Monitor telemetry
5. Gradual rollout to 100%
6. Remove flag after stable

### Branch & Commit Strategy

**Branch Naming:**
```
feature/phase1-quiz-sharing
feature/phase2-mode-toggle
feature/phase3-party-session
```

**Sub-branches for large phases:**
```
feature/phase1-quiz-sharing
├── feature/phase1-serialization
├── feature/phase1-share-ui
├── feature/phase1-import-flow
└── feature/phase1-telemetry
```

**Commit Message Format:**
```
feat(sharing): add quiz serialization with LZ compression

- Implement serializeQuiz() and deserializeQuiz()
- Add LZ-string compression for smaller URLs
- Handle edge cases (empty quiz, max size)
- Add unit tests with 95% coverage
```

**Commit Prefixes:**
- `feat(scope)`: New feature
- `fix(scope)`: Bug fix
- `test(scope)`: Tests only
- `docs(scope)`: Documentation
- `refactor(scope)`: Code refactoring
- `style(scope)`: Formatting, CSS
- `chore(scope)`: Build, dependencies

### Learning Notes & Status Updates

**Learning Notes Location:**
```
docs/learning/epic06_social_features/
├── EPIC6_SOCIAL_FEATURES_PLAN.md  (this plan, moved from parking_lot)
├── PHASE1_QUIZ_SHARING_NOTES.md
├── PHASE2_MODE_TOGGLE_NOTES.md
└── PHASE3_PARTY_SESSION_NOTES.md
```

**Status Update Cadence:**
- Update CLAUDE.md status after each phase completion
- Update learning notes after each session
- Track difficulties, errors, fixes, and learnings

**Learning Notes Template:**
```markdown
## Session: [Date]

### Completed
- [ ] Task 1
- [ ] Task 2

### Difficulties & Solutions
- **Problem**: Description
- **Cause**: Root cause
- **Fix**: How it was fixed
- **Learning**: Key takeaway

### Gotchas for Future Reference
- Important note 1
- Important note 2

### Next Steps
- [ ] Continue with...
```

---

## Phase Implementation Checklists

### Phase 1 Complete Checklist

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
  - [ ] Manual testing on staging
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

### Phase 2 Complete Checklist

- [ ] **Design**
  - [ ] Wireframes reviewed and approved
  - [ ] Color schemes finalized
  - [ ] i18n strings defined

- [ ] **Implementation**
  - [ ] Theme manager service
  - [ ] CSS custom properties
  - [ ] Toggle component
  - [ ] Mode persistence
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
  - [ ] Manual testing on staging
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

### Phase 3 Complete Checklist

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
  - [ ] Manual testing on staging
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

## Next Steps

1. Review this plan
2. Decide whether to proceed with Phase 1
3. If yes, create detailed implementation tasks
4. Begin Phase 1 development

---

**Last Updated:** 2026-01-06
