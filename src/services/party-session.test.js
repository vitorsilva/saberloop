/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SCORING,
  MESSAGE_TYPES,
  SESSION_STATES,
  calculatePoints,
  getCurrentQuestionIndex,
  getTimeRemaining,
  PartySession,
} from './party-session.js';

// Mock logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    child: () => ({
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

/**
 * Create a mock P2P service.
 */
function createMockP2P() {
  const callbacks = {
    onMessage: null,
    onPeerConnected: null,
    onPeerDisconnected: null,
  };

  return {
    onMessage: vi.fn((cb) => { callbacks.onMessage = cb; }),
    onPeerConnected: vi.fn((cb) => { callbacks.onPeerConnected = cb; }),
    onPeerDisconnected: vi.fn((cb) => { callbacks.onPeerDisconnected = cb; }),
    send: vi.fn(),
    broadcast: vi.fn(),
    destroy: vi.fn(),
    peers: new Map(),
    // Test helpers
    _callbacks: callbacks,
    _simulateMessage: (peerId, message) => {
      if (callbacks.onMessage) callbacks.onMessage(peerId, message);
    },
    _simulatePeerConnected: (peerId) => {
      if (callbacks.onPeerConnected) callbacks.onPeerConnected(peerId);
    },
    _simulatePeerDisconnected: (peerId, reason) => {
      if (callbacks.onPeerDisconnected) callbacks.onPeerDisconnected(peerId, reason);
    },
  };
}

/**
 * Create a sample quiz for testing.
 */
function createSampleQuiz() {
  return {
    topic: 'Test Quiz',
    questions: [
      { question: 'Q1?', options: ['A', 'B', 'C', 'D'], correct: 0 },
      { question: 'Q2?', options: ['A', 'B', 'C', 'D'], correct: 1 },
      { question: 'Q3?', options: ['A', 'B', 'C', 'D'], correct: 2 },
    ],
  };
}

// =============================================================================
// SCORING CONSTANTS TESTS
// =============================================================================

describe('SCORING constants', () => {
  it('has expected default values', () => {
    expect(SCORING.basePoints).toBe(10);
    expect(SCORING.maxSpeedBonus).toBe(5);
    expect(SCORING.speedBonusWindow).toBe(5000);
    expect(SCORING.wrongAnswerPoints).toBe(0);
    expect(SCORING.noAnswerPoints).toBe(0);
  });
});

// =============================================================================
// MESSAGE_TYPES TESTS
// =============================================================================

describe('MESSAGE_TYPES constants', () => {
  it('has all expected message types', () => {
    expect(MESSAGE_TYPES.SESSION_INFO).toBe('session_info');
    expect(MESSAGE_TYPES.QUIZ_START).toBe('quiz_start');
    expect(MESSAGE_TYPES.SCORE_UPDATE).toBe('score_update');
    expect(MESSAGE_TYPES.QUIZ_END).toBe('quiz_end');
    expect(MESSAGE_TYPES.KICK).toBe('kick');
    expect(MESSAGE_TYPES.ANSWER).toBe('answer');
    expect(MESSAGE_TYPES.LEAVE).toBe('leave');
  });
});

// =============================================================================
// SESSION_STATES TESTS
// =============================================================================

describe('SESSION_STATES constants', () => {
  it('has all expected states', () => {
    expect(SESSION_STATES.WAITING).toBe('waiting');
    expect(SESSION_STATES.PLAYING).toBe('playing');
    expect(SESSION_STATES.FINISHED).toBe('finished');
    expect(SESSION_STATES.ENDED).toBe('ended');
  });
});

// =============================================================================
// calculatePoints TESTS
// =============================================================================

describe('calculatePoints', () => {
  it('returns 0 for wrong answers', () => {
    expect(calculatePoints(false, 0)).toBe(0);
    expect(calculatePoints(false, 1000)).toBe(0);
    expect(calculatePoints(false, 5000)).toBe(0);
    expect(calculatePoints(false, 10000)).toBe(0);
  });

  it('returns base points for correct answers with no speed bonus', () => {
    // At or after speed bonus window, no bonus
    expect(calculatePoints(true, 5000)).toBe(10);
    expect(calculatePoints(true, 6000)).toBe(10);
    expect(calculatePoints(true, 10000)).toBe(10);
  });

  it('returns max points for instant answers', () => {
    // 0ms response = base (10) + max speed bonus (5) = 15
    expect(calculatePoints(true, 0)).toBe(15);
  });

  it('calculates speed bonus correctly for fast answers', () => {
    // 1000ms = 80% of bonus window remaining = 4 bonus points
    // speedRatio = 1 - (1000/5000) = 0.8, bonus = round(5 * 0.8) = 4
    expect(calculatePoints(true, 1000)).toBe(14);

    // 2500ms = 50% of bonus window remaining = 2.5 = 3 bonus points (rounded)
    // speedRatio = 1 - (2500/5000) = 0.5, bonus = round(5 * 0.5) = 3
    expect(calculatePoints(true, 2500)).toBe(13);

    // 4000ms = 20% of bonus window remaining = 1 bonus point
    // speedRatio = 1 - (4000/5000) = 0.2, bonus = round(5 * 0.2) = 1
    expect(calculatePoints(true, 4000)).toBe(11);
  });

  it('handles edge case at exactly speed bonus window', () => {
    // At 4999ms, still gets tiny bonus
    // speedRatio = 1 - (4999/5000) = 0.0002, bonus = round(5 * 0.0002) = 0
    expect(calculatePoints(true, 4999)).toBe(10);
  });
});

// =============================================================================
// getCurrentQuestionIndex TESTS
// =============================================================================

describe('getCurrentQuestionIndex', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns -1 when startTime is 0 or falsy', () => {
    expect(getCurrentQuestionIndex(0, 30, 5)).toBe(-1);
    expect(getCurrentQuestionIndex(null, 30, 5)).toBe(-1);
    expect(getCurrentQuestionIndex(undefined, 30, 5)).toBe(-1);
  });

  it('returns 0 for first question', () => {
    const startTime = Date.now();
    vi.advanceTimersByTime(0);
    expect(getCurrentQuestionIndex(startTime, 30, 5)).toBe(0);
  });

  it('advances to next question after time elapses', () => {
    const startTime = Date.now();

    // Still in question 1 (0-indexed)
    vi.advanceTimersByTime(29000);
    expect(getCurrentQuestionIndex(startTime, 30, 5)).toBe(0);

    // Now in question 2
    vi.advanceTimersByTime(1000); // Total: 30s
    expect(getCurrentQuestionIndex(startTime, 30, 5)).toBe(1);

    // Now in question 3
    vi.advanceTimersByTime(30000); // Total: 60s
    expect(getCurrentQuestionIndex(startTime, 30, 5)).toBe(2);
  });

  it('caps at last question index', () => {
    const startTime = Date.now();

    // Way past all questions
    vi.advanceTimersByTime(300000); // 5 minutes
    expect(getCurrentQuestionIndex(startTime, 30, 5)).toBe(4); // Last question (0-indexed)
  });

  it('works with different secondsPerQuestion', () => {
    const startTime = Date.now();

    vi.advanceTimersByTime(15000); // 15 seconds
    expect(getCurrentQuestionIndex(startTime, 15, 3)).toBe(1); // Second question
  });
});

// =============================================================================
// getTimeRemaining TESTS
// =============================================================================

describe('getTimeRemaining', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 0 when startTime is 0 or falsy', () => {
    expect(getTimeRemaining(0, 30)).toBe(0);
    expect(getTimeRemaining(null, 30)).toBe(0);
    expect(getTimeRemaining(undefined, 30)).toBe(0);
  });

  it('returns full time at question start', () => {
    const startTime = Date.now();
    expect(getTimeRemaining(startTime, 30)).toBe(30000);
  });

  it('returns decreasing time as question progresses', () => {
    const startTime = Date.now();

    vi.advanceTimersByTime(10000); // 10 seconds elapsed
    expect(getTimeRemaining(startTime, 30)).toBe(20000);

    vi.advanceTimersByTime(15000); // 25 seconds elapsed
    expect(getTimeRemaining(startTime, 30)).toBe(5000);
  });

  it('resets for new question', () => {
    const startTime = Date.now();

    vi.advanceTimersByTime(30000); // Exactly 30s - start of question 2
    expect(getTimeRemaining(startTime, 30)).toBe(30000);

    vi.advanceTimersByTime(5000); // 35s total, 5s into question 2
    expect(getTimeRemaining(startTime, 30)).toBe(25000);
  });
});

// =============================================================================
// PartySession TESTS - Constructor
// =============================================================================

describe('PartySession', () => {
  let mockP2P;

  beforeEach(() => {
    mockP2P = createMockP2P();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('initializes as host correctly', () => {
      const session = new PartySession(mockP2P, true);

      expect(session.isHost).toBe(true);
      expect(session.participantId).toMatch(/^host-/);
      expect(session.state).toBe(SESSION_STATES.WAITING);
      expect(session.participants.size).toBe(0);
    });

    it('initializes as guest correctly', () => {
      const session = new PartySession(mockP2P, false);

      expect(session.isHost).toBe(false);
      expect(session.participantId).toMatch(/^guest-/);
      expect(session.state).toBe(SESSION_STATES.WAITING);
    });

    it('sets up P2P message handlers', () => {
      new PartySession(mockP2P, true);

      expect(mockP2P.onMessage).toHaveBeenCalled();
      expect(mockP2P.onPeerConnected).toHaveBeenCalled();
      expect(mockP2P.onPeerDisconnected).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // HOST METHODS
  // ===========================================================================

  describe('createSession (host)', () => {
    it('creates a session with quiz data', () => {
      const session = new PartySession(mockP2P, true);
      const quiz = createSampleQuiz();

      session.createSession(quiz, 'ABCD', 'Host Player', 20);

      expect(session.quiz).toBe(quiz);
      expect(session.roomCode).toBe('ABCD');
      expect(session.participantName).toBe('Host Player');
      expect(session.secondsPerQuestion).toBe(20);
      expect(session.state).toBe(SESSION_STATES.WAITING);
    });

    it('adds host as first participant', () => {
      const session = new PartySession(mockP2P, true);

      session.createSession(createSampleQuiz(), 'ABCD', 'Host Player');

      expect(session.participants.size).toBe(1);
      const host = session.participants.get(session.participantId);
      expect(host.name).toBe('Host Player');
      expect(host.isHost).toBe(true);
      expect(host.score).toBe(0);
    });

    it('throws error if called by guest', () => {
      const session = new PartySession(mockP2P, false);

      expect(() => {
        session.createSession(createSampleQuiz(), 'ABCD', 'Guest');
      }).toThrow('Only host can create session');
    });

    it('triggers participants change callback', () => {
      const session = new PartySession(mockP2P, true);
      const callback = vi.fn();
      session.onParticipantsChange(callback);

      session.createSession(createSampleQuiz(), 'ABCD', 'Host');

      expect(callback).toHaveBeenCalledWith(expect.any(Array));
      expect(callback.mock.calls[0][0]).toHaveLength(1);
    });
  });

  describe('addParticipant (host)', () => {
    it('adds a new participant', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');

      session.addParticipant('peer-123', 'Guest Player');

      expect(session.participants.size).toBe(2);
      const guest = session.participants.get('peer-123');
      expect(guest.name).toBe('Guest Player');
      expect(guest.isHost).toBe(false);
      expect(guest.score).toBe(0);
    });

    it('does nothing if called by guest', () => {
      const session = new PartySession(mockP2P, false);

      session.addParticipant('peer-123', 'Another Guest');

      expect(session.participants.size).toBe(0);
    });
  });

  describe('startQuiz (host)', () => {
    it('starts the quiz', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');

      session.startQuiz();

      expect(session.state).toBe(SESSION_STATES.PLAYING);
      expect(session.startTime).toBeGreaterThan(0);
      expect(session.currentQuestion).toBe(0);
    });

    it('broadcasts start time to peers', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');

      session.startQuiz();

      expect(mockP2P.broadcast).toHaveBeenCalledWith({
        type: MESSAGE_TYPES.QUIZ_START,
        payload: { startTime: session.startTime },
      });
    });

    it('sets all participants to thinking status', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.addParticipant('peer-123', 'Guest');

      session.startQuiz();

      for (const participant of session.participants.values()) {
        expect(participant.status).toBe('thinking');
      }
    });

    it('throws error if called by guest', () => {
      const session = new PartySession(mockP2P, false);

      expect(() => {
        session.startQuiz();
      }).toThrow('Only host can start quiz');
    });

    it('throws error if quiz already started', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.startQuiz();

      expect(() => {
        session.startQuiz();
      }).toThrow('Quiz already started');
    });
  });

  describe('submitHostAnswer', () => {
    it('records host answer and calculates score', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.startQuiz();

      // Submit correct answer immediately (should get max points)
      session.submitHostAnswer(0, 0); // Correct answer for Q1

      const host = session.participants.get(session.participantId);
      expect(host.answers[0]).toBe(0);
      expect(host.score).toBe(15); // Base 10 + max speed bonus 5
      expect(host.status).toBe('answered');
    });

    it('ignores duplicate answers for same question', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.startQuiz();

      session.submitHostAnswer(0, 0);
      const scoreBefore = session.participants.get(session.participantId).score;

      session.submitHostAnswer(0, 1); // Try to change answer

      const scoreAfter = session.participants.get(session.participantId).score;
      expect(scoreAfter).toBe(scoreBefore);
    });

    it('broadcasts score update', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.startQuiz();
      mockP2P.broadcast.mockClear();

      session.submitHostAnswer(0, 0);

      expect(mockP2P.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MESSAGE_TYPES.SCORE_UPDATE,
        })
      );
    });
  });

  describe('endSession', () => {
    it('ends the session and destroys P2P', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.startQuiz();

      session.endSession();

      expect(session.state).toBe(SESSION_STATES.ENDED);
      expect(mockP2P.destroy).toHaveBeenCalled();
    });

    it('clears question timer', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.startQuiz();
      expect(session.questionTimer).not.toBeNull();

      session.endSession();

      expect(session.questionTimer).toBeNull();
    });
  });

  // ===========================================================================
  // GUEST METHODS
  // ===========================================================================

  describe('joinSession (guest)', () => {
    it('sets room code and name', () => {
      const session = new PartySession(mockP2P, false);

      session.joinSession('ABCD', 'Guest Player');

      expect(session.roomCode).toBe('ABCD');
      expect(session.participantName).toBe('Guest Player');
    });

    it('throws error if called by host', () => {
      const session = new PartySession(mockP2P, true);

      expect(() => {
        session.joinSession('ABCD', 'Host as Guest');
      }).toThrow('Host cannot join as guest');
    });
  });

  describe('submitAnswer (guest)', () => {
    it('broadcasts answer to host', () => {
      const session = new PartySession(mockP2P, false);
      session.joinSession('ABCD', 'Guest');
      session.quiz = createSampleQuiz();
      session.participants.set(session.participantId, {
        id: session.participantId,
        name: 'Guest',
        isHost: false,
        score: 0,
        answers: [],
        answerTimes: [],
        status: 'connected',
      });

      session.submitAnswer(0, 1);

      expect(mockP2P.broadcast).toHaveBeenCalledWith({
        type: MESSAGE_TYPES.ANSWER,
        payload: {
          questionIndex: 0,
          answerIndex: 1,
          timestamp: expect.any(Number),
        },
      });
    });

    it('updates local participant status', () => {
      const session = new PartySession(mockP2P, false);
      session.joinSession('ABCD', 'Guest');
      session.participants.set(session.participantId, {
        id: session.participantId,
        name: 'Guest',
        isHost: false,
        score: 0,
        answers: [],
        answerTimes: [],
        status: 'connected',
      });

      session.submitAnswer(0, 1);

      const participant = session.participants.get(session.participantId);
      expect(participant.answers[0]).toBe(1);
      expect(participant.status).toBe('answered');
    });

    it('delegates to submitHostAnswer if called by host', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.startQuiz();

      session.submitAnswer(0, 0);

      const host = session.participants.get(session.participantId);
      expect(host.answers[0]).toBe(0);
      expect(host.score).toBeGreaterThan(0);
    });
  });

  describe('leaveSession (guest)', () => {
    it('broadcasts leave message', () => {
      const session = new PartySession(mockP2P, false);
      session.joinSession('ABCD', 'Guest');

      session.leaveSession();

      expect(mockP2P.broadcast).toHaveBeenCalledWith({
        type: MESSAGE_TYPES.LEAVE,
        payload: { participantId: session.participantId },
      });
    });

    it('destroys P2P connection', () => {
      const session = new PartySession(mockP2P, false);
      session.joinSession('ABCD', 'Guest');

      session.leaveSession();

      expect(session.state).toBe(SESSION_STATES.ENDED);
      expect(mockP2P.destroy).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // SHARED METHODS
  // ===========================================================================

  describe('getCurrentQuestion', () => {
    it('returns null if no quiz', () => {
      const session = new PartySession(mockP2P, true);
      expect(session.getCurrentQuestion()).toBeNull();
    });

    it('returns null if currentQuestion is -1', () => {
      const session = new PartySession(mockP2P, true);
      session.quiz = createSampleQuiz();
      session.currentQuestion = -1;
      expect(session.getCurrentQuestion()).toBeNull();
    });

    it('returns current question', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.startQuiz();

      const question = session.getCurrentQuestion();

      expect(question).toBe(session.quiz.questions[0]);
    });
  });

  describe('getParticipants', () => {
    it('returns array of participants', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.addParticipant('peer-1', 'Guest 1');
      session.addParticipant('peer-2', 'Guest 2');

      const participants = session.getParticipants();

      expect(participants).toHaveLength(3);
      expect(participants.map(p => p.name)).toContain('Host');
      expect(participants.map(p => p.name)).toContain('Guest 1');
      expect(participants.map(p => p.name)).toContain('Guest 2');
    });
  });

  describe('getStandings', () => {
    it('returns participants sorted by score (highest first)', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.addParticipant('peer-1', 'Guest 1');
      session.addParticipant('peer-2', 'Guest 2');

      // Set different scores
      session.participants.get(session.participantId).score = 10;
      session.participants.get('peer-1').score = 25;
      session.participants.get('peer-2').score = 5;

      const standings = session.getStandings();

      expect(standings[0].name).toBe('Guest 1');
      expect(standings[0].score).toBe(25);
      expect(standings[1].name).toBe('Host');
      expect(standings[1].score).toBe(10);
      expect(standings[2].name).toBe('Guest 2');
      expect(standings[2].score).toBe(5);
    });
  });

  describe('getSelf', () => {
    it('returns own participant data', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'My Name');

      const self = session.getSelf();

      expect(self.name).toBe('My Name');
      expect(self.id).toBe(session.participantId);
    });

    it('returns null if not in participants', () => {
      const session = new PartySession(mockP2P, true);
      expect(session.getSelf()).toBeNull();
    });
  });

  // ===========================================================================
  // MESSAGE HANDLING
  // ===========================================================================

  describe('message handling', () => {
    describe('SESSION_INFO (guest receives)', () => {
      it('updates guest with session info', () => {
        const session = new PartySession(mockP2P, false);
        session.joinSession('ABCD', 'Guest');

        mockP2P._simulateMessage('host-peer', {
          type: MESSAGE_TYPES.SESSION_INFO,
          payload: {
            quiz: createSampleQuiz(),
            roomCode: 'ABCD',
            secondsPerQuestion: 15,
            participants: [{ id: 'host-1', name: 'Host', isHost: true, score: 0 }],
            state: SESSION_STATES.WAITING,
          },
        });

        expect(session.quiz.topic).toBe('Test Quiz');
        expect(session.secondsPerQuestion).toBe(15);
        expect(session.participants.size).toBe(2); // Host + self
      });

      it('ignores if host', () => {
        const session = new PartySession(mockP2P, true);
        session.createSession(createSampleQuiz(), 'ABCD', 'Host');

        mockP2P._simulateMessage('peer-1', {
          type: MESSAGE_TYPES.SESSION_INFO,
          payload: {
            quiz: { topic: 'Fake Quiz' },
            roomCode: 'FAKE',
          },
        });

        expect(session.roomCode).toBe('ABCD'); // Unchanged
      });
    });

    describe('QUIZ_START (guest receives)', () => {
      it('sets startTime and state', () => {
        const session = new PartySession(mockP2P, false);
        session.joinSession('ABCD', 'Guest');
        session.quiz = createSampleQuiz();

        mockP2P._simulateMessage('host-peer', {
          type: MESSAGE_TYPES.QUIZ_START,
          payload: { startTime: 1234567890 },
        });

        expect(session.startTime).toBe(1234567890);
        expect(session.state).toBe(SESSION_STATES.PLAYING);
        expect(session.currentQuestion).toBe(0);
      });
    });

    describe('ANSWER (host receives)', () => {
      it('processes guest answer and updates score', () => {
        const session = new PartySession(mockP2P, true);
        session.createSession(createSampleQuiz(), 'ABCD', 'Host');
        session.addParticipant('peer-1', 'Guest');
        session.startQuiz();

        // Simulate answer from guest (correct answer, fast response)
        mockP2P._simulateMessage('peer-1', {
          type: MESSAGE_TYPES.ANSWER,
          payload: {
            questionIndex: 0,
            answerIndex: 0, // Correct
            timestamp: session.startTime + 500, // 500ms response time
          },
        });

        const guest = session.participants.get('peer-1');
        expect(guest.answers[0]).toBe(0);
        expect(guest.score).toBeGreaterThan(10); // Should have speed bonus
        expect(guest.status).toBe('answered');
      });

      it('ignores answer from unknown participant', () => {
        const session = new PartySession(mockP2P, true);
        session.createSession(createSampleQuiz(), 'ABCD', 'Host');
        session.startQuiz();

        // No participant with this ID
        mockP2P._simulateMessage('unknown-peer', {
          type: MESSAGE_TYPES.ANSWER,
          payload: { questionIndex: 0, answerIndex: 0, timestamp: Date.now() },
        });

        // Should not crash, just log warning
        expect(session.participants.has('unknown-peer')).toBe(false);
      });
    });

    describe('SCORE_UPDATE (guest receives)', () => {
      it('updates participant scores', () => {
        const session = new PartySession(mockP2P, false);
        session.joinSession('ABCD', 'Guest');
        session.participants.set('host-1', { id: 'host-1', name: 'Host', score: 0, status: 'thinking' });
        session.participants.set('peer-2', { id: 'peer-2', name: 'Other Guest', score: 0, status: 'thinking' });

        mockP2P._simulateMessage('host-peer', {
          type: MESSAGE_TYPES.SCORE_UPDATE,
          payload: {
            scores: [
              { id: 'host-1', score: 15, status: 'answered' },
              { id: 'peer-2', score: 10, status: 'answered' },
            ],
          },
        });

        expect(session.participants.get('host-1').score).toBe(15);
        expect(session.participants.get('peer-2').score).toBe(10);
      });
    });

    describe('QUIZ_END (guest receives)', () => {
      it('sets state to finished and calls callback', () => {
        const session = new PartySession(mockP2P, false);
        session.joinSession('ABCD', 'Guest');
        session.quiz = createSampleQuiz();
        session.startTime = Date.now();
        session.questionTimer = setInterval(() => {}, 100);

        const endCallback = vi.fn();
        session.onQuizEnd(endCallback);

        const standings = [{ id: 'host-1', name: 'Host', score: 45 }];
        mockP2P._simulateMessage('host-peer', {
          type: MESSAGE_TYPES.QUIZ_END,
          payload: { standings },
        });

        expect(session.state).toBe(SESSION_STATES.FINISHED);
        expect(session.questionTimer).toBeNull();
        expect(endCallback).toHaveBeenCalledWith(standings);
      });
    });

    describe('LEAVE (host receives)', () => {
      it('removes participant', () => {
        const session = new PartySession(mockP2P, true);
        session.createSession(createSampleQuiz(), 'ABCD', 'Host');
        session.addParticipant('peer-1', 'Guest');
        expect(session.participants.size).toBe(2);

        mockP2P._simulateMessage('peer-1', {
          type: MESSAGE_TYPES.LEAVE,
          payload: { participantId: 'peer-1' },
        });

        expect(session.participants.size).toBe(1);
        expect(session.participants.has('peer-1')).toBe(false);
      });
    });
  });

  // ===========================================================================
  // PEER CONNECTION EVENTS
  // ===========================================================================

  describe('peer connection events', () => {
    it('sends session info when peer connects (host)', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');

      mockP2P._simulatePeerConnected('new-peer');

      expect(mockP2P.send).toHaveBeenCalledWith('new-peer', {
        type: MESSAGE_TYPES.SESSION_INFO,
        payload: expect.objectContaining({
          quiz: session.quiz,
          roomCode: 'ABCD',
        }),
      });
    });

    it('marks participant as disconnected on peer disconnect', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.addParticipant('peer-1', 'Guest');

      mockP2P._simulatePeerDisconnected('peer-1', 'connection_lost');

      const guest = session.participants.get('peer-1');
      expect(guest.status).toBe('disconnected');
    });
  });

  // ===========================================================================
  // CALLBACKS
  // ===========================================================================

  describe('callbacks', () => {
    it('calls onStateChange callback', () => {
      const session = new PartySession(mockP2P, true);
      const callback = vi.fn();
      session.onStateChange(callback);

      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.startQuiz();

      expect(callback).toHaveBeenCalledWith(SESSION_STATES.PLAYING);
    });

    it('calls onQuestionChange callback when question changes', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.secondsPerQuestion = 1; // 1 second per question for faster test

      const callback = vi.fn();
      session.onQuestionChange(callback);

      session.startQuiz();
      callback.mockClear();

      // Advance to next question
      vi.advanceTimersByTime(1100);

      expect(callback).toHaveBeenCalledWith(1, session.quiz.questions[1]);

      session.endSession(); // Cleanup
    });

    it('calls onScoreUpdate callback', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.startQuiz();

      const callback = vi.fn();
      session.onScoreUpdate(callback);

      session.submitHostAnswer(0, 0);

      expect(callback).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ name: 'Host' }),
      ]));
    });

    it('calls onQuizEnd callback when quiz finishes', () => {
      const session = new PartySession(mockP2P, true);
      const quiz = {
        topic: 'Quick Quiz',
        questions: [
          { question: 'Q1?', options: ['A', 'B'], correct: 0 },
          { question: 'Q2?', options: ['A', 'B'], correct: 1 },
        ],
      };
      session.createSession(quiz, 'ABCD', 'Host');
      session.secondsPerQuestion = 1;

      const callback = vi.fn();
      session.onQuizEnd(callback);

      session.startQuiz();

      // Wait for quiz to end:
      // - 1s to get to question 2 (triggers the setTimeout)
      // - 1s for the setTimeout delay
      // Total: ~2100ms to be safe
      vi.advanceTimersByTime(2100);

      expect(callback).toHaveBeenCalledWith(expect.any(Array));
      expect(session.state).toBe(SESSION_STATES.FINISHED);
    });
  });

  // ===========================================================================
  // DESTROY
  // ===========================================================================

  describe('destroy', () => {
    it('cleans up resources', () => {
      const session = new PartySession(mockP2P, true);
      session.createSession(createSampleQuiz(), 'ABCD', 'Host');
      session.startQuiz();

      const stateCallback = vi.fn();
      session.onStateChange(stateCallback);

      session.destroy();

      expect(session.questionTimer).toBeNull();
      expect(session.onStateChangeCallback).toBeNull();
      expect(session.onParticipantsChangeCallback).toBeNull();
      expect(session.onQuestionChangeCallback).toBeNull();
      expect(session.onScoreUpdateCallback).toBeNull();
      expect(session.onQuizEndCallback).toBeNull();
    });
  });
});
