# Phase 3: API Integration with Anthropic Claude

**Goal**: Learn to integrate external APIs and generate quiz content using AI.

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Understand REST API basics and HTTP requests
- ✅ Master the Fetch API for making HTTP calls
- ✅ Use async/await patterns effectively
- ✅ Integrate with the Anthropic Claude API
- ✅ Craft effective prompts for quality output (prompt engineering)
- ✅ Handle API errors and rate limiting gracefully
- ✅ Build reusable API client modules

---

## 3.1 Understanding REST APIs

### What is a REST API?

**REST (Representational State Transfer)** is a way for applications to communicate over HTTP.

Think of it like this:
- Your app is a **client** (makes requests)
- Claude API is a **server** (responds to requests)
- They communicate using **HTTP** (the same protocol browsers use)

### HTTP Request Structure

```
POST /v1/messages HTTP/1.1              ← Method and endpoint
Host: api.anthropic.com                  ← Server
x-api-key: sk-ant-xxxxx                  ← Authentication
Content-Type: application/json           ← Body format

{                                        ← Request body (data)
  "model": "claude-sonnet-4-5",
  "messages": [...]
}
```

### HTTP Methods

| Method | Purpose | Example |
|--------|---------|---------|
| **GET** | Retrieve data | Get user info |
| **POST** | Create/send data | Send a message to Claude |
| **PUT** | Update data | Update user settings |
| **DELETE** | Remove data | Delete a session |

**For Claude API**: We only use **POST** (to send messages and get responses).

### Response Structure

```javascript
{
  "id": "msg_01XFDUDYJgAACzvnptvVbrqX",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Hello! How can I help you today?"
    }
  ],
  "model": "claude-sonnet-4-5",
  "stop_reason": "end_turn"
}
```

### Status Codes

| Code | Meaning | What to do |
|------|---------|------------|
| **200** | Success | Process the response |
| **400** | Bad Request | Check your request format |
| **401** | Unauthorized | Check your API key |
| **429** | Rate Limited | Wait and retry |
| **500** | Server Error | Retry after delay |

---

## 3.2 The Fetch API

### What is Fetch?

**Fetch is a modern JavaScript API for making HTTP requests.**

```javascript
// Basic syntax
const response = await fetch(url, options);
const data = await response.json();
```

### Simple GET Request

```javascript
// Fetch data from an API
const response = await fetch('https://api.example.com/data');

// Check if successful
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

// Parse JSON response
const data = await response.json();
console.log(data);
```

### POST Request with JSON

```javascript
const response = await fetch('https://api.example.com/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    message: 'Hello, API!'
  })
});

const data = await response.json();
```

### Response Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `.json()` | Parse JSON | JavaScript object |
| `.text()` | Get as text | String |
| `.blob()` | Get as binary | Blob (for images, files) |
| `.ok` | Check if 200-299 | Boolean |
| `.status` | Get status code | Number |

---

## 3.3 Async/Await Deep Dive

### Why Async/Await?

APIs are **asynchronous** - they take time. You don't want to freeze your app while waiting.

**Old way (callbacks):**
```javascript
// ❌ Callback hell
fetchData(function(data) {
  processData(data, function(result) {
    saveData(result, function(saved) {
      console.log('Done!');
    });
  });
});
```

**Modern way (async/await):**
```javascript
// ✅ Clean and readable
const data = await fetchData();
const result = await processData(data);
const saved = await saveData(result);
console.log('Done!');
```

### The `async` Keyword

**Marks a function as asynchronous.**

```javascript
// Regular function
function getData() {
  return 'data';
}

// Async function (always returns a Promise)
async function getData() {
  return 'data';
}

// Usage
const data = await getData(); // ✅ Can use await
```

### The `await` Keyword

**Pauses execution until Promise resolves.**

```javascript
async function loadQuiz() {
  console.log('1. Starting...');

  const questions = await generateQuestions('Math'); // Waits here
  console.log('2. Got questions:', questions);

  const saved = await saveToDatabase(questions); // Then waits here
  console.log('3. Saved:', saved);

  console.log('4. Done!');
}
```

### Error Handling with Try/Catch

```javascript
async function safeAPICall() {
  try {
    const response = await fetch('https://api.example.com/data');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('API call failed:', error.message);
    // Show user-friendly error
    return null;
  }
}
```

### Running Operations in Parallel

```javascript
// ❌ Slow (runs sequentially)
const topics = await getTopics();    // 1 second
const sessions = await getSessions(); // 1 second
// Total: 2 seconds

// ✅ Fast (runs in parallel)
const [topics, sessions] = await Promise.all([
  getTopics(),    // Both start immediately
  getSessions()
]);
// Total: 1 second
```

---

## 3.4 Anthropic Claude API Basics

### API Endpoint

```
POST https://api.anthropic.com/v1/messages
```

### Required Headers

```javascript
{
  'x-api-key': 'sk-ant-YOUR_KEY_HERE',
  'anthropic-version': '2023-06-01',
  'content-type': 'application/json'
}
```

### Request Format

```javascript
{
  "model": "claude-sonnet-4-5",      // Which Claude model to use
  "max_tokens": 2048,                 // Max response length
  "messages": [                       // Conversation history
    {
      "role": "user",
      "content": "Your prompt here"
    }
  ]
}
```

### Available Models

| Model | Best For | Speed | Cost |
|-------|----------|-------|------|
| `claude-sonnet-4-5` | Balance | Medium | Medium |
| `claude-opus-4` | Complex tasks | Slower | Higher |
| `claude-haiku-4` | Simple tasks | Faster | Lower |

**For QuizMaster**: Use `claude-sonnet-4-5` (good balance of quality and speed).

### Response Format

```javascript
{
  "id": "msg_01ABC...",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "The actual response text here"
    }
  ],
  "model": "claude-sonnet-4-5",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 12,
    "output_tokens": 58
  }
}
```

---

## 3.5 Getting Your API Key

### Steps to Get an API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)
6. **Save it securely** - you can't view it again!

### API Key Security

**❌ NEVER do this:**
```javascript
// DON'T hardcode keys in your code
const API_KEY = 'sk-ant-abc123...'; // ❌ BAD!
```

**✅ DO this instead:**
```javascript
// Store in user's browser (localStorage or IndexedDB)
const API_KEY = await getSetting('apiKey');

// User provides their own key (BYOK - Bring Your Own Key)
```

### Testing Your API Key

```bash
# Test in terminal
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY_HERE" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 3.6 Building the API Module

### Creating `api.js`

```javascript
// api.js

const API_BASE_URL = 'https://api.anthropic.com/v1';
const API_VERSION = '2023-06-01';

/**
 * Make a request to Claude API
 */
async function callClaude(messages, options = {}) {
  // Get API key from settings
  const apiKey = await getSetting('apiKey');

  if (!apiKey) {
    throw new Error('No API key configured. Please add your Anthropic API key in Settings.');
  }

  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': API_VERSION,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: options.model || 'claude-sonnet-4-5',
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.7,
      messages: messages
    })
  });

  // Handle errors
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export { callClaude };
```

---

## 3.7 Prompt Engineering

### What is Prompt Engineering?

**The art of crafting effective prompts to get high-quality AI responses.**

Think of it like giving clear instructions to a very smart assistant.

### Principles of Good Prompts

1. **Be specific**: Tell Claude exactly what you want
2. **Provide context**: Explain the situation (grade level, subject, etc.)
3. **Define the format**: JSON? Paragraph? List?
4. **Set constraints**: Word limits, difficulty levels
5. **Give examples**: Show what good output looks like

### Example: Question Generation Prompt

**❌ Bad Prompt:**
```
Generate questions about photosynthesis.
```

**✅ Good Prompt:**
```
You are an expert educational content creator. Generate exactly 5 multiple-choice questions about Photosynthesis appropriate for High School students.

Requirements:
- Each question should have 4 answer options (A, B, C, D)
- Only one correct answer per question
- Include a mix of difficulty: 2 easy, 2 medium, 1 challenging
- Questions should test understanding, not just memorization
- Use clear, concise language
- Avoid ambiguous phrasing

Return your response as a JSON array with this exact structure:
[
  {
    "question": "What is the primary purpose of photosynthesis?",
    "options": [
      "A) To produce oxygen for animals",
      "B) To convert light energy into chemical energy",
      "C) To absorb carbon dioxide from the air",
      "D) To create chlorophyll in leaves"
    ],
    "correct": "B",
    "difficulty": "easy"
  }
]
```

### Creating `prompts.js`

```javascript
// prompts.js

/**
 * Generate question prompt
 */
export function createQuestionPrompt(topic, gradeLevel = 'middle school') {
  return `You are an expert educational content creator. Generate exactly 5 multiple-choice questions about "${topic}" appropriate for ${gradeLevel} students.

Requirements:
- Each question should have 4 answer options (A, B, C, D)
- Only one correct answer per question
- Include a mix of difficulty: 2 easy, 2 medium, 1 challenging
- Questions should test understanding, not just memorization
- Use clear, concise language appropriate for ${gradeLevel}
- Avoid ambiguous phrasing
- No trick questions

Return your response as a JSON array with this exact structure:
[
  {
    "question": "The question text here?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correct": "A",
    "difficulty": "easy"
  }
]

IMPORTANT: Return ONLY the JSON array, no other text before or after.`;
}

/**
 * Generate explanation prompt
 */
export function createExplanationPrompt(question, userAnswer, correctAnswer, gradeLevel = 'middle school') {
  return `You are a patient, encouraging tutor helping a ${gradeLevel} student who answered a question incorrectly.

Question: ${question}
Student's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Provide a brief, helpful explanation (under 150 words) that:
1. Explains why their answer was incorrect (1 sentence, not critical)
2. Clarifies the correct concept (2-3 sentences)
3. Includes a relatable analogy or real-world example
4. Ends with an encouraging note

Tone: Friendly, supportive, not condescending
Format: Plain text, no markdown headers`;
}
```

### Using the Prompts

```javascript
// api.js
import { createQuestionPrompt, createExplanationPrompt } from './prompts.js';
import { getSetting } from './db.js';

/**
 * Generate quiz questions
 */
export async function generateQuestions(topic, gradeLevel) {
  const prompt = createQuestionPrompt(topic, gradeLevel);

  try {
    const response = await callClaude([
      { role: 'user', content: prompt }
    ]);

    // Parse JSON response
    const questions = JSON.parse(response);

    // Validate structure
    if (!Array.isArray(questions) || questions.length !== 5) {
      throw new Error('Invalid response format from API');
    }

    return questions;

  } catch (error) {
    console.error('Question generation failed:', error);
    throw new Error('Failed to generate questions. Please try again.');
  }
}

/**
 * Generate explanation for incorrect answer
 */
export async function generateExplanation(question, userAnswer, correctAnswer, gradeLevel) {
  const prompt = createExplanationPrompt(question, userAnswer, correctAnswer, gradeLevel);

  try {
    const response = await callClaude([
      { role: 'user', content: prompt }
    ]);

    return response;

  } catch (error) {
    console.error('Explanation generation failed:', error);
    return 'Sorry, we couldn\'t generate an explanation at this time.';
  }
}
```

---

## 3.8 Error Handling & Retry Logic

### Common API Errors

```javascript
async function callClaudeWithRetry(messages, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': await getSetting('apiKey'),
          'anthropic-version': API_VERSION,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 2048,
          messages: messages
        })
      });

      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = parseInt(response.headers.get('retry-after') || '2');
        console.log(`Rate limited. Retrying in ${retryAfter}s...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your settings.');
      }

      if (response.status >= 500) {
        // Server error - retry
        console.log(`Server error (${response.status}). Retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const data = await response.json();
      return data.content[0].text;

    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt + 1} failed:`, error.message);

      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
```

---

## 3.9 Testing the API Module

### In the Browser Console

```javascript
// 1. First, save your API key
import { saveSetting } from './js/db.js';
await saveSetting('apiKey', 'sk-ant-YOUR_KEY_HERE');

// 2. Test question generation
import { generateQuestions } from './js/api.js';

const questions = await generateQuestions('Fractions', '5th Grade');
console.log(questions);

// Expected output:
// [
//   {
//     question: "What does the numerator represent?",
//     options: ["A) Top number", "B) Bottom number", ...],
//     correct: "A",
//     difficulty: "easy"
//   },
//   // ... 4 more
// ]

// 3. Test explanation generation
import { generateExplanation } from './js/api.js';

const explanation = await generateExplanation(
  "What is 1/2 + 1/4?",
  "C) 2/6",
  "B) 3/4",
  "5th Grade"
);
console.log(explanation);
```

---

## Checkpoint Questions

**Q1**: Why do we need async/await when calling APIs?

<details>
<summary>Answer</summary>

Because API calls take time (network latency). Without async/await, we'd either block the entire app (freezing the UI) or deal with messy callbacks. Async/await lets us write asynchronous code that looks synchronous, making it much easier to read and maintain.
</details>

**Q2**: What happens if we call `await fetch()` but forget the `try/catch`?

<details>
<summary>Answer</summary>

If the network request fails or the API returns an error, it will throw an unhandled error and crash that part of your app. Always wrap API calls in try/catch to handle errors gracefully and show user-friendly messages.
</details>

**Q3**: Why do we ask Claude to return JSON for questions but plain text for explanations?

<details>
<summary>Answer</summary>

- **Questions**: Need structured data (question text, 4 options, correct answer) that we can programmatically display and validate. JSON is perfect for this.
- **Explanations**: Free-form text that we display as-is. Plain text is simpler and more natural.
</details>

**Q4**: Where should the API key be stored, and why?

<details>
<summary>Answer</summary>

In IndexedDB or localStorage (we chose IndexedDB via `settings` store). This keeps it:
- On the user's device (never sent anywhere except Anthropic)
- Persistent across sessions
- Easy to update from settings screen
- **Never hardcoded in source code**
</details>

---

## Hands-On Exercise

### Build Your API Module

**Task**: Create the complete API integration for QuizMaster.

**Files to create:**
1. `js/api.js` - API client functions
2. `js/prompts.js` - Prompt templates

**Functions to implement:**
- `callClaude()` - Base API call with error handling
- `generateQuestions()` - Question generation
- `generateExplanation()` - Explanation generation

**Success Criteria**:
- ✅ Can call Claude API successfully
- ✅ Questions are returned in correct JSON format
- ✅ Explanations are clear and encouraging
- ✅ Errors are handled gracefully
- ✅ Rate limiting is handled with retry

---

## Next Steps

Once you've built and tested your API module:

**"I'm ready for Phase 4"** → We'll organize code using ES6 modules

**Need help?** → Ask Claude about any API concepts

---

## Learning Notes

**Date Started**: ___________

**API Key Obtained**: [ ] Yes [ ] No

**Code I Wrote**:
- [ ] api.js module
- [ ] prompts.js module
- [ ] Tested question generation
- [ ] Tested explanation generation

**Challenges Faced**:
-
-

**Date Completed**: ___________
