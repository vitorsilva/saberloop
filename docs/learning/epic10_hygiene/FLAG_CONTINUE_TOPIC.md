# Flag Removal: CONTINUE_TOPIC

**Status:** Planning
**Order:** 2 of 7
**Risk Level:** Low

---

## Flag Details

| Property | Value |
|----------|-------|
| Flag Name | `CONTINUE_TOPIC` |
| Current Phase | `ENABLED` |
| Description | Continue quiz on same topic with new questions |
| Usages | 2 |
| Files Affected | 1 |

---

## Why Remove

This flag was used during development of the "Continue Topic" feature. Now that the feature is stable and permanently enabled:
- The flag always returns `true`
- The conditional checks are unnecessary
- Removing simplifies the code

---

## Files to Modify

### 1. `src/views/ResultsView.js`

**Line 55** - Remove variable assignment:

```javascript
// Before
const showContinueButton = isFeatureEnabled('CONTINUE_TOPIC');

// After
// Remove this line entirely - button is always shown
```

**Line 308** - Remove conditional:

```javascript
// Before
if (isFeatureEnabled('CONTINUE_TOPIC')) {
  // render continue button
}

// After
// Always render continue button (remove the if wrapper)
```

### 2. `src/core/features.js`

Remove flag from `FEATURE_FLAGS` object:

```javascript
// Remove this entire entry
CONTINUE_TOPIC: {
  phase: 'ENABLED',
  description: 'Continue quiz on same topic with new questions'
},
```

---

## Verification Checklist

### Before Changes
- [ ] Run baseline tests: `npm test && npm run test:e2e`
- [ ] Note test count and passing status

### After Changes
- [ ] `ResultsView.js` no longer checks for `CONTINUE_TOPIC`
- [ ] Continue button is always rendered (no conditional)
- [ ] `FEATURE_FLAGS` object no longer contains `CONTINUE_TOPIC`
- [ ] Run unit tests: `npm test`
- [ ] Run E2E tests: `npm run test:e2e`

### Manual Verification
- [ ] Complete a quiz
- [ ] Verify "Continue Topic" button appears on results page
- [ ] Click button and verify it works

---

## Commit

```bash
git add src/views/ResultsView.js src/core/features.js
git commit -m "refactor(hygiene): remove CONTINUE_TOPIC feature flag

- Remove isFeatureEnabled checks from ResultsView.js
- Continue button is now always shown (feature is permanent)
- Remove flag from FEATURE_FLAGS object

Part of: Feature Flag Cleanup Wave 1"
```

---

**Learning Notes:** Capture in [PHASE1_LEARNING_NOTES.md](./PHASE1_LEARNING_NOTES.md#continue_topic)

**Previous:** [FLAG_TELEMETRY.md](./FLAG_TELEMETRY.md)
**Next:** [FLAG_EXPLANATION_FEATURE.md](./FLAG_EXPLANATION_FEATURE.md)
