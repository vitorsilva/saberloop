<?php
/**
 * Party Backend Configuration
 *
 * This file contains default configuration for the party session backend.
 *
 * For production deployment:
 * 1. Copy config.local.example.php to config.local.php
 * 2. Set your database credentials in config.local.php
 * 3. config.local.php is NOT committed to git (it's in .gitignore)
 * 4. config.local.php is blocked from web access via .htaccess
 */

// Default configuration
$config = [
    // Database connection
    'db' => [
        'host' => 'localhost',
        'dbname' => 'your_database_name',
        'username' => 'your_username',
        'password' => 'your_password',
        'charset' => 'utf8mb4',
    ],

    // Room settings
    'room' => [
        'code_length' => 6,           // Length of room codes (ABC123)
        'expiry_hours' => 2,          // Rooms expire after 2 hours
        'max_participants' => 20,     // Maximum players per room
        'min_participants' => 2,      // Minimum to start
    ],

    // Rate limiting
    'rate_limit' => [
        'rooms_per_hour' => 10,       // Max rooms created per IP per hour
    ],

    // Signaling
    'signaling' => [
        'message_expiry_seconds' => 60,  // Signaling messages expire after 60s
    ],

    // Allowed origins for CORS
    'allowed_origins' => [
        'https://saberloop.com',
        'http://localhost:8888',  // Development
    ],
];

// Load local configuration overrides if present
$localConfigPath = __DIR__ . '/config.local.php';
if (file_exists($localConfigPath)) {
    $localConfig = require $localConfigPath;
    if (is_array($localConfig)) {
        $config = array_replace_recursive($config, $localConfig);
    }
}

return $config;
