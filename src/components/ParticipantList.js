/**
 * Participant List Component
 *
 * Displays party participants with their status.
 */

import { t } from '../core/i18n.js';

/**
 * @typedef {Object} Participant
 * @property {string} id - Participant ID
 * @property {string} name - Display name
 * @property {boolean} isHost - Whether this participant is the host
 * @property {boolean} [isYou] - Whether this is the current user
 * @property {'connected' | 'connecting' | 'disconnected'} [status] - Connection status
 */

/**
 * Creates a participant list element.
 * @param {Participant[]} participants - List of participants
 * @param {Object} [options] - Display options
 * @param {boolean} [options.showStatus=false] - Show connection status indicators
 * @param {string} [options.currentUserId] - ID of the current user (to mark as "You")
 * @returns {HTMLElement}
 */
export function createParticipantList(participants, options = {}) {
  const { showStatus = false, currentUserId } = options;

  const container = document.createElement('div');
  container.className = 'participant-list flex flex-col gap-2';

  // Header
  const header = document.createElement('h4');
  header.className =
    'text-subtext-light dark:text-subtext-dark text-sm font-medium';
  header.textContent = `${t('party.participants')} (${participants.length})`;
  container.appendChild(header);

  // List
  const list = document.createElement('ul');
  list.className = 'flex flex-col gap-1';
  list.setAttribute('data-testid', 'participant-list');

  participants.forEach((participant) => {
    const item = document.createElement('li');
    item.className =
      'flex items-center gap-2 py-2 px-3 rounded-lg bg-card-light dark:bg-card-dark';
    item.setAttribute('data-participant-id', participant.id);

    // Status indicator (if enabled)
    if (showStatus && participant.status) {
      const statusDot = document.createElement('span');
      statusDot.className = `w-2 h-2 rounded-full ${getStatusColor(participant.status)}`;
      statusDot.title = participant.status;
      item.appendChild(statusDot);
    }

    // Avatar placeholder
    const avatar = document.createElement('span');
    avatar.className =
      'w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold';
    avatar.textContent = participant.name.charAt(0).toUpperCase();
    item.appendChild(avatar);

    // Name
    const name = document.createElement('span');
    name.className = 'text-text-light dark:text-text-dark text-sm flex-1';

    const isYou = participant.isYou || participant.id === currentUserId;

    if (isYou) {
      name.innerHTML = `${participant.name} <span class="text-subtext-light dark:text-subtext-dark">(${t('party.you')})</span>`;
    } else {
      name.textContent = participant.name;
    }
    item.appendChild(name);

    // Host badge
    if (participant.isHost) {
      const badge = document.createElement('span');
      badge.className =
        'text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium';
      badge.textContent = t('party.host');
      item.appendChild(badge);
    }

    list.appendChild(item);
  });

  container.appendChild(list);

  return container;
}

/**
 * Gets the Tailwind color class for a status.
 * @param {'connected' | 'connecting' | 'disconnected'} status
 * @returns {string}
 */
function getStatusColor(status) {
  switch (status) {
    case 'connected':
      return 'bg-green-500';
    case 'connecting':
      return 'bg-yellow-500';
    case 'disconnected':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Updates the participant list in place.
 * @param {HTMLElement} container - The participant list container
 * @param {Participant[]} participants - Updated participants
 * @param {Object} [options] - Same options as createParticipantList
 */
export function updateParticipantList(container, participants, options = {}) {
  // Replace contents with new list
  const newList = createParticipantList(participants, options);
  container.innerHTML = newList.innerHTML;
}
