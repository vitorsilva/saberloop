# Phase 3: Real-Time Party Session

**Status:** Planning
**Priority:** P2 - Synchronous play
**Parent:** [Epic 6 Plan](./EPIC6_SHARING_PLAN.md)
**Depends on:** [Phase 1](./PHASE1_QUIZ_SHARING.md) ✅ and [Phase 2](./PHASE2_MODE_TOGGLE.md) ✅ completed

---

## Goal

Synchronous quiz play with friends in real-time.

## User Stories

> As a host, I want to start a party session so my friends can join and play together in real-time.

> As a guest, I want to join a party session using a code so I can play with friends.

---

## Prerequisites

**Party features require Party Mode to be enabled:**
- User must switch to Party mode via MODE_TOGGLE (Phase 2)
- Party buttons (Create/Join) only visible when `MODE_TOGGLE` is ENABLED AND mode is "party"
- This ensures users understand the context before starting a party session

---

## Sub-Phases

Phase 3 is split into 4 sub-phases for manageable implementation:

| Sub-Phase | Focus | Deliverables |
|-----------|-------|--------------|
| **3a** | VPS Backend | MySQL schema, Room API, Signaling API |
| **3b** | P2P Service | WebRTC wrapper, signaling client, connection management |
| **3c** | Party UI | Host/Guest screens, waiting room, participant list |
| **3d** | Live Gameplay | Quiz sync, scoring, live scoreboard, results |

Each sub-phase has its own PR and can be tested independently.

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

## Scoring System

**Formula: Base Points + Speed Bonus**

```javascript
const SCORING = {
  basePoints: 10,           // Points for correct answer
  maxSpeedBonus: 5,         // Maximum bonus for fast answers
  speedBonusWindow: 5,      // Seconds to get full speed bonus
  wrongAnswerPoints: 0,     // No points for wrong answers
  noAnswerPoints: 0,        // No points for timeout
};

/**
 * Calculate points for an answer
 * @param {boolean} correct - Whether the answer was correct
 * @param {number} responseTimeMs - Time taken to answer in milliseconds
 * @param {number} questionTimeMs - Total time allowed for question
 * @returns {number} Points earned
 */
function calculatePoints(correct, responseTimeMs, questionTimeMs) {
  if (!correct) return 0;

  const responseTimeSec = responseTimeMs / 1000;

  // Base points for correct answer
  let points = SCORING.basePoints;

  // Speed bonus: linear decay from maxSpeedBonus to 0
  // Full bonus if answered within speedBonusWindow seconds
  if (responseTimeSec <= SCORING.speedBonusWindow) {
    points += SCORING.maxSpeedBonus;
  } else {
    // Linear decay from speedBonusWindow to questionTime
    const remainingTime = (questionTimeMs / 1000) - SCORING.speedBonusWindow;
    const timeOverWindow = responseTimeSec - SCORING.speedBonusWindow;
    const bonusRatio = Math.max(0, 1 - (timeOverWindow / remainingTime));
    points += Math.round(SCORING.maxSpeedBonus * bonusRatio);
  }

  return points;
}

// Examples (30 second question):
// Answer in 2 seconds, correct:  10 + 5 = 15 points
// Answer in 5 seconds, correct:  10 + 5 = 15 points (within window)
// Answer in 15 seconds, correct: 10 + 3 = 13 points
// Answer in 25 seconds, correct: 10 + 1 = 11 points
// Answer in 30 seconds, correct: 10 + 0 = 10 points
// Wrong answer: 0 points
```

---

## Sub-Phase 3a: VPS Backend

### MySQL Schema

```sql
-- Room table
CREATE TABLE party_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  host_id VARCHAR(36) NOT NULL,
  host_name VARCHAR(50) NOT NULL,
  quiz_data JSON,
  status ENUM('waiting', 'playing', 'ended') DEFAULT 'waiting',
  max_participants INT DEFAULT 20,
  seconds_per_question INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL,
  ended_at TIMESTAMP NULL,
  INDEX idx_code (code),
  INDEX idx_created (created_at)
);

-- Participants table
CREATE TABLE party_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  participant_id VARCHAR(36) NOT NULL,
  name VARCHAR(50) NOT NULL,
  is_host BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL,
  FOREIGN KEY (room_id) REFERENCES party_rooms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_participant (room_id, participant_id)
);

-- Signaling table (for WebRTC offer/answer exchange)
CREATE TABLE party_signaling (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL,
  from_id VARCHAR(36) NOT NULL,
  to_id VARCHAR(36) NOT NULL,
  type ENUM('offer', 'answer', 'ice') NOT NULL,
  payload JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  consumed_at TIMESTAMP NULL,
  INDEX idx_room_to (room_code, to_id, consumed_at)
);
```

### API Endpoints

```
POST   /api/party/rooms           - Create room (returns code)
GET    /api/party/rooms/{code}    - Get room info
POST   /api/party/rooms/{code}/join    - Join room
POST   /api/party/rooms/{code}/leave   - Leave room
POST   /api/party/rooms/{code}/start   - Start quiz (host only)
DELETE /api/party/rooms/{code}    - End/delete room (host only)

POST   /api/party/signal          - Send signaling message
GET    /api/party/signal/{code}/{participantId}  - Poll for messages
```

### Phase 3a Deliverables

- [ ] Create MySQL migration script
- [ ] Implement `RoomManager.php` class
- [ ] Implement `SignalingManager.php` class
- [ ] Create room endpoints (`php-api/src/endpoints/party/`)
- [ ] Create signaling endpoints
- [ ] Add rate limiting (max 10 rooms/hour per IP)
- [ ] Add cleanup cron job (delete rooms > 2 hours old)
- [ ] Unit tests for PHP classes
- [ ] Deploy to staging VPS and test

---

## Sub-Phase 3b: P2P Service

### P2P Service (`src/services/p2p-service.js`)

```javascript
/**
 * WebRTC connection management for party sessions.
 * Handles peer connections, data channels, and reconnection.
 */

export class P2PService {
  constructor(signalingClient) { ... }

  // Connection management
  async createConnection(peerId) { ... }
  async handleOffer(peerId, offer) { ... }
  async handleAnswer(peerId, answer) { ... }
  handleIceCandidate(peerId, candidate) { ... }

  // Data channel
  send(peerId, message) { ... }
  broadcast(message) { ... }
  onMessage(callback) { ... }

  // Connection state
  getConnectionState(peerId) { ... }
  isConnected(peerId) { ... }

  // Cleanup
  disconnect(peerId) { ... }
  disconnectAll() { ... }
}
```

### Signaling Client (`src/services/signaling-client.js`)

```javascript
/**
 * HTTP polling-based signaling for WebRTC connection setup.
 */

export class SignalingClient {
  constructor(baseUrl, roomCode, participantId) { ... }

  // Signaling
  async sendOffer(toPeerId, offer) { ... }
  async sendAnswer(toPeerId, answer) { ... }
  async sendIceCandidate(toPeerId, candidate) { ... }

  // Polling
  startPolling(onMessage) { ... }
  stopPolling() { ... }
}
```

### Phase 3b Deliverables

- [ ] Create `SignalingClient` class
- [ ] Create `P2PService` class with WebRTC wrapper
- [ ] Handle ICE candidates
- [ ] Implement reconnection logic (3 retries)
- [ ] Add connection timeout handling
- [ ] Unit tests with WebRTC mocks
- [ ] Integration test with VPS signaling

---

## Sub-Phase 3c: Party UI

### New Views

- `CreatePartyView.js` - Host creates room, sees code, manages participants
- `JoinPartyView.js` - Guest enters code to join
- `PartyLobbyView.js` - Waiting room for all participants
- `PartyQuizView.js` - Quiz playing with live scores (extends QuizView)
- `PartyResultsView.js` - Final standings (extends ResultsView)

### New Components

- `ParticipantList.js` - Shows all participants with status
- `LiveScoreboard.js` - Real-time score updates
- `RoomCodeDisplay.js` - Large code display with copy button
- `RoomCodeInput.js` - 6-character code input with validation

### Entry Points

Party buttons appear on HomeView when:
1. `MODE_TOGGLE` feature flag is ENABLED
2. User has selected "Party" mode

```javascript
// In HomeView.js
if (isFeatureEnabled('MODE_TOGGLE') && getCurrentMode() === 'party') {
  // Show Create Party and Join Party buttons
}
```

### Phase 3c Deliverables

- [ ] Create `CreatePartyView` with room code display
- [ ] Create `JoinPartyView` with code input
- [ ] Create `PartyLobbyView` with participant list
- [ ] Add Party buttons to HomeView (conditional)
- [ ] Create `ParticipantList` component
- [ ] Create `RoomCodeDisplay` component
- [ ] Create `RoomCodeInput` component
- [ ] Add i18n strings (all 9 locales)
- [ ] Add PARTY_SESSION feature flag
- [ ] Unit tests for components
- [ ] E2E tests for UI flows (with mocked P2P)

---

## Sub-Phase 3d: Live Gameplay

### Party Session Manager (`src/services/party-session.js`)

```javascript
/**
 * Manages party session state for both host and guest.
 * Coordinates quiz progression, scoring, and results.
 */

export class PartySession {
  constructor(p2pService, isHost) { ... }

  // Host methods
  async createSession(quiz) { ... }
  startQuiz() { ... }
  broadcastQuestion(questionIndex) { ... }
  handleAnswer(participantId, answer) { ... }
  endSession() { ... }

  // Guest methods
  async joinSession(roomCode, name) { ... }
  submitAnswer(questionIndex, answerIndex) { ... }
  leaveSession() { ... }

  // Shared
  getCurrentQuestion() { ... }
  getScores() { ... }
  getTimeRemaining() { ... }
  onStateChange(callback) { ... }
}
```

### Time Synchronization

```javascript
// Host broadcasts start time, all peers use it for sync
const sessionState = {
  startTime: Date.now(),  // From host
  secondsPerQuestion: 30,
  currentQuestion: 0,
};

// Calculate current question from time
function getCurrentQuestionIndex(state) {
  const elapsed = Date.now() - state.startTime;
  const questionTime = state.secondsPerQuestion * 1000;
  return Math.floor(elapsed / questionTime);
}

// Calculate time remaining in current question
function getTimeRemaining(state) {
  const elapsed = Date.now() - state.startTime;
  const questionTime = state.secondsPerQuestion * 1000;
  const timeInQuestion = elapsed % questionTime;
  return questionTime - timeInQuestion;
}
```

### Phase 3d Deliverables

- [ ] Create `PartySession` class
- [ ] Implement time synchronization
- [ ] Implement scoring algorithm
- [ ] Create `PartyQuizView` with timer and live scores
- [ ] Create `PartyResultsView` with standings
- [ ] Create `LiveScoreboard` component
- [ ] Handle mid-quiz disconnection (save progress locally)
- [ ] Handle host leaving (end session gracefully)
- [ ] Add all telemetry events
- [ ] Unit tests for PartySession
- [ ] E2E tests for full gameplay flow
- [ ] Maestro tests for mobile

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
│     │     ABC123        │  [📋 Copy]    │
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
│  ┌─────────────────────────────────┐   │
│  │  [❌ Cancel]                    │   │
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
│  Your name:                             │
│  ┌─────────────────────────────────┐   │
│  │ Maria                           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [Join]                         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [← Back]                       │   │
│  └─────────────────────────────────┘   │
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
│  │ B) 1500  ✅ +13 pts             │   │ ← Green, shows points earned
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
│ Party Complete!                         │
├─────────────────────────────────────────┤
│                                         │
│          🏆 WINNER 🏆                   │
│             Maria                        │
│            125 points                    │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Final Standings:                       │
│                                         │
│  🥇 1. Maria     125 pts   (8/10)       │
│  🥈 2. You       110 pts   (7/10)       │
│  🥉 3. João       85 pts   (5/10)       │
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
│ Connection Issue                        │
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

## Configuration

```javascript
const PARTY_CONFIG = {
  // Timing
  defaultSecondsPerQuestion: 30,
  minSecondsPerQuestion: 15,
  maxSecondsPerQuestion: 60,

  // Participants
  maxParticipants: 20,
  minParticipants: 2,  // Need at least 2 to start

  // Room
  roomCodeLength: 6,
  roomExpiryHours: 2,

  // Signaling
  signalingPollInterval: 500,  // ms
  signalingTimeout: 30000,     // ms

  // Connection
  reconnectAttempts: 3,
  reconnectDelay: 2000,  // ms

  // Scoring
  basePoints: 10,
  maxSpeedBonus: 5,
  speedBonusWindow: 5,  // seconds
};
```

---

## Telemetry Events

```javascript
// Room lifecycle
'party_room_created'        // { roomCode }
'party_room_joined'         // { roomCode, participantCount }
'party_room_left'           // { roomCode, reason }
'party_room_started'        // { roomCode, participantCount, questionCount }
'party_room_ended'          // { roomCode, participantCount, duration }

// P2P connection
'p2p_connection_attempt'    // { roomCode, peerId }
'p2p_connection_success'    // { roomCode, peerId, connectionTime }
'p2p_connection_failed'     // { roomCode, peerId, error }
'p2p_reconnect_attempt'     // { roomCode, peerId, attempt }
'p2p_disconnected'          // { roomCode, peerId, reason }

// Gameplay
'party_answer_submitted'    // { roomCode, questionIndex, responseTime, correct }
'party_question_timeout'    // { roomCode, questionIndex }
```

---

## i18n Strings

```javascript
// Party - General
"party.create": "Create Party",
"party.join": "Join Party",
"party.code": "Room Code",
"party.copyCode": "Copy Code",
"party.codeCopied": "Code copied!",
"party.shareCode": "Share this code with friends",
"party.yourName": "Your name",
"party.enterCode": "Enter room code",
"party.invalidCode": "Invalid room code",
"party.roomNotFound": "Room not found",
"party.roomFull": "Room is full",

// Party - Participants
"party.participants": "Participants",
"party.host": "host",
"party.you": "You",
"party.waiting": "Waiting for host to start...",
"party.minParticipants": "Need at least {count} players to start",

// Party - Actions
"party.start": "Start Quiz",
"party.leave": "Leave Party",
"party.cancel": "Cancel",
"party.back": "Back",

// Party - Gameplay
"party.question": "Question {current}/{total}",
"party.timeRemaining": "Time remaining",
"party.liveScores": "Live Scores",
"party.waitingForOthers": "Waiting for others...",
"party.answered": "answered",
"party.thinking": "thinking",
"party.points": "+{points} pts",

// Party - Results
"party.complete": "Party Complete!",
"party.winner": "Winner",
"party.finalStandings": "Final Standings",
"party.shareResults": "Share Results",
"party.playAgain": "Play Again",

// Party - Errors
"party.connectionIssue": "Connection Issue",
"party.lostConnection": "Lost connection to party",
"party.reconnecting": "Attempting to reconnect...",
"party.retry": "Retry Now",
"party.hostLeft": "Host has left the party",
"party.yourProgress": "Your progress",
"party.score": "Score: {points} points",
"party.answeredCount": "Answered: {answered}/{total} questions",
"party.saveLocally": "Save Quiz Locally",
```

---

## Testing Strategy

### Unit Tests (with mocks)

```
signaling-client.test.js:
  - sends offer to correct endpoint
  - sends answer to correct endpoint
  - polls for messages at correct interval
  - stops polling when requested
  - handles network errors gracefully

p2p-service.test.js:
  - creates RTCPeerConnection with correct config
  - creates data channel
  - generates valid SDP offer
  - accepts valid SDP answer
  - handles ICE candidates
  - sends messages through data channel
  - receives messages from data channel
  - handles connection close
  - attempts reconnection on failure

party-session.test.js:
  - host creates session with quiz
  - host gets room code from VPS
  - guest joins with valid code
  - participant list updates on join/leave
  - calculates correct question from time
  - scoring formula is accurate
  - host can start quiz
  - answers are validated correctly
  - scores broadcast to all participants
  - session ends when all questions done
  - handles host disconnect
  - handles guest disconnect
```

### E2E Tests (Playwright)

**Note:** Full P2P testing is complex. E2E tests will use a mock signaling server and test UI flows.

```
party-create.spec.js:
  - party buttons visible only in party mode
  - create party shows room code
  - copy button copies code to clipboard
  - cancel returns to home

party-join.spec.js:
  - join party accepts valid code format
  - invalid code shows error
  - room not found shows error
  - successful join shows lobby

party-lobby.spec.js:
  - lobby shows all participants
  - lobby shows quiz info
  - host sees start button
  - guest does not see start button
  - leave button returns to home

party-gameplay.spec.js (with mocked P2P):
  - quiz starts for all players
  - timer counts down
  - selecting answer shows feedback
  - scores update after each question
  - results shown at end
```

### Maestro Tests (Mobile)

```yaml
# 16-party-mode-required.yaml
- launchApp
- assertNotVisible: "Create Party"  # Not visible in learning mode
- tapOn: "Party"  # Switch to party mode
- assertVisible: "Create Party"
- assertVisible: "Join Party"

# 17-create-party.yaml
- launchApp
- tapOn: "Party"
- tapOn: "Create Party"
- assertVisible: "Room Code"
- assertVisible: "Copy Code"
- tapOn: "Cancel"
- assertVisible: "Create Party"

# 18-join-party.yaml
- launchApp
- tapOn: "Party"
- tapOn: "Join Party"
- assertVisible: "Enter room code"
- inputText:
    id: "roomCode"
    text: "INVALID"
- tapOn: "Join"
- assertVisible: "Room not found"
```

---

## Complete Checklist by Sub-Phase

### Phase 3a: VPS Backend

- [ ] Create MySQL migration script
- [ ] Implement RoomManager.php
- [ ] Implement SignalingManager.php
- [ ] Create room endpoints
- [ ] Create signaling endpoints
- [ ] Add rate limiting
- [ ] Add cleanup cron job
- [ ] PHP unit tests
- [ ] Deploy to staging VPS
- [ ] Test endpoints manually

### Phase 3b: P2P Service

- [ ] Create SignalingClient class
- [ ] Create P2PService class
- [ ] Implement WebRTC connection flow
- [ ] Handle ICE candidates
- [ ] Implement reconnection logic
- [ ] Unit tests with mocks
- [ ] Integration test with staging VPS

### Phase 3c: Party UI

- [ ] Add PARTY_SESSION feature flag
- [ ] Add Party buttons to HomeView (conditional)
- [ ] Create CreatePartyView
- [ ] Create JoinPartyView
- [ ] Create PartyLobbyView
- [ ] Create RoomCodeDisplay component
- [ ] Create RoomCodeInput component
- [ ] Create ParticipantList component
- [ ] Add i18n strings (all 9 locales)
- [ ] Unit tests for components
- [ ] E2E tests for UI flows

### Phase 3d: Live Gameplay

- [ ] Create PartySession class
- [ ] Implement time synchronization
- [ ] Implement scoring algorithm
- [ ] Create PartyQuizView
- [ ] Create PartyResultsView
- [ ] Create LiveScoreboard component
- [ ] Handle disconnections
- [ ] Handle host leaving
- [ ] Add telemetry events
- [ ] Unit tests for PartySession
- [ ] E2E tests for gameplay
- [ ] Maestro tests
- [ ] Deploy to staging
- [ ] Manual testing
- [ ] Deploy to production

---

**Last Updated:** 2026-01-09
