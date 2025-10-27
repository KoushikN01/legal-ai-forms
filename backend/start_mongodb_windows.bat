@echo off
echo Starting MongoDB for Windows...
echo.

REM Check if MongoDB is installed
where mongo >nul 2>nul
if %errorlevel% neq 0 (
    echo MongoDB is not installed or not in PATH
    echo.
    echo Please install MongoDB Community Server from:
    echo https://www.mongodb.com/try/download/community
    echo.
    echo Or use MongoDB Atlas (cloud database):
    echo https://www.mongodb.com/atlas
    echo.
    pause
    exit /b 1
)

REM Check if MongoDB service is running
sc query MongoDB >nul 2>nul
if %errorlevel% equ 0 (
    echo MongoDB service is already running
) else (
    echo Starting MongoDB service...
    net start MongoDB
    if %errorlevel% neq 0 (
        echo Failed to start MongoDB service
        echo Please check if MongoDB is properly installed
        pause
        exit /b 1
    )
)

echo.
echo Testing MongoDB connection...
mongo --eval "db.runCommand('ping')" --quiet
if %errorlevel% equ 0 (
    echo ✅ MongoDB is running successfully!
    echo.
    echo Connection details for Compass:
    echo Host: localhost
    echo Port: 27017
    echo Database: legal_voice
    echo Connection String: mongodb://localhost:27017/legal_voice
    echo.
    echo You can now connect to MongoDB Compass!
) else (
    echo ❌ MongoDB connection failed
    echo Please check MongoDB installation
)

pause
