<?php

require_once __DIR__ . '/../Config.php';

function handleHealthCheck()
{
    // Check if API key is configured (don't reveal the actual key!)
    $apiKeyConfigured = !empty(Config::get('ANTHROPIC_API_KEY'));
    $response = array(
        'status' => 'ok',
        'timestamp' => date('c'),
        'php_version' => PHP_VERSION,
        'api_key_configured' => $apiKeyConfigured
    );
    return $response;
}