<?php
class Config
{
    private static $config = [];
    private static $loaded = false;
    /**
     * Load configuration from .env file
     */
    public static function load()
    {
        if (self::$loaded) {
            return;
        }
        $envPath = __DIR__ . '/../.env';
        if (!file_exists($envPath)) {
            throw new Exception('.env file not found');
        }
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $trimmedLine = trim($line);
            // Skip comments
            if (strpos($trimmedLine, '#') === 0) {
                continue;
            }
            // Parse KEY=VALUE
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                self::$config[trim($key)] = trim($value);
            }
        }
        self::$loaded = true;
    }
    /**
     * Get a configuration value
     */
    public static function get($key, $default = '')
    {
        self::load();
        return isset(self::$config[$key]) ? self::$config[$key] : $default;
    }
    /**
     * Check if running in production
     */
    public static function isProduction()
    {
        return self::get('APP_ENV', 'production') === 'production';
    }
}