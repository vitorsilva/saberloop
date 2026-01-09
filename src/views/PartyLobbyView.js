/**
 * Party Lobby View
 *
 * Waiting room for party participants.
 * Shows room info, participants, and waiting status.
 */

import BaseView from './BaseView.js';
import { t } from '../core/i18n.js';
import { createParticipantList } from '../components/ParticipantList.js';
import { logger } from '../utils/logger.js';
import router from '../core/router.js';

const log = logger.child({ module: 'PartyLobbyView' });

export default class PartyLobbyView extends BaseView {
  /**
   * @param {Object} [options]
   * @param {string} [options.roomCode] - Room code
   * @param {boolean} [options.isHost=false] - Whether current user is host
   */
  constructor(options = {}) {
    super();
    // Check for code from router (URL) or constructor options
    this.roomCode = options.roomCode || router.getPartyLobbyCode() || '';
    this.isHost = options.isHost || false;
    this.participants = [];
    this.quizInfo = null;
  }

  async render() {
    // TODO: Fetch room info from API
    // For now, use mock data
    this.quizInfo = {
      topic: 'History of Portugal',
      questionCount: 10,
      secondsPerQuestion: 30,
    };

    this.participants = [
      { id: 'host-1', name: 'Maria', isHost: true, status: 'connected' },
      { id: 'guest-1', name: 'You', isHost: false, isYou: true, status: 'connected' },
    ];

    this.setHTML(`
      <div class="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
        <!-- Header -->
        <div class="flex items-center p-4 gap-4 bg-background-light dark:bg-background-dark">
          <h1 class="text-text-light dark:text-text-dark text-lg font-bold flex-1">
            ${t('party.code')}: ${this.roomCode}
          </h1>
        </div>

        <div class="flex-grow px-4 pb-24">
          <!-- Waiting Status -->
          <div class="text-center py-8">
            <div class="text-6xl mb-4">⏳</div>
            <p class="text-text-light dark:text-text-dark text-lg font-medium">
              ${t('party.waiting')}
            </p>
          </div>

          <!-- Quiz Info -->
          <div class="bg-card-light dark:bg-card-dark rounded-xl p-4 mb-6">
            <h3 class="text-text-light dark:text-text-dark font-bold mb-2">
              ${this.quizInfo?.topic || 'Quiz'}
            </h3>
            <p class="text-subtext-light dark:text-subtext-dark text-sm">
              ${this.quizInfo?.questionCount || '?'} questions • ${this.quizInfo?.secondsPerQuestion || 30} sec each
            </p>
          </div>

          <!-- Participant List -->
          <div id="participantContainer" class="mb-6"></div>

          <!-- Leave Button -->
          <button
            id="leaveBtn"
            class="w-full py-3 rounded-xl border-2 border-red-500 text-red-500 font-medium
                   hover:bg-red-500/10 transition-colors"
          >
            ${t('party.leave')}
          </button>
        </div>

        <!-- Connection Status Bar -->
        <div class="fixed bottom-0 left-0 right-0 py-3 bg-green-500 text-white text-center text-sm">
          <span class="material-symbols-outlined text-sm align-middle mr-1">wifi</span>
          Connected
        </div>
      </div>
    `);

    // Render participant list
    this.updateParticipantList();

    this.attachListeners();
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
  }

  attachListeners() {
    // Leave button
    const leaveBtn = this.querySelector('#leaveBtn');
    this.addEventListener(leaveBtn, 'click', () => this.leaveParty());
  }

  leaveParty() {
    // TODO: Call API to leave room
    // TODO: Close P2P connections
    log.info('Leaving party', { roomCode: this.roomCode });
    this.navigateTo('/');
  }

  /**
   * Called when host starts the quiz.
   * @param {Object} quizData - Quiz data from host
   */
  onQuizStart(quizData) {
    log.info('Quiz started', { roomCode: this.roomCode });
    this.navigateTo(`/party/quiz/${this.roomCode}`);
  }

  /**
   * Called when host ends the party.
   */
  onHostLeft() {
    log.info('Host left party', { roomCode: this.roomCode });
    alert(t('party.hostLeft'));
    this.navigateTo('/');
  }

  /**
   * Called when a participant joins or leaves.
   * @param {Array} participants - Updated participant list
   */
  onParticipantsChanged(participants) {
    this.participants = participants;
    this.updateParticipantList();
  }

  destroy() {
    // TODO: Clean up P2P connections
    super.destroy();
  }
}
