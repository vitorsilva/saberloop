-- Party Backend Migration 002: Add Answers Table and Score Column
-- Run this migration to add answer tracking and scoring support.
--
-- Usage: Execute this SQL in phpMyAdmin or MySQL CLI

-- =====================================================
-- Add score column to party_participants
-- =====================================================
ALTER TABLE party_participants
ADD COLUMN score INT DEFAULT 0 COMMENT 'Current total score';

-- =====================================================
-- Add current_question to party_rooms
-- For tracking quiz progress
-- =====================================================
ALTER TABLE party_rooms
ADD COLUMN current_question INT DEFAULT 0 COMMENT 'Current question index (0-based)';

-- =====================================================
-- Table: party_answers
-- Stores participant answers for scoring and replay
-- =====================================================
CREATE TABLE IF NOT EXISTS party_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL COMMENT 'FK to party_rooms',
    participant_id VARCHAR(36) NOT NULL COMMENT 'UUID of the participant',
    question_index INT NOT NULL COMMENT 'Question index (0-based)',
    answer_index INT NOT NULL COMMENT 'Answer index (0-based, -1 for no answer)',
    is_correct BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether answer was correct',
    time_ms INT NOT NULL DEFAULT 0 COMMENT 'Time taken to answer in milliseconds',
    points INT NOT NULL DEFAULT 0 COMMENT 'Points earned for this answer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES party_rooms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_answer (room_id, participant_id, question_index),
    INDEX idx_room_question (room_id, question_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
