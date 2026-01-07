# Phase 1: Review & Understand

**Status:** Not Started
**Goal:** Walk through the existing telemetry infrastructure and understand the end-to-end data flow.

---

## Overview

Phase 40 (Epic 4) implemented a complete telemetry pipeline:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │ --> │  VPS PHP    │ --> │  Download   │ --> │  Grafana    │
│  Telemetry  │     │  Endpoint   │     │  + Import   │     │  + Loki     │
│  Client     │     │  (ingest)   │     │  Scripts    │     │  (view)     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

This phase reviews each component in detail.

---

## 1.1 Frontend Telemetry Client

### File Location
`src/utils/telemetry.js`

### How It Works

The `TelemetryClient` class:
1. **Batches events** in memory (default batch size: 10)
2. **Flushes automatically** on timer (default: 30 seconds) or when batch is full
3. **Saves to localStorage** if offline (key: `saberloop_telemetry_queue`)
4. **Restores queue** on next page load
5. **Flushes on page unload** (`beforeunload`, `visibilitychange`)

### Key Methods

| Method | Purpose |
|--------|---------|
| `track(type, data)` | Add event to queue |
| `flush()` | Send queued events to VPS |
| `isEnabled()` | Check if telemetry is active |
| `getQueueSize()` | Current queue length |
| `clearQueue()` | Clear queue (for testing) |

### Event Structure

Every event includes:

```javascript
{
  type: 'metric' | 'vital' | 'event' | 'error',
  data: { /* event-specific data */ },
  timestamp: '2025-12-26T10:16:03.046Z',  // ISO 8601
  sessionId: '1766744160751-qg4abun',      // Unique per page load
  url: 'https://saberloop.com/app/#/quiz', // Current page
  userAgent: 'Mozilla/5.0...'              // Browser info
}
```

### Event Types Observed in Production

| Type | Description | Example Data |
|------|-------------|--------------|
| `metric` | Performance metrics | `{ name: 'LCP', value: 172, rating: 'good' }` |
| `vital` | Web Vitals (duplicate of metric) | `{ name: 'CLS', value: '0.002', rating: 'good' }` |
| `event` | User actions | `{ action: 'explanation_opened', topic: '...', questionIndex: 0 }` |
| `error` | Errors caught | `{ message: 'Failed to fetch quiz', context: { error: '...' } }` |

### Web Vitals Tracked

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤2500ms | ≤4000ms | >4000ms |
| **INP** (Interaction to Next Paint) | ≤200ms | ≤500ms | >500ms |
| **CLS** (Cumulative Layout Shift) | ≤0.1 | ≤0.25 | >0.25 |

### Quiz Generation Metrics

```javascript
{
  type: 'metric',
  data: {
    name: 'quiz_generation',
    value: 50483,           // Duration in ms
    status: 'success',      // or 'error'
    topic: 'Famous Scientists',
    error: 'Failed to fetch' // Only on error
  }
}
```

### Feature Flag Control

**File:** `src/core/features.js`

```javascript
TELEMETRY: {
  phase: 'ENABLED',  // Currently active
  description: 'Send telemetry (logs, errors, metrics) to VPS for debugging'
}
```

Telemetry is **only sent** when:
1. Feature flag `TELEMETRY` is `ENABLED`
2. Environment variable `VITE_TELEMETRY_ENABLED=true`

### Environment Variables

**File:** `.env` (from `.env.example`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_TELEMETRY_ENABLED` | `false` | Master on/off switch |
| `VITE_TELEMETRY_ENDPOINT` | `https://saberloop.com/telemetry/ingest.php` | VPS endpoint URL |
| `VITE_TELEMETRY_TOKEN` | (secret) | Auth token for endpoint |
| `VITE_TELEMETRY_BATCH_SIZE` | `10` | Events before auto-flush |
| `VITE_TELEMETRY_FLUSH_INTERVAL` | `30000` | Max time (ms) between flushes |

### Related Files

| File | Purpose |
|------|---------|
| `src/utils/telemetry.js` | Main client implementation |
| `src/utils/telemetry.test.js` | Unit tests |
| `src/core/features.js` | Feature flag definition |
| `.env.example` | Environment variable template |

---

## 1.2 VPS Ingest Endpoint

### Location
`https://saberloop.com/telemetry/ingest.php`

### Directory Structure on VPS

```
/var/www/saberloop.com/
├── app/                        # Main Saberloop app
└── telemetry/
    ├── ingest.php              # Receives POST requests
    ├── config.php              # Token and storage path
    ├── .htaccess               # Security rules
    └── rotate-logs.php         # Cron job for cleanup

/telemetry/logs/                # Storage (outside web root)
├── telemetry-2025-12-23.jsonl
├── telemetry-2025-12-24.jsonl
├── telemetry-2025-12-25.jsonl
└── telemetry-2025-12-26.jsonl
```

### How ingest.php Works

1. **Validates** `X-Telemetry-Token` header against stored token
2. **Parses** JSON body from POST request
3. **Appends** each event to daily `.jsonl` file
4. **Adds** server metadata (`_server` object):
   - `receivedAt`: Server timestamp
   - `batchSentAt`: Client batch timestamp (copied from request)

**Note:** `clientIp` logging was commented out for privacy reasons.

### Security Measures

- **Token auth**: Requests without valid token get 401
- **CORS**: Only allows `https://saberloop.com` origin
- **.htaccess**: Blocks direct access to storage files
- **Outside web root**: JSONL files stored in `/telemetry/logs/` not `/var/www/`

### Log Rotation

- **Cron job**: `rotate-logs.php` runs daily
- **Retention**: 30 days
- **Action**: Deletes `.jsonl` files older than cutoff

### File Naming Convention

```
telemetry-YYYY-MM-DD.jsonl
```

Example: `telemetry-2025-12-26.jsonl`

---

## 1.3 Local Analysis Stack

### Docker Compose File
`docker-compose.telemetry.yml`

### Containers (created on first run)

| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| `saberloop-loki` | `grafana/loki:2.9.0` | 3100 | Log aggregation |
| `saberloop-grafana` | `grafana/grafana:10.2.0` | 3000 | Visualization |

**Note:** These containers are created when you first run `npm run telemetry:start`. The configuration files exist, but the containers won't appear in Docker Desktop until you run the command.

### Configuration Files

| File | Purpose |
|------|---------|
| `docker/loki-config.yml` | Loki server configuration |
| `docker/grafana-datasources.yml` | Pre-configured Loki datasource |

### Loki Configuration Highlights

```yaml
# From docker/loki-config.yml
auth_enabled: false              # No auth needed locally
http_listen_port: 3100           # API port
reject_old_samples_max_age: 168h # Accept logs up to 7 days old
ingestion_rate_mb: 10            # Max ingestion rate
```

### Grafana Configuration

```yaml
# From docker/grafana-datasources.yml
datasources:
  - name: Loki
    type: loki
    url: http://loki:3100        # Internal Docker network
    isDefault: true
```

### Default Credentials

- **URL**: http://localhost:3000
- **Username**: `admin`
- **Password**: `admin`

### Volume Mounts

| Volume | Purpose |
|--------|---------|
| `loki-data` | Persisted log data |
| `grafana-data` | Dashboards, settings |

### Starting/Stopping the Stack

```powershell
# Start
docker-compose -f docker-compose.telemetry.yml up -d

# Check status
docker ps

# Stop (keep data)
docker-compose -f docker-compose.telemetry.yml down

# Stop and delete data
docker-compose -f docker-compose.telemetry.yml down -v
```

---

## 1.4 Scripts

### Download Script

**File:** `scripts/telemetry/download.ps1`

**Purpose:** Download `.jsonl` files from VPS to local machine

**Parameters:**
| Parameter | Default | Description |
|-----------|---------|-------------|
| `-Days` | 7 | Number of days to download |
| `-OutputDir` | `.\telemetry-logs` | Local destination |

**Required Environment Variables:**
| Variable | Purpose |
|----------|---------|
| `FTP_HOST` | VPS hostname |
| `FTP_USER` | FTP username |
| `FTP_PASSWORD` | FTP password |

**How It Works:**
1. Loads credentials from `.env` file
2. Connects via FTP (WinSCP if available)
3. Downloads files from `/telemetry/logs/`
4. Saves to `.\telemetry-logs\`

**If WinSCP Not Installed:**
Script provides instructions for:
- Installing WinSCP: `winget install WinSCP.WinSCP`
- Using FileZilla manually
- Using curl (if HTTPS access available)

### Import Script

**File:** `scripts/telemetry/import-to-loki.ps1`

**Purpose:** Push downloaded logs into local Loki instance

**Parameters:**
| Parameter | Default | Description |
|-----------|---------|-------------|
| `-InputDir` | `.\telemetry-logs` | Directory with `.jsonl` files |
| `-LokiUrl` | `http://localhost:3100` | Loki API URL |

**How It Works:**
1. Checks if Loki is running (`/ready` endpoint)
2. Reads each `.jsonl` file line by line
3. Parses JSON and extracts timestamp
4. Batches events (100 at a time)
5. Pushes to Loki via `/loki/api/v1/push`

**Labels Applied:**
```javascript
{
  app: 'saberloop',
  type: event.type,        // 'metric', 'error', 'event', 'vital'
  sessionId: event.sessionId
}
```

**These labels enable Grafana queries like:**
- `{app="saberloop"}` - All events
- `{app="saberloop", type="error"}` - Errors only
- `{app="saberloop", sessionId="1766744160751-qg4abun"}` - Single session

---

## 1.5 Real Data Examples

### Web Vital (LCP - Good)
```json
{
  "type": "metric",
  "data": {"name": "LCP", "value": 172, "rating": "good"},
  "timestamp": "2025-12-25T11:30:28.226Z",
  "sessionId": "1766662225242-pwrqhrr",
  "url": "https://saberloop.com/app/#/quiz",
  "userAgent": "Mozilla/5.0 (Linux; Android 10; K)...",
  "_server": {
    "receivedAt": "2025-12-25T11:30:55+00:00",
    "batchSentAt": "2025-12-25T11:30:55.251Z"
  }
}
```

### Quiz Generation (Success)
```json
{
  "type": "metric",
  "data": {
    "name": "quiz_generation",
    "value": 50483,
    "status": "success",
    "topic": "Historia do avatar 1 e 2"
  },
  "timestamp": "2025-12-26T14:04:45.499Z",
  "sessionId": "1766756274200-2isv7ry",
  "url": "https://saberloop.com/app/#/loading"
}
```

### Error Event
```json
{
  "type": "error",
  "data": {
    "message": "Failed to fetch explanation",
    "context": {"error": "No API key available"}
  },
  "timestamp": "2025-12-26T11:32:54.650Z",
  "sessionId": "1766748554539-1cctrhq",
  "url": "http://localhost:8888/#/results"
}
```

### User Action Event
```json
{
  "type": "event",
  "data": {
    "action": "explanation_opened",
    "topic": "Famous Scientists",
    "questionIndex": 0,
    "gradeLevel": "high school"
  },
  "timestamp": "2025-12-26T11:44:57.138Z",
  "sessionId": "1766749461842-9e7kqas",
  "url": "https://saberloop.com/app/#/results"
}
```

---

## 1.6 Data Flow Summary

```
1. USER ACTION in browser
         ↓
2. telemetry.track('event', {...}) called
         ↓
3. Event added to in-memory queue
         ↓
4. When batch full OR timer fires OR page unload:
         ↓
5. POST to https://saberloop.com/telemetry/ingest.php
   - Header: X-Telemetry-Token: <token>
   - Body: { events: [...], sentAt: '...' }
         ↓
6. VPS appends each event to /telemetry/logs/telemetry-YYYY-MM-DD.jsonl
         ↓
7. LATER: Run download.ps1 to fetch files via FTP
         ↓
8. LATER: Run import-to-loki.ps1 to push to local Loki
         ↓
9. VIEW: Open Grafana → Explore → Query Loki
```

---

## Completion Checklist

- [ ] Read `src/utils/telemetry.js` and understand batching logic
- [ ] Understand the 4 event types: metric, vital, event, error
- [ ] Know the environment variables and their purpose
- [ ] Understand VPS storage structure (`/telemetry/logs/`)
- [ ] Know how to start/stop Docker stack
- [ ] Understand labels used for Loki queries
- [ ] Can explain the complete data flow from browser to Grafana

---

## Questions to Verify Understanding

1. What happens if a user is offline when events are tracked?
2. How often does the client send events to the VPS (two conditions)?
3. What security measures protect the telemetry endpoint?
4. What labels can you use to filter logs in Grafana?
5. How long are logs retained on the VPS?
