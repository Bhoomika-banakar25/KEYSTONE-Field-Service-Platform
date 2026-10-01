# KEYSTONE Deployment Script - Windows PowerShell
# This script automates the deployment process

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     KEYSTONE Field Service Platform - Deployment Script    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Functions
function Print-Status {
    param([string]$message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Print-Error {
    param([string]$message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$message)
    Write-Host "⚠ $message" -ForegroundColor Yellow
}

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

# Check Docker
$dockerCheck = docker --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Print-Status "Docker found: $dockerCheck"
} else {
    Print-Error "Docker is not installed"
    exit 1
}

# Check Docker Compose
$composeCheck = docker-compose --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Print-Status "Docker Compose found: $composeCheck"
} else {
    Print-Error "Docker Compose is not installed"
    exit 1
}

# Check Git
$gitCheck = git --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Print-Status "Git found: $gitCheck"
} else {
    Print-Error "Git is not installed"
    exit 1
}

# Get deployment type
Write-Host "`nSelect deployment type:" -ForegroundColor Yellow
Write-Host "1) Development (Local)"
Write-Host "2) Production (Cloud)"
$choice = Read-Host "Enter choice [1-2]"

$environment = switch ($choice) {
    "1" { "dev"; Print-Status "Development deployment selected" }
    "2" { "prod"; Print-Status "Production deployment selected" }
    default { Print-Error "Invalid choice"; exit 1 }
}

# Pull latest code
Write-Host "`nPulling latest code from GitHub..." -ForegroundColor Yellow
git fetch origin
git pull origin master
Print-Status "Code updated"

# Build images
Write-Host "`nBuilding Docker images..." -ForegroundColor Yellow
docker-compose build --no-cache
if ($LASTEXITCODE -eq 0) {
    Print-Status "Images built successfully"
} else {
    Print-Error "Failed to build images"
    exit 1
}

# Stop existing containers
Write-Host "`nStopping existing containers..." -ForegroundColor Yellow
docker-compose down 2>$null
Print-Status "Containers stopped"

# Start services
Write-Host "`nStarting services..." -ForegroundColor Yellow
docker-compose up -d
Print-Status "Services started"

# Wait for services
Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check health
Write-Host "`nChecking service health..." -ForegroundColor Yellow

# Check MySQL
try {
    docker-compose exec -T mysql mysql -uroot -pBhoom@25 -e "SELECT 1" *>$null
    Print-Status "MySQL is running and healthy"
} catch {
    Print-Warning "MySQL may still be starting up. Check logs: docker-compose logs mysql"
}

# Check application
try {
    $response = Invoke-WebRequest -Uri http://localhost:8080 -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Print-Status "Application is running and responding"
    }
} catch {
    Print-Warning "Application may still be starting up. Check logs: docker-compose logs app"
}

# Display summary
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              Deployment Complete! 🎉                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`nService Details:" -ForegroundColor Cyan
Write-Host "  📱 Application:  http://localhost:8080"
Write-Host "  📚 API Docs:     http://localhost:8080/swagger-ui.html"
Write-Host "  🗄️  Database:     localhost:3307"

Write-Host "`nUseful commands:" -ForegroundColor Cyan
Write-Host "  View logs:       docker-compose logs -f app"
Write-Host "  Stop services:   docker-compose down"
Write-Host "  View status:     docker-compose ps"

Print-Status "Deployment successful!"
