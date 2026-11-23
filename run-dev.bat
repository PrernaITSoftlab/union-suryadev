@echo off
echo Starting MPVMAVAKS Union Backend Server (Port 5000) and Frontend (Port 3000)...
start "Union Backend Server" cmd /k "cd server && npm run dev"
start "Union Frontend Client" cmd /k "cd client && npm run dev"
echo Both services launched in separate windows!
