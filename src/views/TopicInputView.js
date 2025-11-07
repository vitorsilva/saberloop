import BaseView from './BaseView.js';
import state from '../state/state.js';

export default class TopicInputView extends BaseView {
  render() {
    this.setHTML(`
      <div class="relative flex h-screen w-full flex-col">
        <!-- Top App Bar -->
        <header class="flex items-center p-4 border-b border-gray-200 dark:border-[#333333] bg-background-light dark:bg-background-dark">
          <h1 class="text-lg font-bold flex-1 text-center text-gray-800 dark:text-gray-100">New Quiz</h1>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-4">
          <div class="flex flex-col gap-6">
            <!-- Text Field for Topic -->
            <label class="flex flex-col">
              <p class="text-base font-medium pb-2 text-gray-800 dark:text-[#EAEAEA]">What do you want to practice?</p>
              <textarea id="topicInput" class="form-input flex w-full resize-none overflow-hidden rounded-lg min-h-36 p-4 text-base font-normal leading-normal placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-[#1E1E1E] border border-gray-300 dark:border-[#333333] text-gray-800 dark:text-[#EAEAEA] focus:ring-2 focus:ring-primary focus:border-primary" placeholder="World War II, Photosynthesis, Algebra..."></textarea>
            </label>

            <!-- Select Field for Grade Level -->
            <label class="flex flex-col">
              <p class="text-base font-medium pb-2 text-gray-800 dark:text-[#EAEAEA]">Grade Level (Optional)</p>
              <select id="gradeLevelSelect" class="form-select flex w-full rounded-lg h-14 p-4 text-base font-normal leading-normal bg-white dark:bg-[#1E1E1E] border border-gray-300 dark:border-[#333333] text-gray-800 dark:text-[#EAEAEA] focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="">Select grade level</option>
                <option value="middle school">Middle School</option>
                <option value="high school">High School</option>
                <option value="college">College</option>
              </select>
            </label>
          </div>

          <!-- Generate Button -->
          <div class="mt-8">
            <button id="generateBtn" class="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em]">
              <span class="truncate">Generate Questions</span>
            </button>
          </div>
        </main>

        <!-- Bottom Nav Bar -->
        <nav class="flex gap-2 border-t border-gray-200 dark:border-[#333333] bg-background-light dark:bg-background-dark px-4 pb-3 pt-2">
          <a class="flex flex-1 flex-col items-center justify-end gap-1 text-gray-500 dark:text-gray-400" href="#/">
            <span class="material-symbols-outlined text-2xl">home</span>
            <p class="text-xs font-medium leading-normal">Home</p>
          </a>
          <a class="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-primary" href="#/history">
            <span class="material-symbols-outlined text-2xl">science</span>
            <p class="text-xs font-medium leading-normal">Topics</p>
          </a>
          <a class="flex flex-1 flex-col items-center justify-end gap-1 text-gray-500 dark:text-gray-400" href="#/settings">
            <span class="material-symbols-outlined text-2xl">person</span>
            <p class="text-xs font-medium leading-normal">Profile</p>
          </a>
        </nav>
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
      this.navigateTo('/quiz');
    });
  }
}