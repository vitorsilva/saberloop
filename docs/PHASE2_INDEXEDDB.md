# Phase 2: IndexedDB Fundamentals

**Goal**: Learn browser-based structured data storage for persistent app data.

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Understand what IndexedDB is and when to use it
- ✅ Know how to create databases and object stores
- ✅ Perform CRUD operations (Create, Read, Update, Delete)
- ✅ Work with transactions safely
- ✅ Build a reusable IndexedDB wrapper module
- ✅ Query and index data efficiently

---

## 2.1 What is IndexedDB?

### The Basics

**IndexedDB is a low-level API for client-side storage of significant amounts of structured data.**

Think of it as a **NoSQL database that runs in your browser**.

### Key Concepts

| Concept | Description | SQL Equivalent |
|---------|-------------|----------------|
| **Database** | Container for all your data | Database |
| **Object Store** | Collection of related records | Table |
| **Key** | Unique identifier for each record | Primary Key |
| **Value** | The actual data stored | Row |
| **Index** | Fast lookup by non-key properties | Index |
| **Transaction** | Group of operations (all succeed or all fail) | Transaction |

### When to Use IndexedDB

**Use IndexedDB when you need:**
- ✅ Structured data (objects, arrays)
- ✅ Large amounts of data (MBs, not just KBs)
- ✅ Querying data by different properties
- ✅ Offline data persistence
- ✅ Async operations (won't block UI)

**Use localStorage when:**
- ✅ Simple key-value pairs
- ✅ Small amounts of data (< 5MB)
- ✅ Only strings needed
- ✅ Sync access is acceptable

**For QuizMaster:**
- We need structured data (topics, sessions, questions)
- Querying (get sessions by topic, get recent sessions)
- Potentially large data (many quiz sessions over time)
- → **IndexedDB is the right choice**

---

## 2.2 IndexedDB vs. localStorage

### Quick Comparison

```javascript
// localStorage (Simple, but limited)
localStorage.setItem('apiKey', 'sk-abc123');
const key = localStorage.getItem('apiKey');

// IndexedDB (More powerful)
const db = await openDB('quizmaster', 1);
await db.put('settings', { id: 'apiKey', value: 'sk-abc123' });
const keyObj = await db.get('settings', 'apiKey');
```

### Why Not Just Use localStorage?

```javascript
// localStorage forces you to stringify objects
const session = {
  topic: 'Photosynthesis',
  score: 4,
  questions: [/* ... */]
};

// Awkward with localStorage
localStorage.setItem('session1', JSON.stringify(session));
const retrieved = JSON.parse(localStorage.getItem('session1'));

// Can't query: "Get all sessions about Photosynthesis"
// Can't index: "Get all sessions sorted by date"
// Limited to ~5MB
```

With IndexedDB, you can:
- Store objects directly
- Query by any property
- Create indexes for fast lookups
- Store much more data (100s of MBs)

---

## 2.3 IndexedDB Core Concepts

### The `idb` Library

**Native IndexedDB is callback-based and verbose.** We'll use the `idb` library which provides a Promise-based API.

```javascript
// Native IndexedDB (verbose, callback-based)
const request = indexedDB.open('myDB', 1);
request.onsuccess = () => {
  const db = request.result;
  const transaction = db.transaction(['store'], 'readwrite');
  const store = transaction.objectStore('store');
  const addRequest = store.add({ id: 1, name: 'Test' });
  addRequest.onsuccess = () => console.log('Added!');
};

// With idb library (clean, Promise-based)
const db = await openDB('myDB', 1, {
  upgrade(db) {
    db.createObjectStore('store', { keyPath: 'id' });
  }
});
await db.add('store', { id: 1, name: 'Test' });
console.log('Added!');
```

### The Three Main Operations

**1. Opening/Creating a Database**

```javascript
import { openDB } from 'idb';

const db = await openDB('quizmaster', 1, {
  upgrade(db, oldVersion, newVersion, transaction) {
    // This runs when the database is first created
    // or when the version number increases
    console.log('Upgrading database...');
  }
});
```

**2. Creating Object Stores (Tables)**

```javascript
const db = await openDB('quizmaster', 1, {
  upgrade(db) {
    // Create "topics" store
    if (!db.objectStoreNames.contains('topics')) {
      db.createObjectStore('topics', { keyPath: 'id', autoIncrement: true });
    }

    // Create "sessions" store
    if (!db.objectStoreNames.contains('sessions')) {
      db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
    }

    // Create "settings" store
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings', { keyPath: 'key' });
    }
  }
});
```

**3. Adding Indexes**

```javascript
const db = await openDB('quizmaster', 1, {
  upgrade(db) {
    const sessionStore = db.createObjectStore('sessions', {
      keyPath: 'id',
      autoIncrement: true
    });

    // Index by topic for fast queries
    sessionStore.createIndex('byTopic', 'topicId');

    // Index by date for chronological ordering
    sessionStore.createIndex('byDate', 'timestamp');
  }
});
```

---

## 2.4 CRUD Operations

### Create (Add Data)

```javascript
// Add a new session
const session = {
  topicId: 'photosynthesis',
  timestamp: Date.now(),
  score: 4,
  totalQuestions: 5,
  questions: [/* ... */]
};

const id = await db.add('sessions', session);
console.log('Session saved with ID:', id);
```

### Read (Get Data)

```javascript
// Get by primary key
const session = await db.get('sessions', 1);

// Get all sessions
const allSessions = await db.getAll('sessions');

// Get sessions for a specific topic (using index)
const photoSessions = await db.getAllFromIndex('sessions', 'byTopic', 'photosynthesis');

// Get latest 5 sessions
const recentSessions = await db.getAllFromIndex('sessions', 'byDate');
const latest5 = recentSessions.reverse().slice(0, 5);
```

### Update (Modify Data)

```javascript
// Get existing session
const session = await db.get('sessions', 1);

// Modify it
session.score = 5; // Updated score

// Put it back (overwrites existing)
await db.put('sessions', session);
```

### Delete (Remove Data)

```javascript
// Delete a specific session
await db.delete('sessions', 1);

// Delete all sessions for a topic
const photoSessions = await db.getAllFromIndex('sessions', 'byTopic', 'photosynthesis');
const tx = db.transaction('sessions', 'readwrite');
for (const session of photoSessions) {
  await tx.store.delete(session.id);
}
await tx.done;
```

---

## 2.5 Transactions

### What is a Transaction?

A transaction is a **group of operations that either all succeed or all fail together**.

**Why use transactions?**
- Data consistency (atomic operations)
- Rollback on error
- Better performance (batch operations)

### Transaction Types

```javascript
// Read-only (default)
const tx = db.transaction('sessions', 'readonly');
const sessions = await tx.store.getAll();

// Read-write (for modifications)
const tx = db.transaction('sessions', 'readwrite');
await tx.store.add(newSession);
await tx.store.put(updatedSession);
await tx.done; // Commit transaction
```

### Important: Transaction Lifetime

**Transactions close automatically after the next "tick"** unless you're actively using them.

```javascript
// ❌ BAD: This will fail
const tx = db.transaction('sessions', 'readwrite');
const session = await tx.store.get(1);

// This await breaks the transaction!
const apiData = await fetch('/api/data');

// ❌ Transaction is already closed here
await tx.store.put(session); // ERROR!

// ✅ GOOD: Don't await other operations mid-transaction
const tx = db.transaction('sessions', 'readwrite');
const session = await tx.store.get(1);
session.score = 5;
await tx.store.put(session);
await tx.done;

// Now you can do other async operations
const apiData = await fetch('/api/data');
```

---

## 2.6 QuizMaster Data Schema

### Database Structure for QuizMaster

```javascript
// db.js
import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';

const DB_NAME = 'quizmaster';
const DB_VERSION = 1;

// Initialize database
async function initDB() {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Topics store
      if (!db.objectStoreNames.contains('topics')) {
        const topicStore = db.createObjectStore('topics', {
          keyPath: 'id'
        });
        topicStore.createIndex('byName', 'name');
      }

      // Sessions store
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', {
          keyPath: 'id',
          autoIncrement: true
        });
        sessionStore.createIndex('byTopicId', 'topicId');
        sessionStore.createIndex('byTimestamp', 'timestamp');
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', {
          keyPath: 'key'
        });
      }
    }
  });
}
```

### Data Models

**Topic Object:**
```javascript
{
  id: 'photosynthesis',           // Unique ID (lowercase topic name)
  name: 'Photosynthesis',         // Display name
  gradeLevel: 'High School',      // Optional
  createdAt: 1699000000000,       // Timestamp
  lastPracticed: 1699100000000,   // Timestamp
  totalQuestions: 15,             // Across all sessions
  correctAnswers: 12              // Across all sessions
}
```

**Session Object:**
```javascript
{
  id: 1,                          // Auto-increment
  topicId: 'photosynthesis',      // Link to topic
  timestamp: 1699100000000,       // When quiz was taken
  score: 4,                       // Correct answers
  totalQuestions: 5,              // Total questions
  gradeLevel: 'High School',      // Optional
  questions: [
    {
      question: 'What is...',
      options: ['A) ...', 'B) ...', 'C) ...', 'D) ...'],
      correctAnswer: 'A',
      userAnswer: 'A',
      isCorrect: true,
      explanation: null           // Only for incorrect answers
    },
    // ... 4 more questions
  ]
}
```

**Settings Object:**
```javascript
{
  key: 'apiKey',
  value: 'sk-ant-...'
}

{
  key: 'defaultGradeLevel',
  value: 'High School'
}
```

---

## 2.7 Building the Database Module

### Creating `db.js`

This module will export functions for all database operations.

**Structure:**
```javascript
// db.js

import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';

const DB_NAME = 'quizmaster';
const DB_VERSION = 1;

let dbPromise;

// Initialize (called once on app startup)
export async function initDatabase() {
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stores...
    }
  });
  return dbPromise;
}

// Get database instance
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
```

---

## 2.8 Testing Your Database Module

### In the Browser Console

Once you've created `db.js`, test it:

```javascript
// 1. Import the module
import * as db from './js/db.js';

// 2. Initialize
await db.initDatabase();

// 3. Save a topic
await db.saveTopic({
  id: 'fractions',
  name: 'Fractions',
  gradeLevel: '5th Grade',
  createdAt: Date.now(),
  lastPracticed: Date.now(),
  totalQuestions: 5,
  correctAnswers: 4
});

// 4. Retrieve it
const topic = await db.getTopic('fractions');
console.log(topic);

// 5. Save a session
const sessionId = await db.saveSession({
  topicId: 'fractions',
  timestamp: Date.now(),
  score: 4,
  totalQuestions: 5,
  questions: [/* ... */]
});

// 6. Get recent sessions
const recent = await db.getRecentSessions(5);
console.log(recent);

// 7. Save API key
await db.saveSetting('apiKey', 'sk-ant-test123');
const apiKey = await db.getSetting('apiKey');
console.log(apiKey);
```

### Viewing Data in DevTools

**Chrome DevTools → Application → Storage → IndexedDB**

You'll see:
- Database: `quizmaster`
- Object Stores: `topics`, `sessions`, `settings`
- Data inside each store

You can inspect, edit, and delete data manually here for testing.

---

## 2.9 Common Patterns

### Pattern 1: Update or Insert (Upsert)

```javascript
export async function upsertTopic(topic) {
  const db = await getDB();
  const existing = await db.get('topics', topic.id);

  if (existing) {
    // Update counts
    existing.totalQuestions += topic.totalQuestions || 0;
    existing.correctAnswers += topic.correctAnswers || 0;
    existing.lastPracticed = Date.now();
    return db.put('topics', existing);
  } else {
    // Create new
    topic.createdAt = Date.now();
    topic.lastPracticed = Date.now();
    return db.put('topics', topic);
  }
}
```

### Pattern 2: Count Records

```javascript
export async function getSessionCount() {
  const db = await getDB();
  return db.count('sessions');
}

export async function getTopicSessionCount(topicId) {
  const db = await getDB();
  return db.countFromIndex('sessions', 'byTopicId', topicId);
}
```

### Pattern 3: Delete All (Clear Store)

```javascript
export async function clearAllSessions() {
  const db = await getDB();
  return db.clear('sessions');
}
```

---

## Checkpoint Questions

**Q1**: What's the difference between `db.add()` and `db.put()`?

<details>
<summary>Answer</summary>

- `add()`: Adds a new record. Fails if key already exists.
- `put()`: Adds or updates. Overwrites if key exists.

Use `add()` for new records, `put()` for updates or when you don't care about duplicates.
</details>

**Q2**: Why do we create indexes?

<details>
<summary>Answer</summary>

Indexes allow fast lookups by properties other than the primary key. Without indexes, you'd have to get all records and filter in JavaScript (slow). With indexes, the database can find records efficiently.
</details>

**Q3**: Can you run multiple transactions in parallel?

<details>
<summary>Answer</summary>

Yes! Multiple read-only transactions can run simultaneously. But write transactions on the same object store will be queued. This is why transactions auto-close - to avoid blocking.
</details>

**Q4**: Where should you initialize the database?

<details>
<summary>Answer</summary>

In your main `app.js` on application startup, before anything else tries to use it:

```javascript
// app.js
import { initDatabase } from './db.js';

async function init() {
  await initDatabase();
  // Now safe to use other db functions
}

init();
```
</details>

---

## Hands-On Exercise

### Build Your `db.js` Module

**Task**: Create the complete database module for QuizMaster.

**Steps**:
1. Create `js/db.js`
2. Implement database initialization with all three stores
3. Implement all CRUD functions for topics, sessions, settings
4. Test in browser console
5. Verify data in DevTools

**Success Criteria**:
- ✅ Can save and retrieve topics
- ✅ Can save and retrieve sessions
- ✅ Can query sessions by topic
- ✅ Can get recent sessions sorted by date
- ✅ Can save and retrieve settings

---

## Next Steps

Once you've built and tested your database module:

**"I'm ready for Phase 3"** → We'll integrate the Anthropic Claude API

**Need help?** → Ask Claude to clarify any IndexedDB concept

---

## Learning Notes

**Date Started**: ___________

**Key Concepts Learned**:
-
-
-

**Code I Wrote**:
- [ ] db.js module
- [ ] Tested in console
- [ ] Verified in DevTools

**Questions/Challenges**:
-
-

**Date Completed**: ___________
