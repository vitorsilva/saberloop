# API Design

## Overview

Saberloop uses serverless functions (Netlify Functions) to proxy requests to the Anthropic Claude API. This keeps API keys secure on the server side.

## Base URL

| Environment | Base URL |
|-------------|----------|
| Production | `https://your-site.netlify.app/.netlify/functions` |
| Development | `http://localhost:8888/.netlify/functions` |

## Endpoints

### POST `/generate-questions`

Generate quiz questions for a given topic.

**Request:**
```http
POST /.netlify/functions/generate-questions
Content-Type: application/json

{
  "topic": "The Solar System",
  "gradeLevel": "middle school"
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | string | Yes | Quiz topic (2-200 characters) |
| `gradeLevel` | string | No | Target audience level (default: "middle school") |

**Response (Success - 200):**
```json
{
  "language": "EN-US",
  "questions": [
    {
      "question": "Which planet is known as the Red Planet?",
      "options": [
        "A) Venus",
        "B) Mars",
        "C) Jupiter",
        "D) Saturn"
      ],
      "correct": 1,
      "difficulty": "easy"
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `language` | string | Detected language code (e.g., "EN-US", "PT-PT") |
| `questions` | array | Array of 5 question objects |
| `questions[].question` | string | Question text |
| `questions[].options` | array | 4 answer options prefixed with A), B), C), D) |
| `questions[].correct` | number | Index of correct answer (0-3) |
| `questions[].difficulty` | string | "easy", "medium", or "hard" |

**Error Responses:**

| Status | Description |
|--------|-------------|
| 400 | Invalid request (missing topic, invalid JSON) |
| 405 | Method not allowed (use POST) |
| 500 | Server error (API key missing, Claude API error) |

---

### POST `/generate-explanation`

Generate an explanation for why an answer was incorrect.

**Request:**
```http
POST /.netlify/functions/generate-explanation
Content-Type: application/json

{
  "question": "Which planet is closest to the Sun?",
  "userAnswer": "Venus",
  "correctAnswer": "Mercury",
  "topic": "The Solar System"
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | Yes | The question text |
| `userAnswer` | string | Yes | User's incorrect answer |
| `correctAnswer` | string | Yes | The correct answer |
| `topic` | string | No | Original topic for context |

**Response (Success - 200):**
```json
{
  "explanation": "Venus is actually the second planet from the Sun. Mercury is the closest planet to the Sun, orbiting at an average distance of about 58 million kilometers. While Venus is often called Earth's 'sister planet' due to its similar size, it's further from the Sun than Mercury."
}
```

**Error Responses:**

| Status | Description |
|--------|-------------|
| 400 | Invalid request (missing required fields) |
| 405 | Method not allowed (use POST) |
| 500 | Server error |

---

### GET `/health-check`

Check backend health and configuration status.

**Request:**
```http
GET /.netlify/functions/health-check
```

**Response (Success - 200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-10T10:30:00.000Z",
  "config": {
    "apiKeyConfigured": true,
    "environment": "production"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | "healthy" or "unhealthy" |
| `timestamp` | string | ISO timestamp of check |
| `config.apiKeyConfigured` | boolean | Whether API key is set |
| `config.environment` | string | Current environment |

---

## CORS Configuration

All endpoints include CORS headers:

```javascript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

Preflight requests (OPTIONS) are handled automatically.

---

## Error Format

All errors follow a consistent format:

```json
{
  "error": "Error description",
  "details": ["Specific error 1", "Specific error 2"],
  "message": "Additional context"
}
```

---

## Rate Limiting

Rate limiting is handled by:
1. **Anthropic API** - Has its own rate limits based on your plan
2. **Netlify Functions** - Free tier: 125K requests/month

---

## Frontend API Client

The frontend uses an abstraction layer to switch between mock and real APIs:

```javascript
// src/api/index.js
import { generateQuestions as realGenerate } from './api.real.js';
import { generateQuestions as mockGenerate } from './api.mock.js';

const useRealApi = import.meta.env.VITE_USE_REAL_API === 'true';

export const generateQuestions = useRealApi ? realGenerate : mockGenerate;
```

**Environment Variables:**

| Variable | Values | Description |
|----------|--------|-------------|
| `VITE_USE_REAL_API` | `true` / `false` | Use real API vs mock |

---

## OpenRouter Integration

For users with their own OpenRouter API keys, the frontend can call OpenRouter directly:

```javascript
// src/api/openrouter-client.js
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [{ role: 'user', content: prompt }]
  })
});
```

This bypasses the Netlify Functions when user has their own key configured.

---

## Related Documentation

- [System Overview](./SYSTEM_OVERVIEW.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment](./DEPLOYMENT.md)
