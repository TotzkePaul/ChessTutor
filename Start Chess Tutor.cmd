@echo off
cd /d "%~dp0"
node scripts/serve-offline.cjs --open
pause
