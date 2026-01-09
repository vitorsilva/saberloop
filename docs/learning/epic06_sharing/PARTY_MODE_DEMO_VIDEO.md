# Party Mode Demo Video - Production Plan

**Created:** 2026-01-09
**Purpose:** Demonstrate the Party Mode functionality for marketing/documentation
**Duration Target:** 45-60 seconds

---

## Video Overview

This video showcases the complete Party Mode flow in Saberloop, demonstrating how users can play quizzes together in real-time with friends.

---

## Storyboard

### Act 1: Introduction (0:00 - 0:08)
**Setting the scene - Learning Mode to Party Mode transition**

| Time | Screen | Action | Visual Focus |
|------|--------|--------|--------------|
| 0:00-0:03 | Home (Learning Mode) | App opens showing home screen in Learning mode | Mode toggle showing "Learn" selected |
| 0:03-0:05 | Home | User taps "Party" button in mode toggle | Toggle animation |
| 0:05-0:08 | Home (Party Mode) | Theme changes to party mode, purple buttons appear | "Create Party" and "Join Party" buttons fade in |

**Key Message:** Switching from solo learning to social play is one tap away.

---

### Act 2: Host Creates Party (0:08 - 0:22)
**The host journey - creating and sharing a room**

| Time | Screen | Action | Visual Focus |
|------|--------|--------|--------------|
| 0:08-0:10 | Home | User taps "Create Party" button | Button press animation |
| 0:10-0:14 | Create Party | Quiz selection screen appears, user selects a quiz | Quiz list with topics |
| 0:14-0:16 | Create Party | User taps "Create Party" button | Loading spinner |
| 0:16-0:20 | Create Party | Room code appears (e.g., "ABC123") | Large, prominent room code display |
| 0:20-0:22 | Create Party | User taps share button | Share options appear |

**Key Message:** Create a party in seconds, get a code to share with friends.

---

### Act 3: Guest Joins Party (0:22 - 0:32)
**The guest journey - joining with a code**

| Time | Screen | Action | Visual Focus |
|------|--------|--------|--------------|
| 0:22-0:24 | Home (Guest device) | Guest in Party mode, taps "Join Party" | Second device/split screen |
| 0:24-0:27 | Join Party | Guest enters room code "ABC123" | Room code input with validation |
| 0:27-0:29 | Join Party | Guest enters name "Alex" | Name input field |
| 0:29-0:32 | Join Party | Guest taps "Join" button, loading | Connecting animation |

**Key Message:** Joining is simple - just enter the code and your name.

---

### Act 4: Party Lobby (0:32 - 0:40)
**Waiting room - participants gathering**

| Time | Screen | Action | Visual Focus |
|------|--------|--------|--------------|
| 0:32-0:35 | Party Lobby (Host) | Host sees guest "Alex" join | Participant list updating |
| 0:35-0:37 | Party Lobby | Another guest "Sam" joins | Participant count: 3 |
| 0:37-0:40 | Party Lobby | Host taps "Start Quiz" button | Green start button |

**Key Message:** See who's joined and start when everyone's ready.

---

### Act 5: Live Gameplay (0:40 - 0:52)
**The quiz experience - competing in real-time**

| Time | Screen | Action | Visual Focus |
|------|--------|--------|--------------|
| 0:40-0:42 | Party Quiz | Question appears with countdown timer | Timer bar at top |
| 0:42-0:45 | Party Quiz | Player selects answer option B | Option highlighting |
| 0:45-0:47 | Party Quiz | Answer submitted, shows correct/incorrect | Feedback animation |
| 0:47-0:50 | Party Quiz | Live scoreboard updates | Score changes in real-time |
| 0:50-0:52 | Party Quiz | Next question appears | Smooth transition |

**Key Message:** Race against friends - faster correct answers earn more points!

---

### Act 6: Results & Celebration (0:52 - 1:00)
**Final leaderboard - celebrating the winner**

| Time | Screen | Action | Visual Focus |
|------|--------|--------|--------------|
| 0:52-0:55 | Party Results | Final leaderboard appears | Podium-style ranking |
| 0:55-0:57 | Party Results | Winner highlighted with celebration | Confetti/animation |
| 0:57-1:00 | Party Results | "Play Again" and "Share" buttons | Call to action |

**Key Message:** Celebrate victories and challenge friends to a rematch!

---

## Technical Requirements

### Screen Recording Setup
- **Resolution:** 1080x1920 (9:16 portrait for mobile)
- **Frame Rate:** 60fps
- **Format:** WebM (primary), MP4 (fallback)

### Feature Flags Required
```javascript
// Enable for recording
localStorage.setItem('__test_feature_MODE_TOGGLE', 'ENABLED');
localStorage.setItem('__test_feature_PARTY_SESSION', 'ENABLED');
```

### Test Data Required
- Pre-loaded quiz with 5 questions on engaging topic
- 3 participant names: "You" (host), "Alex", "Sam"
- Room code: Use generated or mock "DEMO01"

### Simulated Elements
Since actual P2P requires multiple devices, the video script will:
1. Use mock participant joins (simulated via JavaScript)
2. Simulate score updates during gameplay
3. Pre-determine winner for consistent results

---

## Script File Location

**Playwright Script:** `scripts/capture-party-demo.js`

This script can be re-run anytime to regenerate the video with:
```bash
npx playwright test scripts/capture-party-demo.js
```

---

## Output Files

| File | Purpose |
|------|---------|
| `docs/product-info/videos/party-mode-demo.webm` | Primary demo video |
| `docs/product-info/videos/party-mode-demo.mp4` | Fallback format |
| `docs/product-info/screenshots/party/` | Key frame screenshots |

---

## Notes for Future Updates

1. **If UI changes:** Update the storyboard timing and re-run script
2. **If features added:** Add new acts/scenes to storyboard first
3. **If branding changes:** Update color references in visual focus notes
4. **Re-recording:** Simply run `npm run capture:party-demo`

---

**Last Updated:** 2026-01-09
