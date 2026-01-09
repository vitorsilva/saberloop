<?php
/**
 * Signaling API Endpoint
 *
 * Handles WebRTC signaling message exchange:
 * - POST /signal                           Send a signaling message
 * - GET  /signal/{code}/{participantId}    Poll for messages
 */

require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/../SignalingManager.php';

// Load config and set up CORS
$config = require __DIR__ . '/../config.php';
ApiHelper::setupCors($config);

try {
    $signalingManager = new SignalingManager();
    $method = ApiHelper::getMethod();
    $pathInfo = $_SERVER['PATH_INFO'] ?? '';
    $segments = ApiHelper::parsePath($pathInfo);

    // Route: POST /signal - Send message
    if ($method === 'POST' && count($segments) === 0) {
        $body = ApiHelper::getJsonBody();
        $roomCode = ApiHelper::requireField($body, 'roomCode');
        $fromId = ApiHelper::requireField($body, 'fromId');
        $toId = ApiHelper::requireField($body, 'toId');
        $type = ApiHelper::requireField($body, 'type');
        $payload = ApiHelper::requireField($body, 'payload');

        $messageId = $signalingManager->sendMessage($roomCode, $fromId, $toId, $type, $payload);

        ApiHelper::success([
            'messageId' => $messageId,
            'sent' => true,
        ], 201);
    }

    // Route: GET /signal/{code}/{participantId} - Poll for messages
    if ($method === 'GET' && count($segments) === 2) {
        $roomCode = $segments[0];
        $participantId = $segments[1];

        $messages = $signalingManager->getMessages($roomCode, $participantId);

        ApiHelper::success([
            'messages' => $messages,
            'count' => count($messages),
        ]);
    }

    // Route: GET /signal/{code}/{participantId}/peers - Get other participants
    if ($method === 'GET' && count($segments) === 3 && $segments[2] === 'peers') {
        $roomCode = $segments[0];
        $participantId = $segments[1];

        $peers = $signalingManager->getRoomParticipants($roomCode, $participantId);

        ApiHelper::success([
            'peers' => $peers,
            'count' => count($peers),
        ]);
    }

    // No matching route
    ApiHelper::error('Not found', 404, 'NOT_FOUND');

} catch (Exception $e) {
    $statusCode = $e->getCode();

    // Ensure valid HTTP status code
    if ($statusCode < 400 || $statusCode > 599) {
        $statusCode = 500;
    }

    ApiHelper::error($e->getMessage(), $statusCode);
}
