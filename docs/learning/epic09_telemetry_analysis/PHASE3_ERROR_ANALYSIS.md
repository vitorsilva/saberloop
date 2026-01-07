# Phase 3: Error Analysis

**Status:** Not Started
**Goal:** Extract actionable error information from telemetry data.

---

## Overview

This phase focuses on errors:
1. Understand error data structure
2. Query errors in Grafana
3. Build an error report script
4. Create actionable outcomes (GitHub issues)

---

## 3.1 Understand Error Data Structure

### Review Error Events

Look at actual error events in `telemetry-logs/*.jsonl`:

```jsonl
{
  "type": "error",
  "data": {
    "message": "Failed to fetch quiz",
    "stack": "Error: Failed to fetch...",
    "context": { ... }
  },
  "timestamp": "2025-12-25T10:30:00.000Z",
  "sessionId": "1735123456789-abc123",
  "url": "https://saberloop.com/app/#/quiz",
  "userAgent": "Mozilla/5.0..."
}
```

### Checklist

- [ ] What fields are captured (message, stack, context)?
- [ ] Are errors from `errorHandler.js` being tracked?
- [ ] What additional context is available (URL, sessionId, userAgent)?
- [ ] Are there different error types/categories?

### Questions to Answer

1. What error types exist in the data?
2. What context is most useful for debugging?
3. Are stack traces included?

---

## 3.2 Error Queries in Grafana

### Basic Error Query

```logql
{app="saberloop", type="error"}
```

### Count Errors Over Time

```logql
count_over_time({app="saberloop", type="error"} [1h])
```

### Filter by Error Message

```logql
{app="saberloop", type="error"} |= "Failed to fetch"
```

### Extract JSON Fields

```logql
{app="saberloop", type="error"} | json | data_message != ""
```

### Checklist

- [ ] Count errors by type/message
- [ ] Find errors by time range
- [ ] Correlate errors with session activity
- [ ] Identify repeat offenders (same error multiple times)

---

## 3.3 Error Report Script

### Goal

Create `npm run telemetry:errors` command that:
- Reads local `.jsonl` files (no Loki needed)
- Filters for error events
- Groups by error message
- Shows count, first/last occurrence, affected sessions
- Outputs actionable summary

### Implementation

**File:** `scripts/telemetry/error-report.js`

```javascript
// Script structure (to be implemented)
// 1. Read all .jsonl files from telemetry-logs/
// 2. Parse each line as JSON
// 3. Filter for type === 'error'
// 4. Group by error message
// 5. Calculate statistics
// 6. Output report
```

### Expected Output

```
=== Error Report (Last 7 Days) ===

Total errors: 15
Unique error types: 3
Sessions affected: 10

─────────────────────────────────────────

1. "Failed to fetch quiz" (12 occurrences)
   First: 2025-12-20 14:30
   Last:  2025-12-25 09:15
   Sessions affected: 8
   URLs: /app/#/quiz (12)

2. "IndexedDB quota exceeded" (3 occurrences)
   First: 2025-12-22 18:00
   Last:  2025-12-22 18:05
   Sessions affected: 1
   URLs: /app/#/results (3)

─────────────────────────────────────────

Suggested Actions:
- [ ] Investigate "Failed to fetch quiz" - high frequency
- [ ] Add IndexedDB quota handling
```

### Checklist

- [ ] Create `scripts/telemetry/error-report.js`
- [ ] Add `telemetry:errors` script to `package.json`
- [ ] Test with actual telemetry data
- [ ] Refine output format based on findings

---

## 3.4 Actionable Outcomes

### For Each Error Category

1. **Assess severity**
   - How many users affected?
   - How often does it occur?
   - Does it block core functionality?

2. **Create GitHub Issue** (if not already tracked)
   - Title: Clear error description
   - Body: Include telemetry evidence
   - Labels: bug, priority

3. **Add to Backlog**
   - Link issue to appropriate epic/phase
   - Set priority based on impact

### Checklist

- [ ] Review error report output
- [ ] Identify top 3 errors by frequency/impact
- [ ] Create GitHub issues for untracked errors
- [ ] Document findings in learning notes

### Issue Template

```markdown
## Error: [Error Message]

**Source:** Telemetry analysis (Epic 9)

### Evidence
- Occurrences: X in last 7 days
- Sessions affected: Y
- First seen: YYYY-MM-DD
- Last seen: YYYY-MM-DD

### Sample Error
```json
{ paste sample error event }
```

### Suggested Fix
[If known]

### Related
- Telemetry session IDs: ...
- URLs affected: ...
```

---

## Completion Criteria

- [ ] Understand error data structure
- [ ] Can query errors in Grafana
- [ ] Error report script working (`npm run telemetry:errors`)
- [ ] Created at least one GitHub issue from findings
- [ ] Documented learnings in `PHASE3_LEARNING_NOTES.md`
