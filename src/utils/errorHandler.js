  import { logger } from './logger.js';

  /**
   * Initialize global error handling
   */
  export function initErrorHandling() {
    // Catch uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      logger.error('Uncaught error', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });

      showErrorNotification('An unexpected error occurred.');
      return false;
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', {
        reason: event.reason?.message || String(event.reason)
      });

      showErrorNotification('Something went wrong. Please try again.');
      event.preventDefault();
    });

    logger.info('Error handling initialized');
  }

  /**
   * Show error notification to user
   */
  function showErrorNotification(message) {
    // Remove existing notification if any
    const existing = document.getElementById('error-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'error-notification';
    notification.className = `
      fixed top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-xl
      shadow-lg z-50 flex items-center justify-between
    `;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined">error</span>
        <span>${message}</span>
      </div>
      <button onclick="this.parentElement.remove()" class="material-symbols-outlined
  hover:bg-white/20 rounded p-1">close</button>
    `;

    document.body.appendChild(notification);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - The error object
   * @param {object} context - Additional context for logging
   * @returns {string} User-friendly error message
   */
  export function handleApiError(error, context = {}) {
    logger.error('API error', {
      message: error.message,
      ...context
    });

    // Return user-friendly messages based on error type
    if (error.message.includes('network') || error.message.includes('fetch') ||
  error.message.includes('Failed to fetch')) {
      return 'Network error. Please check your connection.';
    }

    if (error.message.includes('API key') || error.message.includes('401')) {
      return 'API key error. Please check your settings.';
    }

    if (error.message.includes('Rate limit') || error.message.includes('429')) {
      return 'Rate limit reached. Please try again later.';
    }

    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return 'Request timed out. Please try again.';
    }

    return 'An error occurred. Please try again.';
  }