# Phase 15 Learning Notes - Dead Code Detection

## Session Log

### Session 1 - December 21, 2025

**What we accomplished:**
- Installed Knip (`npm install --save-dev knip`)
- Created `knip.json` configuration
- Ran first discovery scan

---

## Knip Findings (Triage)

### 1. Unused Files

| File | Decision | Reason |
|------|----------|--------|
| `src/views/TestView.js` | DELETE | Early router test from Nov 7, never used |

### 2. Unused devDependencies

| Package | Decision | Reason |
|---------|----------|--------|
| `cross-env` | DELETE | Installed but never used in any script |

### 3. Unlisted Binaries

| Binary | Decision | Reason |
|--------|----------|--------|
| `docker-compose` | IGNORE | System tool used in `test:php` script, not an npm package |

### 4. Unused Exports

| Export | File | Decision | Reason |
|--------|------|----------|--------|
| `generateQuestions` | `src/api/api.mock.js` | IGNORE | False positive - used via dynamic import |
| `generateExplanation` | `src/api/api.mock.js` | IGNORE | False positive - used via dynamic import |
| `generateQuestions` | `src/api/api.real.js` | IGNORE | False positive - used via dynamic import |
| `generateExplanation` | `src/api/api.real.js` | IGNORE | False positive - used via dynamic import |
| `generateExplanation` | `src/api/index.js` | KEEP | Correctly unused, but planned feature |

### 5. Configuration Hints

| Hint | Decision | Reason |
|------|----------|--------|
| `"main": "app.js"` in package.json | DELETE | Standalone app, not a library - `main` field not needed |

---

## Cleanup Actions (Done)

### Deleted
- [x] Delete `src/views/TestView.js`
- [x] Remove `cross-env` dependency (`npm uninstall cross-env`)
- [x] Remove `"main": "app.js"` from package.json

### Added to knip.json ignore
- [x] Ignore `docker-compose` binary (system tool)
- [x] Ignore API mock/real files (dynamic import pattern)
- [x] Ignore `generateExplanation` export (used `/** @public */` JSDoc tag)

---

## Key Learnings

1. **Knip uses entry points to trace dependencies** - It starts from `main.js` and follows imports to find what's actually used.

2. **Dynamic imports are invisible to Knip** - Code like `await import('./api.real.js')` can't be statically analyzed, so those files should be ignored.

3. **Use `git log --follow <file>` to understand history** - Before deleting code, check when/why it was added.

4. **System binaries vs npm packages** - Tools like `docker-compose` are system-level, not npm packages. Use `ignoreBinaries` to exclude them.

5. **JSDoc `@public` tag for planned features** - Use `/** @public */` to keep exports that aren't used yet but will be. Must use `/** */` not `//`.

6. **The `main` field in package.json** - Only needed for npm libraries, not standalone apps.

---

**Last Updated:** 2025-12-21
