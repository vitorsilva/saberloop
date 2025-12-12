# Phase 5: Building the Single Page Application - Learning Notes

**Date Started**: 2025-11-07
**Date Completed**: 2025-11-07
**Status**: ✅ Complete

---

## What I Learned

### 1. Single Page Application (SPA) Architecture

**Traditional Multi-Page App:**
- Every link click = server request
- Browser reloads entire page
- Slow, screen flickers
- Doesn't work offline

**Single Page Application:**
- JavaScript handles navigation
- No page reloads
- Instant view switching
- Works offline (can show cached/local content)

**Key insight:** SPAs can work offline because JavaScript intercepts clicks and loads local content instead of requesting from server.

---

### 2. Hash-based Routing

**How it works:**
```
URL: http://localhost:3000/#/test
                                          ↑
                                       Hash part
```

**Key properties of hash (`#`):**
- Changing hash doesn't reload page
- Accessible via `window.location.hash`
- Browser fires `hashchange` event when changed
- Back/forward buttons work automatically
- Returns string like `'#/test'`

**Tested in browser console:**
```javascript
window.location.hash = '#/test';  // Changed URL without reload!
window.addEventListener('hashchange', () => {
  console.log('Hash changed to:', window.location.hash);
});
```

---

### 3. Router Implementation

Created `src/router/router.js` with:

**Key methods:**
- `addRoute(path, ViewClass)` - Register routes
- `navigateTo(path)` - Navigate programmatically
- `handleRoute()` - Respond to hash changes
- `render(ViewClass)` - Display a view
- `init()` - Start listening for hash changes

**How it works:**
1. Listen for `hashchange` event
2. Extract hash from URL (`window.location.hash`)
3. Look up ViewClass in routes Map
4. Destroy old view (cleanup)
5. Create new view instance
6. Render new view

**Example usage:**
```javascript
import router from './router/router.js';
import HomeView from './views/HomeView.js';

router.addRoute('/home', HomeView);
router.init();
```

---

### 4. Map Data Structure

**Basic operations learned:**
```javascript
const map = new Map();

map.set('key', 'value');     // Add
map.get('key');               // Get → 'value'
map.has('key');               // Check → true
map.delete('key');            // Remove
map.size;                     // Count
map.clear();                  // Remove all
```

**Why Map instead of Object for routes:**
- ✅ Keys can be any type (not just strings)
- ✅ Has `.has()` method (cleaner checks)
- ✅ Has `.size` property
- ✅ Better performance for frequent add/delete
- ✅ Guaranteed insertion order

---

### 5. Singleton Pattern (JavaScript Style)

**In other languages (like C#):**
Need to manually implement singleton with private constructor and instance checks.

**In JavaScript with ES6 modules:**
Singleton is automatic!

```javascript
class Router { }
export default new Router();  // Created once, cached forever
```

**How it works:**
1. First import executes module → creates instance
2. Module system caches the result
3. All subsequent imports get same cached instance

**Benefits:**
- One router for entire app
- One state manager for entire app
- All files share the same instance

---

### 6. State Management

Created `src/state/state.js` for sharing data between views.

**Problem it solves:**
```
User enters topic on HomeView
  → navigates to QuizView
  → QuizView needs to know the topic!
```

**Solution:** Centralized state all views can access.

**Key methods:**
- `get(key)` - Get state value
- `set(key, value)` - Set state value
- `update(updates)` - Set multiple values at once
- `subscribe(callback)` - Listen for changes
- `clear()` - Reset all state

**Object.assign() vs Spread Operator:**

Both do the same thing:
```javascript
// Object.assign - mutates original
Object.assign(this.data, updates);

// Spread - creates new object
this.data = { ...this.data, ...updates };
```

**Difference:**
- `Object.assign` modifies existing object in place
- Spread creates new object and reassigns
- Both are valid, chose Object.assign for this project

---

### 7. BaseView Class

Created `src/views/BaseView.js` - base class all views inherit from.

**Provides common functionality:**
- `render()` - Must be implemented by subclass (throws error if not)
- `destroy()` - Cleanup to prevent memory leaks
- `setHTML(html)` - Set view content
- `querySelector(selector)` - Find elements
- `addEventListener(element, event, handler)` - Track listeners
- `navigateTo(path)` - Navigate to route

**Memory leak prevention pattern:**
- Tracks all event listeners in `this.listeners` array
- Router calls `destroy()` when switching views
- `destroy()` removes all listeners and clears DOM
- Prevents accumulation of listeners over time

---

### 8. Class Inheritance (Brief)

**Pattern used:**
```javascript
// Base class
export default class BaseView {
  constructor() { }
  render() { throw new Error('Implement in subclass'); }
}

// Subclass extends base
import BaseView from './BaseView.js';

export default class TestView extends BaseView {
  render() {
    this.setHTML('<h1>Test</h1>');  // Implements required method
  }
  // Inherits: setHTML, querySelector, addEventListener, etc.
}
```

**Benefits:**
- Don't repeat common code in every view
- Consistent interface across all views
- Easy to add new views

---

## Files Created

### New Files:
- `src/router/router.js` - Router with hash-based navigation
- `src/state/state.js` - Centralized state management
- `src/views/BaseView.js` - Base class for all views
- `src/views/TestView.js` - Test view to verify setup

### Modified Files:
- `src/main.js` - Initialize router, register routes
- `index.html` - Added `<div id="app"></div>` container

---

## Project Structure (After Phase 5)

```
saberloop/
├── src/
│   ├── api/
│   │   ├── api.js
│   │   ├── api.mock.js
│   │   ├── index.js
│   │   └── prompts.js
│   ├── db/
│   │   ├── db.js
│   │   └── db.test.js
│   ├── router/
│   │   └── router.js         ✅ NEW
│   ├── state/
│   │   └── state.js          ✅ NEW
│   ├── views/
│   │   ├── BaseView.js       ✅ NEW
│   │   └── TestView.js       ✅ NEW
│   ├── main.js               ✅ UPDATED
│   ├── app.js
│   └── app.test.js
├── index.html                ✅ UPDATED
├── package.json
└── vite.config.js
```

---

## Testing Results

**All tests passing:**
```
✓ src/app.test.js (2 tests)
✓ src/db/db.test.js (16 tests)

Test Files  2 passed (2)
Tests  18 passed (18)
```

**Coverage:**
```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|----------
All files |   57.33 |       44 |   68.42 |    58.1
src/db    |   97.22 |    55.55 |     100 |   97.22  ← Excellent!
```

**Browser test:**
- ✅ TestView renders at `#/` and `#/test`
- ✅ Changing hash updates view without reload
- ✅ Console shows router initialization
- ✅ No errors

---

## Key Debugging Moment

**Error encountered:**
```
Cannot set properties of null (setting 'innerHTML')
```

**Root cause:**
`document.getElementById('app')` returned `null` because `index.html` didn't have `<div id="app"></div>`.

**Solution:**
Added `<div id="app"></div>` to `index.html`.

**Lesson learned:**
Good debugging practice - read error message, trace stack, identify root cause (missing DOM element).

---

## Challenges Encountered

### 1. Teaching Approach Issue

**Problem:**
Instructor gave complete code solutions without explaining concepts first, then asked questions about things not yet taught (like inheritance).

**Feedback given:**
- Explain concepts BEFORE providing code
- Build code together step-by-step
- Don't ask questions about unfamiliar concepts
- Let student discover through doing, not just typing

**Agreed improvement for next phases:**
More interactive, exploratory approach with smaller incremental steps.

---

## Concepts That Need More Depth (For Later)

- Class inheritance (extends, super)
- Why `render()` throws error in BaseView
- How `this` works in classes
- Event delegation patterns
- When to use classes vs functions

*Note: These will be explored more in Phase 6 when building actual views.*

---

## What's Next

**Phase 6: Implementing Core Features**

Will build actual QuizMaster views:
1. **HomeView** - Topic input, grade level selection
2. **QuizView** - Display questions, handle answers
3. **ResultsView** - Show score, explanations
4. **HistoryView** - Past quiz sessions
5. **SettingsView** - Preferences

**Why Phase 5 was important:**
Phase 6 will create 5+ views that all need routing, state, and common functionality. The SPA infrastructure we built today makes that possible!

---

## Time Spent

**Estimated**: 3-4 sessions
**Actual**: 1.5 sessions (~75 minutes)

**Breakdown:**
- Understanding SPA concepts: 10 min
- Testing hash routing in console: 5 min
- Creating Router: 15 min
- Creating State Manager: 10 min
- Creating BaseView: 10 min
- Creating TestView: 5 min
- Debugging `#app` issue: 5 min
- Testing and verification: 10 min
- Deployment check: 5 min

---

## Personal Notes

- Hash-based routing is simpler than I expected
- The singleton pattern in JavaScript is elegant (just export instance)
- Map is more powerful than regular objects
- Good debugging caught the missing `#app` div quickly
- SPA architecture makes sense now - router + state + views
- Looking forward to building real views in Phase 6!

---

## Feedback on Learning Process

**What worked well:**
- Hands-on browser console testing (hash changes)
- Catching bugs early (missing `#app` div)
- Running tests to verify nothing broke
- Building to production to ensure it works

**What to improve for next phase:**
- More gradual code building (not complete files at once)
- Explain concepts before asking questions
- More discovery-based learning
- Let me figure out some things before providing solutions

---

**Ready for Phase 6**: ✅ Yes
**Confidence Level**: Good - understand SPA basics, router pattern, state management

**Next session**: Start building real QuizMaster views (HomeView first)
