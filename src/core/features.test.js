  import { describe, it, expect, beforeEach } from 'vitest';
  import { FEATURE_FLAGS, isFeatureEnabled, getFeaturePhase } from './features.js';

  describe('Feature Flags', () => {

    describe('isFeatureEnabled', () => {

      it('should return false for unknown feature', () => {
        const result = isFeatureEnabled('UNKNOWN_FEATURE');
        expect(result).toBe(false);
      });

      it('should return false when phase is DISABLED', () => {
        // MODE_TOGGLE is currently DISABLED
        expect(isFeatureEnabled('MODE_TOGGLE', 'settings')).toBe(false);
        expect(isFeatureEnabled('MODE_TOGGLE', 'welcome')).toBe(false);
        expect(isFeatureEnabled('MODE_TOGGLE', 'home')).toBe(false);
      });

      it('should return true when phase is ENABLED', () => {
        // SHOW_ADS is currently ENABLED
        expect(isFeatureEnabled('SHOW_ADS', 'settings')).toBe(true);
        expect(isFeatureEnabled('SHOW_ADS', 'welcome')).toBe(true);
        expect(isFeatureEnabled('SHOW_ADS', 'home')).toBe(true);
      });

      it('should use default context when not provided', () => {
        // ENABLED should return true regardless of context
        expect(isFeatureEnabled('SHOW_ADS')).toBe(true);

        // DISABLED should return false regardless of context
        expect(isFeatureEnabled('MODE_TOGGLE')).toBe(false);
      });

    });

    describe('getFeaturePhase', () => {

      it('should return current phase for known feature', () => {
        const phase = getFeaturePhase('SHOW_ADS');
        expect(['DISABLED', 'SETTINGS_ONLY', 'ENABLED']).toContain(phase);
      });

      it('should return UNKNOWN for unknown feature', () => {
        const phase = getFeaturePhase('UNKNOWN_FEATURE');
        expect(phase).toBe('UNKNOWN');
      });

      it('should return the exact current phase for known feature', () => {
        expect(getFeaturePhase('SHOW_ADS')).toBe('ENABLED');
        expect(getFeaturePhase('MODE_TOGGLE')).toBe('DISABLED');
      });

    });

  });
