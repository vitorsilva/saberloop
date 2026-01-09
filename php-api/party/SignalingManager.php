<?php
/**
 * Signaling Manager
 *
 * Handles WebRTC signaling message storage and retrieval.
 * Messages are short-lived and consumed by recipients.
 */

require_once __DIR__ . '/Database.php';

class SignalingManager
{
    private PDO $db;
    private array $config;

    public function __construct()
    {
        $this->db = Database::getConnection();
        $this->config = require __DIR__ . '/config.php';
    }

    /**
     * Send a signaling message.
     *
     * @param string $roomCode Room code
     * @param string $fromId Sender participant ID
     * @param string $toId Recipient participant ID
     * @param string $type Message type: 'offer', 'answer', or 'ice'
     * @param array $payload SDP or ICE candidate data
     * @return int Message ID
     * @throws Exception If invalid type
     */
    public function sendMessage(
        string $roomCode,
        string $fromId,
        string $toId,
        string $type,
        array $payload
    ): int {
        $validTypes = ['offer', 'answer', 'ice'];

        if (!in_array($type, $validTypes)) {
            throw new Exception("Invalid message type: {$type}. Must be: " . implode(', ', $validTypes), 400);
        }

        $stmt = $this->db->prepare('
            INSERT INTO party_signaling (room_code, from_id, to_id, type, payload)
            VALUES (?, ?, ?, ?, ?)
        ');

        $stmt->execute([
            strtoupper($roomCode),
            $fromId,
            $toId,
            $type,
            json_encode($payload),
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Get pending messages for a participant.
     *
     * Messages are marked as consumed after retrieval.
     *
     * @param string $roomCode Room code
     * @param string $participantId Recipient participant ID
     * @return array List of messages
     */
    public function getMessages(string $roomCode, string $participantId): array
    {
        // Get unconsumed messages for this participant
        $stmt = $this->db->prepare('
            SELECT id, from_id, to_id, type, payload, created_at
            FROM party_signaling
            WHERE room_code = ?
              AND to_id = ?
              AND consumed_at IS NULL
            ORDER BY created_at ASC
        ');

        $stmt->execute([strtoupper($roomCode), $participantId]);
        $messages = $stmt->fetchAll();

        if (empty($messages)) {
            return [];
        }

        // Mark messages as consumed
        $ids = array_column($messages, 'id');
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        $stmt = $this->db->prepare("
            UPDATE party_signaling
            SET consumed_at = CURRENT_TIMESTAMP
            WHERE id IN ({$placeholders})
        ");

        $stmt->execute($ids);

        // Format messages for response
        return array_map(function ($msg) {
            return [
                'id' => (int) $msg['id'],
                'fromId' => $msg['from_id'],
                'toId' => $msg['to_id'],
                'type' => $msg['type'],
                'payload' => json_decode($msg['payload'], true),
                'createdAt' => $msg['created_at'],
            ];
        }, $messages);
    }

    /**
     * Get all participants in a room who need to establish connections.
     *
     * Used by a new participant to know who to connect to.
     *
     * @param string $roomCode Room code
     * @param string $excludeParticipantId Participant to exclude (self)
     * @return array List of participant IDs
     */
    public function getRoomParticipants(string $roomCode, string $excludeParticipantId): array
    {
        $stmt = $this->db->prepare('
            SELECT p.participant_id
            FROM party_participants p
            JOIN party_rooms r ON r.id = p.room_id
            WHERE r.code = ?
              AND p.participant_id != ?
              AND p.left_at IS NULL
        ');

        $stmt->execute([strtoupper($roomCode), $excludeParticipantId]);

        return array_column($stmt->fetchAll(), 'participant_id');
    }

    /**
     * Clean up expired signaling messages.
     *
     * @return int Number of messages deleted
     */
    public function cleanup(): int
    {
        $expirySeconds = $this->config['signaling']['message_expiry_seconds'] ?? 60;

        $stmt = $this->db->prepare("
            DELETE FROM party_signaling
            WHERE created_at < DATE_SUB(NOW(), INTERVAL ? SECOND)
        ");

        $stmt->execute([$expirySeconds]);

        return $stmt->rowCount();
    }

    /**
     * Delete all signaling messages for a room.
     *
     * @param string $roomCode Room code
     * @return int Number of messages deleted
     */
    public function clearRoom(string $roomCode): int
    {
        $stmt = $this->db->prepare('
            DELETE FROM party_signaling
            WHERE room_code = ?
        ');

        $stmt->execute([strtoupper($roomCode)]);

        return $stmt->rowCount();
    }
}
