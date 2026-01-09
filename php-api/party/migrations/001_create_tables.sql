-- Party Backend Migration 001: Create Tables
-- Run this migration to set up the party session database schema.
--
-- Usage: Execute this SQL in phpMyAdmin or MySQL CLI
-- Database: mdemaria_saberloop_party

-- =====================================================
-- Table: party_rooms
-- Stores party session rooms created by hosts
-- =====================================================
CREATE TABLE IF NOT EXISTS party_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(6) NOT NULL UNIQUE COMMENT 'Room code (e.g., ABC123)',
    host_id VARCHAR(36) NOT NULL COMMENT 'UUID of the host',
    host_name VARCHAR(50) NOT NULL COMMENT 'Display name of the host',
    quiz_data JSON COMMENT 'Serialized quiz data',
    status ENUM('waiting', 'playing', 'ended') DEFAULT 'waiting' COMMENT 'Room status',
    max_participants INT DEFAULT 20 COMMENT 'Maximum allowed participants',
    seconds_per_question INT DEFAULT 30 COMMENT 'Time per question in seconds',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL COMMENT 'When quiz started',
    ended_at TIMESTAMP NULL COMMENT 'When session ended',
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: party_participants
-- Stores participants who have joined a room
-- =====================================================
CREATE TABLE IF NOT EXISTS party_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL COMMENT 'FK to party_rooms',
    participant_id VARCHAR(36) NOT NULL COMMENT 'UUID of the participant',
    name VARCHAR(50) NOT NULL COMMENT 'Display name',
    is_host BOOLEAN DEFAULT FALSE COMMENT 'Whether this participant is the host',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL COMMENT 'When participant left (NULL if still in room)',
    FOREIGN KEY (room_id) REFERENCES party_rooms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (room_id, participant_id),
    INDEX idx_room (room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: party_signaling
-- Stores WebRTC signaling messages (offer/answer/ICE)
-- Messages are short-lived and consumed by recipients
-- =====================================================
CREATE TABLE IF NOT EXISTS party_signaling (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(6) NOT NULL COMMENT 'Room code for routing',
    from_id VARCHAR(36) NOT NULL COMMENT 'Sender participant ID',
    to_id VARCHAR(36) NOT NULL COMMENT 'Recipient participant ID',
    type ENUM('offer', 'answer', 'ice') NOT NULL COMMENT 'Message type',
    payload JSON NOT NULL COMMENT 'SDP or ICE candidate data',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    consumed_at TIMESTAMP NULL COMMENT 'When message was retrieved',
    INDEX idx_room_to (room_code, to_id, consumed_at),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: party_rate_limits
-- Tracks room creation for rate limiting
-- =====================================================
CREATE TABLE IF NOT EXISTS party_rate_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL COMMENT 'IPv4 or IPv6 address',
    action VARCHAR(20) NOT NULL COMMENT 'Action being limited (e.g., create_room)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_action (ip_address, action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
