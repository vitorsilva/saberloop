  // src/utils/logger.js
  import log from 'loglevel';

  /**
   * Set log level based on environment
   * - Development: 'debug' (shows everything)
   * - Production: 'info' (hides debug messages)
   */
  if (import.meta.env.DEV) {
    log.setLevel('debug');
  } else {
    log.setLevel('info');
  }

  /**
   * Sensitive keys to redact from logs
   */
  const SENSITIVE_KEYS = ['apikey', 'key', 'password', 'token', 'secret', 'authorization'];

  /**
   * Redact sensitive data from object
   */
  function redactSensitive(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const redacted = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some(k => lowerKey.includes(k))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = redactSensitive(value);
      } else {
        redacted[key] = value;
      }
    }

    return redacted;
  }

  /**
   * Format context object for logging
   */
  function formatContext(context) {
    if (!context || Object.keys(context).length === 0) {
      return '';
    }
    return redactSensitive(context);
  }

  /**
   * Logger API - wraps loglevel with redaction and formatting
   */
  export const logger = {
    debug(message, context = {}) {
      const formatted = formatContext(context);
      formatted ? log.debug(`[DEBUG] ${message}`, formatted) : log.debug(`[DEBUG] ${message}`);
    },

    info(message, context = {}) {
      const formatted = formatContext(context);
      formatted ? log.info(`[INFO] ${message}`, formatted) : log.info(`[INFO] ${message}`);
    },

    warn(message, context = {}) {
      const formatted = formatContext(context);
      formatted ? log.warn(`[WARN] ${message}`, formatted) : log.warn(`[WARN] ${message}`);
    },

    error(message, context = {}) {
      const formatted = formatContext(context);
      formatted ? log.error(`[ERROR] ${message}`, formatted) : log.error(`[ERROR] ${message}`);
    },

    /**
     * Log performance metric
     */
    perf(metric, data = {}) {
      this.info(`[PERF] ${metric}`, data);
    },

    /**
     * Log user action (for analytics/debugging)
     */
    action(action, data = {}) {
      this.debug(`[ACTION] ${action}`, data);
    },

    /**
     * Get the underlying loglevel instance (for advanced use)
     */
    getLevel() {
      return log.getLevel();
    },

    /**
     * Set log level manually (useful for debugging in production)
     */
    setLevel(level) {
      log.setLevel(level);
    }
  };