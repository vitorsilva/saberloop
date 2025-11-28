# Phase 3.5: Branding & Identity - Learning Notes

**Epic:** 3 - QuizMaster V2
**Status:** In Progress
**Started:** 2025-11-25

---

## Session 1: Name Brainstorming & Product Vision Alignment

### What We Did

1. **Defined Naming Criteria**
   - Memorable: 5 (highest priority)
   - Descriptive: 1 (low priority - abstract names OK)
   - Available: 5 (highest priority)
   - Unique: 5 (highest priority)
   - Positive: 3
   - Short: 4
   - International: 5 (highest priority)
   - Tone: Approachable

2. **Brainstormed Names Across Categories**
   - Abstract/Evocative: Lumina, Sparq, Nuro, Kova
   - Friendly/Approachable: Quizly, Learnly, Thinkr, Cureo
   - Short & Punchy: Qwiz, Brio, Flux, Nova
   - Compound: MindSpark, BrainFlow, MindFlow

3. **Initial Favorite: MindFlow**
   - Resonated most with user
   - BUT: All domain variations taken (.com, .app, etc.)

4. **Alternative Found: ezquizz**
   - Domain available
   - BUT: Concern raised about international appeal ("ez" = English slang)
   - More importantly: Name focuses on "quiz" not "learning"

### Key Insight: Product Vision Realignment

Reviewed original product vision document (`product_info/quiz-generator-exploration.md`) and discovered:

**Original Vision was LEARNING-focused, not just quiz-focused:**

| Feature | Original Vision | Current State |
|---------|-----------------|---------------|
| Direct Learning ("Teach me about X") | ✅ Planned | ❌ Not built |
| Assessment-First (quizzes) | ✅ Planned | ✅ Built |
| Time-Constrained Learning | ✅ Planned | ❌ Not built |
| Visual Learning (photo upload) | ✅ Planned | ❌ V2 |
| Spaced Repetition | ✅ Planned | ❌ V2 |
| Progress Tracking | ✅ Planned | ✅ Built |

**The "Personal Trainer" Analogy (from original doc):**
> "It's like the difference between having access to a gym (Claude API) vs having a personal trainer app that creates workout plans, tracks progress, adjusts difficulty, and keeps you accountable (Our App)"

**Decision Made:** Option 2 - Expand to Learning, Change Name
- Name should reflect broader learning vision, not just quizzes
- "ezquizz" too narrow for what the product should become

### Domain Hunting Challenges

**Names Checked - All Taken:**
- MindFlow (all variations)
- LearnFlow, Learnly, Thinkr
- All compound names from initial list

**Strategies Suggested for Next Session:**
1. Made-up words (Learnr, Stuvi, Knolio, Memvo)
2. Unique letter combinations (Znap, Kwize, Lrn)
3. Unexpected combinations (SparkPath, MindLoop, BrainBit)
4. Alternative TLDs (.app, .io, .co, .learn, .study)
5. Prefix/suffix patterns (get[name], try[name], [name]app)

---

## Session 2: Trademark Research & Domain Validation

### What We Did

1. **Evaluated SparkPath Against Criteria**
   - Scored well on most criteria (memorable, positive, international)
   - Domain available: getsparkpath.com ✅
   - No app on Google Play ✅
   - Found sparkpath.org exists (potential conflict)

2. **Conducted USPTO Trademark Search**
   - Searched "sparkpath" at tmsearch.uspto.gov
   - Found 2 LIVE registered trademarks for "SPARKPATH"
   - Owner: SparkPath, Inc. (NON-PROFIT CORPORATION, Minnesota)
   - Class 041: "In-person and on-line academic enrichment programs"

3. **Risk Assessment**
   - Class 041 = Education services (exact match to our app)
   - Same name + same class = HIGH infringement risk
   - Decision: **Do not use SparkPath**

### Key Learnings

1. **Always check trademarks before committing to a name**
   - Domain availability ≠ legal availability
   - USPTO search is free: https://tmsearch.uspto.gov

2. **Trademark classes matter**
   - Same name in different class (e.g., cleaning products) = probably OK
   - Same name in same class (education) = HIGH RISK

3. **Class 041 covers education/training**
   - Any learning app falls under this class
   - Must check for conflicts specifically in Class 041

4. **Better to find out early**
   - Discovering trademark conflicts after branding = expensive rebrand
   - 10 minutes of research saves potential legal issues

### Trademark Search Process (For Future Reference)

1. Go to https://tmsearch.uspto.gov
2. Search for your proposed name
3. Filter by "Live" status (ignore Dead/Cancelled)
4. Check the "Goods & Services" and "Class" columns
5. If LIVE trademark exists in Class 041 (education) → DON'T USE
6. If no conflicts in your class → safer to proceed (consult lawyer for certainty)

---

## Session 3: Final Name Decision - Saberloop

### What We Did

1. **Pivoted to Made-Up Words**
   - Realized real word combinations are often trademarked
   - Made-up words = more likely available + more unique

2. **Explored Portuguese-Based Names**
   - "Saber" (Portuguese) = to know / knowledge
   - Combined with English words for hybrid names
   - Criteria: no "ova" endings, no light metaphors, 7+ characters

3. **Candidate: Saberloop**
   - Origin: "saber" (to know) + "loop" (continuous cycle)
   - Meaning: Continuous knowledge/learning cycle

4. **International Analysis**
   - English: "Saber" = sword (cool) or sounds like "savvy"
   - Spanish/Portuguese: "Saber" = to know (perfect!)
   - Hindi/Arabic: Sounds like "sabr" = patience (positive!)
   - Japanese: "Saber" known from anime (positive association)
   - Chinese/Korean/SE Asia: Neutral, no negative meanings
   - Verdict: Works globally!

5. **Availability Checks - ALL CLEAR**
   - Domain: saberloop.com ✅ Available
   - USPTO Trademark (Class 041): ✅ No conflicts
   - Google Play: ✅ No existing app
   - Apple App Store: ✅ No existing app

### Final Decision

**Product Name: Saberloop**
**Domain: saberloop.com**

| Criteria | Weight | Score | Notes |
|----------|--------|-------|-------|
| Memorable | 5 | 4/5 | Two familiar words combined |
| Descriptive | 1 | 4/5 | "Know" + "continuous cycle" |
| Available | 5 | 5/5 | All clear! |
| Unique | 5 | 5/5 | No existing products |
| Positive | 3 | 5/5 | Good associations globally |
| Short | 4 | 4/5 | 9 characters |
| International | 5 | 5/5 | Works in all major languages |

---

## Current Status

**Phase 3.5 Progress:**
- [x] Define naming criteria
- [x] Brainstorm initial names
- [x] Evaluate against criteria
- [x] Align name with product vision (learning, not just quiz)
- [x] Learn trademark search process
- [x] Eliminate SparkPath (trademark conflict - Class 041)
- [x] Find available name (domain + trademark clear)
- [x] Final name decision: **Saberloop** (saberloop.com)
- [ ] Visual identity (icon, colors)
- [ ] Update manifest and codebase

**Next:** Visual identity (icon design, color scheme)

---

## Key Learnings (Cumulative)

1. **Product naming is hard** - Most good, short names are taken
2. **Name should match vision** - "ezquizz" was available but too narrow
3. **Revisit original vision** - Easy to get caught up in current features vs. full potential
4. **Made-up words more likely available** - Need to be more creative
5. **Domain available ≠ legally available** - Always check trademarks
6. **Trademark Class 041** - Education services; our app falls under this class

---

## Next Steps

1. Brainstorm new names
2. For each candidate: check domain THEN trademark (Class 041)
3. Consider what appealed about SparkPath:
   - "Spark" = inspiration, ignite curiosity?
   - "Path" = journey, progress, learning path?
4. Explore alternatives with similar feel

---

## Questions for Future Sessions

- What aspect of SparkPath appealed most? (Spark vs Path)
- Should we focus on made-up words to avoid trademark conflicts?
- Would a longer, more descriptive name be acceptable if it's available?
