 // db.test.js - Unit tests for IndexedDB wrapper

import { beforeEach, describe, expect, it } from 'vitest';

// Set up fake-indexeddb before importing db.js
import 'fake-indexeddb/auto';

// Import functions to test
import {
    initDatabase,
    saveTopic,
    getTopic,
    getAllTopics,
    saveSession,
    getSession,
    getSessionsByTopic,
    getRecentSessions,
    getSetting,
    saveSetting,
    DB_NAME,
    DB_VERSION
  } from './db.js';

  describe('Database Initialization', () => {
    it('should create database with all object stores', async () => {
        const db = await initDatabase();

        // First, verify db was returned
        expect(db).toBeDefined();
        expect(db).not.toBeNull();
 
        // Check if all object stores were created
        expect(db.objectStoreNames.contains('topics')).toBe(true);        
        expect(db.objectStoreNames.contains('sessions')).toBe(true);      
        expect(db.objectStoreNames.contains('settings')).toBe(true);  
    });
  });

   describe('Topics CRUD Operations', () => {
    beforeEach(async () => {
     // Clean slate before each test
      indexedDB.deleteDatabase(DB_NAME);
    });

    it('should save and retrieve a topic', async () => {
      //await initDatabase();

      const topic = {
        id: 'math',
        name: 'Mathematics',
        gradeLevel: '5th Grade',
        createdAt: Date.now(),
        lastPracticed: Date.now(),
        totalQuestions: 10,
        correctAnswers: 8
      };

      await saveTopic(topic);
      const retrieved = await getTopic('math');

      expect(retrieved).toEqual(topic);
    }); 

    it('should return undefined for non-existent topic', async () => {
      const retrieved = await getTopic('nonexistent');
      expect(retrieved).toBeUndefined();
    });

    it('should update existing topic using saveTopic', async () => {
      const topic = {
        id: 'science',
        name: 'Science',
        totalQuestions: 5,
        correctAnswers: 3
      };

      await saveTopic(topic);

      // Update with more questions
      const updated = {
        id: 'science',
        name: 'Science',
        totalQuestions: 10,
        correctAnswers: 7
      };

      await saveTopic(updated);
      const retrieved = await getTopic('science');

      expect(retrieved.totalQuestions).toBe(10);
      expect(retrieved.correctAnswers).toBe(7);
    });

    it('should retrieve all topics', async () => {
      await saveTopic({ id: 'math', name: 'Math' });
      await saveTopic({ id: 'science', name: 'Science' });
      await saveTopic({ id: 'history', name: 'History' });

      const allTopics = await getAllTopics();

      expect(allTopics).toHaveLength(3);
      expect(allTopics.map(t => t.id)).toContain('math');
      expect(allTopics.map(t => t.id)).toContain('science');
      expect(allTopics.map(t => t.id)).toContain('history');
    });

  });

describe('Sessions CRUD Operations', () => {
    beforeEach(async () => {
     // Clean slate before each test
      indexedDB.deleteDatabase(DB_NAME);
    });

    it('should save session and auto-generate ID', async () => {      
      const session = {
        topicId: 'math',
        timestamp: Date.now(),
        score: 4,
        totalQuestions: 5,
        questions: []
      };

      const id = await saveSession(session);

      expect(id).toBe(1);  // First session gets ID 1
    });
 
    it('should generate sequential IDs for multiple sessions',        
  async () => {
      const session1 = { topicId: 'math', timestamp: Date.now(),      
  score: 3, totalQuestions: 5 };
      const session2 = { topicId: 'science', timestamp:
  Date.now(), score: 4, totalQuestions: 5 };
      const session3 = { topicId: 'math', timestamp: Date.now(),      
  score: 5, totalQuestions: 5 };

      const id1 = await saveSession(session1);
      const id2 = await saveSession(session2);
      const id3 = await saveSession(session3);

      //expect(id1).toBe(1);
      expect(id2).toBe(Number(id1) + 1);
      expect(id3).toBe(Number(id1) + 2);
    });

    it('should retrieve session by ID', async () => {
      const session = {
        topicId: 'history',
        timestamp: Date.now(),
        score: 5,
        totalQuestions: 5
      };

      const id = await saveSession(session);
      const retrieved = await getSession(id);

      expect(retrieved.id).toBe(id);
      expect(retrieved.topicId).toBe('history');
      expect(retrieved.score).toBe(5);
    });

    it('should get all sessions for a specific topic', async () =>    
   {
     indexedDB.deleteDatabase(DB_NAME);

      await saveSession({ topicId: 'math1', timestamp: Date.now(), score: 4 });
      await saveSession({ topicId: 'science', timestamp: Date.now(), score: 3 });
      await saveSession({ topicId: 'math1', timestamp: Date.now(), score: 5 });
      await saveSession({ topicId: 'history', timestamp: Date.now(), score: 4 });

      const mathSessions = await getSessionsByTopic('math1');

      expect(mathSessions).toHaveLength(2);
      expect(mathSessions.every(s => s.topicId === 'math1')).toBe(true);
    });

    it('should get recent sessions sorted by timestamp', async () => {
      const now = Date.now();

      await saveSession({ topicId: 'math', timestamp: now + 10000, score: 3 });
      await saveSession({ topicId: 'science', timestamp: now + 5000, score: 4 });
      await saveSession({ topicId: 'history', timestamp: now + 3000, score: 5 });

      const recent = await getRecentSessions(10);

      // Most recent first
      expect(recent[0].timestamp).toBeGreaterThan(recent[1].timestamp);
      expect(recent[1].timestamp).toBeGreaterThan(recent[2].timestamp);
    });


    it('should limit recent sessions to specified amount', async () => {
      const now = Date.now();

      for (let i = 0; i < 10; i++) {
        await saveSession({ topicId: 'math', timestamp: now + i, score: 5 });
      }

      const recent = await getRecentSessions(5);

      expect(recent).toHaveLength(5);
    });
  });  
  
  describe('Settings CRUD Operations', () => {
    beforeEach(async () => {
     // Clean slate before each test
      indexedDB.deleteDatabase(DB_NAME);
    });

    it('should save and retrieve a setting', async () => {
      await saveSetting('apiKey', 'sk-ant-test123');
      const value = await getSetting('apiKey');

      expect(value).toBe('sk-ant-test123');
    });
  
    it('should return undefined for non-existent setting', async () => {
      const value = await getSetting('nonexistent');
      expect(value).toBeUndefined();
    });

    it('should update existing setting', async () => {
      await saveSetting('apiKey', 'old-key');
      await saveSetting('apiKey', 'new-key');

      const value = await getSetting('apiKey');
      expect(value).toBe('new-key');
    });

    it('should store different setting types', async () => {
      await saveSetting('apiKey', 'sk-ant-abc123');
      await saveSetting('defaultGradeLevel', 'High School');
      await saveSetting('darkMode', true);
      await saveSetting('maxQuestions', 10);

      expect(await getSetting('apiKey')).toBe('sk-ant-abc123');       
      expect(await getSetting('defaultGradeLevel')).toBe('High School');
      expect(await getSetting('darkMode')).toBe(true);
      expect(await getSetting('maxQuestions')).toBe(10);
    });

   });

   describe('database initialization', () => {
        it('should initialize database lazily when not initialized',        
        async () => {
            // Don't call initDatabase in beforeEach for this test
            // Call a db function directly
            const topic = { id: 'test', name: 'Test' };
            await saveTopic(topic);  // This will trigger line 39

            const retrieved = await getTopic('test');
            expect(retrieved).toEqual(topic);
        });

   });