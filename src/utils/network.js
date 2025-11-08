  /**
   * Network status utilities for QuizMaster
   * Detects and monitors online/offline state
   */

  /**
   * Check if browser is currently online
   * @returns {boolean} True if online, false if offline
   */
  export function isOnline() {
    return navigator.onLine;
  }

  /**
   * Listen for when browser goes online
   * @param {Function} callback - Function to call when online
   */
  export function onOnline(callback) {
    window.addEventListener('online', callback);
  }

  /**
   * Listen for when browser goes offline
   * @param {Function} callback - Function to call when offline
   */
  export function onOffline(callback) {
    window.addEventListener('offline', callback);
  }

  /**
   * Update the network status indicator dot
   * Call this whenever network status changes
   */
  export function updateNetworkIndicator() {
    const indicator = document.getElementById('networkStatusDot');

    if (!indicator) return; // Indicator not on this view

    if (isOnline()) {
      // Online: green dot
      indicator.className = 'absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark';
    } else {
      // Offline: orange dot
      indicator.className = 'absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-background-light  dark:border-background-dark';
    }
  }

  /**
   * Initialize network status monitoring
   * Call this once when app starts
   */
  export function initNetworkMonitoring() {
    // Update indicator on initial load
    updateNetworkIndicator();

    // Listen for network changes
    onOnline(updateNetworkIndicator);
    onOffline(updateNetworkIndicator);

    console.log('✅ Network monitoring initialized');
  }