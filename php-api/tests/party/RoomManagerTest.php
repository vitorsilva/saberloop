<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../party/Database.php';
require_once __DIR__ . '/../../party/RoomManager.php';

/**
 * Integration tests for RoomManager.
 *
 * These tests require a MySQL database connection.
 * Set up config.local.php in php-api/party/ with test database credentials.
 *
 * To run: npm run test:php
 * Or: cd php-api && vendor/bin/phpunit tests/party/RoomManagerTest.php
 */
class RoomManagerTest extends TestCase
{
    private static ?PDO $db = null;
    private ?RoomManager $roomManager = null;

    public static function setUpBeforeClass(): void
    {
        // Try to connect to database
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

        $this->roomManager = new RoomManager();

        // Clean up test data before each test
        $this->cleanupTestData();
    }

    protected function tearDown(): void
    {
        // Clean up test data after each test
        $this->cleanupTestData();
    }

    private function cleanupTestData(): void
    {
        if (self::$db === null) return;

        // Delete test rooms (those created by test-* IDs)
        self::$db->exec("DELETE FROM party_participants WHERE participant_id LIKE 'test-%'");
        self::$db->exec("DELETE FROM party_rooms WHERE host_id LIKE 'test-%'");
        self::$db->exec("DELETE FROM party_signaling WHERE from_id LIKE 'test-%' OR to_id LIKE 'test-%'");
        self::$db->exec("DELETE FROM party_rate_limits WHERE ip_address = 'test-ip'");
    }

    public function testCreateRoomReturnsRoomWithCode()
    {
        $room = $this->roomManager->createRoom('test-host-1', 'Test Host');

        $this->assertArrayHasKey('code', $room);
        $this->assertEquals(6, strlen($room['code']));
        $this->assertEquals('test-host-1', $room['host_id']);
        $this->assertEquals('Test Host', $room['host_name']);
        $this->assertEquals('waiting', $room['status']);
    }

    public function testCreateRoomAddsHostAsParticipant()
    {
        $room = $this->roomManager->createRoom('test-host-2', 'Test Host');

        $this->assertCount(1, $room['participants']);
        $this->assertEquals('test-host-2', $room['participants'][0]['id']);
        $this->assertTrue($room['participants'][0]['isHost']);
    }

    public function testCreateRoomWithQuizData()
    {
        $quizData = ['title' => 'Test Quiz', 'questions' => []];
        $room = $this->roomManager->createRoom('test-host-3', 'Test Host', $quizData);

        $this->assertEquals($quizData, $room['quiz_data']);
    }

    public function testCreateRoomWithCustomSecondsPerQuestion()
    {
        $room = $this->roomManager->createRoom('test-host-4', 'Test Host', null, 45);

        $this->assertEquals(45, $room['seconds_per_question']);
    }

    public function testGetRoomByCodeReturnsRoom()
    {
        $created = $this->roomManager->createRoom('test-host-5', 'Test Host');
        $fetched = $this->roomManager->getRoomByCode($created['code']);

        $this->assertEquals($created['id'], $fetched['id']);
        $this->assertEquals($created['code'], $fetched['code']);
    }

    public function testGetRoomByCodeReturnsNullForInvalidCode()
    {
        $result = $this->roomManager->getRoomByCode('XXXXXX');

        $this->assertNull($result);
    }

    public function testGetRoomByCodeIsCaseInsensitive()
    {
        $created = $this->roomManager->createRoom('test-host-6', 'Test Host');
        $fetched = $this->roomManager->getRoomByCode(strtolower($created['code']));

        $this->assertEquals($created['id'], $fetched['id']);
    }

    public function testJoinRoomAddsParticipant()
    {
        $room = $this->roomManager->createRoom('test-host-7', 'Test Host');
        $updated = $this->roomManager->joinRoom($room['code'], 'test-guest-1', 'Test Guest');

        $this->assertCount(2, $updated['participants']);
        $this->assertEquals('test-guest-1', $updated['participants'][1]['id']);
        $this->assertFalse($updated['participants'][1]['isHost']);
    }

    public function testJoinRoomThrowsForInvalidCode()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Room not found');

        $this->roomManager->joinRoom('XXXXXX', 'test-guest-2', 'Test Guest');
    }

    public function testJoinRoomThrowsWhenAlreadyInRoom()
    {
        $room = $this->roomManager->createRoom('test-host-8', 'Test Host');
        $this->roomManager->joinRoom($room['code'], 'test-guest-3', 'Test Guest');

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Already in room');

        $this->roomManager->joinRoom($room['code'], 'test-guest-3', 'Test Guest');
    }

    public function testLeaveRoomRemovesParticipant()
    {
        $room = $this->roomManager->createRoom('test-host-9', 'Test Host');
        $this->roomManager->joinRoom($room['code'], 'test-guest-4', 'Test Guest');

        $result = $this->roomManager->leaveRoom($room['code'], 'test-guest-4');

        $this->assertTrue($result);

        $updated = $this->roomManager->getRoomByCode($room['code']);
        $this->assertCount(1, $updated['participants']);
    }

    public function testStartQuizChangesStatus()
    {
        $room = $this->roomManager->createRoom('test-host-10', 'Test Host');
        $this->roomManager->joinRoom($room['code'], 'test-guest-5', 'Test Guest');

        $updated = $this->roomManager->startQuiz($room['code'], 'test-host-10');

        $this->assertEquals('playing', $updated['status']);
        $this->assertNotNull($updated['started_at']);
    }

    public function testStartQuizThrowsForNonHost()
    {
        $room = $this->roomManager->createRoom('test-host-11', 'Test Host');
        $this->roomManager->joinRoom($room['code'], 'test-guest-6', 'Test Guest');

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Only the host can start the quiz');

        $this->roomManager->startQuiz($room['code'], 'test-guest-6');
    }

    public function testStartQuizThrowsWithInsufficientParticipants()
    {
        $room = $this->roomManager->createRoom('test-host-12', 'Test Host');

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Need at least 2 participants');

        $this->roomManager->startQuiz($room['code'], 'test-host-12');
    }

    public function testEndRoomChangesStatus()
    {
        $room = $this->roomManager->createRoom('test-host-13', 'Test Host');

        $result = $this->roomManager->endRoom($room['code'], 'test-host-13');

        $this->assertTrue($result);

        $updated = $this->roomManager->getRoomByCode($room['code']);
        $this->assertEquals('ended', $updated['status']);
        $this->assertNotNull($updated['ended_at']);
    }

    public function testEndRoomThrowsForNonHost()
    {
        $room = $this->roomManager->createRoom('test-host-14', 'Test Host');
        $this->roomManager->joinRoom($room['code'], 'test-guest-7', 'Test Guest');

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Only the host can end the room');

        $this->roomManager->endRoom($room['code'], 'test-guest-7');
    }

    public function testUpdateQuizDataUpdatesRoom()
    {
        $room = $this->roomManager->createRoom('test-host-15', 'Test Host');
        $quizData = ['title' => 'Updated Quiz', 'questions' => [1, 2, 3]];

        $updated = $this->roomManager->updateQuizData($room['code'], 'test-host-15', $quizData);

        $this->assertEquals($quizData, $updated['quiz_data']);
    }

    public function testRoomCodeExcludesSimilarCharacters()
    {
        // Create multiple rooms and check that codes don't contain 0, O, 1, I, L
        $excludedChars = ['0', 'O', '1', 'I', 'L'];

        for ($i = 0; $i < 10; $i++) {
            $room = $this->roomManager->createRoom("test-host-code-{$i}", 'Test Host');

            foreach ($excludedChars as $char) {
                $this->assertStringNotContainsString(
                    $char,
                    $room['code'],
                    "Code should not contain '{$char}'"
                );
            }

            // Clean up immediately to avoid rate limiting
            $this->roomManager->endRoom($room['code'], "test-host-code-{$i}");
        }
    }
}
