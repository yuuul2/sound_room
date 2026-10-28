@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 24 LTS from https://nodejs.org and run this file again.
  pause
  exit /b 1
)
echo SOUND ROOM - Android and iPhone device test
 echo Keep this window open. Connect your phone and computer to the same Wi-Fi.
if not exist node_modules\expo\package.json (
  call npm ci
  if errorlevel 1 (
    echo Installation failed. Check your Internet connection and try again.
    pause
    exit /b 1
  )
)
echo Open Expo Go on Android and scan the QR code below.
echo On iPhone, scan the QR code with Camera and open Expo Go.
call npm run start:lan
pause
