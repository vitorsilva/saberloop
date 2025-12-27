import BaseView from './BaseView.js';

export default class HelpView extends BaseView {
  constructor() {
    super();
  }

  render() {
    this.setHTML(`
      <div class="relative flex h-auto min-h-screen w-full flex-col
bg-background-light dark:bg-background-dark overflow-x-hidden">
        <!-- Top App Bar -->
        <div class="flex items-center p-4 pb-2 gap-3
bg-background-light dark:bg-background-dark">
          <a href="#/settings" class="text-text-light dark:text-text-dark">
            <span class="material-symbols-outlined">arrow_back</span>
          </a>
          <h1 data-testid="help-title" class="text-text-light dark:text-text-dark text-lg font-bold
leading-tight tracking-[-0.015em] flex-1">Help</h1>
        </div>

        <div class="flex-grow px-4 pb-8">
          <!-- FAQ Section -->
          <h2 class="text-text-light dark:text-text-dark text-[22px] font-bold
leading-tight tracking-[-0.015em] pb-3 pt-4">Frequently Asked Questions</h2>

          <div class="flex flex-col gap-3" id="faqContainer">
            <!-- FAQ items will be rendered here -->
          </div>

          <!-- Contact Section -->
          <h2 class="text-text-light dark:text-text-dark text-[22px] font-bold
leading-tight tracking-[-0.015em] pb-3 pt-8">Need More Help?</h2>

          <div class="flex flex-col gap-3">
            <a href="https://github.com/vitorsilva/demo-pwa-app/issues"
target="_blank" rel="noopener noreferrer"
class="bg-card-light dark:bg-card-dark rounded-xl p-4 flex items-center
justify-between hover:bg-primary/10 transition-colors">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-text-light
dark:text-text-dark">bug_report</span>
                <div>
                  <p class="text-text-light dark:text-text-dark text-base
font-medium">Report an Issue</p>
                  <p class="text-subtext-light dark:text-subtext-dark text-sm">
Open a GitHub issue</p>
                </div>
              </div>
              <span class="material-symbols-outlined text-subtext-light
dark:text-subtext-dark">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    `);

    this.renderFAQ();
    this.bindEvents();
  }

  renderFAQ() {
    const faqData = [
      {
        question: 'How do I create a quiz?',
        answer: 'From the Home screen, tap "Start New Quiz", enter a topic you want to learn about, and tap "Generate Quiz". The AI will create personalized questions for you.'
      },
      {
        question: 'Does the app work offline?',
        answer: 'Yes! Sample quizzes are available offline. However, generating new quizzes requires an internet connection and an OpenRouter API key.'
      },
      {
        question: 'How do I connect to OpenRouter?',
        answer: 'Go to Settings and tap "Connect with OpenRouter". You\'ll be redirected to create a free account. Once connected, you can generate unlimited quizzes (within API limits).'
      },
      {
        question: 'Is my data private?',
        answer: 'Yes. Your quiz history and settings are stored locally on your device. Your OpenRouter API key is also stored locally and only used to generate quizzes.'
      },
      {
        question: 'What is OpenRouter?',
        answer: 'OpenRouter is a service that provides access to AI models. Saberloop uses it to generate quiz questions. You can create a free account with limited daily requests.'
      }
    ];

    const container = this.querySelector('#faqContainer');

    container.innerHTML = faqData.map((faq, index) => `
      <div class="bg-card-light dark:bg-card-dark rounded-xl overflow-hidden">
        <button class="faq-toggle w-full p-4 flex items-center justify-between
text-left" data-index="${index}">
          <p class="text-text-light dark:text-text-dark text-base font-medium
pr-4">${faq.question}</p>
          <span class="material-symbols-outlined text-subtext-light
dark:text-subtext-dark transition-transform duration-200 faq-icon"
data-index="${index}">expand_more</span>
        </button>
        <div class="faq-answer hidden px-4 pb-4" data-index="${index}">
          <p class="text-subtext-light dark:text-subtext-dark text-sm
leading-relaxed">${faq.answer}</p>
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    const toggles = this.appContainer.querySelectorAll('.faq-toggle');

    toggles.forEach(toggle => {
      this.addEventListener(toggle, 'click', (e) => {
        const index = toggle.dataset.index;
        const answer = this.querySelector(`.faq-answer[data-index="${index}"]`);
        const icon = this.querySelector(`.faq-icon[data-index="${index}"]`);

        // Toggle visibility
        answer.classList.toggle('hidden');

        // Rotate icon
        if (answer.classList.contains('hidden')) {
          icon.style.transform = 'rotate(0deg)';
        } else {
          icon.style.transform = 'rotate(180deg)';
        }
      });
    });
  }
}
