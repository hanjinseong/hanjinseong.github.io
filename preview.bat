@echo off
rem Double-click to preview the site locally at http://localhost:4173/
start "" http://localhost:4173/
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\serve.ps1" -Port 4173
