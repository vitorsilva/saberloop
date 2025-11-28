// db.js - IndexedDB wrapper for Saberloop

import { openDB } from 'idb';

export const DB_NAME = 'quizmaster';
export const DB_VERSION = 1;

let dbPromise;

// Initialize database and create object stores
export async function initDatabase() {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Create 'topics' object store
            if (!db.objectStoreNames.contains('topics')) {
                const topicStore = db.createObjectStore('topics', { keyPath: 'id' });
                topicStore.createIndex('byName', 'name');
            }

            // Create 'sessions' object store
            if (!db.objectStoreNames.contains('sessions')) {
                const sessionStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true  });
                sessionStore.createIndex('byTopicId', 'topicId');
                sessionStore.createIndex('byTimestamp', 'timestamp');
            }

            // Create 'settings' object store
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
        }   
    });
    return dbPromise; 
}

// Get a reference to the database
async function getDB() {
    if (!dbPromise) {
        dbPromise = initDatabase();
    }
    return dbPromise;
}


// ========== TOPICS ==========

export async function saveTopic(topic) {
    const db = await getDB();
    return db.put('topics', topic);
}

export async function getTopic(id) {
    const db = await getDB();
    return db.get('topics', id);
}

export async function getAllTopics() {
    const db = await getDB();
    return db.getAll('topics');
}

  // ========== SESSIONS ==========

  export async function saveSession(session) {
    const db = await getDB();
    return db.add('sessions', session);
  }

  export async function getSession(id) {
    const db = await getDB();
    return db.get('sessions', id);
  }

  export async function getSessionsByTopic(topicId) {
    const db = await getDB();
    return db.getAllFromIndex('sessions', 'byTopicId', topicId);
  }

  export async function getRecentSessions(limit = 10) {
    const db = await getDB();
    const all = await db.getAllFromIndex('sessions', 'byTimestamp');
    return all.reverse().slice(0, limit);
  }

  export async function updateSession(id, updates) {
    const db = await getDB();
    const session = await db.get('sessions', id);
    if (!session) return null;

    const updatedSession = { ...session, ...updates };
    await db.put('sessions', updatedSession);
    return updatedSession;
  }
  
    // ========== SETTINGS ==========

  export async function getSetting(key) {
    const db = await getDB();
    const setting = await db.get('settings', key);
    return setting?.value;
  }

  export async function saveSetting(key, value) {
    const db = await getDB();
    return db.put('settings', { key, value });
  }