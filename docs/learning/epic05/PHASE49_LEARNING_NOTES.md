# Phase 49: Usage & Cost Tracking - Learning Notes

**Started:** January 2, 2026
**Status:** Complete

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

## Session 2 (January 2, 2026 - Continued)

### What Was Built

4. **49.4 - Display cost on Results page** (`3664ad8`)
   - Added SHOW_USAGE_COSTS feature flag to `features.js`
   - Added usage cost info card to ResultsView
   - Shows token count, actual cost, and estimated cost for free models

5. **49.5 - Display cost in Topics history** (`f9e1b48`)
   - Updated TopicsView to show cost next to date
   - Format: "Today • Free" or "Today • $0.02"

6. **49.6 - Credits balance in Settings** (`3db7613`)
   - Added `getCreditsBalance()` to openrouter-client.js (fetches /api/v1/auth/key)
   - Exported from auth-service.js for views to consume
   - Display credits in Settings page when connected
   - Links to OpenRouter activity page for details

7. **49.7 - i18n translations** (`eee1d68`)
   - Added usage section with keys: thisQuizUsed, tokens, freeModel, onPaidModel
   - Added settings keys: creditsBalance, remaining
   - Translations for English (en) and Portuguese (pt-PT)

8. **49.8 - Unit tests** (`e45a187`)
   - Created `src/services/cost-service.test.js` with 21 tests:
     - isFreeModel: free suffix detection
     - getPaidEquivalent: strip :free suffix
     - calculateEstimatedCost: token-based cost calculation
     - formatCost: currency formatting
     - getUsageSummary: complete usage summary
   - Added 6 tests for getCreditsBalance in openrouter-client.test.js

9. **49.9 - E2E tests** (`9f7d7f6`)
   - Created `tests/e2e/usage-cost.spec.js` with 7 tests:
     - Usage cost card on results page
     - Free model indicator display
     - Cost display in quiz history
     - Credits balance in Settings
     - OpenRouter activity link
     - Zero balance handling
     - API failure handling

10. **49.10 - Maestro tests** (`a54b468`)
    - Created `.maestro/flows/08-usage-cost.yaml`
    - Tests usage cost card visibility on results
    - Tests cost display in Topics history
    - Tests credits balance in Settings (optional assertions)

11. **49.11 - Mutation testing**
    - Ran Stryker on cost-service.js
    - **Mutation Score: 92.68%** (76 killed, 5 survived, 1 no coverage)
    - Survivors are logger debug messages and defensive code (acceptable)

### Testing Summary

| Test Type | File | Tests | Status |
|-----------|------|-------|--------|
| Unit | cost-service.test.js | 21 | ✅ Pass |
| Unit | openrouter-client.test.js | +6 | ✅ Pass |
| E2E | usage-cost.spec.js | 7 | ✅ Pass |
| Maestro | 08-usage-cost.yaml | 1 flow | ✅ Created |
| Mutation | cost-service.js | 92.68% | ✅ Good |

### Files Changed (Complete)

| File | Changes |
|------|---------|
| `src/api/openrouter-client.js` | Added usage include, parse response, getCreditsBalance |
| `src/api/openrouter-client.test.js` | Updated expectations, added credits tests |
| `src/services/model-service.js` | Added pricing cache, getModelPricing() |
| `src/services/cost-service.js` | **NEW** - Cost calculation service |
| `src/services/cost-service.test.js` | **NEW** - Unit tests |
| `src/services/auth-service.js` | Added getCreditsBalance export |
| `src/api/api.real.js` | Return model + usage from generateQuestions |
| `src/api/api.mock.js` | Simulate usage data |
| `src/core/features.js` | Added SHOW_USAGE_COSTS flag |
| `src/views/LoadingView.js` | Store model/usage in state |
| `src/views/ResultsView.js` | Display usage cost card |
| `src/views/TopicsView.js` | Display cost in history |
| `src/views/SettingsView.js` | Display credits balance |
| `public/locales/en.json` | Added usage & settings translations |
| `public/locales/pt-PT.json` | Added usage & settings translations |
| `tests/e2e/usage-cost.spec.js` | **NEW** - E2E tests |
| `.maestro/flows/08-usage-cost.yaml` | **NEW** - Maestro test |

---

## Commits

| Commit | Description |
|--------|-------------|
| `a27855a` | docs: start Phase 49 |
| `f692c7d` | feat(api): enable usage tracking with cost_usd |
| `7436848` | feat(services): add cost-service for usage calculations |
| `c3e2326` | feat(db): store usage metrics with quiz sessions |
| `3664ad8` | feat(ui): display usage cost in results page |
| `f9e1b48` | feat(ui): display cost per quiz in history |
| `3db7613` | feat(settings): display OpenRouter credits balance |
| `eee1d68` | feat(i18n): add translations for usage cost display |
| `e45a187` | test(unit): add tests for cost-service and getCreditsBalance |
| `9f7d7f6` | test(e2e): add Playwright tests for usage cost display |
| `a54b468` | test(maestro): add usage cost display test flow |

---

## Summary

Phase 49 implemented complete usage and cost tracking for the SaberLoop quiz application:

1. **API Integration**: OpenRouter now returns usage data (tokens, cost) with each quiz generation
2. **Cost Service**: New service layer module for cost calculations and formatting
3. **UI Display**: Cost info shown on Results page, Topics history, and Settings (credits balance)
4. **i18n**: Full English and Portuguese translations
5. **Testing**: 92.68% mutation score, 27+ new unit tests, 7 E2E tests, 1 Maestro flow

The feature is gated behind the `SHOW_USAGE_COSTS` feature flag (currently ENABLED) for gradual rollout.
