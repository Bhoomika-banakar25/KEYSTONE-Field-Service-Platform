# PowerShell script to start the ManageByHR application on PORT 9899 (TERMINAL)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KEYSTONE Field Service Management App" -ForegroundColor Cyan
Write-Host "Terminal Startup (Port 9899)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Kill all Java and Eclipse processes
Write-Host "`n[1/4] Killing any existing processes..." -ForegroundColor Yellow
Get-Process java, javaw, eclipse* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Kill any process on port 9899
Write-Host "[2/4] Clearing port 9899..." -ForegroundColor Yellow
$processes = netstat -ano | Select-String ':9899'
if ($processes) {
    $processes | ForEach-Object {
        $parts = $_.ToString().Split()
        $pid = $parts[-1]
        Write-Host "  → Killing PID $pid" -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}

# Wait for port to be released
Write-Host "[3/4] Waiting for port to be released..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Verify port is free
$check = netstat -ano | Select-String ':9899'
if ($check) {
    Write-Host "ERROR: Port 9899 is still in use!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Port 9899 is free" -ForegroundColor Green

# Start the app
Write-Host "`n[4/4] Starting ManageByHR application..." -ForegroundColor Yellow
Write-Host "  URL: http://localhost:9899" -ForegroundColor Cyan
Write-Host "  Login: manager@gmail.com / 123456" -ForegroundColor Cyan
Write-Host "`n" -ForegroundColor Yellow

cd "$PSScriptRoot"
mvn clean spring-boot:run
