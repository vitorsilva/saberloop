# Database Schema

Saberloop uses IndexedDB for client-side data persistence.

## Database Configuration

| Property | Value |
|----------|-------|
| Database Name | `quizmaster` |
| Version | `1` |
| Library | `idb` (Promise-based wrapper) |

## Object Stores

### 1. `topics`

Stores topic metadata for quiz categorization.

**Key Path:** `id`

**Indexes:**
| Index | Key Path | Description |
|-------|----------|-------------|
| `byName` | `name` | Find topics by name |

**Schema:**
```typescript
interface Topic {
  id: string;           // Unique identifier
  name: string;         // Topic display name
  description?: string; // Optional description
}
```

---

### 2. `sessions`

Stores quiz session data including scores and metadata.

**Key Path:** `id` (auto-increment)

**Indexes:**
| Index | Key Path | Description |
|-------|----------|-------------|
| `byTopicId` | `topicId` | Filter sessions by topic |
| `byTimestamp` | `timestamp` | Sort by date (recent sessions) |

**Schema:**
```typescript
interface Session {
  id: number;              // Auto-incremented
  topicId?: string;        // Reference to topic (optional)
  topic: string;           // Topic name (denormalized)
  gradeLevel: string;      // e.g., "middle school"
  questionCount: number;   // Total questions in quiz
  score: number;           // Number of correct answers
  timestamp: string;       // ISO timestamp of creation
  completedAt?: string;    // ISO timestamp of completion
  isSample?: boolean;      // True for pre-loaded sample quizzes
  questions: Question[];   // Embedded questions array
}
```

**Question Schema (embedded in Session):**
```typescript
interface Question {
  id: string;              // Unique question ID
  question: string;        // Question text
  options: string[];       // Answer options ["A) ...", "B) ...", ...]
  correct: string;         // Correct answer letter ("A", "B", "C", "D")
  userAnswer?: string;     // User's selected answer
  isCorrect?: boolean;     // Whether user answered correctly
  difficulty: string;      // "easy", "medium", "hard"
  explanation?: string;    // Generated for incorrect answers
}
```

---

### 3. `settings`

Stores application settings and user preferences.

**Key Path:** `key`

**Schema:**
```typescript
interface Setting {
  key: string;    // Setting identifier
  value: any;     // Setting value (can be any type)
}
```

**Known Settings:**

| Key | Value Type | Description |
|-----|------------|-------------|
| `openrouter_api_key` | `{ key: string, storedAt: string }` | OpenRouter API key |
| `welcome_seen` | `boolean` | Whether welcome screen was shown |
| `samples_loaded` | `{ version: string }` | Sample data version |
| `gradeLevel` | `string` | Default grade level preference |
| `questionCount` | `number` | Default questions per quiz |
| `difficulty` | `string` | Default difficulty preference |

---

## Common Operations

### Session Operations

```javascript
// Create new session
const sessionId = await saveSession({
  topic: 'Mathematics',
  gradeLevel: 'middle school',
  questionCount: 5,
  score: 0,
  timestamp: new Date().toISOString(),
  questions: []
});

// Get session by ID
const session = await getSession(sessionId);

// Get recent sessions (for home page)
const recent = await getRecentSessions(10);

// Update session (e.g., increment score)
await updateSession(sessionId, { score: 4, completedAt: new Date().toISOString() });
```

### Settings Operations

```javascript
// Save a setting
await saveSetting('gradeLevel', 'high school');

// Get a setting
const gradeLevel = await getSetting('gradeLevel');
```

### OpenRouter Key Operations

```javascript
// Store API key
await storeOpenRouterKey('sk-or-...');

// Get API key
const apiKey = await getOpenRouterKey();

// Check connection status
const isConnected = await isOpenRouterConnected();

// Remove API key (disconnect)
await removeOpenRouterKey();
```

---

## Data Migration

When schema changes are needed:

1. Increment `DB_VERSION` in `src/core/db.js`
2. Add migration logic in the `upgrade` callback
3. Handle both new installs and upgrades

**Example Migration:**
```javascript
upgrade(db, oldVersion, newVersion) {
  if (oldVersion < 1) {
    // Create initial stores
    db.createObjectStore('topics', { keyPath: 'id' });
  }

  if (oldVersion < 2) {
    // Add new index to existing store
    const sessionStore = db.transaction.objectStore('sessions');
    sessionStore.createIndex('byScore', 'score');
  }
}
```

---

## Related Documentation

- [System Overview](./SYSTEM_OVERVIEW.md)
- [API Design](./API_DESIGN.md)
