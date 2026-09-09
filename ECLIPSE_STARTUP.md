# Starting ManageByHR from Eclipse

## Issue
When starting from both Eclipse and Terminal, port 9899 conflicts occur.

## Solution
This project now has TWO profiles:

### 1. **Terminal Startup (Port 9899)** - Use this for presentations/demos
```powershell
.\start-terminal.ps1
```
- Kills all Java processes
- Clears port 9899
- Starts on PORT 9899

### 2. **Eclipse Startup (Port 9900)** - Use this for development
In Eclipse:
1. Right-click project → **Run Configurations**
2. Create new **Spring Boot** run config
3. Go to **Arguments** tab
4. Add to **VM arguments**:
   ```
   -Dspring.profiles.active=eclipse
   ```
5. Click **Run**

- Starts on PORT 9900
- No port conflicts
- Full development features

## Test Accounts
```
manager@gmail.com / 123456 (MANAGER)
dispatcher@example.com / password123 (DISPATCHER)
technician@example.com / password123 (TECHNICIAN)
```

## Quick Check
- Terminal running: http://localhost:9899
- Eclipse running: http://localhost:9900

Only run ONE at a time!

## If Port Still Conflicts
```powershell
# Kill all Java processes
Get-Process java, javaw -ErrorAction SilentlyContinue | Stop-Process -Force

# Check port
netstat -ano | Select-String ':9899'
```
