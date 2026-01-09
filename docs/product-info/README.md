# Product Info & Marketing Assets

This directory contains all marketing assets, screenshots, videos, and copy for Saberloop.

---

## Directory Structure

```
docs/product-info/
├── README.md                    # This file - asset index
├── playstore-listing-update.md  # Play Store copy (descriptions, what's new)
├── quiz-generator-exploration.md # AI model exploration notes
│
├── logos/                       # App logos and icons
│   └── [logo files]
│
├── mockups/                     # UI mockups and designs
│   └── [mockup files]
│
├── screenshots/                 # App screenshots
│   ├── landing/                 # Landing page assets
│   ├── playstore/               # Play Store listing screenshots
│   └── party/                   # Party mode screenshots
│
└── videos/                      # Demo videos
    └── party-mode-demo.webm     # Party mode feature demo
```

---

## Screenshots

### Play Store Screenshots
**Location:** `screenshots/playstore/`
**Capture Script:** `tests/e2e/capture-playstore-screenshots.spec.js`

| File | Description |
|------|-------------|
| `01-quiz-question.png` | Quiz in action with question and answers |
| `02-explanation-modal.png` | AI explanation for wrong answer |
| `03-results-continue.png` | Results page with Continue button |
| `04-settings.png` | Settings page |
| `05-home-history.png` | Home with quiz history |
| `06-share-results.png` | Share results feature |
| `07-topic-input.png` | Topic input screen |
| `08-portuguese-quiz.png` | Multi-language support |

### Landing Page Screenshots
**Location:** `screenshots/landing/`
**Capture Script:** `tests/e2e/capture-landing-assets.spec.js`

| File | Description |
|------|-------------|
| `landing-explanation-modal.png` | Explanation feature showcase |
| `landing-share-results.png` | Share feature showcase |
| `landing-usage-cost.png` | Usage cost transparency |

### Party Mode Screenshots
**Location:** `screenshots/party/`
**Capture Script:** `tests/e2e/capture-party-demo.spec.js`

| File | Description |
|------|-------------|
| `01-home-learning-mode.png` | Home in Learning mode |
| `02-home-party-mode.png` | Home in Party mode with buttons |
| `03-create-party-select-quiz.png` | Quiz selection for party |
| `04-room-code-created.png` | Room code display |
| `05-party-lobby-participants.png` | Lobby with participants |
| `06-party-quiz-gameplay.png` | Live quiz gameplay |
| `07-party-results.png` | Final leaderboard |

---

## Videos

### Party Mode Demo
**Location:** `videos/party-mode-demo.webm`
**Storyboard:** `../learning/epic06_sharing/PARTY_MODE_DEMO_VIDEO.md`
**Capture Script:** `tests/e2e/capture-party-demo.spec.js`
**Duration:** ~60 seconds

**Scenes:**
1. Mode toggle: Learning → Party
2. Host creates party, gets room code
3. Guest joins with code
4. Party lobby with participants
5. Live quiz gameplay with scoreboard
6. Final results with leaderboard

---

## Regenerating Assets

### Screenshots

```bash
# Play Store screenshots
npx playwright test tests/e2e/capture-playstore-screenshots.spec.js --headed

# Landing page screenshots
npx playwright test tests/e2e/capture-landing-assets.spec.js --headed

# Party mode screenshots & video
npx playwright test tests/e2e/capture-party-demo.spec.js --headed
```

### Notes

- Run with `--headed` to see the browser during capture
- Screenshots are saved directly to their target directories
- Videos are saved to `test-results/` then copied to `videos/`

---

## Play Store Listing

See `playstore-listing-update.md` for:
- Short description (80 char)
- Full description (4000 char)
- What's New text
- Feature highlights

---

## Feature Flags for Capture

Some features require feature flags to be enabled:

```javascript
// Party mode
localStorage.setItem('__test_feature_MODE_TOGGLE', 'ENABLED');
localStorage.setItem('__test_feature_PARTY_SESSION', 'ENABLED');

// Explanation feature
// (enabled by default)

// Share feature
// (enabled by default)
```

---

**Last Updated:** 2026-01-09
