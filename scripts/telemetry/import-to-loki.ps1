# Import Telemetry Logs to Loki
# Usage: .\scripts\telemetry\import-to-loki.ps1 [-InputDir ".\telemetry-logs"]
#
# Reads .jsonl files and pushes them to local Loki instance.
# Loki must be running: docker-compose -f docker-compose.telemetry.yml up -d

param(
    [string]$InputDir = ".\telemetry-logs",
    [string]$LokiUrl = "http://localhost:3100"
)

Write-Host "=== Importing Telemetry to Loki ===" -ForegroundColor Cyan
Write-Host "Input: $InputDir"
Write-Host "Loki: $LokiUrl"
Write-Host ""

# Check if Loki is running
try {
    $null = Invoke-RestMethod -Uri "$LokiUrl/ready" -TimeoutSec 5
    Write-Host "Loki is ready" -ForegroundColor Green
} catch {
    Write-Error "Loki is not running. Start it with: docker-compose -f docker-compose.telemetry.yml up -d"
    exit 1
}

# Get all .jsonl files
$files = Get-ChildItem -Path $InputDir -Filter "*.jsonl" -ErrorAction SilentlyContinue

if ($files.Count -eq 0) {
    Write-Host "No .jsonl files found in $InputDir"
    Write-Host "Run download.ps1 first to get logs from VPS"
    exit 0
}

Write-Host "Found $($files.Count) log file(s)"
Write-Host ""

$totalEvents = 0
$importedEvents = 0

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow

    # Read file line by line
    $lines = Get-Content $file.FullName

    # Batch events for Loki push
    $batch = @()
    $batchSize = 100

    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }

        try {
            $event = $line | ConvertFrom-Json
            $totalEvents++

            # Convert to Loki format
            # Loki expects: [[timestamp_ns, line], ...]
            $timestamp = [DateTimeOffset]::Parse($event.timestamp).ToUnixTimeMilliseconds() * 1000000  # ns

            $batch += @{
                ts = $timestamp
                line = $line
                labels = @{
                    app = "saberloop"
                    type = $event.type
                    sessionId = $event.sessionId
                }
            }

            # Push batch when full
            if ($batch.Count -ge $batchSize) {
                Push-ToLoki -Batch $batch -LokiUrl $LokiUrl
                $importedEvents += $batch.Count
                $batch = @()
                Write-Host "  Imported $importedEvents events..." -ForegroundColor DarkGray
            }
        } catch {
            Write-Host "  Skipped invalid line: $($_.Exception.Message)" -ForegroundColor DarkYellow
        }
    }

    # Push remaining events
    if ($batch.Count -gt 0) {
        Push-ToLoki -Batch $batch -LokiUrl $LokiUrl
        $importedEvents += $batch.Count
    }

    Write-Host "  Done: $($lines.Count) lines processed" -ForegroundColor Green
}

function Push-ToLoki {
    param($Batch, $LokiUrl)

    # Group by labels
    $streams = @{}
    foreach ($entry in $Batch) {
        $labelKey = "$($entry.labels.app)|$($entry.labels.type)"
        if (-not $streams.ContainsKey($labelKey)) {
            $streams[$labelKey] = @{
                stream = $entry.labels
                values = @()
            }
        }
        $streams[$labelKey].values += ,@("$($entry.ts)", $entry.line)
    }

    $payload = @{
        streams = $streams.Values
    } | ConvertTo-Json -Depth 10 -Compress

    try {
        Invoke-RestMethod -Uri "$LokiUrl/loki/api/v1/push" `
            -Method Post `
            -ContentType "application/json" `
            -Body $payload `
            -TimeoutSec 30 | Out-Null
    } catch {
        Write-Host "  Push failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Import Complete ===" -ForegroundColor Green
Write-Host "Total events: $totalEvents"
Write-Host "Imported: $importedEvents"
Write-Host ""
Write-Host "View in Grafana: http://localhost:3000"
Write-Host "  Default login: admin / admin"
Write-Host "  Go to Explore > Select Loki > Query logs"
