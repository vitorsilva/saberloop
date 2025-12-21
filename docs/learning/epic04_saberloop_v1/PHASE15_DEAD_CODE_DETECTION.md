# Phase 15: Dead Code Detection with Knip

**Epic:** 4 - Saberloop V1
**Phase:** 15 - Dead Code Detection
**Status:** Ready to Implement
**Estimated Sessions:** 2-3 sessions
**Prerequisites:** None (can be done anytime)

---

## Overview

This phase introduces **dead code detection** to identify and remove unused code that accumulated during the learning-focused development process. As the project evolved from educational exercises (Epic 01-02) to a production app (Epic 03-04), some code became obsolete but was never removed.

**What you'll implement:**
- Automated detection of unused files, exports, and dependencies
- Gradual rollout: warnings first, then blocking in CI
- Ignore list for intentionally kept educational/utility code
- Integration with existing GitHub Actions CI pipeline

**Why this is valuable:**
- **Cleaner codebase** - Remove clutter from learning phases
- **Smaller bundles** - Unused code may still end up in builds
- **Easier navigation** - Less noise when exploring code
- **Prevent regression** - CI catches new dead code before merge
- **Learn static analysis** - Understand how tools analyze code

---

## Tool Selection: Knip

After evaluating two candidates, **Knip** was selected:

### Why Knip over dead-code-checker

| Requirement | dead-code-checker | Knip |
|-------------|------------------|------|
| Unused functions/variables | Yes | Yes |
| Unused exports | No | Yes |
| Unused files | No | Yes |
| Unused dependencies | No | Yes |
| Vite support | Generic | Built-in plugin |
| Ignore/exclude config | CLI only | Config file |
| Auto-fix dependencies | No | Yes (`--fix`) |
| Community adoption | Small | 9.7k+ stars, used by Vercel |
| Active maintenance | Moderate | Very active (527 releases) |

**Knip covers all requirements** with a single tool and has excellent documentation.

### Alternative Considered

**[dead-code-checker](https://github.com/denisoed/dead-code-checker)** - Simpler tool focused only on unused functions/variables/imports. Good for quick checks but lacks the comprehensive analysis we need.

---

## Learning Objectives

By the end of this phase, you will:
- [ ] Understand static analysis for dead code detection
- [ ] Configure Knip for a Vite/vanilla JS project
- [ ] Create meaningful ignore patterns for intentional code
- [ ] Integrate static analysis into CI pipeline
- [ ] Practice gradual rollout (warning -> blocking)
- [ ] Clean up legacy code from learning phases

---

## What Knip Detects

### 1. Unused Files
Files that exist but are never imported anywhere:
```
src/utils/oldHelper.js  # No imports found
src/views/DeprecatedView.js  # Orphaned file
```

### 2. Unused Exports
Functions/classes/variables that are exported but never imported:
```javascript
// src/utils/helpers.js
export function usedFunction() { ... }  // Used
export function unusedFunction() { ... }  // Never imported
```

### 3. Unused Dependencies
Packages in `package.json` that aren't actually used:
```json
{
  "dependencies": {
    "loglevel": "^1.9.2",  // Used
    "some-old-lib": "^1.0.0"  // Never imported
  }
}
```

### 4. Unlisted Dependencies
The opposite - code imports packages not in `package.json`:
```javascript
import something from 'unlisted-package';  // Not in package.json
```

---

## Implementation Plan

### Session 1: Initial Setup & Discovery

#### Step 1.1: Install Knip

```bash
npm install --save-dev knip
```

#### Step 1.2: Create Configuration File

Create `knip.json` in project root:

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": [
    "src/main.js",
    "src/sw.js"
  ],
  "project": [
    "src/**/*.js"
  ],
  "ignore": [
    "src/**/*.test.js"
  ],
  "ignoreDependencies": [],
  "vite": true
}
```

**Configuration explained:**
- `entry`: Main entry points Knip traces imports from
- `project`: All source files to analyze
- `ignore`: Files to skip (tests have different import patterns)
- `ignoreDependencies`: Packages to ignore (populated later)
- `vite`: Enable Vite plugin for config file analysis

#### Step 1.3: First Run (Discovery Mode)

```bash
npx knip
```

This will output all detected issues. **Don't fix anything yet** - just observe what it finds.

**Expected output categories:**
```
Unused files (2)
src/some-old-file.js
src/another-unused.js

Unused exports (5)
src/utils/helpers.js: unusedHelper
src/core/state.js: deprecatedFunction
...

Unused dependencies (1)
some-package

Unlisted dependencies (0)
(none - good!)
```

#### Step 1.4: Document Findings

Create a temporary file to track what was found:

```markdown
# Knip Initial Findings - [Date]

## Unused Files
- [ ] src/xxx.js - Reason: ___
- [ ] src/yyy.js - Reason: ___

## Unused Exports
- [ ] src/utils/helpers.js: functionName - Keep/Remove?
- [ ] ...

## Unused Dependencies
- [ ] package-name - Remove?

## False Positives (to ignore)
- src/api/api.mock.js - Educational, keep for reference
- ...
```

---

### Session 1-2: Triage & Ignore List

#### Step 2.1: Categorize Findings

For each finding, decide:

| Category | Action | Example |
|----------|--------|---------|
| **Truly unused** | Remove in cleanup | Old helper function |
| **Educational** | Add to ignore | Mock API, sample data |
| **Dynamic usage** | Add to ignore | Dynamically imported |
| **Test utilities** | Already ignored | Test helpers |
| **Future planned** | Decide case-by-case | Partially implemented |

#### Step 2.2: Update Ignore Configuration

Based on triage, update `knip.json`:

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": [
    "src/main.js",
    "src/sw.js"
  ],
  "project": [
    "src/**/*.js"
  ],
  "ignore": [
    "src/**/*.test.js",
    "src/api/api.mock.js"
  ],
  "ignoreDependencies": [
    "fake-indexeddb"
  ],
  "ignoreExportsUsedInFile": true,
  "vite": true
}
```

**Common ignore patterns for this project:**

| Pattern | Reason |
|---------|--------|
| `src/**/*.test.js` | Test files have different import patterns |
| `src/api/api.mock.js` | Educational mock, kept for reference |
| `fake-indexeddb` | Used only in tests (dev dependency) |
| `jsdom` | Used only in test config |

#### Step 2.3: Verify Ignore List

Run Knip again and confirm only truly unused code is reported:

```bash
npx knip
```

If the output is manageable and accurate, proceed to cleanup.

---

### Session 2: Cleanup

#### Step 3.1: Remove Unused Dependencies

Knip can auto-fix unused dependencies:

```bash
# Preview what would be removed
npx knip --fix --no-fix

# Actually remove them
npx knip --fix
```

This updates `package.json` and you should run `npm install` after.

#### Step 3.2: Remove Unused Files

For each unused file, manually:
1. Verify it's truly unused (search for imports)
2. Check git history for context
3. Delete the file
4. Commit with clear message

```bash
# Example commit
git rm src/utils/oldHelper.js
git commit -m "chore: remove unused oldHelper utility (detected by Knip)"
```

#### Step 3.3: Remove Unused Exports

For each unused export:
1. Find the file and export
2. Decide: remove export keyword, or remove entire function?
3. If function is used internally, just remove `export`
4. If function is completely unused, remove it

```javascript
// Before
export function unusedHelper() { ... }

// After (if used internally)
function unusedHelper() { ... }

// Or delete entirely if truly unused
```

#### Step 3.4: Verify Clean State

After all cleanups:

```bash
npx knip
```

Should output: No issues found (or only intentionally ignored items)

---

### Session 2-3: CI Integration - Warning Mode

#### Step 4.1: Add npm Script

Update `package.json`:

```json
{
  "scripts": {
    "lint:dead-code": "knip",
    "lint:dead-code:fix": "knip --fix"
  }
}
```

#### Step 4.2: Add to CI (Warning Only)

Update `.github/workflows/test.yml`:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # ... existing steps ...

      - name: Check for dead code (warning)
        run: npx knip || true
        # `|| true` means it won't fail the build, just report

      # ... rest of steps ...
```

This provides visibility without blocking PRs.

#### Step 4.3: Monitor for 1-2 Weeks

- Review CI output on each PR
- Note any false positives that appear
- Update ignore list as needed
- Get comfortable with the output

---

### Session 3: CI Integration - Blocking Mode

#### Step 5.1: Remove Warning-Only Mode

Update `.github/workflows/test.yml`:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # ... existing steps ...

      - name: Check for dead code
        run: npm run lint:dead-code
        # No `|| true` - will fail build if issues found

      # ... rest of steps ...
```

#### Step 5.2: Document for Contributors

Add to `CONTRIBUTING.md` or `CLAUDE.md`:

```markdown
## Dead Code Policy

This project uses [Knip](https://knip.dev/) to detect unused code.

**Before committing:**
```bash
npm run lint:dead-code
```

**If you see issues:**
1. Remove truly unused code
2. If code is intentionally kept, add to `knip.json` ignore list
3. Document why in the commit message

**Auto-fix unused dependencies:**
```bash
npm run lint:dead-code:fix
```
```

---

## Configuration Reference

### Full knip.json Example

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": [
    "src/main.js",
    "src/sw.js"
  ],
  "project": [
    "src/**/*.js"
  ],
  "ignore": [
    "src/**/*.test.js",
    "scripts/**/*.js",
    "src/api/api.mock.js"
  ],
  "ignoreDependencies": [
    "fake-indexeddb",
    "jsdom"
  ],
  "ignoreExportsUsedInFile": true,
  "vite": true
}
```

### Common CLI Options

| Command | Description |
|---------|-------------|
| `npx knip` | Run analysis, report issues |
| `npx knip --fix` | Auto-remove unused dependencies |
| `npx knip --include files` | Only check unused files |
| `npx knip --include exports` | Only check unused exports |
| `npx knip --include dependencies` | Only check dependencies |
| `npx knip --reporter compact` | Compact output format |
| `npx knip --reporter json` | JSON output (for tooling) |

---

## Success Criteria

**Phase is complete when:**

- [ ] Knip installed and configured
- [ ] Initial discovery run completed
- [ ] Ignore list created for intentional code
- [ ] Unused code cleaned up (files, exports, dependencies)
- [ ] `npm run lint:dead-code` script added
- [ ] CI integration (warning mode) working
- [ ] After 1-2 weeks: CI promoted to blocking mode
- [ ] Documentation updated

**Verification:**
```bash
# Should report no issues (or only ignored items)
npm run lint:dead-code

# CI should pass
git push  # Check GitHub Actions
```

---

## Troubleshooting

### False Positives: Dynamic Imports

If you use dynamic imports, Knip may not detect usage:

```javascript
// This import pattern may not be detected
const module = await import(`./views/${viewName}.js`);
```

**Solution:** Add to ignore list or use Knip's dynamic import configuration.

### Dev Dependencies Flagged as Unused

Some dev dependencies are used by tools, not imported in code:

```json
{
  "ignoreDependencies": [
    "autoprefixer",
    "postcss",
    "tailwindcss"
  ]
}
```

### Performance on Large Projects

If analysis is slow, use include filters:

```bash
# Only check dependencies (fastest)
npx knip --include dependencies

# Only check exports
npx knip --include exports
```

---

## Related Documentation

- [Knip Official Documentation](https://knip.dev/)
- [Knip GitHub Repository](https://github.com/webpro-nl/knip)
- [Vite Plugin for Knip](https://knip.dev/reference/plugins/vite)
- Phase 20: Architecture Testing (related static analysis)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-21 | Selected Knip over dead-code-checker | Covers all requirements (files, exports, deps) |
| 2025-12-21 | Gradual rollout approach | Minimize disruption, allow learning |
| 2025-12-21 | Warning -> Blocking in CI | Build confidence before enforcing |
| 2025-12-21 | Plan ignore list from start | Account for educational code |
| 2025-12-21 | Moved from parking lot to Phase 15 | Execute before Phase 20 (Architecture Testing) |

---

**Last Updated:** 2025-12-21
**Status:** Ready to Implement
**Location:** `docs/learning/epic04_saberloop_v1/PHASE15_DEAD_CODE_DETECTION.md`
