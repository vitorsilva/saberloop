<?php
/**
 * Telemetry Configuration
 *
 * This file contains default configuration for the telemetry ingestion endpoint.
 *
 * For production deployment:
 * 1. Copy config.local.example.php to config.local.php
 * 2. Set your secure token in config.local.php
 * 3. config.local.php is NOT committed to git (it's in .gitignore)
 * 4. config.local.php is blocked from web access via .htaccess
 */

// Default configuration
$config = [
    // Auth token - must match VITE_TELEMETRY_TOKEN in frontend
    // IMPORTANT: Override this in config.local.php for production!
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

// Load local configuration overrides if present
// This allows setting the token without relying on environment variables
$localConfigPath = __DIR__ . '/config.local.php';
if (file_exists($localConfigPath)) {
    $localConfig = require $localConfigPath;
    if (is_array($localConfig)) {
        $config = array_merge($config, $localConfig);
    }
}

return $config;
