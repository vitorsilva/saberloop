# System Architecture Overview

## High-Level Architecture

Saberloop is a **client-side PWA** with no backend required. AI calls are made directly from the browser using OpenRouter (user-provided API keys).

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                        (Frontend)                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │   SPA Router     │    │   IndexedDB      │               │
│  │   (Hash-based)   │    │   (Persistence)  │               │
│  └────────┬─────────┘    └──────────────────┘               │
│           │                      │                           │
│  ┌────────▼─────────────────────────────────┐               │
│  │              Views                        │               │
│  │  Home │ Quiz │ Results │ Settings │ ...  │               │
│  └────────┬─────────────────────────────────┘               │
│           │                                                  │
│  ┌────────▼─────────────────────────────────┐               │
│  │           API Client Layer               │               │
│  │     (Mock API / OpenRouter Client)       │               │
│  └────────┬─────────────────────────────────┘               │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │ HTTPS (direct from browser)
            │
            ▼
┌───────────────────────────────────────────────────────────────┐
│                       OpenRouter API                          │
│              (User-provided API key in browser)               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Supported Models:                                            │
│  - Claude (Anthropic)                                         │
│  - GPT-4 (OpenAI)                                             │
│  - Gemini (Google)                                            │
│  - Llama, Mistral, and more                                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Note:** No server-side backend is required. The app is fully static and can be hosted on any web server.

## Components

### Frontend

| Component | Technology | Purpose |
|-----------|------------|---------|
| Build Tool | Vite | Fast development, optimized builds |
| Language | Vanilla JavaScript (ES6+) | No framework overhead |
| Routing | Hash-based SPA router | Client-side navigation |
| State | In-memory + IndexedDB | Persistence across sessions |
| Styling | Tailwind CSS (PostCSS) | Utility-first CSS |
| PWA | Vite PWA Plugin + Workbox | Offline support, installability |

### AI Integration (Client-Side)

| Component | Technology | Purpose |
|-----------|------------|---------|
| API Gateway | OpenRouter | Multi-model AI access |
| Key Storage | IndexedDB | Secure local storage |
| Default Model | Claude 3 Haiku | Fast, cost-effective |

**Client-Side Functions:**
- `generateQuestions()` - Call OpenRouter to generate quiz questions
- `generateExplanation()` - Call OpenRouter for wrong answer explanations

**No Server Backend Required:**
- Users provide their own OpenRouter API key
- API calls made directly from browser to OpenRouter
- Keys stored securely in browser's IndexedDB

### Data Layer

| Component | Technology | Purpose |
|-----------|------------|---------|
| Client Storage | IndexedDB | Quiz sessions, questions, settings |
| Library | idb | Promise-based IndexedDB wrapper |

## Data Flow

### Quiz Generation Flow

```
User enters topic
       │
       ▼
┌──────────────┐
│ TopicView    │ ──── User input validation
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ API Client   │ ──── Call OpenRouter from browser
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ OpenRouter   │ ──── Route to Claude/GPT/etc.
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ AI Model     │ ──── Generate questions JSON
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ IndexedDB    │ ──── Store session + questions
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ QuizView     │ ──── Display first question
└──────────────┘
```

### Offline Strategy

1. **Static Assets** - Precached by service worker during install
2. **API Responses** - Network-first with stale-while-revalidate fallback
3. **Quiz Data** - Stored in IndexedDB, available offline
4. **Graceful Degradation** - Sample quizzes available when offline

## Security

### API Key Management

- User authenticates via OpenRouter OAuth
- API key stored securely in browser's IndexedDB
- Keys never sent to our servers - calls go directly to OpenRouter
- User controls their own API usage and billing

### Input Validation

- Topic input sanitized before API calls
- Grade level validated against allowed values
- Question count limited to reasonable range

## Performance

### Optimizations

- **Code Splitting** - Vite handles automatic chunking
- **Asset Caching** - Service worker caches with version hashing
- **Lazy Loading** - Views loaded on demand
- **Core Web Vitals** - Monitored via web-vitals library

### Metrics Tracked

- LCP (Largest Contentful Paint)
- INP (Interaction to Next Paint)
- CLS (Cumulative Layout Shift)

## Related Documentation

- [Database Schema](./DATABASE_SCHEMA.md)
- [API Design](./API_DESIGN.md)
- [Deployment](./DEPLOYMENT.md)
