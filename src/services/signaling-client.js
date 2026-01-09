/**
 * Signaling Client
 *
 * HTTP polling-based signaling for WebRTC connection setup.
 * Communicates with the VPS backend to exchange offer/answer/ICE messages.
 *
 * @module services/signaling-client
 */

import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'signaling-client' });

/**
 * @typedef {Object} SignalingMessage
 * @property {number} id - Message ID
 * @property {string} fromId - Sender participant ID
 * @property {string} toId - Recipient participant ID
 * @property {'offer'|'answer'|'ice'} type - Message type
 * @property {Object} payload - SDP or ICE candidate data
 * @property {string} createdAt - ISO timestamp
 */

/**
 * HTTP polling-based signaling client for WebRTC.
 */
export class SignalingClient {
  /**
   * Create a SignalingClient.
   *
   * @param {string} baseUrl - Base URL of the signaling API
   * @param {string} roomCode - Room code to communicate in
   * @param {string} participantId - This participant's ID
   */
  constructor(baseUrl, roomCode, participantId) {
    /** @type {string} */
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash

    /** @type {string} */
    this.roomCode = roomCode.toUpperCase();

    /** @type {string} */
    this.participantId = participantId;

    /** @type {number|null} */
    this.pollInterval = null;

    /** @type {boolean} */
    this.isPolling = false;

    /** @type {Function|null} */
    this.onMessageCallback = null;

    /** @type {number} */
    this.pollIntervalMs = 500; // Poll every 500ms

    /** @type {number} */
    this.consecutiveErrors = 0;

    /** @type {number} */
    this.maxConsecutiveErrors = 5;

    log.debug('SignalingClient created', { roomCode: this.roomCode, participantId });
  }

  /**
   * Send an offer to a peer.
   *
   * @param {string} toPeerId - Recipient peer ID
   * @param {RTCSessionDescriptionInit} offer - SDP offer
   * @returns {Promise<void>}
   */
  async sendOffer(toPeerId, offer) {
    await this._sendMessage(toPeerId, 'offer', { sdp: offer.sdp, type: offer.type });
    log.debug('Sent offer', { to: toPeerId });
  }

  /**
   * Send an answer to a peer.
   *
   * @param {string} toPeerId - Recipient peer ID
   * @param {RTCSessionDescriptionInit} answer - SDP answer
   * @returns {Promise<void>}
   */
  async sendAnswer(toPeerId, answer) {
    await this._sendMessage(toPeerId, 'answer', { sdp: answer.sdp, type: answer.type });
    log.debug('Sent answer', { to: toPeerId });
  }

  /**
   * Send an ICE candidate to a peer.
   *
   * @param {string} toPeerId - Recipient peer ID
   * @param {RTCIceCandidate} candidate - ICE candidate
   * @returns {Promise<void>}
   */
  async sendIceCandidate(toPeerId, candidate) {
    await this._sendMessage(toPeerId, 'ice', {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
    });
    log.debug('Sent ICE candidate', { to: toPeerId });
  }

  /**
   * Send a signaling message to the server.
   *
   * @private
   * @param {string} toId - Recipient ID
   * @param {'offer'|'answer'|'ice'} type - Message type
   * @param {Object} payload - Message payload
   * @returns {Promise<Object>} Server response
   */
  async _sendMessage(toId, type, payload) {
    const response = await fetch(`${this.baseUrl}/endpoints/signal.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomCode: this.roomCode,
        fromId: this.participantId,
        toId,
        type,
        payload,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get other participants in the room (peers to connect to).
   *
   * @returns {Promise<string[]>} Array of peer IDs
   */
  async getPeers() {
    const url = `${this.baseUrl}/endpoints/signal.php/${this.roomCode}/${this.participantId}/peers`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to get peers: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.data?.peers || [];
  }

  /**
   * Start polling for messages.
   *
   * @param {Function} onMessage - Callback for received messages
   */
  startPolling(onMessage) {
    if (this.isPolling) {
      log.warn('Already polling');
      return;
    }

    this.onMessageCallback = onMessage;
    this.isPolling = true;
    this.consecutiveErrors = 0;

    log.info('Started polling', { roomCode: this.roomCode });

    this._poll();
  }

  /**
   * Stop polling for messages.
   */
  stopPolling() {
    this.isPolling = false;

    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
      this.pollInterval = null;
    }

    log.info('Stopped polling', { roomCode: this.roomCode });
  }

  /**
   * Poll for messages once.
   *
   * @private
   */
  async _poll() {
    if (!this.isPolling) return;

    try {
      const messages = await this._fetchMessages();
      this.consecutiveErrors = 0;

      for (const message of messages) {
        if (this.onMessageCallback) {
          this.onMessageCallback(message);
        }
      }
    } catch (error) {
      this.consecutiveErrors++;
      log.error('Poll error', { error: error.message, consecutive: this.consecutiveErrors });

      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        log.error('Too many consecutive errors, stopping polling');
        this.stopPolling();
        return;
      }
    }

    // Schedule next poll
    if (this.isPolling) {
      this.pollInterval = setTimeout(() => this._poll(), this.pollIntervalMs);
    }
  }

  /**
   * Fetch messages from the server.
   *
   * @private
   * @returns {Promise<SignalingMessage[]>}
   */
  async _fetchMessages() {
    const url = `${this.baseUrl}/endpoints/signal.php/${this.roomCode}/${this.participantId}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.data?.messages || [];
  }

  /**
   * Set the polling interval.
   *
   * @param {number} ms - Interval in milliseconds
   */
  setPollInterval(ms) {
    this.pollIntervalMs = ms;
  }

  /**
   * Clean up resources.
   */
  destroy() {
    this.stopPolling();
    this.onMessageCallback = null;
    log.debug('SignalingClient destroyed');
  }
}

/**
 * Get the signaling API base URL.
 *
 * @returns {string} Base URL
 */
export function getSignalingBaseUrl() {
  // Use environment variable or default to production
  return import.meta.env.VITE_PARTY_API_URL || 'https://saberloop.com/party';
}
