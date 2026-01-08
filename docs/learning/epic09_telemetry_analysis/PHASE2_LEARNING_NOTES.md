# Phase 2: Hands-On Operations - Learning Notes

## Session: 2026-01-07

### Completed

- **Phase 1**: Review & Understand - Complete
  - Reviewed telemetry client (`src/utils/telemetry.js`)
  - Understood event types (metric, vital, event, error)
  - Reviewed VPS ingest endpoint structure
  - Understood Docker stack configuration
  - Learned about Loki labels for querying

- **Phase 2**: Hands-On Operations - In Progress
  - Downloaded telemetry logs from VPS (9 files, ~500KB total)
  - Started Docker stack (saberloop-loki, saberloop-grafana)
  - Attempted import to Loki - encountered issues

### Difficulties & Solutions

#### 1. download.ps1 - .env file not found
- **Problem**: Script error "FTP credentials not found"
- **Cause**: Line 13 had typo `..\..\env` instead of `..\..\.env`
- **Fix**: Corrected path to `..\..\.env`

#### 2. download.ps1 - WinSCP not found
- **Problem**: Script couldn't find WinSCP despite being installed via winget
- **Cause**: WinSCP installed by winget goes to `$env:LOCALAPPDATA\Programs\WinSCP\WinSCP.com`, not in PATH
- **Fix**: Added path detection for winget install location and updated invocation to use temp script file

#### 3. import-to-loki.ps1 - Push-ToLoki function not recognized
- **Problem**: Error "The term 'Push-ToLoki' is not recognized as the name of a cmdlet"
- **Cause**: Function defined at line 93 but called at lines 74 and 86 - PowerShell requires functions to be defined before use
- **Fix**: Moved function definition to before the main loop (line 38)

#### 4. import-to-loki.ps1 - OutOfMemoryException
- **Problem**: `System.OutOfMemoryException` when converting batch to JSON
- **Cause**: Batch size of 100 events too large for PowerShell's JSON conversion with large telemetry payloads
- **Fix**: Reduced batch size from 100 to 10

### Files Modified

1. `scripts/telemetry/download.ps1`
   - Fixed .env path (line 13)
   - Added WinSCP winget path detection (lines 48-53)
   - Changed WinSCP invocation to use temp script file (lines 57-68)

2. `scripts/telemetry/import-to-loki.ps1`
   - Moved `Push-ToLoki` function to before main loop (lines 38-68)
   - Reduced batch size from 100 to 10 (line 81)

### Learnings

- **PowerShell function order matters**: Unlike some languages, PowerShell requires functions to be defined before they're called in the script
- **winget installs to user-local directory**: Programs installed via winget go to `$env:LOCALAPPDATA\Programs\[AppName]\` by default, not system PATH
- **Large JSON batches can cause memory issues**: When processing lots of data, smaller batch sizes are safer even if slower

### Next Steps (When Resuming)

1. Clear Loki data: `docker-compose -f docker-compose.telemetry.yml down -v`
2. Start fresh: `docker-compose -f docker-compose.telemetry.yml up -d`
3. Wait for Loki ready: `curl http://localhost:3100/ready`
4. Run import: `.\scripts\telemetry\import-to-loki.ps1`
5. Open Grafana: http://localhost:3000 (admin/admin)
6. Query logs in Explore with `{app="saberloop"}`
7. Complete Phase 2 checklist
8. Move to Phase 3: Error Analysis

---

## Session: 2026-01-08

### Completed

- Fixed OutOfMemoryException root cause in `import-to-loki.cjs`
- Created `error-report.cjs` for direct error analysis (no Loki needed)
- Successfully ran first error report

### Difficulties & Solutions

#### 5. import-to-loki.cjs - Still OutOfMemoryException
- **Problem**: Previous fix (reduced batch size) wasn't enough
- **Root Cause**: Both Node.js and PowerShell scripts load entire file into memory before processing
  ```javascript
  // Node.js loaded ALL events into array first
  const events = await readJsonlFile(filePath);  // ALL in memory
  for (let i = 0; i < events.length; i += BATCH_SIZE) { ... }
  ```
- **Fix**: Implemented true streaming - process lines as they come in, push batches immediately, clear batch after each push
- **Learning**: Even with small batch sizes, if you load the whole file first, you still have memory problems

#### 6. Loki not becoming ready (503 Service Unavailable)
- **Problem**: `localhost:3100/ready` returns 503, import script hangs
- **Cause**: Unknown - Loki container starts but doesn't become ready
- **Workaround**: Pivoted to Phase 3 error-report.cjs which doesn't need Loki
- **Status**: Loki issue is **unresolved**, needs investigation later

### Files Modified

1. `scripts/telemetry/import-to-loki.cjs`
   - Removed `readJsonlFile` function (loaded all into memory)
   - Implemented inline streaming with readline
   - Batch cleared immediately after push (line 85: `batch = []`)
   - Memory usage now constant regardless of file size

2. `scripts/telemetry/error-report.cjs` (NEW)
   - Reads .jsonl files directly (no Docker/Loki needed)
   - Groups errors by message, shows count/first/last/sessions
   - Analyzes patterns by page and time of day
   - Provides actionable recommendations

3. `package.json`
   - Added `telemetry:errors` script

### Error Report Findings (First Run)

```
Total Events:        1,113
Total Errors:        54 (4.9%)
Sessions w/Errors:   21 (14%)

Top Errors:
1. "Failed to generate questions" (17x) - 9 sessions
2. "Failed to parse explanation JSON" (11x) - 6 sessions
3. "Failed to fetch explanation" (9x) - 5 sessions

Failed Operations:
- quiz_generation: 4 failures
  - Failed to fetch: 2
  - Invalid API key: 1
  - Invalid response format: 1

Error Patterns:
- 52% on /results page
- 41% on /loading page
- Peak hour: 17:00 UTC (16 errors)

Recommendations:
1. [HIGH] Network errors - add retry logic
2. [MEDIUM] Quiz generation failures - review LLM parsing
```

### Learnings

- **True streaming is essential for large files**: Even if you batch during *processing*, loading the entire file into memory first defeats the purpose
- **Alternative paths can unblock progress**: When Loki wasn't working, creating error-report.cjs that reads files directly provided immediate value
- **First error analysis provides actionable insights**: 4.9% error rate with clear patterns (network errors, JSON parsing) suggests specific improvements

### Next Steps (When Resuming)

1. **Optional**: Debug Loki startup issue for Grafana visualization
2. Create GitHub issues for top errors:
   - Network retry logic (HIGH)
   - LLM response parsing improvements (MEDIUM)
3. Consider adding:
   - `--days N` flag to error-report.cjs for date filtering
   - More detailed session correlation
