<?php
/**
 * Telemetry Ingestion Endpoint
 *
 * Receives batched telemetry events from the frontend and stores them
 * as JSONL (JSON Lines) files for later analysis.
 *
 * POST /telemetry/ingest.php
 * Headers:
 *   - Content-Type: application/json
 *   - X-Telemetry-Token: <auth token>
 * Body:
 *   {
 *     "events": [...],
 *     "sentAt": "2025-12-22T10:00:00Z"
 *   }
 */

// Load configuration
$config = require __DIR__ . '/config.php';

// Set JSON response type
header('Content-Type: application/json');

// Handle CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (empty($config['allowed_origins']) || in_array($origin, $config['allowed_origins'])) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Telemetry-Token');
}

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Validate auth token
$token = $_SERVER['HTTP_X_TELEMETRY_TOKEN'] ?? '';
if ($token !== $config['token']) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

// Read and validate request body
$body = file_get_contents('php://input');
if (strlen($body) > $config['max_body_size']) {
    http_response_code(413);
    echo json_encode(['error' => 'Request too large']);
    exit;
}

$data = json_decode($body, true);
if ($data === null || !isset($data['events']) || !is_array($data['events'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON or missing events array']);
    exit;
}

// Ensure log directory exists
$logDir = $config['log_dir'];
if (!is_dir($logDir)) {
    if (!mkdir($logDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create log directory']);
        exit;
    }
}

// Generate log file path (one file per day)
$date = date('Y-m-d');
$logFile = $logDir . '/' . $config['log_prefix'] . $date . '.jsonl';

// Add server-side metadata to each event
$serverTime = date('c');
$clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';

// Prepare lines to write
$lines = '';
foreach ($data['events'] as $event) {
    // Add server metadata
    $event['_server'] = [
        'receivedAt' => $serverTime,
        'clientIp' => $clientIp,
        'batchSentAt' => $data['sentAt'] ?? null,
    ];

    $lines .= json_encode($event, JSON_UNESCAPED_SLASHES) . "\n";
}

// Append to log file (atomic with lock)
$result = file_put_contents($logFile, $lines, FILE_APPEND | LOCK_EX);

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write to log file']);
    exit;
}

// Success response
http_response_code(200);
echo json_encode([
    'success' => true,
    'eventsReceived' => count($data['events']),
    'logFile' => $config['log_prefix'] . $date . '.jsonl',
]);
