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
    SHARE_QUIZ: {
      phase: 'ENABLED',  // Share quiz questions via URL
      description: 'Share quiz questions so friends can take the same quiz'
    },
    SHOW_USAGE_COSTS: {
      phase: 'ENABLED',  // Show LLM usage costs on results
      description: 'Display token counts and costs after each quiz'
    },
    SHOW_ADS: {
      phase: 'ENABLED',  // Show AdSense ads during loading screens
      description: 'Display Google AdSense ads during quiz and results loading'
    },
    MODE_TOGGLE: {
      phase: 'DISABLED',  // Learning/Party mode toggle
      description: 'Toggle between Learning and Party modes with different themes'
    },
    PARTY_SESSION: {
      phase: 'DISABLED',  // Real-time party sessions (requires MODE_TOGGLE)
      description: 'Create and join party sessions to play quizzes with friends in real-time'
    }
  };

  /**
   * Check if a feature is enabled for a given context
   * @param {string} featureName - Key from FEATURE_FLAGS
   * @param {string} context - Where the feature is being used ('settings' | 'welcome' | 'home')
   * @returns {boolean}
   */
  export function isFeatureEnabled(featureName, context = 'default') {
    // Check for test override in localStorage (for E2E testing)
    const override = localStorage.getItem(`__test_feature_${featureName}`);
    if (override === 'ENABLED') return true;
    if (override === 'DISABLED') return false;

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