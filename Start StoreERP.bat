@echo off
title StoreERP

echo ==========================================
echo              StoreERP
echo ==========================================
echo.

echo Starting backend server...
start "StoreERP Server" cmd /k "cd /d %~dp0server && npm start"

timeout /t 2 /nobreak >nul

echo Starting frontend...
start "StoreERP Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo StoreERP is starting.
echo Backend:  http://localhost:5000
echo Frontend: check the Vite window for the local URL.
echo.
pause
