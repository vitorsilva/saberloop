/**
 * Create Party View
 *
 * Host creates a party room, displays the room code,
 * manages participants, and starts the quiz.
 */

import BaseView from './BaseView.js';
import { t } from '../core/i18n.js';
import { createRoomCodeDisplay } from '../components/RoomCodeDisplay.js';
import { createParticipantList } from '../components/ParticipantList.js';
import { getQuizHistory } from '../services/quiz-service.js';
import { shareContent } from '../utils/share.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'CreatePartyView' });

export default class CreatePartyView extends BaseView {
  constructor() {
    super();
    this.roomCode = null;
    this.participants = [];
    this.selectedQuizId = null;
    this.quizzes = [];
  }

  async render() {
    // Load available quizzes
    this.quizzes = await getQuizHistory(20);

    this.setHTML(`
      <div class="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
        <!-- Header -->
        <div class="flex items-center p-4 gap-4 bg-background-light dark:bg-background-dark">
          <button id="backBtn" data-testid="back-btn" class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <span class="material-symbols-outlined text-text-light dark:text-text-dark">arrow_back</span>
          </button>
          <h1 class="text-text-light dark:text-text-dark text-lg font-bold">${t('party.create')}</h1>
        </div>

        <div class="flex-grow px-4 pb-24">
          <!-- Step 1: Select Quiz (before room created) -->
          <div id="selectQuizSection" class="py-6">
            <h2 class="text-text-light dark:text-text-dark text-xl font-bold mb-4">${t('party.selectQuiz')}</h2>

            <div id="quizList" class="flex flex-col gap-3 max-h-64 overflow-y-auto">
              ${this.renderQuizList()}
            </div>

            <button
              id="createRoomBtn"
              disabled
              class="mt-6 w-full py-4 rounded-xl bg-primary text-white font-bold text-lg
                     disabled:bg-gray-400 disabled:cursor-not-allowed
                     hover:bg-primary/90 transition-colors"
            >
              ${t('party.create')}
            </button>
          </div>

          <!-- Step 2: Room Created (after room created) -->
          <div id="roomSection" class="hidden py-6">
            <!-- Room code display will be inserted here -->
            <div id="roomCodeContainer" class="flex justify-center mb-8"></div>

            <!-- Participant list will be inserted here -->
            <div id="participantContainer" class="mb-8"></div>

            <!-- Start button -->
            <button
              id="startQuizBtn"
              disabled
              class="w-full py-4 rounded-xl bg-green-500 text-white font-bold text-lg
                     disabled:bg-gray-400 disabled:cursor-not-allowed
                     hover:bg-green-600 transition-colors"
            >
              ${t('party.start')}
            </button>

            <p id="minPlayersMsg" class="text-center text-subtext-light dark:text-subtext-dark text-sm mt-2">
              ${t('party.minParticipants', { count: 2 })}
            </p>

            <!-- Cancel button -->
            <button
              id="cancelPartyBtn"
              class="mt-4 w-full py-3 rounded-xl border-2 border-red-500 text-red-500 font-medium
                     hover:bg-red-500/10 transition-colors"
            >
              ${t('party.cancel')}
            </button>
          </div>
        </div>

        <!-- Loading overlay -->
        <div id="loadingOverlay" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-card-light dark:bg-card-dark rounded-2xl p-8 flex flex-col items-center gap-4">
            <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-text-light dark:text-text-dark">${t('party.creating')}</p>
          </div>
        </div>
      </div>
    `);

    this.attachListeners();
  }

  renderQuizList() {
    if (!this.quizzes || this.quizzes.length === 0) {
      return `
        <div class="text-center py-8 text-subtext-light dark:text-subtext-dark">
          <span class="material-symbols-outlined text-4xl mb-2">quiz</span>
          <p>${t('home.noQuizzes')}</p>
        </div>
      `;
    }

    return this.quizzes
      .map(
        (quiz) => `
      <button
        class="quiz-select-item flex items-center gap-4 p-4 rounded-xl
               bg-card-light dark:bg-card-dark
               border-2 border-transparent
               hover:border-primary/50 transition-colors text-left"
        data-quiz-id="${quiz.id}"
      >
        <span class="material-symbols-outlined text-primary text-2xl">school</span>
        <div class="flex-1">
          <p class="text-text-light dark:text-text-dark font-medium">${quiz.topic}</p>
          <p class="text-subtext-light dark:text-subtext-dark text-sm">${quiz.totalQuestions} questions</p>
        </div>
        <span class="material-symbols-outlined text-transparent quiz-check">check_circle</span>
      </button>
    `
      )
      .join('');
  }

  attachListeners() {
    // Back button
    const backBtn = this.querySelector('#backBtn');
    this.addEventListener(backBtn, 'click', () => {
      this.navigateTo('/');
    });

    // Quiz selection
    const quizItems = document.querySelectorAll('.quiz-select-item');
    quizItems.forEach((item) => {
      this.addEventListener(item, 'click', () => {
        // Deselect all
        quizItems.forEach((q) => {
          q.classList.remove('border-primary');
          q.querySelector('.quiz-check')?.classList.add('text-transparent');
          q.querySelector('.quiz-check')?.classList.remove('text-primary');
        });

        // Select this one
        item.classList.add('border-primary');
        item.querySelector('.quiz-check')?.classList.remove('text-transparent');
        item.querySelector('.quiz-check')?.classList.add('text-primary');

        this.selectedQuizId = parseInt(
          /** @type {HTMLElement} */ (item).dataset.quizId
        );

        // Enable create button
        const createBtn = this.querySelector('#createRoomBtn');
        if (createBtn) createBtn.removeAttribute('disabled');
      });
    });

    // Create room button
    const createRoomBtn = this.querySelector('#createRoomBtn');
    this.addEventListener(createRoomBtn, 'click', () => this.createRoom());

    // Start quiz button
    const startQuizBtn = this.querySelector('#startQuizBtn');
    this.addEventListener(startQuizBtn, 'click', () => this.startQuiz());

    // Cancel button
    const cancelPartyBtn = this.querySelector('#cancelPartyBtn');
    this.addEventListener(cancelPartyBtn, 'click', () => this.cancelParty());
  }

  async createRoom() {
    if (!this.selectedQuizId) {
      return;
    }

    // Show loading
    const overlay = this.querySelector('#loadingOverlay');
    overlay?.classList.remove('hidden');

    try {
      // TODO: Call room API to create room
      // For now, generate a mock room code
      this.roomCode = this.generateMockRoomCode();

      // Initialize participants with host
      this.participants = [
        {
          id: 'host-' + Date.now(),
          name: 'You',
          isHost: true,
          isYou: true,
          status: 'connected',
        },
      ];

      // Hide quiz selection, show room
      this.querySelector('#selectQuizSection')?.classList.add('hidden');
      this.querySelector('#roomSection')?.classList.remove('hidden');

      // Render room code display
      const roomCodeContainer = this.querySelector('#roomCodeContainer');
      if (roomCodeContainer) {
        const codeDisplay = createRoomCodeDisplay(this.roomCode, {
          showCopy: true,
          showShare: true,
          onShare: (code) => this.shareRoomCode(code),
        });
        roomCodeContainer.appendChild(codeDisplay);
      }

      // Render participant list
      this.updateParticipantList();

      log.info('Room created', { roomCode: this.roomCode });
    } catch (error) {
      log.error('Failed to create room', { error: error.message });
      alert(t('errors.generic'));
    } finally {
      overlay?.classList.add('hidden');
    }
  }

  generateMockRoomCode() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  updateParticipantList() {
    const container = this.querySelector('#participantContainer');
    if (container) {
      container.innerHTML = '';
      const list = createParticipantList(this.participants, {
        showStatus: true,
      });
      container.appendChild(list);
    }

    // Enable/disable start button based on participant count
    const startBtn = this.querySelector('#startQuizBtn');
    const minPlayersMsg = this.querySelector('#minPlayersMsg');

    if (this.participants.length >= 2) {
      startBtn?.removeAttribute('disabled');
      minPlayersMsg?.classList.add('hidden');
    } else {
      startBtn?.setAttribute('disabled', 'true');
      minPlayersMsg?.classList.remove('hidden');
    }
  }

  async shareRoomCode(code) {
    const joinUrl = `${window.location.origin}${window.location.pathname}#/party/join/${code}`;

    await shareContent({
      title: t('party.create'),
      text: `${t('party.shareCode')}: ${code}`,
      url: joinUrl,
    });
  }

  startQuiz() {
    if (this.participants.length < 2) {
      return;
    }

    // TODO: Broadcast start to all participants
    log.info('Starting quiz', {
      roomCode: this.roomCode,
      participants: this.participants.length,
    });

    // Navigate to party quiz view
    this.navigateTo(`/party/quiz/${this.roomCode}`);
  }

  cancelParty() {
    // TODO: Clean up room via API
    log.info('Party cancelled', { roomCode: this.roomCode });
    this.navigateTo('/');
  }

  destroy() {
    // TODO: Clean up P2P connections
    super.destroy();
  }
}
