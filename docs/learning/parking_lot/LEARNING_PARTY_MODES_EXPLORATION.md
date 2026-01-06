# Learning & Party Modes Exploration

**Status:** Exploration Phase
**Created:** 2026-01-06
**Last Updated:** 2026-01-06

---

## Context & Vision

### The Insight

Saberloop was initially designed as a solo learning tool, but user feedback has revealed two distinct use cases:

1. **Learning Mode** - Individual or study group focused on knowledge acquisition
2. **Party Mode** - Social entertainment (like board games, similar to Kahoot)

### Key Differentiator from Competitors

Unlike Kahoot where content creation is slow and manual, Saberloop can generate quiz content instantly via AI. This speed advantage becomes more valuable in social settings where spontaneity matters.

### Strategic Goals

1. **Improve app attractiveness** - Two modes broadens appeal
2. **Experiment with P2P technologies** - Exchange information between users with minimal central control/storage

---

## Initial Feature Ideas

From the user's initial brainstorming:

| Feature | Description |
|---------|-------------|
| **UI Mode Selection** | Widget to switch between Learn/Party modes with different color schemes |
| **Q&A Labeling** | Questions tagged as "learn", "party", or "both" |
| **Friend Discovery** | Address/key system (no login required), share via external apps (WhatsApp, etc.) |
| **Group Creation** | Named groups with participants, synced across members |
| **Content Sharing** | Send Q&A sets to friends or groups |
| **Social Scoring** | Competitive element between friends (TBD) |

---

## Related Documentation

- [Decentralized Storage Investigation](./investigation_decentralized_storage.md) - P2P approaches including IPFS, Pears/Hypercore, and "Pear Lite" hybrid
- [Phase 70 V2: Sharing Features](./PHASE70_V2_SHARING_FEATURES.md) - Challenge a Friend, Achievement Levels, etc.

---

## Exploration Iterations

### Iteration 1: Goals & Core Value Proposition

**Date:** 2026-01-06

#### Key Decisions Made:

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Host vs P2P?** | P2P - everyone sees questions simultaneously without a leader | Aligns with decentralized philosophy; more egalitarian experience |
| **Infrastructure complexity?** | Complex: True P2P sync via Pears/WebRTC | No central server dependency; experiments with cutting-edge tech |
| **Question pool sharing?** | Same structure, tagged with "learning"/"party"/"both" | Maximizes content reuse; single data model |

#### Architecture Implications:

1. **No host = distributed consensus** - Need mechanism to synchronize "current question" across peers
2. **P2P sync = WebRTC/Pears** - Must handle NAT traversal, peer discovery, connection management
3. **Same structure + labels** - Simple schema change: add `mode: "learning" | "party" | "both"` field

#### Problem/User/Value Matrix:

| Mode | Problem Solved | Target User | Why Saberloop? |
|------|----------------|-------------|----------------|
| **Learning (Solo)** | "I want to test my knowledge" | Student, professional, curious person | AI generates questions instantly |
| **Learning (Group)** | "We want to study together" | Study groups, classrooms | Shared content, async or sync |
| **Party** | "We want fun entertainment now" | Friends at parties, family gatherings | No prep time, spontaneous topics |

---

### Iteration 2: UI/UX Concepts & Tech Stack

**Date:** 2026-01-06

#### Key Decisions Made:

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Mode selection UI?** | Toggle in header (persistent) | Always accessible, mode context visible |
| **P2P approach?** | Hybrid "Pear Lite" | WebRTC for real-time, VPS for signaling/fallback, Hypercore when possible |
| **Party sync mechanism?** | Time-based deterministic | All peers derive current question from shared start time + elapsed time |

#### UI Concept: Header Toggle

```
┌─────────────────────────────────┐
│ SABERLOOP    [📚 Learn|🎉 Party]│
│─────────────────────────────────│
│                                 │
│   (app adapts colors to mode)   │
│                                 │
└─────────────────────────────────┘
```

#### Color Schemes:

| Element | Learning Mode | Party Mode |
|---------|---------------|------------|
| Primary | Blue (#3B82F6) | Orange (#F97316) |
| Background | Light/calm | Darker/vibrant |
| Vibe | Focused, professional | Energetic, playful |

#### Technical Architecture: Pear Lite Hybrid

```
┌─────────────────────────────────────────────────────────┐
│                    PEAR LITE HYBRID                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Real-time Sync (Party Mode):                          │
│  ┌──────────┐  WebRTC  ┌──────────┐                    │
│  │ Phone A  │◄────────►│ Phone B  │                    │
│  └────┬─────┘          └────┬─────┘                    │
│       │                     │                          │
│       └──────────┬──────────┘                          │
│                  │ signaling only                      │
│           ┌──────▼──────┐                              │
│           │   Your VPS  │                              │
│           └─────────────┘                              │
│                                                         │
│  Content Sharing (Async):                              │
│  - Hypercore when peers online                         │
│  - VPS fallback when peers offline                     │
│  - Local IndexedDB cache always                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Friend Discovery (No Login):

```
┌─────────────────────────────────────────────┐
│ Your Saberloop ID:                          │
│                                             │
│  SL-7x9k-m2p4-q8r3                          │
│                                             │
│  [📋 Copy]  [📱 QR Code]  [📤 Share]        │
│                                             │
│  Share via WhatsApp, text, or QR code       │
└─────────────────────────────────────────────┘
```

- Cryptographic keypair generated on first launch
- Public key truncated = user ID
- No server account needed

#### Party Sync: Time-Based Deterministic

```
Quiz Session = {
  questions: [...],
  startTime: 1704567890000,  // agreed timestamp
  secondsPerQuestion: 30
}

Current Question Index = floor((now - startTime) / secondsPerQuestion)

All devices calculate independently → same result
```

---

### Iteration 3: Feasibility Assessment

**Date:** 2026-01-06

#### Technical Feasibility Matrix

| Component | Difficulty | Risk | Notes |
|-----------|------------|------|-------|
| Mode toggle + color themes | Low | Low | CSS variables, simple state |
| Q&A mode labeling | Low | Low | Schema addition to IndexedDB |
| Cryptographic ID generation | Low | Low | Web Crypto API, store in IndexedDB |
| QR code for ID sharing | Low | Low | Libraries exist (qrcode.js) |
| **WebRTC data channels** | Medium | Medium | Browser support good, NAT traversal tricky |
| Signaling server (VPS) | Medium | Low | PHP/WebSocket on LAMP stack |
| Time sync across devices | Medium | Medium | Clock drift, need consensus mechanism |
| Hypercore in browser | High | High | Limited browser support, may need polyfills |
| Group state consensus | High | High | Distributed systems are hard |

---

#### Deep Dive: WebRTC Data Channels

**What is WebRTC?**

WebRTC (Web Real-Time Communication) is a browser API for direct peer-to-peer connections. Originally for video/audio, it also supports data channels (arbitrary data like quiz state).

```
Traditional HTTP:              WebRTC (after connection):
Phone A ──► Server ──► Phone B    Phone A ◄──────► Phone B
       (all data via server)            (direct, no server)
```

**Browser Support:**

| Browser | Support |
|---------|---------|
| Chrome/Edge | Excellent |
| Firefox | Excellent |
| Safari/iOS | Good (some quirks) |
| Android WebView | Good |

~95% of users have WebRTC support. Browser support is NOT the risk.

**The NAT Traversal Problem (The Real Risk):**

Phones are behind routers/firewalls with private IPs. WebRTC uses ICE to solve this:

- **STUN server** - Discovers public IP (free, Google provides these)
- **TURN server** - Relays data if direct fails (costs money)

| Scenario | Success Rate |
|----------|--------------|
| Same WiFi network | ~99% |
| Different networks, good NAT | ~85% |
| Symmetric NAT (strict routers) | ~60% |
| Corporate firewalls | ~40% |

**Good news**: Party mode on same WiFi = very high success rate.

---

#### WebRTC vs P2P vs Pears - Clarification

| Technology | What It Is | Layer |
|------------|------------|-------|
| **P2P** | A concept/pattern | Architecture pattern |
| **WebRTC** | Browser API for P2P connections | Transport layer |
| **Pears/Hypercore** | P2P data sync protocol | Application layer |

**Relationship:**
```
┌─────────────────────────────────────────────────┐
│  YOUR APP LOGIC (quiz sync, scoring, groups)   │
├─────────────────────────────────────────────────┤
│  PEARS/HYPERCORE (optional)                    │
│  - Append-only logs, conflict resolution       │
├─────────────────────────────────────────────────┤
│  TRANSPORT: WebRTC | hyperswarm | WebSocket    │
└─────────────────────────────────────────────────┘
```

| Aspect | WebRTC | Pears/Hypercore |
|--------|--------|-----------------|
| Purpose | Transport bytes | Structure and sync data |
| Built into browser? | Yes | No (needs library) |
| Handles offline? | No | Yes |
| Conflict resolution? | No | Yes |
| Maturity in browsers | Excellent | Experimental |

**Implication for Pear Lite:**
- WebRTC for real-time party sync (proven, works today)
- Hypercore for async content sharing (add later)
- VPS fallback for reliability

---

#### Decisions (Q10, Q11)

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Q10**: Start WebRTC-only? | Yes | Proven tech, works today; add Hypercore later for async |
| **Q11**: TURN server strategy? | Accept failures + telemetry | Start simple; track failure rate to inform future decision |

**Telemetry events to add:**
- `p2p_connection_attempt` - started WebRTC connection
- `p2p_connection_success` - direct connection established
- `p2p_connection_failed` - connection failed (with reason if available)
- `p2p_fallback_used` - had to use VPS fallback (future)

---

#### Deep Dive: Signaling Server (VPS)

**What is Signaling?**

WebRTC needs peers to exchange connection info before connecting directly. This happens via a signaling server.

```
1. Phone A: "I want to start session" → VPS stores offer
2. Phone B: "I want to join" → VPS returns offer, stores answer
3. Phone A: polls → receives answer
4. DIRECT CONNECTION (VPS no longer needed)
```

**Approach for LAMP Stack:**

| Option | Chosen? | Notes |
|--------|---------|-------|
| Polling (PHP) | ✅ Yes | Simple, works, 500ms latency acceptable |
| WebSocket (Node.js) | No | Would need to add Node alongside Apache |
| External service | No | Adds dependency |

**Why polling is acceptable:**
- Signaling happens once per session (not continuous)
- 500ms delay is fine for "starting a game"
- Can upgrade to WebSocket later if needed

**Room Code Options:**

| Option | Use Case |
|--------|----------|
| Short codes "ABC123" | Easy verbal sharing at parties |
| Cryptographic ID | Consistent with friend discovery system |

**Decision**: Support both options.

---

#### Deep Dive: Time Sync Across Devices

**The Problem:**

For time-based deterministic sync, all devices need to agree on "what time is it?"

```
Phone A clock: 12:00:00.000
Phone B clock: 12:00:01.500  (1.5 sec ahead)
Phone C clock: 11:59:58.200  (1.8 sec behind)

→ Different phones might show different questions!
```

**Reality check**: Most smartphones sync via NTP. Drift is usually < 1 second.

**Solution: Coordinator + Generous Timing**

```
1. Session creator becomes "time coordinator"
2. Coordinator broadcasts: { startTime: 1704567890000 }
3. All peers calculate question index from this startTime
4. Use 30+ seconds per question → 1-2 sec drift doesn't matter
5. Show countdown timer to mask small differences
```

**Decisions (Q14, Q15):**

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Q14**: Coordinator broadcasts startTime? | Yes | Simple, effective |
| **Q15**: Question timing? | Configurable, default 30 sec | Balance excitement with sync tolerance |

---

### Iteration 4: Contrarian Thinking

**Date:** 2026-01-06

*(To be filled during iteration)*

---

### Iteration 5: Outside-the-Box Ideas

**Date:** 2026-01-06

*(To be filled during iteration)*

---

## Conversation Log

### Session 1 (2026-01-06)

**User's Initial Request:**

> "i understand there are 2 major use cases: learning and playing. initially i was only aiming for the learning part but now i can see it fits well into the playing one. also i was thinking of as individual use of the app, meaning that i wasnt seeing the possibility of using the app as part of a group: learning/study group; party group (like playing a board game). and also that it might interesting, while using as a group, to do it synchronously."

**Key Insights from User:**
- Uniqueness = AI-powered instant content generation (vs Kahoot's manual creation)
- No-login philosophy should be preserved
- P2P approach aligns with existing decentralized storage research
- Two visual identities (color schemes) but same underlying engine

**Features Discussed:**
1. UI - different color schemes + mode selector widget
2. Q&A storage - new label for learn/party/both
3. Finding friends - address/key concept, out-of-band sharing
4. Group creation - shared group definitions
5. Content sharing - send Q&A between users
6. Social scoring - competitive elements (undefined)

---

*Document will be updated after each exploration iteration*
