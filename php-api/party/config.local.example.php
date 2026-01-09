<?php
/**
 * Local Party Backend Configuration (EXAMPLE)
 *
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to config.local.php
 * 2. Replace the database credentials with your actual values
 * 3. config.local.php is in .gitignore (never committed)
 *
 * SECURITY NOTES:
 * - config.local.php is blocked from web access via .htaccess
 * - Keep database credentials secret
 * - Use a dedicated user with minimal permissions (SELECT, INSERT, UPDATE, DELETE only)
 */

return [
    'db' => [
        'host' => 'localhost',
        'dbname' => 'your_cpanel_user_saberloop_party',
        'username' => 'your_cpanel_user_party',
        'password' => 'your-secure-password-here',
    ],

    // You can also override other settings if needed:
    // 'room' => [
    //     'expiry_hours' => 4,
    //     'max_participants' => 30,
    // ],
];
