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
