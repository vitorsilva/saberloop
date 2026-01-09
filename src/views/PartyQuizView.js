/**
 * Party Quiz View
 *
 * Quiz playing screen for party sessions.
 * Shows question with timer and live scoreboard.
 */

import BaseView from './BaseView.js';
import { t } from '../core/i18n.js';
import { createLiveScoreboard } from '../components/LiveScoreboard.js';
import { shuffleOptions } from '../utils/shuffle.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'PartyQuizView' });

export default class PartyQuizView extends BaseView {
  /**
   * @param {Object} options
   * @param {import('../services/party-session.js').PartySession} options.session - Party session
   */
  constructor(options = {}) {
    super();
    this.session = options.session;
    this.selectedAnswer = null;
    this.hasAnswered = false;
    this.timerInterval = null;
    this.shuffledOptions = null;
    this.shuffleMap = null; // Maps shuffled index to original index
  }

  async render() {
    if (!this.session || !this.session.quiz) {
      log.error('No session or quiz data');
      this.navigateTo('/');
      return;
    }

    const question = this.session.getCurrentQuestion();
    const questionIndex = this.session.currentQuestion;
    const totalQuestions = this.session.quiz.questions.length;

    // Shuffle options for this question
    this._shuffleCurrentQuestion(question);

    this.setHTML(`
      <div class="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
        <!-- Header with timer -->
        <div class="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark">
          <div class="text-text-light dark:text-text-dark text-sm font-medium">
            ${t('party.question', { current: questionIndex + 1, total: totalQuestions })}
          </div>
          <div id="timer" class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">timer</span>
            <span id="timerText" class="text-lg font-bold text-primary">--</span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="h-1 bg-gray-200 dark:bg-gray-700">
          <div id="progressBar" class="h-full bg-primary transition-all duration-100" style="width: 100%"></div>
        </div>

        <div class="flex-grow px-4 pb-24">
          <!-- Question -->
          <div class="py-6">
            <h2 id="questionText" class="text-text-light dark:text-text-dark text-xl font-bold leading-tight">
              ${question?.question || 'Loading...'}
            </h2>
          </div>

          <!-- Options -->
          <div id="optionsContainer" class="flex flex-col gap-3">
            ${this._renderOptions(question)}
          </div>

          <!-- Scoreboard (collapsed by default on mobile) -->
          <div class="mt-6">
            <button id="toggleScoreboardBtn" class="flex items-center gap-2 text-primary text-sm font-medium mb-2">
              <span class="material-symbols-outlined text-sm">leaderboard</span>
              ${t('party.liveScores')}
              <span id="toggleIcon" class="material-symbols-outlined text-sm">expand_more</span>
            </button>
            <div id="scoreboardContainer" class="hidden">
              <!-- Scoreboard will be inserted here -->
            </div>
          </div>
        </div>

        <!-- Status bar -->
        <div id="statusBar" class="fixed bottom-0 left-0 right-0 py-3 bg-primary text-white text-center text-sm">
          <span id="statusText">${t('party.waiting')}</span>
        </div>
      </div>
    `);

    this._renderScoreboard();
    this.attachListeners();
    this._startTimer();
    this._setupSessionCallbacks();
  }

  /**
   * Shuffle options for the current question.
   *
   * @private
   * @param {Object} question - Question object
   */
  _shuffleCurrentQuestion(question) {
    if (!question) return;

    const result = shuffleOptions(question.options, question.correct);
    this.shuffledOptions = result.shuffledOptions;
    this.shuffleMap = result.shuffleMap;
  }

  /**
   * Render answer options.
   *
   * @private
   * @param {Object} question - Question object
   * @returns {string} HTML string
   */
  _renderOptions(question) {
    if (!question || !this.shuffledOptions) return '';

    const labels = ['A', 'B', 'C', 'D'];

    return this.shuffledOptions.map((option, index) => `
      <button
        class="option-btn flex items-start gap-3 p-4 rounded-xl
               bg-card-light dark:bg-card-dark
               border-2 border-transparent
               hover:border-primary/50
               text-left transition-all"
        data-index="${index}"
        data-testid="option-${index}"
      >
        <span class="w-8 h-8 rounded-full bg-primary/20 text-primary
                     flex items-center justify-center text-sm font-bold shrink-0">
          ${labels[index]}
        </span>
        <span class="text-text-light dark:text-text-dark text-base pt-1">
          ${option}
        </span>
      </button>
    `).join('');
  }

  /**
   * Render the scoreboard.
   *
   * @private
   */
  _renderScoreboard() {
    const container = this.querySelector('#scoreboardContainer');
    if (!container) return;

    const participants = this.session.getParticipants().map(p => ({
      ...p,
      isYou: p.id === this.session.participantId,
    }));

    container.innerHTML = '';
    const scoreboard = createLiveScoreboard(participants, {
      showStatus: true,
      highlightId: this.session.participantId,
    });
    container.appendChild(scoreboard);
  }

  attachListeners() {
    // Option buttons
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach((btn) => {
      this.addEventListener(btn, 'click', () => {
        if (this.hasAnswered) return;

        const index = parseInt(/** @type {HTMLElement} */ (btn).dataset.index);
        this._selectOption(index);
      });
    });

    // Toggle scoreboard
    const toggleBtn = this.querySelector('#toggleScoreboardBtn');
    const scoreboardContainer = this.querySelector('#scoreboardContainer');
    const toggleIcon = this.querySelector('#toggleIcon');

    if (toggleBtn && scoreboardContainer) {
      this.addEventListener(toggleBtn, 'click', () => {
        scoreboardContainer.classList.toggle('hidden');
        if (toggleIcon) {
          toggleIcon.textContent = scoreboardContainer.classList.contains('hidden')
            ? 'expand_more'
            : 'expand_less';
        }
      });
    }
  }

  /**
   * Set up session callbacks.
   *
   * @private
   */
  _setupSessionCallbacks() {
    this.session.onQuestionChange((questionIndex, question) => {
      this._onQuestionChange(questionIndex, question);
    });

    this.session.onParticipantsChange(() => {
      this._renderScoreboard();
    });

    this.session.onScoreUpdate(() => {
      this._renderScoreboard();
    });

    this.session.onQuizEnd((standings) => {
      this._onQuizEnd(standings);
    });
  }

  /**
   * Handle question change.
   *
   * @private
   * @param {number} questionIndex - New question index
   * @param {Object} question - New question data
   */
  _onQuestionChange(questionIndex, question) {
    log.info('Question changed', { questionIndex });

    // Reset state
    this.selectedAnswer = null;
    this.hasAnswered = false;

    // Shuffle new question
    this._shuffleCurrentQuestion(question);

    // Update UI
    const questionText = this.querySelector('#questionText');
    if (questionText) {
      questionText.textContent = question?.question || '';
    }

    const optionsContainer = this.querySelector('#optionsContainer');
    if (optionsContainer) {
      optionsContainer.innerHTML = this._renderOptions(question);

      // Re-attach listeners
      const optionBtns = optionsContainer.querySelectorAll('.option-btn');
      optionBtns.forEach((btn) => {
        this.addEventListener(btn, 'click', () => {
          if (this.hasAnswered) return;
          const index = parseInt(/** @type {HTMLElement} */ (btn).dataset.index);
          this._selectOption(index);
        });
      });
    }

    // Update header
    const header = this.querySelector('.text-sm.font-medium');
    if (header) {
      header.textContent = t('party.question', {
        current: questionIndex + 1,
        total: this.session.quiz.questions.length,
      });
    }

    this._updateStatus(t('party.thinking'));
  }

  /**
   * Select an option.
   *
   * @private
   * @param {number} shuffledIndex - Selected shuffled option index
   */
  _selectOption(shuffledIndex) {
    this.selectedAnswer = shuffledIndex;
    this.hasAnswered = true;

    // Get original index for submission
    const originalIndex = this.shuffleMap[shuffledIndex];

    // Update UI
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach((btn, index) => {
      if (index === shuffledIndex) {
        btn.classList.add('border-primary', 'bg-primary/10');
      } else {
        btn.classList.add('opacity-50');
        btn.setAttribute('disabled', 'true');
      }
    });

    // Submit answer
    this.session.submitAnswer(this.session.currentQuestion, originalIndex);

    this._updateStatus(t('party.answered'));

    log.info('Option selected', { shuffledIndex, originalIndex });
  }

  /**
   * Start the timer.
   *
   * @private
   */
  _startTimer() {
    const timerText = this.querySelector('#timerText');
    const progressBar = this.querySelector('#progressBar');

    this.timerInterval = setInterval(() => {
      const remaining = this.session.getTimeRemaining();
      const total = this.session.secondsPerQuestion * 1000;
      const seconds = Math.ceil(remaining / 1000);
      const progress = (remaining / total) * 100;

      if (timerText) {
        timerText.textContent = String(seconds);

        // Change color when low
        if (seconds <= 5) {
          timerText.classList.remove('text-primary');
          timerText.classList.add('text-red-500');
        } else {
          timerText.classList.remove('text-red-500');
          timerText.classList.add('text-primary');
        }
      }

      if (progressBar) {
        progressBar.style.width = `${progress}%`;

        if (seconds <= 5) {
          progressBar.classList.remove('bg-primary');
          progressBar.classList.add('bg-red-500');
        } else {
          progressBar.classList.remove('bg-red-500');
          progressBar.classList.add('bg-primary');
        }
      }
    }, 100);
  }

  /**
   * Update status bar text.
   *
   * @private
   * @param {string} text - Status text
   */
  _updateStatus(text) {
    const statusText = this.querySelector('#statusText');
    if (statusText) {
      statusText.textContent = text;
    }
  }

  /**
   * Handle quiz end.
   *
   * @private
   * @param {Array} standings - Final standings
   */
  _onQuizEnd(standings) {
    log.info('Quiz ended, navigating to results');

    // Stop timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Navigate to results (pass standings via state)
    // For now, just navigate to home
    // TODO: Create PartyResultsView and navigate there
    this.navigateTo('/');
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    super.destroy();
  }
}
