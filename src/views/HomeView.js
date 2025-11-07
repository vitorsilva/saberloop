import BaseView from './BaseView.js';

export default class HomeView extends BaseView {
  render() {
    this.setHTML(`
      <div class="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
        <!-- Top App Bar -->
        <div class="flex items-center p-4 pb-2 justify-between bg-background-light dark:bg-background-dark">
          <h2 class="text-black dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1">QuizUp</h2>
          <div class="flex w-12 items-center justify-end">
            <button class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-black dark:text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:bg-black/10 dark:hover:bg-white/10">
              <span class="material-symbols-outlined text-2xl">notifications</span>
            </button>
          </div>
        </div>

        <div class="flex-grow px-4">
          <!-- Headline Text -->
          <h1 class="text-black dark:text-white tracking-light text-[32px] font-bold leading-tight text-left pb-3 pt-6">Welcome back!</h1>

          <!-- Start New Quiz Button -->
          <div class="py-3">
            <button
              id="startQuizBtn"
              class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 flex-1 bg-primary text-white text-lg font-bold leading-normal tracking-[0.015em] w-full shadow-lg shadow-primary/30 hover:bg-primary/90">
              <span class="truncate">Start New Quiz</span>
            </button>
          </div>

          <!-- Section Header -->
          <h2 class="text-black dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-8">Recent Topics</h2>

          <!-- List Items Container -->
          <div id="recentTopicsList" class="flex flex-col gap-3">
            <!-- Geography Topic -->
            <div class="flex items-center gap-4 bg-zinc-900 dark:bg-zinc-900 rounded-xl p-4">
              <div class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-green-500">
                <span class="material-symbols-outlined text-white text-3xl">public</span>
              </div>
              <div class="flex flex-1 flex-col">
                <p class="text-white text-base font-bold leading-normal">Geography</p>
                <p class="text-zinc-400 text-sm font-normal leading-normal">Completed</p>
              </div>
              <p class="text-green-500 text-lg font-bold">10/10</p>
            </div>

            <!-- Science Topic -->
            <div class="flex items-center gap-4 bg-zinc-900 dark:bg-zinc-900 rounded-xl p-4">
              <div class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-orange-500">
                <span class="material-symbols-outlined text-white text-3xl">science</span>
              </div>
              <div class="flex flex-1 flex-col">
                <p class="text-white text-base font-bold leading-normal">Science</p>
                <p class="text-zinc-400 text-sm font-normal leading-normal">In Progress</p>
              </div>
              <p class="text-orange-500 text-lg font-bold">80%</p>
            </div>

            <!-- History Topic -->
            <div class="flex items-center gap-4 bg-zinc-900 dark:bg-zinc-900 rounded-xl p-4">
              <div class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-red-500">
                <span class="material-symbols-outlined text-white text-3xl">auto_stories</span>
              </div>
              <div class="flex flex-1 flex-col">
                <p class="text-white text-base font-bold leading-normal">History</p>
                <p class="text-zinc-400 text-sm font-normal leading-normal">Completed</p>
              </div>
              <p class="text-red-500 text-lg font-bold">3/10</p>
            </div>

            <!-- Movie Trivia Topic -->
            <div class="flex items-center gap-4 bg-zinc-900 dark:bg-zinc-900 rounded-xl p-4">
              <div class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-blue-500">
                <span class="material-symbols-outlined text-white text-3xl">movie</span>
              </div>
              <div class="flex flex-1 flex-col">
                <p class="text-white text-base font-bold leading-normal">Movie Trivia</p>
                <p class="text-zinc-400 text-sm font-normal leading-normal">Completed</p>
              </div>
              <p class="text-blue-500 text-lg font-bold">7/10</p>
            </div>
          </div>
        </div>

        <!-- Spacer for bottom nav -->
        <div class="h-24"></div>

        <!-- Bottom Navigation Bar -->
        <div class="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
          <div class="flex justify-around items-center h-full max-w-md mx-auto">
            <a class="flex flex-col items-center justify-center text-primary w-20" href="#/">
              <span class="material-symbols-outlined text-2xl">home</span>
              <span class="text-xs font-bold mt-1">Home</span>
            </a>
            <a class="flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 w-20 hover:text-primary dark:hover:text-primary" href="#/history">
              <span class="material-symbols-outlined text-2xl">category</span>
              <span class="text-xs font-medium mt-1">Topics</span>
            </a>
            <a class="flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 w-20 hover:text-primary dark:hover:text-primary" href="#/settings">
              <span class="material-symbols-outlined text-2xl">person</span>
              <span class="text-xs font-medium mt-1">Profile</span>
            </a>
          </div>
        </div>
      </div>
    `);

    this.attachListeners();
  }

  attachListeners() {
    const startQuizBtn = this.querySelector('#startQuizBtn');

    this.addEventListener(startQuizBtn, 'click', () => {
      this.navigateTo('/topic-input');
    });
  }
}