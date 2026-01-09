<?php
/**
 * Database Migration Runner
 *
 * Runs SQL migration files to set up the database schema.
 *
 * Usage: Visit https://saberloop.com/party/migrate.php in browser
 *        or run: php migrate.php
 *
 * IMPORTANT: Delete this file after running migrations!
 */

header('Content-Type: text/plain; charset=utf-8');

// Load configuration
$config = require __DIR__ . '/config.php';
$db = $config['db'];

echo "Party Backend - Database Migration\n";
echo "===================================\n\n";

try {
    // Connect to database
    $dsn = "mysql:host={$db['host']};dbname={$db['dbname']};charset={$db['charset']}";
    $pdo = new PDO($dsn, $db['username'], $db['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    echo "Connected to database: {$db['dbname']}\n\n";

    // Find migration files
    $migrationsDir = __DIR__ . '/migrations';
    $files = glob($migrationsDir . '/*.sql');
    sort($files);

    if (empty($files)) {
        echo "No migration files found in migrations/ directory.\n";
        exit(0);
    }

    echo "Found " . count($files) . " migration file(s):\n";
    foreach ($files as $file) {
        echo "  - " . basename($file) . "\n";
    }
    echo "\n";

    // Run each migration
    foreach ($files as $file) {
        $filename = basename($file);
        echo "Running: $filename\n";

        $sql = file_get_contents($file);

        // Split by semicolon to handle multiple statements
        // (PDO doesn't support multiple statements in one exec by default)
        $statements = array_filter(
            array_map('trim', explode(';', $sql)),
            fn($s) => !empty($s) && !preg_match('/^--/', $s)
        );

        foreach ($statements as $statement) {
            // Skip comments-only statements
            $cleanStatement = trim(preg_replace('/--.*$/m', '', $statement));
            if (empty($cleanStatement)) continue;

            try {
                $pdo->exec($statement);
                echo "  ✓ Executed statement\n";
            } catch (PDOException $e) {
                // Check if it's a "table already exists" error (code 42S01)
                if (strpos($e->getMessage(), '42S01') !== false ||
                    strpos($e->getMessage(), 'already exists') !== false) {
                    echo "  ⏭ Table already exists (skipped)\n";
                } else {
                    throw $e;
                }
            }
        }

        echo "  ✅ Completed: $filename\n\n";
    }

    // Verify tables exist
    echo "Verifying tables...\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $expectedTables = ['party_rooms', 'party_participants', 'party_signaling', 'party_rate_limits'];
    $missingTables = array_diff($expectedTables, $tables);

    if (empty($missingTables)) {
        echo "✅ All tables created successfully!\n\n";
        echo "Tables:\n";
        foreach ($expectedTables as $table) {
            echo "  - $table\n";
        }
    } else {
        echo "⚠️ Missing tables: " . implode(', ', $missingTables) . "\n";
    }

    echo "\n🗑️  IMPORTANT: Delete this migrate.php file from the server!\n";

} catch (PDOException $e) {
    echo "❌ Migration failed!\n\n";
    echo "Error: " . $e->getMessage() . "\n";
}
