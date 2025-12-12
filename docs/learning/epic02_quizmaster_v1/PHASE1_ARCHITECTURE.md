# Phase 1: Understanding the Architecture

**Goal**: Understand what you're building and how the pieces fit together before writing any code.

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Understand the V1 feature scope and user flows
- ✅ Map user interactions to technical requirements
- ✅ Understand how data flows through the application
- ✅ Plan the file structure using ES6 modules
- ✅ Know where your HTML mockups fit into the architecture

---

## 1.1 Review the V1 Specification

### What QuizMaster V1 Does

**Core User Flow:**
```
1. User opens app → Sees home screen with recent topics
2. User taps "Start New Quiz" → Topic input screen
3. User enters topic (e.g., "Photosynthesis") → Generates 5 questions
4. User answers questions → Gets immediate feedback (correct/incorrect)
5. User completes quiz → Sees results screen with score
6. Session is saved → Appears in home screen history
```

### Features In Scope

1. **Home Screen**
   - Recent topics list with scores
   - "Start New Quiz" button
   - Score color coding (green/yellow/red)

2. **Topic Input**
   - Free-text topic field
   - Optional grade level selector
   - Loading state during API call

3. **Question Display**
   - One question at a time (5 total)
   - Multiple choice options (4 choices)
   - Progress indicator (1/5, 2/5, etc.)
   - Submit answer button

4. **Feedback & Results**
   - Immediate feedback after each answer
   - Explanations for wrong answers
   - Final score summary
   - Review incorrect answers

5. **Data Persistence**
   - Store sessions locally (IndexedDB)
   - Store API key (localStorage/IndexedDB)
   - Track topics and scores over time

6. **PWA Features**
   - Installable on mobile devices
   - Offline viewing of past sessions
   - Service worker for caching

### Features NOT In Scope (V2)

- ❌ Photo upload
- ❌ Spaced repetition
- ❌ Multiple question types
- ❌ User profiles
- ❌ Social sharing

---

## 1.2 Understanding Data Flow

### The Three Data Flows

#### **Flow 1: Question Generation**
```
User Input (Topic)
  ↓
  → Validate topic (not empty)
  → Build API request with prompt template
  → Call Claude API
  → Parse JSON response (5 questions)
  → Display first question
```

#### **Flow 2: Quiz Taking**
```
Display Question
  ↓
  → User selects answer
  → Check correctness (compare to stored correct answer)
  → If incorrect: Generate explanation (API call)
  → Show feedback
  → Move to next question (or results if last)
```

#### **Flow 3: Session Storage**
```
Quiz Complete
  ↓
  → Calculate score (X/5)
  → Create session object {topic, timestamp, score, questions[]}
  → Save to IndexedDB
  → Update topic aggregate (total questions, correct count)
  → Navigate to results screen
```

### Data That Needs to Persist

**In IndexedDB:**
1. **Topics** - Unique topics practiced, aggregated scores
2. **Sessions** - Individual quiz sessions with full details
3. **Settings** - User preferences (API key, default grade level)

**In Memory (during session):**
1. **Current Quiz State** - Active questions, user answers, current index
2. **UI State** - Which screen is showing, loading states

---

## 1.3 Application Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│           User Interface Layer          │
│  (HTML mockups + Dynamic rendering)     │
│                                         │
│  - Home Screen                          │
│  - Topic Input Screen                   │
│  - Question Screen                      │
│  - Results Screen                       │
└──────────────┬──────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│         Application Logic Layer          │
│          (JavaScript Modules)            │
│                                          │
│  ┌────────┐  ┌────────┐  ┌──────────┐   │
│  │ Router │  │  State │  │ UI Utils │   │
│  └────────┘  └────────┘  └──────────┘   │
└──────────────┬───────────────────────────┘
               │
     ┌─────────┴─────────┐
     ↓                   ↓
┌────────────┐    ┌──────────────┐
│  Data Layer│    │  API Layer   │
│  (IndexedDB)│    │  (Claude API)│
│            │    │              │
│ - db.js    │    │ - api.js     │
│ - Topics   │    │ - prompts.js │
│ - Sessions │    │              │
│ - Settings │    │              │
└────────────┘    └──────────────┘
```

### Module Responsibilities

**app.js** (Entry point)
- Initializes the application
- Registers service worker
- Sets up router
- Loads initial state

**router.js** (Navigation)
- Hash-based routing (#/home, #/quiz, etc.)
- Show/hide screens
- Navigate between views

**state.js** (State management)
- Centralized application state
- State update functions
- Notify UI of changes

**ui.js** (UI rendering)
- Render dynamic content
- Event handlers
- Loading states
- Form validation

**db.js** (Data persistence)
- IndexedDB wrapper
- CRUD operations for topics/sessions
- Query helpers

**api.js** (External API)
- Claude API client
- Question generation
- Explanation generation
- Error handling & retries

**prompts.js** (Prompt templates)
- Question generation prompt
- Explanation prompt
- Context injection helpers

---

## 1.4 File Structure Plan

### Project Structure

```
saberloop/
├── index.html                    # Main HTML (converted from mockups)
├── manifest.json                 # PWA manifest
├── sw.js                         # Service worker
├── styles.css                    # Global styles (or use Tailwind CDN)
│
├── js/
│   ├── app.js                    # Main entry point
│   ├── router.js                 # Client-side routing
│   ├── state.js                  # State management
│   ├── ui.js                     # UI rendering utilities
│   ├── db.js                     # IndexedDB wrapper
│   ├── api.js                    # Claude API client
│   └── prompts.js                # Prompt templates
│
├── icons/
│   ├── icon-192.png              # PWA icons
│   └── icon-512.png
│
├── docs/
│   ├── QUIZMASTER_V1_LEARNING_PLAN.md
│   ├── PHASE1_ARCHITECTURE.md    # This file
│   └── [other phase files]
│
└── product_info/
    └── mockups/
        └── app_mockups/
            ├── v1_home_screen/
            ├── v1_topic_input_screen/
            ├── v1_question_screen/
            └── v1_results_screen/
```

### How Mockups Become the App

Your HTML mockups are **static snapshots** of what each screen should look like. You'll:

1. **Extract the HTML structure** from mockups into sections in `index.html`
2. **Hide all screens by default** (CSS: `display: none`)
3. **Use router** to show/hide screens based on current route
4. **Replace static data** with dynamic rendering from state
5. **Add event listeners** for user interactions

Example:
```html
<!-- index.html -->
<div id="app">
  <!-- Home Screen (from v1_home_screen mockup) -->
  <div id="home-screen" class="screen">
    <!-- Static structure from mockup -->
    <h1>Welcome back!</h1>
    <button id="start-quiz-btn">Start New Quiz</button>
    <div id="recent-topics">
      <!-- Dynamically rendered from IndexedDB -->
    </div>
  </div>

  <!-- Topic Input Screen (from v1_topic_input_screen mockup) -->
  <div id="topic-input-screen" class="screen hidden">
    <!-- Structure from mockup -->
  </div>

  <!-- etc. -->
</div>
```

---

## 1.5 Technology Decisions

### Why These Technologies?

**Vanilla JavaScript + ES6 Modules**
- No build step needed initially
- Learn fundamentals, not framework abstractions
- Lightweight and fast
- Easy to migrate to a framework later

**IndexedDB (not localStorage)**
- Structured data (not just strings)
- Better for querying (indexes)
- Larger storage limits
- Async (won't block UI)

**Hash-based Routing (not History API)**
- Simpler to implement
- Works without server configuration
- Good for learning routing concepts
- Example: `#/home`, `#/quiz`, `#/results`

**Tailwind CSS via CDN**
- Your mockups already use it
- No build step needed
- Rapid styling
- Can optimize later if needed

**Anthropic Claude API**
- Excellent at generating educational content
- Strong instruction-following
- Good prompt engineering opportunities
- BYOK model (user provides key)

---

## 1.6 Questions to Consider

Before moving to Phase 2, think about:

1. **What happens if the API call fails?**
   - Show error message
   - Retry option
   - Fallback behavior

2. **How do you know which screen to show on app load?**
   - Default to home screen
   - Check URL hash
   - Restore state if mid-quiz?

3. **Where should the API key be stored?**
   - localStorage (simple, but less secure)
   - IndexedDB (more structured)
   - Never in code or git!

4. **How do you handle the loading state during API calls?**
   - Disable buttons
   - Show spinner
   - Display progress message

---

## Checkpoint Questions

Answer these to verify your understanding:

**Q1**: In the data flow, when does the app make API calls to Claude?
<details>
<summary>Answer</summary>

Twice:
1. When generating questions (user submits topic)
2. When generating explanations (user answers incorrectly)
</details>

**Q2**: Which file will be responsible for saving quiz results to IndexedDB?
<details>
<summary>Answer</summary>

`db.js` contains the IndexedDB operations, but it will be called by `app.js` or the results screen logic.
</details>

**Q3**: If the user refreshes the page mid-quiz, what happens in V1?
<details>
<summary>Answer</summary>

In V1, the quiz state is lost (in-memory only). They'll return to the home screen. V2 could add mid-quiz state persistence.
</details>

**Q4**: Why use ES6 modules instead of putting everything in one big `app.js` file?
<details>
<summary>Answer</summary>

- Separation of concerns (each module has one responsibility)
- Easier to maintain and debug
- Reusable code
- Better code organization
- Easier to test individual pieces
</details>

---

## Next Steps

Once you understand the architecture and data flow:

**"I'm ready for Phase 2"** → We'll dive into IndexedDB and build your data storage layer.

**Questions?** → Ask Claude to clarify any part of the architecture.

---

## Learning Notes

**Date Started**: ___________

**Key Takeaways**:
-
-
-

**Questions/Clarifications Needed**:
-
-

**Date Completed**: ___________
