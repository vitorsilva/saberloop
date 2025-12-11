# System Architecture Overview

## High-Level Architecture

Saberloop (QuizMaster) follows a serverless full-stack architecture:

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
│           │                                                  │
│  ┌────────▼─────────────────────────────────┐               │
│  │              Views                        │               │
│  │  Home │ Quiz │ Results │ Settings │ Help │               │
│  └────────┬─────────────────────────────────┘               │
│           │                                                  │
│  ┌────────▼─────────────────────────────────┐               │
│  │           API Client Layer               │               │
│  │     (Mock API / Real API / OpenRouter)   │               │
│  └────────┬─────────────────────────────────┘               │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │ HTTPS
            │
┌───────────▼──────────────────────────────────────────────────┐
│                    Netlify Functions                          │
│                    (Serverless Backend)                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │ generate-       │  │ generate-       │  │ health-      │  │
│  │ questions       │  │ explanation     │  │ check        │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────────┘  │
│           │                    │                              │
└───────────┼────────────────────┼──────────────────────────────┘
            │                    │
            ▼                    ▼
┌───────────────────────────────────────────────────────────────┐
│                    AI Provider                                 │
│           (Anthropic Claude / OpenRouter)                      │
└───────────────────────────────────────────────────────────────┘
```

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

### Backend

| Component | Technology | Purpose |
|-----------|------------|---------|
| Platform | Netlify Functions | Serverless compute |
| Runtime | Node.js 18 | JavaScript execution |
| AI Provider | Anthropic Claude API / OpenRouter | Question generation |

**Functions:**
- `generate-questions` - Generate quiz questions for a topic
- `generate-explanation` - Generate explanation for wrong answers
- `health-check` - Backend health and configuration status

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
│ API Client   │ ──── POST /generate-questions
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Netlify Fn   │ ──── Call Claude API
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Claude API   │ ──── Generate questions JSON
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

- API keys stored server-side only (Netlify environment variables)
- Frontend never sees the actual API key
- OpenRouter user keys stored in browser localStorage (user's responsibility)

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
