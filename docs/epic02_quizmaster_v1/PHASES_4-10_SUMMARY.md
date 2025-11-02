# Phases 4-10: Implementation and Deployment Summary

This document provides an overview of the remaining phases. Detailed phase files will be created as you progress through the learning plan.

---

## Phase 4: ES6 Modules and Code Organization

**Goal**: Structure your codebase using modern JavaScript modules.

### Key Concepts

**ES6 Modules Basics:**
```javascript
// Exporting
export function myFunction() { }
export const myVariable = 'value';
export default class MyClass { }

// Importing
import { myFunction, myVariable } from './module.js';
import MyClass from './module.js';
import * as helpers from './helpers.js';
```

### QuizMaster Module Structure

```
js/
├── app.js          - Entry point, initialization
├── router.js       - Hash-based routing
├── state.js        - Centralized app state
├── ui.js           - DOM manipulation and rendering
├── db.js           - IndexedDB wrapper (already built in Phase 2)
├── api.js          - Claude API client (already built in Phase 3)
└── prompts.js      - Prompt templates (already built in Phase 3)
```

### Loading Modules in HTML

```html
<!-- index.html -->
<script type="module">
  import { initApp } from './js/app.js';
  initApp();
</script>
```

**Note**: Modules require a server (can't use file://) - use `python -m http.server` or similar.

---

## Phase 5: Building the Single Page Application

**Goal**: Create multi-screen navigation without page reloads.

### Hash-Based Routing

```javascript
// router.js

const routes = {
  '': 'home',           // Default route
  'home': 'home',
  'new-quiz': 'topic-input',
  'quiz': 'question',
  'results': 'results'
};

export function navigateTo(route) {
  window.location.hash = route;
}

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  const screen = routes[hash] || 'home';
  showScreen(screen);
});
```

### State Management Pattern

```javascript
// state.js

let appState = {
  currentScreen: 'home',
  currentQuiz: null,
  currentQuestionIndex: 0,
  userAnswers: [],
  topics: [],
  recentSessions: []
};

export function getState() {
  return appState;
}

export function setState(updates) {
  appState = { ...appState, ...updates };
  // Notify UI to re-render
  dispatchEvent(new CustomEvent('statechange'));
}
```

### Screen Management

```javascript
// ui.js

export function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });

  // Show target screen
  document.getElementById(`${screenId}-screen`).classList.remove('hidden');
}
```

---

## Phase 6: Implementing Core Features

**Goal**: Build all the user-facing functionality piece by piece.

### 6.1 Home Screen

**Tasks:**
- Load recent sessions from IndexedDB
- Render topic list dynamically
- Color-code scores (red < 60%, yellow 60-79%, green 80%+)
- Handle "Start New Quiz" button click
- Handle empty state (no sessions yet)

### 6.2 Topic Input Screen

**Tasks:**
- Form validation (topic not empty)
- Show loading spinner during API call
- Handle errors (API key missing, network error)
- Navigate to quiz screen when questions ready

### 6.3 Question Generation

**Tasks:**
- Call `generateQuestions()` from api.js
- Validate response structure
- Store questions in state
- Initialize quiz state (index 0, no answers yet)

### 6.4 Question Display

**Tasks:**
- Render current question
- Update progress indicator (1/5, 2/5, etc.)
- Handle option selection (radio buttons or click)
- Enable submit button only when answer selected

### 6.5 Answer Submission & Feedback

**Tasks:**
- Check if answer is correct
- If incorrect, generate explanation
- Show immediate feedback (green/red)
- Store user answer in state
- Move to next question or results

### 6.6 Results Screen

**Tasks:**
- Calculate score (correct / total)
- Display summary with color coding
- List all questions with ✓/✗ indicators
- Save session to IndexedDB
- Update topic aggregate stats
- "Try Another Topic" button

### 6.7 Session History

**Tasks:**
- Query recent sessions from IndexedDB
- Group by topic
- Display score trends
- Handle click to view session details

### 6.8 Settings Screen

**Tasks:**
- Input for API key
- Save to IndexedDB settings store
- Validate key (optional: test with API call)
- Show/hide API key (password field)
- Default grade level selector

---

## Phase 7: PWA Integration

**Goal**: Make QuizMaster installable and offline-capable.

### 7.1 Update Manifest

```json
{
  "name": "QuizMaster - AI Learning Quiz App",
  "short_name": "QuizMaster",
  "description": "Generate AI-powered quizzes on any topic",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#121212",
  "theme_color": "#4A90E2",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 7.2 Service Worker Strategy

**Cache static assets:**
- HTML, CSS, JavaScript
- Icons
- Fonts

**Don't cache:**
- API calls to Claude (always need fresh data)

**Offline behavior:**
- Show cached home screen with history
- Disable "Start New Quiz" (show message)
- Allow viewing past sessions

### 7.3 Service Worker Code

```javascript
// sw.js

const CACHE_NAME = 'quizmaster-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/app.js',
  '/js/router.js',
  '/js/state.js',
  '/js/ui.js',
  '/js/db.js',
  '/js/api.js',
  '/js/prompts.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Network-first for API calls
  if (request.url.includes('anthropic.com')) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});
```

---

## Phase 8: Polish and Testing

**Goal**: Ensure quality and handle edge cases.

### 8.1 Error Handling Checklist

- [ ] Network errors (no internet)
- [ ] Invalid API key
- [ ] Rate limiting (429)
- [ ] Malformed API responses
- [ ] Empty topic input
- [ ] Browser storage quota exceeded

### 8.2 Loading States

- [ ] Spinner during question generation
- [ ] Disabled buttons during API calls
- [ ] Skeleton loaders for loading data
- [ ] Progress indicators

### 8.3 Edge Cases

- [ ] Very long topic names
- [ ] Special characters in topics
- [ ] No API key configured
- [ ] No internet connection
- [ ] First-time user (no history)
- [ ] Extremely broad topics ("History")

### 8.4 Manual Testing Plan

**Test on Desktop:**
- [ ] Chrome
- [ ] Firefox
- [ ] Edge

**Test on Mobile:**
- [ ] Android Chrome
- [ ] iOS Safari

**Test Offline:**
- [ ] View home screen
- [ ] View past sessions
- [ ] "New Quiz" shows error

**Test Install:**
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Opens in standalone mode

---

## Phase 9: Deployment

**Goal**: Deploy to Netlify and make accessible.

### 9.1 Deployment Steps

1. **Create Netlify account** (netlify.com)
2. **Connect GitHub repo**
3. **Configure build settings:**
   - Build command: (none - static site)
   - Publish directory: `/`
4. **Deploy**
5. **Get URL**: `https://quizmaster-yourname.netlify.app`

### 9.2 Post-Deployment

- [ ] Test on production URL
- [ ] Test PWA installation from production
- [ ] Test on mobile devices
- [ ] Share with family for beta testing

---

## Phase 10: Validation and Learning Review

**Goal**: Validate the app with real users and reflect on learning.

### 10.1 Family Beta Testing (Week 1-2)

**Setup:**
- Install on family devices
- Configure API key (or use shared family key)
- Show them how to use it

**Observe:**
- Do they use it without prompting?
- What topics do they practice?
- Where do they get confused?

### 10.2 Metrics to Track

**Usage:**
- Daily active users
- Sessions per user
- Topics practiced

**Engagement:**
- Day 1 retention (did they come back?)
- Week 1 retention
- Week 2 retention

**Quality:**
- Question quality (too easy/hard?)
- Explanation quality (helpful?)
- Bug reports

### 10.3 Learning Reflection

**Technical Skills Gained:**
- [ ] IndexedDB mastery
- [ ] API integration
- [ ] ES6 modules
- [ ] SPA architecture
- [ ] PWA implementation
- [ ] Prompt engineering

**What Went Well:**
-
-

**What Was Challenging:**
-
-

**What Would You Do Differently:**
-
-

### 10.4 Decision Point

**High Engagement (3+ uses/week, 50%+ retention):**
→ Plan V2 features:
- Photo upload from textbooks
- Spaced repetition scheduling
- Multiple question types
- Share results

**Medium Engagement (1-2 uses/week, mixed feedback):**
→ Iterate on V1:
- Improve question quality (better prompts)
- Better UX (faster, clearer)
- More engaging feedback

**Low Engagement (<1 use/week, negative feedback):**
→ Pivot or learn:
- Is the problem real? (Do they need this?)
- Is the solution right? (Should it work differently?)
- What did we learn?

---

## Next Steps for Each Phase

As you complete each phase, say:
- **"I'm ready for Phase X"** to begin that phase
- **"That's a wrap on Phase X"** to record progress

Detailed phase documents will be created when you're ready to start each phase.

---

## Overall Progress Tracker

- [x] Phase 1: Architecture ✅
- [x] Phase 2: IndexedDB ✅
- [x] Phase 3: API Integration ✅
- [ ] Phase 4: ES6 Modules
- [ ] Phase 5: SPA
- [ ] Phase 6: Features
- [ ] Phase 7: PWA
- [ ] Phase 8: Testing
- [ ] Phase 9: Deployment
- [ ] Phase 10: Validation

---

**You're now equipped with the complete roadmap to build QuizMaster V1!**

When you're ready to continue, just say **"Let's start Phase 4"** or **"What's next?"**
