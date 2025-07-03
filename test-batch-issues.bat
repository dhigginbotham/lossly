@echo off
echo === Testing Lossly Batch Processing Issues ===
echo.
echo This script will help verify the batch processing problems.
echo Make sure npm run dev is running before continuing.
echo.
pause

echo.
echo Running manual test helper...
echo.

cd /d "%~dp0"
npx electron tests/manual-batch-test.js

echo.
echo === Manual Testing Steps ===
echo.
echo 1. The app should open with DevTools
echo 2. It should navigate to the Batch view automatically
echo 3. Drag 5 images from your Desktop to the batch area
echo 4. Check the console for:
echo    - File sizes (should NOT be "0 Bytes")
echo    - Run: checkBatchStats() after processing
echo    - Run: checkForInvalidText() to find NaN/undefined
echo.
echo 5. Start batch processing and verify:
echo    - All 5 files complete (not 4/5)
echo    - No "NaN undefined" in history
echo.
pause
