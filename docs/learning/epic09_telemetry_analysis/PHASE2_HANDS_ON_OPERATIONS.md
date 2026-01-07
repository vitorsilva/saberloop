# Phase 2: Hands-On Operations

**Status:** In Progress
**Goal:** Practice the complete workflow from downloading logs to viewing them in Grafana.

---

## Overview

This phase is about getting hands-on experience with the telemetry tools:
1. Download logs from VPS
2. Start Docker analysis stack
3. Import logs to Loki
4. Query and explore in Grafana
5. Clean up when done

---

## 2.1 Download Logs from VPS

### Prerequisites

- FTP credentials in `.env` file:
  ```
  FTP_HOST=saberloop.com
  FTP_USER=your-user
  FTP_PASSWORD=your-password
  ```

### Steps

```powershell
# From project root
.\scripts\telemetry\download.ps1 -Days 7
```

### Checklist

- [ ] Verify FTP credentials in `.env`
- [ ] Run download script
- [ ] Check `telemetry-logs/` directory for downloaded files
- [ ] Examine a `.jsonl` file to understand the data structure

### Expected Output

```
telemetry-logs/
├── telemetry-2025-12-23.jsonl
├── telemetry-2025-12-24.jsonl
├── telemetry-2025-12-25.jsonl
└── ...
```

---

## 2.2 Start Docker Stack

### Steps

```powershell
# Start Grafana + Loki
docker-compose -f docker-compose.telemetry.yml up -d

# Verify containers are running
docker ps
```

### Checklist

- [ ] Start the telemetry stack
- [ ] Access Grafana at http://localhost:3000
- [ ] Login with admin/admin
- [ ] Verify Loki datasource is configured (Settings → Data Sources)

### Troubleshooting

**Containers not starting?**
```powershell
# Check logs
docker-compose -f docker-compose.telemetry.yml logs

# Restart fresh
docker-compose -f docker-compose.telemetry.yml down -v
docker-compose -f docker-compose.telemetry.yml up -d
```

**Port conflicts?**
- Grafana uses port 3000
- Loki uses port 3100
- Check if other services are using these ports

---

## 2.3 Import Logs to Loki

### Steps

```powershell
.\scripts\telemetry\import-to-loki.ps1
```

### Checklist

- [ ] Run import script
- [ ] Verify events are imported (check script output)
- [ ] Note the number of events imported

### Expected Output

```
=== Importing Telemetry to Loki ===
Input: .\telemetry-logs
Loki: http://localhost:3100

Loki is ready
Found 3 log file(s)

Processing: telemetry-2025-12-23.jsonl
  Done: 45 lines processed
Processing: telemetry-2025-12-24.jsonl
  Done: 120 lines processed
...

=== Import Complete ===
Total events: 200
Imported: 200
```

---

## 2.4 Query Logs in Grafana

### Steps

1. Open http://localhost:3000
2. Go to **Explore** (compass icon in sidebar)
3. Select **Loki** datasource
4. Enter queries in the query box

### Basic Queries

| Query | Description |
|-------|-------------|
| `{app="saberloop"}` | All events |
| `{app="saberloop", type="error"}` | Errors only |
| `{app="saberloop", type="metric"}` | Metrics only |
| `{app="saberloop", type="vital"}` | Web Vitals only |

### Checklist

- [ ] Run `{app="saberloop"}` - see all events
- [ ] Run `{app="saberloop", type="error"}` - filter errors
- [ ] Run `{app="saberloop", type="metric"}` - filter metrics
- [ ] Explore the JSON structure of events
- [ ] Try time range filtering

### Tips

- Click on a log line to expand and see full JSON
- Use the time picker (top right) to adjust date range
- Click "Live" to see real-time updates (if streaming)

---

## 2.5 Stop Stack (When Done)

### Steps

```powershell
# Stop containers (preserves data)
docker-compose -f docker-compose.telemetry.yml stop

# Or stop and remove containers (preserves volumes)
docker-compose -f docker-compose.telemetry.yml down

# Or stop and remove everything including data
docker-compose -f docker-compose.telemetry.yml down -v
```

### When to Use Each

| Command | Data Preserved | Use When |
|---------|----------------|----------|
| `stop` | Yes | Quick pause, will resume soon |
| `down` | Yes (volumes) | Done for now, may resume later |
| `down -v` | No | Starting fresh, clearing old data |

---

## Completion Criteria

- [ ] Successfully downloaded logs from VPS
- [ ] Docker stack running (Grafana + Loki)
- [ ] Logs imported to Loki
- [ ] Can query and view logs in Grafana
- [ ] Know how to start/stop the stack
- [ ] Ready for error analysis in Phase 3
