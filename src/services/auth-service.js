/**
 * Auth Service - OpenRouter authentication operations
 * Views should use this instead of importing db or api directly
 */
import { isOpenRouterConnected, getOpenRouterKey, removeOpenRouterKey } from '../core/db.js';
import { startAuth as startOAuthFlow } from '../api/openrouter-auth.js';
import { getCreditsBalance as fetchCreditsBalance } from '../api/openrouter-client.js';

/**
 * Check if user is connected to OpenRouter
 * @returns {Promise<boolean>} True if connected
 */
export async function isConnected() {
  return isOpenRouterConnected();
}

/**
 * Get the stored OpenRouter API key
 * @returns {Promise<string|null>} API key or null
 */
export async function getApiKey() {
  return getOpenRouterKey();
}

/**
 * Disconnect from OpenRouter (remove stored key)
 * @returns {Promise<void>}
 */
export async function disconnect() {
  return removeOpenRouterKey();
}

/**
 * Start OAuth flow to connect to OpenRouter
 * Redirects user to OpenRouter for authentication
 * @returns {Promise<void>}
 */
export async function startAuth() {
  return startOAuthFlow();
}

/**
 * Get credits balance from OpenRouter
 * @returns {Promise<{balance: number, balanceFormatted: string}|null>}
 */
export async function getCreditsBalance() {
  const apiKey = await getOpenRouterKey();
  if (!apiKey) return null;
  return fetchCreditsBalance(apiKey);
}
