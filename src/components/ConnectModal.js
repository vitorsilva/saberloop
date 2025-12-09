  import { startAuth } from '../api/openrouter-auth.js';
  import { logger } from '../utils/logger.js';

  /**
   * Show a modal prompting user to connect to OpenRouter
   * @returns {Promise<boolean>} true if user connected, false if cancelled
   */
  export function showConnectModal() {
    return new Promise((resolve) => {
      // Create modal backdrop
      const backdrop = document.createElement('div');
      backdrop.id = 'connectModal';
      backdrop.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';

      backdrop.innerHTML = `
        <div class="bg-background-light dark:bg-background-dark rounded-2xl p-6 max-w-sm      
  w-full shadow-xl">
          <div class="flex flex-col items-center text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-full
  bg-primary/10 mb-4">
              <span class="material-symbols-outlined text-3xl text-primary">link</span>       
            </div>

            <h2 class="text-xl font-bold text-text-light dark:text-text-dark mb-2">
              Connect to OpenRouter
            </h2>

            <p class="text-subtext-light dark:text-subtext-dark text-sm mb-6">
              To generate new quizzes, you need to connect your OpenRouter account. It's      
  free!
            </p>

            <button
              id="connectBtn"
              class="w-full h-12 rounded-xl bg-primary text-white font-bold
  hover:bg-primary/90 transition-colors mb-3"
            >
              Connect with OpenRouter
            </button>

            <button
              id="cancelBtn"
              class="w-full h-12 rounded-xl bg-transparent text-subtext-light
  dark:text-subtext-dark font-medium hover:bg-card-light dark:hover:bg-card-dark
  transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);

      // Handle connect button
      const connectBtn = backdrop.querySelector('#connectBtn');
      connectBtn.addEventListener('click', async () => {
        connectBtn.disabled = true;
        connectBtn.innerHTML = `
          <span class="material-symbols-outlined animate-spin
  mr-2">progress_activity</span>
          Connecting...
        `;

        try {
          await startAuth();
          // Auth redirects, so we won't reach here
        } catch (error) {
          logger.error('Auth failed in ConnectModal', { error: error.message });
          connectBtn.disabled = false;
          connectBtn.textContent = 'Connect with OpenRouter';
        }
      });

      // Handle cancel button
      const cancelBtn = backdrop.querySelector('#cancelBtn');
      cancelBtn.addEventListener('click', () => {
        backdrop.remove();
        resolve(false);
      });

      // Handle backdrop click (close modal)
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.remove();
          resolve(false);
        }
      });
    });
  }