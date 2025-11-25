  import BaseView from './BaseView.js';
  import { getSettings, saveSetting } from '../utils/settings.js';

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

    <!-- Questions Per Quiz -->
    <label class="flex flex-col">
      <p class="text-base font-medium pb-2 text-text-light
  dark:text-text-dark">Questions Per Quiz</p>
      <select id="questionsPerQuiz" class="form-select flex w-full rounded-lg       
  h-14 p-4 text-base font-normal leading-normal bg-card-light dark:bg-card-dark     
  border border-border-light dark:border-border-dark text-text-light
  dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary">        
        <option value="5">5 questions</option>
        <option value="10" selected>10 questions</option>
        <option value="15">15 questions</option>
      </select>
    </label>

    <!-- Difficulty -->
    <label class="flex flex-col">
      <p class="text-base font-medium pb-2 text-text-light
  dark:text-text-dark">Difficulty</p>
      <select id="difficulty" class="form-select flex w-full rounded-lg h-14 p-4    
   text-base font-normal leading-normal bg-card-light dark:bg-card-dark border      
  border-border-light dark:border-border-dark text-text-light
  dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary">        
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
        <option value="mixed" selected>Mixed</option>
      </select>
    </label>
  </div>

           <!-- About Section -->
            <h2 class="text-text-light dark:text-text-dark text-[22px] font-bold    
   leading-tight tracking-[-0.015em] pb-3 pt-8">About</h2>

            <div class="flex flex-col gap-3">
              <!-- Version Card -->
              <div class="bg-card-light dark:bg-card-dark rounded-xl p-4">
                <div class="flex items-center justify-between">
                  <p class="text-text-light dark:text-text-dark text-base
  font-medium">Version</p>
                  <p class="text-subtext-light dark:text-subtext-dark
  text-base">2.0.0</p>
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