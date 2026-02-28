@echo off
echo Starting Interview Questions Platform...
echo.
echo Starting Backend Server...
start cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting Desktop Application...
start cmd /k "cd desktop && npm start"
echo.
echo To start mobile app, run: cd mobile && npm start
echo.
pause

