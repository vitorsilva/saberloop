<?php
/**
 * Telemetry Configuration
 *
 * This file contains configuration for the telemetry ingestion endpoint.
 * Copy to config.local.php and update the token for production.
 */

return [
    // Auth token - must match VITE_TELEMETRY_TOKEN in frontend
    // IMPORTANT: Change this to a secure random string in production!
    'token' => getenv('TELEMETRY_TOKEN') ?: 'change-this-to-secure-token',

    // Directory where log files are stored (relative to this file)
    // This directory should NOT be web-accessible
    'log_dir' => __DIR__ . '/logs',

    // Log file name pattern (date will be appended)
    'log_prefix' => 'telemetry-',

    // Maximum age of log files in days (for rotation)
    'retention_days' => 30,

    // Maximum request body size in bytes (1MB)
    'max_body_size' => 1024 * 1024,

    // Allowed origins for CORS (empty = allow all)
    'allowed_origins' => [
        'https://saberloop.com',
        'http://localhost:8888',  // Development
    ],
];
