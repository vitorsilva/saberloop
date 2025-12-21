# Phase 15 Learning Notes - Dead Code Detection

## Session Log

### Session 1 - December 21, 2025

**What we accomplished:**

1. **Setup**
   - Created feature branch `feat/dead-code-detection`
   - Installed Knip (`npm install --save-dev knip`)
   - Created `knip.json` configuration with entry point `src/main.js`

2. **Discovery & Triage**
   - Ran first Knip scan, found 5 categories of issues
   - Triaged each finding: DELETE, IGNORE, or KEEP
   - Learned to use `git log --follow` to check file history before deleting

3. **Cleanup**
   - Deleted `src/views/TestView.js` (unused since Nov 7, 2025)
   - Removed `cross-env` dependency (installed but never used)
   - Removed `"main": "app.js"` from package.json (not needed for standalone app)
   - Added ignores for false positives (dynamic imports, system binaries)
   - Used `/** @public */` JSDoc tag for planned feature export

4. **CI Integration**
   - Added npm scripts: `lint:dead-code`, `lint:dead-code:fix`
   - Added CI step in warning mode (`|| true` - reports but doesn't fail build)

**Commits made:**
1. `feat: add knip for dead code detection`
2. `chore: remove unused file`
3. `chore: initial knip configuration`
4. `chore: remove unused dependency and main`
5. `chore: set knip ignore for generate explanations`
6. `docs: update learning notes and version number`
7. `feat: add knip to scripts`
8. `feat: add to ci pipeline`

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

### Questions I Asked

1. **"Why --save-dev instead of regular install?"**
   - Dev dependencies are only used during development/CI, not shipped to production
   - Keeps the production bundle smaller

2. **"Should I create a branch first?"**
   - Yes! Feature branches keep work separated from main until tested
   - Naming convention: `feat/` for features, `fix/` for bugs

3. **"Is the entry point main.js or app.js?"**
   - Vite uses `index.html` as entry, which references the JS file
   - Check the `<script>` tag in index.html to find the real entry point
   - vite-plugin-pwa auto-generates the service worker (no manual sw.js needed)

4. **"How do I see when a file was added in git?"**
   - `git log --follow <file>` shows commit history for that file
   - Always check history before deleting - understand WHY code exists

5. **"How do I check if a dependency is used?"**
   - Search the `scripts` section in package.json for the package name
   - If not referenced anywhere, it's safe to remove

### Concepts Discovered

6. **Dynamic imports are invisible to static analysis**
   - `await import('./api.real.js')` can't be traced by Knip
   - Solution: add dynamically imported files to ignore list

7. **System binaries vs npm packages**
   - `docker-compose` is a system tool, not an npm package
   - Use `ignoreBinaries` in knip.json for these

8. **JSDoc syntax for Knip, not // comments**
   - Must use `/** @public */` format
   - Regular `// knip-ignore` comments don't work
   - Always check tool documentation instead of guessing!

9. **The `main` field in package.json**
   - Only needed for npm libraries that others import
   - Standalone apps don't need it

10. **CI pipeline ordering matters**
    - Dead code check goes BEFORE tests
    - Fast feedback first - no point running 10 min of E2E if there's dead code

11. **Warning mode with `|| true`**
    - `npm run lint:dead-code || true` reports issues but doesn't fail build
    - Good for gradual rollout - monitor first, enforce later

---

## Next Steps

- [ ] Create PR to merge `feat/dead-code-detection` to main
- [ ] After 1-2 weeks of CI monitoring, promote to blocking mode (remove `|| true`)
- [ ] Update CLAUDE.md with dead code policy (optional)

---

## Files Changed

| File | Change |
|------|--------|
| `knip.json` | New - Knip configuration |
| `package.json` | Added knip, removed cross-env, removed main field, added scripts |
| `src/views/TestView.js` | Deleted - unused file |
| `src/api/index.js` | Added `@public` JSDoc tag |
| `.github/workflows/test.yml` | Added dead code check step |

---

**Last Updated:** 2025-12-21
**Status:** Complete (pending PR merge)
