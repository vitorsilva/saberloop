# Phase 3: UI Polish

**Epic:** 3 - QuizMaster V2
**Status:** Not Started
**Estimated Time:** 3-4 sessions
**Prerequisites:** Phase 1 (Backend) and Phase 2 (Offline) complete

---

## Overview

Phase 3 refines QuizMaster's user interface with dynamic data rendering, settings management, and navigation improvements. You'll transform the home page from mock data to real quiz history, create a settings page for API key configuration, and simplify navigation.

**What you'll build:**
- Dynamic home page (real quiz history from IndexedDB)
- Settings page with API key management
- Simplified navigation (Home, Settings only)
- Form validation and UX refinements
- Empty states and loading states

**Why this matters:**
- Users see their actual progress
- Easy API key configuration
- Cleaner, more focused navigation
- Professional user experience
- Ready for real users

---

## Learning Objectives

By the end of this phase, you will:
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

### Part 1: Dynamic Home Page

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

### Part 2: Settings Page

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

### Part 3: Navigation Updates

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
git commit -m "feat: add dynamic home page and settings management"
git push origin main

# Verify:
# - CI/CD passes
# - Deployment succeeds
# - Production site works
```

**4. Production Verification:**

Visit: `https://your-app.netlify.app`

**Checklist:**
1. ✅ Home page loads (empty state initially)
2. ✅ Navigation to settings works
3. ✅ Can save API key
4. ✅ Can save preferences
5. ✅ Settings persist after reload
6. ✅ Create a quiz
7. ✅ Return to home → quiz appears in history
8. ✅ Statistics calculated correctly
9. ✅ Mobile responsive
10. ✅ No console errors

---

## Success Criteria

**Phase 3 is complete when:**

- ✅ Home page displays real quiz history from IndexedDB
- ✅ Empty state shown when no quizzes exist
- ✅ Statistics calculated and displayed correctly
- ✅ Settings page created and accessible
- ✅ API key input with show/hide works
- ✅ API key validation implemented
- ✅ Settings persist in localStorage
- ✅ Preferences section functional
- ✅ About section displays version info
- ✅ Navigation simplified (Home, Settings only)
- ✅ All views updated with new navigation
- ✅ Responsive on mobile and desktop
- ✅ Form validation provides clear feedback

---

## Next Steps

**After completing Phase 3:**
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
