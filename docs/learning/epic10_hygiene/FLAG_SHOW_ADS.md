# Flag: SHOW_ADS

**Status:** Active - Keep
**Review After:** Epic 07 (Monetization) completion
**Risk Level:** N/A (not removing yet)

---

## Flag Details

| Property | Value |
|----------|-------|
| Flag Name | `SHOW_ADS` |
| Current Phase | `ENABLED` |
| Description | Display Google AdSense ads during quiz and results loading |
| Usages | 2 |
| Files Affected | 1 (`src/utils/adManager.js`) |

---

## Why Keep

This flag is intentionally kept for **future premium/ad-free tier** planned in Epic 07 (Monetization).

**Future use case:**
- Premium users should not see ads
- Flag will transform into a subscription/premium check
- e.g., `!userHasPremium() && isFeatureEnabled('SHOW_ADS')`

---

## Current Usages

### `src/utils/adManager.js`

**Line 43** - Early return if disabled:
```javascript
if (!isFeatureEnabled('SHOW_ADS')) {
  return;
}
```

**Line 217** - Debug info:
```javascript
featureEnabled: isFeatureEnabled('SHOW_ADS'),
```

---

## Removal Criteria

Remove this flag when ALL conditions are met:

- [ ] Epic 07 (Monetization) is complete
- [ ] Premium tier is implemented with proper subscription check
- [ ] Flag is replaced with `userHasPremium()` or equivalent
- [ ] OR decision made that premium/ad-free tier will not be implemented

---

## Transformation Plan

When Epic 07 is implemented, this flag should be **transformed** rather than removed:

```javascript
// Current
if (!isFeatureEnabled('SHOW_ADS')) {
  return;
}

// Future (Epic 07)
if (userHasPremium() || !isFeatureEnabled('SHOW_ADS')) {
  return;  // Premium users or flag disabled = no ads
}

// Final (after stable)
if (userHasPremium()) {
  return;  // Only premium check needed, remove flag
}
```

---

## Related

- [Epic 07: Monetization](../../epic07_monetization/EPIC7_MONETIZATION_PLAN.md)
- [PHASE62: License Key Premium](../../epic07_monetization/PHASE62_LICENSE_KEY_PREMIUM.md)

---

**Last Updated:** 2026-01-09
