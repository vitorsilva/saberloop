# Phase 49: Usage & Cost Tracking - Learning Notes

**Started:** January 2, 2026
**Status:** In Progress (Sub-phase 49.4)

---

## Session 1 (January 2, 2026)

### What Was Built

1. **49.1 - Enable usage tracking in API** (`f692c7d`)
   - Added `usage: { include: true }` to OpenRouter request body
   - Parsed response into camelCase fields (promptTokens, completionTokens, totalTokens, costUsd)
   - Updated existing test to match new response format

2. **49.2 - Create cost-service.js** (`7436848`)
   - Created `src/services/cost-service.js` with:
     - `isFreeModel(modelId)` - Check if model ID ends with `:free`
     - `getPaidEquivalent(modelId)` - Strip `:free` suffix
     - `calculateEstimatedCost()` - Calculate from token counts + pricing
     - `formatCost()` - Format for display ($0.002, Free, etc.)
     - `getUsageSummary()` - Complete usage summary with estimated costs
   - Updated `model-service.js` to cache ALL models with pricing (not just free ones)
   - Added `getModelPricing()` export for cost lookups

3. **49.3 - Store cost with quiz sessions** (`c3e2326`)
   - Updated `api.real.js` to return `model` and `usage` in response
   - Updated `api.mock.js` to simulate realistic usage data
   - Updated `LoadingView.js` to store model/usage in state
   - Updated `ResultsView.js` to include model/usage when saving session

### Key Decisions

1. **Option 2 chosen for estimated costs**: Full implementation with pricing cache rather than simple MVP
   - Rationale: Better user experience showing "would cost $X on paid model"
   - Trade-off: More complex caching, but reuses existing model cache infrastructure

2. **Separate pricing cache**: Created `PRICING_CACHE_KEY` alongside existing `CACHE_KEY`
   - Keeps free models cache (for UI) separate from all models pricing cache
   - Both caches share same 24-hour expiration

### Commands That Didn't Work

1. **Windows `cd /d` in bash**
   ```bash
   # FAILED: cd /d C:\Users\... - "too many arguments"
   cd /d C:\Users\omeue\source\repos\demo-pwa-app && git add ...

   # WORKAROUND: Just use the command without cd (already in correct directory)
   git add ... && git status
   ```
   **Lesson:** Claude Code's bash environment doesn't support Windows-specific `cd /d`. The working directory is already set correctly, so `cd` is usually unnecessary.

### Test Adjustments Required

1. **openrouter-client.test.js** needed update after 49.1
   - Test expected old snake_case format (`prompt_tokens`)
   - Updated to expect new camelCase format (`promptTokens`) plus `costUsd`

### Architecture Observations

- Module count increased from 67 to 75 after adding cost-service
- No new architecture violations (only existing `types.js` orphan warning)
- `cost-service.js` follows existing service layer patterns

---

## Concepts Learned

### OpenRouter Usage Tracking

By default, OpenRouter doesn't calculate costs (saves processing time). Adding `usage: { include: true }` to the request body enables:
- Token counting (prompt, completion, total)
- Cost calculation based on model pricing
- ~200-300ms additional latency (worth it for transparency)

### Pricing Data Structure

OpenRouter returns pricing as strings (to preserve precision):
```javascript
{
  "pricing": {
    "prompt": "0.00000007",    // $0.07 per 1M tokens
    "completion": "0.00000007"
  }
}
```

Free models have `"0"` for both values.

### Cost Calculation Formula

```javascript
cost = (promptTokens * promptPrice) + (completionTokens * completionPrice)
```

For free models (`:free` suffix), look up equivalent paid model to show estimated cost.

---

## Files Changed

| File | Changes |
|------|---------|
| `src/api/openrouter-client.js` | Added usage include, parse response |
| `src/api/openrouter-client.test.js` | Updated test expectations |
| `src/services/model-service.js` | Added pricing cache, getModelPricing() |
| `src/services/cost-service.js` | **NEW** - Cost calculation service |
| `src/api/api.real.js` | Return model + usage from generateQuestions |
| `src/api/api.mock.js` | Simulate usage data |
| `src/views/LoadingView.js` | Store model/usage in state |
| `src/views/ResultsView.js` | Include model/usage in saved session |

---

## Next Steps

- [ ] 49.4 - Display cost on Results page
- [ ] 49.5 - Display cost in Topics history
- [ ] 49.6 - Credits balance in Settings (optional)
- [ ] 49.7 - i18n translations
- [ ] 49.8 - Unit tests
- [ ] 49.9 - E2E tests (Playwright)
- [ ] 49.10 - Maestro tests
- [ ] 49.11 - Mutation testing
- [ ] 49.12 - Documentation updates
