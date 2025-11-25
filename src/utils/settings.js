 /**
   * Settings utility for managing user preferences in localStorage
   */

  const SETTINGS_KEY = 'quizmaster_settings';

  // Default values for all settings
  const DEFAULT_SETTINGS = {
    defaultGradeLevel: 'middle school',
    questionsPerQuiz: '10',
    difficulty: 'mixed'
  };

  /**
   * Get all settings (merged with defaults)
   */
  export function getSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error reading settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Get a single setting value
   */
  export function getSetting(key) {
    const settings = getSettings();
    return settings[key];
  }

  /**
   * Save a single setting
   */
  export function saveSetting(key, value) {
    const settings = getSettings();
    settings[key] = value;

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  }

  /**
   * Save multiple settings at once
   */
  export function saveSettings(newSettings) {
    const settings = { ...getSettings(), ...newSettings };

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }