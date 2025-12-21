  import BaseView from './BaseView.js';
  import { getSettings, saveSetting } from '../core/settings.js';
  import { APP_VERSION, BUILD_DATE } from '../version.js';
  import { isOpenRouterConnected, removeOpenRouterKey } from '../core/db.js';
  import { isFeatureEnabled } from '../core/features.js';

  export default class SettingsView extends BaseView {
    constructor() {
      super();
    }

    async render() {
      this.setHTML(`
        <div class="relative flex h-auto min-h-screen w-full flex-col
  bg-background-light dark:bg-background-dark overflow-x-hidden">
          <!-- Top App Bar -->
          <div class="flex items-center p-4 pb-2 justify-between
  bg-background-light dark:bg-background-dark">
            <h1 class="text-text-light dark:text-text-dark text-lg font-bold        
  leading-tight tracking-[-0.015em] flex-1">Settings</h1>
          </div>

          <div class="flex-grow px-4">
 <!-- Preferences Section -->
  <h2 class="text-text-light dark:text-text-dark text-[22px] font-bold
  leading-tight tracking-[-0.015em] pb-3 pt-4">Preferences</h2>

  <div class="flex flex-col gap-4">
    <!-- Default Grade Level -->
    <label class="flex flex-col">
      <p class="text-base font-medium pb-2 text-text-light
  dark:text-text-dark">Default Grade Level</p>
      <select id="defaultGradeLevel" class="form-select flex w-full rounded-lg      
  h-14 p-4 text-base font-normal leading-normal bg-card-light dark:bg-card-dark     
  border border-border-light dark:border-border-dark text-text-light
  dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary">        
        <option value="elementary">Elementary School</option>
        <option value="middle school">Middle School</option>
        <option value="high school">High School</option>
        <option value="college">College</option>
      </select>
    </label>

    <!-- Default Questions Per Quiz -->
    <label class="flex flex-col opacity-50">
      <p class="text-base font-medium pb-2 text-text-light
  dark:text-text-dark">Default Questions Per Quiz</p>
      <select id="questionsPerQuiz" disabled class="form-select flex w-full rounded-lg
  h-14 p-4 text-base font-normal leading-normal bg-card-light dark:bg-card-dark
  border border-border-light dark:border-border-dark text-text-light
  dark:text-text-dark cursor-not-allowed">
        <option value="5">5 questions</option>
        <option value="10" selected>10 questions</option>
        <option value="15">15 questions</option>
      </select>
    </label>

    <!-- Default Difficulty -->
    <label class="flex flex-col opacity-50">
      <p class="text-base font-medium pb-2 text-text-light
  dark:text-text-dark">Default Difficulty</p>
      <select id="difficulty" disabled class="form-select flex w-full rounded-lg h-14 p-4
   text-base font-normal leading-normal bg-card-light dark:bg-card-dark border
  border-border-light dark:border-border-dark text-text-light
  dark:text-text-dark cursor-not-allowed">
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
        <option value="mixed" selected>Mixed</option>
      </select>
    </label>
  </div>

               <!-- Connection to AI Provider Section -->
              <h2 class="text-text-light dark:text-text-dark text-[22px] font-bold leading-tight
   tracking-[-0.015em] pb-3 pt-8">Connection to AI Provider</h2>

              <div id="accountSection" class="flex flex-col gap-3">
                <!-- Will be populated by loadAccountStatus() -->
              </div>

           <!-- About Section -->
            <h2 class="text-text-light dark:text-text-dark text-[22px] font-bold    
   leading-tight tracking-[-0.015em] pb-3 pt-8">About</h2>

            <div class="flex flex-col gap-3">
              <!-- Help Link -->
              <a href="#/help" class="bg-card-light dark:bg-card-dark rounded-xl p-4
  flex items-center justify-between hover:bg-primary/10 transition-colors">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-text-light
  dark:text-text-dark">help</span>
                  <p class="text-text-light dark:text-text-dark text-base
  font-medium">Help & FAQ</p>
                </div>
                <span class="material-symbols-outlined text-subtext-light
  dark:text-subtext-dark">chevron_right</span>
              </a>

              <!-- Version Card -->
              <div class="bg-card-light dark:bg-card-dark rounded-xl p-4">
                <div class="flex items-center justify-between">
                  <p class="text-text-light dark:text-text-dark text-base
  font-medium">Version</p>
                  <p class="text-subtext-light dark:text-subtext-dark
  text-base">${APP_VERSION}</p>
                </div>
              </div>

              <!-- GitHub Link -->
              <a href="https://github.com/vitorsilva/demo-pwa-app"
  target="_blank" rel="noopener noreferrer" class="bg-card-light
  dark:bg-card-dark rounded-xl p-4 flex items-center justify-between
  hover:bg-primary/10">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-text-light
  dark:text-text-dark">code</span>
                  <p class="text-text-light dark:text-text-dark text-base
  font-medium">View on GitHub</p>
                </div>
                <span class="material-symbols-outlined text-subtext-light
  dark:text-subtext-dark">open_in_new</span>
              </a>

              <!-- Credits -->
              <div class="bg-card-light dark:bg-card-dark rounded-xl p-4">
                <p class="text-text-light dark:text-text-dark text-base
  font-medium mb-2">Built with</p>
                <p class="text-subtext-light dark:text-subtext-dark
  text-sm">Claude AI by Anthropic</p>
                <p class="text-subtext-light dark:text-subtext-dark
  text-sm">Claude Code</p>
              </div>
            </div>

          <!-- Spacer for bottom nav -->
          <div class="h-24"></div>

          <!-- Bottom Navigation Bar -->
          <div class="sticky bottom-0 left-0 right-0 h-20 bg-background-light       
  dark:bg-background-dark backdrop-blur-md border-t border-border-light
  dark:border-border-dark">
            <div class="flex justify-around items-center h-full max-w-lg mx-auto    
   px-4">
              <a class="flex flex-col items-center justify-center
  text-subtext-light dark:text-subtext-dark hover:text-primary gap-1" href="#/">    
                <span class="material-symbols-outlined text-2xl">home</span>        
                <span class="text-xs font-medium">Home</span>
              </a>
              <a class="flex flex-col items-center justify-center
  text-subtext-light dark:text-subtext-dark hover:text-primary gap-1"
  href="#/history">
                <span class="material-symbols-outlined text-2xl">category</span>    
                <span class="text-xs font-medium">Topics</span>
              </a>
              <a class="flex flex-col items-center justify-center text-primary      
  gap-1" href="#/settings">
                <span class="material-symbols-outlined text-2xl
  fill">settings</span>
                <span class="text-xs font-bold">Settings</span>
              </a>
            </div>
          </div>
        </div>
      `);

      // Load saved settings into form fields
      this.loadSettings();

      // Load account connection status
      await this.loadAccountStatus();

      this.bindEvents();
    }

    loadSettings() {
      const settings = getSettings();

      // Set each dropdown to its saved value
      const gradeSelect = this.querySelector('#defaultGradeLevel');
      const questionsSelect = this.querySelector('#questionsPerQuiz');
      const difficultySelect = this.querySelector('#difficulty');

      if (gradeSelect) gradeSelect.value = settings.defaultGradeLevel;
      if (questionsSelect) questionsSelect.value = settings.questionsPerQuiz;       
      if (difficultySelect) difficultySelect.value = settings.difficulty;
    }

      async loadAccountStatus() {
        const accountSection = this.querySelector('#accountSection');
        const isConnected = await isOpenRouterConnected();

        if (isConnected) {
          accountSection.innerHTML = `
            <div class="bg-card-light dark:bg-card-dark rounded-xl p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-green-500">check_circle</span>        
                  <div>
                    <p class="text-text-light dark:text-text-dark text-base
  font-medium">OpenRouter Connected</p>
                    <p class="text-subtext-light dark:text-subtext-dark text-sm">Free tier: 50      
  requests/day</p>
                  </div>
                </div>
              </div>
            </div>
            <button id="disconnectBtn" class="bg-red-500/10 hover:bg-red-500/20 text-red-500        
  rounded-xl p-4 flex items-center justify-center gap-2 transition-colors">
              <span class="material-symbols-outlined">logout</span>
              <span class="font-medium">Disconnect</span>
            </button>
          `;

          // Bind disconnect button
          const disconnectBtn = this.querySelector('#disconnectBtn');
          this.addEventListener(disconnectBtn, 'click', () => this.handleDisconnect());
        } else {
          accountSection.innerHTML = `
            <div class="bg-card-light dark:bg-card-dark rounded-xl p-4">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-yellow-500">warning</span>
                <div>
                  <p class="text-text-light dark:text-text-dark text-base font-medium">Not
  Connected</p>
                  <p class="text-subtext-light dark:text-subtext-dark text-sm">Connect to
  generate quizzes</p>
                </div>
              </div>
            </div>
            <a href="#${isFeatureEnabled('OPENROUTER_GUIDE', 'settings') ? '/setup-openrouter' : '/welcome'}"
              class="bg-primary hover:bg-primary/90 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition-colors">
              <span class="material-symbols-outlined">link</span>
              <span class="font-medium">Connect with OpenRouter</span>
            </a>
          `;
        }
      }

      async handleDisconnect() {
        if (confirm('Are you sure you want to disconnect? You will need to reconnect to generate new quizzes.')) {
          await removeOpenRouterKey();
          // Reload the app to show WelcomeView
          window.location.href = window.location.origin + '/#/';
          window.location.reload();
        }
      }


    bindEvents() {
      const gradeSelect = this.querySelector('#defaultGradeLevel');
      const questionsSelect = this.querySelector('#questionsPerQuiz');
      const difficultySelect = this.querySelector('#difficulty');

      this.addEventListener(gradeSelect, 'change', (e) => {
        saveSetting('defaultGradeLevel', e.target.value);
      });

      this.addEventListener(questionsSelect, 'change', (e) => {
        saveSetting('questionsPerQuiz', e.target.value);
      });

      this.addEventListener(difficultySelect, 'change', (e) => {
        saveSetting('difficulty', e.target.value);
      });
    }

  }