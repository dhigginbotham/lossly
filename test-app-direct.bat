@echo off
echo === Direct App Test ===
echo.
echo This will test the app directly without complex E2E setup.
echo.

cd /d "%~dp0"

echo 1. Opening the app in browser mode first...
echo.
start http://localhost:5173
timeout /t 3

echo.
echo 2. Please check in the browser:
echo    - Can you see the app?
echo    - Go to Batch tab
echo    - Open DevTools (F12)
echo    - Check Console tab for errors
echo.
echo 3. In the Console, type:
echo    window.api
echo.
echo    If it shows "undefined", the preload script isn't working.
echo    If it shows an object, the preload is working.
echo.
echo 4. Also check:
echo    - Can you drag files to the batch area?
echo    - What errors appear in console?
echo.
pause
