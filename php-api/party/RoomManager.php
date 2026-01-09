<?php
/**
 * Room Manager
 *
 * Handles CRUD operations for party rooms.
 */

require_once __DIR__ . '/Database.php';

class RoomManager
{
    private PDO $db;
    private array $config;

    public function __construct()
    {
        $this->db = Database::getConnection();
        $this->config = require __DIR__ . '/config.php';
    }

    /**
     * Generate a unique room code.
     *
     * @return string 6-character alphanumeric code (uppercase)
     */
    private function generateCode(): string
    {
        $length = $this->config['room']['code_length'];
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars: 0/O, 1/I/L

        do {
            $code = '';
            for ($i = 0; $i < $length; $i++) {
                $code .= $chars[random_int(0, strlen($chars) - 1)];
            }
        } while ($this->roomExists($code));

        return $code;
    }

    /**
     * Check if a room code already exists.
     *
     * @param string $code Room code
     * @return bool
     */
    private function roomExists(string $code): bool
    {
        $stmt = $this->db->prepare('SELECT 1 FROM party_rooms WHERE code = ?');
        $stmt->execute([$code]);
        return $stmt->fetch() !== false;
    }

    /**
     * Create a new party room.
     *
     * @param string $hostId UUID of the host
     * @param string $hostName Display name of the host
     * @param array|null $quizData Quiz data (optional, can be set later)
     * @param int|null $secondsPerQuestion Time per question (optional)
     * @return array Room data including code
     * @throws Exception If rate limited or creation fails
     */
    public function createRoom(
        string $hostId,
        string $hostName,
        ?array $quizData = null,
        ?int $secondsPerQuestion = null
    ): array {
        // Check rate limit
        if ($this->isRateLimited($_SERVER['REMOTE_ADDR'] ?? 'unknown')) {
            throw new Exception('Rate limit exceeded. Please try again later.', 429);
        }

        $code = $this->generateCode();
        $seconds = $secondsPerQuestion ?? $this->config['room']['seconds_per_question'] ?? 30;
        $maxParticipants = $this->config['room']['max_participants'] ?? 20;

        $stmt = $this->db->prepare('
            INSERT INTO party_rooms (code, host_id, host_name, quiz_data, seconds_per_question, max_participants)
            VALUES (?, ?, ?, ?, ?, ?)
        ');

        $stmt->execute([
            $code,
            $hostId,
            $hostName,
            $quizData ? json_encode($quizData) : null,
            $seconds,
            $maxParticipants,
        ]);

        $roomId = (int) $this->db->lastInsertId();

        // Add host as first participant
        $this->addParticipant($roomId, $hostId, $hostName, true);

        // Record rate limit action
        $this->recordRateLimitAction($_SERVER['REMOTE_ADDR'] ?? 'unknown', 'create_room');

        return $this->getRoomById($roomId);
    }

    /**
     * Get room by ID.
     *
     * @param int $id Room ID
     * @return array|null Room data or null if not found
     */
    public function getRoomById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM party_rooms WHERE id = ?');
        $stmt->execute([$id]);
        $room = $stmt->fetch();

        if (!$room) {
            return null;
        }

        return $this->formatRoom($room);
    }

    /**
     * Get room by code.
     *
     * @param string $code Room code
     * @return array|null Room data or null if not found
     */
    public function getRoomByCode(string $code): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM party_rooms WHERE code = ?');
        $stmt->execute([strtoupper($code)]);
        $room = $stmt->fetch();

        if (!$room) {
            return null;
        }

        return $this->formatRoom($room);
    }

    /**
     * Format room data for API response.
     *
     * @param array $room Raw database row
     * @return array Formatted room data
     */
    private function formatRoom(array $room): array
    {
        $room['id'] = (int) $room['id'];
        $room['max_participants'] = (int) $room['max_participants'];
        $room['seconds_per_question'] = (int) $room['seconds_per_question'];
        $room['quiz_data'] = $room['quiz_data'] ? json_decode($room['quiz_data'], true) : null;
        $room['participants'] = $this->getParticipants((int) $room['id']);
        return $room;
    }

    /**
     * Get participants for a room.
     *
     * @param int $roomId Room ID
     * @return array List of participants
     */
    public function getParticipants(int $roomId): array
    {
        $stmt = $this->db->prepare('
            SELECT participant_id, name, is_host, joined_at
            FROM party_participants
            WHERE room_id = ? AND left_at IS NULL
            ORDER BY joined_at ASC
        ');
        $stmt->execute([$roomId]);
        $participants = $stmt->fetchAll();

        return array_map(function ($p) {
            return [
                'id' => $p['participant_id'],
                'name' => $p['name'],
                'isHost' => (bool) $p['is_host'],
                'joinedAt' => $p['joined_at'],
            ];
        }, $participants);
    }

    /**
     * Add a participant to a room.
     *
     * @param int $roomId Room ID
     * @param string $participantId Participant UUID
     * @param string $name Display name
     * @param bool $isHost Whether this is the host
     * @return bool Success
     * @throws Exception If room is full or participant already in room
     */
    public function addParticipant(int $roomId, string $participantId, string $name, bool $isHost = false): bool
    {
        $room = $this->getRoomById($roomId);

        if (!$room) {
            throw new Exception('Room not found', 404);
        }

        if ($room['status'] !== 'waiting') {
            throw new Exception('Room is not accepting new participants', 400);
        }

        if (count($room['participants']) >= $room['max_participants']) {
            throw new Exception('Room is full', 400);
        }

        // Check if participant already in room
        $stmt = $this->db->prepare('
            SELECT 1 FROM party_participants
            WHERE room_id = ? AND participant_id = ? AND left_at IS NULL
        ');
        $stmt->execute([$roomId, $participantId]);

        if ($stmt->fetch()) {
            throw new Exception('Already in room', 400);
        }

        $stmt = $this->db->prepare('
            INSERT INTO party_participants (room_id, participant_id, name, is_host)
            VALUES (?, ?, ?, ?)
        ');

        return $stmt->execute([$roomId, $participantId, $name, $isHost ? 1 : 0]);
    }

    /**
     * Join a room by code.
     *
     * @param string $code Room code
     * @param string $participantId Participant UUID
     * @param string $name Display name
     * @return array Updated room data
     * @throws Exception If room not found or join fails
     */
    public function joinRoom(string $code, string $participantId, string $name): array
    {
        $room = $this->getRoomByCode($code);

        if (!$room) {
            throw new Exception('Room not found', 404);
        }

        $this->addParticipant((int) $room['id'], $participantId, $name, false);

        return $this->getRoomById((int) $room['id']);
    }

    /**
     * Remove a participant from a room.
     *
     * @param string $code Room code
     * @param string $participantId Participant UUID
     * @return bool Success
     */
    public function leaveRoom(string $code, string $participantId): bool
    {
        $room = $this->getRoomByCode($code);

        if (!$room) {
            return false;
        }

        $stmt = $this->db->prepare('
            UPDATE party_participants
            SET left_at = CURRENT_TIMESTAMP
            WHERE room_id = ? AND participant_id = ? AND left_at IS NULL
        ');

        return $stmt->execute([(int) $room['id'], $participantId]);
    }

    /**
     * Start the quiz in a room.
     *
     * @param string $code Room code
     * @param string $hostId Host UUID (for authorization)
     * @return array Updated room data
     * @throws Exception If not authorized or room not in waiting state
     */
    public function startQuiz(string $code, string $hostId): array
    {
        $room = $this->getRoomByCode($code);

        if (!$room) {
            throw new Exception('Room not found', 404);
        }

        if ($room['host_id'] !== $hostId) {
            throw new Exception('Only the host can start the quiz', 403);
        }

        if ($room['status'] !== 'waiting') {
            throw new Exception('Quiz already started or ended', 400);
        }

        $participantCount = count($room['participants']);
        $minParticipants = $this->config['room']['min_participants'] ?? 2;

        if ($participantCount < $minParticipants) {
            throw new Exception("Need at least {$minParticipants} participants to start", 400);
        }

        $stmt = $this->db->prepare('
            UPDATE party_rooms
            SET status = ?, started_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ');

        $stmt->execute(['playing', (int) $room['id']]);

        return $this->getRoomById((int) $room['id']);
    }

    /**
     * End a room session.
     *
     * @param string $code Room code
     * @param string $hostId Host UUID (for authorization)
     * @return bool Success
     * @throws Exception If not authorized
     */
    public function endRoom(string $code, string $hostId): bool
    {
        $room = $this->getRoomByCode($code);

        if (!$room) {
            throw new Exception('Room not found', 404);
        }

        if ($room['host_id'] !== $hostId) {
            throw new Exception('Only the host can end the room', 403);
        }

        $stmt = $this->db->prepare('
            UPDATE party_rooms
            SET status = ?, ended_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ');

        return $stmt->execute(['ended', (int) $room['id']]);
    }

    /**
     * Update quiz data for a room.
     *
     * @param string $code Room code
     * @param string $hostId Host UUID (for authorization)
     * @param array $quizData Quiz data
     * @return array Updated room data
     * @throws Exception If not authorized
     */
    public function updateQuizData(string $code, string $hostId, array $quizData): array
    {
        $room = $this->getRoomByCode($code);

        if (!$room) {
            throw new Exception('Room not found', 404);
        }

        if ($room['host_id'] !== $hostId) {
            throw new Exception('Only the host can update quiz data', 403);
        }

        if ($room['status'] !== 'waiting') {
            throw new Exception('Cannot update quiz after starting', 400);
        }

        $stmt = $this->db->prepare('
            UPDATE party_rooms
            SET quiz_data = ?
            WHERE id = ?
        ');

        $stmt->execute([json_encode($quizData), (int) $room['id']]);

        return $this->getRoomById((int) $room['id']);
    }

    /**
     * Check if an IP is rate limited.
     *
     * @param string $ip IP address
     * @return bool True if rate limited
     */
    private function isRateLimited(string $ip): bool
    {
        $maxRooms = $this->config['rate_limit']['rooms_per_hour'] ?? 10;

        $stmt = $this->db->prepare('
            SELECT COUNT(*) as count
            FROM party_rate_limits
            WHERE ip_address = ?
              AND action = ?
              AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ');

        $stmt->execute([$ip, 'create_room']);
        $result = $stmt->fetch();

        return (int) $result['count'] >= $maxRooms;
    }

    /**
     * Record a rate limit action.
     *
     * @param string $ip IP address
     * @param string $action Action type
     */
    private function recordRateLimitAction(string $ip, string $action): void
    {
        $stmt = $this->db->prepare('
            INSERT INTO party_rate_limits (ip_address, action)
            VALUES (?, ?)
        ');

        $stmt->execute([$ip, $action]);
    }

    /**
     * Clean up expired rooms and old data.
     *
     * @return int Number of rooms cleaned up
     */
    public function cleanup(): int
    {
        $expiryHours = $this->config['room']['expiry_hours'] ?? 2;

        // End expired rooms
        $stmt = $this->db->prepare("
            UPDATE party_rooms
            SET status = 'ended', ended_at = CURRENT_TIMESTAMP
            WHERE status != 'ended'
              AND created_at < DATE_SUB(NOW(), INTERVAL ? HOUR)
        ");
        $stmt->execute([$expiryHours]);
        $expiredRooms = $stmt->rowCount();

        // Delete old signaling messages
        $stmt = $this->db->prepare('
            DELETE FROM party_signaling
            WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ');
        $stmt->execute();

        // Delete old rate limit records
        $stmt = $this->db->prepare('
            DELETE FROM party_rate_limits
            WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 HOUR)
        ');
        $stmt->execute();

        return $expiredRooms;
    }
}
