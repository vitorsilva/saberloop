#!/usr/bin/env node

/**
 * CLI Translation Utility
 * Translates locale files using OpenRouter LLM API
 *
 * Usage:
 *   node scripts/translate.js <language-code>
 *   npm run translate -- es
 *
 * Environment:
 *   OPENROUTER_API_KEY - Required API key for OpenRouter
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Language code to full name mapping
const LANGUAGE_NAMES = {
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt-BR': 'Portuguese (Brazilian)',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese (Simplified)',
  'nl': 'Dutch',
  'ru': 'Russian',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'pl': 'Polish',
  'sv': 'Swedish'
};

/**
 * Find keys in source that are missing in target
 */
function findMissingKeys(source, target, prefix = '') {
  const missing = [];
  for (const [key, value] of Object.entries(source)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      missing.push(...findMissingKeys(value, target?.[key] || {}, fullKey));
    } else if (target?.[key] === undefined) {
      missing.push(fullKey);
    }
  }
  return missing;
}

/**
 * Extract only specific keys from source object
 */
function extractKeys(source, keys) {
  const result = {};
  for (const key of keys) {
    const parts = key.split('.');
    let src = source;
    let dst = result;
    for (let i = 0; i < parts.length - 1; i++) {
      src = src[parts[i]];
      dst[parts[i]] = dst[parts[i]] || {};
      dst = dst[parts[i]];
    }
    dst[parts[parts.length - 1]] = src[parts[parts.length - 1]];
  }
  return result;
}

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = deepMerge(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Translate content using OpenRouter API
 */
async function translateWithLLM(apiKey, content, targetLang, langName) {
  const prompt = `Translate the following JSON from English to ${langName}.
Keep the JSON structure exactly the same, only translate the string values.
Preserve any interpolation variables like {{count}}, {{current}}, {{total}}, {{topic}}, etc.
Do NOT translate the keys, only the values.

JSON to translate:
${JSON.stringify(content, null, 2)}

Return ONLY the translated JSON object, no explanation or markdown code blocks.`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://saberloop.com',
      'X-Title': 'Saberloop Translation CLI'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  const data = await response.json();
  let translatedText = data.choices[0].message.content;

  // Clean markdown code blocks if present
  if (translatedText.startsWith('```')) {
    translatedText = translatedText.replace(/```json?\n?/g, '').replace(/```$/g, '');
  }

  return JSON.parse(translatedText.trim());
}

/**
 * Main translation function
 */
async function translateFile(targetLang) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('Error: OPENROUTER_API_KEY environment variable not set');
    console.error('');
    console.error('Set it with:');
    console.error('  Windows: set OPENROUTER_API_KEY=sk-or-v1-...');
    console.error('  Linux/Mac: export OPENROUTER_API_KEY=sk-or-v1-...');
    process.exit(1);
  }

  const langName = LANGUAGE_NAMES[targetLang];
  if (!langName) {
    console.error(`Error: Unknown language code "${targetLang}"`);
    console.error('');
    console.error('Supported languages:');
    for (const [code, name] of Object.entries(LANGUAGE_NAMES)) {
      console.error(`  ${code.padEnd(6)} - ${name}`);
    }
    process.exit(1);
  }

  // Paths
  const localesDir = path.join(__dirname, '..', 'public', 'locales');
  const enPath = path.join(localesDir, 'en.json');
  const targetPath = path.join(localesDir, `${targetLang}.json`);

  // Read English source
  if (!fs.existsSync(enPath)) {
    console.error(`Error: English locale file not found at ${enPath}`);
    process.exit(1);
  }
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

  // Check for existing translation (for incremental updates)
  let existingTranslation = {};
  if (fs.existsSync(targetPath)) {
    existingTranslation = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    console.log(`Found existing ${targetLang}.json, will update missing keys only`);
  }

  // Find keys that need translation
  const missingKeys = findMissingKeys(enContent, existingTranslation);

  if (missingKeys.length === 0) {
    console.log(`All keys already translated for ${targetLang}`);
    return;
  }

  console.log(`Translating ${missingKeys.length} keys to ${langName}...`);
  console.log('');

  // Extract only missing keys
  const contentToTranslate = extractKeys(enContent, missingKeys);

  try {
    // Translate using LLM
    const translated = await translateWithLLM(apiKey, contentToTranslate, targetLang, langName);

    // Merge with existing translations
    const merged = deepMerge(existingTranslation, translated);

    // Write output
    fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2) + '\n');

    console.log(`Saved to public/locales/${targetLang}.json`);
    console.log('');
    console.log('IMPORTANT: Review the translation before committing!');
    console.log('- Check for translation errors');
    console.log('- Verify interpolation variables are preserved');
    console.log('- Test in the app with language selector');

  } catch (error) {
    console.error('Translation failed:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const targetLang = process.argv[2];

if (!targetLang) {
  console.log('Saberloop Translation CLI');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/translate.js <language-code>');
  console.log('  npm run translate -- <language-code>');
  console.log('');
  console.log('Examples:');
  console.log('  npm run translate -- es    # Translate to Spanish');
  console.log('  npm run translate -- fr    # Translate to French');
  console.log('  npm run translate -- de    # Translate to German');
  console.log('');
  console.log('Supported languages:');
  for (const [code, name] of Object.entries(LANGUAGE_NAMES)) {
    console.log(`  ${code.padEnd(6)} - ${name}`);
  }
  console.log('');
  console.log('Environment:');
  console.log('  OPENROUTER_API_KEY - Required API key for OpenRouter');
  process.exit(0);
}

translateFile(targetLang);
