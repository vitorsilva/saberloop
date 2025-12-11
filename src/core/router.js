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
     * @param {class} ViewClass - View class to render
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