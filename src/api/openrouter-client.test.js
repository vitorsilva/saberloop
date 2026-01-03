
  import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
  import { callOpenRouter, testApiKey, getCreditsBalance } from './openrouter-client.js';

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

      it('should throw error on empty response when both content and reasoning are empty', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: '', reasoning: '' } }],
            model: 'test-model',
            usage: {}
          })
        });

        await expect(callOpenRouter('sk-test-key', 'Test'))
          .rejects.toThrow('Empty response from OpenRouter');
      });

      it('should use reasoning field when content is empty and reasoning is not chain-of-thought', async () => {
        // Some models may put actual answer in reasoning field
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: '', reasoning: 'A resposta correta é 32 dentes.' } }],
            model: 'deepseek-r1t2-chimera',
            usage: { total_tokens: 100 }
          })
        });

        const result = await callOpenRouter('sk-test-key', 'Test prompt');

        expect(result.text).toBe('A resposta correta é 32 dentes.');
      });

      it('should reject chain-of-thought reasoning as answer', async () => {
        // Chain-of-thought should not be used as the answer
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: '', reasoning: 'Okay, let me think about this...' } }],
            model: 'deepseek-r1t2-chimera',
            usage: { total_tokens: 100 }
          })
        });

        await expect(callOpenRouter('sk-test-key', 'Test prompt'))
          .rejects.toThrow('Empty response from OpenRouter');
      });

      it('should prefer content over reasoning when both are present', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'Content response', reasoning: 'Reasoning response' } }],
            model: 'test-model',
            usage: {}
          })
        });

        const result = await callOpenRouter('sk-test-key', 'Test prompt');

        expect(result.text).toBe('Content response');
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

    describe('getCreditsBalance', () => {
      it('should fetch credits from /api/v1/auth/key', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: { limit_remaining: 5.50 }
          })
        });

        await getCreditsBalance('sk-test-key');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://openrouter.ai/api/v1/auth/key',
          expect.objectContaining({
            method: 'GET',
            headers: { 'Authorization': 'Bearer sk-test-key' }
          })
        );
      });

      it('should return balance and formatted balance', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: { limit_remaining: 5.50 }
          })
        });

        const result = await getCreditsBalance('sk-test-key');

        expect(result.balance).toBe(5.50);
        expect(result.balanceFormatted).toBe('$5.50');
      });

      it('should handle zero balance', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: { limit_remaining: 0 }
          })
        });

        const result = await getCreditsBalance('sk-test-key');

        expect(result.balance).toBe(0);
        expect(result.balanceFormatted).toBe('$0.00');
      });

      it('should return null on API failure', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401
        });

        const result = await getCreditsBalance('sk-invalid-key');
        expect(result).toBeNull();
      });

      it('should return null when limit_remaining is missing', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: {}
          })
        });

        const result = await getCreditsBalance('sk-test-key');
        expect(result).toBeNull();
      });

      it('should return null on network error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const result = await getCreditsBalance('sk-test-key');
        expect(result).toBeNull();
      });
    });

  });