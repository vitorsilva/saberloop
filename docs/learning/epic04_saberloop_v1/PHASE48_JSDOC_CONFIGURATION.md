# Phase 48: JSDoc Documentation & Type Checking

## Overview

Configure JSDoc for **two purposes**:
1. **Documentation Generation** - Generate HTML API docs from code comments
2. **Type Checking** - Catch type errors at edit-time via VS Code and CLI

This improves code quality and developer experience without migrating to TypeScript.

## Problem Statement

**Current State:**
- JSDoc comments exist across 17 files (~128 annotations)
- Good coverage in services (`quiz-service.js`, `auth-service.js`)
- No documentation website generated from code
- No `jsconfig.json` - VS Code type checking disabled
- No custom type definitions for complex objects (Quiz, Question, Session)
- No automated type checking in CI

**Desired State:**
- `npm run docs` generates browsable HTML API documentation
- `jsconfig.json` enables type checking with `checkJs: true`
- Custom type definitions (`@typedef`) for core data structures
- `npm run typecheck` validates types from CLI
- CI integration (warning mode initially)
- Improved IDE autocomplete and error detection

## Why JSDoc (Not TypeScript)?

| Factor | JSDoc | TypeScript |
|--------|-------|------------|
| Build step | None required | Required |
| Learning curve | Minimal (just comments) | Moderate |
| Gradual adoption | Add per-file/function | All-or-nothing migration |
| Runtime overhead | None | None (compiles away) |
| IDE support | Good (VS Code) | Excellent |
| Documentation | Built-in HTML generation | Requires separate tool |
| Best for | Existing vanilla JS projects | New projects, large teams |

**Decision:** JSDoc is the right choice for Saberloop because:
1. Project is vanilla JavaScript with no TypeScript tooling
2. Already using JSDoc in key files
3. Can adopt incrementally without build changes
4. Generates documentation AND enables type checking
5. Matches learning-focused nature of the project

---

## Learning Objectives

- Understanding JSDoc comment syntax and tags
- Generating HTML documentation with JSDoc CLI
- Configuring `jsconfig.json` for type checking
- Writing `@typedef` for complex object types
- Using `@param`, `@returns`, `@type` effectively
- CI integration for type checking

---

## Implementation Plan

### 48.1 - Install Dependencies

**Install JSDoc for documentation generation:**
```bash
npm install --save-dev jsdoc
```

**Install TypeScript for type checking:**
```bash
npm install --save-dev typescript
```

**Why both?**
- `jsdoc` - Generates HTML documentation from comments
- `typescript` - Checks types in JS files using JSDoc annotations (via `tsc` CLI)

---

### 48.2 - Create JSDoc Configuration

**File:** `jsdoc.config.json` (project root)

**Purpose:** Configure JSDoc documentation generation.

```json
{
  "source": {
    "include": ["src"],
    "includePattern": ".+\\.js$",
    "excludePattern": "(node_modules|test)"
  },
  "opts": {
    "destination": "docs/api",
    "recurse": true,
    "readme": "README.md"
  },
  "plugins": ["plugins/markdown"],
  "templates": {
    "cleverLinks": true,
    "monospaceLinks": true
  }
}
```

**Key options:**
- `source.include` - Which directories to document
- `opts.destination` - Where to output HTML docs
- `opts.recurse` - Include subdirectories
- `plugins/markdown` - Render markdown in descriptions

---

### 48.3 - Create jsconfig.json

**File:** `jsconfig.json` (project root)

**Purpose:** Enable JavaScript type checking in VS Code and for CLI validation.

```json
{
  "compilerOptions": {
    "checkJs": true,
    "strict": false,
    "noEmit": true,
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.js"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Key options explained:**
- `checkJs: true` - Enable type checking for .js files
- `strict: false` - Start permissive, tighten later
- `noEmit: true` - Don't generate output files
- `target/module: ES2022` - Modern JavaScript features
- `moduleResolution: bundler` - Works with Vite

---

### 48.4 - Create Type Definitions File

**File:** `src/types.js`

**Purpose:** Define shared types for core data structures using `@typedef`.

```javascript
/**
 * @file Type definitions for Saberloop
 * @module types
 *
 * This file contains JSDoc type definitions used throughout the application.
 * Import types using:
 *   import './types.js' // for side effects (registers types)
 * Or reference directly:
 *   @type {import('./types.js').Question}
 */

// ============================================
// Quiz & Question Types
// ============================================

/**
 * A single quiz question
 * @typedef {Object} Question
 * @property {string} question - The question text
 * @property {string[]} options - Array of 4 answer options (A, B, C, D)
 * @property {number} correctIndex - Index of correct answer (0-3)
 * @property {string} [explanation] - Optional explanation of the answer
 * @property {string} [difficulty] - Optional difficulty level
 */

/**
 * Quiz generation result from API
 * @typedef {Object} QuizResult
 * @property {string} language - Language code (e.g., 'EN-US', 'PT-PT')
 * @property {Question[]} questions - Array of generated questions
 */

/**
 * A saved quiz session
 * @typedef {Object} QuizSession
 * @property {number} [id] - Unique session ID (auto-generated by IndexedDB)
 * @property {string} topic - Quiz topic
 * @property {string} gradeLevel - Education level
 * @property {Question[]} questions - Array of questions
 * @property {number[]} userAnswers - User's selected answers (indices)
 * @property {number} score - Number of correct answers
 * @property {number} totalQuestions - Total number of questions
 * @property {string} timestamp - ISO timestamp of when quiz was taken
 * @property {string} [language] - Language code used for generation
 */

// ============================================
// Settings Types
// ============================================

/**
 * Application settings
 * @typedef {Object} AppSettings
 * @property {string} gradeLevel - Default education level
 * @property {string} questionsPerQuiz - Number of questions ('5', '10', '15')
 * @property {string} language - UI language code
 * @property {boolean} soundEnabled - Whether sounds are enabled
 * @property {boolean} hapticEnabled - Whether haptic feedback is enabled
 */

// ============================================
// Auth Types
// ============================================

/**
 * OpenRouter authentication state
 * @typedef {Object} AuthState
 * @property {boolean} isConnected - Whether user is authenticated
 * @property {string|null} apiKey - OpenRouter API key (or null)
 * @property {string|null} userCode - User's OpenRouter code
 */

/**
 * OAuth callback parameters
 * @typedef {Object} OAuthCallback
 * @property {string} code - Authorization code from OAuth flow
 * @property {string} [error] - Error code if OAuth failed
 * @property {string} [error_description] - Human-readable error message
 */

// ============================================
// API Types
// ============================================

/**
 * Options for quiz generation
 * @typedef {Object} GenerateOptions
 * @property {string} [language='en'] - Language code for generation
 * @property {number} [questionCount=5] - Number of questions to generate
 * @property {Question[]} [previousQuestions=[]] - Questions to avoid duplicating
 */

/**
 * Options for explanation generation
 * @typedef {Object} ExplanationOptions
 * @property {string} [language='en'] - Language code for explanation
 */

// ============================================
// Telemetry Types
// ============================================

/**
 * Telemetry event
 * @typedef {Object} TelemetryEvent
 * @property {string} event - Event name
 * @property {Object} [data] - Event-specific data
 * @property {string} timestamp - ISO timestamp
 * @property {string} sessionId - Browser session ID
 */

// ============================================
// Router Types
// ============================================

/**
 * Route definition
 * @typedef {Object} Route
 * @property {string} path - URL path pattern
 * @property {Function} handler - View handler function
 * @property {string} [title] - Page title
 */

/**
 * Navigation options
 * @typedef {Object} NavigateOptions
 * @property {boolean} [replace=false] - Replace current history entry
 * @property {Object} [state] - State to pass to the route
 */

export {};
```

---

### 48.5 - Add NPM Scripts

**File:** `package.json`

**Add scripts:**
```json
{
  "scripts": {
    "docs": "jsdoc -c jsdoc.config.json",
    "docs:open": "jsdoc -c jsdoc.config.json && start docs/api/index.html",
    "typecheck": "tsc -p jsconfig.json --noEmit"
  }
}
```

**Scripts explained:**
- `npm run docs` - Generate HTML documentation to `docs/api/`
- `npm run docs:open` - Generate and open in browser (Windows)
- `npm run typecheck` - Check types using TypeScript CLI

---

### 48.6 - Update .gitignore

**File:** `.gitignore`

**Add:**
```
# Generated documentation
docs/api/
```

Documentation is generated on demand, not committed.

---

### 48.7 - Update CI Workflow

**File:** `.github/workflows/test.yml`

**Add step (warning mode):**
```yaml
- name: Type check (warning)
  run: npm run typecheck || true
```

**Position:** After "Check architecture rules" step.

---

### 48.8 - Improve Key File JSDoc Coverage

**Priority files to enhance (based on complexity/usage):**

1. **`src/core/db.js`** - Add types for database operations
2. **`src/core/state.js`** - Type the global state object
3. **`src/api/openrouter-client.js`** - API request/response types
4. **`src/views/QuizView.js`** - Quiz state and rendering

**Example enhancement for db.js:**

```javascript
/**
 * Save a quiz session to the database
 * @param {QuizSession} session - The session to save
 * @returns {Promise<number>} The ID of the saved session
 */
export async function saveSession(session) {
  // ...
}
```

---

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `jsdoc.config.json` | Create | JSDoc documentation config |
| `jsconfig.json` | Create | Enable JS type checking |
| `src/types.js` | Create | Shared type definitions |
| `package.json` | Modify | Add docs and typecheck scripts |
| `.gitignore` | Modify | Ignore generated docs |
| `.github/workflows/test.yml` | Modify | Add type check step |
| `src/core/db.js` | Modify | Improve JSDoc coverage |
| `src/core/state.js` | Modify | Improve JSDoc coverage |
| `src/api/openrouter-client.js` | Modify | Improve JSDoc coverage |

---

## Testing Plan

### Verification Steps

1. **Documentation Generation:**
   - [ ] `npm run docs` generates HTML to `docs/api/`
   - [ ] Open `docs/api/index.html` in browser
   - [ ] Navigate module list, click on functions
   - [ ] Type definitions appear correctly

2. **VS Code Integration:**
   - [ ] Open a `.js` file in VS Code
   - [ ] Hover over a function - see type info
   - [ ] Intentionally add type error - see red squiggle
   - [ ] Autocomplete works for typed objects

3. **CLI Type Check:**
   - [ ] `npm run typecheck` runs without fatal errors
   - [ ] Type errors are reported (if any exist)
   - [ ] Exit code is 0 when no errors

4. **CI Integration:**
   - [ ] GitHub Actions runs typecheck step
   - [ ] Failures don't block the build (warning mode)
   - [ ] Type errors visible in CI logs

---

## Commits Plan

1. `chore: add jsdoc and typescript dev dependencies`
   - Install jsdoc and typescript

2. `chore: add jsdoc.config.json for documentation generation`
   - Create jsdoc.config.json

3. `chore: add jsconfig.json for JS type checking`
   - Create jsconfig.json

4. `feat: add type definitions for core data structures`
   - Create src/types.js with @typedef declarations

5. `chore: add docs and typecheck npm scripts`
   - Add scripts to package.json
   - Update .gitignore

6. `ci: add type checking step to GitHub Actions`
   - Update test.yml with typecheck step

7. `docs: improve JSDoc coverage in core modules`
   - Enhance db.js, state.js, openrouter-client.js
   - Reference types from types.js

---

## Success Criteria

- [ ] `npm run docs` generates HTML documentation
- [ ] Documentation is browsable and shows all public APIs
- [ ] `jsconfig.json` created and VS Code recognizes it
- [ ] `src/types.js` defines core types (Question, QuizSession, etc.)
- [ ] `npm run typecheck` runs successfully
- [ ] VS Code shows type info on hover
- [ ] VS Code autocompletes typed properties
- [ ] CI runs typecheck in warning mode
- [ ] No increase in false positives during development

---

## Out of Scope

- TypeScript migration (this is JSDoc-only)
- Strict mode enforcement (start permissive)
- 100% type coverage (focus on public APIs and complex types)
- Type checking test files (excluded in jsconfig.json)
- Third-party library type definitions (@types/*)
- Hosting documentation (local generation only)

---

## Future Enhancements (Optional)

After Phase 48 is complete, consider:

1. **Phase 48.1: Strict Mode Migration**
   - Enable `strict: true` in jsconfig.json
   - Fix resulting type errors one file at a time

2. **Phase 48.2: Library Types**
   - Add `@types/node` for Node.js scripts
   - Consider types for i18next, etc.

3. **Phase 48.3: Promote to Error**
   - Change CI from warning to blocking
   - After 2-4 weeks of stable operation

4. **Phase 48.4: Host Documentation**
   - Deploy docs to GitHub Pages or separate URL
   - Auto-generate on push to main

---

## Related Files

- Configuration: `jsdoc.config.json`, `jsconfig.json`, `package.json`
- Types: `src/types.js`
- Core modules: `db.js`, `state.js`, `settings.js`
- Services: `quiz-service.js`, `auth-service.js`
- API: `api.real.js`, `api.mock.js`, `openrouter-client.js`

---

## References

- [JSDoc Reference](https://jsdoc.app/)
- [JSDoc Getting Started](https://jsdoc.app/about-getting-started.html)
- [TypeScript JSDoc Support](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [VS Code JavaScript Type Checking](https://code.visualstudio.com/docs/nodejs/working-with-javascript#_type-checking-javascript)
- [jsconfig.json Reference](https://code.visualstudio.com/docs/languages/jsconfig)
