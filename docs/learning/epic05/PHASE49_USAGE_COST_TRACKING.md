# Phase 49: Usage & Cost Tracking

**Status:** ✅ Complete
**Priority:** Medium (User Transparency)
**Estimated Effort:** 3-4 sessions
**Created:** December 27, 2024
**Updated:** January 2, 2026

## Session Log

| Date | Status | Notes |
|------|--------|-------|
| 2024-12-27 | **Plan Created** | Research complete, OpenRouter API documented |
| 2024-12-30 | **Moved to Epic 5** | Promoted from parking lot to active epic |
| 2026-01-02 | **Implementation Started** | Starting sub-phase 49.1 |
| 2026-01-02 | **49.1 Complete** | Usage tracking enabled in API, commit `f692c7d` |
| 2026-01-02 | **49.2 Complete** | cost-service.js created, pricing cache added, commit `7436848` |
| 2026-01-02 | **49.3 Complete** | Usage stored with quiz sessions, commit `c3e2326` |
| 2026-01-02 | **49.4 Complete** | Display cost on Results page, commit `3664ad8` |
| 2026-01-02 | **49.5 Complete** | Display cost in Topics history, commit `f9e1b48` |
| 2026-01-02 | **49.6 Complete** | Credits balance in Settings, commit `3db7613` |
| 2026-01-02 | **49.7 Complete** | i18n translations, commit `eee1d68` |
| 2026-01-02 | **49.8 Complete** | Unit tests (27 new), commit `e45a187` |
| 2026-01-02 | **49.9 Complete** | E2E tests (7 tests), commit `9f7d7f6` |
| 2026-01-02 | **49.10 Complete** | Maestro test flow, commit `a54b468` |
| 2026-01-02 | **49.11 Complete** | Mutation testing (92.68% score) |
| 2026-01-02 | **Phase Complete** | All sub-phases done, ready for PR |

---

## Overview

Display LLM usage costs to users, helping them understand API spending. Even when using free models, show estimated costs to prepare users for potential paid usage.

**Motivation:**
- Users should understand API costs before upgrading to paid models
- Similar to Cline's cost tracking (highly valued by developers)
- Transparency builds trust

**Key Insight:** For free models, show "Estimated cost: $0.00 (free model)" with what it *would* cost on an equivalent paid model.

---

## What You'll Learn

### New Technologies & Concepts

1. **OpenRouter Usage API** - Tracking tokens and costs via `usage: { include: true }`
2. **Cost Calculation** - Computing estimated costs from token counts and pricing data
3. **Model Pricing APIs** - Understanding per-token pricing across different LLM providers
4. **Feature Flags** - Gradual rollout of new UI features
5. **IndexedDB Schema Evolution** - Adding new fields to existing data structures
6. **Cost Formatting** - Displaying micro-transactions ($0.0001) in user-friendly ways
7. **Service Layer Design** - Creating specialized services for domain logic

---

## Prerequisites

Before starting this phase, you should have:

- ✅ **Phase 47** complete (Model Selection UI implemented)
- ✅ **OpenRouter integration** working (`src/api/openrouter-client.js`)
- ✅ **Quiz service** storing sessions in IndexedDB
- ✅ **Model service** caching model list from OpenRouter
- ✅ **Results page** displaying quiz results
- ✅ **Topics page** displaying quiz history
- ✅ **i18n system** for multi-language support
- ✅ Understanding of async/await and API responses
- ✅ Understanding of IndexedDB schema design

---

## Research Summary (OpenRouter API)

### 1. Per-Request Cost (Inline)

Add `usage: { include: true }` to request body:

```javascript
// Request
{
  "model": "openai/gpt-4",
  "messages": [...],
  "usage": { "include": true }
}

// Response includes:
{
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 29,
    "total_tokens": 53,
    "cost_usd": 0.00492,    // <-- Actual cost
    "cached_tokens": 0
  }
}
```

**Note:** Adds ~200-300ms latency to final response.

### 2. Generation Stats Endpoint (Async)

Query `GET /api/v1/generation?id=$GENERATION_ID` after request:

```json
{
  "data": {
    "id": "gen-abc123",
    "model": "openai/gpt-4",
    "tokens_prompt": 24,
    "tokens_completion": 29,
    "total_cost": 0.00492,
    "generation_time": 2
  }
}
```

### 3. Model Pricing Endpoint

`GET /api/v1/models` returns pricing per model:

```json
{
  "id": "meta-llama/llama-3-8b-instruct:free",
  "pricing": {
    "prompt": "0",           // Free!
    "completion": "0"
  }
},
{
  "id": "meta-llama/llama-3-8b-instruct",
  "pricing": {
    "prompt": "0.00000007",  // $0.07 per 1M tokens
    "completion": "0.00000007"
  }
}
```

### 4. Credits Balance Endpoint

`GET /api/v1/credits` returns account balance.

---

## UI Wireframes

### Wireframe 1: Results Page - Cost Display

After quiz completion, show cost below the score summary:

```
┌─────────────────────────────────────┐
│         ◉ 80%                       │
│       Great Job!                    │
│    You got 4 out of 5 correct       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 💡 This quiz used:          │    │
│  │    • 156 tokens (~$0.00)    │    │
│  │    • Free model             │    │
│  │                             │    │
│  │ On a paid model: ~$0.002    │    │
│  └─────────────────────────────┘    │
│                                     │
│        [Share Results]              │
└─────────────────────────────────────┘
│ Review Your Answers                 │
└─────────────────────────────────────┘
```

**Design Notes:**
- Subtle info card below score, before "Review Answers"
- Light background (card style)
- Small text, non-intrusive
- "💡" or "ℹ️" icon to indicate informational
- Shows actual cost + estimated paid cost for comparison

### Wireframe 2: Results Page - Paid Model Cost

When user is on a paid model:

```
┌─────────────────────────────────────┐
│         ◉ 80%                       │
│       Great Job!                    │
│    You got 4 out of 5 correct       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 💡 This quiz cost: $0.003   │    │
│  │    • 892 tokens             │    │
│  │    • Model: GPT-4o Mini     │    │
│  └─────────────────────────────┘    │
│                                     │
│        [Share Results]              │
└─────────────────────────────────────┘
```

### Wireframe 3: Topics Page - Per-Quiz Cost

Show cost in the quiz history list:

```
┌─────────────────────────────────────┐
│ Your Quiz History          12 total │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🎓  World War II               │ │
│ │     2 hours ago • $0.002       │ │
│ │                          4/5 > │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🎓  JavaScript Promises        │ │
│ │     Yesterday • Free           │ │
│ │                          5/5 > │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🎓  Photosynthesis             │ │
│ │     3 days ago • $0.001        │ │
│ │                          3/5 > │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Design Notes:**
- Cost shown alongside date: "2 hours ago • $0.002"
- "Free" badge for free model usage
- Subtle, secondary text styling

### Wireframe 4: Topics Page - Session Summary Header

Add summary stats at the top:

```
┌─────────────────────────────────────┐
│ Your Quiz History          12 total │
│                                     │
│  Total spent: $0.04  │  This week: $0.01
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🎓  World War II               │ │
...
```

### Wireframe 5: Settings Page - Balance Display (Optional)

Show OpenRouter credits balance:

```
┌─────────────────────────────────────┐
│ Connection to AI Provider           │
├─────────────────────────────────────┤
│ ✓ OpenRouter Connected              │
│   Free tier: 50 requests/day        │
│                                     │
│   Model: DeepSeek R1T2 Chimera      │
│   [Change Model]                    │
│                                     │
│   Credits: $4.50 remaining          │  <-- NEW
│   [View Activity →]                 │  <-- Link to openrouter.ai
├─────────────────────────────────────┤
│         [Disconnect]                │
└─────────────────────────────────────┘
```

---

## Implementation Plan

**Note:** Complete sub-phases in order. Each builds on the previous.

### Branching Strategy

Before starting implementation:

```bash
git checkout main
git pull origin main
git checkout -b feature/phase49-usage-cost-tracking
```

All commits go to this feature branch. Create PR when complete.

### 49.1 Enable Usage Tracking in API Calls

**Q: Why add `usage: { include: true }` to the request?**
A: By default, OpenRouter doesn't calculate costs (saves processing time). We explicitly request it so we can show users their spending.

**Files:** `src/api/openrouter-client.js`

**Changes:**
- Add `usage: { include: true }` to request body
- Parse `cost_usd` from response
- Return usage data with response

**Q: What's the tradeoff of enabling usage tracking?**
A: Adds ~200-300ms latency to API responses (OpenRouter calculates costs after generation). Worth it for transparency!

```javascript
// Updated response
return {
  text,
  model: data.model,
  usage: {
    promptTokens: data.usage?.prompt_tokens,
    completionTokens: data.usage?.completion_tokens,
    totalTokens: data.usage?.total_tokens,
    costUsd: data.usage?.cost_usd || 0
  }
};
```

**Commit:** `feat(api): enable usage tracking with cost_usd`

---

### 49.2 Calculate Estimated Cost for Free Models

**Q: Why show estimated costs for free models?**
A: Users should understand the "value" they're getting. If they later switch to a paid model, they won't be surprised by costs.

**Files:** `src/services/cost-service.js` (new)

**Functions:**
```javascript
// Get pricing for a model from cached model list
export function getModelPricing(modelId)

// Calculate estimated cost based on token counts
export function calculateEstimatedCost(promptTokens, completionTokens, modelId)

// Format cost for display ($0.00 or "Free")
export function formatCost(costUsd, isFreeModel)
```

**Logic:**
- If model ends with `:free`, look up equivalent paid model
- Use `/api/v1/models` pricing (already cached by model-service)
- Calculate: `(promptTokens * prompt_price) + (completionTokens * completion_price)`

**Commit:** `feat(services): add cost-service for usage calculations`

---

### 49.3 Store Cost with Quiz Sessions

**Files:** `src/core/db.js`, `src/services/quiz-service.js`

**Changes:**
- Add `usage` field to quiz session schema:
  ```javascript
  {
    topic,
    gradeLevel,
    questions,
    answers,
    score,
    timestamp,
    usage: {                    // NEW
      promptTokens: 156,
      completionTokens: 892,
      actualCost: 0,            // $0 for free models
      estimatedCost: 0.002,     // What it would cost on paid
      model: 'meta-llama/llama-3-8b:free'
    }
  }
  ```
- Pass usage data from LoadingView through to ResultsView

**Commit:** `feat(db): store usage metrics with quiz sessions`

---

### 49.4 Display Cost in Results Page

**Files:** `src/views/ResultsView.js`

**Changes:**
- Add cost info card below score summary
- Show tokens used, actual cost, model name
- If free model: show "On paid model: ~$X.XX"
- Feature flag: `SHOW_USAGE_COSTS`

**Commit:** `feat(ui): display usage cost in results page`

---

### 49.5 Display Cost in Topics Page

**Files:** `src/views/TopicsView.js`

**Changes:**
- Add cost to quiz item: "2 hours ago • $0.002" or "Free"
- Optional: Add summary stats header (total spent)

**Commit:** `feat(ui): display cost per quiz in history`

---

### 49.6 Add Credits Balance to Settings (Optional)

**Files:** `src/views/SettingsView.js`, `src/services/auth-service.js`

**Changes:**
- Fetch `/api/v1/credits` on settings load
- Display "Credits: $X.XX remaining"
- Link to OpenRouter activity page

**Commit:** `feat(ui): show credits balance in settings`

---

### 49.7 Add i18n Translations

**Files:** `public/locales/*/translation.json`

**New Keys:**
```json
{
  "usage": {
    "thisQuizUsed": "This quiz used:",
    "tokens": "{{count}} tokens",
    "freeModel": "Free model",
    "onPaidModel": "On a paid model: ~{{cost}}",
    "cost": "Cost: {{cost}}",
    "free": "Free",
    "totalSpent": "Total spent",
    "thisWeek": "This week",
    "creditsRemaining": "{{amount}} remaining"
  }
}
```

**Commit:** `feat(i18n): add usage tracking translations`

---

### 49.8 Add Tests

**Unit Tests:**
- `cost-service.test.js` - Pricing lookup, estimation, formatting
- `quiz-service.test.js` - Usage data persistence
- `openrouter-client.test.js` - Usage include flag

**Commit:** `test: add usage tracking unit tests`

---

### 49.9 Add E2E Tests (Playwright)

**E2E Tests:**
- Cost displayed on results page
- Cost displayed in quiz history
- Free vs paid model display

**Commit:** `test(e2e): add usage cost display tests`

---

### 49.10 Add Maestro Tests (Parity)

**Purpose:** Maintain parity between Playwright and Maestro test coverage.

**Maestro Flows to Add/Update:**
- Update `03-quiz-results.yaml` - Verify cost info card visible
- Update `05-navigation.yaml` - Verify cost shown in history list

**Commit:** `test(maestro): add usage cost display tests`

---

### 49.11 Run Mutation Testing

**Purpose:** Verify test quality for new `cost-service.js` code.

**Scope:** Run Stryker on `cost-service.js` only (new pure functions).

```bash
npx stryker run --mutate "src/services/cost-service.js"
```

**Target:** >80% mutation score (consistent with Phase 85 standards).

**Commit:** `test(mutation): verify cost-service test quality`

---

### 49.12 Update Documentation

**Files:** `CLAUDE.md`, `EPIC5_PLAN.md`

**Commit:** `docs: mark Phase 49 usage tracking complete`

---

## Data Flow

```
LoadingView
     │
     ▼
quiz-service.generateQuiz()
     │
     ▼
api.real.js ──► openrouter-client.js (with usage: { include: true })
     │                    │
     │                    ▼
     │         Returns { text, model, usage }
     │
     ▼
Store quiz with usage data ──► IndexedDB
     │
     ▼
ResultsView ──► Display cost card
     │
     ▼
TopicsView ──► Display cost per quiz
```

---

## Estimated Cost Calculation Logic

```javascript
function getEstimatedCost(usage, modelId) {
  const isFree = modelId.endsWith(':free');

  if (!isFree) {
    // Paid model - actual cost is accurate
    return {
      actual: usage.costUsd,
      estimated: null,
      isFree: false
    };
  }

  // Free model - calculate what it would cost
  const baseModelId = modelId.replace(':free', '');
  const pricing = getModelPricing(baseModelId);

  if (!pricing) {
    // No paid equivalent found
    return {
      actual: 0,
      estimated: null,
      isFree: true
    };
  }

  const estimated =
    (usage.promptTokens * parseFloat(pricing.prompt)) +
    (usage.completionTokens * parseFloat(pricing.completion));

  return {
    actual: 0,
    estimated: estimated,
    isFree: true
  };
}
```

---

## Feature Flag

```javascript
// src/core/features.js
SHOW_USAGE_COSTS: true  // Enable by default, can disable if issues
```

---

## Testing Requirements

### Unit Tests
- [ ] `cost-service.test.js` - All functions tested
- [ ] `openrouter-client.test.js` - Usage include flag works
- [ ] `quiz-service.test.js` - Usage data saved/retrieved

### E2E Tests (Playwright)
- [ ] Results page shows cost card
- [ ] Topics page shows cost per quiz
- [ ] Free model shows estimated cost
- [ ] Paid model shows actual cost

### Maestro Tests (Parity)
- [ ] `03-quiz-results.yaml` - Cost info card visible
- [ ] `05-navigation.yaml` - Cost shown in history list

### Mutation Testing
- [ ] `cost-service.js` achieves >80% mutation score
- [ ] All surviving mutants documented/justified

### Architecture Tests
- [ ] `npm run arch:test` passes (no new violations)

---

## Success Criteria

- [ ] Usage tracking enabled in API calls
- [ ] Cost displayed on Results page
- [ ] Cost displayed in Topics history
- [ ] Free models show estimated paid cost
- [ ] All unit tests pass
- [ ] All E2E tests pass (Playwright)
- [ ] Maestro tests updated (parity maintained)
- [ ] Mutation score >80% for `cost-service.js`
- [ ] Architecture tests pass (no violations)
- [ ] No performance regression (latency increase documented)
- [ ] Feature branch merged via PR

---

## Future Enhancements (Out of Scope)

1. **Usage Dashboard** - Charts showing spending over time
2. **Budget Alerts** - Notify when approaching spending limit
3. **Cost Comparison** - Compare costs across different models
4. **Export Usage Data** - CSV download of all usage

---

## References

- [OpenRouter Usage Accounting](https://openrouter.ai/docs/use-cases/usage-accounting)
- [OpenRouter Get Generation](https://openrouter.ai/docs/api-reference/get-a-generation)
- [OpenRouter Get Credits](https://openrouter.ai/docs/api-reference/get-credits)
- [OpenRouter Pricing](https://openrouter.ai/pricing)
- Phase 47 (Model Selection): `PHASE47_MODEL_SELECTION.md`
