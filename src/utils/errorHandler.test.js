import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the logger module - must be before imports that use it
vi.mock('./logger.js', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Import after mock is set up
import { handleApiError } from './errorHandler.js';
import { logger } from './logger.js';

describe('Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleApiError', () => {
    it('should return network error message for fetch errors', () => {
      const error = new Error('Failed to fetch');
      const message = handleApiError(error);
      expect(message).toContain('Network error');
    });

    it('should return network error message for network errors', () => {
      const error = new Error('network error occurred');
      const message = handleApiError(error);
      expect(message).toContain('Network error');
    });

    it('should return API key message for 401 errors', () => {
      const error = new Error('401 Unauthorized');
      const message = handleApiError(error);
      expect(message).toContain('API key');
    });

    it('should return API key message for API key errors', () => {
      const error = new Error('Invalid API key');
      const message = handleApiError(error);
      expect(message).toContain('API key');
    });

    it('should return rate limit message for 429 errors', () => {
      const error = new Error('429 Too Many Requests');
      const message = handleApiError(error);
      expect(message).toContain('Rate limit');
    });

    it('should return rate limit message for rate limit errors', () => {
      const error = new Error('Rate limit exceeded');
      const message = handleApiError(error);
      expect(message).toContain('Rate limit');
    });

    it('should return timeout message for timeout errors', () => {
      const error = new Error('Request timeout');
      const message = handleApiError(error);
      expect(message).toContain('timed out');
    });

    it('should return generic message for unknown errors', () => {
      const error = new Error('Something weird happened');
      const message = handleApiError(error);
      expect(message).toContain('An error occurred');
    });

    it('should log errors with context', () => {
      const error = new Error('Test error');
      handleApiError(error, { endpoint: '/api/test' });

      expect(logger.error).toHaveBeenCalledWith('API error', {
        message: 'Test error',
        endpoint: '/api/test'
      });
    });
  });
});
