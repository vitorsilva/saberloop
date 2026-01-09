# Flag Removal: OPENROUTER_GUIDE

**Status:** Planning
**Order:** 7 of 7 (most complex)
**Risk Level:** Low-Medium

---

## Flag Details

| Property | Value |
|----------|-------|
| Flag Name | `OPENROUTER_GUIDE` |
| Current Phase | `ENABLED` |
| Description | New OpenRouter connection guide with step-by-step instructions |
| Usages | 4 |
| Files Affected | 4 |

---

## Why Remove

This flag was used during rollout of the new OpenRouter setup guide. It's context-aware (`'welcome'`, `'settings'`, `'home'`) but now always returns `true` for all contexts. The old guide is deprecated:
- The flag always returns `true` for all contexts
- Context-aware routing is no longer needed
- The old `/welcome` flow can be removed or always redirects to new guide

---

## Complexity Note

This is the most complex removal because:
1. It's context-aware (different behavior per context)
2. Affects routing logic in multiple views
3. May have remnants of old guide code

**Approach:** Remove all conditionals, always use the new guide path (`/setup-openrouter`).

---

## Files to Modify

### 1. `src/views/WelcomeView.js`

**Line 112** - Remove conditional routing:

```javascript
// Before
if (isFeatureEnabled('OPENROUTER_GUIDE', 'welcome')) {
  navigateTo('/setup-openrouter');
} else {
  // old welcome flow
}

// After
navigateTo('/setup-openrouter');
```

### 2. `src/views/SettingsView.js`

**Line 426** - Remove conditional link:

```javascript
// Before
<a href="#${isFeatureEnabled('OPENROUTER_GUIDE', 'settings') ? '/setup-openrouter' : '/welcome'}"

// After
<a href="#/setup-openrouter"
```

### 3. `src/views/HomeView.js`

**Line 244** - Remove conditional:

```javascript
// Before
if (isFeatureEnabled('OPENROUTER_GUIDE', 'home')) {
  // new guide behavior
} else {
  // old behavior
}

// After
// Always use new guide behavior
```

### 4. `src/main.js`

**Line 174** - Remove conditional routing:

```javascript
// Before
if (isFeatureEnabled('OPENROUTER_GUIDE', 'welcome')) {
  // new route setup
}

// After
// Always use new route setup
```

### 5. `src/core/features.js`

Remove flag from `FEATURE_FLAGS` object:

```javascript
// Remove this entire entry
OPENROUTER_GUIDE: {
  phase: 'ENABLED',
  description: 'New OpenRouter connection guide with step-by-step instructions'
},
```

---

## Verification Checklist

### Before Changes
- [ ] Run baseline tests: `npm test && npm run test:e2e`
- [ ] Note test count and passing status
- [ ] Manually test current OpenRouter setup flow to understand expected behavior

### After Changes
- [ ] All `OPENROUTER_GUIDE` references removed from source files
- [ ] `FEATURE_FLAGS` object no longer contains `OPENROUTER_GUIDE`
- [ ] Run unit tests: `npm test`
- [ ] Run E2E tests: `npm run test:e2e`

### Manual Verification
- [ ] Fresh user flow: App should guide to `/setup-openrouter`
- [ ] Settings link: "Connect OpenRouter" should go to `/setup-openrouter`
- [ ] Home page: If not connected, should prompt to setup
- [ ] Complete the OpenRouter OAuth flow to verify it still works

### Routing Verification
- [ ] `/setup-openrouter` route works
- [ ] No broken links to old `/welcome` for OpenRouter setup
- [ ] Back navigation works correctly

---

## Commit

```bash
git add src/views/WelcomeView.js src/views/SettingsView.js src/views/HomeView.js src/main.js src/core/features.js
git commit -m "refactor(hygiene): remove OPENROUTER_GUIDE feature flag

- Remove isFeatureEnabled checks from WelcomeView.js
- Remove isFeatureEnabled checks from SettingsView.js
- Remove isFeatureEnabled checks from HomeView.js
- Remove isFeatureEnabled checks from main.js
- Always use new OpenRouter guide (old guide deprecated)
- Remove flag from FEATURE_FLAGS object

Part of: Feature Flag Cleanup Wave 1"
```

---

**Learning Notes:** Capture in [PHASE1_LEARNING_NOTES.md](./PHASE1_LEARNING_NOTES.md#openrouter_guide)

**Previous:** [FLAG_SHOW_USAGE_COSTS.md](./FLAG_SHOW_USAGE_COSTS.md)
**Final step:** Update index and create PR
