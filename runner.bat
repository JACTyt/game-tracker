@echo off
REM ============================================================
REM  GameVault dev launcher
REM  Opens Windows Terminal with three PowerShell tabs:
REM    1. Backend  - uvicorn (activates backend\venv)
REM    2. Frontend - npm start (ng serve on :4200)
REM    3. Git      - plain shell at repo root
REM  Double-click to run. Assumes deps are installed and
REM  backend\venv already exists.
REM ============================================================

where wt >nul 2>nul
if errorlevel 1 (
    echo Windows Terminal ^(wt.exe^) was not found.
    echo Install "Windows Terminal" from the Microsoft Store, then run this script again.
    pause
    exit /b 1
)

wt -w new ^
  new-tab --title "Backend" -d "%~dp0backend" powershell -NoExit -Command ".\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000" ^
  ; new-tab --title "Frontend" -d "%~dp0frontend" powershell -NoExit -ExecutionPolicy Bypass -Command "npm start" ^
  ; new-tab --title "Git" -d "%~dp0." powershell -NoExit
