import BaseView from './BaseView.js';
import state from '../state/state.js';

export default class ResultsView extends BaseView {
  render() {
    const questions = state.get('currentQuestions');
    const answers = state.get('currentAnswers');

    if (!questions || !answers) {
      this.navigateTo('/');
      return;
    }

    // Calculate score
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // Calculate stroke-dashoffset for circular progress (100 = full circle, 0 = empty)
    const strokeDashoffset = 100 - percentage;

    // Determine message based on score
    let message = 'Great Job!';
    if (percentage === 100) {
      message = 'Perfect Score!';
    } else if (percentage >= 80) {
      message = 'Great Job!';
    } else if (percentage >= 60) {
      message = 'Good Work!';
    } else {
      message = 'Keep Practicing!';
    }

    // Generate question review HTML
    const questionReviewHTML = questions.map((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      const userAnswer = question.options[answers[index]];
      const correctAnswer = question.options[question.correctAnswer];

      if (isCorrect) {
        return `
          <div class="flex items-center gap-4 bg-card-light dark:bg-card-dark p-3 rounded-lg min-h-[72px] justify-between">
            <div class="flex items-center gap-4">
              <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <span class="material-symbols-outlined">check</span>
              </div>
              <div class="flex flex-col justify-center">
                <p class="text-text-light dark:text-text-dark text-base font-medium leading-normal line-clamp-2">${question.question}</p>
                <p class="text-subtext-light dark:text-subtext-dark text-sm font-normal leading-normal line-clamp-1">Your answer: ${userAnswer}</p>
              </div>
            </div>
            <div class="shrink-0">
              <div class="flex size-7 items-center justify-center">
                <div class="size-3 rounded-full bg-success"></div>
              </div>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="flex items-center gap-4 bg-card-light dark:bg-card-dark p-3 rounded-lg min-h-[72px] justify-between">
            <div class="flex items-center gap-4">
              <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error">
                <span class="material-symbols-outlined">close</span>
              </div>
              <div class="flex flex-col justify-center">
                <p class="text-text-light dark:text-text-dark text-base font-medium leading-normal line-clamp-2">${question.question}</p>
                <p class="text-error text-sm font-normal leading-normal line-clamp-1">Your answer: ${userAnswer}</p>
                <p class="text-success text-sm font-normal leading-normal line-clamp-1">Correct answer: ${correctAnswer}</p>
              </div>
            </div>
            <div class="shrink-0">
              <div class="flex size-7 items-center justify-center">
                <div class="size-3 rounded-full bg-error"></div>
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    this.setHTML(`
      <div class="relative flex min-h-screen w-full flex-col">
        <!-- Top App Bar -->
        <header class="flex items-center bg-card-light dark:bg-card-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-white/10 dark:border-white/10">
          <button id="backBtn" class="text-text-light dark:text-text-dark flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 class="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Results</h1>
        </header>

        <main class="flex-grow px-4 pt-6 pb-28">
          <!-- Score Display Card -->
          <div class="flex flex-col items-center justify-center rounded-xl bg-card-light dark:bg-card-dark p-6 text-center shadow-sm">
            <div class="relative size-40">
              <svg class="size-full" height="36" viewbox="0 0 36 36" width="36" xmlns="http://www.w3.org/2000/svg">
                <circle class="stroke-slate-200 dark:stroke-slate-700" cx="18" cy="18" fill="none" r="16" stroke-width="3"></circle>
                <circle class="stroke-success" cx="18" cy="18" fill="none" r="16" stroke-dasharray="100" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round" stroke-width="3"></circle>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <p class="text-success text-5xl font-extrabold">${percentage}%</p>
              </div>
            </div>
            <p class="text-text-light dark:text-text-dark text-xl font-bold mt-4">${message}</p>
            <p class="text-subtext-light dark:text-subtext-dark mt-1">You answered ${correctCount} out of ${totalQuestions} questions correctly.</p>
          </div>

          <!-- Section Header -->
          <h2 class="text-text-light dark:text-text-dark text-[22px] font-bold leading-tight tracking-[-0.015em] pt-8 pb-3">Review Your Answers</h2>

          <!-- Question List -->
          <div class="flex flex-col space-y-2">
            ${questionReviewHTML}
          </div>
        </main>

        <!-- Bottom Actions & Navigation -->
        <div class="fixed bottom-0 left-0 w-full bg-card-light dark:bg-card-dark border-t border-slate-200 dark:border-slate-800">
          <!-- CTA Button -->
          <div class="p-4">
            <button id="tryAnotherBtn" class="w-full rounded-xl bg-primary py-4 text-center font-bold text-white hover:bg-primary/90">
              Try Another Topic
            </button>
          </div>

          <!-- Bottom Navigation Bar -->
          <nav class="flex h-16 items-center justify-around border-t border-slate-200 dark:border-slate-800">
            <a class="flex flex-col items-center gap-1 text-subtext-light dark:text-subtext-dark" href="#/">
              <span class="material-symbols-outlined !font-light">home</span>
              <span class="text-xs">Home</span>
            </a>
            <a class="flex flex-col items-center gap-1 text-primary" href="#/history">
              <span class="material-symbols-outlined">category</span>
              <span class="text-xs font-semibold">Topics</span>
            </a>
            <a class="flex flex-col items-center gap-1 text-subtext-light dark:text-subtext-dark" href="#/settings">
              <span class="material-symbols-outlined !font-light">person</span>
              <span class="text-xs">Profile</span>
            </a>
          </nav>
        </div>
      </div>
    `);

    this.attachListeners();
  }

  attachListeners() {
    // Back button
    const backBtn = this.querySelector('#backBtn');
    this.addEventListener(backBtn, 'click', () => {
      this.navigateTo('/');
    });

    // Try another topic button
    const tryAnotherBtn = this.querySelector('#tryAnotherBtn');
    this.addEventListener(tryAnotherBtn, 'click', () => {
      this.navigateTo('/topic-input');
    });
  }
}
