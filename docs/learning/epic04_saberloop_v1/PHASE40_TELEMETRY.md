# Phase 40: Telemetry Enhancement - Revised Plan

**Created:** 2025-12-22
**Status:** Ready to Implement
**Original Plan:** `PHASE40_TELEMETRY.md`

---

## Overview

Enhance Saberloop's observability to understand user difficulties by:
1. Collecting telemetry (logs, errors, metrics) in the browser
2. Sending to a PHP endpoint on VPS
3. Storing as JSONL files with 30-day retention
4. Analyzing locally with Docker tools when needed

**Cost:** $0 (uses existing VPS + local Docker)

**Existing Docker Infrastructure:**
- `prometheus` (9090) - already available
- `jaeger` (16686) - already available
- `otel-collector` (4318) - already available
- Grafana + Loki - **will be added**

---

## Architecture Decisions

Based on current codebase review (2025-12-22):

| Decision | Choice | Reason |
|----------|--------|--------|
| Telemetry location | `src/utils/telemetry.js` | Infrastructure, not business logic |
| Configuration | Environment variables (`.env`) | Matches existing pattern |
| Feature flag | Add `TELEMETRY` to `features.js` | Gradual rollout capability |
| VPS endpoint | `saberloop.com/telemetry/` | Separate from `/app/` |

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/utils/telemetry.js` | Telemetry client (batch, send) |
| `src/utils/telemetry.test.js` | Unit tests |
| `tests/e2e/telemetry.spec.js` | E2E tests |
| `docker-compose.telemetry.yml` | Grafana + Loki (other containers already exist) |
| `scripts/telemetry/download.ps1` | Download from VPS (Windows) |
| `scripts/telemetry/import.ps1` | Import to local stack |

### Modified Files

| File | Change |
|------|--------|
| `src/utils/logger.js` | Add telemetry hook |
| `src/utils/errorHandler.js` | Add telemetry hook |
| `src/utils/performance.js` | Add telemetry hook |
| `src/core/features.js` | Add `TELEMETRY` flag |
| `.env.example` | Add telemetry variables |
| `knip.json` | Ensure telemetry exports not flagged |
| `.dependency-cruiser.cjs` | Verify telemetry follows rules |

### VPS Files (Manual Deploy)

| File | Purpose |
|------|---------|
| `/telemetry/ingest.php` | Receive and store telemetry |
| `/telemetry/config.php` | Token and storage path |
| `/telemetry/.htaccess` | Security (block direct file access) |
| `/telemetry/rotate-logs.php` | Cron job for 30-day cleanup |

---

## Implementation Phases

### Phase T1: Frontend Telemetry Client (2-3 sessions)

**Goal:** Create telemetry client that batches and sends data to VPS.

#### T1.1: Feature Flag

Add to `src/core/features.js`:

```javascript
TELEMETRY: {
  phase: 'DISABLED',  // Start disabled, enable after VPS ready
  description: 'Send telemetry to VPS for debugging'
}
```

#### T1.2: Environment Variables

Add to `.env.example` and `.env`:

```bash
# Telemetry (Phase 40)
VITE_TELEMETRY_ENABLED=false
VITE_TELEMETRY_ENDPOINT=https://saberloop.com/telemetry/ingest.php
VITE_TELEMETRY_TOKEN=your-secret-token-here
```

#### T1.3: Telemetry Client

Create `src/utils/telemetry.js`:

```javascript
/**
 * Telemetry Client - Batches and sends telemetry to VPS
 *
 * Usage:
 *   telemetry.log('info', 'Quiz started', { topic: 'Math' });
 *   telemetry.metric('web_vital_lcp', 1250, { rating: 'good' });
 *   telemetry.trace('api.generateQuestions', 2450, { model: 'claude' });
 */

import { isFeatureEnabled } from '../core/features.js';

class TelemetryClient {
  constructor() {
    this.endpoint = import.meta.env.VITE_TELEMETRY_ENDPOINT;
    this.token = import.meta.env.VITE_TELEMETRY_TOKEN;
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 seconds
    this.buffer = { logs: [], traces: [], metrics: [] };
    this.sessionId = this.generateSessionId();
    this.timer = null;

    // Start flush timer
    this.startTimer();

    // Flush on page unload
    this.setupUnloadHandler();
  }

  isEnabled() {
    return isFeatureEnabled('TELEMETRY') &&
           import.meta.env.VITE_TELEMETRY_ENABLED === 'true';
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 16);
  }

  log(level, message, context = {}) {
    if (!this.isEnabled()) return;

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

  metric(name, value, labels = {}) {
    if (!this.isEnabled()) return;

    this.buffer.metrics.push({
      timestamp: new Date().toISOString(),
      name,
      value,
      labels,
      sessionId: this.sessionId
    });

    this.maybeFlush();
  }

  trace(name, duration, attributes = {}) {
    if (!this.isEnabled()) return;

    this.buffer.traces.push({
      timestamp: new Date().toISOString(),
      traceId: this.generateId(),
      spanId: this.generateId(),
      name,
      duration,
      attributes,
      sessionId: this.sessionId
    });

    this.maybeFlush();
  }

  maybeFlush() {
    const total = this.buffer.logs.length +
                  this.buffer.traces.length +
                  this.buffer.metrics.length;

    if (total >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (!this.isEnabled()) return;
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
        keepalive: true // Important: allows send on page unload
      });
    } catch (err) {
      // Silently fail - telemetry should never break the app
      // Log to console only in development
      if (import.meta.env.DEV) {
        console.warn('[Telemetry] Failed to send:', err.message);
      }
    }
  }

  isEmpty() {
    return this.buffer.logs.length === 0 &&
           this.buffer.traces.length === 0 &&
           this.buffer.metrics.length === 0;
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.flush(), this.flushInterval);
  }

  setupUnloadHandler() {
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }

  // For testing
  getBuffer() {
    return this.buffer;
  }

  getSessionId() {
    return this.sessionId;
  }
}

// Singleton instance
export const telemetry = new TelemetryClient();
```

#### T1.4: Integrate with Logger

Modify `src/utils/logger.js` to hook into telemetry:

```javascript
import { telemetry } from './telemetry.js';

// In each log method, add telemetry call:
export const logger = {
  debug(message, context = {}) {
    // ... existing code ...
    telemetry.log('debug', message, formatted);
  },

  info(message, context = {}) {
    // ... existing code ...
    telemetry.log('info', message, formatted);
  },

  warn(message, context = {}) {
    // ... existing code ...
    telemetry.log('warn', message, formatted);
  },

  error(message, context = {}) {
    // ... existing code ...
    telemetry.log('error', message, formatted);
  },

  perf(metric, data = {}) {
    this.info(`[PERF] ${metric}`, data);
    telemetry.metric(metric.toLowerCase(), data.value, data);
  },

  // ... rest unchanged
};
```

#### T1.5: Integrate with Performance

Modify `src/utils/performance.js`:

```javascript
import { telemetry } from './telemetry.js';

export function initPerformanceMonitoring() {
  onLCP((metric) => {
    logger.perf('LCP', { value: Math.round(metric.value), rating: metric.rating });
    telemetry.metric('web_vital_lcp', Math.round(metric.value), { rating: metric.rating });
  });

  onINP((metric) => {
    logger.perf('INP', { value: Math.round(metric.value), rating: metric.rating });
    telemetry.metric('web_vital_inp', Math.round(metric.value), { rating: metric.rating });
  });

  onCLS((metric) => {
    logger.perf('CLS', { value: metric.value.toFixed(3), rating: metric.rating });
    telemetry.metric('web_vital_cls', parseFloat(metric.value.toFixed(3)), { rating: metric.rating });
  });

  logger.info('Performance monitoring initialized');
}
```

#### T1.6: Unit Tests

Create `src/utils/telemetry.test.js`:

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock features module
vi.mock('../core/features.js', () => ({
  isFeatureEnabled: vi.fn()
}));

import { isFeatureEnabled } from '../core/features.js';

describe('TelemetryClient', () => {
  let TelemetryClient;
  let telemetry;
  let fetchMock;

  beforeEach(async () => {
    // Reset modules to get fresh instance
    vi.resetModules();

    // Mock environment variables
    vi.stubEnv('VITE_TELEMETRY_ENABLED', 'true');
    vi.stubEnv('VITE_TELEMETRY_ENDPOINT', 'https://test.com/ingest');
    vi.stubEnv('VITE_TELEMETRY_TOKEN', 'test-token');

    // Mock fetch
    fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    // Import fresh module
    const module = await import('./telemetry.js');
    telemetry = module.telemetry;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('isEnabled', () => {
    it('should return false when feature flag is disabled', () => {
      isFeatureEnabled.mockReturnValue(false);
      expect(telemetry.isEnabled()).toBe(false);
    });

    it('should return true when feature flag and env var are enabled', () => {
      isFeatureEnabled.mockReturnValue(true);
      expect(telemetry.isEnabled()).toBe(true);
    });
  });

  describe('log', () => {
    it('should add log entry to buffer when enabled', () => {
      isFeatureEnabled.mockReturnValue(true);

      telemetry.log('info', 'Test message', { key: 'value' });

      const buffer = telemetry.getBuffer();
      expect(buffer.logs).toHaveLength(1);
      expect(buffer.logs[0]).toMatchObject({
        level: 'info',
        message: 'Test message',
        context: { key: 'value' }
      });
    });

    it('should not add log entry when disabled', () => {
      isFeatureEnabled.mockReturnValue(false);

      telemetry.log('info', 'Test message', {});

      const buffer = telemetry.getBuffer();
      expect(buffer.logs).toHaveLength(0);
    });
  });

  describe('metric', () => {
    it('should add metric entry to buffer when enabled', () => {
      isFeatureEnabled.mockReturnValue(true);

      telemetry.metric('web_vital_lcp', 1250, { rating: 'good' });

      const buffer = telemetry.getBuffer();
      expect(buffer.metrics).toHaveLength(1);
      expect(buffer.metrics[0]).toMatchObject({
        name: 'web_vital_lcp',
        value: 1250,
        labels: { rating: 'good' }
      });
    });
  });

  describe('trace', () => {
    it('should add trace entry to buffer when enabled', () => {
      isFeatureEnabled.mockReturnValue(true);

      telemetry.trace('api.generateQuestions', 2450, { model: 'claude' });

      const buffer = telemetry.getBuffer();
      expect(buffer.traces).toHaveLength(1);
      expect(buffer.traces[0]).toMatchObject({
        name: 'api.generateQuestions',
        duration: 2450,
        attributes: { model: 'claude' }
      });
    });
  });

  describe('flush', () => {
    it('should send batch to endpoint when called', async () => {
      isFeatureEnabled.mockReturnValue(true);

      telemetry.log('info', 'Test', {});
      await telemetry.flush();

      expect(fetchMock).toHaveBeenCalledWith(
        'https://test.com/ingest',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Telemetry-Token': 'test-token'
          }
        })
      );
    });

    it('should clear buffer after flush', async () => {
      isFeatureEnabled.mockReturnValue(true);

      telemetry.log('info', 'Test', {});
      await telemetry.flush();

      const buffer = telemetry.getBuffer();
      expect(buffer.logs).toHaveLength(0);
    });

    it('should not fail app when fetch fails', async () => {
      isFeatureEnabled.mockReturnValue(true);
      fetchMock.mockRejectedValue(new Error('Network error'));

      telemetry.log('info', 'Test', {});

      // Should not throw
      await expect(telemetry.flush()).resolves.not.toThrow();
    });
  });

  describe('sessionId', () => {
    it('should generate consistent sessionId for instance', () => {
      const id1 = telemetry.getSessionId();
      const id2 = telemetry.getSessionId();
      expect(id1).toBe(id2);
    });
  });
});
```

#### T1.7: E2E Tests

Create `tests/e2e/telemetry.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test.describe('Telemetry Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept telemetry requests
    await page.route('**/telemetry/ingest.php', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok', received: { logs: 1, traces: 0, metrics: 0 } })
      });
    });
  });

  test('should not send telemetry when feature is disabled', async ({ page }) => {
    let telemetryRequests = 0;

    page.on('request', request => {
      if (request.url().includes('telemetry')) {
        telemetryRequests++;
      }
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Default is disabled, so no requests should be made
    expect(telemetryRequests).toBe(0);
  });

  // Note: Testing enabled state requires modifying feature flags
  // which would need a test-specific build or runtime config
});
```

---

### Phase T2: VPS Ingest Endpoint (1-2 sessions)

**Goal:** PHP endpoint to receive and store telemetry on VPS.

#### T2.1: Directory Structure on VPS

```
/var/www/saberloop.com/
├── app/                    # Existing app
└── telemetry/              # NEW
    ├── ingest.php
    ├── config.php
    ├── .htaccess
    └── rotate-logs.php

/var/telemetry/saberloop/   # Storage (outside web root)
├── logs/
│   └── 2025-12-22.jsonl
├── traces/
│   └── 2025-12-22.jsonl
└── metrics/
    └── 2025-12-22.jsonl
```

#### T2.2: config.php

```php
<?php
// Telemetry configuration
define('TELEMETRY_TOKEN', 'your-secret-token-here');  // Must match .env
define('TELEMETRY_STORAGE_PATH', '/var/telemetry/saberloop');
define('TELEMETRY_RETENTION_DAYS', 30);
```

#### T2.3: ingest.php

```php
<?php
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

// Validate token
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

$counts = ['logs' => 0, 'traces' => 0, 'metrics' => 0];

// Append logs
if (!empty($data['logs'])) {
    $file = "$baseDir/logs/$date.jsonl";
    foreach ($data['logs'] as $log) {
        $log['received_at'] = date('c');
        file_put_contents($file, json_encode($log) . "\n", FILE_APPEND | LOCK_EX);
        $counts['logs']++;
    }
}

// Append traces
if (!empty($data['traces'])) {
    $file = "$baseDir/traces/$date.jsonl";
    foreach ($data['traces'] as $trace) {
        $trace['received_at'] = date('c');
        file_put_contents($file, json_encode($trace) . "\n", FILE_APPEND | LOCK_EX);
        $counts['traces']++;
    }
}

// Append metrics
if (!empty($data['metrics'])) {
    $file = "$baseDir/metrics/$date.jsonl";
    foreach ($data['metrics'] as $metric) {
        $metric['received_at'] = date('c');
        file_put_contents($file, json_encode($metric) . "\n", FILE_APPEND | LOCK_EX);
        $counts['metrics']++;
    }
}

echo json_encode(['status' => 'ok', 'received' => $counts]);
```

#### T2.4: .htaccess

```apache
# Block direct access to storage
<FilesMatch "\.(jsonl|php)$">
    # Allow ingest.php only
    <If "%{REQUEST_FILENAME} != 'ingest.php'">
        Require all denied
    </If>
</FilesMatch>

# Disable directory listing
Options -Indexes
```

#### T2.5: rotate-logs.php

```php
<?php
// Cron: 0 0 * * * php /var/www/saberloop.com/telemetry/rotate-logs.php

require_once 'config.php';

$baseDir = TELEMETRY_STORAGE_PATH;
$cutoffDate = date('Y-m-d', strtotime('-' . TELEMETRY_RETENTION_DAYS . ' days'));

$deleted = 0;
foreach (['logs', 'traces', 'metrics'] as $type) {
    $dir = "$baseDir/$type";
    if (!is_dir($dir)) continue;

    foreach (glob("$dir/*.jsonl") as $file) {
        $fileDate = basename($file, '.jsonl');
        if ($fileDate < $cutoffDate) {
            unlink($file);
            $deleted++;
            echo "Deleted: $file\n";
        }
    }
}

echo "Rotation complete. Deleted $deleted files.\n";
```

---

### Phase T3: Local Analysis Stack (1-2 sessions)

**Goal:** Add Grafana and Loki to existing Docker setup for visualization.

#### T3.1: Existing Containers (Already Available)

You already have these containers in Docker Desktop:

| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| `prometheus` | `prom/prometheus:latest` | 9090:9090 | Metrics storage |
| `jaeger` | `jaegertracing/all-in-one:latest` | 16686:16686 | Trace visualization |
| `otel-collector` | `otel/opentelemetry-collector:latest` | 4319:4318 | Telemetry collection |

**No changes needed** - just start these when analyzing.

#### T3.2: docker-compose.telemetry.yml (New Containers Only)

Create `docker-compose.telemetry.yml` with only the missing services:

```yaml
version: '3.8'

# This compose file adds Grafana + Loki to your existing setup
# Existing containers (prometheus, jaeger, otel-collector) are managed separately

services:
  # Log aggregation (NEW)
  loki:
    image: grafana/loki:2.9.0
    container_name: loki
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml

  # Visualization dashboard (NEW)
  grafana:
    image: grafana/grafana:10.0.0
    container_name: grafana
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

volumes:
  loki-data:
  grafana-data:
```

#### T3.3: Starting the Full Analysis Stack

```powershell
# 1. Start existing containers (from Docker Desktop or CLI)
docker start prometheus jaeger otel-collector

# 2. Start Grafana + Loki
docker-compose -f docker-compose.telemetry.yml up -d

# 3. Access dashboards:
#    - Grafana: http://localhost:3000 (admin/admin)
#    - Jaeger:  http://localhost:16686
#    - Prometheus: http://localhost:9090
```

#### T3.4: Stopping When Done

```powershell
# Stop Grafana + Loki
docker-compose -f docker-compose.telemetry.yml down

# Stop existing containers (optional)
docker stop prometheus jaeger otel-collector
```

---

### Phase T4: Import Scripts (1 session)

**Goal:** Scripts to download from VPS and import into local stack.

#### T4.1: scripts/telemetry/download.ps1 (Windows)

```powershell
# Download telemetry data from VPS
param(
    [int]$Days = 7
)

$VpsHost = "saberloop.com"
$VpsUser = $env:FTP_USER
$VpsPath = "/var/telemetry/saberloop"
$LocalPath = "./telemetry-data"

# Create local directories
New-Item -ItemType Directory -Force -Path "$LocalPath/logs"
New-Item -ItemType Directory -Force -Path "$LocalPath/traces"
New-Item -ItemType Directory -Force -Path "$LocalPath/metrics"

Write-Host "Downloading last $Days days of telemetry..."

# Use WinSCP or similar for download
# (Implementation depends on available tools)

Write-Host "Download complete! Data in $LocalPath"
```

#### T4.2: scripts/telemetry/import.ps1 (Windows)

```powershell
# Import downloaded data into local analysis stack
param(
    [string]$DataPath = "./telemetry-data"
)

Write-Host "Importing logs to Loki..."
# Loki import logic

Write-Host "Importing traces to Jaeger..."
# Jaeger import logic

Write-Host "Import complete! Open Grafana at http://localhost:3000"
```

---

## Testing Strategy

### Unit Tests

| Test File | Tests |
|-----------|-------|
| `telemetry.test.js` | TelemetryClient class methods, buffering, flush, error handling |

**Run:** `npm test`

### E2E Tests

| Test File | Tests |
|-----------|-------|
| `telemetry.spec.js` | Integration with app, network interception |

**Run:** `npm run test:e2e`

### Architecture Tests

After implementation, verify:

```bash
npm run arch:test
```

Expected: `telemetry.js` should:
- Import from `core/features.js` (allowed)
- NOT import from `views/`, `services/`, `api/` (would violate rules)

### Dead Code Analysis

After implementation, verify:

```bash
npm run lint:dead-code
```

Expected: All telemetry exports should be used. If Knip flags unused exports, either:
- Add to `knip.json` ignore list (if intentionally public API)
- Remove unused exports

---

## Architecture Compliance

### Allowed Imports

```
telemetry.js → core/features.js ✓
telemetry.js → (browser APIs) ✓

logger.js → telemetry.js ✓
errorHandler.js → telemetry.js ✓ (via logger)
performance.js → telemetry.js ✓
```

### Not Allowed

```
telemetry.js → views/ ✗
telemetry.js → services/ ✗
telemetry.js → api/ ✗
```

---

## Rollout Strategy

### Phase 1: Development (DISABLED)

1. Implement T1 (frontend client)
2. Deploy with `TELEMETRY: { phase: 'DISABLED' }`
3. All tests pass
4. No telemetry sent

### Phase 2: VPS Ready (Still DISABLED)

1. Deploy T2 (VPS endpoint)
2. Test endpoint manually with curl
3. Still disabled in app

### Phase 3: Enable

1. Change to `TELEMETRY: { phase: 'ENABLED' }`
2. Set `.env` variables in production
3. Deploy and verify data arriving on VPS

### Phase 4: Analysis Tools

1. Implement T3 + T4
2. Download data and verify import works
3. Create Grafana dashboards

---

## Success Criteria

- [ ] `src/utils/telemetry.js` created with tests
- [ ] `src/utils/telemetry.test.js` passes (unit tests)
- [ ] `tests/e2e/telemetry.spec.js` passes (E2E tests)
- [ ] `npm run arch:test` passes (no violations)
- [ ] `npm run lint:dead-code` passes (no unused exports)
- [ ] VPS endpoint receives and stores data
- [ ] JSONL files created in `/var/telemetry/saberloop/`
- [ ] 30-day rotation working (cron job)
- [ ] Local Docker stack starts and imports data
- [ ] Can view logs/traces/metrics in Grafana
- [ ] Sensitive data still redacted (inherits from logger)
- [ ] Feature can be disabled without breaking app

---

## Git Workflow

### Branch Strategy

```bash
# Create feature branch from main
git checkout main
git pull
git checkout -b feat/phase40-telemetry
```

### Atomic Commits (T1)

| # | Commit | Files |
|---|--------|-------|
| 1 | `feat(features): add TELEMETRY feature flag` | `features.js` |
| 2 | `feat(env): add telemetry environment variables` | `.env.example` |
| 3 | `feat(telemetry): create telemetry client` | `telemetry.js` |
| 4 | `test(telemetry): add unit tests` | `telemetry.test.js` |
| 5 | `feat(logger): integrate telemetry hooks` | `logger.js` |
| 6 | `feat(performance): integrate telemetry hooks` | `performance.js` |
| 7 | `test(e2e): add telemetry integration tests` | `telemetry.spec.js` |
| 8 | `docs: update knip config for telemetry` | `knip.json` (if needed) |

### Atomic Commits (T2)

| # | Commit | Files |
|---|--------|-------|
| 1 | `feat(vps): add telemetry ingest endpoint` | VPS files (manual deploy) |
| 2 | `feat(vps): add log rotation cron job` | VPS files (manual deploy) |

### Atomic Commits (T3-T4)

| # | Commit | Files |
|---|--------|-------|
| 1 | `feat(docker): add Grafana and Loki for telemetry` | `docker-compose.telemetry.yml` |
| 2 | `feat(scripts): add telemetry download script` | `download.ps1` |
| 3 | `feat(scripts): add telemetry import script` | `import.ps1` |

Note: Existing containers (prometheus, jaeger, otel-collector) are already available - no changes needed.

### PR Strategy

Option A: One PR per phase (T1, T2, T3-T4)
Option B: Single PR for all phases

Recommended: **Option A** - smaller PRs, easier to review

---

## Session Estimates

| Phase | Sessions | Focus |
|-------|----------|-------|
| T1 | 2-3 | Frontend client + tests |
| T2 | 1-2 | VPS endpoint |
| T3 | 1-2 | Grafana + Loki only (existing containers reused) |
| T4 | 1 | Import scripts |
| **Total** | **5-8** | |

---

## References

- Original plan: `PHASE40_TELEMETRY.md`
- Logger: `src/utils/logger.js`
- Features: `src/core/features.js`
- Architecture rules: `docs/architecture/ARCHITECTURE_RULES.md`
