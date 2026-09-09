# ManageByHR - Quick Startup Guide

## ⚡ Fast Track - Start Application in 5 Seconds

### Windows Users (Recommended)

**Step 1:** Open Command Prompt/PowerShell in the project directory

**Step 2:** Run one of these commands:

```powershell
# Option A: PowerShell Script (Automatic cleanup)
.\start-app.ps1

# Option B: Batch File (Automatic cleanup)
start-app.bat

# Option C: Direct Maven (Manual if port conflict)
mvn spring-boot:run
```

**Step 3:** Wait for message: `Tomcat started on port 9899`

**Step 4:** Open browser: http://localhost:9899

---

## 📋 Default Credentials (Test)

### Manager Account
- Email: `manager@meridian.com`
- Password: `manager123`

### Dispatcher Account
- Email: `dispatcher@meridian.com`
- Password: `dispatcher123`

### Technician Account
- Email: `tech@meridian.com`
- Password: `tech123`

### Customer Accounts
- Email: `bharati@gmail.com` (ID: 7)
- Email: `prajwal@gmail.com` (ID: 8)
- Email: `siri@gmail.com` (ID: 9)
- Email: `gowri@gmail.com` (ID: 10)
- Password: `customer123` (all)

---

## 🔧 System Requirements

- **Java:** JDK 17+
- **Maven:** 3.6+
- **MySQL:** 8.0+ (running, database: `hr_emp_management`)
- **Port:** 9899 (must be available or script will auto-cleanup)

---

## ✅ Verification Checklist

After starting:

- [ ] No error messages in console
- [ ] See: `Tomcat started on port 9899 (http)`
- [ ] Browser loads: http://localhost:9899
- [ ] Login page displays (blue gradient, "ManageByHR" title)
- [ ] Can login with test credentials

---

## 🚨 Troubleshooting

### Error: "Port 9899 was already in use"

✅ **FIXED!** The startup scripts auto-cleanup. Try:

1. Use `start-app.ps1` or `start-app.bat` instead of `mvn spring-boot:run`
2. Wait 5 seconds, script will kill blocking process
3. Application starts automatically

### Error: "Cannot connect to MySQL"

**Check:**
```powershell
# Verify MySQL is running
netstat -ano | Select-String "3306"

# Expected: Shows "LISTENING" on port 3306
```

**Solution:** Start MySQL Server

### Error: "BUILD FAILURE"

```powershell
# Clean and rebuild
mvn clean compile
```

### Application Starts But Won't Load in Browser

**Wait:** Application takes 7-8 seconds to fully initialize

**Check Port:**
```powershell
netstat -ano | Select-String "9899" | Select-String "LISTENING"
```

---

## 📊 Architecture Ports

| Port | Service | Purpose |
|------|---------|---------|
| 9899 | Application | Web UI & API |
| 3306 | MySQL | Database |
| 35729 | LiveReload | Dev reload (auto-close) |

---

## 🛑 Stopping Application

### Clean Shutdown:
- **PowerShell/Batch:** Press `Ctrl+C` in terminal
- **IDE:** Use stop button
- **Manual:** Kill Java process (process cleanup scripts handle this)

### Force Kill (if needed):
```powershell
Get-Process java | Stop-Process -Force
```

---

## 📝 Common Tasks

### View Application Logs

```powershell
# Logs are printed to console during startup
# Scroll up to see full startup sequence
```

### Check Database Connection

```powershell
# MySQL connection test
mysql -u root -p -h localhost -e "SELECT VERSION();"
```

### Verify Port is Free

```powershell
netstat -ano | Select-String "9899"
# Should show nothing if port is free
```

### Clear Application Cache (if having issues)

```powershell
# Delete build artifacts
Remove-Item -Recurse -Force target

# Rebuild
mvn clean compile
```

---

## 🎯 Features by Role

### Manager
- View all work orders
- Assign technicians
- Manage customers & parts
- View reports & summary

### Dispatcher
- View assigned work orders
- Assign technicians
- Track work progress

### Technician
- View assigned work orders
- Update work status (NEW → ASSIGNED → IN_PROGRESS → COMPLETED)
- View customer details & location
- View & provide feedback
- See progress tracker timeline

### Customer
- Raise new work requests
- View request status & progress
- See assigned technician
- Provide feedback & star rating

---

## 🌟 Key Features

✅ Unified login (single form for all roles)  
✅ JWT-based authentication  
✅ Real-time status updates  
✅ Horizontal timeline progress tracker  
✅ Customer feedback system  
✅ Part inventory management  
✅ Time tracking  
✅ Status history audit trail  
✅ Responsive design  
✅ Professional UI with gradients  

---

## 📞 Support

**Port Issues?** → Use `start-app.ps1` or `start-app.bat`  
**Database Issues?** → Verify MySQL is running on localhost:3306  
**Application Won't Start?** → Check console for specific error messages  
**Credentials Wrong?** → Check `STARTUP-GUIDE.md` for test accounts  

---

## Quick Links

- **Application:** http://localhost:9899
- **API Docs:** http://localhost:9899/swagger-ui.html
- **Configuration:** `src/main/resources/application.properties`
- **Documentation:** See `PORT-FIX-SOLUTION.md` for detailed info

---

**Status:** ✅ Ready to Start  
**Last Updated:** September 9, 2026
