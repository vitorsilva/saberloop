/**
 * JSON Extractor Utility
 * Robust JSON extraction from LLM responses with multiple fallback strategies
 */

import { logger } from './logger.js';

/**
 * Extract JSON from text with multiple fallback strategies
 * Handles common LLM response patterns like markdown code blocks,
 * extra text, smart quotes, and BOM characters.
 *
 * @param {string} text - Raw text that may contain JSON
 * @returns {Object|Array} Parsed JSON object or array
 * @throws {Error} If JSON cannot be extracted
 */
export function extractJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  let cleaned = text.trim();

  if (!cleaned) {
    throw new Error('Input is empty or whitespace-only');
  }

  // Step 1: Remove BOM if present
  if (cleaned.charCodeAt(0) === 0xFEFF) {
    cleaned = cleaned.slice(1);
  }

  // Step 2: Normalize smart quotes to straight quotes
  cleaned = cleaned
    .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes " "
    .replace(/[\u2018\u2019]/g, "'"); // Smart single quotes ' '

  // Step 3: Try direct parse first (most common case)
  try {
    return JSON.parse(cleaned);
  } catch (directParseError) {
    // Continue to fallbacks
  }

  // Step 4: Try extracting from markdown code block
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    const jsonFromBlock = codeBlockMatch[1].trim();
    try {
      return JSON.parse(jsonFromBlock);
    } catch (codeBlockError) {
      // Continue to other fallbacks
    }
  }

  // Step 5: Try to find JSON object in text
  // Match from first { to last } (greedy for nested objects)
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch (objectError) {
      // Continue to array fallback
    }
  }

  // Step 6: Try to find JSON array in text
  // Match from first [ to last ] (greedy for nested arrays)
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch (arrayError) {
      // All fallbacks failed
    }
  }

  // All strategies failed - log the raw text for debugging
  logger.error('JSON extraction failed', {
    rawText: text.substring(0, 500),
    textLength: text.length
  });

  throw new Error('Failed to extract valid JSON from response');
}
