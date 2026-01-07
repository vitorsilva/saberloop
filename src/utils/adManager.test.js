import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dependencies
vi.mock('./logger.js', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('./network.js', () => ({
  isOnline: vi.fn(),
  onOnline: vi.fn(),
  onOffline: vi.fn()
}));

vi.mock('../core/features.js', () => ({
  isFeatureEnabled: vi.fn()
}));

import {
  canLoadAds,
  loadAd,
  hideContainer,
  showContainer,
  resetForNavigation,
  initAdManager,
  getPublisherId,
  setAdSlot
} from './adManager.js';
import { logger } from './logger.js';
import { isOnline, onOnline, onOffline } from './network.js';
import { isFeatureEnabled } from '../core/features.js';

describe('AdManager', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Reset DOM
    document.body.innerHTML = '';

    // Reset adsbygoogle
    delete window.adsbygoogle;

    // Reset loaded ads state by calling resetForNavigation
    resetForNavigation();
  });

  describe('canLoadAds', () => {
    it('should return false when feature flag is disabled', () => {
      isFeatureEnabled.mockReturnValue(false);
      isOnline.mockReturnValue(true);
      window.adsbygoogle = [];

      const result = canLoadAds();

      expect(result).toBe(false);
      expect(logger.debug).toHaveBeenCalledWith('[AdManager] Ads disabled by feature flag');
    });

    it('should return false when offline', () => {
      isFeatureEnabled.mockReturnValue(true);
      isOnline.mockReturnValue(false);
      window.adsbygoogle = [];

      const result = canLoadAds();

      expect(result).toBe(false);
      expect(logger.debug).toHaveBeenCalledWith('[AdManager] Cannot load ads: offline');
    });

    it('should return false when adsbygoogle is not loaded', () => {
      isFeatureEnabled.mockReturnValue(true);
      isOnline.mockReturnValue(true);
      // Don't set window.adsbygoogle

      const result = canLoadAds();

      expect(result).toBe(false);
      expect(logger.debug).toHaveBeenCalledWith('[AdManager] Cannot load ads: adsbygoogle not loaded');
    });

    it('should return true when all conditions are met', () => {
      isFeatureEnabled.mockReturnValue(true);
      isOnline.mockReturnValue(true);
      window.adsbygoogle = [];

      const result = canLoadAds();

      expect(result).toBe(true);
    });
  });

  describe('loadAd', () => {
    beforeEach(() => {
      // Setup container
      document.body.innerHTML = '<div id="test-ad-container"></div>';

      // Setup conditions for loading ads
      isFeatureEnabled.mockReturnValue(true);
      isOnline.mockReturnValue(true);
      window.adsbygoogle = [];
    });

    it('should return false when container is not found', () => {
      const result = loadAd('nonexistent-container', 'quizLoading');

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith('[AdManager] Container not found: nonexistent-container');
    });

    it('should return false when no slot ID is configured', () => {
      // quizLoading has empty slot ID by default
      const result = loadAd('test-ad-container', 'quizLoading');

      expect(result).toBe(false);
      expect(logger.debug).toHaveBeenCalledWith('[AdManager] No slot ID for quizLoading - AdSense pending approval');
    });

    it('should prevent duplicate ad loads in same container', () => {
      // Set a slot ID
      setAdSlot('quizLoading', '1234567890');

      // First load
      loadAd('test-ad-container', 'quizLoading');

      // Second load attempt
      const result = loadAd('test-ad-container', 'quizLoading');

      expect(result).toBe(false);
      expect(logger.debug).toHaveBeenCalledWith('[AdManager] Ad already loaded in test-ad-container');
    });

    it('should hide container when ads cannot load', () => {
      isOnline.mockReturnValue(false);

      loadAd('test-ad-container', 'quizLoading');

      const container = document.getElementById('test-ad-container');
      expect(container.style.display).toBe('none');
    });

    it('should load ad successfully when slot ID is set', () => {
      setAdSlot('quizLoading', '1234567890');

      const result = loadAd('test-ad-container', 'quizLoading');

      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('[AdManager] Ad loaded in test-ad-container');

      // Check that ad element was created
      const container = document.getElementById('test-ad-container');
      const adElement = container.querySelector('.adsbygoogle');
      expect(adElement).toBeTruthy();
      expect(adElement.getAttribute('data-ad-slot')).toBe('1234567890');
    });

    it('should push to adsbygoogle array when loading ad', () => {
      setAdSlot('quizLoading', '1234567890');
      window.adsbygoogle = [];

      loadAd('test-ad-container', 'quizLoading');

      expect(window.adsbygoogle.length).toBe(1);
    });
  });

  describe('hideContainer', () => {
    it('should hide container and clear content', () => {
      document.body.innerHTML = '<div id="test-container">Some content</div>';

      hideContainer('test-container');

      const container = document.getElementById('test-container');
      expect(container.innerHTML).toBe('');
      expect(container.style.display).toBe('none');
    });

    it('should not crash when container does not exist', () => {
      expect(() => {
        hideContainer('nonexistent');
      }).not.toThrow();
    });
  });

  describe('showContainer', () => {
    it('should show container', () => {
      document.body.innerHTML = '<div id="test-container" style="display: none;"></div>';

      showContainer('test-container');

      const container = document.getElementById('test-container');
      expect(container.style.display).toBe('block');
    });

    it('should not crash when container does not exist', () => {
      expect(() => {
        showContainer('nonexistent');
      }).not.toThrow();
    });
  });

  describe('resetForNavigation', () => {
    it('should clear loaded ads tracking', () => {
      document.body.innerHTML = '<div id="test-ad-container"></div>';
      isFeatureEnabled.mockReturnValue(true);
      isOnline.mockReturnValue(true);
      window.adsbygoogle = [];
      setAdSlot('quizLoading', '1234567890');

      // Load an ad
      loadAd('test-ad-container', 'quizLoading');

      // Reset
      resetForNavigation();

      // Should be able to load again (duplicate check should pass)
      document.body.innerHTML = '<div id="test-ad-container"></div>';
      const result = loadAd('test-ad-container', 'quizLoading');

      expect(result).toBe(true);
    });

    it('should log debug message', () => {
      resetForNavigation();

      expect(logger.debug).toHaveBeenCalledWith('[AdManager] Reset for navigation');
    });
  });

  describe('initAdManager', () => {
    it('should register online/offline listeners', () => {
      isFeatureEnabled.mockReturnValue(true);
      isOnline.mockReturnValue(true);

      initAdManager();

      expect(onOnline).toHaveBeenCalledTimes(1);
      expect(onOffline).toHaveBeenCalledTimes(1);
    });

    it('should log initialization info', () => {
      isFeatureEnabled.mockReturnValue(true);
      isOnline.mockReturnValue(true);

      initAdManager();

      expect(logger.info).toHaveBeenCalledWith('[AdManager] Initialized', expect.any(Object));
    });
  });

  describe('getPublisherId', () => {
    it('should return the publisher ID', () => {
      const publisherId = getPublisherId();

      expect(publisherId).toBe('ca-pub-9849708569219157');
    });
  });

  describe('setAdSlot', () => {
    it('should set slot ID for valid key', () => {
      setAdSlot('quizLoading', '9999999999');

      expect(logger.info).toHaveBeenCalledWith('[AdManager] Set slot quizLoading = 9999999999');
    });

    it('should warn for unknown slot key', () => {
      setAdSlot('unknownSlot', '1234567890');

      expect(logger.warn).toHaveBeenCalledWith('[AdManager] Unknown slot key: unknownSlot');
    });
  });
});
