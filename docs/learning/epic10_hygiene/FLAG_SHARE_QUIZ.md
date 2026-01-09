# Flag Removal: SHARE_QUIZ

**Status:** Planning
**Order:** 5 of 7
**Risk Level:** Low

---

## Flag Details

| Property | Value |
|----------|-------|
| Flag Name | `SHARE_QUIZ` |
| Current Phase | `ENABLED` |
| Description | Share quiz questions so friends can take the same quiz |
| Usages | 3 |
| Files Affected | 2 |

---

## Why Remove

This flag was used during development of the quiz sharing feature. Now that the feature is stable and permanently enabled:
- The flag always returns `true`
- The conditional checks are unnecessary
- Removing simplifies the code

---

## Files to Modify

### 1. `src/views/ResultsView.js`

**Line 57** - Remove variable assignment:

```javascript
// Before
const showShareQuizButton = isFeatureEnabled('SHARE_QUIZ');

// After
// Remove this line entirely - button is always shown
```

**Line 339** - Remove conditional:

```javascript
// Before
if (isFeatureEnabled('SHARE_QUIZ')) {
  // render share quiz button
}

// After
// Always render share quiz button (remove the if wrapper)
```

### 2. `src/views/TopicsView.js`

**Line 133** - Remove conditional from history item:

```javascript
// Before
const canShare = canReplay && isFeatureEnabled('SHARE_QUIZ');

// After
const canShare = canReplay;
```

### 3. `src/core/features.js`

Remove flag from `FEATURE_FLAGS` object:

```javascript
// Remove this entire entry
SHARE_QUIZ: {
  phase: 'ENABLED',
  description: 'Share quiz questions so friends can take the same quiz'
},
```

---

## Verification Checklist

### Before Changes
- [ ] Run baseline tests: `npm test && npm run test:e2e`
- [ ] Note test count and passing status

### After Changes
- [ ] `ResultsView.js` no longer checks for `SHARE_QUIZ`
- [ ] `TopicsView.js` no longer checks for `SHARE_QUIZ`
- [ ] Share quiz button is always rendered (no conditional)
- [ ] `FEATURE_FLAGS` object no longer contains `SHARE_QUIZ`
- [ ] Run unit tests: `npm test`
- [ ] Run E2E tests: `npm run test:e2e`

### Manual Verification
- [ ] Complete a quiz
- [ ] Verify "Share Quiz" button appears on results page
- [ ] Go to Topics view
- [ ] Verify share icon appears on quiz history items
- [ ] Click share and verify URL is generated

---

## Commit

```bash
git add src/views/ResultsView.js src/views/TopicsView.js src/core/features.js
git commit -m "refactor(hygiene): remove SHARE_QUIZ feature flag

- Remove isFeatureEnabled checks from ResultsView.js
- Remove isFeatureEnabled checks from TopicsView.js
- Share quiz button is now always shown (feature is permanent)
- Remove flag from FEATURE_FLAGS object

Part of: Feature Flag Cleanup Wave 1"
```

---

**Learning Notes:** Capture in [PHASE1_LEARNING_NOTES.md](./PHASE1_LEARNING_NOTES.md#share_quiz)

**Previous:** [FLAG_SHARE_FEATURE.md](./FLAG_SHARE_FEATURE.md)
**Next:** [FLAG_SHOW_USAGE_COSTS.md](./FLAG_SHOW_USAGE_COSTS.md)
