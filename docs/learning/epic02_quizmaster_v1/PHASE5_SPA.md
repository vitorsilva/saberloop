# Phase 5: Building the Single Page Application

**Goal**: Create a multi-screen app without page reloads using client-side routing and state management.

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Understand what a Single Page Application (SPA) is
- ✅ Implement hash-based client-side routing
- ✅ Build a simple router from scratch
- ✅ Manage application state
- ✅ Handle navigation and browser history
- ✅ Render views dynamically
- ✅ Understand SPA vs Multi-Page App tradeoffs

---

## 5.1 What is a Single Page Application?

### Traditional Multi-Page App

```
User clicks link → Browser requests new HTML → Server sends new page → Full page reload
```

**Flow:**
1. Click "About" → Request `/about.html`
2. Browser loads entire new page
3. JavaScript/CSS reload
4. Lose application state

### Single Page Application

```
User clicks link → JavaScript intercepts → Update URL → Render new view (no reload)
```

**Flow:**
1. Click "About" → Router catches event
2. Change URL to `#/about`
3. JavaScript renders About view
4. No page reload, state preserved

### SPA Benefits

**Pros:**
- ✅ Fast navigation (no page reloads)
- ✅ Smooth transitions
- ✅ State persists across views
- ✅ Feels like a native app
- ✅ Better UX

**Cons:**
- ❌ Initial load can be slower (more JavaScript)
- ❌ SEO challenges (though solvable)
- ❌ More complex than multi-page
- ❌ Browser back button needs handling

---

## 5.2 Routing Strategies

### Hash-Based Routing (We'll use this)

```
https://example.com/#/home
https://example.com/#/quiz
https://example.com/#/results
```

**How it works:**
- Everything after `#` is the "route"
- Changing hash doesn't reload page
- Accessible via `window.location.hash`
- Triggers `hashchange` event

**Pros:**
- ✅ Simple to implement
- ✅ Works without server configuration
- ✅ Compatible with GitHub Pages
- ✅ Browser back button works automatically

**Cons:**
- ❌ `#` in URL (looks less clean)
- ❌ Not SEO-friendly (but OK for our app)

### History API Routing (Alternative)

```
https://example.com/home
https://example.com/quiz
https://example.com/results
```

**How it works:**
- Uses `pushState()` and `popstate` events
- Cleaner URLs (no `#`)
- Requires server configuration

**For QuizMaster**: We'll use hash routing because it's simpler and works with static hosting.

---

## 5.3 Building a Simple Router

### Router Concept

```javascript
// router.js

class Router {
  constructor() {
    this.routes = {};          // Store route → view mappings
    this.currentView = null;   // Currently rendered view
  }

  // Register a route
  addRoute(path, viewClass) {
    this.routes[path] = viewClass;
  }

  // Navigate to a route
  navigateTo(path) {
    window.location.hash = path;
  }

  // Handle route changes
  handleRoute() {
    const path = window.location.hash.slice(1) || '/';  // Remove #
    const ViewClass = this.routes[path];

    if (ViewClass) {
      this.render(ViewClass);
    } else {
      this.render(this.routes['/']);  // Default to home
    }
  }

  // Render the view
  render(ViewClass) {
    // Clean up previous view
    if (this.currentView && this.currentView.destroy) {
      this.currentView.destroy();
    }

    // Create and render new view
    this.currentView = new ViewClass();
    this.currentView.render();
  }

  // Initialize router
  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute());

    // Handle initial page load
    this.handleRoute();
  }
}

export default new Router();  // Singleton
```

### Using the Router

```javascript
// main.js (new entry point)

import router from './router/router.js';
import HomeView from './views/HomeView.js';
import QuizView from './views/QuizView.js';
import ResultsView from './views/ResultsView.js';

// Register routes
router.addRoute('/', HomeView);
router.addRoute('/quiz', QuizView);
router.addRoute('/results', ResultsView);
router.addRoute('/history', HistoryView);
router.addRoute('/settings', SettingsView);

// Initialize
router.init();
```

---

## 5.4 View Pattern

### Base View Class

```javascript
// views/BaseView.js

export default class BaseView {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.listeners = []; // Track event listeners for cleanup
  }

  // Override in subclasses
  render() {
    throw new Error('render() must be implemented by subclass');
  }

  // Cleanup method - prevents memory leaks
  destroy() {
    // Remove all tracked event listeners
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];

    // Clear DOM content
    this.appContainer.innerHTML = '';
  }

  // Helper to set HTML
  setHTML(html) {
    this.appContainer.innerHTML = html;
  }

  // Helper to find elements
  querySelector(selector) {
    return this.appContainer.querySelector(selector);
  }

  // Helper to add event listener with automatic tracking
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }

  // Helper to navigate
  navigateTo(path) {
    window.location.hash = path;
  }
}
```

### Example View

```javascript
// views/HomeView.js

import BaseView from './BaseView.js';

export default class HomeView extends BaseView {
  render() {
    this.setHTML(`
      <div class="home-view">
        <h1>Welcome to QuizMaster</h1>
        <p>Test your knowledge on any topic!</p>
        <button id="startBtn">Start a Quiz</button>
      </div>
    `);

    // Attach event listeners
    this.attachListeners();
  }

  attachListeners() {
    const startBtn = this.querySelector('#startBtn');

    // Use BaseView's addEventListener for automatic cleanup tracking
    this.addEventListener(startBtn, 'click', () => {
      this.navigateTo('/quiz');
    });
  }

  // destroy() is inherited from BaseView - no need to override
}
```

### Understanding Memory Leaks in SPAs

**The Problem:**
Single Page Applications don't reload pages, so event listeners can accumulate:

```javascript
// ❌ Without cleanup
User visits Home → 1 listener attached
User visits Quiz → 2 listeners (Quiz + old Home still in memory!)
User visits Results → 3 listeners
... memory keeps growing
```

**The Solution:**
BaseView's cleanup pattern prevents memory leaks:

```javascript
// ✅ With cleanup
class Router {
  handleRoute() {
    if (this.currentView) {
      this.currentView.destroy(); // Remove old view's listeners
    }

    const ViewClass = this.routes.get(hash);
    this.currentView = new ViewClass();
    this.currentView.render();
  }
}
```

**Why This Works:**
1. Each view tracks its own listeners in `this.listeners` array
2. When switching views, router calls `destroy()` on old view
3. `destroy()` removes all tracked listeners from memory
4. New view starts fresh with no accumulated listeners

**Best Practices:**
- Always use `this.addEventListener()` instead of direct `element.addEventListener()`
- Router should call `destroy()` before switching views
- For intervals/timers, clear them in custom `destroy()` override:

```javascript
class QuizView extends BaseView {
  render() {
    this.timer = setInterval(() => { /* ... */ }, 1000);
  }

  destroy() {
    clearInterval(this.timer); // Clear custom timer
    super.destroy(); // Call parent cleanup
  }
}
```

---

## 5.5 State Management

### Why We Need State

**Problem:**
- User enters topic on Home view
- Navigates to Quiz view
- Quiz view needs to know the topic!

**Solution: Shared state**

```javascript
// state.js

class AppState {
  constructor() {
    this.data = {
      currentTopic: null,
      currentQuestions: null,
      currentAnswers: [],
      lastSessionId: null
    };

    this.listeners = [];  // Functions to call when state changes
  }

  // Get state value
  get(key) {
    return this.data[key];
  }

  // Set state value
  set(key, value) {
    this.data[key] = value;
    this.notify(key, value);
  }

  // Update multiple values
  update(updates) {
    Object.assign(this.data, updates);
    this.notify('*', this.data);
  }

  // Listen for changes
  subscribe(callback) {
    this.listeners.push(callback);
  }

  // Notify listeners
  notify(key, value) {
    this.listeners.forEach(callback => callback(key, value));
  }

  // Reset state
  reset() {
    this.data = {
      currentTopic: null,
      currentQuestions: null,
      currentAnswers: [],
      lastSessionId: null
    };
    this.notify('*', this.data);
  }
}

export default new AppState();  // Singleton
```

### Using State

```javascript
// views/HomeView.js

import state from '../state.js';

export default class HomeView extends BaseView {
  render() {
    this.setHTML(`
      <input type="text" id="topicInput" placeholder="Enter topic...">
      <button id="startBtn">Start Quiz</button>
    `);

    this.attachListeners();
  }

  attachListeners() {
    const startBtn = this.querySelector('#startBtn');
    const topicInput = this.querySelector('#topicInput');

    startBtn.addEventListener('click', () => {
      const topic = topicInput.value.trim();

      if (topic) {
        // Save to state
        state.set('currentTopic', topic);

        // Navigate
        this.navigateTo('/quiz');
      }
    });
  }
}
```

```javascript
// views/QuizView.js

import state from '../state.js';
import { generateQuestions } from '../api/api.mock.js';

export default class QuizView extends BaseView {
  async render() {
    // Get topic from state
    const topic = state.get('currentTopic');

    this.setHTML(`<div class="loading">Generating questions...</div>`);

    // Generate questions
    const questions = await generateQuestions(topic);

    // Save to state
    state.set('currentQuestions', questions);

    // Render quiz UI
    this.renderQuiz(questions);
  }

  renderQuiz(questions) {
    this.setHTML(`
      <h2>Quiz: ${state.get('currentTopic')}</h2>
      <!-- Question UI here -->
    `);
  }
}
```

---

## 5.6 HTML Structure for SPA

### Update index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QuizMaster</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Main app container (views render here) -->
  <div id="app"></div>

  <!-- Main entry point -->
  <script type="module" src="src/main.js"></script>
</body>
</html>
```

**Key changes:**
- Single `<div id="app">` container
- All views render inside `#app`
- Entry point is now `main.js` (not `app.js`)

---

## 5.7 Navigation Patterns

### Programmatic Navigation

```javascript
// Navigate from code
import router from './router/router.js';
router.navigateTo('/results');

// Or simpler
window.location.hash = '/results';
```

### Link Navigation

```html
<!-- Simple hash links (browser handles) -->
<a href="#/quiz">Start Quiz</a>
<a href="#/history">View History</a>
<a href="#/settings">Settings</a>
```

### Button Navigation

```javascript
// In view
startBtn.addEventListener('click', () => {
  this.navigateTo('/quiz');
});
```

---

## 5.8 Loading States

### Show Loading During Async Operations

```javascript
export default class QuizView extends BaseView {
  async render() {
    const topic = state.get('currentTopic');

    // Show loading
    this.setHTML(`
      <div class="loading">
        <p>Generating questions about ${topic}...</p>
        <div class="spinner"></div>
      </div>
    `);

    try {
      // Load data
      const questions = await generateQuestions(topic);
      state.set('currentQuestions', questions);

      // Show content
      this.renderQuiz(questions);

    } catch (error) {
      // Show error
      this.setHTML(`
        <div class="error">
          <p>Failed to generate questions. Please try again.</p>
          <button onclick="window.location.hash = '/'">Go Home</button>
        </div>
      `);
    }
  }

  renderQuiz(questions) {
    // Render actual quiz UI
  }
}
```

---

## 5.9 QuizMaster Views

### Views to Build

1. **HomeView** (`/`)
   - Welcome message
   - Topic input
   - "Start Quiz" button
   - Links to History, Settings

2. **QuizView** (`/quiz`)
   - Question display (1 of 5)
   - Multiple choice options
   - Next button
   - Progress indicator

3. **ResultsView** (`/results`)
   - Score display
   - Correct/incorrect breakdown
   - Explanations for wrong answers
   - "Try Again" / "Go Home" buttons

4. **HistoryView** (`/history`)
   - List of past quiz sessions
   - Topic, date, score
   - Click to view details

5. **SettingsView** (`/settings`)
   - API key input (for Phase 11)
   - Grade level preference
   - Clear history option

---

## Checkpoint Questions

**Q1**: What happens when you change `window.location.hash`?

<details>
<summary>Answer</summary>

The browser:
1. Updates the URL (visible in address bar)
2. Fires a `hashchange` event
3. Adds entry to browser history (back button works)
4. Does NOT reload the page

Our router listens to `hashchange` and renders the appropriate view.
</details>

**Q2**: Why do we use a singleton pattern for Router and State?

<details>
<summary>Answer</summary>

Singleton ensures only **one instance** exists globally:
- Same router instance across all views
- Same state instance shared by all components
- Consistent behavior
- Easy to import and use anywhere

```javascript
// Every import gets the same instance
import state from './state.js';
```
</details>

**Q3**: What's the difference between state and localStorage/IndexedDB?

<details>
<summary>Answer</summary>

**State** (in-memory):
- Temporary (lost on page reload)
- Fast access
- For current session data

**IndexedDB/localStorage** (persistent):
- Survives page reload
- Slower access
- For long-term storage

**Use both**: State for current quiz, IndexedDB for history.
</details>

**Q4**: Why do views have a `destroy()` method?

<details>
<summary>Answer</summary>

To clean up when switching views:
- Remove event listeners (prevent memory leaks)
- Cancel timers/intervals
- Clean up subscriptions

Though for simple cases, replacing `innerHTML` removes event listeners automatically.
</details>

---

## Hands-On Exercise

### Build the Router and First View

**Task**: Implement the router, state manager, and HomeView.

**Files to create:**
1. `src/router/router.js` - Router implementation
2. `src/state.js` - State manager
3. `src/views/BaseView.js` - Base view class
4. `src/views/HomeView.js` - Home view
5. `src/main.js` - New entry point

**Steps**:

1. Create the router following the example above
2. Create the state manager
3. Create BaseView and HomeView
4. Update `index.html` to load `main.js` instead of `app.js`
5. Test navigation in browser

**Success Criteria**:
- ✅ HomeView renders on page load
- ✅ Can navigate using hash (e.g., `#/quiz`)
- ✅ Browser back button works
- ✅ State persists across views
- ✅ No page reloads during navigation

---

## Next Steps

Once you've built the router and first view:

**"I'm ready for Phase 6"** → We'll implement all the quiz features

**Need help?** → Ask Claude about SPAs or routing

---

## Learning Notes

**Date Started**: ___________

**Key Concepts Understood**:
- [ ] SPA vs multi-page apps
- [ ] Hash-based routing
- [ ] State management patterns
- [ ] View lifecycle (render/destroy)

**Code I Wrote**:
- [ ] Router implementation
- [ ] State manager
- [ ] BaseView class
- [ ] HomeView
- [ ] Updated entry point

**Questions/Challenges**:
-
-

**Date Completed**: ___________
