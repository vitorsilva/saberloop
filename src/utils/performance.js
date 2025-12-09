  import { onCLS, onINP, onLCP } from 'web-vitals';
  import { logger } from './logger.js';

  /**
   * Initialize Core Web Vitals monitoring
   */
  export function initPerformanceMonitoring() {
    // Largest Contentful Paint - loading performance
    onLCP((metric) => {
      logger.perf('LCP', {
        value: Math.round(metric.value),
        rating: metric.rating // 'good', 'needs-improvement', or 'poor'
      });
    });

    // Interaction to Next Paint - interactivity (replaced FID in 2024)
    onINP((metric) => {
      logger.perf('INP', {
        value: Math.round(metric.value),
        rating: metric.rating
      });
    });

    // Cumulative Layout Shift - visual stability
    onCLS((metric) => {
      logger.perf('CLS', {
        value: metric.value.toFixed(3),
        rating: metric.rating
      });
    });

    logger.info('Performance monitoring initialized');
  }