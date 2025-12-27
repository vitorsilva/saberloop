import BaseView from './BaseView.js';
import state from '../core/state.js';

export default class TopicInputView extends BaseView {
  render() {
    this.setHTML(`
      <div class="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark">
        <!-- Top App Bar -->
        <header class="flex items-center p-4 border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
          <h1 data-testid="new-quiz-title" class="text-lg font-bold flex-1 text-center text-text-light dark:text-text-dark">New Quiz</h1>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-4">
          <div class="flex flex-col gap-6">
            <!-- Text Field for Topic -->
            <label class="flex flex-col">
              <p class="text-base font-medium pb-2 text-text-light dark:text-text-dark">What do you want to practice?</p>
              <textarea id="topicInput" data-testid="topic-input" class="form-input flex w-full resize-none overflow-hidden rounded-lg min-h-36 p-4 text-base font-normal leading-normal placeholder:text-subtext-light dark:placeholder:text-subtext-dark bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary" placeholder="World War II, Photosynthesis, Algebra..."></textarea>
            </label>

            <!-- Select Field for Grade Level -->
            <label class="flex flex-col">
              <p class="text-base font-medium pb-2 text-text-light dark:text-text-dark">Grade Level (Optional)</p>
              <select id="gradeLevelSelect" class="form-select flex w-full rounded-lg h-14 p-4 text-base font-normal leading-normal bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="">Select grade level</option>
                <option value="middle school">Middle School</option>
                <option value="high school">High School</option>
                <option value="college">College</option>
              </select>
            </label>
          </div>

          <!-- Generate Button -->
          <div class="mt-8">
            <button id="generateBtn" data-testid="generate-quiz-btn" class="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/30 hover:bg-primary/90">
              <span class="truncate">Generate Questions</span>
            </button>
          </div>
        </main>

        <!-- Bottom Navigation Bar -->
        <div class="fixed bottom-0 left-0 right-0 h-20 bg-background-light dark:bg-background-dark backdrop-blur-md border-t border-border-light dark:border-border-dark">
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
              <span class="material-symbols-outlined text-2xl">settings</span>
              <span class="text-xs font-medium">Settings</span>
            </a>
          </div>
        </div>
      </div>
    `);

    this.attachListeners();
  }

  attachListeners() {
    const generateBtn = this.querySelector('#generateBtn');
    const topicInput = this.querySelector('#topicInput');
    const gradeLevelSelect = this.querySelector('#gradeLevelSelect');

    this.addEventListener(generateBtn, 'click', async () => {
      const topic = topicInput.value.trim();
      const gradeLevel = gradeLevelSelect.value || 'middle school';

      if (!topic) {
        alert('Please enter a topic to practice!');
        return;
      }

      state.set('currentTopic', topic);
      state.set('currentGradeLevel', gradeLevel);
      this.navigateTo('/loading');
    });
  }
}