import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock features module
vi.mock('../core/features.js', () => ({
  isFeatureEnabled: vi.fn()
}));

// Import after mock
import { TelemetryClient, CONFIG } from './telemetry.js';
import { isFeatureEnabled } from '../core/features.js';

describe('TelemetryClient', () => {
  let client;
  let mockFetch;
  let mockLocalStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock fetch
    mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    // Mock localStorage
    mockLocalStorage = {
      store: {},
      getItem: vi.fn((key) => mockLocalStorage.store[key] || null),
      setItem: vi.fn((key, value) => { mockLocalStorage.store[key] = value; }),
      removeItem: vi.fn((key) => { delete mockLocalStorage.store[key]; })
    };
    global.localStorage = mockLocalStorage;

    // Enable telemetry by default for tests
    isFeatureEnabled.mockReturnValue(true);

    // Override CONFIG for testing
    CONFIG.enabled = true;
    CONFIG.endpoint = 'https://test.example.com/telemetry';
    CONFIG.token = 'test-token';
    CONFIG.batchSize = 3;
    CONFIG.flushInterval = 1000;

    // Create fresh client for each test
    client = new TelemetryClient();
  });

  afterEach(() => {
    vi.useRealTimers();
    client._stopFlushTimer();
  });

  describe('track()', () => {
    it('should add event to queue when enabled', () => {
      client.track('error', { message: 'Test error' });

      expect(client.getQueueSize()).toBe(1);
    });

    it('should not add event when feature flag is disabled', () => {
      isFeatureEnabled.mockReturnValue(false);

      client.track('error', { message: 'Test error' });

      expect(client.getQueueSize()).toBe(0);
    });

    it('should not add event when env var is disabled', () => {
      CONFIG.enabled = false;

      client.track('error', { message: 'Test error' });

      expect(client.getQueueSize()).toBe(0);
    });

    it('should include metadata with event', () => {
      client.track('log', { level: 'info' });

      // Access queue directly for testing
      const event = client.queue[0];
      expect(event.type).toBe('log');
      expect(event.data).toEqual({ level: 'info' });
      expect(event.timestamp).toBeDefined();
      expect(event.sessionId).toBe(client.sessionId);
    });

    it('should auto-flush when batch size is reached', async () => {
      // Stop the interval timer to avoid infinite loop in test
      client._stopFlushTimer();

      client.track('event', { n: 1 });
      client.track('event', { n: 2 });

      expect(mockFetch).not.toHaveBeenCalled();

      client.track('event', { n: 3 }); // This triggers flush (batchSize = 3)

      // Give the async flush a moment to complete
      await Promise.resolve();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('flush()', () => {
    it('should send events to endpoint', async () => {
      client.track('error', { message: 'Test' });

      await client.flush();

      expect(mockFetch).toHaveBeenCalledWith(
        CONFIG.endpoint,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Telemetry-Token': CONFIG.token
          }
        })
      );
    });

    it('should clear queue after successful flush', async () => {
      client.track('event', { n: 1 });
      client.track('event', { n: 2 });

      expect(client.getQueueSize()).toBe(2);

      await client.flush();

      expect(client.getQueueSize()).toBe(0);
    });

    it('should not send if queue is empty', async () => {
      await client.flush();

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not send if disabled', async () => {
      isFeatureEnabled.mockReturnValue(false);
      client.queue = [{ type: 'test', data: {} }]; // Force an event

      await client.flush();

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return true on success', async () => {
      client.track('event', {});

      const result = await client.flush();

      expect(result).toBe(true);
    });

    it('should return false on failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      client.track('event', {});

      const result = await client.flush();

      expect(result).toBe(false);
    });
  });

  describe('offline queue', () => {
    it('should save to localStorage on send failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      client.track('event', { important: true });

      await client.flush();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'saberloop_telemetry_queue',
        expect.any(String)
      );
    });

    it('should restore events from queue after failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      client.track('event', { n: 1 });

      await client.flush();

      // Events should still be in queue after failure
      expect(client.getQueueSize()).toBe(1);
    });

    it('should load saved queue on initialization', () => {
      const savedEvents = [{ type: 'saved', data: {}, timestamp: '2025-01-01' }];
      mockLocalStorage.store['saberloop_telemetry_queue'] = JSON.stringify(savedEvents);

      const newClient = new TelemetryClient();

      expect(newClient.getQueueSize()).toBe(1);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('saberloop_telemetry_queue');

      newClient._stopFlushTimer();
    });
  });

  describe('auto-flush timer', () => {
    it('should flush after interval', async () => {
      client.track('event', {});

      expect(mockFetch).not.toHaveBeenCalled();

      // Advance timer past flush interval
      await vi.advanceTimersByTimeAsync(CONFIG.flushInterval + 100);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should not start timer when disabled', () => {
      CONFIG.enabled = false;
      const disabledClient = new TelemetryClient();

      expect(disabledClient.flushTimer).toBeNull();

      // No need to stop timer since it wasn't started
    });
  });

  describe('clearQueue()', () => {
    it('should clear in-memory queue', () => {
      client.track('event', {});
      client.track('event', {});

      client.clearQueue();

      expect(client.getQueueSize()).toBe(0);
    });

    it('should clear localStorage queue', () => {
      mockLocalStorage.store['saberloop_telemetry_queue'] = '[]';

      client.clearQueue();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('saberloop_telemetry_queue');
    });
  });

  describe('session ID', () => {
    it('should generate unique session ID', () => {
      const client2 = new TelemetryClient();

      expect(client.sessionId).toBeDefined();
      expect(client2.sessionId).toBeDefined();
      expect(client.sessionId).not.toBe(client2.sessionId);

      client2._stopFlushTimer();
    });

    it('should include session ID in all events', () => {
      client.track('event', {});
      client.track('error', {});

      expect(client.queue[0].sessionId).toBe(client.sessionId);
      expect(client.queue[1].sessionId).toBe(client.sessionId);
    });
  });
});
