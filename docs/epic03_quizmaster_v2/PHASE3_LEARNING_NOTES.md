# Phase 3 Learning Notes: UI Polish

**Epic:** 3 - QuizMaster V2
**Phase:** 3 - UI Polish
**Status:** In Progress
**Started:** November 25, 2025

---

## Phase 3 Structure

| Part | Focus | Status |
|------|-------|--------|
| Part 1 | Loading Screen for Quiz Generation | Pending |
| **Part 2** | **Multi-Language Question Generation** | **Complete** |
| Part 3 | Dynamic Home Page | Pending |
| Part 4 | Settings Page | Pending |
| Part 5 | Navigation Updates | Pending |

---

## Part 2: Multi-Language Question Generation

**Completed:** November 25, 2025
**Duration:** ~30 minutes

### Problem Solved

When users entered topics in languages other than English (e.g., "Sistema Digestivo" in Portuguese), the questions were still generated in English. This created a jarring mixed-language experience for international users.

### Solution Implemented

Updated backend prompts to:
1. Detect the language of the topic
2. Generate ALL content (questions + answers + explanations) in that same language
3. Return the detected language as a locale code (e.g., "PT-PT", "EN-US")

### Files Modified

| File | Changes |
|------|---------|
| `netlify/functions/generate-questions.js` | Added language detection prompt, returns `{ language, questions }` object |
| `netlify/functions/generate-explanation.js` | Added language detection to explanation prompt |
| `src/api/api.real.js` | Returns `{ language, questions }` object instead of just array |
| `src/api/api.mock.js` | Returns `{ language: 'EN-US', questions }` to match real API |
| `src/views/QuizView.js` | Extracts `result.questions` and stores `result.language` |

### Key Concepts Learned

#### 1. Prompt Engineering for Language Detection

**Why do it in the prompt instead of frontend?**
- Claude already knows how to detect languages (trained on multilingual data)
- No external libraries needed (no `franc`, `langdetect`, etc.)
- No extra API calls - detection happens within the same request
- Context-aware detection (understands "Sistema Digestivo" is Portuguese even without special characters)

**Prompt engineering techniques used:**
1. **Explicit instruction** - "Generate ALL questions in the SAME language"
2. **Concrete examples** - Show input/output language pairs
3. **Emphasis** - Use caps and "CRITICAL" to highlight importance
4. **Repetition** - Mention language requirement multiple times
5. **Negative instruction** - "Do NOT mix languages"

#### 2. API Contract Changes

When you change what an API returns, you must update ALL consumers:
- **Real API** (`api.real.js`) - Changed return structure
- **Mock API** (`api.mock.js`) - Must match the same interface
- **Frontend** (`QuizView.js`) - Must handle new structure
- **Tests** - Would need updating if they existed

**Before:**
```javascript
return questions;  // Array
```

**After:**
```javascript
return {
  language: 'PT-PT',
  questions: questions
};
```

#### 3. Locale Codes

Chose locale codes (e.g., "PT-PT", "EN-US") over simple codes ("pt", "en") or full names ("Portuguese") because:
- More precise (Portuguese from Portugal vs Brazil)
- ISO standard format
- Can be used for future i18n features

### JSON Response Structure

**Generate Questions Response:**
```json
{
  "language": "PT-PT",
  "questions": [
    {
      "question": "Qual é a função principal do estômago?",
      "options": [
        "A) Absorver nutrientes",
        "B) Digerir alimentos com ácido gástrico",
        "C) Filtrar toxinas",
        "D) Produzir insulina"
      ],
      "correct": 1,
      "difficulty": "easy"
    }
  ]
}
```

### Testing Performed

1. **English Topic:** "Photosynthesis"
   - Result: Questions in English, language: "EN-US"

2. **Portuguese Topic:** "Sistema Digestivo"
   - Result: Questions in Portuguese, language: "PT-PT"

3. **Explanation Endpoint:** Verified explanations match question language

---

## Next Up: Part 1 - Loading Screen

**Problem:** When users click "Generate Questions", they see a blank screen for 5+ seconds while waiting for the API response.

**Solution:** Create a dedicated `LoadingView.js` with:
- Animated spinner
- Topic name display
- Rotating status messages
- Cancel button

---

## Session Log

### Session 1 - November 25, 2025
- Started Phase 3
- Completed Part 2: Multi-Language Question Generation
- Updated 5 files
- Tested with English and Portuguese topics
- All tests passing

**Next session:** Part 1 - Loading Screen for Quiz Generation
