@echo off
title KharchaKart Keep-Alive Pinger (5 min)
echo ========================================================
echo   KharchaKart Render Keep-Alive Automation
echo   Prevents cold start / 'Application loading...' screen
echo ========================================================
echo.
node scripts\keep-alive.js
pause
