 import BaseView from './BaseView.js';
  import { getRecentSessions, getSession } from '../db/db.js';
  import state from '../state/state.js';

  export default class TopicsView extends BaseView {
    async render() {
      // Get ALL sessions (pass a large number or modify db function)        
      const sessions = await getRecentSessions(100);

      this.setHTML(`
        <div class="relative flex min-h-screen w-full flex-col
  bg-background-light dark:bg-background-dark">
          <!-- Header -->
          <header class="flex items-center p-4 pb-2 justify-between
  bg-background-light dark:bg-background-dark">
            <h1 class="text-text-light dark:text-text-dark text-lg
  font-bold leading-tight tracking-[-0.015em]">Quiz History</h1>
            <span class="text-subtext-light dark:text-subtext-dark
  text-sm">${sessions.length} quizzes</span>
          </header>

          <!-- Main Content -->
          <main class="flex-grow px-4 pb-24">
            ${sessions.length === 0 ? this.renderEmptyState() :
  this.renderQuizList(sessions)}
          </main>

          <!-- Bottom Navigation Bar -->
          <div class="sticky bottom-0 left-0 right-0 h-20
  bg-background-light dark:bg-background-dark backdrop-blur-md border-t      
  border-border-light dark:border-border-dark">
            <div class="flex justify-around items-center h-full max-w-lg     
  mx-auto px-4">
              <a class="flex flex-col items-center justify-center
  text-subtext-light dark:text-subtext-dark hover:text-primary gap-1"        
  href="#/">
                <span class="material-symbols-outlined
  text-2xl">home</span>
                <span class="text-xs font-medium">Home</span>
              </a>
              <a class="flex flex-col items-center justify-center
  text-primary gap-1" href="#/history">
                <span class="material-symbols-outlined text-2xl
  fill">category</span>
                <span class="text-xs font-bold">Topics</span>
              </a>
              <a class="flex flex-col items-center justify-center
  text-subtext-light dark:text-subtext-dark hover:text-primary gap-1"        
  href="#/settings">
                <span class="material-symbols-outlined
  text-2xl">settings</span>
                <span class="text-xs font-medium">Settings</span>
              </a>
            </div>
          </div>
        </div>
      `);

      this.attachListeners();
    }

    renderEmptyState() {
      return `
        <div class="flex flex-col items-center justify-center py-16
  text-center">
          <span class="material-symbols-outlined text-6xl
  text-subtext-light dark:text-subtext-dark mb-4">quiz</span>
          <p class="text-text-light dark:text-text-dark text-xl font-bold    
   mb-2">No quizzes yet</p>
          <p class="text-subtext-light dark:text-subtext-dark
  mb-6">Complete your first quiz to see it here!</p>
          <a href="#/topic-input" class="bg-primary text-white rounded-xl    
   px-6 py-3 font-bold hover:bg-primary/90">
            Start a Quiz
          </a>
        </div>
      `;
    }

    renderQuizList(sessions) {
      return `
        <div class="flex flex-col gap-3 pt-4">
          ${sessions.map(session =>
  this.renderQuizItem(session)).join('')}
        </div>
      `;
    }

    renderQuizItem(session) {
      const percentage = Math.round((session.score /
  session.totalQuestions) * 100);
      const scoreDisplay = `${session.score}/${session.totalQuestions}`;     
      const dateStr = this.formatDate(new Date(session.timestamp));
      const canReplay = !!session.questions;

      // Choose color based on score
      let colorClass = 'text-green-500 bg-green-500';
      if (percentage < 50) {
        colorClass = 'text-red-500 bg-red-500';
      } else if (percentage < 80) {
        colorClass = 'text-orange-500 bg-orange-500';
      }

      return `
        <div class="quiz-item flex items-center gap-4 bg-card-light
  dark:bg-card-dark rounded-xl p-4
          ${canReplay ? 'cursor-pointer hover:opacity-80' : 'opacity-60'}    
   transition-opacity"
          data-session-id="${session.id}"
          ${!canReplay ? 'data-no-replay="true"' : ''}>
          <div class="flex size-16 shrink-0 items-center justify-center      
  rounded-xl ${colorClass.split(' ')[1]}">
            <span class="material-symbols-outlined text-white
  text-3xl">school</span>
          </div>
          <div class="flex flex-1 flex-col">
            <p class="text-text-light dark:text-text-dark text-base
  font-bold leading-normal">${session.topic}</p>
            <p class="text-subtext-light dark:text-subtext-dark text-sm      
  font-normal leading-normal">
              ${dateStr}${!canReplay ? ' • Cannot replay' : ''}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <p class="${colorClass.split(' ')[0]} text-lg
  font-bold">${scoreDisplay}</p>
            ${canReplay ? '<span class="material-symbols-outlined text-subtext-light dark:text-subtext-dark">chevron_right</span>' : ''}     
          </div>
        </div>
      `;
    }

    formatDate(date) {
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;

      return date.toLocaleDateString();
    }

    attachListeners() {
      // Quiz item click handlers for replay
      const quizItems =
  document.querySelectorAll('.quiz-item:not([data-no-replay])');
      quizItems.forEach(item => {
        this.addEventListener(item, 'click', async () => {
          const sessionId = parseInt(item.dataset.sessionId);
          await this.replayQuiz(sessionId);
        });
      });
    }

    async replayQuiz(sessionId) {
      const session = await getSession(sessionId);

      if (!session || !session.questions) {
        alert('This quiz cannot be replayed. The questions were not saved.');
        return;
      }

      state.set('currentTopic', session.topic);
      state.set('currentGradeLevel', session.gradeLevel || 'middle school');
      state.set('generatedQuestions', session.questions);
      state.set('currentAnswers', []);
      state.set('replaySessionId', sessionId);

      this.navigateTo('/quiz');
    }
  }