# Flag Removal: EXPLANATION_FEATURE

**Status:** Planning
**Order:** 3 of 7
**Risk Level:** Low

---

## Flag Details

| Property | Value |
|----------|-------|
| Flag Name | `EXPLANATION_FEATURE` |
| Current Phase | `ENABLED` |
| Description | AI-generated explanations for incorrect answers |
| Usages | 2 |
| Files Affected | 1 |

---

## Why Remove

This flag was used during development of the "Why was I wrong?" explanation feature. Now that the feature is stable and permanently enabled:
- The flag always returns `true`
- The conditional checks are unnecessary
- Removing simplifies the code

---

## Files to Modify

### 1. `src/views/ResultsView.js`

**Line 54** - Remove variable assignment:

```javascript
// Before
const showExplanationButton = isFeatureEnabled('EXPLANATION_FEATURE');

// After
// Remove this line entirely - button is always shown
```

**Line 318** - Remove conditional:

```javascript
// Before
if (isFeatureEnabled('EXPLANATION_FEATURE')) {
  // render explanation button
}

// After
// Always render explanation button (remove the if wrapper)
```

### 2. `src/core/features.js`

Remove flag from `FEATURE_FLAGS` object:

```javascript
// Remove this entire entry
EXPLANATION_FEATURE: {
  phase: 'ENABLED',
  description: 'AI-generated explanations for incorrect answers'
},
```

---

## Verification Checklist

### Before Changes
- [ ] Run baseline tests: `npm test && npm run test:e2e`
- [ ] Note test count and passing status

### After Changes
- [ ] `ResultsView.js` no longer checks for `EXPLANATION_FEATURE`
- [ ] Explanation button is always rendered (no conditional)
- [ ] `FEATURE_FLAGS` object no longer contains `EXPLANATION_FEATURE`
- [ ] Run unit tests: `npm test`
- [ ] Run E2E tests: `npm run test:e2e`

### Manual Verification
- [ ] Complete a quiz with at least one wrong answer
- [ ] Verify "Why was I wrong?" button appears
- [ ] Click button and verify explanation loads

---

## Commit

```bash
git add src/views/ResultsView.js src/core/features.js
git commit -m "refactor(hygiene): remove EXPLANATION_FEATURE feature flag

- Remove isFeatureEnabled checks from ResultsView.js
- Explanation button is now always shown (feature is permanent)
- Remove flag from FEATURE_FLAGS object

Part of: Feature Flag Cleanup Wave 1"
```

---

**Learning Notes:** Capture in [PHASE1_LEARNING_NOTES.md](./PHASE1_LEARNING_NOTES.md#explanation_feature)

**Previous:** [FLAG_CONTINUE_TOPIC.md](./FLAG_CONTINUE_TOPIC.md)
**Next:** [FLAG_SHARE_FEATURE.md](./FLAG_SHARE_FEATURE.md)
