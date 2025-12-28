# Landing Page Improvement Plan

**Goal:** Increase visitor-to-user conversion by showcasing the full value of Saberloop's features.

**Status:** Planning
**Created:** 2025-12-28

---

## Current State Analysis

### What the Landing Page Shows (4 features)
1. AI-Generated Questions
2. Works Offline
3. Privacy First
4. Free to Use

### What's Actually Implemented (but hidden)
| Feature | User Value | Priority |
|---------|------------|----------|
| **Multi-language support** (EN, PT, ES, FR, DE) | Global reach, native language learning | HIGH |
| **AI explanations for wrong answers** | Deeper understanding, not just scores | HIGH |
| **Adaptive difficulty (Continue Topic)** | Progressive learning, mastery path | HIGH |
| **Share results to social** | Social proof, engagement | MEDIUM |
| **AI model selection** | Choice, cost control | MEDIUM |
| **Configurable question count** (5/10/15) | Flexibility, time control | MEDIUM |
| **Full quiz history & replay** | Long-term tracking | MEDIUM |
| **Grade level customization** | Age-appropriate content | HIGH |
| **Progress tracking with score badges** | Motivation, gamification | MEDIUM |

---

## Improvement Plan

### Phase 1: Feature Cards Expansion (High Impact)

**Current:** 4 feature cards
**Proposed:** 6 feature cards (replace/reorganize)

Replace current cards with these 6:

1. **🧠 AI-Powered Learning** (keep, enhance)
   - "Unique questions on any topic, with detailed explanations when you get it wrong"

2. **🌍 Learn in Your Language** (NEW)
   - "Quizzes in English, Portuguese, Spanish, French, or German"

3. **📈 Adaptive Difficulty** (NEW)
   - "Continue on any topic with increasing difficulty. Master subjects step by step"

4. **🎓 All Skill Levels** (NEW)
   - "From elementary to college level — questions adapted to your knowledge"

5. **📱 Works Offline** (keep)
   - "Review past quizzes and replay topics even without internet"

6. **🔒 Privacy First** (keep)
   - "All data stays on your device. No accounts, no tracking"

**Remove:** "Free to Use" card (becomes part of CTA section messaging instead)

---

### Phase 2: How It Works Enhancement

**Current:** 3 steps
**Proposed:** 4 steps (add explanation step)

1. **Enter Any Topic** (keep)
   - "Type any subject — history, science, coding, languages, anything!"

2. **Customize Your Quiz** (NEW)
   - "Choose your level, language, and number of questions"

3. **Take the Quiz** (rename from "Get Quiz Questions")
   - "AI generates unique multiple-choice questions instantly"

4. **Learn From Mistakes** (enhance from "Learn & Improve")
   - "Get AI explanations for wrong answers. Continue to master the topic"

---

### Phase 3: New Screenshots

**Current:** 2 screenshots (Welcome, Home)
**Proposed:** 4 screenshots showing key differentiators

1. **Quiz in action** — showing question with progress bar
2. **Explanation modal** — showing AI explanation for wrong answer
3. **Results with Continue button** — showing score + "Continue Topic" option
4. **Settings screen** — showing language/level/model customization

**Action:** Create new screenshots capturing these screens

---

### Phase 4: Social Proof & Engagement Section (NEW)

Add section between Screenshots and CTA:

**"Share Your Progress"**
- Show share card preview (what gets shared to Twitter/Facebook)
- "Challenge friends and track your learning journey"
- Visual: mockup of share card with score

---

### Phase 5: CTA Section Enhancement

**Current:** "Ready to Start Learning?"
**Proposed:** Two-column approach

**Left column: "Try Free"**
- Sample quizzes available immediately
- No account needed
- Web app link prominent

**Right column: "Unlimited Learning"**
- Connect your OpenRouter account
- Choose your AI model
- Generate unlimited quizzes

---

### Phase 6: Quick Wins (CSS/Copy)

1. **Hero subtitle enhancement:**
   - Current: "AI-powered quizzes on any topic you want to master. Free, works offline, and your data stays private."
   - New: "AI-powered quizzes on any topic, in 5 languages, with explanations that help you truly understand. Free to try, works offline."

2. **Add language flags/badges** near "multi-language" feature for visual appeal

3. **Add testimonial/stat placeholder** for future social proof
   - "X quizzes generated" (if we track this)
   - Or prepare section structure for future testimonials

---

## Implementation Checklist

### Content Changes
- [ ] Update feature cards (4 → 6)
- [ ] Update "How It Works" steps (3 → 4)
- [ ] Revise hero subtitle
- [ ] Add "Share Your Progress" section
- [ ] Enhance CTA section with two-column layout

### Visual Assets Needed
- [ ] Screenshot: Quiz question with progress bar
- [ ] Screenshot: Explanation modal (bottom sheet)
- [ ] Screenshot: Results page with Continue button visible
- [ ] Screenshot: Settings page showing customization options
- [ ] Optional: Share card mockup image

### Technical Changes
- [ ] Add CSS for 6-column feature grid (or 3x2 layout)
- [ ] Add CSS for two-column CTA section
- [ ] Add new section HTML structure
- [ ] Update tracking data-attributes for new CTAs

---

## Success Metrics

Track in Google Analytics (already set up):
- **Click-through rate** on "Try in browser" vs Play Store vs APK
- **Scroll depth** (existing) — expect higher with more content
- **Time on page** — should increase with more compelling content
- **Bounce rate** — should decrease

---

## Out of Scope (Future Considerations)

1. **Animated demo/video** — show app in action
2. **Interactive demo** — embedded mini-quiz on landing page
3. **A/B testing** — test different value propositions
4. **Localized landing pages** — landing page in PT, ES, FR, DE
5. **PWA install prompt on landing page** — for web visitors
