<?php
/**
 * Local Telemetry Configuration (EXAMPLE)
 *
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to config.local.php
 * 2. Replace 'your-secure-token-here' with your actual VITE_TELEMETRY_TOKEN value
 * 3. The token must match what's configured in the frontend's .env file
 *
 * SECURITY NOTES:
 * - config.local.php is in .gitignore (never committed)
 * - config.local.php is blocked from web access via .htaccess
 * - Keep this token secret - it authorizes telemetry ingestion
 */

return [
    // Auth token - MUST match VITE_TELEMETRY_TOKEN in frontend .env
    'token' => 'your-secure-token-here',

    // You can also override other settings if needed:
    // 'log_dir' => '/custom/path/to/logs',
    // 'retention_days' => 60,
];
