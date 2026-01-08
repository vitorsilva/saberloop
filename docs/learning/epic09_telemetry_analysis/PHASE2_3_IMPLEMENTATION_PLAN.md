# Phase 2-3 Implementation Plan

**Date:** 2026-01-08
**Goal:** Complete Phase 2 (fix OutOfMemoryException) and Phase 3 (error analysis script)

---

## Problem: OutOfMemoryException in Import Script

### Root Cause

Both import scripts load entire files into memory before processing:

**Node.js (`import-to-loki.cjs` - Line 60-61):**
```javascript
const events = await readJsonlFile(filePath);  // Loads ALL events into array
for (let i = 0; i < events.length; i += BATCH_SIZE) { ... }
```

**PowerShell (`import-to-loki.ps1` - Line 73):**
```powershell
$lines = Get-Content $file.FullName  # Loads ALL lines into array
foreach ($line in $lines) { ... }
```

Even with batch size reduced to 10, the entire file is still loaded into memory first.

### Solution: True Streaming

Modify `import-to-loki.cjs` to process lines as they stream in:

```javascript
// Process file with streaming
const fileStream = fs.createReadStream(filePath);
const rl = readline.createInterface({ input: fileStream });

let batch = [];
let totalEvents = 0;

for await (const line of rl) {
    if (!line.trim()) continue;

    try {
        const parsed = JSON.parse(line);
        batch.push({ raw: line, parsed });
        totalEvents++;

        // Push when batch is full - don't accumulate
        if (batch.length >= BATCH_SIZE) {
            await pushToLoki(batch);
            batch = [];  // Clear immediately
        }
    } catch (e) {
        // Skip invalid lines
    }
}

// Push remaining
if (batch.length > 0) {
    await pushToLoki(batch);
}
```

Key differences:
1. No `readJsonlFile` function that accumulates all events
2. Batch is cleared immediately after push
3. Memory usage stays constant regardless of file size

---

## Phase 2 Tasks

- [ ] Update `import-to-loki.cjs` with streaming approach
- [ ] Test: `docker-compose -f docker-compose.telemetry.yml down -v`
- [ ] Test: `docker-compose -f docker-compose.telemetry.yml up -d`
- [ ] Test: `npm run telemetry:import`
- [ ] Verify in Grafana: `{app="saberloop"}`
- [ ] Update `PHASE2_LEARNING_NOTES.md`

---

## Phase 3 Tasks

### Error Report Script (`error-report.cjs`)

Create `npm run telemetry:errors` that:
1. Reads `.jsonl` files from `telemetry-logs/`
2. Filters for `type === 'error'`
3. Groups by error message
4. Shows: count, first/last occurrence, affected sessions
5. Outputs actionable summary

**Expected Output:**
```
=== Error Report (Last 7 Days) ===

Total errors: X
Unique error types: Y
Sessions affected: Z

Top Errors:
1. "Error message" (N occurrences)
   First: YYYY-MM-DD
   Last:  YYYY-MM-DD
   Sessions: N
```

### Tasks

- [ ] Create `scripts/telemetry/error-report.cjs`
- [ ] Add `"telemetry:errors": "node scripts/telemetry/error-report.cjs"` to package.json
- [ ] Test with existing telemetry data
- [ ] Create `PHASE3_LEARNING_NOTES.md`

---

## Success Criteria

1. Import completes without OutOfMemoryException
2. Data visible in Grafana
3. `npm run telemetry:errors` produces summary
4. Learning notes document the journey
