# Phase 3: UI Polish

**Epic:** 3 - QuizMaster V2
**Status:** Not Started
**Estimated Time:** 5-6 sessions
**Prerequisites:** Phase 1 (Backend) and Phase 2 (Offline) complete

---

## Overview

Phase 3 refines QuizMaster's user interface with dynamic data rendering, settings management, navigation improvements, and critical UX fixes. You'll transform the home page from mock data to real quiz history, create a settings page for API key configuration, add a loading screen for quiz generation, and implement multi-language support.

**What you'll build:**
- Loading screen for quiz generation (fixes blank screen issue)
- Multi-language question generation (questions match topic language)
- Dynamic home page (real quiz history from IndexedDB)
- Settings page with API key management
- Simplified navigation (Home, Settings only)
- Form validation and UX refinements
- Empty states and loading states

**Why this matters:**
- Users get immediate feedback during quiz generation (no more blank screens)
- International users can study in their native language
- Users see their actual progress
- Easy API key configuration
- Cleaner, more focused navigation
- Professional user experience
- Ready for real users

---

## Phase 3 Structure

| Part | Focus | Estimated Time |
|------|-------|----------------|
| **Part 1** | Loading Screen for Quiz Generation | 1 session |
| **Part 2** | Multi-Language Question Generation | 1 session |
| **Part 3** | Dynamic Home Page | 1 session |
| **Part 4** | Settings Page | 1-2 sessions |
| **Part 5** | Navigation Updates | 0.5 session |

**Total: 5-6 sessions**

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Implement loading states with visual feedback
- ✅ Understand prompt engineering for language detection
- ✅ Query IndexedDB for dynamic data
- ✅ Render dynamic lists efficiently
- ✅ Implement form validation
- ✅ Manage settings with localStorage
- ✅ Create empty states for better UX
- ✅ Handle loading states gracefully
- ✅ Implement show/hide password patterns
- ✅ Design settings UI
- ✅ Refactor navigation components

---

## Current State vs Target State

### Current State (Epic 02)

**Home Page:**
```javascript
// Hardcoded mock data
const recentTopics = [
  { topic: 'Geography', score: '10/10', icon: '🌍' },
  { topic: 'Science', score: '8/10', icon: '🔬' },
  // ...
];
```

**Navigation:**
- Home (active)
- Topics (unused, placeholder)
- Profile (placeholder)

**Settings:**
- None (API key in backend only)

### Target State (Epic 03 Phase 3)

**Home Page:**
```javascript
// Dynamic from IndexedDB
const sessions = await getRecentSessions(10);
// Real quiz history, scores, dates
```

**Navigation:**
- Home (active)
- Settings (functional)

**Settings Page:**
- API key input (show/hide)
- Validation
- Test connection button
- Clear key option
- User preferences
- About section

---

## Implementation Steps

### Part 1: Loading Screen for Quiz Generation (NEW)

**Problem:** When users click "Generate Questions", they navigate to QuizView which calls the backend API. This takes 5+ seconds, during which users see a blank screen with no feedback about what's happening.

**Solution:** Create a dedicated loading view that shows progress and feedback during quiz generation.

---

#### Step 1.1: Create LoadingView Component

**File:** `src/views/LoadingView.js` (NEW)

**Purpose:** Display a professional loading screen with:
- Visual spinner/animation
- Informative text about what's happening
- Topic name to confirm correct subject
- Optional: Tips or fun facts while waiting

```javascript
// src/views/LoadingView.js

import BaseView from './BaseView.js';
import state from '../state/state.js';
import { generateQuestions } from '../api/index.js';

export default class LoadingView extends BaseView {
  constructor() {
    super();
    this.loadingMessages = [
      'Preparing your questions...',
      'Consulting our AI teacher...',
      'Crafting the perfect quiz...',
      'Almost ready...'
    ];
    this.currentMessageIndex = 0;
    this.messageInterval = null;
  }

  async render() {
    const topic = state.get('currentTopic');
    const gradeLevel = state.get('currentGradeLevel');

    if (!topic) {
      this.navigateTo('/topic-input');
      return;
    }

    this.setHTML(`
      <div class="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark items-center justify-center">
        <!-- Loading Content -->
        <div class="flex flex-col items-center gap-6 p-8 text-center">

          <!-- Animated Spinner -->
          <div class="relative">
            <div class="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
            <div class="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>

          <!-- Topic Display -->
          <div class="mt-4">
            <p class="text-sm text-subtext-light dark:text-subtext-dark uppercase tracking-wider">
              Generating quiz for
            </p>
            <h1 class="text-2xl font-bold text-text-light dark:text-text-dark mt-2">
              ${this.escapeHtml(topic)}
            </h1>
            <p class="text-sm text-subtext-light dark:text-subtext-dark mt-1">
              ${gradeLevel || 'Middle School'} Level
            </p>
          </div>

          <!-- Dynamic Message -->
          <p id="loadingMessage" class="text-base text-primary font-medium animate-pulse">
            ${this.loadingMessages[0]}
          </p>

          <!-- Progress Dots -->
          <div class="flex gap-2 mt-4">
            <span class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </div>

          <!-- Tip Section (Optional) -->
          <div class="mt-8 max-w-sm">
            <p class="text-xs text-subtext-light dark:text-subtext-dark">
              💡 Tip: Questions are generated specifically for your grade level to ensure the best learning experience.
            </p>
          </div>
        </div>

        <!-- Cancel Button -->
        <div class="absolute bottom-8 left-0 right-0 flex justify-center">
          <button id="cancelBtn" class="px-6 py-2 text-sm text-subtext-light dark:text-subtext-dark hover:text-error transition-colors">
            Cancel
          </button>
        </div>
      </div>
    `);

    this.attachListeners();
    this.startMessageRotation();
    this.startQuizGeneration(topic, gradeLevel);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  startMessageRotation() {
    this.messageInterval = setInterval(() => {
      this.currentMessageIndex = (this.currentMessageIndex + 1) % this.loadingMessages.length;
      const messageEl = this.querySelector('#loadingMessage');
      if (messageEl) {
        messageEl.textContent = this.loadingMessages[this.currentMessageIndex];
      }
    }, 2000);
  }

  async startQuizGeneration(topic, gradeLevel) {
    try {
      const questions = await generateQuestions(topic, gradeLevel);

      // Store questions in state for QuizView
      state.set('generatedQuestions', questions);

      // Clear interval before navigating
      this.cleanup();

      // Navigate to quiz
      this.navigateTo('/quiz');

    } catch (error) {
      console.error('Failed to generate questions:', error);
      this.cleanup();

      // Show error and go back
      alert('Failed to generate questions. Please check your connection and try again.');
      this.navigateTo('/topic-input');
    }
  }

  attachListeners() {
    const cancelBtn = this.querySelector('#cancelBtn');
    this.addEventListener(cancelBtn, 'click', () => {
      if (confirm('Are you sure you want to cancel?')) {
        this.cleanup();
        this.navigateTo('/topic-input');
      }
    });
  }

  cleanup() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
      this.messageInterval = null;
    }
  }

  destroy() {
    this.cleanup();
    super.destroy();
  }
}
```

---

#### Step 1.2: Update TopicInputView to Navigate to Loading

**File:** `src/views/TopicInputView.js`

**Change:** Navigate to `/loading` instead of `/quiz`

```javascript
// In attachListeners(), change:
this.navigateTo('/quiz');

// To:
this.navigateTo('/loading');
```

---

#### Step 1.3: Update QuizView to Use Pre-Generated Questions

**File:** `src/views/QuizView.js`

**Change:** Get questions from state instead of generating them

```javascript
async render() {
  const topic = state.get('currentTopic');
  const gradeLevel = state.get('currentGradeLevel');

  if (!topic) {
    this.navigateTo('/topic-input');
    return;
  }

  // Get pre-generated questions from LoadingView
  if (this.questions.length === 0) {
    const generatedQuestions = state.get('generatedQuestions');

    if (!generatedQuestions || generatedQuestions.length === 0) {
      // No questions generated, go back to loading
      this.navigateTo('/loading');
      return;
    }

    this.questions = generatedQuestions;
    this.answers = new Array(this.questions.length).fill(null);

    // Clear from state to prevent reuse
    state.set('generatedQuestions', null);
  }

  this.renderQuestion();
}
```

---

#### Step 1.4: Register LoadingView in Router

**File:** `src/main.js`

```javascript
import LoadingView from './views/LoadingView.js';

// In init() function, add:
router.addRoute('/loading', LoadingView);
```

---

#### Step 1.5: Add CSS Animation (if not using Tailwind's animate-*)

**File:** `src/styles.css` or inline in `index.html`

```css
/* Custom loading animations (if needed) */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

---

#### Testing Part 1

1. **Navigation Flow:**
   - Click "Start New Quiz" → Should go to loading screen
   - Loading screen shows topic name and grade level
   - After generation completes → Should go to quiz

2. **Visual Feedback:**
   - Spinner animates
   - Messages rotate every 2 seconds
   - Bouncing dots animate

3. **Cancel Functionality:**
   - Click Cancel → Shows confirmation
   - Confirm → Returns to topic input

4. **Error Handling:**
   - Disconnect network → Should show error alert
   - Returns to topic input on error

---

### Part 2: Multi-Language Question Generation (NEW)

**Problem:** When users enter topics in languages other than English (e.g., "sistema digestivo" in Portuguese), the questions are still generated in English. Users studying in their native language get a jarring mixed-language experience.

**Solution:** Update the backend prompt to detect the language of the topic and generate questions and answers in that same language.

---

#### Step 2.1: Understand the Language Detection Approach

**Two options:**
1. **Client-side detection** - Detect language in frontend, send as parameter
2. **Prompt-based detection** - Let Claude detect the language from the topic itself

**We'll use Option 2** because:
- Simpler implementation (no external libraries)
- Claude is excellent at language detection
- Works automatically for any language
- No additional API calls needed

---

#### Step 2.2: Update Backend Prompt for Language Detection

**File:** `netlify/functions/generate-questions.js`

**Current prompt (lines 94-119):**
```javascript
const prompt = `You are an expert educational content creator. Generate exactly 5 multiple-choice questions about "${topic}" appropriate for ${gradeLevel || 'middle school'} students.
...
```

**Updated prompt:**
```javascript
const prompt = `You are an expert educational content creator. Generate exactly 5 multiple-choice questions about "${topic}" appropriate for ${gradeLevel || 'middle school'} students.

LANGUAGE REQUIREMENT (CRITICAL):
- Detect the language of the topic "${topic}"
- Generate ALL questions and ALL answer options in the SAME language as the topic
- For example:
  - If topic is "Digestive System" → questions in English
  - If topic is "Sistema Digestivo" → questions in Portuguese
  - If topic is "Système Digestif" → questions in French
  - If topic is "Sistema Digestivo" (Spanish context) → questions in Spanish
- Do NOT mix languages - everything must be consistent
- If the topic language is ambiguous, default to English

Requirements:
- Each question should have 4 answer options (A, B, C, D)
- Only one correct answer per question
- Include a mix of difficulty: 2 easy, 2 medium, 1 challenging
- Questions should test understanding, not just memorization
- Use clear, concise language appropriate for ${gradeLevel || 'middle school'}
- Avoid ambiguous phrasing
- No trick questions

Return your response as a JSON array with this exact structure:
[
  {
    "question": "The question text here?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correct": "0",  // Index of correct option (0-3)
    "difficulty": "easy"
  }
]

IMPORTANT:
- The "correct" field must be a NUMBER (0 for first option, 1 for second option, 2 for third option, 3 for fourth option)
- Return ONLY the JSON array, no other text before or after.
- ALL text must be in the same language as the topic.`;
```

---

#### Step 2.3: Update Explanation Endpoint for Language Consistency

**File:** `netlify/functions/generate-explanation.js`

**Add language detection to explanation prompt:**

```javascript
const prompt = `You are a patient and encouraging teacher helping a student understand why their answer was incorrect.

LANGUAGE REQUIREMENT (CRITICAL):
- Detect the language of the question below
- Provide your ENTIRE explanation in the SAME language as the question
- Do NOT mix languages

Question: ${question}
Student's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}
Student Level: ${gradeLevel || 'middle school'}

Provide a brief, encouraging explanation (2-3 sentences) that:
1. Gently explains why the student's answer was incorrect
2. Clearly explains why the correct answer is right
3. Uses language appropriate for a ${gradeLevel || 'middle school'} student
4. Is encouraging and supportive

IMPORTANT: Your entire response must be in the same language as the question above.`;
```

---

#### Step 2.4: Understanding Prompt Engineering for Language Detection

**Why this works:**
- Claude's language models are trained on multilingual data
- They can detect language from context clues (words, grammar, characters)
- By explicitly asking for same-language output, Claude follows the instruction
- The examples help Claude understand the expected behavior

**Key prompt engineering principles used:**
1. **Explicit instruction** - "Generate ALL questions in the SAME language"
2. **Examples** - Show concrete input/output language pairs
3. **Emphasis** - Use caps and "CRITICAL" to highlight importance
4. **Repetition** - Mention language requirement multiple times
5. **Negative instruction** - "Do NOT mix languages"

---

#### Step 2.5: Testing Multi-Language Support

**Test cases:**

1. **English topic:**
   - Input: "Photosynthesis"
   - Expected: Questions and answers in English

2. **Portuguese topic:**
   - Input: "Sistema Digestivo"
   - Expected: Questions and answers in Portuguese

3. **Spanish topic:**
   - Input: "La Guerra Civil Española"
   - Expected: Questions and answers in Spanish

4. **French topic:**
   - Input: "La Révolution Française"
   - Expected: Questions and answers in French

5. **Mixed language (edge case):**
   - Input: "DNA replication processo"
   - Expected: Should default to dominant language or English

**Testing process:**
```bash
# Start dev server
npm run dev

# Test each language:
# 1. Enter topic in target language
# 2. Generate questions
# 3. Verify ALL text (questions + ALL 4 options) is in target language
# 4. Complete quiz and verify explanation is in same language
```

---

#### Step 2.6: Optional - Add Language Indicator to UI

**Enhancement:** Show detected language in loading screen or quiz header.

```javascript
// In LoadingView.js, optionally detect and display language
const detectLanguage = (text) => {
  // Simple heuristic detection (optional)
  const ptWords = /[àáâãéêíóôõúç]/i;
  const frWords = /[àâçéèêëîïôùûü]/i;
  const esWords = /[ñ¿¡]/i;

  if (ptWords.test(text)) return 'Portuguese';
  if (frWords.test(text)) return 'French';
  if (esWords.test(text)) return 'Spanish';
  return 'English';
};
```

**Note:** This is optional - Claude handles detection automatically. This would just be for UI display purposes.

---

### Part 3: Dynamic Home Page

#### Step 1: Update Database Queries

**File:** `src/db/db.js`

**Add query function:**
```javascript
/**
 * Get recent quiz sessions (for home page)
 * @param {number} limit - Number of sessions to retrieve
 * @returns {Promise<Array>} Recent sessions with topic, score, date
 */
export async function getRecentSessions(limit = 10) {
  const db = await openDatabase();
  const tx = db.transaction('sessions', 'readonly');
  const store = tx.objectStore('sessions');

  // Get all sessions
  const sessions = await store.getAll();

  // Sort by date (newest first)
  sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Take only the limit
  const recentSessions = sessions.slice(0, limit);

  // Format for display
  return recentSessions.map(session => ({
    id: session.id,
    topic: session.topic,
    score: `${session.score}/${session.totalQuestions}`,
    percentage: Math.round((session.score / session.totalQuestions) * 100),
    date: session.createdAt,
    gradeLevel: session.gradeLevel
  }));
}

/**
 * Get statistics for home page
 * @returns {Promise<Object>} Quiz statistics
 */
export async function getStatistics() {
  const db = await openDatabase();
  const tx = db.transaction('sessions', 'readonly');
  const store = tx.objectStore('sessions');

  const sessions = await store.getAll();

  if (sessions.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      perfectScores: 0,
      topicsStudied: 0
    };
  }

  const totalQuizzes = sessions.length;
  const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
  const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const averageScore = Math.round((totalScore / totalQuestions) * 100);
  const perfectScores = sessions.filter(s => s.score === s.totalQuestions).length;

  // Unique topics
  const uniqueTopics = new Set(sessions.map(s => s.topic.toLowerCase()));
  const topicsStudied = uniqueTopics.size;

  return {
    totalQuizzes,
    averageScore,
    perfectScores,
    topicsStudied
  };
}
```

---

#### Step 2: Update HomeView to Use Real Data

**File:** `src/views/HomeView.js`

**Update render method:**
```javascript
import { getRecentSessions, getStatistics } from '../db/db.js';

export default class HomeView {
  constructor() {
    this.sessions = [];
    this.stats = {};
  }

  async render() {
    // Load data
    await this.loadData();

    return (`
      <div class="min-h-screen bg-background-light dark:bg-background-dark pb-20">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary to-secondary text-white p-6">
          <h1 class="text-3xl font-bold mb-2">QuizUp</h1>
          <h2 class="text-xl font-light">Welcome back!</h2>
        </div>

        <!-- Statistics -->
        ${this.renderStatistics()}

        <!-- Start New Quiz Button -->
        <div class="p-6">
          <a href="#/topic-input" id="startQuizBtn"
             class="block w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-lg text-center transition-colors duration-200 shadow-lg">
            Start New Quiz
          </a>
        </div>

        <!-- Recent Topics -->
        ${this.renderRecentTopics()}

        <!-- Bottom Navigation -->
        ${this.renderBottomNav()}
      </div>
    `);
  }

  async loadData() {
    try {
      [this.sessions, this.stats] = await Promise.all([
        getRecentSessions(10),
        getStatistics()
      ]);
    } catch (error) {
      console.error('Failed to load home data:', error);
      this.sessions = [];
      this.stats = {
        totalQuizzes: 0,
        averageScore: 0,
        perfectScores: 0,
        topicsStudied: 0
      };
    }
  }

  renderStatistics() {
    return `
      <div class="p-6 grid grid-cols-2 gap-4">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p class="text-sm text-subtext-light dark:text-subtext-dark">Total Quizzes</p>
          <p class="text-2xl font-bold text-text-light dark:text-text-dark">${this.stats.totalQuizzes}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p class="text-sm text-subtext-light dark:text-subtext-dark">Average Score</p>
          <p class="text-2xl font-bold text-text-light dark:text-text-dark">${this.stats.averageScore}%</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p class="text-sm text-subtext-light dark:text-subtext-dark">Perfect Scores</p>
          <p class="text-2xl font-bold text-text-light dark:text-text-dark">${this.stats.perfectScores}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p class="text-sm text-subtext-light dark:text-subtext-dark">Topics Studied</p>
          <p class="text-2xl font-bold text-text-light dark:text-text-dark">${this.stats.topicsStudied}</p>
        </div>
      </div>
    `;
  }

  renderRecentTopics() {
    if (this.sessions.length === 0) {
      return this.renderEmptyState();
    }

    return `
      <div class="p-6">
        <h3 class="text-xl font-bold text-text-light dark:text-text-dark mb-4">Recent Topics</h3>
        <div id="recentTopicsList" class="space-y-3">
          ${this.sessions.map(session => this.renderSessionCard(session)).join('')}
        </div>
      </div>
    `;
  }

  renderSessionCard(session) {
    const scoreColor = session.percentage >= 80 ? 'text-success' :
                      session.percentage >= 60 ? 'text-warning' : 'text-error';

    const date = new Date(session.date);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return `
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between">
        <div class="flex-1">
          <h4 class="font-bold text-text-light dark:text-text-dark">${session.topic}</h4>
          <p class="text-sm text-subtext-light dark:text-subtext-dark">${session.gradeLevel} • ${dateStr}</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold ${scoreColor}">${session.percentage}%</p>
          <p class="text-sm text-subtext-light dark:text-subtext-dark">${session.score}</p>
        </div>
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="p-6">
        <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
          <div class="text-6xl mb-4">📚</div>
          <h3 class="text-xl font-bold text-text-light dark:text-text-dark mb-2">
            No quizzes yet!
          </h3>
          <p class="text-subtext-light dark:text-subtext-dark mb-4">
            Start your first quiz to see your progress here.
          </p>
        </div>
      </div>
    `;
  }

  renderBottomNav() {
    return `
      <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-around items-center h-full max-w-lg mx-auto px-4">
          <a class="flex flex-col items-center justify-center text-primary gap-1" href="#/">
            <div class="relative">
              <span class="material-symbols-outlined text-2xl fill">home</span>
              <span id="networkStatusDot" class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark"></span>
            </div>
            <span class="text-xs font-bold">Home</span>
          </a>
          <a class="flex flex-col items-center justify-center text-subtext-light dark:text-subtext-dark hover:text-primary gap-1" href="#/settings">
            <span class="material-symbols-outlined text-2xl">settings</span>
            <span class="text-xs font-medium">Settings</span>
          </a>
        </div>
      </div>
    `;
  }
}
```

---

### Part 4: Settings Page

#### Step 3: Create Settings Utilities

**File:** `src/utils/settings.js` (NEW)

**Purpose:** Manage user settings and API key storage

```javascript
// src/utils/settings.js

const SETTINGS_KEY = 'quizmaster_settings';

/**
 * Default settings
 */
const DEFAULT_SETTINGS = {
  apiKey: '',
  defaultGradeLevel: 'middle school',
  questionsPerQuiz: 5,
  difficulty: 'mixed',
  theme: 'auto'
};

/**
 * Get all settings
 */
export function getSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return { ...DEFAULT_SETTINGS };
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save settings
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
}

/**
 * Get API key
 */
export function getApiKey() {
  const settings = getSettings();
  return settings.apiKey || '';
}

/**
 * Save API key
 */
export function saveApiKey(apiKey) {
  const settings = getSettings();
  settings.apiKey = apiKey;
  return saveSettings(settings);
}

/**
 * Clear API key
 */
export function clearApiKey() {
  const settings = getSettings();
  settings.apiKey = '';
  return saveSettings(settings);
}

/**
 * Validate API key format
 */
export function validateApiKey(apiKey) {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'API key is required' };
  }

  if (!apiKey.startsWith('sk-ant-')) {
    return { valid: false, error: 'API key must start with "sk-ant-"' };
  }

  if (apiKey.length < 20) {
    return { valid: false, error: 'API key appears to be too short' };
  }

  return { valid: true };
}

/**
 * Test API key by calling health check
 */
export async function testApiKey(apiKey) {
  try {
    // Note: This would need backend support to test with specific key
    // For now, just validate format
    const validation = validateApiKey(apiKey);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // In a real implementation, you'd call a backend endpoint
    // that tests the key without storing it
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

#### Step 4: Create SettingsView

**File:** `src/views/SettingsView.js` (NEW)

```javascript
// src/views/SettingsView.js

import {
  getSettings,
  saveSettings,
  validateApiKey,
  testApiKey,
  clearApiKey
} from '../utils/settings.js';

export default class SettingsView {
  constructor() {
    this.settings = getSettings();
    this.showApiKey = false;
  }

  render() {
    return (`
      <div class="min-h-screen bg-background-light dark:bg-background-dark pb-20">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary to-secondary text-white p-6">
          <div class="flex items-center gap-4">
            <a href="#/" class="material-symbols-outlined text-2xl">arrow_back</a>
            <h1 class="text-2xl font-bold">Settings</h1>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- API Key Section -->
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 class="text-xl font-bold text-text-light dark:text-text-dark mb-4">
              API Configuration
            </h2>

            <div class="space-y-4">
              <!-- API Key Input -->
              <div>
                <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Anthropic API Key
                </label>
                <div class="relative">
                  <input
                    type="${this.showApiKey ? 'text' : 'password'}"
                    id="apiKeyInput"
                    value="${this.settings.apiKey}"
                    placeholder="sk-ant-your-key-here"
                    class="w-full px-4 py-2 pr-24 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-text-light dark:text-text-dark"
                  />
                  <button
                    id="toggleApiKeyBtn"
                    class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-primary hover:text-primary-dark"
                  >
                    ${this.showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p class="text-xs text-subtext-light dark:text-subtext-dark mt-1">
                  Get your API key from <a href="https://console.anthropic.com/" target="_blank" class="text-primary hover:underline">Anthropic Console</a>
                </p>
                <p id="apiKeyError" class="text-xs text-error mt-1 hidden"></p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2">
                <button
                  id="saveApiKeyBtn"
                  class="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  id="testApiKeyBtn"
                  class="flex-1 bg-secondary hover:bg-secondary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Test Connection
                </button>
                <button
                  id="clearApiKeyBtn"
                  class="px-4 py-2 border border-error text-error hover:bg-error hover:text-white rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>

              <p id="apiKeySuccess" class="text-xs text-success hidden"></p>
            </div>
          </div>

          <!-- Preferences Section -->
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 class="text-xl font-bold text-text-light dark:text-text-dark mb-4">
              Preferences
            </h2>

            <div class="space-y-4">
              <!-- Default Grade Level -->
              <div>
                <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Default Grade Level
                </label>
                <select
                  id="gradeLevelSelect"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-text-light dark:text-text-dark"
                >
                  <option value="elementary school" ${this.settings.defaultGradeLevel === 'elementary school' ? 'selected' : ''}>Elementary School</option>
                  <option value="middle school" ${this.settings.defaultGradeLevel === 'middle school' ? 'selected' : ''}>Middle School</option>
                  <option value="high school" ${this.settings.defaultGradeLevel === 'high school' ? 'selected' : ''}>High School</option>
                  <option value="college" ${this.settings.defaultGradeLevel === 'college' ? 'selected' : ''}>College</option>
                </select>
              </div>

              <!-- Questions Per Quiz -->
              <div>
                <label class="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Questions Per Quiz
                </label>
                <select
                  id="questionsSelect"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-text-light dark:text-text-dark"
                >
                  <option value="5" ${this.settings.questionsPerQuiz === 5 ? 'selected' : ''}>5 Questions</option>
                  <option value="10" ${this.settings.questionsPerQuiz === 10 ? 'selected' : ''}>10 Questions</option>
                  <option value="15" ${this.settings.questionsPerQuiz === 15 ? 'selected' : ''}>15 Questions</option>
                </select>
              </div>

              <button
                id="savePreferencesBtn"
                class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>

          <!-- About Section -->
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 class="text-xl font-bold text-text-light dark:text-text-dark mb-4">
              About
            </h2>

            <div class="space-y-2 text-sm text-subtext-light dark:text-subtext-dark">
              <div class="flex justify-between">
                <span>Version</span>
                <span class="font-medium">2.0.0</span>
              </div>
              <div class="flex justify-between">
                <span>Last Updated</span>
                <span class="font-medium">November 2025</span>
              </div>
              <div class="border-t border-gray-200 dark:border-gray-700 my-4"></div>
              <p class="text-xs">
                Built with <a href="https://www.anthropic.com/claude" target="_blank" class="text-primary hover:underline">Claude</a> by Anthropic
              </p>
              <p class="text-xs">
                Created using <a href="https://claude.com/claude-code" target="_blank" class="text-primary hover:underline">Claude Code</a>
              </p>
              <p class="text-xs">
                <a href="https://github.com/vitorsilva/demo-pwa-app" target="_blank" class="text-primary hover:underline">View on GitHub</a>
              </p>
            </div>
          </div>
        </div>

        <!-- Bottom Navigation -->
        ${this.renderBottomNav()}
      </div>
    `);
  }

  renderBottomNav() {
    return `
      <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-around items-center h-full max-w-lg mx-auto px-4">
          <a class="flex flex-col items-center justify-center text-subtext-light dark:text-subtext-dark hover:text-primary gap-1" href="#/">
            <span class="material-symbols-outlined text-2xl">home</span>
            <span class="text-xs font-medium">Home</span>
          </a>
          <a class="flex flex-col items-center justify-center text-primary gap-1" href="#/settings">
            <span class="material-symbols-outlined text-2xl fill">settings</span>
            <span class="text-xs font-bold">Settings</span>
          </a>
        </div>
      </div>
    `;
  }

  attachListeners() {
    // Toggle API key visibility
    document.getElementById('toggleApiKeyBtn')?.addEventListener('click', () => {
      this.showApiKey = !this.showApiKey;
      const input = document.getElementById('apiKeyInput');
      input.type = this.showApiKey ? 'text' : 'password';
      document.getElementById('toggleApiKeyBtn').textContent = this.showApiKey ? 'Hide' : 'Show';
    });

    // Save API key
    document.getElementById('saveApiKeyBtn')?.addEventListener('click', async () => {
      await this.saveApiKey();
    });

    // Test API key
    document.getElementById('testApiKeyBtn')?.addEventListener('click', async () => {
      await this.testApiKeyConnection();
    });

    // Clear API key
    document.getElementById('clearApiKeyBtn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your API key?')) {
        this.clearApiKeyData();
      }
    });

    // Save preferences
    document.getElementById('savePreferencesBtn')?.addEventListener('click', () => {
      this.savePreferences();
    });
  }

  async saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    const apiKey = input.value.trim();
    const errorEl = document.getElementById('apiKeyError');
    const successEl = document.getElementById('apiKeySuccess');

    // Hide previous messages
    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');

    // Validate
    const validation = validateApiKey(apiKey);
    if (!validation.valid) {
      errorEl.textContent = validation.error;
      errorEl.classList.remove('hidden');
      return;
    }

    // Save
    this.settings.apiKey = apiKey;
    const saved = saveSettings(this.settings);

    if (saved) {
      successEl.textContent = 'API key saved successfully!';
      successEl.classList.remove('hidden');
    } else {
      errorEl.textContent = 'Failed to save API key';
      errorEl.classList.remove('hidden');
    }
  }

  async testApiKeyConnection() {
    const input = document.getElementById('apiKeyInput');
    const apiKey = input.value.trim();
    const errorEl = document.getElementById('apiKeyError');
    const successEl = document.getElementById('apiKeySuccess');

    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');

    if (!apiKey) {
      errorEl.textContent = 'Please enter an API key first';
      errorEl.classList.remove('hidden');
      return;
    }

    const result = await testApiKey(apiKey);
    if (result.success) {
      successEl.textContent = 'API key is valid!';
      successEl.classList.remove('hidden');
    } else {
      errorEl.textContent = result.error || 'API key test failed';
      errorEl.classList.remove('hidden');
    }
  }

  clearApiKeyData() {
    clearApiKey();
    this.settings.apiKey = '';
    document.getElementById('apiKeyInput').value = '';

    const successEl = document.getElementById('apiKeySuccess');
    successEl.textContent = 'API key cleared';
    successEl.classList.remove('hidden');
  }

  savePreferences() {
    const gradeLevel = document.getElementById('gradeLevelSelect').value;
    const questions = parseInt(document.getElementById('questionsSelect').value);

    this.settings.defaultGradeLevel = gradeLevel;
    this.settings.questionsPerQuiz = questions;

    const saved = saveSettings(this.settings);
    if (saved) {
      alert('Preferences saved successfully!');
    } else {
      alert('Failed to save preferences');
    }
  }
}
```

---

#### Step 5: Register SettingsView in Router

**File:** `src/main.js`

**Add import:**
```javascript
import SettingsView from './views/SettingsView.js';
```

**Register route:**
```javascript
async function init() {
  try {
    await initDatabase();
    console.log('✅ Database initialized');

    // Register routes
    router.addRoute('/', HomeView);
    router.addRoute('/topic-input', TopicInputView);
    router.addRoute('/quiz', QuizView);
    router.addRoute('/results', ResultsView);
    router.addRoute('/settings', SettingsView); // NEW

    // Start the router
    router.init();
    console.log('✅ Router initialized');

    // Initialize network status monitoring
    initNetworkMonitoring();

  } catch (error) {
    console.error('❌ Initialization failed:', error);
  }
}
```

---

### Part 5: Navigation Updates

#### Step 6: Update All Views' Bottom Navigation

**Files to update:**
- `src/views/TopicInputView.js`
- `src/views/QuizView.js`
- `src/views/ResultsView.js`

**Replace `renderBottomNav()` in all views:**
```javascript
renderBottomNav() {
  return `
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-around items-center h-full max-w-lg mx-auto px-4">
        <a class="flex flex-col items-center justify-center text-subtext-light dark:text-subtext-dark hover:text-primary gap-1" href="#/">
          <span class="material-symbols-outlined text-2xl">home</span>
          <span class="text-xs font-medium">Home</span>
        </a>
        <a class="flex flex-col items-center justify-center text-subtext-light dark:text-subtext-dark hover:text-primary gap-1" href="#/settings">
          <span class="material-symbols-outlined text-2xl">settings</span>
          <span class="text-xs font-medium">Settings</span>
        </a>
      </div>
    </div>
  `;
}
```

**Note:** Removed "Topics" link (unused functionality)

---

## Testing

### Test Dynamic Home Page

1. **With no quizzes:**
   - Fresh install or clear IndexedDB
   - Home should show empty state
   - Statistics should all be 0

2. **With quizzes:**
   - Complete 2-3 quizzes
   - Home should show recent quizzes
   - Statistics should reflect actual data

3. **Data accuracy:**
   - Verify scores match what you got
   - Check dates are recent
   - Ensure topics display correctly

### Test Settings Page

1. **API Key:**
   - Try saving invalid key (should show error)
   - Save valid key format (should succeed)
   - Toggle show/hide (should work)
   - Clear key (should empty field)

2. **Preferences:**
   - Change grade level
   - Change questions per quiz
   - Save (should persist after refresh)

3. **Navigation:**
   - Home → Settings → Home (should work)
   - Settings icon should highlight when active

---

## Testing and Deployment

**IMPORTANT:** Always test UI changes and verify deployment!

### Update Unit Tests

**File:** `tests/unit/settings.test.js` (NEW)

**Test Settings Management:**
```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { saveSettings, loadSettings, validateAPIKey } from '../../src/utils/settings.js';

describe('Settings Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should save and load settings', () => {
    const settings = {
      apiKey: 'sk-ant-test123',
      gradeLevel: '5th Grade',
      questionsPerQuiz: 10
    };

    saveSettings(settings);
    const loaded = loadSettings();

    expect(loaded).toEqual(settings);
  });

  it('should validate API key format', () => {
    expect(validateAPIKey('sk-ant-validkey')).toBe(true);
    expect(validateAPIKey('invalid-key')).toBe(false);
    expect(validateAPIKey('')).toBe(false);
    expect(validateAPIKey(null)).toBe(false);
  });

  it('should return default settings when none saved', () => {
    const settings = loadSettings();
    expect(settings).toHaveProperty('gradeLevel');
    expect(settings).toHaveProperty('questionsPerQuiz');
  });
});
```

**File:** `tests/unit/HomeView.test.js` (UPDATE)

**Test Dynamic Home Page:**
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '../../tests/helpers/render.js';
import HomeView from '../../src/views/HomeView.js';
import * as db from '../../src/db/db.js';

describe('HomeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display quiz history from IndexedDB', async () => {
    const mockSessions = [
      { id: 1, topic: 'Math', score: 80, totalQuestions: 5, date: new Date() },
      { id: 2, topic: 'Science', score: 100, totalQuestions: 5, date: new Date() }
    ];

    vi.spyOn(db, 'getRecentSessions').mockResolvedValue(mockSessions);

    const view = new HomeView();
    await view.render();

    expect(db.getRecentSessions).toHaveBeenCalled();
    expect(view.el.innerHTML).toContain('Math');
    expect(view.el.innerHTML).toContain('Science');
    expect(view.el.innerHTML).toContain('80%');
    expect(view.el.innerHTML).toContain('100%');
  });

  it('should show empty state when no quizzes exist', async () => {
    vi.spyOn(db, 'getRecentSessions').mockResolvedValue([]);

    const view = new HomeView();
    await view.render();

    expect(view.el.innerHTML).toContain('No quizzes yet');
  });

  it('should calculate average score correctly', async () => {
    const mockSessions = [
      { score: 80, totalQuestions: 5 },
      { score: 60, totalQuestions: 5 },
      { score: 100, totalQuestions: 5 }
    ];

    vi.spyOn(db, 'getRecentSessions').mockResolvedValue(mockSessions);

    const view = new HomeView();
    await view.render();

    // Average: (80 + 60 + 100) / 3 = 80%
    expect(view.el.innerHTML).toMatch(/80%|Average.*80/i);
  });
});
```

**Run tests:**
```bash
npm test -- settings.test.js
npm test -- HomeView.test.js
```

### Update E2E Tests

**File:** `tests/e2e/settings.spec.js` (NEW)

**Test Settings Page:**
```javascript
import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.click('a[href="#/settings"]');
    await expect(page).toHaveURL(/#\/settings/);
    await expect(page.locator('h2')).toContainText('Settings');
  });

  test('should save and persist API key', async ({ page }) => {
    await page.goto('/#/settings');

    // Enter API key
    await page.fill('input[type="password"]', 'sk-ant-test123');

    // Save
    await page.click('button:has-text("Save")');

    // Reload page
    await page.reload();
    await page.goto('/#/settings');

    // Should still have saved value
    const value = await page.inputValue('input[type="password"]');
    expect(value).toBe('sk-ant-test123');
  });

  test('should validate API key format', async ({ page }) => {
    await page.goto('/#/settings');

    // Enter invalid key
    await page.fill('input[type="password"]', 'invalid-key');
    await page.click('button:has-text("Save")');

    // Should show error
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('must start with sk-ant-');
  });

  test('should toggle API key visibility', async ({ page }) => {
    await page.goto('/#/settings');

    const input = page.locator('input[placeholder*="API"]');

    // Should start as password
    await expect(input).toHaveAttribute('type', 'password');

    // Click show/hide toggle
    await page.click('button:has-text("Show")');

    // Should now be text
    await expect(input).toHaveAttribute('type', 'text');
  });

  test('should save preferences', async ({ page }) => {
    await page.goto('/#/settings');

    // Change grade level
    await page.selectOption('select[name="gradeLevel"]', 'High School');

    // Change questions per quiz
    await page.selectOption('select[name="questionsPerQuiz"]', '10');

    // Save
    await page.click('button:has-text("Save")');

    // Reload
    await page.reload();
    await page.goto('/#/settings');

    // Should persist
    await expect(page.locator('select[name="gradeLevel"]')).toHaveValue('High School');
    await expect(page.locator('select[name="questionsPerQuiz"]')).toHaveValue('10');
  });
});

test.describe('Home Page Dynamic Content', () => {
  test('should show empty state with no quizzes', async ({ page }) => {
    // Clear IndexedDB
    await page.goto('/');
    await page.evaluate(() => {
      indexedDB.deleteDatabase('QuizMasterDB');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=No quizzes yet')).toBeVisible();
    await expect(page.locator('button:has-text("Start New Quiz")')).toBeVisible();
  });

  test('should display quiz history', async ({ page }) => {
    // Create a quiz first
    await page.goto('/');
    await page.click('button:has-text("Start New Quiz")');

    // Mock API and complete quiz
    // ... (create and complete a quiz)

    // Go back to home
    await page.click('a[href="#/"]');

    // Should show quiz in history
    await expect(page.locator('.quiz-history')).toBeVisible();
    await expect(page.locator('.quiz-card')).toHaveCount(1);
  });

  test('should navigate between home and settings', async ({ page }) => {
    await page.goto('/');

    // Go to settings
    await page.click('a[href="#/settings"]');
    await expect(page.locator('h2')).toContainText('Settings');

    // Go back to home
    await page.click('a[href="#/"]');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

**Run tests:**
```bash
npm run test:e2e -- settings
```

### Deployment Verification

**1. Local Development:**
```bash
npm run dev

# Test:
# - Home page shows "No quizzes yet" (empty state)
# - Settings page loads
# - Can save settings
# - Navigation works
# - All tests pass
```

**2. Production Build:**
```bash
npm run build
npm run preview

# Test:
# - Home page displays correctly
# - Settings persist across reloads
# - API key validation works
# - Responsive on mobile (resize browser)
```

**3. GitHub Deployment:**
```bash
git add .
git commit -m "feat: add loading screen, multi-language support, dynamic home page and settings"
git push origin main

# Verify:
# - CI/CD passes
# - Deployment succeeds
# - Production site works
```

**4. Production Verification:**

Visit: `https://your-app.netlify.app`

**Checklist:**
1. ✅ Loading screen appears when generating quiz
2. ✅ Loading screen shows topic name and animations
3. ✅ Questions generated in same language as topic (test with Portuguese: "Sistema Digestivo")
4. ✅ Home page loads (empty state initially)
5. ✅ Navigation to settings works
6. ✅ Can save API key
7. ✅ Can save preferences
8. ✅ Settings persist after reload
9. ✅ Create a quiz
10. ✅ Return to home → quiz appears in history
11. ✅ Statistics calculated correctly
12. ✅ Mobile responsive
13. ✅ No console errors

---

## Success Criteria

**Phase 3 is complete when:**

**Loading Screen (Part 1):**
- ✅ Loading screen displays during quiz generation
- ✅ Loading screen shows topic name, grade level, and animations
- ✅ Cancel button works and returns to topic input
- ✅ Error handling shows alert and redirects on failure
- ✅ No more blank screen during generation

**Multi-Language Support (Part 2):**
- ✅ Questions generated in same language as topic
- ✅ All 4 answer options in same language as question
- ✅ Explanations generated in same language as question
- ✅ Works for English, Portuguese, Spanish, French (tested)

**Dynamic Home Page (Part 3):**
- ✅ Home page displays real quiz history from IndexedDB
- ✅ Empty state shown when no quizzes exist
- ✅ Statistics calculated and displayed correctly

**Settings Page (Part 4):**
- ✅ Settings page created and accessible
- ✅ API key input with show/hide works
- ✅ API key validation implemented
- ✅ Settings persist in localStorage
- ✅ Preferences section functional
- ✅ About section displays version info

**Navigation (Part 5):**
- ✅ Navigation simplified (Home, Settings only)
- ✅ All views updated with new navigation
- ✅ Responsive on mobile and desktop
- ✅ Form validation provides clear feedback

---

## Next Steps

**After completing Phase 3:**
- ✅ Loading screen for quiz generation (no more blank screens)
- ✅ Multi-language question generation
- ✅ Professional UI with dynamic data
- ✅ Easy settings management
- ✅ Clean navigation

**Move to Phase 3.5:**
- Branding & Identity
- Choose final app name
- Design custom icon
- Remove "demo-pwa-app" references
- Define visual identity

**Then Phase 4:**
- Observability & Telemetry
- Structured logging
- Error tracking
- Performance monitoring

---

**Related Documentation:**
- Epic 3 Plan: `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md`
- Phase 1 (Backend): `docs/epic03_quizmaster_v2/PHASE1_BACKEND.md`
- Phase 2 (Offline): `docs/epic03_quizmaster_v2/PHASE2_OFFLINE.md`
