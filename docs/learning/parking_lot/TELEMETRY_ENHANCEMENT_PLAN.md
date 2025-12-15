# Telemetry Enhancement Plan: Self-Hosted Observability

**Created:** 2025-12-15
**Status:** Parking Lot / Under Consideration
**Goal:** Collect logs, traces, and metrics without paid services

---

## Executive Summary

Enhance Saberloop's observability by:
1. **Collecting** telemetry data from the browser (client-side only app)
2. **Shipping** to a lightweight endpoint on your VPS
3. **Storing** data in JSONL files on the VPS (persistent storage)
4. **Analyzing** by downloading to your local Docker stack when needed (on-demand)

**Total Cost:** $0 (uses existing VPS + local Docker)

---

## Key Constraints

| Constraint | Implication |
|------------|-------------|
| **No backend** | App is client-side only (OpenRouter calls from browser) |
| **Local PC not always on** | Docker containers (Prometheus, Jaeger, etc.) run on-demand |
| **Intermittent VPS↔PC connection** | Manual/periodic download, not real-time sync |
| **No real-time alerts needed** | Analysis is retrospective, not live monitoring |

**Architecture Philosophy:** Store everything on VPS, analyze locally when convenient.

---

## Current State Analysis

### What You Already Have

#### Frontend (Phase 4 - Complete)
| Component | Implementation | Output |
|-----------|----------------|--------|
| Structured Logging | `loglevel` wrapper with redaction | Browser console |
| Error Handling | Global error + rejection listeners | Browser console + UI banner |
| Performance | Web Vitals (LCP, INP, CLS) | Browser console |

**Limitation:** All telemetry goes to browser console and is lost on page refresh.

#### App Architecture
- **Client-side only** - No backend server
- **OpenRouter integration** - API calls made directly from browser
- **IndexedDB storage** - Quiz data stored locally in browser

#### Your Infrastructure

**VPS (LAMP):**
- Apache/PHP
- Always on (24/7)
- Already hosts: `saberloop.com/app/`, landing page, privacy policy
- Can store telemetry data persistently

**Local PC (Docker):**
| Container | Image | Port | Usage Pattern |
|-----------|-------|------|---------------|
| prometheus | prom/prometheus:latest | 9090 | On-demand |
| otel-collector | otel/opentelemetr | 4318/4319 | On-demand |
| jaeger | jaegertracing/all-in | 16686 | On-demand |

**Note:** These containers are NOT always running. They're started when you want to analyze data.

---

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER (Saberloop PWA)                       │
│                    [Client-side only app]                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Logger    │  │   Errors    │  │ Web Vitals  │              │
│  │  (loglevel) │  │  (handler)  │  │ (LCP,INP,CLS)│             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                          ▼                                       │
│              ┌───────────────────────┐                          │
│              │   Telemetry Batcher   │  NEW                     │
│              │   (batch + send)      │                          │
│              └───────────┬───────────┘                          │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │ HTTP POST (JSON)
                           │ https://saberloop.com/telemetry/ingest.php
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VPS (LAMP) - Always On                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   /telemetry/ingest.php                     ││
│  │  - Validate request (CORS, auth token)                      ││
│  │  - Parse JSON payload                                       ││
│  │  - Append to daily log files (JSONL format)                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Persistent Storage (30-day retention):                         │
│  /var/telemetry/saberloop/                                      │
│  ├── logs/                                                      │
│  │   ├── 2025-12-15.jsonl                                      │
│  │   ├── 2025-12-16.jsonl                                      │
│  │   └── ...                                                    │
│  ├── traces/                                                    │
│  │   └── 2025-12-15.jsonl                                      │
│  └── metrics/                                                   │
│      └── 2025-12-15.jsonl                                      │
│                                                                  │
│  Cron job: Auto-delete files older than 30 days                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Manual download (when you want to analyze)
                           │ rsync/scp/FTP - NOT always connected
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               LOCAL PC (Docker) - On-Demand Analysis             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Start containers when ready to analyze:                     │
│     docker-compose -f docker-compose.telemetry.yml up           │
│                                                                  │
│  2. Download data from VPS:                                     │
│     ./scripts/telemetry/download.sh                             │
│                                                                  │
│  3. Import into tools:                                          │
│     ./scripts/telemetry/import.sh                               │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Prometheus │  │   Jaeger    │  │    Loki     │              │
│  │  (metrics)  │  │  (traces)   │  │   (logs)    │              │
│  │  :9090      │  │   :16686    │  │   :3100     │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                       │
│              ┌───────────────────────┐                          │
│              │       Grafana         │                          │
│              │    (visualization)    │                          │
│              │       :3000           │                          │
│              └───────────────────────┘                          │
│                                                                  │
│  4. Analyze, then stop containers when done                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Workflow: How You'll Use This

### Daily/Weekly Routine

1. **App runs normally** - Telemetry batched and sent to VPS automatically
2. **VPS stores everything** - JSONL files accumulate (auto-rotated after 30 days)
3. **When you want to analyze:**
   ```bash
   # On your local PC

   # 1. Start the analysis stack
   docker-compose -f docker-compose.telemetry.yml up -d

   # 2. Download recent data from VPS
   ./scripts/telemetry/download.sh

   # 3. Import into Loki/Jaeger/Prometheus
   ./scripts/telemetry/import.sh

   # 4. Open Grafana at http://localhost:3000
   #    - View logs, traces, metrics
   #    - Create dashboards
   #    - Investigate issues

   # 5. When done, stop containers
   docker-compose -f docker-compose.telemetry.yml down
   ```

### Investigation Workflow

**"Why was the app slow yesterday?"**
1. Download yesterday's data
2. Import into local stack
3. Check Web Vitals metrics in Grafana
4. Look at traces to see which operations were slow
5. Review logs for errors

**"Are there any errors I should know about?"**
1. Download recent data
2. Filter logs by `level: ERROR`
3. Review error patterns in Grafana

---

## Implementation Phases

### Phase T1: Frontend Telemetry Batcher (2-3 hours)

**Goal:** Batch and send telemetry to VPS instead of just console.

**Files to create:**
- `src/utils/telemetry.js` - Main telemetry client

**Features:**
```javascript
// src/utils/telemetry.js
class TelemetryClient {
  constructor(endpoint, options = {}) {
    this.endpoint = endpoint;
    this.batchSize = options.batchSize || 10;
    this.flushInterval = options.flushInterval || 30000; // 30s
    this.buffer = { logs: [], traces: [], metrics: [] };
    this.sessionId = this.generateSessionId();
  }

  // Called by logger
  log(level, message, context) {
    this.buffer.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    });
    this.maybeFlush();
  }

  // Called by performance.js
  metric(name, value, labels = {}) {
    this.buffer.metrics.push({
      timestamp: new Date().toISOString(),
      name,
      value,
      labels,
      sessionId: this.sessionId
    });
    this.maybeFlush();
  }

  // Called for operation timing
  trace(name, duration, attributes = {}) {
    this.buffer.traces.push({
      timestamp: new Date().toISOString(),
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      name,
      duration,
      attributes,
      sessionId: this.sessionId
    });
    this.maybeFlush();
  }

  async flush() {
    if (this.isEmpty()) return;

    const payload = { ...this.buffer };
    this.buffer = { logs: [], traces: [], metrics: [] };

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telemetry-Token': this.token
        },
        body: JSON.stringify(payload),
        keepalive: true // Send even on page unload
      });
    } catch (err) {
      // Silently fail - telemetry shouldn't break the app
      console.warn('[Telemetry] Failed to send:', err.message);
    }
  }
}
```

**Integration points:**
1. `logger.js` → calls `telemetry.log()`
2. `performance.js` → calls `telemetry.metric()`
3. `openrouter-client.js` → calls `telemetry.trace()` for API timing

**Configuration:**
```javascript
// src/config/telemetry.js
export const TELEMETRY_CONFIG = {
  enabled: import.meta.env.PROD, // Only in production
  endpoint: 'https://saberloop.com/telemetry/ingest.php',
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  token: 'your-secret-token'
};
```

---

### Phase T2: VPS Ingest Endpoint (2-3 hours)

**Goal:** PHP endpoint to receive and store telemetry.

**Files to create on VPS:**
```
/var/www/saberloop.com/telemetry/
├── ingest.php          # Main endpoint
├── .htaccess           # Security + CORS
├── config.php          # Configuration
└── rotate-logs.php     # Cron job for rotation
```

**ingest.php:**
```php
<?php
// telemetry/ingest.php

require_once 'config.php';

// CORS headers
header('Access-Control-Allow-Origin: https://saberloop.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Telemetry-Token');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Validate method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Validate token (simple auth)
$token = $_SERVER['HTTP_X_TELEMETRY_TOKEN'] ?? '';
if ($token !== TELEMETRY_TOKEN) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Parse JSON body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Get today's date for file naming
$date = date('Y-m-d');
$baseDir = TELEMETRY_STORAGE_PATH;

// Ensure directories exist
foreach (['logs', 'traces', 'metrics'] as $type) {
    $dir = "$baseDir/$type";
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Append logs (JSONL format - one JSON object per line)
if (!empty($data['logs'])) {
    $file = "$baseDir/logs/$date.jsonl";
    foreach ($data['logs'] as $log) {
        $log['received_at'] = date('c');
        file_put_contents($file, json_encode($log) . "\n", FILE_APPEND | LOCK_EX);
    }
}

// Append traces
if (!empty($data['traces'])) {
    $file = "$baseDir/traces/$date.jsonl";
    foreach ($data['traces'] as $trace) {
        $trace['received_at'] = date('c');
        file_put_contents($file, json_encode($trace) . "\n", FILE_APPEND | LOCK_EX);
    }
}

// Append metrics
if (!empty($data['metrics'])) {
    $file = "$baseDir/metrics/$date.jsonl";
    foreach ($data['metrics'] as $metric) {
        $metric['received_at'] = date('c');
        file_put_contents($file, json_encode($metric) . "\n", FILE_APPEND | LOCK_EX);
    }
}

// Success response
echo json_encode([
    'status' => 'ok',
    'received' => [
        'logs' => count($data['logs'] ?? []),
        'traces' => count($data['traces'] ?? []),
        'metrics' => count($data['metrics'] ?? [])
    ]
]);
```

**config.php:**
```php
<?php
define('TELEMETRY_TOKEN', 'your-secret-token-here'); // Change this!
define('TELEMETRY_STORAGE_PATH', '/var/telemetry/saberloop');
```

**rotate-logs.php (cron job - run daily):**
```php
<?php
// Cron: 0 0 * * * php /var/www/saberloop.com/telemetry/rotate-logs.php

require_once 'config.php';

$baseDir = TELEMETRY_STORAGE_PATH;
$retentionDays = 30;
$cutoffDate = date('Y-m-d', strtotime("-$retentionDays days"));

foreach (['logs', 'traces', 'metrics'] as $type) {
    $dir = "$baseDir/$type";
    foreach (glob("$dir/*.jsonl") as $file) {
        $fileDate = basename($file, '.jsonl');
        if ($fileDate < $cutoffDate) {
            unlink($file);
            echo "Deleted: $file\n";
        }
    }
}
```

---

### Phase T3: Local Analysis Stack (2-3 hours)

**Goal:** Docker Compose for local analysis (started on-demand).

**docker-compose.telemetry.yml:**
```yaml
version: '3.8'

services:
  # Log aggregation
  loki:
    image: grafana/loki:2.9.0
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml

  # Visualization dashboard
  grafana:
    image: grafana/grafana:10.0.0
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - loki
      - prometheus

  # Metrics (you already have this container)
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus

  # Traces (you already have this container)
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true

volumes:
  loki-data:
  grafana-data:
  prometheus-data:
```

---

### Phase T4: Import Scripts (1-2 hours)

**Goal:** Scripts to download from VPS and import into local stack.

**scripts/telemetry/download.sh:**
```bash
#!/bin/bash
# Download telemetry data from VPS

VPS_HOST="saberloop.com"
VPS_USER="your-ftp-user"
VPS_PATH="/var/telemetry/saberloop"
LOCAL_PATH="./telemetry-data"

mkdir -p "$LOCAL_PATH"/{logs,traces,metrics}

# Download using rsync (or scp/sftp)
rsync -avz --progress \
  "$VPS_USER@$VPS_HOST:$VPS_PATH/" \
  "$LOCAL_PATH/"

echo "Download complete! Data in $LOCAL_PATH"
```

**scripts/telemetry/import.sh:**
```bash
#!/bin/bash
# Import downloaded data into local analysis stack

echo "Importing logs to Loki..."
# (Loki import script here)

echo "Importing traces to Jaeger..."
# (Jaeger import script here)

echo "Import complete! Open Grafana at http://localhost:3000"
```

---

## Data Formats

### Log Entry (JSONL)
```json
{
  "timestamp": "2025-12-15T10:30:45.123Z",
  "level": "INFO",
  "message": "Quiz started",
  "context": { "topic": "Math", "questionCount": 5 },
  "sessionId": "abc123",
  "url": "https://saberloop.com/app/#/quiz",
  "userAgent": "Mozilla/5.0...",
  "received_at": "2025-12-15T10:30:45.500Z"
}
```

### Trace Entry (JSONL)
```json
{
  "timestamp": "2025-12-15T10:30:45.123Z",
  "traceId": "abc123def456",
  "spanId": "span789",
  "name": "openrouter.generateQuestions",
  "duration": 2450,
  "attributes": { "topic": "Math", "model": "claude-3-haiku" },
  "sessionId": "abc123",
  "received_at": "2025-12-15T10:30:47.600Z"
}
```

### Metric Entry (JSONL)
```json
{
  "timestamp": "2025-12-15T10:30:45.123Z",
  "name": "web_vital_lcp",
  "value": 1250,
  "labels": { "rating": "good", "page": "quiz" },
  "sessionId": "abc123",
  "received_at": "2025-12-15T10:30:45.200Z"
}
```

---

## Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| VPS Storage | Included | Uses existing VPS |
| PHP Endpoint | Included | Simple PHP script |
| Local Docker | Free | Run on-demand |
| Grafana/Loki/Jaeger | Free | OSS editions |
| **Total** | **$0** | |

---

## Security Considerations

1. **Token Authentication** - Simple bearer token in header
2. **CORS Restriction** - Only allow `saberloop.com` origin
3. **Data Sensitivity** - Logger already redacts API keys, tokens, passwords
4. **Storage Security** - JSONL files not web-accessible (.htaccess)

---

## Implementation Order

| Phase | Description | Effort | Priority |
|-------|-------------|--------|----------|
| T1 | Frontend Telemetry Batcher | 2-3h | High |
| T2 | VPS Ingest Endpoint | 2-3h | High |
| T3 | Local Analysis Stack | 2-3h | Medium |
| T4 | Import Scripts | 1-2h | Medium |

**Recommended order:** T1 → T2 → T3 → T4

---

## Why This Approach?

### Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| OTEL Collector on VPS | Standard format | Complex, resource overhead | Overkill |
| Direct Browser → Local PC | No VPS | PC must be always on | Not practical |
| Paid Service (Sentry) | Zero maintenance | Monthly cost | User wants to avoid |
| **JSONL on VPS + local analysis** | **Simple, free, flexible** | **Manual download** | **Chosen** |

### Key Benefits

1. **VPS is always on** - Never lose telemetry data
2. **Local analysis on-demand** - No need for PC to always run containers
3. **JSONL is simple** - Easy to inspect, grep, process
4. **Retrospective analysis** - Review when you have time
5. **$0 cost** - Uses existing infrastructure

---

## Success Criteria

- [ ] Frontend sends telemetry batches to VPS
- [ ] VPS stores logs/traces/metrics in JSONL files
- [ ] Can download data to local machine
- [ ] Can view logs in Grafana/Loki
- [ ] Can view traces in Jaeger
- [ ] Can view metrics in Prometheus/Grafana
- [ ] No additional monthly costs
- [ ] Sensitive data still redacted

---

## When to Implement

**Consider implementing when:**
- You have real users and want to understand their experience
- You need to debug production issues
- You want to track performance over time
- You're preparing for a larger launch

**Not urgent because:**
- Current console logging works for development
- Phase 4 observability is functional
- Play Store launch is the current priority

---

## References

- [Grafana Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Jaeger Getting Started](https://www.jaegertracing.io/docs/getting-started/)
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [JSONL Format](https://jsonlines.org/)
