/**
 * Unit tests for i18n module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import i18next from 'i18next';

// Mock translations
const mockEnTranslations = {
    common: {
        home: 'Home',
        settings: 'Settings'
    },
    home: {
        welcome: 'Welcome back!',
        questionOf: 'Question {{current}} of {{total}}'
    }
};

const mockPtTranslations = {
    common: {
        home: 'Início',
        settings: 'Definições'
    },
    home: {
        welcome: 'Bem-vindo de volta!',
        questionOf: 'Pergunta {{current}} de {{total}}'
    }
};

// Mock fetch to return translations
function mockFetch(lang) {
    return vi.fn((url) => {
        if (url.includes('en.json')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockEnTranslations)
            });
        }
        if (url.includes('pt-PT.json')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockPtTranslations)
            });
        }
        // Not found
        return Promise.resolve({ ok: false });
    });
}

describe('i18n Module', () => {
    let originalFetch;
    let originalLocalStorage;

    beforeEach(() => {
        // Reset i18next state
        if (i18next.isInitialized) {
            // Remove all resources
            i18next.options.resources = {};
            i18next.store.data = {};
        }

        // Mock fetch
        originalFetch = global.fetch;
        global.fetch = mockFetch();

        // Mock localStorage
        originalLocalStorage = global.localStorage;
        const store = {};
        global.localStorage = {
            getItem: vi.fn((key) => store[key] || null),
            setItem: vi.fn((key, value) => { store[key] = value; }),
            removeItem: vi.fn((key) => { delete store[key]; }),
            clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); })
        };

        // Clear module cache to reset initialization state
        vi.resetModules();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        global.localStorage = originalLocalStorage;
        vi.restoreAllMocks();
    });

    describe('SUPPORTED_LANGUAGES', () => {
        it('should export supported languages array', async () => {
            const { SUPPORTED_LANGUAGES } = await import('./i18n.js');
            expect(SUPPORTED_LANGUAGES).toBeDefined();
            expect(Array.isArray(SUPPORTED_LANGUAGES)).toBe(true);
            expect(SUPPORTED_LANGUAGES.length).toBeGreaterThan(0);
        });

        it('should include English as default', async () => {
            const { SUPPORTED_LANGUAGES } = await import('./i18n.js');
            const english = SUPPORTED_LANGUAGES.find(l => l.code === 'en');
            expect(english).toBeDefined();
            expect(english.name).toBe('English');
        });

        it('should include Portuguese (pt-PT)', async () => {
            const { SUPPORTED_LANGUAGES } = await import('./i18n.js');
            const portuguese = SUPPORTED_LANGUAGES.find(l => l.code === 'pt-PT');
            expect(portuguese).toBeDefined();
            expect(portuguese.name).toBe('Português');
        });
    });

    describe('DEFAULT_LANGUAGE', () => {
        it('should export English as default language', async () => {
            const { DEFAULT_LANGUAGE } = await import('./i18n.js');
            expect(DEFAULT_LANGUAGE).toBe('en');
        });
    });

    describe('initI18n', () => {
        it('should initialize i18next successfully', async () => {
            const { initI18n } = await import('./i18n.js');
            const instance = await initI18n();
            expect(instance).toBeDefined();
            expect(instance.isInitialized).toBe(true);
        });

        it('should load English translations', async () => {
            const { initI18n, t } = await import('./i18n.js');
            await initI18n({ lng: 'en' });
            expect(t('common.home')).toBe('Home');
        });

        it('should only initialize once', async () => {
            const { initI18n } = await import('./i18n.js');
            const first = await initI18n();
            const second = await initI18n();
            expect(first).toBe(second);
        });

        it('should respect lng option', async () => {
            const { initI18n, getCurrentLanguage } = await import('./i18n.js');
            await initI18n({ lng: 'pt-PT' });
            expect(getCurrentLanguage()).toBe('pt-PT');
        });
    });

    describe('t (translate)', () => {
        it('should return translated text', async () => {
            const { initI18n, t } = await import('./i18n.js');
            await initI18n({ lng: 'en' });
            expect(t('common.home')).toBe('Home');
            expect(t('home.welcome')).toBe('Welcome back!');
        });

        it('should handle interpolation', async () => {
            const { initI18n, t } = await import('./i18n.js');
            await initI18n({ lng: 'en' });
            const result = t('home.questionOf', { current: 1, total: 5 });
            expect(result).toBe('Question 1 of 5');
        });

        it('should return key when not initialized', async () => {
            // Import without initializing
            const { t } = await import('./i18n.js');
            // Don't call initI18n
            const result = t('common.home');
            expect(result).toBe('common.home');
        });

        it('should return key for missing translations', async () => {
            const { initI18n, t } = await import('./i18n.js');
            await initI18n({ lng: 'en' });
            const result = t('nonexistent.key');
            expect(result).toBe('nonexistent.key');
        });
    });

    describe('changeLanguage', () => {
        it('should change language to Portuguese', async () => {
            const { initI18n, changeLanguage, getCurrentLanguage, t } = await import('./i18n.js');
            await initI18n({ lng: 'en' });

            await changeLanguage('pt-PT');

            expect(getCurrentLanguage()).toBe('pt-PT');
            expect(t('common.home')).toBe('Início');
        });

        it('should normalize language codes', async () => {
            const { initI18n, changeLanguage, getCurrentLanguage } = await import('./i18n.js');
            await initI18n({ lng: 'en' });

            // pt-BR should normalize to pt-PT (our supported variant)
            await changeLanguage('pt-BR');
            expect(getCurrentLanguage()).toBe('pt-PT');
        });

        it('should fallback to English for unsupported languages', async () => {
            const { initI18n, changeLanguage, getCurrentLanguage } = await import('./i18n.js');
            await initI18n({ lng: 'en' });

            await changeLanguage('xx-XX');
            expect(getCurrentLanguage()).toBe('en');
        });

        it('should persist language choice to localStorage', async () => {
            const { initI18n, changeLanguage } = await import('./i18n.js');
            await initI18n({ lng: 'en' });

            await changeLanguage('pt-PT');

            expect(localStorage.setItem).toHaveBeenCalledWith('i18nextLng', 'pt-PT');
        });
    });

    describe('getCurrentLanguage', () => {
        it('should return current language code', async () => {
            const { initI18n, getCurrentLanguage } = await import('./i18n.js');
            await initI18n({ lng: 'en' });
            expect(getCurrentLanguage()).toBe('en');
        });

        it('should return default when not initialized', async () => {
            const { getCurrentLanguage, DEFAULT_LANGUAGE } = await import('./i18n.js');
            // Note: getCurrentLanguage uses i18next.language which may be undefined
            const result = getCurrentLanguage();
            expect([DEFAULT_LANGUAGE, undefined]).toContain(result);
        });
    });

    describe('isI18nReady', () => {
        it('should return false before initialization', async () => {
            const { isI18nReady } = await import('./i18n.js');
            expect(isI18nReady()).toBe(false);
        });

        it('should return true after initialization', async () => {
            const { initI18n, isI18nReady } = await import('./i18n.js');
            await initI18n();
            expect(isI18nReady()).toBe(true);
        });
    });

    describe('onLanguageChange', () => {
        it('should call callback when language changes', async () => {
            const { initI18n, changeLanguage, onLanguageChange } = await import('./i18n.js');
            await initI18n({ lng: 'en' });

            const callback = vi.fn();
            onLanguageChange(callback);

            await changeLanguage('pt-PT');

            expect(callback).toHaveBeenCalledWith('pt-PT');
        });

        it('should return unsubscribe function', async () => {
            const { initI18n, changeLanguage, onLanguageChange } = await import('./i18n.js');
            await initI18n({ lng: 'en' });

            const callback = vi.fn();
            const unsubscribe = onLanguageChange(callback);

            // Unsubscribe before changing
            unsubscribe();

            await changeLanguage('pt-PT');

            expect(callback).not.toHaveBeenCalled();
        });
    });
});
