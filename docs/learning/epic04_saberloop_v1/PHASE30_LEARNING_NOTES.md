# Phase 30: Internationalization (i18n) - Learning Notes

## Status: In Progress

**Started:** December 27, 2024
**Branch:** `main` (pre-phase merged), next phases will use feature branches

---

## Pre-Phase: Staging Environment Setup (Complete)

### What We Did

Before starting i18n implementation, we set up a staging environment to safely test large changes.

**PR #39** - Merged December 27, 2024

| Deliverable | Status |
|-------------|--------|
| Staging URL: https://saberloop.com/app-staging/ | ✅ Live |
| `npm run build:staging` | ✅ Added |
| `npm run deploy:staging` | ✅ Added |
| `npm run build:deploy:staging` | ✅ Added |
| Manifest validation | ✅ Implemented |
| Documentation | ✅ `docs/developer-guide/STAGING_DEPLOYMENT.md` |

### Key Learnings

#### 1. Environment Variables in Vite Config

Vite config can read environment variables to change build behavior:

```javascript
function getBasePath(command) {
    if (command === 'serve') return '/';
    if (process.env.DEPLOY_TARGET === 'staging') return '/app-staging/';
    return '/app/';
}
```

**Insight:** The `command` parameter tells us if we're in dev (`serve`) or build mode.

#### 2. Dynamic PWA Manifest

The PWA manifest paths (scope, start_url, icons) must match the deployment path:

```javascript
// Before (hardcoded)
id: '/app/',
scope: '/app/',
start_url: '/app/',
icons: [{ src: '/app/icons/icon-192x192.png', ... }]

// After (dynamic)
id: base,
scope: base,
start_url: base,
icons: [{ src: `${base}icons/icon-192x192.png`, ... }]
```

**Insight:** Template literals (`${base}`) make paths dynamic without string concatenation.

#### 3. Build/Deploy Validation

Preventing mismatches between build and deploy targets:

```javascript
function validateManifest() {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const manifestBase = manifest.scope;

    if (manifestBase !== expectedBase) {
        console.error('❌ Build/deploy mismatch detected!');
        process.exit(1);
    }
}
```

**Insight:** Fail fast with clear error messages. Tell the user exactly how to fix it.

#### 4. Cross-Platform Environment Variables

On Windows, `DEPLOY_TARGET=staging npm run build` doesn't work. Use `cross-env`:

```json
"build:staging": "cross-env DEPLOY_TARGET=staging npm run build"
```

**Insight:** `cross-env` abstracts OS differences for npm scripts.

### Questions Answered

**Q: Why use feature branches?**
A: To isolate changes so main stays stable. If something breaks, production is unaffected.

**Q: How do we pass config to builds without changing code?**
A: Environment variables. They're external to code and can vary per environment.

**Q: How do we prevent deploying wrong build to wrong environment?**
A: Validate before deploying. Check the manifest matches the target.

---

## Phase 30.1: i18n Infrastructure (Pending)

*To be completed*

---

## Phase 30.2: Test Migration to data-testid (Pending)

*To be completed*

---

## Phase 30.3: String Extraction (Pending)

*To be completed*

---

## Phase 30.4: Language Settings UI (Pending)

*To be completed*

---

## Phase 30.5: LLM Language Integration (Pending)

*To be completed*

---

## Phase 30.6: Locale-Aware Formatting (Pending)

*To be completed*

---

## Phase 30.7: CLI Translation Utility (Pending)

*To be completed*

---

## Summary

| Sub-Phase | Status | Key Learning |
|-----------|--------|--------------|
| Pre-Phase: Staging | ✅ Complete | Environment variables, validation, cross-platform scripts |
| 30.1: Infrastructure | ⏳ Pending | |
| 30.2: Test Migration | ⏳ Pending | |
| 30.3: String Extraction | ⏳ Pending | |
| 30.4: Language Settings | ⏳ Pending | |
| 30.5: LLM Integration | ⏳ Pending | |
| 30.6: Formatters | ⏳ Pending | |
| 30.7: CLI Tool | ⏳ Pending | |

---

## Next Session

Start Phase 30.1: i18n Infrastructure Setup
- Install i18next
- Create core i18n module
- Add starter translation files (en, pt-PT)
- Add unit tests
