@echo off
title AI Resume Analyzer Launcher
echo ========================================================
echo  Launching Full-Stack AI Resume Analyzer
echo ========================================================
echo.

:: Ensure ports 8080 and 5173 are free
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo 1. Starting Backend (Spring Boot on port 8080)...
start "Backend (Spring Boot)" /D "%~dp0backend" cmd /k "set JAVA_HOME=C:\Program Files\Java\jdk-20&& mvnw.cmd spring-boot:run"

echo 2. Starting Frontend (Vite + React on port 5173)...
start "Frontend (Vite + React)" /D "%~dp0frontend" cmd /k "npm run dev"

echo.
echo ========================================================
echo  Both servers are starting up!
echo  Wait ~15-20 seconds for the Backend to start, then open:
echo.
echo     http://localhost:5173
echo ========================================================
echo.
pause
