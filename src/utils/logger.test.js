  import { describe, it, expect, vi, beforeEach } from 'vitest';

  // Mock loglevel - factory must be self-contained (no external references)
  vi.mock('loglevel', () => ({
    default: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      setLevel: vi.fn(),
      getLevel: vi.fn()
    }
  }));

  // Import after mock
  import { logger } from './logger.js';
  import log from 'loglevel';

  describe('Logger', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe('log levels', () => {
      it('should log debug messages', () => {
        logger.debug('Test debug');
        expect(log.debug).toHaveBeenCalledWith('[DEBUG] Test debug');
      });

      it('should log info messages', () => {
        logger.info('Test info');
        expect(log.info).toHaveBeenCalledWith('[INFO] Test info');
      });

      it('should log warn messages', () => {
        logger.warn('Test warn');
        expect(log.warn).toHaveBeenCalledWith('[WARN] Test warn');
      });

      it('should log error messages', () => {
        logger.error('Test error');
        expect(log.error).toHaveBeenCalledWith('[ERROR] Test error');
      });
    });

    describe('context handling', () => {
      it('should include context in logs', () => {
        logger.info('Test', { userId: '123' });
        expect(log.info).toHaveBeenCalledWith(
          '[INFO] Test',
          expect.objectContaining({ userId: '123' })
        );
      });

      it('should handle empty context', () => {
        logger.info('No context');
        expect(log.info).toHaveBeenCalledWith('[INFO] No context');
      });
    });

    describe('sensitive data redaction', () => {
      it('should redact apiKey', () => {
        logger.info('Settings', { apiKey: 'sk-secret-123' });
        expect(log.info).toHaveBeenCalledWith(
          '[INFO] Settings',
          expect.objectContaining({ apiKey: '[REDACTED]' })
        );
      });

      it('should redact token', () => {
        logger.info('Auth', { token: 'bearer-xyz' });
        expect(log.info).toHaveBeenCalledWith(
          '[INFO] Auth',
          expect.objectContaining({ token: '[REDACTED]' })
        );
      });

      it('should redact password', () => {
        logger.info('Login', { password: 'secret123' });
        expect(log.info).toHaveBeenCalledWith(
          '[INFO] Login',
          expect.objectContaining({ password: '[REDACTED]' })
        );
      });

      it('should redact nested sensitive data', () => {
        logger.info('Config', {
          user: { name: 'John', secretKey: 'abc123' }
        });
        expect(log.info).toHaveBeenCalledWith(
          '[INFO] Config',
          expect.objectContaining({
            user: expect.objectContaining({
              name: 'John',
              secretKey: '[REDACTED]'
            })
          })
        );
      });

      it('should not redact non-sensitive data', () => {
        logger.info('Quiz', { topic: 'Math', score: 5 });
        expect(log.info).toHaveBeenCalledWith(
          '[INFO] Quiz',
          expect.objectContaining({ topic: 'Math', score: 5 })
        );
      });
    });

    describe('special methods', () => {
      it('should log performance metrics', () => {
        logger.perf('Page Load', { duration: 234 });
        expect(log.info).toHaveBeenCalledWith(
          '[INFO] [PERF] Page Load',
          expect.objectContaining({ duration: 234 })
        );
      });

      it('should log user actions', () => {
        logger.action('Quiz Started', { topic: 'Math' });
        expect(log.debug).toHaveBeenCalledWith(
          '[DEBUG] [ACTION] Quiz Started',
          expect.objectContaining({ topic: 'Math' })
        );
      });
    });
  });