# Flag Removal: SHARE_FEATURE

**Status:** Planning
**Order:** 4 of 7
**Risk Level:** Low

---

## Flag Details

| Property | Value |
|----------|-------|
| Flag Name | `SHARE_FEATURE` |
| Current Phase | `ENABLED` |
| Description | Share quiz results with text, link, and image |
| Usages | 2 |
| Files Affected | 1 |

---

## Why Remove

This flag was used during development of the share results feature. Now that the feature is stable and permanently enabled:
- The flag always returns `true`
- The conditional checks are unnecessary
- Removing simplifies the code

---

## Files to Modify

### 1. `src/views/ResultsView.js`

**Line 56** - Remove variable assignment:

```javascript
// Before
const showShareButton = isFeatureEnabled('SHARE_FEATURE');

// After
// Remove this line entirely - button is always shown
```

**Line 329** - Remove conditional:

```javascript
// Before
if (isFeatureEnabled('SHARE_FEATURE')) {
  // render share button
}

// After
// Always render share button (remove the if wrapper)
```

### 2. `src/core/features.js`

Remove flag from `FEATURE_FLAGS` object:

```javascript
// Remove this entire entry
SHARE_FEATURE: {
  phase: 'ENABLED',
  description: 'Share quiz results with text, link, and image'
},
```

---

## Verification Checklist

### Before Changes
- [ ] Run baseline tests: `npm test && npm run test:e2e`
- [ ] Note test count and passing status

### After Changes
- [ ] `ResultsView.js` no longer checks for `SHARE_FEATURE`
- [ ] Share button is always rendered (no conditional)
- [ ] `FEATURE_FLAGS` object no longer contains `SHARE_FEATURE`
- [ ] Run unit tests: `npm test`
- [ ] Run E2E tests: `npm run test:e2e`

### Manual Verification
- [ ] Complete a quiz
- [ ] Verify "Share Results" button appears on results page
- [ ] Click button and verify share dialog works

---

## Commit

```bash
git add src/views/ResultsView.js src/core/features.js
git commit -m "refactor(hygiene): remove SHARE_FEATURE feature flag

- Remove isFeatureEnabled checks from ResultsView.js
- Share results button is now always shown (feature is permanent)
- Remove flag from FEATURE_FLAGS object

Part of: Feature Flag Cleanup Wave 1"
```

---

**Learning Notes:** Capture in [PHASE1_LEARNING_NOTES.md](./PHASE1_LEARNING_NOTES.md#share_feature)

**Previous:** [FLAG_EXPLANATION_FEATURE.md](./FLAG_EXPLANATION_FEATURE.md)
**Next:** [FLAG_SHARE_QUIZ.md](./FLAG_SHARE_QUIZ.md)
