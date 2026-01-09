# Flag Removal: SHOW_USAGE_COSTS

**Status:** Planning
**Order:** 6 of 7
**Risk Level:** Low

---

## Flag Details

| Property | Value |
|----------|-------|
| Flag Name | `SHOW_USAGE_COSTS` |
| Current Phase | `ENABLED` |
| Description | Display token counts and costs after each quiz |
| Usages | 3 |
| Files Affected | 3 |

---

## Why Remove

This flag was used during development of the usage cost display feature. Now that the feature is stable and permanently enabled:
- The flag always returns `true`
- The conditional checks are unnecessary
- Removing simplifies the code

---

## Files to Modify

### 1. `src/views/ResultsView.js`

**Line 58** - Remove variable assignment:

```javascript
// Before
const showUsageCosts = isFeatureEnabled('SHOW_USAGE_COSTS');

// After
// Remove this line entirely - costs are always shown
```

Update any usage of `showUsageCosts` to always be true (or remove the conditional).

### 2. `src/views/TopicsView.js`

**Line 125** - Remove flag check from condition:

```javascript
// Before
const showCost = isFeatureEnabled('SHOW_USAGE_COSTS') && session.usage;

// After
const showCost = session.usage;
```

### 3. `src/views/SettingsView.js`

**Line 329** - Remove flag check:

```javascript
// Before
const showCredits = isFeatureEnabled('SHOW_USAGE_COSTS');

// After
// Remove this line - credits are always shown
// Or simplify to: const showCredits = true;
```

### 4. `src/core/features.js`

Remove flag from `FEATURE_FLAGS` object:

```javascript
// Remove this entire entry
SHOW_USAGE_COSTS: {
  phase: 'ENABLED',
  description: 'Display token counts and costs after each quiz'
},
```

---

## Verification Checklist

### Before Changes
- [ ] Run baseline tests: `npm test && npm run test:e2e`
- [ ] Note test count and passing status

### After Changes
- [ ] `ResultsView.js` no longer checks for `SHOW_USAGE_COSTS`
- [ ] `TopicsView.js` no longer checks for `SHOW_USAGE_COSTS`
- [ ] `SettingsView.js` no longer checks for `SHOW_USAGE_COSTS`
- [ ] Usage costs are always displayed (no conditional)
- [ ] `FEATURE_FLAGS` object no longer contains `SHOW_USAGE_COSTS`
- [ ] Run unit tests: `npm test`
- [ ] Run E2E tests: `npm run test:e2e`

### Manual Verification
- [ ] Complete a quiz (with real API to have usage data)
- [ ] Verify token count and cost appear on results page
- [ ] Go to Topics view
- [ ] Verify cost appears on quiz history items
- [ ] Go to Settings
- [ ] Verify credits section displays correctly

---

## Commit

```bash
git add src/views/ResultsView.js src/views/TopicsView.js src/views/SettingsView.js src/core/features.js
git commit -m "refactor(hygiene): remove SHOW_USAGE_COSTS feature flag

- Remove isFeatureEnabled checks from ResultsView.js
- Remove isFeatureEnabled checks from TopicsView.js
- Remove isFeatureEnabled checks from SettingsView.js
- Usage costs are now always shown (feature is permanent)
- Remove flag from FEATURE_FLAGS object

Part of: Feature Flag Cleanup Wave 1"
```

---

**Learning Notes:** Capture in [PHASE1_LEARNING_NOTES.md](./PHASE1_LEARNING_NOTES.md#show_usage_costs)

**Previous:** [FLAG_SHARE_QUIZ.md](./FLAG_SHARE_QUIZ.md)
**Next:** [FLAG_OPENROUTER_GUIDE.md](./FLAG_OPENROUTER_GUIDE.md)
