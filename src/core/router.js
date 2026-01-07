  // Router - Handles navigation between views

  import { logger } from '../utils/logger.js';

  class Router {
    constructor() {
      this.routes = new Map();      // Store route → ViewClass mappings
      this.currentView = null;      // Currently displayed view
    }

    /**
     * Register a route
     * @param {string} path - Route path (e.g., '/home')
     * @param {Function} ViewClass - View class to render
     */
    addRoute(path, ViewClass) {
      this.routes.set(path, ViewClass);
    }

    /**
     * Navigate to a route programmatically
     * @param {string} path - Route path to navigate to
     */
    navigateTo(path) {
      window.location.hash = path;
    }

    /**
     * Handle route changes (triggered by hash change)
     */
     handleRoute() {
        // Get current hash, default to '/' if empty
        const hash = window.location.hash.slice(1) || '/';

        // Check for shared quiz URL pattern: /quiz/<encoded_data>
        if (hash.startsWith('/quiz/') && hash.length > 7) {
          const encodedData = hash.slice(6); // Remove '/quiz/' prefix
          this.handleSharedQuiz(encodedData);
          return;
        }

        // Find the view class for this route
        const ViewClass = this.routes.get(hash);

        if (ViewClass) {
          this.render(ViewClass);
        } else {
          // Route not found, go to default route
          logger.warn('Route not found, redirecting to /', { hash });
          this.navigateTo('/');
        }
      }

      /**
       * Handle shared quiz import from URL
       * @param {string} encodedData - The encoded quiz data from URL
       */
      handleSharedQuiz(encodedData) {
        logger.info('Detected shared quiz URL', { dataLength: encodedData.length });

        // Store the encoded data for the import view to access
        this.sharedQuizData = encodedData;

        // Render the import view (will be registered as '/import')
        const ImportView = this.routes.get('/import');
        if (ImportView) {
          this.render(ImportView);
        } else {
          logger.warn('Import view not registered, redirecting to home');
          this.navigateTo('/');
        }
      }

      /**
       * Get and clear shared quiz data (called by ImportView)
       * @returns {string|null} The encoded quiz data or null
       */
      getSharedQuizData() {
        const data = this.sharedQuizData;
        this.sharedQuizData = null;
        return data;
      }

    /**
     * Render a view
     */
    render(ViewClass) {
      // Clean up previous view
      if (this.currentView && this.currentView.destroy) {
        this.currentView.destroy();
      }

      // Create and render new view
      this.currentView = new ViewClass();
      this.currentView.render();
    }

    /**
     * Initialize the router
     */
    init() {
      // Listen for hash changes
      window.addEventListener('hashchange', () => this.handleRoute());

      // Handle initial page load
      this.handleRoute();
    }
  }

  // Export singleton instance
  export default new Router();