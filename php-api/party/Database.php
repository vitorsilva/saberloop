<?php
/**
 * Database Connection Singleton
 *
 * Provides a single PDO connection instance for all managers.
 */

class Database
{
    private static ?PDO $instance = null;

    /**
     * Get the PDO database connection instance.
     *
     * @return PDO
     * @throws PDOException If connection fails
     */
    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $config = require __DIR__ . '/config.php';
            $db = $config['db'];

            $dsn = "mysql:host={$db['host']};dbname={$db['dbname']};charset={$db['charset']}";

            self::$instance = new PDO($dsn, $db['username'], $db['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        }

        return self::$instance;
    }

    /**
     * Reset the connection (useful for testing).
     */
    public static function reset(): void
    {
        self::$instance = null;
    }
}
