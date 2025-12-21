# Phase 20 Learning Notes - Architecture Testing

## Session Log

### Session 1 - December 21, 2025

**What we accomplished:**

1. **Setup**
   - Created feature branch `feat/architecture-testing`
   - Installed dependency-cruiser (`npm install --save-dev dependency-cruiser`)
   - Ran init wizard (`npx depcruise --init`)

2. **Init Wizard Questions & Answers**

   | Question | Answer | Reasoning |
   |----------|--------|-----------|
   | It looks like this is an ESM package. Is that correct? | Yes | Project uses `import`/`export` syntax (ES Modules) |
   | Where do your source files live? | `src` | Main source directory |
   | Do your test files live in a separate folder? | No | Unit tests are co-located (`src/**/*.test.js`), E2E tests in `tests/e2e/` are outside `src/` anyway |
   | Do you want to detect JSDoc imports (slightly slower)? | No | Project doesn't heavily use JSDoc type imports |
   | Do you want to detect process.getBuiltinModule imports (slightly slower)? | No | Browser app, not Node.js - doesn't use this pattern |

   **Note:** The wizard questions were different than documented in PHASE20_ARCH_TESTING.md (which mentioned TypeScript and bundler questions). This may be due to dependency-cruiser version differences or the wizard adapting based on earlier answers.

3. **Files Created**
   - `.dependency-cruiser.cjs` - Generated configuration file

4. **First Scan & Fixing Issues**

   Ran first scan: `npx depcruise src --config .dependency-cruiser.cjs`

   Found 2 violations:

   | Violation | Rule | Resolution |
   |-----------|------|------------|
   | `src/main.js → virtual:pwa-register` | `not-to-unresolvable` | False positive - added `pathNot: "^virtual:"` exception |
   | `src/core/db.js → idb` | `not-to-dev-dep` | **Real issue!** Moved `idb` from devDependencies to dependencies |

5. **Configuration Updates**
   - Modified `not-to-unresolvable` rule to ignore Vite virtual modules
   - Added npm scripts: `arch:test`, `arch:graph`

6. **Final State**
   - `npm run arch:test` passes with 0 violations
   - 49 modules, 102 dependencies analyzed

---

## Key Learnings

### Questions I Asked

1. **"Why feature branches?"**
   - Keep new development independent from production code
   - Ability to revert easily
   - Safe experimentation

2. **"What makes a project ESM vs CommonJS?"**
   - ESM: Uses `import`/`export` syntax
   - CommonJS: Uses `require()`/`module.exports`
   - Check `"type": "module"` in package.json

3. **"Why does devDependencies vs dependencies matter?"**
   - `npm install --production` skips devDependencies
   - Production code should never import from devDependencies
   - In our case, Vite bundles everything so it worked anyway, but semantically wrong
   - dependency-cruiser's `not-to-dev-dep` rule caught this real issue

4. **"What are Vite virtual modules?"**
   - Modules like `virtual:pwa-register` don't exist as files
   - Created dynamically by Vite plugins at build time
   - Need to exclude from "unresolvable" checks with `pathNot: "^virtual:"`

### Default Rules in dependency-cruiser

The generated config includes sensible defaults:
- `no-circular` - Prevents A imports B, B imports A
- `no-orphans` - Flags files not imported anywhere (like Knip!)
- `not-to-unresolvable` - Can't import non-existent modules
- `not-to-dev-dep` - Production code can't use devDependencies

---

## Files Changed

| File | Change |
|------|--------|
| `.dependency-cruiser.cjs` | New - configuration with virtual module exception |
| `package.json` | Moved `idb` to dependencies, added `arch:test` and `arch:graph` scripts |

---

## Next Steps

- [x] Examine the generated `.dependency-cruiser.cjs` file
- [x] Run first architecture scan
- [x] Fix violations found
- [ ] Add custom rules for layer boundaries
- [ ] Integrate with CI
- [ ] Document architecture rules

---

**Last Updated:** 2025-12-21
**Status:** In Progress
