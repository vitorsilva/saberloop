# Phase 2: IndexedDB Fundamentals - Learning Notes

**Date Started**: 2025-11-03
**Date Completed**: 2025-11-03
**Status**: ✅ COMPLETED

---

## Session Summary

Successfully built a complete IndexedDB wrapper module (`db.js`) for QuizMaster with comprehensive unit tests.

---

## What Was Completed

### 1. Database Module (`db.js`)
- ✅ Created IndexedDB wrapper with `idb` library
- ✅ Defined 3 object stores:
  - **topics**: User's practiced topics (custom string IDs)
  - **sessions**: Individual quiz sessions (auto-increment IDs)
  - **settings**: App settings like API key
- ✅ Created indexes for efficient querying:
  - `byName` on topics
  - `byTopicId` and `byTimestamp` on sessions
- ✅ Implemented all CRUD functions:
  - Topics: `saveTopic`, `getTopic`, `getAllTopics`
  - Sessions: `saveSession`, `getSession`, `getSessionsByTopic`, `getRecentSessions`
  - Settings: `getSetting`, `saveSetting`
- ✅ Exported constants `DB_NAME` and `DB_VERSION` for testing

### 2. Unit Tests (`db.test.js`)
- ✅ Set up `fake-indexeddb` for testing IndexedDB in Node.js
- ✅ Created 15 comprehensive tests covering:
  - Database initialization
  - Topics CRUD operations (4 tests)
  - Sessions CRUD operations (6 tests)
  - Settings CRUD operations (4 tests)
- ✅ Achieved **97.22% test coverage** on `db.js`
- ✅ All tests passing

### 3. Package Dependencies
- ✅ Installed `idb` package (replacing CDN import for Node.js compatibility)
- ✅ Installed `fake-indexeddb` for unit testing

---

## Key Learning Moments

### NoSQL vs SQL Mindset
- **No schema enforcement**: IndexedDB doesn't validate data types or structure
- **Schema by convention**: We enforce structure in our JavaScript code, not the database
- **Indexes are hints**: They don't prevent you from storing records without indexed fields
- **Denormalization**: No joins, so we duplicate data (e.g., storing topic name in sessions)

### Testing Challenges Solved
1. **CDN imports in Node.js**: Changed from `https://cdn.jsdelivr.net/...` to local `npm install idb`
2. **Missing `autoIncrement`**: Sessions object store needed `autoIncrement: true`
3. **Missing `return` statement**: `initDatabase()` wasn't returning the database promise
4. **Async database deletion**: Had to wrap `deleteDatabase()` in a proper Promise for test isolation
5. **Test coverage understanding**: Learned about statements, branches, functions, and lines metrics

### JavaScript Array Functions Learned
- **`map()`**: Transform each item (`topics.map(t => t.id)` extracts IDs)
- **`filter()`**: Keep items matching condition
- **`find()`**: Get first matching item
- **`every()`**: Check if ALL items pass a test
- **`some()`**: Check if AT LEAST ONE item passes

### API Design Decisions
- **Option A chosen**: `saveSetting(key, value)` / `getSetting(key)` returns just the value
- **Not Option B**: Didn't use object pattern for consistency (simpler caller API)
- **Private helpers**: `getDB()` is internal, not exported (encapsulation)

---

## Code Structure

```
saberloop/
├── db.js                    ✅ Created
├── db.test.js               ✅ Created
├── package.json             ✅ Updated (added idb, fake-indexeddb)
└── docs/
    └── epic02_quizmaster_v1/
        └── PHASE2_LEARNING_NOTES.md  ✅ This file
```

---

## Technical Details

### Database Schema

**Topics Object Store:**
```javascript
{
  id: 'photosynthesis',        // Primary key (string)
  name: 'Photosynthesis',
  gradeLevel: 'High School',
  createdAt: 1699000000000,
  lastPracticed: 1699100000000,
  totalQuestions: 15,
  correctAnswers: 12
}
```

**Sessions Object Store:**
```javascript
{
  id: 1,                       // Auto-increment primary key
  topicId: 'photosynthesis',   // Indexed
  timestamp: 1699100000000,    // Indexed
  score: 4,
  totalQuestions: 5,
  gradeLevel: 'High School',
  questions: [...]             // Full question details
}
```

**Settings Object Store:**
```javascript
{
  key: 'apiKey',              // Primary key
  value: 'sk-ant-...'         // Any type (string, boolean, number, etc.)
}
```

---

## Test Results

```
✓ Database Initialization (1 test)
✓ Topics CRUD Operations (4 tests)
✓ Sessions CRUD Operations (6 tests)
✓ Settings CRUD Operations (4 tests)

Total: 15 tests passed
Coverage: 97.22% statements, 100% functions
Duration: 679ms
```

---

## Questions & Answers During Session

**Q: Why not use localStorage?**
A: localStorage only stores strings, limited to 5MB, no querying. IndexedDB stores objects, much larger limits, supports indexes for efficient queries.

**Q: Should we export `getDB()`?**
A: No - it's a private helper. We only export the public API functions (saveTopic, getTopic, etc.) for encapsulation.

**Q: Why different patterns for Topics vs Sessions saves?**
A: Topics use custom IDs (strings like 'math') and can be updated, so we use `put()`. Sessions are always new records with auto-generated IDs, so we use `add()`.

**Q: Why export DB_NAME and DB_VERSION constants?**
A: To avoid magic strings/numbers in tests. Single source of truth - if we change them in db.js, tests automatically use new values.

**Q: Shouldn't we delete only our database, not all databases?**
A: Yes! Excellent catch - changed from deleting all to `indexedDB.deleteDatabase(DB_NAME)` specifically.

---

## Challenges Faced & Solutions

### Challenge 1: CDN Import in Tests
**Problem**: `import { openDB } from 'https://...'` works in browser but not Node.js
**Solution**: `npm install --save-dev idb` and changed to `import { openDB } from 'idb'`

### Challenge 2: Auto-increment Not Working
**Problem**: DataError when saving sessions - missing key
**Solution**: Added `autoIncrement: true` to sessions object store definition

### Challenge 3: initDatabase() Returns Undefined
**Problem**: Tests failed because database object was undefined
**Solution**: Added `return dbPromise;` at end of `initDatabase()`

### Challenge 4: Test Isolation Issues
**Problem**: Sequential ID tests failing (ID was 2 instead of 1)
**Solution**: Created async `deleteDatabase()` helper that properly awaits deletion completion

---

## Next Steps

**When resuming:**
- Start **Phase 3: API Integration with Anthropic Claude**
- Build the API client module (`api.js`)
- Learn prompt engineering for question generation
- Integrate Claude API for quiz content

**What's ready:**
- ✅ Database layer is complete and tested
- ✅ Can store topics, sessions, and settings
- ✅ Ready to add API integration on top of this foundation

---

## Files Modified/Created This Session

**Created:**
- `db.js` - IndexedDB wrapper (97.22% coverage)
- `db.test.js` - 15 unit tests

**Modified:**
- `package.json` - Added `idb` and `fake-indexeddb` dependencies
- `package-lock.json` - Updated with new dependencies

---

## Commands Used

```bash
# Install dependencies
npm install --save-dev idb
npm install --save-dev fake-indexeddb

# Run tests
npm test

# Check coverage
npm run test:coverage

# Start dev server (for manual testing)
npm run dev
```

---

## Key Takeaways

1. **IndexedDB is powerful**: Browser-based NoSQL database with structured data and indexes
2. **Testing is valuable**: Found 3 bugs during test writing (autoIncrement, return, async deletion)
3. **High coverage achieved**: 97.22% on first try with comprehensive tests
4. **NoSQL flexibility**: No schema enforcement - we validate in code
5. **Async patterns matter**: Properly handling Promises is critical for test isolation
6. **SQL knowledge transfers well**: Concepts like transactions, indexes, and CRUD operations are similar

---

**Ready to continue with Phase 3 when you return!** 🚀
