import BaseView from './BaseView.js';
import { updateNetworkIndicator } from '../utils/network.js';

export default class HomeView extends BaseView {
  render() {
    this.setHTML(`
      <div class="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
        <!-- Top App Bar -->
        <div class="flex items-center p-4 pb-2 justify-between bg-background-light dark:bg-background-dark">
          <h1 class="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] flex-1">QuizUp</h1>
          <div class="flex w-12 items-center justify-end">
            <button class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-text-light dark:text-text-dark gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:bg-primary/10">
              <span class="material-symbols-outlined text-2xl">notifications</span>
            </button>
          </div>
        </div>

        <div class="flex-grow px-4">
          <!-- Headline Text -->
          <h2 class="text-text-light dark:text-text-dark tracking-light text-[32px] font-bold leading-tight text-left pb-3 pt-6">Welcome back!</h2>

          <!-- Start New Quiz Button -->
          <div class="py-3">
            <button
              id="startQuizBtn"
              class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] w-full shadow-lg shadow-primary/30 hover:bg-primary/90">
              <span class="truncate">Start New Quiz</span>
            </button>
          </div>

          <!-- Section Header -->
          <h3 class="text-text-light dark:text-text-dark text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-8">Recent Topics</h3>

          <!-- List Items Container -->
          <div id="recentTopicsList" class="flex flex-col gap-3">
            <!-- Geography Topic -->
            <div class="flex items-center gap-4 bg-card-light dark:bg-card-dark rounded-xl p-4">
              <div class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-green-500">
                <span class="material-symbols-outlined text-white text-3xl">public</span>
              </div>
              <div class="flex flex-1 flex-col">
                <p class="text-text-light dark:text-text-dark text-base font-bold leading-normal">Geography</p>
                <p class="text-subtext-light dark:text-subtext-dark text-sm font-normal leading-normal">Completed</p>
              </div>
              <p class="text-green-500 text-lg font-bold">10/10</p>
            </div>

            <!-- Science Topic -->
            <div class="flex items-center gap-4 bg-card-light dark:bg-card-dark rounded-xl p-4">
              <div class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-orange-500">
                <span class="material-symbols-outlined text-white text-3xl">science</span>
              </div>
              <div class="flex flex-1 flex-col">
                <p class="text-text-light dark:text-text-dark text-base font-bold leading-normal">Science</p>
                <p class="text-subtext-light dark:text-subtext-dark text-sm font-normal leading-normal">In Progress</p>
              </div>
              <p class="text-orange-500 text-lg font-bold">80%</p>
            </div>

            <!-- History Topic -->
            <div class="flex items-center gap-4 bg-card-light dark:bg-card-dark rounded-xl p-4">
              <div class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-red-500">
                <span class="material-symbols-outlined text-white text-3xl">auto_stories</span>
              </div>
              <div class="flex flex-1 flex-col">
                <p class="text-text-light dark:text-text-dark text-base font-bold leading-normal">History</p>
                <p class="text-subtext-light dark:text-subtext-dark text-sm font-normal leading-normal">Completed</p>
              </div>
              <p class="text-red-500 text-lg font-bold">3/10</p>
            </div>

            <!-- Movie Trivia Topic -->
            <div class="flex items-center gap-4 bg-card-light dark:bg-card-dark rounded-xl p-4">
              <div class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-blue-500">
                <span class="material-symbols-outlined text-white text-3xl">movie</span>
              </div>
              <div class="flex flex-1 flex-col">
                <p class="text-text-light dark:text-text-dark text-base font-bold leading-normal">Movie Trivia</p>
                <p class="text-subtext-light dark:text-subtext-dark text-sm font-normal leading-normal">Completed</p>
              </div>
              <p class="text-blue-500 text-lg font-bold">7/10</p>
            </div>
          </div>
        </div>

        <!-- Spacer for bottom nav -->
        <div class="h-24"></div>

        <!-- Bottom Navigation Bar -->
        <div class="sticky bottom-0 left-0 right-0 h-20 bg-background-light dark:bg-background-dark backdrop-blur-md border-t border-border-light dark:border-border-dark">
          <div class="flex justify-around items-center h-full max-w-lg mx-auto px-4">
            <a class="flex flex-col items-center justify-center text-primary gap-1" href="#/">
              <span class="material-symbols-outlined text-2xl fill">home</span>
              <span id="networkStatusDot" class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark"></span>
              <span class="text-xs font-bold">Home</span>
            </a>
            <a class="flex flex-col items-center justify-center text-subtext-light dark:text-subtext-dark hover:text-primary gap-1" href="#/history">
              <span class="material-symbols-outlined text-2xl">category</span>
              <span class="text-xs font-medium">Topics</span>
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

    // Sync network indicator with current state
    updateNetworkIndicator();    
  }

  attachListeners() {
    const startQuizBtn = this.querySelector('#startQuizBtn');

    this.addEventListener(startQuizBtn, 'click', () => {
      this.navigateTo('/topic-input');
    });
  }
}