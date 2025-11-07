# Phase 4: ES6 Modules and Code Organization

**Goal**: Learn ES6 module patterns and organize code into a clean, maintainable architecture.

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Understand ES6 module syntax (import/export)
- ✅ Know when to use named vs default exports
- ✅ Organize code into logical modules
- ✅ Understand module scope and encapsulation
- ✅ Use module patterns for maintainable code
- ✅ Handle circular dependencies

---

## 4.1 Why Modules Matter

### The Problem Without Modules

**Before ES6 modules, JavaScript had:**
```html
<!-- index.html -->
<script src="utils.js"></script>
<script src="api.js"></script>
<script src="db.js"></script>
<script src="app.js"></script>
```

**Problems:**
- ❌ Global namespace pollution
- ❌ Order matters (api.js needs utils.js first)
- ❌ No explicit dependencies
- ❌ Name conflicts
- ❌ Hard to maintain

### With ES6 Modules

```html
<!-- index.html -->
<script type="module" src="app.js"></script>
```

```javascript
// app.js
import { generateQuestions } from './api.js';
import { saveSession } from './db.js';
```

**Benefits:**
- ✅ Explicit dependencies
- ✅ No global namespace pollution
- ✅ Order doesn't matter (modules load dependencies)
- ✅ Tree shaking (unused code removed in build)
- ✅ Easy to test individual modules

---

## 4.2 Export Syntax

### Named Exports (Multiple per file)

```javascript
// utils.js

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString();
}

export function calculatePercentage(correct, total) {
  return Math.round((correct / total) * 100);
}

export const MAX_QUESTIONS = 5;
```

**When to use:**
- Multiple functions/values per file
- Utility modules
- Clear, descriptive names

### Default Export (One per file)

```javascript
// QuizSession.js

export default class QuizSession {
  constructor(topic, questions) {
    this.topic = topic;
    this.questions = questions;
  }

  getScore() {
    // ...
  }
}
```

**When to use:**
- Single class per file
- Main function of a module
- Component-style modules

### Mixed Exports

```javascript
// api.js

// Named exports
export async function generateQuestions(topic) {
  // ...
}

export async function generateExplanation(question, userAnswer) {
  // ...
}

// Default export
export default {
  generateQuestions,
  generateExplanation
};
```

**Generally avoid mixing** - pick one pattern per module for consistency.

---

## 4.3 Import Syntax

### Named Imports

```javascript
// Import specific functions
import { formatDate, calculatePercentage } from './utils.js';

// Use them
const date = formatDate(Date.now());
const score = calculatePercentage(4, 5);
```

### Import All (Namespace)

```javascript
// Import everything from a module
import * as utils from './utils.js';

// Use with namespace
const date = utils.formatDate(Date.now());
const score = utils.calculatePercentage(4, 5);
```

### Import Default

```javascript
// Import default export
import QuizSession from './QuizSession.js';

// Use it
const session = new QuizSession('Fractions', questions);
```

### Rename Imports

```javascript
// Avoid name conflicts
import { generateQuestions as generateMockQuestions } from './api.mock.js';
import { generateQuestions as generateRealQuestions } from './api.js';
```

---

## 4.4 Module Organization Patterns

### By Feature (Recommended)

```
src/
├── api/
│   ├── api.js          // Real API
│   ├── api.mock.js     // Mock API
│   └── prompts.js      // Prompt templates
├── db/
│   ├── db.js           // Database wrapper
│   └── models.js       // Data models
├── router/
│   ├── router.js       // Routing logic
│   └── routes.js       // Route definitions
├── views/
│   ├── HomeView.js
│   ├── QuizView.js
│   └── ResultsView.js
├── utils/
│   ├── format.js       // Formatting utilities
│   └── validation.js   // Validation helpers
└── app.js              // Main entry point
```

**Pros:**
- Clear feature boundaries
- Easy to find related code
- Scales well

### By Type (Alternative)

```
src/
├── components/         // UI components
├── services/          // Business logic
├── models/            // Data models
├── utils/             // Utilities
└── app.js
```

---

## 4.5 QuizMaster Module Structure

### Current Structure (After Phase 3)

```
src/
├── api.js              // Real API (CORS blocked)
├── api.mock.js         // Mock API
├── prompts.js          // Prompt templates
├── db.js               // Database wrapper
├── app.js              // Original PWA app
├── app.test.js         // Tests
├── db.test.js          // Tests
```

### Target Structure (After Phase 6)

```
src/
├── api/
│   ├── api.js
│   ├── api.mock.js
│   └── prompts.js
├── db/
│   └── db.js
├── router/
│   └── router.js
├── views/
│   ├── HomeView.js
│   ├── QuizView.js
│   ├── ResultsView.js
│   ├── HistoryView.js
│   └── SettingsView.js
├── utils/
│   └── helpers.js
├── state.js            // Global state management
├── main.js             // New entry point
└── tests/
    ├── api.test.js
    └── db.test.js
```

---

## 4.6 Module Best Practices

### 1. One Responsibility Per Module

```javascript
// ✅ GOOD: Single responsibility
// utils/format.js
export function formatDate(timestamp) { /* ... */ }
export function formatScore(correct, total) { /* ... */ }

// ❌ BAD: Mixed responsibilities
// helpers.js
export function formatDate(timestamp) { /* ... */ }
export function saveToDatabase(data) { /* ... */ }
export function callAPI(endpoint) { /* ... */ }
```

### 2. Avoid Circular Dependencies

```javascript
// ❌ BAD: Circular dependency
// a.js
import { funcB } from './b.js';
export function funcA() { funcB(); }

// b.js
import { funcA } from './a.js';  // Circular!
export function funcB() { funcA(); }

// ✅ GOOD: Extract shared code
// shared.js
export function sharedFunc() { /* ... */ }

// a.js
import { sharedFunc } from './shared.js';
export function funcA() { sharedFunc(); }

// b.js
import { sharedFunc } from './shared.js';
export function funcB() { sharedFunc(); }
```

### 3. Keep Modules Focused

**Good module size:**
- 50-200 lines of code
- 5-10 exported functions/values
- Single clear purpose

**Signs a module is too large:**
- 500+ lines
- 20+ exports
- Multiple unrelated functions

### 4. Use Index Files for Convenience

```javascript
// api/index.js
export * from './api.mock.js';    // Re-export everything
export { default } from './api.mock.js';

// Now you can import from folder
import { generateQuestions } from './api/index.js';
// Or even simpler (index.js is default)
import { generateQuestions } from './api';
```

---

## 4.7 Module Scope and Encapsulation

### Module-Level Privacy

```javascript
// api.js

// Private (not exported)
const API_BASE_URL = 'https://api.anthropic.com/v1';

function validateApiKey(key) {
  return key && key.startsWith('sk-ant-');
}

// Public (exported)
export async function generateQuestions(topic) {
  const key = await getApiKey();

  // validateApiKey is accessible here
  if (!validateApiKey(key)) {
    throw new Error('Invalid API key');
  }

  // ...
}
```

**Benefits:**
- Hide implementation details
- Control public API
- Prevent misuse

---

## 4.8 Dynamic Imports (Advanced)

### Load Modules On-Demand

```javascript
// Load mock or real API based on environment
let api;

if (process.env.NODE_ENV === 'development') {
  api = await import('./api.mock.js');
} else {
  api = await import('./api.js');
}

const questions = await api.generateQuestions('Math');
```

### Code Splitting

```javascript
// Load view only when needed
async function navigateToQuiz() {
  const { QuizView } = await import('./views/QuizView.js');
  const view = new QuizView();
  view.render();
}
```

**Benefits:**
- Smaller initial bundle
- Faster page load
- Load features on demand

---

## 4.9 Testing Modules

### Why Modules Make Testing Easier

```javascript
// utils/format.test.js
import { formatDate, formatScore } from './format.js';

test('formatDate returns correct format', () => {
  const result = formatDate(1699000000000);
  expect(result).toBe('11/3/2023');
});

test('formatScore calculates percentage', () => {
  const result = formatScore(4, 5);
  expect(result).toBe('80%');
});
```

**Benefits:**
- Test in isolation
- Mock dependencies easily
- Fast test execution

---

## 4.10 JSDoc for Type Safety (Optional)

### Why Use JSDoc?

Without TypeScript, you can still get type checking and autocomplete using JSDoc comments:

**Benefits:**
- ✅ Autocomplete in VS Code
- ✅ Type checking without TypeScript
- ✅ Better documentation
- ✅ Catch errors before runtime

### Type Definitions

```javascript
// src/types.js

/**
 * @typedef {Object} QuizQuestion
 * @property {number} id - Question ID
 * @property {string} question - Question text
 * @property {string[]} options - Array of answer options
 * @property {number} correctIndex - Index of correct answer (0-3)
 */

/**
 * @typedef {Object} QuizSession
 * @property {number} id - Session ID (auto-generated)
 * @property {string} topicId - Associated topic ID
 * @property {number} timestamp - Session creation timestamp
 * @property {number} score - Quiz score (0-100)
 * @property {QuizQuestion[]} questions - Array of quiz questions
 */

/**
 * @typedef {Object} UserAnswer
 * @property {number} questionId - Question ID
 * @property {number} selectedIndex - User's selected answer index
 * @property {boolean} isCorrect - Whether answer was correct
 */
```

### Function Documentation

```javascript
// src/db/db.js

import { openDB } from 'idb';

/**
 * Initialize the QuizMaster database
 * @returns {Promise<IDBDatabase>} The opened database instance
 * @throws {Error} If database initialization fails
 */
export async function initDatabase() {
  return openDB('quizmaster-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', {
          keyPath: 'id',
          autoIncrement: true
        });
        sessionStore.createIndex('byTimestamp', 'timestamp');
      }
    }
  });
}

/**
 * Save a quiz session to IndexedDB
 * @param {QuizSession} session - The session to save
 * @returns {Promise<number>} The ID of the saved session
 * @throws {Error} If save operation fails
 */
export async function saveSession(session) {
  const db = await getDB();
  return db.add('sessions', session);
}

/**
 * Get all quiz sessions, sorted by most recent
 * @param {number} [limit] - Optional limit on number of sessions to return
 * @returns {Promise<QuizSession[]>} Array of quiz sessions
 */
export async function getAllSessions(limit) {
  const db = await getDB();
  const sessions = await db.getAll('sessions');
  sessions.sort((a, b) => b.timestamp - a.timestamp);
  return limit ? sessions.slice(0, limit) : sessions;
}
```

### Class Documentation

```javascript
// src/views/BaseView.js

/**
 * Base class for all views in the application
 * Provides common functionality for rendering and cleanup
 */
export default class BaseView {
  /**
   * Create a new view
   */
  constructor() {
    /** @type {HTMLElement} */
    this.appContainer = document.getElementById('app');

    /** @type {Array<{element: HTMLElement, event: string, handler: Function}>} */
    this.listeners = [];
  }

  /**
   * Render the view (must be implemented by subclass)
   * @abstract
   * @throws {Error} If not implemented by subclass
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }

  /**
   * Clean up view resources to prevent memory leaks
   */
  destroy() {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
    this.appContainer.innerHTML = '';
  }

  /**
   * Add event listener with automatic cleanup tracking
   * @param {HTMLElement} element - The element to attach listener to
   * @param {string} event - The event name (e.g., 'click', 'submit')
   * @param {Function} handler - The event handler function
   */
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }
}
```

### Using Type Definitions in Your Code

```javascript
// src/api/api.mock.js

/**
 * Generate mock quiz questions
 * @param {string} topic - The topic to generate questions about
 * @param {string} [gradeLevel='middle school'] - Target grade level
 * @returns {Promise<QuizQuestion[]>} Array of 5 quiz questions
 */
export async function generateQuestions(topic, gradeLevel = 'middle school') {
  await delay(1500); // Simulate API delay

  /** @type {QuizQuestion[]} */
  const questions = [
    {
      id: 1,
      question: `What is the main concept of ${topic}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 2
    },
    // ... more questions
  ];

  return questions;
}
```

### Enabling Type Checking in VS Code

Create `jsconfig.json` in your project root:

```json
{
  "compilerOptions": {
    "checkJs": true,
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**What this enables:**
- Type checking in JavaScript files
- IntelliSense autocomplete
- Error highlighting for type mismatches
- Go-to-definition support

### Example: Catching Type Errors

```javascript
/**
 * @param {QuizSession} session
 */
function displaySession(session) {
  console.log(session.score);
}

// ✅ VS Code autocomplete suggests: id, topicId, timestamp, score, questions
displaySession({ score: 85, questions: [] });

// ❌ VS Code shows error: Argument of type 'string' is not assignable to 'QuizSession'
displaySession("not a session");
```

### When to Use JSDoc

**Use JSDoc when:**
- ✅ You want type safety without TypeScript complexity
- ✅ Working on a team (helps others understand your code)
- ✅ Building a library or reusable modules
- ✅ Complex data structures (like QuizSession, QuizQuestion)

**Skip JSDoc when:**
- ❌ Simple utility functions with obvious types
- ❌ Prototyping/learning phase
- ❌ Very small projects

---

## Checkpoint Questions

**Q1**: What's the difference between named and default exports?

<details>
<summary>Answer</summary>

- **Named exports**: Multiple per file, import with exact name in braces
- **Default export**: One per file, import with any name without braces

Use named for utility modules with multiple functions. Use default for single-purpose modules (classes, main function).
</details>

**Q2**: Why is `type="module"` needed in the script tag?

<details>
<summary>Answer</summary>

It tells the browser to:
- Parse as ES6 module (import/export supported)
- Defer script execution (like defer attribute)
- Create module scope (not global)
- Enable strict mode automatically
</details>

**Q3**: Can you import a module multiple times?

<details>
<summary>Answer</summary>

Yes, but the module only executes once. The browser caches the result, so subsequent imports get the same instance. This is efficient and prevents duplicate execution.
</details>

**Q4**: What happens if you forget the `.js` extension in an import?

<details>
<summary>Answer</summary>

In browsers, you **must include** the `.js` extension. In Node.js and bundlers (Vite, Webpack), it's optional. Since we're building for browsers, always include it:

```javascript
import { func } from './module.js';  // ✅ Correct
import { func } from './module';     // ❌ Error in browser
```
</details>

---

## Hands-On Exercise

### Refactor Current Code

**Task**: Reorganize your current modules following best practices.

**Steps**:

1. **Create folder structure**:
```bash
mkdir src/api
mkdir src/db
```

2. **Move API files**:
```bash
git mv src/api.js src/api/api.js
git mv src/api.mock.js src/api/api.mock.js
git mv src/prompts.js src/api/prompts.js
```

3. **Move database files**:
```bash
git mv src/db.js src/db/db.js
```

4. **Update imports** in `api/api.js`:
```javascript
// Change from:
import { getSetting } from './db.js';
import { createQuestionPrompt, createExplanationPrompt } from './prompts.js';

// To:
import { getSetting } from '../db/db.js';
import { createQuestionPrompt, createExplanationPrompt } from './prompts.js';
```

5. **Test everything still works**:
```bash
npm run build
npm test
```

**Success Criteria**:
- ✅ Organized into feature folders
- ✅ All imports updated correctly
- ✅ Build succeeds
- ✅ Tests pass

---

## Next Steps

Once you've organized your modules:

**"I'm ready for Phase 5"** → We'll build the Single Page Application with routing

**Need help?** → Ask Claude about any module concept

---

## Learning Notes

**Date Started**: ___________

**Key Concepts Understood**:
- [ ] Named vs default exports
- [ ] Import syntax variations
- [ ] Module scope and privacy
- [ ] File organization patterns

**Code Refactored**:
- [ ] Created folder structure
- [ ] Moved files to folders
- [ ] Updated all imports
- [ ] Verified build and tests

**Questions/Challenges**:
-
-

**Date Completed**: ___________
