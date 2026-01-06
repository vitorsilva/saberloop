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
