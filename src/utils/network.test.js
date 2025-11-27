import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isOnline, onOnline, onOffline, updateNetworkIndicator, updateOfflineUI } from './network.js';

describe('Network Utilities', () => {
  describe('isOnline function', () => {

    it('should return true when navigator is online', () => {
      // Arrange: Mock navigator.onLine to be true
      vi.stubGlobal('navigator', { onLine: true });

      // Act: Call the function
      const result = isOnline();

      // Assert: Should return true
      expect(result).toBe(true);
    });

    it('should return false when navigator is offline', () => {
      // Arrange: Mock navigator.onLine to be false
      vi.stubGlobal('navigator', { onLine: false });

      // Act
      const result = isOnline();

      // Assert
      expect(result).toBe(false);
    });

  });

  describe('updateNetworkIndicator function', () => {

    beforeEach(() => {
      // Setup: Create DOM element before each test
      document.body.innerHTML = `
        <span id="networkStatusDot" class=""></span>
      `;
    });

    it('should set green class when online', () => {
      // Arrange: Mock as online
      vi.stubGlobal('navigator', { onLine: true });

      const indicator = document.getElementById('networkStatusDot');     

      // Act: Update the indicator
      updateNetworkIndicator();

      // Assert: Should have green background
      expect(indicator.className).toContain('bg-green-500');
    });

    it('should set orange class when offline', () => {
      // Arrange: Mock as offline
      vi.stubGlobal('navigator', { onLine: false });

      const indicator = document.getElementById('networkStatusDot');     

      // Act
      updateNetworkIndicator();

      // Assert: Should have orange background
      expect(indicator.className).toContain('bg-orange-500');
    });

    it('should not crash when indicator element is missing', () => {     
      // Arrange: Remove the element
      document.body.innerHTML = '';

      // Act & Assert: Should not throw error
      expect(() => {
        updateNetworkIndicator();
      }).not.toThrow();
    });

  });

    describe('updateOfflineUI function', () => {
      let banner, button;

      beforeEach(() => {
        // Setup: Create mock DOM elements before each test
        document.body.innerHTML = `
          <div id="offlineBanner" class="hidden"></div>
          <button id="startQuizBtn"></button>
        `;
        banner = document.getElementById('offlineBanner');
        button = document.getElementById('startQuizBtn');
      });

      it('should hide banner and enable button when online', () => {
        // Arrange: Mock as online
        vi.stubGlobal('navigator', { onLine: true });

        // Start with banner visible and button disabled
        banner.classList.remove('hidden');
        button.disabled = true;

        // Act: Update UI
        updateOfflineUI();

        // Assert: Banner should be hidden, button enabled
        expect(banner.classList.contains('hidden')).toBe(true);
        expect(button.disabled).toBe(false);
      });

      it('should show banner and disable button when offline', () => {
        // Arrange: Mock as offline
        vi.stubGlobal('navigator', { onLine: false });

        // Start with banner hidden and button enabled
        banner.classList.add('hidden');
        button.disabled = false;

        // Act: Update UI
        updateOfflineUI();

        // Assert: Banner should be visible, button disabled
        expect(banner.classList.contains('hidden')).toBe(false);
        expect(button.disabled).toBe(true);
      });

      it('should handle missing banner element gracefully', () => {
        // Arrange: Remove banner but keep button
        banner.remove();
        vi.stubGlobal('navigator', { onLine: false });

        // Act & Assert: Should not throw
        expect(() => updateOfflineUI()).not.toThrow();

        // Button should still be updated
        expect(button.disabled).toBe(true);
      });

      it('should handle missing button element gracefully', () => {
        // Arrange: Remove button but keep banner
        button.remove();
        vi.stubGlobal('navigator', { onLine: false });

        // Act & Assert: Should not throw
        expect(() => updateOfflineUI()).not.toThrow();

        // Banner should still be updated
        expect(banner.classList.contains('hidden')).toBe(false);
      });

      it('should handle both elements missing gracefully', () => {
        // Arrange: Remove all elements
        document.body.innerHTML = '';
        vi.stubGlobal('navigator', { onLine: true });

        // Act & Assert: Should not throw error
        expect(() => updateOfflineUI()).not.toThrow();
      });
    });  

  describe('Event listener functions', () => {

    it('onOnline should register listener that fires when going online', () => {
      // Arrange: Create a mock callback
      const mockCallback = vi.fn();

      // Act: Register the listener
      onOnline(mockCallback);

      // Simulate browser going online
      window.dispatchEvent(new Event('online'));

      // Assert: Callback should have been called
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('onOffline should register listener that fires when going offline', () => {
      // Arrange
      const mockCallback = vi.fn();

      // Act
      onOffline(mockCallback);

      // Simulate browser going offline
      window.dispatchEvent(new Event('offline'));

      // Assert
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

  });
    
});