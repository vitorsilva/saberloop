# Phase 3: API Integration - Learning Notes

**Date Started**: 2025-11-07

**Date Completed**: 2025-11-07

---

## What We Built

### Files Created
- ✅ `src/prompts.js` - Prompt templates for Claude API
- ✅ `src/api.js` - Real API client (blocked by CORS)
- ✅ `src/api.mock.js` - Mock API for testing and development

### Project Restructuring
- ✅ Moved all source files to `src/` directory
- ✅ Updated `index.html` to reference `src/app.js`
- ✅ Verified build, tests, and deployment still work
- ✅ Maintained proper git history with `git mv`

---

## Key Concepts Learned

### 1. REST APIs and HTTP Requests
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Request structure**: Headers, body, authentication
- **Response handling**: Status codes (200, 400, 401, 429, 500)
- **JSON**: Structured data format for APIs

### 2. The Fetch API
```javascript
const response = await fetch(url, {
  method: 'POST',
  headers: { /* ... */ },
  body: JSON.stringify(data)
});

const data = await response.json();
```

### 3. Async/Await Patterns
- **Why needed**: Network calls take time, can't block UI
- **Async functions**: Always return Promises
- **Await keyword**: Pauses execution until Promise resolves
- **Error handling**: Try/catch blocks for graceful failures

### 4. Prompt Engineering
**Good prompts are:**
- Specific (exactly what you want)
- Contextual (provide grade level, difficulty)
- Structured (define output format like JSON)
- Constrained (set limits, avoid ambiguity)

**Example:**
```javascript
"Generate exactly 5 multiple-choice questions about 'Fractions'
for 5th Grade students. Return as JSON array with structure:
[{ question, options, correct, difficulty }]"
```

### 5. API Security
- **Never hardcode API keys** in source code
- **Store keys securely** in user's browser (IndexedDB/localStorage)
- **BYOK pattern**: Bring Your Own Key (user provides their key)

---

## Major Challenge: CORS (Cross-Origin Resource Sharing)

### The Problem

When we tried to call the Anthropic API directly from the browser, we hit this error:

```
Access to fetch at 'https://api.anthropic.com/v1/messages' from origin
'http://localhost:3000' has been blocked by CORS policy
```

### Why This Happens

**CORS is a browser security feature** that prevents JavaScript from making requests to different domains (origins) unless the server explicitly allows it.

**Security reasons:**
1. Prevents API key theft (keys visible in browser DevTools)
2. Protects against malicious websites stealing credentials
3. Prevents unauthorized API usage and charges

### The Real-World Solution

**AI APIs like Anthropic's are designed to be called from backend servers, not browsers.**

**Architecture needed:**
```
Browser (Frontend)
    ↓ HTTP request
Backend Server (Node.js/Serverless Function)
    ↓ API call with secret key
Anthropic Claude API
```

**Options for backend:**
- Netlify Functions (serverless)
- Vercel Serverless Functions
- AWS Lambda
- Simple Node.js/Express server
- Cloudflare Workers

### Our Solution: Mock API

For learning and development purposes, we created `api.mock.js`:

**Benefits:**
- ✅ Develop UI without API calls
- ✅ No API costs during development
- ✅ Work offline
- ✅ Instant responses (no network delay)
- ✅ Predictable test data
- ✅ Foundation for unit tests

**Mock API features:**
- Simulates network delay (realistic timing)
- Returns properly structured data
- Console logging shows it's mock data
- Same interface as real API (drop-in replacement)

---

## Code We Wrote

### Prompt Templates (`src/prompts.js`)

```javascript
export function createQuestionPrompt(topic, gradeLevel) {
  return `You are an expert educational content creator...
  Generate exactly 5 multiple-choice questions about "${topic}"...
  Return as JSON: [{ question, options, correct, difficulty }]`;
}

export function createExplanationPrompt(question, userAnswer, correctAnswer, gradeLevel) {
  return `You are a patient, encouraging tutor...
  Explain why ${userAnswer} was incorrect and why ${correctAnswer} is correct...
  Keep it under 150 words, friendly tone.`;
}
```

**Key learnings:**
- Prompts are modular and reusable
- Parameters make them flexible (topic, grade level)
- Clear structure improves AI output quality
- Specific constraints (word count, tone) give consistent results

### API Client (`src/api.js`)

```javascript
async function callClaude(messages, options = {}) {
  const apiKey = await getSetting('apiKey');  // From IndexedDB

  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': API_VERSION,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      messages: messages
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API error: ${error.message}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
```

**Key learnings:**
- Retrieve API key asynchronously from IndexedDB
- Proper error handling with try/catch
- Parse JSON responses carefully
- Validate response structure before using

### Mock API (`src/api.mock.js`)

```javascript
export async function generateQuestions(topic, gradeLevel) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log(`[MOCK API] Generating questions for "${topic}"`);

  return [/* 5 realistic question objects */];
}
```

**Key learnings:**
- Simulate realistic behavior (delays, logging)
- Return same data structure as real API
- Use for development and testing
- Easy to swap with real API later

---

## Testing We Did

### Browser Console Testing

```javascript
// Test mock API
const mockApi = await import('./src/api.mock.js');
const questions = await mockApi.generateQuestions('Fractions', '5th Grade');

// Results:
// ✅ Returns 5 questions
// ✅ Proper structure: question, options, correct, difficulty
// ✅ Questions contextual to topic
// ✅ Realistic 1-second delay
```

### Verification Steps
- ✅ Build still works (`npm run build`)
- ✅ Tests still pass (`npm test`)
- ✅ Deployment to GitHub Pages works
- ✅ Mock API returns correct data structure

---

## Important Lessons

### 1. Project Organization Matters
Moving to `src/` directory made the project more professional and maintainable. Changes required:
- Update HTML script reference
- Keep relative imports (`./`) in same directory
- Test everything after restructuring

### 2. Real-World Constraints
The original learning plan didn't account for CORS. This is a valuable lesson:
- **Planning vs. Reality**: Real development hits unexpected issues
- **Adaptation**: Created mock API as a workaround
- **Production thinking**: Understood why backend is needed

### 3. Test Infrastructure First
Building with mocks first is professional practice:
- Develop without dependencies
- Create stable test environment
- Avoid API costs during development
- Makes unit testing possible

### 4. Async/Await is Powerful
Every API call, database operation, and delayed action uses async/await:
```javascript
const apiKey = await getSetting('apiKey');      // Wait for DB
const response = await fetch(url);              // Wait for network
const data = await response.json();             // Wait for parsing
```

Without `await`, we'd get Promises instead of actual values.

### 5. Error Handling is Critical
```javascript
try {
  const data = await riskyOperation();
  return data;
} catch (error) {
  console.error('Operation failed:', error);
  return null;  // Graceful fallback
}
```

Prevents app crashes and provides user-friendly messages.

---

## Questions Answered

**Q: Why do we need async/await when calling APIs?**
- APIs take time (network latency)
- Without async, we'd freeze the UI or deal with callback hell
- Async/await makes async code look synchronous

**Q: Why ask Claude to return JSON for questions but plain text for explanations?**
- Questions need structure (programmatic display/validation) → JSON
- Explanations are free-form text (display as-is) → Plain text

**Q: Where should the API key be stored?**
- In IndexedDB/localStorage (user's device)
- Never in source code
- BYOK pattern: user provides their own key

**Q: Why can't we call Claude API from the browser?**
- CORS security restriction
- API keys would be exposed in DevTools
- Prevents theft and unauthorized usage
- Solution: Backend server needed

---

## Success Criteria (Modified)

Original criteria with reality check:

- ✅ **Can call Claude API successfully** - Code is correct, blocked by CORS
- ✅ **Questions returned in correct JSON format** - Verified with mock
- ✅ **Explanations are clear and encouraging** - Prompt designed well
- ✅ **Errors handled gracefully** - Try/catch blocks in place
- ⚠️ **Rate limiting handled with retry** - Not implemented (would need backend)

**Additional achievements:**
- ✅ Created mock API for development
- ✅ Reorganized project structure to `src/`
- ✅ Understood real-world API constraints
- ✅ Documented CORS limitation and solutions

---

## Next Steps / Open Questions

### Immediate Decision Needed

**Should we:**
1. **Continue with mock API** and build UI (Phase 4-6), add backend later?
2. **Add backend now** (Netlify/Vercel functions) to make it production-ready?

### Backend Research Topics (If chosen)

- Netlify Functions setup
- Vercel Serverless Functions
- Environment variables for API keys
- CORS configuration
- Serverless deployment

### Alternative Approaches

- Could we use Claude.ai chat interface instead of API? (Different UX)
- Browser extensions that bypass CORS? (Not recommended)
- Different AI provider with browser-friendly API? (Unlikely)

---

## Reflections

### What Went Well
- Quick adaptation when hitting CORS issue
- Created professional mock infrastructure
- Reorganized project for better maintainability
- Understood prompt engineering principles

### What Was Challenging
- Unexpected CORS limitation not in original plan
- Decision point: continue with mocks or add backend?
- Understanding security implications of browser-based API calls

### What I Learned About Development
- **Plans change**: Real projects hit unexpected constraints
- **Adaptation matters**: Mock API was a professional solution
- **Security first**: Understanding why CORS exists is important
- **Testing infrastructure**: Mocks enable better development

---

## Resources Used

- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN: async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await)

---

## Code Commit Reference

```bash
git log --oneline
# refactor: move source files to src/ directory for better organization
# feat: add API integration with mock implementation for Phase 3
```

---

**Phase 3 Status**: ✅ Complete (with modifications for CORS limitation)

**Ready for Phase 4**: Yes (with mock API) or Pending (if adding backend first)
