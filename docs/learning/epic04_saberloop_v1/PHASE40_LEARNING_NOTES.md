# Phase 40 Learning Notes - Telemetry Enhancement

## Session Log

### Session 1 - December 22, 2025

**Goal:** Implement telemetry system to understand user difficulties

**Why Telemetry?**
- Users have reported difficulties that are hard to diagnose remotely
- Need visibility into errors, performance issues, and user flows
- Self-hosted solution to keep costs at $0

**Planning Decisions Made:**
1. Telemetry location: `src/utils/telemetry.js` (infrastructure, not business logic)
2. Configuration: Environment variables (`.env`) - matches existing patterns
3. Implementation scope: All phases (T1-T4)
4. Docker approach: Reuse existing containers (Prometheus, Jaeger, OTEL), add only Grafana + Loki

**What We Accomplished:**

| Phase | Status | Commits |
|-------|--------|---------|
| T1: Frontend TelemetryClient | ✅ Complete | 4 commits |
| T2: VPS PHP Endpoint | ✅ Complete | 5 commits |
| T3: Integration | ✅ Complete | 3 commits |
| T4: Docker Analysis Stack | ✅ Complete | 3 commits |

**All 15 Commits:**
1. `feat(telemetry): add TELEMETRY feature flag`
2. `feat(telemetry): add environment variables`
3. `feat(telemetry): create TelemetryClient`
4. `test(telemetry): add unit tests for TelemetryClient`
5. `feat(telemetry): add PHP config for VPS endpoint`
6. `feat(telemetry): add PHP ingestion endpoint`
7. `feat(telemetry): add .htaccess security rules`
8. `feat(telemetry): add log rotation script`
9. `feat(telemetry): add deploy script and npm command`
10. `feat(telemetry): integrate telemetry into logger`
11. `feat(telemetry): integrate telemetry into errorHandler`
12. `feat(telemetry): integrate telemetry into performance monitoring`
13. `feat(telemetry): add Docker stack for Grafana + Loki`
14. `feat(telemetry): add scripts to download and import logs`
15. `feat(telemetry): add npm scripts for telemetry analysis`

---

## Key Concepts Learned

### What is Telemetry?

Telemetry is the automatic collection and transmission of data from remote sources. In web apps, this includes:
- **Logs** - What the app is doing (info, warnings)
- **Errors** - What went wrong (exceptions, failed requests)
- **Metrics** - Performance measurements (load times, response times)
- **Events** - User actions (page views, button clicks)

### Why Batch Before Sending?

Instead of sending every event immediately:
1. **Reduces network requests** - Better for mobile users
2. **Saves battery** - Fewer radio wake-ups
3. **Handles offline** - Queue persists until connection available
4. **Reduces server load** - Fewer HTTP connections

### Feature Flags for Telemetry

We use a feature flag so we can:
1. **Disable quickly** if something goes wrong
2. **Roll out gradually** to test on subset of users
3. **Turn off in development** to avoid noise

### Why Both `beforeunload` AND `visibilitychange`?

| Scenario | beforeunload | visibilitychange |
|----------|--------------|------------------|
| User closes tab (desktop) | Fires | May not fire |
| User navigates away | Fires | Fires |
| User switches apps (mobile) | Doesn't fire | Fires |
| User locks phone | Doesn't fire | Fires |

Mobile browsers don't reliably fire `beforeunload` - they just freeze tabs. Using both maximizes our chances of capturing telemetry.

### Offline Queue with localStorage

When the OS kills a tab (no warning events), saved events in localStorage survive. Next time the user opens the app, `_loadOfflineQueue()` restores them.

### JSONL Format (Append-Friendly)

**Problem:** Multiple users sending telemetry simultaneously could cause race conditions with regular JSON files.

**Solution:** JSONL (JSON Lines) - one JSON object per line:
```
{"type":"error","data":{"message":"Failed"}}
{"type":"log","data":{"level":"info"}}
```

Benefits:
- Append-only (no need to read/parse/rewrite)
- Filesystem handles concurrent appends safely
- `LOCK_EX` flag adds extra safety

### Grafana + Loki Stack

- **Loki** - Log aggregation (like Prometheus but for logs)
- **Grafana** - Visualization dashboards
- Logs are labeled by `app` and `type` for easy filtering

---

## Files Created/Modified

### New Files
| File | Purpose |
|------|---------|
| `src/utils/telemetry.js` | TelemetryClient class (224 lines) |
| `src/utils/telemetry.test.js` | Unit tests (20 tests) |
| `php-api/telemetry/config.php` | VPS configuration |
| `php-api/telemetry/ingest.php` | VPS ingestion endpoint |
| `php-api/telemetry/.htaccess` | Security rules |
| `php-api/telemetry/rotate-logs.php` | Log cleanup script |
| `scripts/deploy-telemetry.cjs` | FTP deploy script |
| `docker-compose.telemetry.yml` | Grafana + Loki stack |
| `docker/loki-config.yml` | Loki configuration |
| `docker/grafana-datasources.yml` | Grafana datasource config |
| `scripts/telemetry/download.ps1` | Download logs from VPS |
| `scripts/telemetry/import-to-loki.ps1` | Import to Loki (PowerShell) |
| `scripts/telemetry/import-to-loki.cjs` | Import to Loki (Node.js) |

### Modified Files
| File | Change |
|------|--------|
| `src/core/features.js` | Added TELEMETRY flag |
| `src/utils/logger.js` | Integrated telemetry (warn, error, perf, action) |
| `src/utils/errorHandler.js` | Integrated telemetry (uncaught errors) |
| `src/utils/performance.js` | Integrated telemetry (Web Vitals) |
| `src/api/api.real.js` | Added quiz generation timing metric |
| `src/views/LoadingView.js` | Show specific error messages to users |
| `src/main.js` | Added telemetry initialization log |
| `.env.example` | Added telemetry variables |
| `package.json` | Added telemetry npm scripts |

---

## Telemetry Event Types

| Type | Source | When Captured |
|------|--------|---------------|
| `log` | logger.warn() | Warnings in the app |
| `error` | logger.error(), window.error | Errors and exceptions |
| `metric` | logger.perf() | Custom performance metrics |
| `event` | logger.action() | User actions |
| `vital` | Web Vitals | LCP, INP, CLS |
| `metric` | quiz_generation | API call duration (success/error) |

---

## New npm Commands

| Command | Purpose |
|---------|---------|
| `npm run deploy:telemetry` | Deploy PHP endpoint to VPS |
| `npm run telemetry:start` | Start Grafana + Loki locally |
| `npm run telemetry:stop` | Stop Grafana + Loki |
| `npm run telemetry:import` | Import logs to Loki |

---

## Workflow to Analyze Telemetry

```
1. Deploy endpoint:     npm run deploy:telemetry
2. Enable feature flag: Set TELEMETRY phase to 'ENABLED' in features.js
3. Deploy app:          npm run build:deploy
4. Wait for data...     (users generate telemetry)
5. Download logs:       PowerShell script or FTP client
6. Start stack:         npm run telemetry:start
7. Import logs:         npm run telemetry:import
8. View in Grafana:     http://localhost:3000 (admin/admin)
```

---

## Verification Results

- ✅ Unit tests: 126 passed (including 20 new telemetry tests)
- ✅ Architecture: 0 violations (53 modules, 113 dependencies)
- ✅ Dead code: 0 warnings

---

## Next Steps (Post-Phase 40)

- [x] Deploy telemetry endpoint to VPS (`npm run deploy:telemetry`)
- [x] Set secure TELEMETRY_TOKEN in `.env` and on VPS
- [x] Create logs directory on VPS with write permissions
- [x] Deploy app with feature flag DISABLED (verify nothing breaks)
- [x] Enable feature flag (change phase to 'ENABLED')
- [x] Deploy app with telemetry ENABLED
- [x] Test end-to-end telemetry flow
- [x] Set up cron job for log rotation on VPS
- [x] Add quiz generation timing metric
- [ ] Create PR and merge to main
- [ ] Test local analysis workflow (deferred - use FTP + raw JSONL for now)

---

### Session 2 - December 23, 2025

**Goal:** Deploy telemetry to production

**Key Learning: Feature Flag Deployment Process**

The correct process for deploying with feature flags:

```
┌─────────────────────────────────────────────────────────────────┐
│                  FEATURE FLAG DEPLOYMENT FLOW                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. DEPLOY CODE (flag DISABLED)                                │
│     └─► Code is in production but feature is OFF               │
│                                                                 │
│  2. VERIFY (monitor)                                           │
│     └─► App works normally, no regressions                     │
│                                                                 │
│  3. ENABLE FLAG                                                │
│     └─► Change DISABLED → ENABLED in features.js               │
│                                                                 │
│  4. DEPLOY AGAIN                                               │
│     └─► Now feature is live for users                          │
│                                                                 │
│  5. MONITOR                                                    │
│     └─► Watch for issues, ready to roll back                   │
│                                                                 │
│  ⚠️  IF PROBLEMS: Just change ENABLED → DISABLED and redeploy  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Why This Order Matters:**

| Approach | Risk | Recovery Time |
|----------|------|---------------|
| Deploy disabled first | Low - feature is off | N/A |
| Deploy enabled directly | High - users hit bugs | Minutes to hours |

By deploying DISABLED first, we verify that:
- The new code doesn't break existing functionality
- The build process works correctly
- Any integration issues are caught before users see the feature

**VPS Configuration Completed:**

| Task | Status | Notes |
|------|--------|-------|
| Deploy PHP files | ✅ | `npm run deploy:telemetry` |
| Create logs directory | ✅ | `/telemetry/logs/` with write permissions |
| Set TELEMETRY_TOKEN | ✅ | Edited config.php directly on VPS |
| Token in local .env | ✅ | `VITE_TELEMETRY_TOKEN` set |

**Deployment Checklist:**

- [x] Run tests locally (`npm test -- --run && npm run test:e2e`)
- [x] Build and deploy with DISABLED flag (`npm run build:deploy`)
- [x] Verify app works in production (manual test)
- [x] Change flag to ENABLED in `features.js`
- [x] Build and deploy again
- [x] Test telemetry endpoint receives data
- [x] Verify logs appear in `/telemetry/logs/` on VPS

**Debugging Telemetry Not Working:**

Issue encountered: Telemetry wasn't sending requests even after enabling feature flag.

Root cause: Double-check in `telemetry.js`:
```javascript
_isEnabled() {
  return CONFIG.enabled && isFeatureEnabled('TELEMETRY');
}
```

Both conditions required:
1. Feature flag `TELEMETRY` = `ENABLED`
2. Environment variable `VITE_TELEMETRY_ENABLED` = `'true'`

**Lesson:** Having both a feature flag AND an env variable creates redundancy. Consider simplifying to just the feature flag in the future.

**Additional Improvements Made:**

1. **Telemetry initialization log** - Added `[INFO] Telemetry initialized` to console output (matches other services like Database, Router, Network)
   - Added `isEnabled()` public method to `TelemetryClient`
   - Added log in `main.js` after initialization

2. **Specific error messages for users** - Changed generic error alert to show actual error message
   - Before: "Failed to generate questions. Please check your connection and try again."
   - After: Shows actual error (e.g., "Rate limit exceeded. Free tier allows 50 requests/day.")
   - Location: `src/views/LoadingView.js:137`

**Error Capture Flow (for debugging user issues):**

```
LoadingView.js → generateQuestions()
       ↓
quiz-service.js → apiGenerateQuestions()
       ↓
api.real.js → callOpenRouter()
       ↓
openrouter-client.js → fetch() → handleApiError()
       ↓
Error messages created:
  • 401 → "Invalid API key. Please reconnect with OpenRouter."
  • 429 → "Rate limit exceeded. Free tier allows 50 requests/day."
  • 402 → "Insufficient credits. Add credits at openrouter.ai"
       ↓
api.real.js:105 → logger.error() → telemetry.track('error')
       ↓
LoadingView.js:133 → logger.error() → telemetry.track('error')
       ↓
JSONL file on VPS contains detailed error info
```

**Telemetry Verified Working:**

- Endpoint: `https://saberloop.com/telemetry/ingest.php`
- Log file created: `/telemetry/logs/telemetry-2025-12-23.jsonl`
- Data captured: Web Vitals (CLS, LCP), errors, metrics

**Cron Job Configured:**

| Setting | Value |
|---------|-------|
| Schedule | `0 0 * * *` (daily at midnight) |
| Command | `/usr/local/bin/php /home/mdemaria/saberloop.com/telemetry/rotate-logs.php >> /home/mdemaria/logs/telemetry-rotation.log 2>&1` |
| Purpose | Delete log files older than 30 days |
| Output log | `/home/mdemaria/logs/telemetry-rotation.log` |

**Local Analysis Workflow (Deferred):**

Scripts exist but haven't been tested yet:
- `scripts/telemetry/download.ps1` - Download JSONL from VPS
- `scripts/telemetry/import-to-loki.ps1` - Import to Loki
- `docker-compose.telemetry.yml` - Grafana + Loki stack

**For now:** Download JSONL files via FTP and read directly (they're human-readable JSON lines).

**When needed:** Run `npm run telemetry:start` to spin up Grafana/Loki for visualization.

---

### Quiz Generation Timing Metric

**Problem:** Users report slow or failing quiz generation, but we don't know how long requests take.

**Solution:** Add `performance.now()` timing around the OpenRouter API call.

**Implementation Plan:**

1. Add `startTime = performance.now()` at the start of `generateQuestions()`
2. Calculate `duration = performance.now() - startTime` on success
3. Calculate duration on error (before throwing)
4. Log via `logger.perf('quiz_generation', { value, status, topic })`

**Files Changed:**

| File | Change |
|------|--------|
| `src/api/api.real.js` | Added timing around `generateQuestions()` |

**Telemetry Data Captured:**

```json
// Success case
{"type":"metric","data":{"name":"quiz_generation","value":3450,"status":"success","topic":"Solar System"}}

// Error case
{"type":"metric","data":{"name":"quiz_generation","value":15200,"status":"error","topic":"Math","error":"Rate limit exceeded..."}}
```

**Why `performance.now()`?**
- Higher precision than `Date.now()` (microsecond vs millisecond)
- Monotonic clock (not affected by system time changes)
- Standard for measuring durations in web apps

**What This Enables:**
- See average quiz generation time
- Identify slow requests (>10s might timeout)
- Correlate errors with duration (timeouts vs immediate failures)
- Track performance over time

---

**Last Updated:** 2025-12-23
**Status:** Telemetry live in production. PR pending.
