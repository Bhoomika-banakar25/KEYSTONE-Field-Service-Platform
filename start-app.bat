@echo off
REM ManageByHR Application Startup Script
REM This script ensures clean startup by clearing port 9899 if needed

echo ================================
echo ManageByHR Startup Script
echo ================================
echo.

setlocal enabledelayedexpansion
set PORT=9899
set TIMEOUT=3

REM Check if port is in use
echo Checking port %PORT%...
netstat -ano | findstr ":%PORT%.*LISTENING" >nul

if errorlevel 1 (
    echo [OK] Port %PORT% is available
) else (
    echo [WARNING] Port %PORT% is in use - cleaning up...
    
    REM Get process ID listening on port
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%.*LISTENING"') do (
        set PID=%%a
        echo Stopping process ID: !PID!
        taskkill /PID !PID! /F >nul 2>&1
    )
    
    echo Waiting %TIMEOUT% seconds...
    timeout /t %TIMEOUT% /nobreak
)

echo.
echo Starting application...
echo.

cd /d d:\ManageByHR\ManageByHR
mvn clean spring-boot:run

echo.
echo Application stopped.
pause
