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

**Implementation Plan:**
- [ ] T1.1: Add TELEMETRY feature flag to `features.js`
- [ ] T1.2: Add environment variables to `.env` and `.env.example`
- [ ] T1.3: Create `src/utils/telemetry.js` (TelemetryClient class)
- [ ] T1.4: Create unit tests `src/utils/telemetry.test.js`
- [ ] T2: VPS PHP endpoint (ingest.php, config.php, .htaccess, rotate-logs.php)
- [ ] T3: Integration (hook into logger, errorHandler, performance)
- [ ] T4: Docker analysis stack (Grafana + Loki)

---

## Key Concepts

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

---

## Session Progress

**Current Step:** Starting T1.1 (Feature Flag)

---

**Last Updated:** 2025-12-22
**Status:** In Progress
