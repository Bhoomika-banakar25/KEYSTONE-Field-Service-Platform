#!/bin/bash

# KEYSTONE Deployment Script - Unix/Linux/Mac
# This script automates the deployment process

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     KEYSTONE Field Service Platform - Deployment Script    ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo ""
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_status "Docker found"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi
print_status "Docker Compose found"

if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    exit 1
fi
print_status "Git found"

# Get deployment type
echo ""
echo "Select deployment type:"
echo "1) Development (Local)"
echo "2) Production (Cloud)"
read -p "Enter choice [1-2]: " DEPLOY_TYPE

case $DEPLOY_TYPE in
    1)
        print_status "Development deployment selected"
        ENVIRONMENT="dev"
        ;;
    2)
        print_status "Production deployment selected"
        ENVIRONMENT="prod"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Pull latest code
echo ""
echo "Pulling latest code from GitHub..."
git fetch origin
git pull origin master
print_status "Code updated"

# Build images
echo ""
echo "Building Docker images..."
docker-compose build --no-cache
print_status "Images built"

# Stop existing containers
echo ""
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true
print_status "Containers stopped"

# Start services
echo ""
echo "Starting services..."
docker-compose up -d
print_status "Services started"

# Wait for services to be ready
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check health
echo ""
echo "Checking service health..."

# Check if MySQL is responding
if docker-compose exec -T mysql mysql -uroot -pBhoom@25 -e "SELECT 1" &>/dev/null; then
    print_status "MySQL is running and healthy"
else
    print_warning "MySQL may still be starting up. Check logs: docker-compose logs mysql"
fi

# Check if app is responding
if curl -s http://localhost:8080 &>/dev/null; then
    print_status "Application is running and responding"
else
    print_warning "Application may still be starting up. Check logs: docker-compose logs app"
fi

# Display summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              Deployment Complete! 🎉                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Service Details:"
echo "  📱 Application:  http://localhost:8080"
echo "  📚 API Docs:     http://localhost:8080/swagger-ui.html"
echo "  🗄️  Database:     localhost:3307"
echo ""
echo "Useful commands:"
echo "  View logs:       docker-compose logs -f app"
echo "  Stop services:   docker-compose down"
echo "  View status:     docker-compose ps"
echo ""
print_status "Deployment successful!"
