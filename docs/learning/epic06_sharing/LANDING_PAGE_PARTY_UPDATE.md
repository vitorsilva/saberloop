# Landing Page Party Mode Update

**Status:** Planning
**Created:** 2026-01-09
**Epic:** 06 - Sharing Features
**Depends on:** Phase 3 (Party Sessions) - Complete

---

## Overview

Update the landing page to showcase the new Party Mode functionality. This is a key differentiator that transforms Saberloop from a solo learning tool into a social quiz experience.

**Key Value Proposition:** "Challenge friends in real-time quiz battles"

---

## Current Landing Page Structure

| Section | Content | Party Mode Impact |
|---------|---------|-------------------|
| Hero | Video demo, title, subtitle | Update subtitle to mention multiplayer |
| Features | 6 cards (AI, Language, Adaptive, Levels, Offline, Privacy) | Add Party Mode card |
| How It Works | 4 steps | Add optional "Or play with friends" note |
| Screenshots | 5 screenshots | Add party mode screenshot(s) |
| Share Section | "Share Your Progress" | Could expand to include party challenges |
| CTA | Try Free / Unlimited | Could mention party feature |

---

## Implementation Plan

### 1. Add Party Mode Feature Card

**Location:** Features grid (currently 6 cards in 3x2 layout)

**New card to add:**
```html
<div class="feature-card">
    <div class="feature-icon">🎉</div>
    <h3>Party Mode</h3>
    <p>Challenge friends in real-time quiz battles. Create a room, share the code, compete live!</p>
</div>
```

**Grid update:** 6 cards → 7 cards (will need CSS adjustment or replace one)

**Options:**
- **A)** Replace one existing card (e.g., merge "Adaptive Difficulty" with "All Skill Levels")
- **B)** Keep 7 cards with adjusted grid (3-4 or 4-3 layout)
- **C)** Keep 6 cards, make Party Mode more prominent in a dedicated section

**Recommendation:** Option B - Keep all 7 cards. Party Mode is a major feature worth highlighting alongside existing ones.

---

### 2. Update Hero Subtitle

**Current:**
> "AI-powered quizzes on any topic, in 5 languages, with explanations that help you truly understand. Free to try, works offline."

**Proposed:**
> "AI-powered quizzes on any topic, in 5 languages. Learn solo or challenge friends in real-time Party Mode. Free to try, works offline."

---

### 3. Add Party Mode Screenshot

**Location:** Screenshots grid (currently 5 screenshots)

**Screenshot to add:** Party lobby or gameplay showing live scores

**Available assets:**
- `docs/product-info/screenshots/party/02-home-party-mode.png` - Shows Party buttons
- `docs/product-info/screenshots/party/05-party-lobby-participants.png` - Shows lobby with players
- `docs/product-info/screenshots/party/06-party-quiz-gameplay.png` - Shows live quiz with scoreboard
- `docs/product-info/screenshots/party/07-party-results.png` - Shows final leaderboard

**Recommendation:** Use `06-party-quiz-gameplay.png` - it's the most visually compelling, showing the competitive aspect with live scores.

**Processing needed:**
1. Copy party screenshot to `landing/images/`
2. Process with Sharp script to match dimensions (304x584)

---

### 4. Update Meta Description & OG Tags

**Current meta description:**
> "Saberloop - AI-powered quizzes on any topic in 5 languages. Get explanations for wrong answers, adaptive difficulty, and works offline."

**Proposed:**
> "Saberloop - AI-powered quizzes on any topic in 5 languages. Learn solo or challenge friends in Party Mode. Works offline."

---

### 5. Optional: Party Mode Section (Alternative to Card)

Instead of just adding a feature card, we could add a dedicated section for Party Mode:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Challenge Your Friends                        │
│  ┌───────────────────────┐  ┌─────────────────────────────────┐ │
│  │                       │  │                                 │ │
│  │   [Party Screenshot]  │  │  🎉 Party Mode                  │ │
│  │                       │  │                                 │ │
│  │                       │  │  Create a quiz room, share the  │ │
│  │                       │  │  code with friends, and compete │ │
│  │                       │  │  in real-time!                  │ │
│  │                       │  │                                 │ │
│  │                       │  │  • Real-time multiplayer        │ │
│  │                       │  │  • Live leaderboard             │ │
│  │                       │  │  • No accounts needed           │ │
│  │                       │  │                                 │ │
│  └───────────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Recommendation:** Start with the simpler approach (feature card + screenshot). If analytics show interest, expand to dedicated section later.

---

## Implementation Checklist

### Phase 1: Assets Preparation
- [ ] Process party screenshot for landing page dimensions
- [ ] Copy processed screenshot to `landing/images/`
- [ ] Verify screenshot displays correctly

### Phase 2: Landing Page Updates
- [ ] Update hero subtitle to mention Party Mode
- [ ] Add Party Mode feature card to grid
- [ ] Adjust CSS grid if needed (6 → 7 cards)
- [ ] Add party screenshot to screenshots section
- [ ] Update meta description
- [ ] Update OG description

### Phase 3: Testing & Deploy
- [ ] Test responsive layout (mobile, tablet, desktop)
- [ ] Verify all images load correctly
- [ ] Deploy to production
- [ ] Verify live site

---

## Files to Modify

| File | Changes |
|------|---------|
| `landing/index.html` | Hero subtitle, feature card, screenshot, meta tags |
| `landing/images/` | Add `landing-party-gameplay.png` |

---

## Success Metrics

Track in Google Analytics:
- Click-through to app from landing page (existing)
- Scroll depth to Party Mode section (existing scroll tracking)
- Time on page (should increase with more content)

---

## Notes

- Keep changes minimal - Party Mode is an addition, not a redesign
- Follow existing visual style (dark background, orange accents)
- Test on mobile first - most traffic is mobile

---

**Created:** 2026-01-09
