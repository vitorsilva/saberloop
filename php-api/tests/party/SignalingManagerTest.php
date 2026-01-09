<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../party/Database.php';
require_once __DIR__ . '/../../party/SignalingManager.php';
require_once __DIR__ . '/../../party/RoomManager.php';

/**
 * Integration tests for SignalingManager.
 *
 * These tests require a MySQL database connection.
 * Set up config.local.php in php-api/party/ with test database credentials.
 */
class SignalingManagerTest extends TestCase
{
    private static ?PDO $db = null;
    private ?SignalingManager $signalingManager = null;
    private ?RoomManager $roomManager = null;
    private ?string $testRoomCode = null;

    public static function setUpBeforeClass(): void
    {
        try {
            self::$db = Database::getConnection();
        } catch (PDOException $e) {
            self::markTestSkipped('Database connection not available: ' . $e->getMessage());
        }
    }

    protected function setUp(): void
    {
        if (self::$db === null) {
            $this->markTestSkipped('Database connection not available');
        }

        $this->signalingManager = new SignalingManager();
        $this->roomManager = new RoomManager();

        // Clean up and create a test room
        $this->cleanupTestData();
        $room = $this->roomManager->createRoom('test-signal-host', 'Signal Host');
        $this->testRoomCode = $room['code'];
        $this->roomManager->joinRoom($this->testRoomCode, 'test-signal-guest', 'Signal Guest');
    }

    protected function tearDown(): void
    {
        $this->cleanupTestData();
    }

    private function cleanupTestData(): void
    {
        if (self::$db === null) return;

        self::$db->exec("DELETE FROM party_signaling WHERE from_id LIKE 'test-signal-%' OR to_id LIKE 'test-signal-%'");
        self::$db->exec("DELETE FROM party_participants WHERE participant_id LIKE 'test-signal-%'");
        self::$db->exec("DELETE FROM party_rooms WHERE host_id LIKE 'test-signal-%'");
    }

    public function testSendMessageReturnsId()
    {
        $payload = ['sdp' => 'test-sdp-data', 'type' => 'offer'];

        $messageId = $this->signalingManager->sendMessage(
            $this->testRoomCode,
            'test-signal-host',
            'test-signal-guest',
            'offer',
            $payload
        );

        $this->assertIsInt($messageId);
        $this->assertGreaterThan(0, $messageId);
    }

    public function testSendMessageWithDifferentTypes()
    {
        $types = ['offer', 'answer', 'ice'];

        foreach ($types as $type) {
            $messageId = $this->signalingManager->sendMessage(
                $this->testRoomCode,
                'test-signal-host',
                'test-signal-guest',
                $type,
                ['data' => "test-{$type}"]
            );

            $this->assertGreaterThan(0, $messageId);
        }
    }

    public function testSendMessageThrowsForInvalidType()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Invalid message type');

        $this->signalingManager->sendMessage(
            $this->testRoomCode,
            'test-signal-host',
            'test-signal-guest',
            'invalid',
            ['data' => 'test']
        );
    }

    public function testGetMessagesReturnsMessages()
    {
        $payload = ['sdp' => 'test-sdp'];

        $this->signalingManager->sendMessage(
            $this->testRoomCode,
            'test-signal-host',
            'test-signal-guest',
            'offer',
            $payload
        );

        $messages = $this->signalingManager->getMessages($this->testRoomCode, 'test-signal-guest');

        $this->assertCount(1, $messages);
        $this->assertEquals('test-signal-host', $messages[0]['fromId']);
        $this->assertEquals('test-signal-guest', $messages[0]['toId']);
        $this->assertEquals('offer', $messages[0]['type']);
        $this->assertEquals($payload, $messages[0]['payload']);
    }

    public function testGetMessagesConsumesMessages()
    {
        $this->signalingManager->sendMessage(
            $this->testRoomCode,
            'test-signal-host',
            'test-signal-guest',
            'offer',
            ['sdp' => 'test']
        );

        // First call returns the message
        $messages1 = $this->signalingManager->getMessages($this->testRoomCode, 'test-signal-guest');
        $this->assertCount(1, $messages1);

        // Second call returns empty (message was consumed)
        $messages2 = $this->signalingManager->getMessages($this->testRoomCode, 'test-signal-guest');
        $this->assertCount(0, $messages2);
    }

    public function testGetMessagesOnlyReturnsMessagesForRecipient()
    {
        // Send message to guest
        $this->signalingManager->sendMessage(
            $this->testRoomCode,
            'test-signal-host',
            'test-signal-guest',
            'offer',
            ['sdp' => 'for-guest']
        );

        // Try to get as host (wrong recipient)
        $messages = $this->signalingManager->getMessages($this->testRoomCode, 'test-signal-host');
        $this->assertCount(0, $messages);

        // Get as guest (correct recipient)
        $messages = $this->signalingManager->getMessages($this->testRoomCode, 'test-signal-guest');
        $this->assertCount(1, $messages);
    }

    public function testGetMessagesReturnsInOrder()
    {
        // Send multiple messages
        $this->signalingManager->sendMessage($this->testRoomCode, 'test-signal-host', 'test-signal-guest', 'offer', ['n' => 1]);
        $this->signalingManager->sendMessage($this->testRoomCode, 'test-signal-host', 'test-signal-guest', 'ice', ['n' => 2]);
        $this->signalingManager->sendMessage($this->testRoomCode, 'test-signal-host', 'test-signal-guest', 'ice', ['n' => 3]);

        $messages = $this->signalingManager->getMessages($this->testRoomCode, 'test-signal-guest');

        $this->assertCount(3, $messages);
        $this->assertEquals(1, $messages[0]['payload']['n']);
        $this->assertEquals(2, $messages[1]['payload']['n']);
        $this->assertEquals(3, $messages[2]['payload']['n']);
    }

    public function testGetRoomParticipantsReturnsOtherParticipants()
    {
        $peers = $this->signalingManager->getRoomParticipants($this->testRoomCode, 'test-signal-host');

        $this->assertCount(1, $peers);
        $this->assertEquals('test-signal-guest', $peers[0]);
    }

    public function testGetRoomParticipantsExcludesSelf()
    {
        $peers = $this->signalingManager->getRoomParticipants($this->testRoomCode, 'test-signal-guest');

        $this->assertCount(1, $peers);
        $this->assertNotContains('test-signal-guest', $peers);
        $this->assertEquals('test-signal-host', $peers[0]);
    }

    public function testClearRoomDeletesAllMessages()
    {
        // Send some messages
        $this->signalingManager->sendMessage($this->testRoomCode, 'test-signal-host', 'test-signal-guest', 'offer', ['a' => 1]);
        $this->signalingManager->sendMessage($this->testRoomCode, 'test-signal-guest', 'test-signal-host', 'answer', ['b' => 2]);

        // Clear room
        $deleted = $this->signalingManager->clearRoom($this->testRoomCode);

        $this->assertEquals(2, $deleted);

        // Verify no messages remain
        $messages = $this->signalingManager->getMessages($this->testRoomCode, 'test-signal-guest');
        $this->assertCount(0, $messages);
    }

    public function testRoomCodeIsCaseInsensitive()
    {
        $this->signalingManager->sendMessage(
            strtolower($this->testRoomCode),
            'test-signal-host',
            'test-signal-guest',
            'offer',
            ['test' => true]
        );

        // Retrieve with uppercase
        $messages = $this->signalingManager->getMessages(
            strtoupper($this->testRoomCode),
            'test-signal-guest'
        );

        $this->assertCount(1, $messages);
    }
}
