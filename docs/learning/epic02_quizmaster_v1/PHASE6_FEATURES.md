# Phase 6: Implementing Core Features

**Goal**: Build all the quiz functionality - question display, answer handling, results, history, and settings.

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Build interactive quiz UI with multiple-choice questions
- ✅ Handle user input and validate answers
- ✅ Calculate and display results
- ✅ Save quiz sessions to IndexedDB
- ✅ Display quiz history
- ✅ Implement settings management
- ✅ Handle edge cases and errors

---

## 6.1 Overview of Features

### Phase 6 Builds 5 Main Views:

1. **HomeView** - Topic input and navigation
2. **QuizView** - Interactive quiz with 5 questions
3. **ResultsView** - Score, breakdown, explanations
4. **HistoryView** - Past quiz sessions
5. **SettingsView** - API key and preferences

**User Flow:**
```
Home → Enter topic → Quiz (Q1-Q5) → Results → Home/History
                                         ↓
                                    Save to IndexedDB
```

---

## 6.2 HomeView Implementation

### Features

- Welcome message
- Topic input field
- Grade level selector
- Start quiz button
- Navigation to History and Settings

### Implementation

```javascript
// views/HomeView.js

import BaseView from './BaseView.js';
import state from '../state.js';

export default class HomeView extends BaseView {
  render() {
    const html = `
      <div class="home-view">
        <header>
          <h1>🎓 QuizMaster</h1>
          <p class="tagline">Test your knowledge on any topic!</p>
        </header>

        <main>
          <div class="topic-input-section">
            <label for="topicInput">What do you want to practice?</label>
            <input
              type="text"
              id="topicInput"
              placeholder="e.g., Photosynthesis, Fractions, World War II"
              autocomplete="off"
            >
          </div>

          <div class="grade-level-section">
            <label for="gradeLevelSelect">Grade Level</label>
            <select id="gradeLevelSelect">
              <option value="Elementary">Elementary</option>
              <option value="Middle School" selected>Middle School</option>
              <option value="High School">High School</option>
              <option value="College">College</option>
            </select>
          </div>

          <button id="startQuizBtn" class="primary-btn">Start Quiz</button>
        </main>

        <nav class="bottom-nav">
          <a href="#/history" class="nav-link">📊 History</a>
          <a href="#/settings" class="nav-link">⚙️ Settings</a>
        </nav>
      </div>
    `;

    this.setHTML(html);
    this.attachListeners();
  }

  attachListeners() {
    const startBtn = this.querySelector('#startQuizBtn');
    const topicInput = this.querySelector('#topicInput');
    const gradeSelect = this.querySelector('#gradeLevelSelect');

    startBtn.addEventListener('click', () => {
      const topic = topicInput.value.trim();
      const gradeLevel = gradeSelect.value;

      if (!topic) {
        alert('Please enter a topic');
        return;
      }

      // Save to state
      state.update({
        currentTopic: topic,
        currentGradeLevel: gradeLevel,
        currentAnswers: [],
        currentQuestionIndex: 0
      });

      // Navigate to quiz
      this.navigateTo('/quiz');
    });

    // Allow Enter key to start quiz
    topicInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        startBtn.click();
      }
    });
  }
}
```

---

## 6.3 QuizView Implementation

### Features

- Display one question at a time
- Show 4 multiple-choice options
- Progress indicator (Question 1 of 5)
- Next/Submit button
- Highlight selected answer
- Loading state while generating questions

### State to Track

```javascript
{
  currentTopic: "Fractions",
  currentGradeLevel: "5th Grade",
  currentQuestions: [/* array of 5 questions */],
  currentQuestionIndex: 0,        // Which question (0-4)
  currentAnswers: []              // User's answers
}
```

### Implementation

```javascript
// views/QuizView.js

import BaseView from './BaseView.js';
import state from '../state.js';
import { generateQuestions } from '../api/api.mock.js';

export default class QuizView extends BaseView {
  async render() {
    const topic = state.get('currentTopic');
    const gradeLevel = state.get('currentGradeLevel');

    // Show loading
    this.setHTML(`
      <div class="loading-view">
        <div class="spinner"></div>
        <p>Generating questions about ${topic}...</p>
      </div>
    `);

    try {
      // Check if questions already loaded (back navigation)
      let questions = state.get('currentQuestions');

      if (!questions) {
        // Generate new questions
        questions = await generateQuestions(topic, gradeLevel);
        state.set('currentQuestions', questions);
        state.set('currentAnswers', []);
        state.set('currentQuestionIndex', 0);
      }

      // Render first question
      this.renderQuestion();

    } catch (error) {
      console.error('Failed to generate questions:', error);
      this.setHTML(`
        <div class="error-view">
          <h2>Oops! Something went wrong</h2>
          <p>${error.message}</p>
          <button onclick="window.location.hash = '/'">Go Home</button>
        </div>
      `);
    }
  }

  renderQuestion() {
    const questions = state.get('currentQuestions');
    const questionIndex = state.get('currentQuestionIndex');
    const answers = state.get('currentAnswers');
    const question = questions[questionIndex];

    const html = `
      <div class="quiz-view">
        <header class="quiz-header">
          <div class="progress">
            <span class="progress-text">Question ${questionIndex + 1} of ${questions.length}</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${((questionIndex + 1) / questions.length) * 100}%"></div>
            </div>
          </div>
        </header>

        <main class="quiz-content">
          <h2 class="question-text">${question.question}</h2>

          <div class="options">
            ${question.options.map((option, index) => `
              <button
                class="option-btn ${answers[questionIndex] === option[0] ? 'selected' : ''}"
                data-answer="${option[0]}"
              >
                ${option}
              </button>
            `).join('')}
          </div>
        </main>

        <footer class="quiz-footer">
          <button
            id="nextBtn"
            class="primary-btn"
            ${!answers[questionIndex] ? 'disabled' : ''}
          >
            ${questionIndex === questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </footer>
      </div>
    `;

    this.setHTML(html);
    this.attachListeners();
  }

  attachListeners() {
    const optionBtns = this.appContainer.querySelectorAll('.option-btn');
    const nextBtn = this.querySelector('#nextBtn');

    // Handle option selection
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove previous selection
        optionBtns.forEach(b => b.classList.remove('selected'));

        // Mark as selected
        btn.classList.add('selected');

        // Save answer
        const answer = btn.dataset.answer;
        const questionIndex = state.get('currentQuestionIndex');
        const answers = state.get('currentAnswers');
        answers[questionIndex] = answer;
        state.set('currentAnswers', answers);

        // Enable next button
        nextBtn.disabled = false;
      });
    });

    // Handle next/submit
    nextBtn.addEventListener('click', () => {
      const questions = state.get('currentQuestions');
      const questionIndex = state.get('currentQuestionIndex');

      if (questionIndex < questions.length - 1) {
        // Go to next question
        state.set('currentQuestionIndex', questionIndex + 1);
        this.renderQuestion();
      } else {
        // Submit quiz
        this.submitQuiz();
      }
    });
  }

  async submitQuiz() {
    const topic = state.get('currentTopic');
    const gradeLevel = state.get('currentGradeLevel');
    const questions = state.get('currentQuestions');
    const answers = state.get('currentAnswers');

    // Calculate score
    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) {
        correct++;
      }
    });

    // Save session to IndexedDB
    const { saveSession, saveTopic } = await import('../db/db.js');

    const session = {
      topicId: topic.toLowerCase().replace(/\s+/g, '-'),
      timestamp: Date.now(),
      score: correct,
      totalQuestions: questions.length,
      gradeLevel: gradeLevel,
      questions: questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correct,
        userAnswer: answers[index],
        isCorrect: answers[index] === q.correct,
        explanation: null  // Will generate on results page if wrong
      }))
    };

    const sessionId = await saveSession(session);
    state.set('lastSessionId', sessionId);

    // Update topic stats
    await saveTopic({
      id: session.topicId,
      name: topic,
      gradeLevel: gradeLevel,
      createdAt: Date.now(),
      lastPracticed: Date.now(),
      totalQuestions: questions.length,
      correctAnswers: correct
    });

    // Navigate to results
    this.navigateTo('/results');
  }
}
```

---

## 6.4 ResultsView Implementation

### Features

- Display score (e.g., "4 out of 5 correct")
- Visual progress (circular or bar)
- List of questions with correct/incorrect indicator
- Generate explanations for wrong answers
- Buttons: "Try Again", "Go Home", "View History"

### Implementation

```javascript
// views/ResultsView.js

import BaseView from './BaseView.js';
import state from '../state.js';
import { getSession } from '../db/db.js';
import { generateExplanation } from '../api/api.mock.js';

export default class ResultsView extends BaseView {
  async render() {
    const sessionId = state.get('lastSessionId');

    // Show loading
    this.setHTML(`<div class="loading-view"><div class="spinner"></div></div>`);

    // Load session from database
    const session = await getSession(sessionId);

    // Generate explanations for wrong answers
    await this.generateExplanations(session);

    // Render results
    this.renderResults(session);
  }

  async generateExplanations(session) {
    // Find wrong answers
    const wrongQuestions = session.questions.filter(q => !q.isCorrect);

    // Generate explanations (in parallel)
    const explanationPromises = wrongQuestions.map(q =>
      generateExplanation(
        q.question,
        q.userAnswer,
        q.correctAnswer,
        session.gradeLevel
      )
    );

    const explanations = await Promise.all(explanationPromises);

    // Attach to questions
    wrongQuestions.forEach((q, index) => {
      q.explanation = explanations[index];
    });
  }

  renderResults(session) {
    const percentage = Math.round((session.score / session.totalQuestions) * 100);
    const passed = percentage >= 70;

    const html = `
      <div class="results-view">
        <header class="results-header">
          <h1>Quiz Complete!</h1>
          <div class="score-display ${passed ? 'passed' : 'failed'}">
            <div class="score-circle">
              <span class="score-number">${percentage}%</span>
              <span class="score-text">${session.score} of ${session.totalQuestions} correct</span>
            </div>
          </div>
          <p class="results-message">
            ${passed ? '🎉 Great job!' : '💪 Keep practicing!'}
          </p>
        </header>

        <main class="results-content">
          <h2>Question Review</h2>
          <div class="questions-review">
            ${session.questions.map((q, index) => `
              <div class="question-card ${q.isCorrect ? 'correct' : 'incorrect'}">
                <div class="question-header">
                  <span class="question-number">Question ${index + 1}</span>
                  <span class="result-icon">${q.isCorrect ? '✓' : '✗'}</span>
                </div>
                <p class="question-text">${q.question}</p>

                <div class="answer-info">
                  <p><strong>Your answer:</strong> ${q.userAnswer}</p>
                  ${!q.isCorrect ? `<p><strong>Correct answer:</strong> ${q.correctAnswer}</p>` : ''}
                </div>

                ${!q.isCorrect && q.explanation ? `
                  <div class="explanation">
                    <h4>Explanation:</h4>
                    <p>${q.explanation}</p>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </main>

        <footer class="results-footer">
          <button class="secondary-btn" onclick="window.location.hash = '/'">
            🏠 Go Home
          </button>
          <button class="primary-btn" onclick="window.location.hash = '/history'">
            📊 View History
          </button>
        </footer>
      </div>
    `;

    this.setHTML(html);
  }
}
```

---

## 6.5 HistoryView Implementation

### Features

- List all past quiz sessions
- Group by topic or show chronologically
- Display: topic, date, score, grade level
- Click to view detailed results
- Clear history option

### Implementation

```javascript
// views/HistoryView.js

import BaseView from './BaseView.js';
import { getRecentSessions, clearAllSessions } from '../db/db.js';

export default class HistoryView extends BaseView {
  async render() {
    // Show loading
    this.setHTML(`<div class="loading-view"><div class="spinner"></div></div>`);

    // Load sessions
    const sessions = await getRecentSessions(20);  // Last 20 sessions

    if (sessions.length === 0) {
      this.renderEmpty();
    } else {
      this.renderHistory(sessions);
    }
  }

  renderEmpty() {
    this.setHTML(`
      <div class="history-view empty">
        <h1>Quiz History</h1>
        <div class="empty-state">
          <p>📚</p>
          <p>No quiz history yet.</p>
          <p>Take your first quiz to see results here!</p>
          <button class="primary-btn" onclick="window.location.hash = '/'">
            Start a Quiz
          </button>
        </div>
      </div>
    `);
  }

  renderHistory(sessions) {
    const html = `
      <div class="history-view">
        <header class="history-header">
          <h1>Quiz History</h1>
          <button id="clearHistoryBtn" class="danger-btn">Clear History</button>
        </header>

        <main class="history-content">
          <div class="sessions-list">
            ${sessions.map(session => {
              const date = new Date(session.timestamp).toLocaleDateString();
              const percentage = Math.round((session.score / session.totalQuestions) * 100);

              return `
                <div class="session-card" data-session-id="${session.id}">
                  <div class="session-info">
                    <h3>${session.topicId.replace(/-/g, ' ')}</h3>
                    <p class="session-meta">
                      ${date} • ${session.gradeLevel}
                    </p>
                  </div>
                  <div class="session-score ${percentage >= 70 ? 'passed' : 'failed'}">
                    <span class="score-value">${percentage}%</span>
                    <span class="score-detail">${session.score}/${session.totalQuestions}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </main>

        <footer class="history-footer">
          <button class="secondary-btn" onclick="window.location.hash = '/'">
            🏠 Go Home
          </button>
        </footer>
      </div>
    `;

    this.setHTML(html);
    this.attachListeners();
  }

  attachListeners() {
    const clearBtn = this.querySelector('#clearHistoryBtn');
    const sessionCards = this.appContainer.querySelectorAll('.session-card');

    // Clear history
    clearBtn?.addEventListener('click', async () => {
      if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
        await clearAllSessions();
        this.render();  // Re-render
      }
    });

    // View session details (future enhancement)
    sessionCards.forEach(card => {
      card.addEventListener('click', () => {
        const sessionId = parseInt(card.dataset.sessionId);
        // TODO: Navigate to session detail view
        console.log('View session:', sessionId);
      });
    });
  }
}
```

---

## 6.6 SettingsView Implementation

### Features

- API key input (for Phase 11)
- Grade level default
- Theme toggle (future)
- About section

### Implementation

```javascript
// views/SettingsView.js

import BaseView from './BaseView.js';
import { getSetting, saveSetting } from '../db/db.js';

export default class SettingsView extends BaseView {
  async render() {
    // Load current settings
    const apiKey = await getSetting('apiKey') || '';
    const defaultGrade = await getSetting('defaultGradeLevel') || 'Middle School';

    const html = `
      <div class="settings-view">
        <header class="settings-header">
          <h1>⚙️ Settings</h1>
        </header>

        <main class="settings-content">
          <section class="setting-section">
            <h2>API Configuration</h2>
            <p class="help-text">
              QuizMaster uses the Anthropic Claude API to generate questions.
              Your API key is stored locally and never sent to any server except Anthropic.
            </p>
            <label for="apiKeyInput">Anthropic API Key</label>
            <input
              type="password"
              id="apiKeyInput"
              placeholder="sk-ant-..."
              value="${apiKey}"
            >
            <p class="help-text">
              <small>Get your key at <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a></small>
            </p>
          </section>

          <section class="setting-section">
            <h2>Preferences</h2>
            <label for="gradeSelect">Default Grade Level</label>
            <select id="gradeSelect">
              <option value="Elementary" ${defaultGrade === 'Elementary' ? 'selected' : ''}>Elementary</option>
              <option value="Middle School" ${defaultGrade === 'Middle School' ? 'selected' : ''}>Middle School</option>
              <option value="High School" ${defaultGrade === 'High School' ? 'selected' : ''}>High School</option>
              <option value="College" ${defaultGrade === 'College' ? 'selected' : ''}>College</option>
            </select>
          </section>

          <section class="setting-section">
            <h2>About</h2>
            <p>QuizMaster V1</p>
            <p><small>Built with vanilla JavaScript, IndexedDB, and Claude AI</small></p>
          </section>
        </main>

        <footer class="settings-footer">
          <button class="secondary-btn" onclick="window.location.hash = '/'">Cancel</button>
          <button id="saveBtn" class="primary-btn">Save Settings</button>
        </footer>
      </div>
    `;

    this.setHTML(html);
    this.attachListeners();
  }

  attachListeners() {
    const saveBtn = this.querySelector('#saveBtn');
    const apiKeyInput = this.querySelector('#apiKeyInput');
    const gradeSelect = this.querySelector('#gradeSelect');

    saveBtn.addEventListener('click', async () => {
      const apiKey = apiKeyInput.value.trim();
      const gradeLevel = gradeSelect.value;

      // Save to IndexedDB
      await saveSetting('apiKey', apiKey);
      await saveSetting('defaultGradeLevel', gradeLevel);

      // Show confirmation
      saveBtn.textContent = '✓ Saved!';
      setTimeout(() => {
        saveBtn.textContent = 'Save Settings';
      }, 2000);
    });
  }
}
```

---

## 6.7 Error Handling

### Common Scenarios

1. **No topic entered** → Show alert
2. **Question generation fails** → Show error view with retry
3. **Database error** → Show error message
4. **Empty history** → Show empty state

### Error View Pattern

```javascript
showError(message) {
  this.setHTML(`
    <div class="error-view">
      <h2>😕 Oops!</h2>
      <p>${message}</p>
      <button class="primary-btn" onclick="window.location.hash = '/'">
        Go Home
      </button>
    </div>
  `);
}
```

---

## 6.8 Styling Considerations

### CSS Structure

```css
/* Global styles */
* { box-sizing: border-box; }
body { font-family: system-ui; margin: 0; padding: 0; }
#app { min-height: 100vh; }

/* View containers */
.home-view, .quiz-view, .results-view, .history-view, .settings-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Components */
.primary-btn { background: #4F46E5; color: white; /* ... */ }
.secondary-btn { background: #E5E7EB; color: #374151; /* ... */ }
.danger-btn { background: #EF4444; color: white; /* ... */ }

/* States */
.loading-view { text-align: center; padding: 40px; }
.error-view { text-align: center; padding: 40px; color: #EF4444; }

/* Quiz specific */
.option-btn { /* ... */ }
.option-btn.selected { background: #4F46E5; color: white; }
.progress-bar { /* ... */ }

/* Results specific */
.score-circle { /* ... */ }
.question-card.correct { border-left: 4px solid #10B981; }
.question-card.incorrect { border-left: 4px solid #EF4444; }
```

---

## Checkpoint Questions

**Q1**: Why do we save the session to IndexedDB even though we already have it in state?

<details>
<summary>Answer</summary>

**State** is temporary (lost on page reload).
**IndexedDB** is persistent (survives reload).

We save to IndexedDB so users can:
- View history later
- See past sessions even after closing the browser
- Track progress over time
</details>

**Q2**: Why generate explanations on the ResultsView instead of during the quiz?

<details>
<summary>Answer</summary>

**UX reasons:**
- Faster quiz experience (no waiting during quiz)
- Only generate for wrong answers (saves API calls)
- User sees results immediately, explanations load progressively

**Technical:**
- Can show results while explanations load
- Parallel generation (faster)
</details>

**Q3**: How does the browser back button work with our SPA?

<details>
<summary>Answer</summary>

With hash routing:
1. Back button changes hash (e.g., `#/results` → `#/quiz`)
2. Browser fires `hashchange` event
3. Router catches event and renders previous view
4. Works automatically - no extra code needed!
</details>

---

## Hands-On Exercise

### Build All 5 Views

**Task**: Implement all quiz features using the examples above.

**Steps**:

1. **Create view files** in `src/views/`:
   - BaseView.js
   - HomeView.js
   - QuizView.js
   - ResultsView.js
   - HistoryView.js
   - SettingsView.js

2. **Register routes** in `main.js`:
```javascript
router.addRoute('/', HomeView);
router.addRoute('/quiz', QuizView);
router.addRoute('/results', ResultsView);
router.addRoute('/history', HistoryView);
router.addRoute('/settings', SettingsView);
```

3. **Test the flow**:
   - Enter topic → Start quiz
   - Answer questions → Submit
   - View results with explanations
   - Check history
   - Update settings

4. **Add styling** to make it look good

**Success Criteria**:
- ✅ Complete quiz flow works
- ✅ Answers are saved correctly
- ✅ Results display properly
- ✅ History shows past sessions
- ✅ Settings persist
- ✅ All navigation works
- ✅ Loading and error states work

---

## Next Steps

Once you've built all the features:

**"I'm ready for Phase 7"** → We'll make it a proper PWA (offline, installable)

**Need help?** → Ask Claude about any feature implementation

---

## Learning Notes

**Date Started**: ___________

**Code I Wrote**:
- [ ] HomeView
- [ ] QuizView
- [ ] ResultsView
- [ ] HistoryView
- [ ] SettingsView
- [ ] CSS styling

**Challenges Faced**:
-
-

**Date Completed**: ___________
