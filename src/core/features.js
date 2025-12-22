  /**
   * Feature Flags for Gradual Rollout
   *
   * Phases:
   * - DISABLED: Code deployed but not active
   * - SETTINGS_ONLY: Available only in Settings page
   * - ENABLED: Available everywhere
   */

  export const FEATURE_FLAGS = {
    OPENROUTER_GUIDE: {
      phase: 'ENABLED',
      description: 'New OpenRouter connection guide with step-by-step instructions'
    },
    TELEMETRY: {
      phase: 'DISABLED',  // Start disabled until VPS endpoint is ready
      description: 'Send telemetry (logs, errors, metrics) to VPS for debugging'
    }
  };

  /**
   * Check if a feature is enabled for a given context
   * @param {string} featureName - Key from FEATURE_FLAGS
   * @param {string} context - Where the feature is being used ('settings' | 'welcome' | 'home')
   * @returns {boolean}
   */
  export function isFeatureEnabled(featureName, context = 'default') {
    const feature = FEATURE_FLAGS[featureName];

    if (!feature) {
      console.warn(`[Features] Unknown feature: ${featureName}`);
      return false;
    }

    switch (feature.phase) {
      case 'DISABLED':
        return false;
      case 'SETTINGS_ONLY':
        return context === 'settings';
      case 'ENABLED':
        return true;
      default:
        return false;
    }
  }

  /**
   * Get current phase for a feature (useful for debugging)
   */
  export function getFeaturePhase(featureName) {
    return FEATURE_FLAGS[featureName]?.phase || 'UNKNOWN';
  }