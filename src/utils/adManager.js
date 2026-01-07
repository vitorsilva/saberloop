/**
 * AdManager - Google AdSense integration for Saberloop
 *
 * Manages ad loading in a SPA context with:
 * - Online/offline detection (hide ads when offline)
 * - Duplicate prevention (track loaded containers)
 * - SPA navigation support (reset between views)
 * - Feature flag integration
 */

import { logger } from './logger.js';
import { isOnline, onOnline, onOffline } from './network.js';
import { isFeatureEnabled } from '../core/features.js';

/**
 * Publisher ID from Google AdSense
 * @type {string}
 */
const PUBLISHER_ID = 'ca-pub-9849708569219157';

/**
 * Ad slot IDs - will be populated after AdSense approval
 * For now, using placeholder values
 * @type {Object.<string, string>}
 */
const AD_SLOTS = {
  quizLoading: '',      // Slot ID for quiz generation loading screen
  resultsLoading: '',   // Slot ID for results calculation loading screen
};

/**
 * Track which containers have already loaded ads
 * @type {Set<string>}
 */
const loadedAds = new Set();

/**
 * Check if we can load ads right now
 * @returns {boolean} True if ads can be loaded
 */
export function canLoadAds() {
  // Check feature flag
  if (!isFeatureEnabled('SHOW_ADS')) {
    logger.debug('[AdManager] Ads disabled by feature flag');
    return false;
  }

  // Check if online
  if (!isOnline()) {
    logger.debug('[AdManager] Cannot load ads: offline');
    return false;
  }

  // Check if AdSense script is loaded
  if (typeof window.adsbygoogle === 'undefined') {
    logger.debug('[AdManager] Cannot load ads: adsbygoogle not loaded');
    return false;
  }

  return true;
}

/**
 * Load an ad into a container
 * @param {string} containerId - DOM element ID for the ad container
 * @param {string} slotKey - Key from AD_SLOTS (e.g., 'quizLoading')
 * @returns {boolean} True if ad was loaded, false otherwise
 */
export function loadAd(containerId, slotKey) {
  // Prevent duplicate loads
  if (loadedAds.has(containerId)) {
    logger.debug(`[AdManager] Ad already loaded in ${containerId}`);
    return false;
  }

  // Check if we can load
  if (!canLoadAds()) {
    hideContainer(containerId);
    return false;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    logger.warn(`[AdManager] Container not found: ${containerId}`);
    return false;
  }

  const slotId = AD_SLOTS[slotKey];

  // If no slot ID yet (pre-approval), show placeholder or hide
  if (!slotId) {
    logger.debug(`[AdManager] No slot ID for ${slotKey} - AdSense pending approval`);
    // For now, hide the container until we have real ad units
    hideContainer(containerId);
    return false;
  }

  try {
    // Create the ad element
    const adElement = document.createElement('ins');
    adElement.className = 'adsbygoogle';
    adElement.style.display = 'block';
    adElement.setAttribute('data-ad-client', PUBLISHER_ID);
    adElement.setAttribute('data-ad-slot', slotId);
    adElement.setAttribute('data-ad-format', 'auto');
    adElement.setAttribute('data-full-width-responsive', 'true');

    // Clear container and add ad
    container.innerHTML = '';
    container.appendChild(adElement);

    // Push to AdSense
    (window.adsbygoogle = window.adsbygoogle || []).push({});

    // Mark as loaded
    loadedAds.add(containerId);
    logger.info(`[AdManager] Ad loaded in ${containerId}`);

    return true;
  } catch (error) {
    logger.error('[AdManager] Error loading ad:', error);
    hideContainer(containerId);
    return false;
  }
}

/**
 * Hide an ad container
 * @param {string} containerId - DOM element ID to hide
 */
export function hideContainer(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
    container.style.display = 'none';
  }
}

/**
 * Show an ad container
 * @param {string} containerId - DOM element ID to show
 */
export function showContainer(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.style.display = 'block';
  }
}

/**
 * Reset ad state for SPA navigation
 * Call this when navigating between views
 */
export function resetForNavigation() {
  loadedAds.clear();
  logger.debug('[AdManager] Reset for navigation');
}

/**
 * Handle online event - show ad containers
 */
function handleOnline() {
  logger.debug('[AdManager] Online - ads can be shown');
  // Note: We don't auto-reload ads on online event
  // The view should handle showing ads when appropriate
}

/**
 * Handle offline event - hide all ad containers
 */
function handleOffline() {
  logger.debug('[AdManager] Offline - hiding ads');
  loadedAds.forEach(containerId => {
    hideContainer(containerId);
  });
}

/**
 * Initialize the AdManager
 * Call this once when the app starts
 */
export function initAdManager() {
  // Set up online/offline listeners
  onOnline(handleOnline);
  onOffline(handleOffline);

  logger.info('[AdManager] Initialized', {
    publisherId: PUBLISHER_ID,
    featureEnabled: isFeatureEnabled('SHOW_ADS'),
    online: isOnline()
  });
}

/**
 * Get the publisher ID (for testing/debugging)
 * @returns {string}
 */
export function getPublisherId() {
  return PUBLISHER_ID;
}

/**
 * Update ad slot ID (for post-approval setup)
 * @param {string} slotKey - Key from AD_SLOTS
 * @param {string} slotId - The slot ID from AdSense
 */
export function setAdSlot(slotKey, slotId) {
  if (AD_SLOTS.hasOwnProperty(slotKey)) {
    AD_SLOTS[slotKey] = slotId;
    logger.info(`[AdManager] Set slot ${slotKey} = ${slotId}`);
  } else {
    logger.warn(`[AdManager] Unknown slot key: ${slotKey}`);
  }
}
