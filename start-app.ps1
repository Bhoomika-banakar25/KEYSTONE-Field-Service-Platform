# ManageByHR Application Startup Script
# This script ensures clean startup by clearing port 9899 if needed

Write-Host "================================"
Write-Host "ManageByHR Startup Script"
Write-Host "================================"
Write-Host ""

# Define port
$PORT = 9899
$TIMEOUT = 5

# Function to kill process on port
function Kill-PortProcess {
    param($port)
    
    $processes = netstat -ano | Select-String "$port" | Select-String "LISTENING"
    
    if ($processes) {
        Write-Host "⚠️  Port $port is in use. Cleaning up..." -ForegroundColor Yellow
        
        foreach ($line in $processes) {
            $parts = $line -split '\s+' | Where-Object { $_ }
            $pid = $parts[-1]
            
            if ($pid -and $pid -match '^\d+$') {
                try {
                    Write-Host "   Stopping process ID: $pid"
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Seconds 1
                } catch {
                    Write-Host "   ⚠️  Could not stop process $pid (may require admin privileges)" -ForegroundColor Yellow
                }
            }
        }
        
        Write-Host "   Waiting $TIMEOUT seconds for cleanup..." -ForegroundColor Gray
        Start-Sleep -Seconds $TIMEOUT
    } else {
        Write-Host "✓ Port $port is available" -ForegroundColor Green
    }
}

# Check and clean port
Kill-PortProcess $PORT

Write-Host ""
Write-Host "Starting application..." -ForegroundColor Cyan
Write-Host ""

# Start the application
cd d:\ManageByHR\ManageByHR
mvn clean spring-boot:run

# Handle cleanup on exit
Write-Host ""
Write-Host "Application stopped." -ForegroundColor Yellow
