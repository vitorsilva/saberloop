import BaseView from './BaseView.js';
import state from '../state/state.js';
import { generateQuestions } from '../api/index.js';

export default class QuizView extends BaseView {
  constructor() {
    super();
    this.currentQuestionIndex = 0;
    this.questions = [];
    this.answers = [];
    this.selectedAnswer = null;
  }

  async render() {
    const topic = state.get('currentTopic');
    const gradeLevel = state.get('currentGradeLevel');

    if (!topic) {
      this.navigateTo('/topic-input');
      return;
    }

    // Generate questions if not already generated
    if (this.questions.length === 0) {
      try {
        this.questions = await generateQuestions(topic, gradeLevel);
        this.answers = new Array(this.questions.length).fill(null);
      } catch (error) {
        console.error('Failed to generate questions:', error);
        alert('Failed to generate questions. Please try again.');
        this.navigateTo('/topic-input');
        return;
      }
    }

    this.renderQuestion();
  }

  renderQuestion() {
    const question = this.questions[this.currentQuestionIndex];
    const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;

    this.setHTML(`
      <div class="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
        <div class="flex-grow flex flex-col">
          <!-- Top App Bar -->
          <header class="flex items-center p-4 bg-background-light dark:bg-background-dark">
            <div id="backBtn" class="flex size-12 shrink-0 items-center justify-start text-text-light dark:text-text-dark cursor-pointer">
              <span class="material-symbols-outlined">arrow_back</span>
            </div>
            <h1 class="flex-1 text-center text-lg font-bold text-text-light dark:text-text-dark">Science Quiz</h1>
            <div class="size-12 shrink-0"></div> <!-- Spacer -->
          </header>

          <!-- Progress Bar -->
          <div class="flex flex-col gap-2 p-4 pt-0">
            <p class="text-base font-medium leading-normal text-text-light dark:text-text-dark">Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</p>
            <div class="rounded-full bg-border-light dark:bg-border-dark">
              <div class="h-2 rounded-full bg-primary" style="width: ${progress}%;"></div>
            </div>
          </div>

          <!-- Headline Text -->
          <main class="px-4">
            <h2 class="text-text-light dark:text-text-dark text-[28px] font-bold leading-tight pt-6 pb-6">${question.question}</h2>
          </main>

          <!-- Button Group -->
          <div class="flex justify-center">
            <div class="flex flex-1 max-w-lg flex-col items-stretch gap-4 px-4 py-3">
              ${question.options.map((option, index) => `
                <button
                  class="option-btn flex min-h-[56px] cursor-pointer items-center justify-start overflow-hidden rounded-lg p-4 ${
                    this.selectedAnswer === index
                      ? 'bg-primary/10 text-primary text-base font-bold leading-normal border-2 border-primary'
                      : 'bg-background-light dark:bg-border-dark text-text-light dark:text-text-dark text-base font-medium leading-normal border border-border-light dark:border-border-dark hover:border-primary'
                  }"
                  data-index="${index}">
                  <span class="truncate">${option}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="flex-grow"></div> <!-- Spacer to push button to bottom -->

          <!-- Single Button (Submit) -->
          <div class="px-4 py-6">
            <button
              id="submitBtn"
              class="flex h-14 min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-primary px-5 text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/30 hover:bg-primary/90 ${this.selectedAnswer === null ? 'opacity-50 cursor-not-allowed' : ''}">
              <span class="truncate">${this.currentQuestionIndex < this.questions.length - 1 ? 'Next Question' : 'Submit Answer'}</span>
            </button>
          </div>
        </div>

        <!-- Bottom Navigation Bar -->
        <div class="sticky bottom-0 left-0 right-0 h-20 bg-background-light dark:bg-background-dark backdrop-blur-md border-t border-border-light dark:border-border-dark">
          <div class="flex justify-around items-center h-full max-w-lg mx-auto px-4">
            <a class="flex flex-col items-center justify-center text-subtext-light dark:text-subtext-dark hover:text-primary gap-1" href="#/">
              <span class="material-symbols-outlined text-2xl">home</span>
              <span class="text-xs font-medium">Home</span>
            </a>
            <a class="flex flex-col items-center justify-center text-primary gap-1" href="#/history">
              <span class="material-symbols-outlined text-2xl fill">category</span>
              <span class="text-xs font-bold">Topics</span>
            </a>
            <a class="flex flex-col items-center justify-center text-subtext-light dark:text-subtext-dark hover:text-primary gap-1" href="#/settings">
              <span class="material-symbols-outlined text-2xl">person</span>
              <span class="text-xs font-medium">Profile</span>
            </a>
          </div>
        </div>
      </div>
    `);

    this.attachListeners();
  }

  attachListeners() {
    // Back button
    const backBtn = this.querySelector('#backBtn');
    this.addEventListener(backBtn, 'click', () => {
      if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
        this.navigateTo('/');
      }
    });

    // Option buttons
    const optionBtns = this.appContainer.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
      this.addEventListener(btn, 'click', () => {
        this.selectedAnswer = parseInt(btn.dataset.index);
        this.renderQuestion();
      });
    });

    // Submit button
    const submitBtn = this.querySelector('#submitBtn');
    this.addEventListener(submitBtn, 'click', () => {
      if (this.selectedAnswer === null) return;

      // Save answer
      this.answers[this.currentQuestionIndex] = this.selectedAnswer;

      // Move to next question or finish
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.selectedAnswer = this.answers[this.currentQuestionIndex];
        this.renderQuestion();
      } else {
        // Quiz complete - save to state and go to results
        state.set('currentQuestions', this.questions);
        state.set('currentAnswers', this.answers);
        this.navigateTo('/results');
      }
    });
  }
}
