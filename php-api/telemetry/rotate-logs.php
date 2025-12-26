<?php
/**
 * Log Rotation Script
 *
 * Deletes telemetry log files older than the configured retention period.
 * Run this via cron, e.g., daily at midnight:
 *
 *   0 0 * * * /usr/bin/php /path/to/telemetry/rotate-logs.php
 *
 * Can also be run manually for testing:
 *   php rotate-logs.php
 *   php rotate-logs.php --dry-run
 */

// Load configuration
$config = require __DIR__ . '/config.php';

// Check for dry-run flag
$dryRun = in_array('--dry-run', $argv ?? []);

// Log directory
$logDir = $config['log_dir'];
$retentionDays = $config['retention_days'];
$prefix = $config['log_prefix'];

// Check if log directory exists
if (!is_dir($logDir)) {
    echo "Log directory does not exist: $logDir\n";
    exit(0);
}

// Calculate cutoff date
$cutoffTime = strtotime("-{$retentionDays} days");
$cutoffDate = date('Y-m-d', $cutoffTime);

echo "=== Telemetry Log Rotation ===\n";
echo "Log directory: $logDir\n";
echo "Retention: $retentionDays days\n";
echo "Cutoff date: $cutoffDate\n";
echo "Mode: " . ($dryRun ? "DRY RUN (no files will be deleted)" : "LIVE") . "\n";
echo "\n";

// Find and process log files
$pattern = $logDir . '/' . $prefix . '*.jsonl';
$files = glob($pattern);

if (empty($files)) {
    echo "No log files found matching pattern: $pattern\n";
    exit(0);
}

$deletedCount = 0;
$keptCount = 0;
$totalSize = 0;
$deletedSize = 0;

foreach ($files as $file) {
    $filename = basename($file);
    $fileSize = filesize($file);
    $totalSize += $fileSize;

    // Extract date from filename (format: telemetry-YYYY-MM-DD.jsonl)
    if (preg_match('/(\d{4}-\d{2}-\d{2})\.jsonl$/', $filename, $matches)) {
        $fileDate = $matches[1];

        if ($fileDate < $cutoffDate) {
            // File is older than retention period
            $deletedSize += $fileSize;

            if ($dryRun) {
                echo "[WOULD DELETE] $filename (" . formatBytes($fileSize) . ")\n";
            } else {
                if (unlink($file)) {
                    echo "[DELETED] $filename (" . formatBytes($fileSize) . ")\n";
                    $deletedCount++;
                } else {
                    echo "[ERROR] Failed to delete: $filename\n";
                }
            }
        } else {
            echo "[KEPT] $filename (" . formatBytes($fileSize) . ")\n";
            $keptCount++;
        }
    } else {
        echo "[SKIPPED] $filename (unexpected format)\n";
    }
}

echo "\n=== Summary ===\n";
echo "Files kept: $keptCount\n";
echo "Files " . ($dryRun ? "to delete" : "deleted") . ": $deletedCount\n";
echo "Space " . ($dryRun ? "to free" : "freed") . ": " . formatBytes($deletedSize) . "\n";
echo "Total log size: " . formatBytes($totalSize - ($dryRun ? 0 : $deletedSize)) . "\n";

/**
 * Format bytes to human-readable string
 */
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= (1 << (10 * $pow));
    return round($bytes, $precision) . ' ' . $units[$pow];
}
