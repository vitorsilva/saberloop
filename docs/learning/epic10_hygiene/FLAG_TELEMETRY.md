# Flag Removal: TELEMETRY

**Status:** Planning
**Order:** 1 of 7 (lowest risk)
**Risk Level:** Low

---

## Flag Details

| Property | Value |
|----------|-------|
| Flag Name | `TELEMETRY` |
| Current Phase | `ENABLED` |
| Description | Send telemetry (logs, errors, metrics) to VPS for debugging |
| Usages | 1 |
| Files Affected | 1 |

---

## Why Remove

This flag was used for gradual rollout when telemetry was first deployed. Now that telemetry is stable:
- The flag always returns `true`
- The `CONFIG.enabled` environment check is sufficient for environment control
- The flag adds unnecessary complexity

---

## Files to Modify

### 1. `src/utils/telemetry.js`

**Line 63** - Remove feature flag check:

```javascript
// Before
return CONFIG.enabled && isFeatureEnabled('TELEMETRY');

// After
return CONFIG.enabled;
```

Also remove the import if no longer needed:
```javascript
// Remove this import if TELEMETRY was the only flag used
import { isFeatureEnabled } from '../core/features.js';
```

### 2. `src/core/features.js`

Remove flag from `FEATURE_FLAGS` object:

```javascript
// Remove this entire entry
TELEMETRY: {
  phase: 'ENABLED',
  description: 'Send telemetry (logs, errors, metrics) to VPS for debugging'
},
```

---

## Verification Checklist

### Before Changes
- [ ] Run baseline tests: `npm test && npm run test:e2e`
- [ ] Note test count and passing status

### After Changes
- [ ] `src/utils/telemetry.js` no longer imports `isFeatureEnabled` (if not used elsewhere)
- [ ] `src/utils/telemetry.js` uses only `CONFIG.enabled`
- [ ] `FEATURE_FLAGS` object no longer contains `TELEMETRY`
- [ ] Run unit tests: `npm test`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Verify telemetry still works (check network tab for telemetry calls)

### Manual Verification
- [ ] Open app in dev mode
- [ ] Perform an action that triggers telemetry (e.g., complete a quiz)
- [ ] Check browser Network tab for telemetry POST request
- [ ] Confirm telemetry is still being sent

---

## Commit

```bash
git add src/utils/telemetry.js src/core/features.js
git commit -m "refactor(hygiene): remove TELEMETRY feature flag

- Remove isFeatureEnabled check from telemetry.js
- CONFIG.enabled is sufficient for environment control
- Remove flag from FEATURE_FLAGS object

Part of: Feature Flag Cleanup Wave 1"
```

---

**Learning Notes:** Capture in [PHASE1_LEARNING_NOTES.md](./PHASE1_LEARNING_NOTES.md#telemetry)

**Next:** [FLAG_CONTINUE_TOPIC.md](./FLAG_CONTINUE_TOPIC.md)
