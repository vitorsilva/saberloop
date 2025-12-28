# Issue #56: Remove IP Address from Telemetry

**GitHub**: https://github.com/vitorsilva/saberloop/issues/56
**Date**: 2025-12-28
**Reported by**: User
**Priority**: High (Privacy/Security)

## Problem Statement

The telemetry ingestion endpoint captures and stores the client's IP address with every telemetry event. This is a privacy concern as IP addresses are considered personally identifiable information (PII) in many jurisdictions (e.g., GDPR).

## Root Cause Analysis

In `php-api/telemetry/ingest.php`, lines 85-95:

```php
$clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
// ...
$event['_server'] = [
    'receivedAt' => $serverTime,
    'clientIp' => $clientIp,  // <-- Privacy issue
    'batchSentAt' => $data['sentAt'] ?? null,
];
```

The server extracts the client IP from request headers and stores it in the `_server.clientIp` field of each telemetry event.

## Solution Design

**Simple removal approach**: Remove the IP capture entirely from the telemetry endpoint.

The telemetry system already has:
- Session ID for correlating events from the same session
- Timestamp for temporal analysis
- User agent for basic client fingerprinting (if needed)

IP addresses are not necessary for the telemetry use cases (error tracking, performance metrics).

## Files to Change

1. `php-api/telemetry/ingest.php` - Remove IP capture and storage

## Implementation

1. ✅ Remove `$clientIp` variable assignment (line 85)
2. ✅ Remove `clientIp` from `_server` metadata object (line 93)

## Testing Plan

1. [ ] Unit test: Verify telemetry endpoint still works
2. [ ] Unit test: Verify no IP in response/stored data
3. [ ] Manual: Deploy to test environment and verify logs don't contain IP

## Notes

- This is a server-side only change
- No frontend changes needed
- Existing log files may still contain IPs (consider purging old logs)
