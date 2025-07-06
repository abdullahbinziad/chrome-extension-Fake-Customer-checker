@echo off
setlocal enabledelayedexpansion

REM Fake Order Checker Chrome Extension Installation Script for Windows
REM This script helps users install the Chrome extension on Windows

echo ================================
echo   Fake Order Checker Extension  
echo ================================
echo Version: 1.0.0
echo Directory: %~dp0
echo.

REM Check if Chrome is installed
echo Checking Chrome installation...
set "CHROME_PATH="

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
    echo ✓ Chrome found: !CHROME_PATH!
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    echo ✓ Chrome found: !CHROME_PATH!
) else (
    echo ✗ Chrome not found in standard locations
    echo Please install Chrome first or ensure it's in your PATH
    pause
    exit /b 1
)

REM Validate required files
echo.
echo Validating extension files...
set "missing_files="

for %%f in (manifest.json popup.html popup.css popup.js content.js content.css background.js) do (
    if not exist "%%f" (
        echo ✗ %%f (missing)
        set "missing_files=1"
    ) else (
        echo ✓ %%f
    )
)

if not exist "icons" (
    echo ✗ icons directory (missing)
    set "missing_files=1"
) else (
    echo ✓ icons directory
)

if defined missing_files (
    echo.
    echo Missing required files. Please ensure all files are present.
    pause
    exit /b 1
)

echo ✓ All required files found

REM Validate manifest.json
echo.
echo Validating manifest.json...
powershell -Command "try { $null = Get-Content 'manifest.json' | ConvertFrom-Json; Write-Host '✓ manifest.json is valid JSON' } catch { Write-Host '✗ manifest.json is not valid JSON'; exit 1 }"

if errorlevel 1 (
    echo ✗ manifest.json validation failed
    pause
    exit /b 1
)

REM Open Chrome extensions page
echo.
echo Opening Chrome extensions page...
start "" "chrome://extensions/"

REM Show installation instructions
echo.
echo ================================
echo   Installation Instructions     
echo ================================
echo.
echo 1. Enable Developer Mode
echo    • Toggle 'Developer mode' in the top right corner
echo.
echo 2. Load the Extension
echo    • Click 'Load unpacked'
echo    • Select this directory: %~dp0
echo.
echo 3. Pin the Extension
echo    • Click the puzzle piece icon in Chrome toolbar
echo    • Find 'Fake Order Checker' and click the pin icon
echo.
echo 4. Test the Extension
echo    • Go to any website with phone numbers
echo    • Select a phone number and right-click
echo    • Choose 'Check with Fake Order Checker'
echo.
echo ================================
echo   Usage Tips                    
echo ================================
echo.
echo • Right-click any phone number to check it instantly
echo • Use the extension popup for manual phone number entry
echo • The extension works on all websites
echo • Results open in a new tab on flexsoftr.com
echo.
echo ================================
echo   Troubleshooting               
echo ================================
echo.
echo If the extension doesn't work:
echo • Make sure Developer mode is enabled
echo • Try reloading the extension
echo • Check the browser console for errors
echo • Ensure the extension has necessary permissions
echo.
echo Installation script completed!
pause 