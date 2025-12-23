# Telemetry Analysis Plan (Draft)

**Status:** Initial Ideas
**Created:** 2025-12-23
**Related:** Phase 40 Telemetry Enhancement

---

## Goal

Analyze telemetry data to understand:
1. Quiz generation performance (average time, failures)
2. User experience issues (errors, slow operations)
3. Web Vitals trends (CLS, LCP, INP)

---

## Analysis Approaches

### Option A: LogQL in Grafana (Built-in)

**Pros:**
- No additional tools needed
- Real-time queries
- Already set up

**Cons:**
- Loki is a log system, not a metrics database
- Complex syntax for aggregations
- Limited statistical functions

**Example - Average Quiz Generation Time:**

```logql
avg_over_time(
  {app="saberloop", type="metric"}
  |= "quiz_generation"
  | json
  | unwrap data_value [1h]
)
```

**Challenges:**
- `unwrap` requires the field name to match exactly
- Nested JSON fields (like `data.value`) may need preprocessing
- Need to verify field names in actual log structure

---

### Option B: Export to CSV + Python Analysis

**Pros:**
- Full control over analysis
- Rich statistical libraries (pandas, numpy)
- Easy to create visualizations
- Can save/share analysis scripts

**Cons:**
- Manual export step
- Not real-time

**Workflow:**
1. Query logs in Grafana
2. Click **Download** button → Export as CSV/JSON
3. Analyze with Python script

**Example Script:**

```python
import json
import statistics
from collections import defaultdict

# Load exported logs
events = []
with open('telemetry-export.json') as f:
    for line in f:
        events.append(json.loads(line))

# Filter quiz_generation metrics
quiz_times = [
    e['data']['value']
    for e in events
    if e.get('type') == 'metric' and e.get('data', {}).get('name') == 'quiz_generation'
]

# Calculate statistics
if quiz_times:
    print(f"Count: {len(quiz_times)}")
    print(f"Average: {statistics.mean(quiz_times):.0f}ms")
    print(f"Median: {statistics.median(quiz_times):.0f}ms")
    print(f"Min: {min(quiz_times)}ms")
    print(f"Max: {max(quiz_times)}ms")
    print(f"Std Dev: {statistics.stdev(quiz_times):.0f}ms")

# Group by status (success/error)
by_status = defaultdict(list)
for e in events:
    if e.get('type') == 'metric' and e.get('data', {}).get('name') == 'quiz_generation':
        status = e['data'].get('status', 'unknown')
        by_status[status].append(e['data']['value'])

for status, times in by_status.items():
    print(f"\n{status.upper()}: {len(times)} requests, avg {statistics.mean(times):.0f}ms")
```

---

### Option C: Automated Analysis Script (Future)

Create a Node.js or Python script that:
1. Downloads logs from VPS automatically
2. Parses and analyzes
3. Outputs summary report

**Potential `npm run telemetry:report` command:**

```bash
# Download latest logs
# Parse JSONL files
# Generate summary:
#   - Quiz generation: avg 3.2s, 95% success rate
#   - Errors: 5 in last 24h
#   - Web Vitals: CLS good, LCP needs improvement
```

---

## Questions to Answer

### Performance
- [ ] What is the average quiz generation time?
- [ ] What percentage of requests fail?
- [ ] Are there patterns in failures (time of day, topics)?
- [ ] How long do timeouts take before failing?

### User Experience
- [ ] What errors do users encounter most?
- [ ] Are Web Vitals within acceptable ranges?
- [ ] Which pages/flows have issues?

### Trends
- [ ] Is performance improving or degrading over time?
- [ ] Do certain topics take longer to generate?
- [ ] Are there peak usage times?

---

## Next Steps

1. [ ] Collect more data (wait 1-2 weeks)
2. [ ] Choose analysis approach (A, B, or C)
3. [ ] Create reusable analysis script
4. [ ] Document findings and insights

---

## Notes

- Current data: 33 events (1 day of testing)
- Need more data for meaningful statistics
- Consider adding more telemetry points if needed
