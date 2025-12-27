import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSelectedModel,
  saveSelectedModel,
  getModelDisplayName,
  getAvailableModels,
  clearModelCache
} from './model-service.js';
import { DEFAULT_MODEL } from '../core/settings.js';

// Mock fetch
global.fetch = vi.fn();

// Mock logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn()
  }
}));

describe('Model Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getSelectedModel', () => {
    it('should return default model when none selected', () => {
      const model = getSelectedModel();
      expect(model).toBe(DEFAULT_MODEL);
    });

    it('should return saved model when one is selected', () => {
      localStorage.setItem('quizmaster_settings', JSON.stringify({
        selectedModel: 'google/gemma-2-9b-it:free'
      }));

      const model = getSelectedModel();
      expect(model).toBe('google/gemma-2-9b-it:free');
    });
  });

  describe('saveSelectedModel', () => {
    it('should save model to settings', () => {
      saveSelectedModel('meta-llama/llama-3.1-8b-instruct:free');

      const stored = JSON.parse(localStorage.getItem('quizmaster_settings'));
      expect(stored.selectedModel).toBe('meta-llama/llama-3.1-8b-instruct:free');
    });

    it('should preserve other settings when saving model', () => {
      localStorage.setItem('quizmaster_settings', JSON.stringify({
        defaultGradeLevel: 'college',
        questionsPerQuiz: '10'
      }));

      saveSelectedModel('google/gemma-2-9b-it:free');

      const stored = JSON.parse(localStorage.getItem('quizmaster_settings'));
      expect(stored.selectedModel).toBe('google/gemma-2-9b-it:free');
      expect(stored.defaultGradeLevel).toBe('college');
      expect(stored.questionsPerQuiz).toBe('10');
    });
  });

  describe('getModelDisplayName', () => {
    it('should convert model ID to display name', () => {
      expect(getModelDisplayName('tngtech/deepseek-r1t2-chimera:free'))
        .toBe('Deepseek R1t2 Chimera');
    });

    it('should handle model without provider prefix', () => {
      expect(getModelDisplayName('gemma-2-9b-it'))
        .toBe('Gemma 2 9b It');
    });

    it('should remove :free suffix', () => {
      expect(getModelDisplayName('google/gemma-2-9b-it:free'))
        .toBe('Gemma 2 9b It');
    });

    it('should handle empty or null input', () => {
      expect(getModelDisplayName(null)).toBe('Unknown Model');
      expect(getModelDisplayName('')).toBe('Unknown Model');
      expect(getModelDisplayName(undefined)).toBe('Unknown Model');
    });

    it('should handle model without dashes', () => {
      expect(getModelDisplayName('provider/modelname:free'))
        .toBe('Modelname');
    });
  });

  describe('getAvailableModels', () => {
    const mockModelsResponse = {
      data: [
        {
          id: 'google/gemma-2-9b-it:free',
          name: 'Gemma 2 9B',
          description: 'Google Gemma 2',
          context_length: 8192,
          pricing: { prompt: '0', completion: '0' }
        },
        {
          id: 'openai/gpt-4',
          name: 'GPT-4',
          description: 'OpenAI GPT-4',
          context_length: 8192,
          pricing: { prompt: '0.03', completion: '0.06' }
        },
        {
          id: 'meta-llama/llama-3.1-8b-instruct:free',
          name: 'Llama 3.1 8B',
          description: 'Meta Llama 3.1',
          context_length: 131072,
          pricing: { prompt: '0', completion: '0' }
        }
      ]
    };

    it('should fetch and filter free models only', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModelsResponse)
      });

      const models = await getAvailableModels('test-api-key');

      expect(models).toHaveLength(2); // Only free models
      expect(models.map(m => m.id)).toContain('google/gemma-2-9b-it:free');
      expect(models.map(m => m.id)).toContain('meta-llama/llama-3.1-8b-instruct:free');
      expect(models.map(m => m.id)).not.toContain('openai/gpt-4');
    });

    it('should include model details in response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModelsResponse)
      });

      const models = await getAvailableModels('test-api-key');
      const gemma = models.find(m => m.id === 'google/gemma-2-9b-it:free');

      expect(gemma).toBeDefined();
      expect(gemma.name).toBe('Gemma 2 9B');
      expect(gemma.description).toBe('Google Gemma 2');
      expect(gemma.contextLength).toBe(8192);
    });

    it('should sort models alphabetically by name', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModelsResponse)
      });

      const models = await getAvailableModels('test-api-key');

      expect(models[0].name).toBe('Gemma 2 9B');
      expect(models[1].name).toBe('Llama 3.1 8B');
    });

    it('should use cache on subsequent calls', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModelsResponse)
      });

      // First call - fetches from API
      await getAvailableModels('test-api-key');
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await getAvailableModels('test-api-key');
      expect(fetch).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should throw error on API failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(getAvailableModels('invalid-key'))
        .rejects.toThrow('Failed to fetch models: 401');
    });

    it('should handle empty API response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] })
      });

      const models = await getAvailableModels('test-api-key');
      expect(models).toHaveLength(0);
    });

    it('should handle models with missing pricing as non-free', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [
            { id: 'model-no-pricing', name: 'No Pricing' },
            { id: 'free-model:free', pricing: { prompt: '0', completion: '0' } }
          ]
        })
      });

      const models = await getAvailableModels('test-api-key');

      // Model without pricing should be treated as free (0 || 0 = 0)
      expect(models.map(m => m.id)).toContain('model-no-pricing');
      expect(models.map(m => m.id)).toContain('free-model:free');
    });
  });

  describe('clearModelCache', () => {
    it('should remove cached models', async () => {
      // Set up cache
      localStorage.setItem('openrouter_models_cache', JSON.stringify({
        models: [{ id: 'test' }],
        timestamp: Date.now()
      }));

      clearModelCache();

      expect(localStorage.getItem('openrouter_models_cache')).toBeNull();
    });
  });

  describe('cache expiration', () => {
    it('should ignore expired cache', async () => {
      // Set up expired cache (25 hours old)
      const expiredTimestamp = Date.now() - (25 * 60 * 60 * 1000);
      localStorage.setItem('openrouter_models_cache', JSON.stringify({
        models: [{ id: 'old-model', name: 'Old' }],
        timestamp: expiredTimestamp
      }));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [{ id: 'new-model:free', name: 'New', pricing: { prompt: '0', completion: '0' } }]
        })
      });

      const models = await getAvailableModels('test-api-key');

      expect(fetch).toHaveBeenCalled();
      expect(models[0].id).toBe('new-model:free');
    });
  });
});
