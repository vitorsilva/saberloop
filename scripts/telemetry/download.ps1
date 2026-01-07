# Download Telemetry Logs from VPS
# Usage: .\scripts\telemetry\download.ps1 [-Days 7]
#
# Downloads .jsonl files from saberloop.com/telemetry/logs/
# Requires: WinSCP or similar FTP client, or uses curl/wget

param(
    [int]$Days = 7,
    [string]$OutputDir = ".\telemetry-logs"
)

# Load environment variables from .env
$envFile = Join-Path $PSScriptRoot "..\..\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

$FtpHost = $env:FTP_HOST
$FtpUser = $env:FTP_USER
$FtpPassword = $env:FTP_PASSWORD

if (-not $FtpHost -or -not $FtpUser -or -not $FtpPassword) {
    Write-Error "FTP credentials not found. Set FTP_HOST, FTP_USER, FTP_PASSWORD in .env"
    exit 1
}

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

Write-Host "=== Downloading Telemetry Logs ===" -ForegroundColor Cyan
Write-Host "Host: $FtpHost"
Write-Host "Output: $OutputDir"
Write-Host "Days: $Days"
Write-Host ""

# Calculate date range
$cutoffDate = (Get-Date).AddDays(-$Days).ToString("yyyy-MM-dd")
Write-Host "Downloading logs from $cutoffDate to today..."

# Use WinSCP if available, otherwise provide instructions
$winscp = Get-Command winscp.com -ErrorAction SilentlyContinue
$winscpPath = "$env:LOCALAPPDATA\Programs\WinSCP\WinSCP.com"

# Check default winget install location if not in PATH
if (-not $winscp -and (Test-Path $winscpPath)) {
    $winscp = $winscpPath
}

if ($winscp) {
    # WinSCP script for downloading
    $script = @"
open ftp://${FtpUser}:${FtpPassword}@${FtpHost}
cd /telemetry/logs
lcd $OutputDir
mget telemetry-*.jsonl
exit
"@

    $scriptFile = [System.IO.Path]::GetTempFileName()
    $script | Out-File -FilePath $scriptFile -Encoding ASCII
    & $winscp /script="$scriptFile"
    Remove-Item $scriptFile
} else {
    Write-Host ""
    Write-Host "WinSCP not found. Manual download options:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Install WinSCP CLI"
    Write-Host "  winget install WinSCP.WinSCP"
    Write-Host ""
    Write-Host "Option 2: Use FileZilla or another FTP client"
    Write-Host "  Host: $FtpHost"
    Write-Host "  User: $FtpUser"
    Write-Host "  Path: /telemetry/logs/"
    Write-Host "  Download all .jsonl files to: $OutputDir"
    Write-Host ""
    Write-Host "Option 3: Use curl (if logs are accessible via HTTPS)"
    Write-Host "  curl -o $OutputDir/telemetry-$(Get-Date -Format 'yyyy-MM-dd').jsonl https://saberloop.com/telemetry/logs/..."
}

Write-Host ""
Write-Host "=== Download Complete ===" -ForegroundColor Green
