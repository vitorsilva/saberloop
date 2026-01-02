
  import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
  import { callOpenRouter, testApiKey } from './openrouter-client.js';

  describe('OpenRouter Client', () => {
    // Mock fetch globally
    const mockFetch = vi.fn();

    beforeEach(() => {
      vi.stubGlobal('fetch', mockFetch);
      mockFetch.mockReset();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    describe('callOpenRouter', () => {
      it('should call fetch with correct URL', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'Hello!' } }],
            model: 'test-model',
            usage: { total_tokens: 10 }
          })
        });

        await callOpenRouter('sk-test-key', 'Say hello');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://openrouter.ai/api/v1/chat/completions',
          expect.any(Object)
        );
      });

      it('should send correct headers', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'Hello!' } }],
            model: 'test-model',
            usage: {}
          })
        });

        await callOpenRouter('sk-test-key', 'Say hello');

        const callArgs = mockFetch.mock.calls[0][1];
        expect(callArgs.headers['Authorization']).toBe('Bearer sk-test-key');
        expect(callArgs.headers['Content-Type']).toBe('application/json');
        expect(callArgs.headers['X-Title']).toBe('SaberLoop');
      });

      it('should use default model when not specified', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'Response' } }],
            model: 'default-model',
            usage: {}
          })
        });

        await callOpenRouter('sk-test-key', 'Test prompt');

        const callArgs = mockFetch.mock.calls[0][1];
        const body = JSON.parse(callArgs.body);
        expect(body.model).toBe('tngtech/deepseek-r1t2-chimera:free');
      });

      it('should use custom model when specified', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'Response' } }],
            model: 'openai/gpt-4',
            usage: {}
          })
        });

        await callOpenRouter('sk-test-key', 'Test prompt', { model: 'openai/gpt-4' });        

        const callArgs = mockFetch.mock.calls[0][1];
        const body = JSON.parse(callArgs.body);
        expect(body.model).toBe('openai/gpt-4');
      });

      it('should return text, model, and usage from response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'The answer is 42' } }],
            model: 'test-model',
            usage: { total_tokens: 50, prompt_tokens: 10, completion_tokens: 40 }
          })
        });

        const result = await callOpenRouter('sk-test-key', 'What is the answer?');

        expect(result.text).toBe('The answer is 42');
        expect(result.model).toBe('test-model');
        expect(result.usage).toEqual({
          promptTokens: 10,
          completionTokens: 40,
          totalTokens: 50,
          costUsd: 0
        });
      });

      it('should throw error on 401 (invalid API key)', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: { message: 'Unauthorized' } })
        });

        await expect(callOpenRouter('bad-key', 'Test'))
          .rejects.toThrow('Invalid API key');
      });

      it('should throw error on 429 (rate limit)', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ error: { message: 'Too many requests' } })
        });

        await expect(callOpenRouter('sk-test-key', 'Test'))
          .rejects.toThrow('Rate limit exceeded');
      });

      it('should throw error on 402 (insufficient credits)', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 402,
          json: () => Promise.resolve({ error: { message: 'Payment required' } })
        });

        await expect(callOpenRouter('sk-test-key', 'Test'))
          .rejects.toThrow('Insufficient credits');
      });

      it('should throw error on empty response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: '' } }],
            model: 'test-model',
            usage: {}
          })
        });

        await expect(callOpenRouter('sk-test-key', 'Test'))
          .rejects.toThrow('Empty response from OpenRouter');
      });
    });

    describe('testApiKey', () => {
      it('should return true when API call succeeds', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'ok' } }],
            model: 'test-model',
            usage: {}
          })
        });

        const result = await testApiKey('sk-valid-key');
        expect(result).toBe(true);
      });

      it('should return false when API call fails', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: { message: 'Invalid key' } })
        });

        const result = await testApiKey('sk-invalid-key');
        expect(result).toBe(false);
      });
    });

  });