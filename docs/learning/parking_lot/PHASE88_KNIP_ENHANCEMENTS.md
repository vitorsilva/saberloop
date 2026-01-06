# Phase 88: Knip Configuration Enhancements

## Overview

Enhance Knip (dead code detection) configuration to leverage more of its capabilities, improving CI feedback, developer experience, and code quality enforcement.

**Status:** Parked (moved from Epic 5 on 2026-01-06)
**Priority:** Low (Developer Experience)
**Estimated Effort:** Small (~1-2 hours)
**Reason Parked:** Low priority, not blocking any features

---

## Current State

### Current Configuration (knip.json)
```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": ["src/main.js"],
  "project": ["src/**/*.js"],
  "ignore": ["**/*.test.js", "**/*.spec.js", "src/api/api.mock.js", "src/api/api.real.js"],
  "ignoreBinaries": ["docker-compose"],
  "ignoreExportsUsedInFile": true,
  "vite": true
}
```

### Current CI Usage (.github/workflows/test.yml)
```yaml
- name: Check for dead code (warning)
  run: npm run lint:dead-code || true
```

### Current Issues Detected
1. **Unused file**: `src/types.js` - JSDoc type definitions file (false positive)
2. **Unlisted binary**: `start` - Windows command in `docs:open` script

---

## Goals

1. **Fix current warnings** - Eliminate false positives
2. **Improve CI integration** - Better feedback in pull requests
3. **Enable caching** - Faster local and CI runs
4. **Add production mode** - Stricter analysis for production code

---

## Implementation Plan

### Step 1: Fix Current Warnings

**Update knip.json:**
```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": ["src/main.js"],
  "project": ["src/**/*.js"],
  "ignore": [
    "**/*.test.js",
    "**/*.spec.js",
    "src/api/api.mock.js",
    "src/api/api.real.js",
    "src/types.js"
  ],
  "ignoreBinaries": ["docker-compose", "start"],
  "ignoreExportsUsedInFile": true,
  "vite": true
}
```

**Rationale:**
- `src/types.js` is a JSDoc typedef file that doesn't export runtime code
- `start` is a Windows command used in `docs:open` script

### Step 2: Add npm Scripts for New Modes

**Update package.json scripts:**
```json
{
  "scripts": {
    "lint:dead-code": "knip",
    "lint:dead-code:fix": "knip --fix",
    "lint:dead-code:prod": "knip --production",
    "lint:dead-code:ci": "knip --cache --reporter github-actions"
  }
}
```

**New scripts:**
- `lint:dead-code:prod` - Stricter production-only analysis
- `lint:dead-code:ci` - Optimized for CI with caching and GitHub annotations

### Step 3: Enable Production Mode

**Update knip.json for production mode support:**
```json
{
  "entry": ["src/main.js!"],
  "project": ["src/**/*.js"]
}
```

**The `!` suffix marks production entry points.** When running with `--production`:
- Only production dependencies are checked (not devDependencies)
- Test files are excluded
- Stricter unused export detection

### Step 4: Update CI Workflow

**Update .github/workflows/test.yml:**
```yaml
- name: Check for dead code
  run: npx knip --cache --reporter github-actions
```

**Benefits:**
- `--cache`: 10-40% faster consecutive runs
- `--reporter github-actions`: Inline annotations on PR diffs
- Remove `|| true` to enforce (or keep for warnings-only)

### Step 5: Add Watch Mode Documentation

**Document for developers:**
```bash
# During refactoring sessions, run in watch mode:
npx knip --watch
```

---

## Configuration Options Considered

### Enabled in This Phase
| Option | Value | Reason |
|--------|-------|--------|
| `--cache` | Enabled | 10-40% faster runs |
| `--reporter github-actions` | CI only | Inline PR annotations |
| Production mode | Available | Stricter prod analysis |

### Deferred (Not Needed Now)
| Option | Reason for Deferral |
|--------|---------------------|
| `classMembers` | Project uses mostly functions, few classes |
| `--strict` | Too aggressive for current codebase |
| JSON reporter | No downstream tooling needs it |
| Custom reporters | Default + GitHub Actions sufficient |

---

## Files to Change

1. **knip.json** - Add ignores for false positives
2. **package.json** - Add new npm scripts
3. **.github/workflows/test.yml** - Update CI command

---

## Validation Checklist

- [ ] `npm run lint:dead-code` returns 0 exit code (no issues)
- [ ] `npm run lint:dead-code:prod` runs without errors
- [ ] `npm run lint:dead-code:ci` produces GitHub Actions annotations
- [ ] CI workflow passes with new configuration
- [ ] Cache directory created in `node_modules/.cache/knip`

---

## Success Metrics

- **Zero false positives** in default Knip run
- **10-40% faster** CI runs with caching enabled
- **Inline annotations** visible on GitHub PR diffs
- **Production mode** available for stricter checks

---

## Rollback Plan

If issues arise:
1. Revert to previous `knip.json`
2. Restore `|| true` in CI workflow
3. Remove new npm scripts

---

## Related Documentation

- [Knip Official Docs](https://knip.dev)
- [Knip CLI Reference](https://knip.dev/reference/cli)
- [Knip Issue Types](https://knip.dev/reference/issue-types)
- [GitHub Actions Reporter](https://knip.dev/features/reporters)

---

## Notes

- Knip auto-detects plugins for: Vite, Vitest, Playwright, Tailwind, PostCSS, Stryker, TypeScript
- All plugins are already working via auto-detection
- The `vite: true` in config is explicit but redundant (auto-detected)
- Watch mode is useful during refactoring but not added to npm scripts (run manually)
