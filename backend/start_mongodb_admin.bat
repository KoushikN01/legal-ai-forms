@echo off
echo Starting MongoDB Service...
echo.

REM Try to start MongoDB service with admin privileges
net start MongoDB
if %errorlevel% equ 0 (
    echo ✅ MongoDB service started successfully!
    echo.
    echo Connection details for Compass:
    echo Host: localhost
    echo Port: 27017
    echo Database: legal_voice
    echo Connection String: mongodb://localhost:27017/legal_voice
    echo.
    echo You can now connect to MongoDB Compass!
) else (
    echo ❌ Failed to start MongoDB service
    echo.
    echo Please run this script as Administrator:
    echo 1. Right-click on this file
    echo 2. Select "Run as administrator"
    echo 3. Click "Yes" when prompted
    echo.
    echo Or manually start MongoDB:
    echo 1. Open Command Prompt as Administrator
    echo 2. Run: net start MongoDB
)

echo.
pause
