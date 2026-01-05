  import { describe, it, expect, beforeEach } from 'vitest';
  import { FEATURE_FLAGS, isFeatureEnabled, getFeaturePhase } from './features.js';

  describe('Feature Flags', () => {

    describe('isFeatureEnabled', () => {

      it('should return false for unknown feature', () => {
        const result = isFeatureEnabled('UNKNOWN_FEATURE');
        expect(result).toBe(false);
      });

      it('should return false when phase is DISABLED', () => {
        // Temporarily set phase to DISABLED
        const originalPhase = FEATURE_FLAGS.OPENROUTER_GUIDE.phase;
        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = 'DISABLED';

        expect(isFeatureEnabled('OPENROUTER_GUIDE', 'settings')).toBe(false);
        expect(isFeatureEnabled('OPENROUTER_GUIDE', 'welcome')).toBe(false);
        expect(isFeatureEnabled('OPENROUTER_GUIDE', 'home')).toBe(false);

        // Restore
        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = originalPhase;
      });

      it('should return true only for settings context when phase is SETTINGS_ONLY', () => {
        const originalPhase = FEATURE_FLAGS.OPENROUTER_GUIDE.phase;
        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = 'SETTINGS_ONLY';

        expect(isFeatureEnabled('OPENROUTER_GUIDE', 'settings')).toBe(true);
        expect(isFeatureEnabled('OPENROUTER_GUIDE', 'welcome')).toBe(false);
        expect(isFeatureEnabled('OPENROUTER_GUIDE', 'home')).toBe(false);

        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = originalPhase;
      });

      it('should return true for all contexts when phase is ENABLED', () => {
        const originalPhase = FEATURE_FLAGS.OPENROUTER_GUIDE.phase;
        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = 'ENABLED';

        expect(isFeatureEnabled('OPENROUTER_GUIDE', 'settings')).toBe(true);
        expect(isFeatureEnabled('OPENROUTER_GUIDE', 'welcome')).toBe(true);
        expect(isFeatureEnabled('OPENROUTER_GUIDE', 'home')).toBe(true);

        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = originalPhase;
      });

      it('should return false when phase has an unknown value (default case)', () => {
        const originalPhase = FEATURE_FLAGS.OPENROUTER_GUIDE.phase;
        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = 'INVALID_PHASE';

        expect(isFeatureEnabled('OPENROUTER_GUIDE', 'settings')).toBe(false);
        expect(isFeatureEnabled('OPENROUTER_GUIDE', 'welcome')).toBe(false);

        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = originalPhase;
      });

      it('should use default context when not provided', () => {
        const originalPhase = FEATURE_FLAGS.OPENROUTER_GUIDE.phase;

        // ENABLED should return true regardless of context
        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = 'ENABLED';
        expect(isFeatureEnabled('OPENROUTER_GUIDE')).toBe(true);

        // SETTINGS_ONLY should return false for default context
        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = 'SETTINGS_ONLY';
        expect(isFeatureEnabled('OPENROUTER_GUIDE')).toBe(false);

        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = originalPhase;
      });      

    });

    describe('getFeaturePhase', () => {

      it('should return current phase for known feature', () => {
        const phase = getFeaturePhase('OPENROUTER_GUIDE');
        expect(['DISABLED', 'SETTINGS_ONLY', 'ENABLED']).toContain(phase);
      });

      it('should return UNKNOWN for unknown feature', () => {
        const phase = getFeaturePhase('UNKNOWN_FEATURE');
        expect(phase).toBe('UNKNOWN');
      });

      it('should return the exact current phase for known feature', () => {
        const originalPhase = FEATURE_FLAGS.OPENROUTER_GUIDE.phase;

        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = 'DISABLED';
        expect(getFeaturePhase('OPENROUTER_GUIDE')).toBe('DISABLED');

        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = 'ENABLED';
        expect(getFeaturePhase('OPENROUTER_GUIDE')).toBe('ENABLED');

        FEATURE_FLAGS.OPENROUTER_GUIDE.phase = originalPhase;
      });      

    });

  });