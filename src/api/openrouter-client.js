  /**
   * OpenRouter API Client
   * Makes direct browser → OpenRouter API calls (CORS supported)
   */

  import { logger } from '../utils/logger.js';
  import { getSelectedModel } from '../services/model-service.js';

  const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

  /**
   * Call OpenRouter Chat API
   * @param {string} apiKey - User's OpenRouter API key
   * @param {string} prompt - The prompt to send
   * @param {object} options - Optional settings (model, maxTokens, temperature)
   * @returns {Promise<{text: string, model: string, usage: {promptTokens: number, completionTokens: number, totalTokens: number, costUsd: number}}>}
   */
  export async function callOpenRouter(apiKey, prompt, options = {}) {
    const {
      model = getSelectedModel(),
      maxTokens = 2048,
      temperature = 0.7
    } = options;

    logger.debug('Calling OpenRouter', { model, maxTokens, temperature });

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SaberLoop'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: 'user', content: prompt }],
        usage: { include: true }
      })
    });

    logger.debug('OpenRouter response', { status: response.status });

    // Handle errors
    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();

    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Empty response from OpenRouter');
    }

    logger.debug('OpenRouter response received', { length: text.length });

    return {
      text,
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        costUsd: data.usage?.cost_usd || 0
      }
    };
  }

  /**
   * Handle API errors with helpful messages
   */
  async function handleApiError(response) {
    const error = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error('Invalid API key. Please reconnect with OpenRouter.');
    }

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Free tier allows 50 requests/day.');     
    }

    if (response.status === 402) {
      throw new Error('Insufficient credits. Add credits at openrouter.ai');
    }

    throw new Error(error.error?.message || `API error: ${response.status}`);        
  }

  /**
   * Test if an API key is valid
   * @param {string} apiKey - API key to test
   * @returns {Promise<boolean>}
   */
  export async function testApiKey(apiKey) {
    try {
      await callOpenRouter(apiKey, 'Say "ok"', { maxTokens: 10 });
      return true;
    } catch (error) {
      logger.debug('API key test failed', { error: error.message });
      return false;
    }
  }