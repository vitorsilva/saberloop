# Phase 49: Usage & Cost Tracking

**Status:** Research Complete / Ready to Implement
**Estimated Sessions:** 3-4
**Created:** December 27, 2024

## Overview

Display LLM usage costs to users, helping them understand API spending. Even when using free models, show estimated costs to prepare users for potential paid usage.

**Motivation:**
- Users should understand API costs before upgrading to paid models
- Similar to Cline's cost tracking (highly valued by developers)
- Transparency builds trust

**Key Insight:** For free models, show "Estimated cost: $0.00 (free model)" with what it *would* cost on an equivalent paid model.

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

### 49.1 Enable Usage Tracking in API Calls

**Files:** `src/api/openrouter-client.js`

**Changes:**
- Add `usage: { include: true }` to request body
- Parse `cost_usd` from response
- Return usage data with response

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

**E2E Tests:**
- Cost displayed on results page
- Cost displayed in quiz history
- Free vs paid model display

**Commit:** `test: add usage tracking tests`

---

### 49.9 Update Documentation

**Files:** `CLAUDE.md`, `EPIC4_SABERLOOP_V1_PLAN.md`

**Commit:** `docs: add Phase 49 usage tracking`

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

### E2E Tests
- [ ] Results page shows cost card
- [ ] Topics page shows cost per quiz
- [ ] Free model shows estimated cost
- [ ] Paid model shows actual cost

### Architecture Tests
- [ ] `npm run arch:test` passes (no new violations)

---

## Success Criteria

- [ ] Usage tracking enabled in API calls
- [ ] Cost displayed on Results page
- [ ] Cost displayed in Topics history
- [ ] Free models show estimated paid cost
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No performance regression (latency increase documented)

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
