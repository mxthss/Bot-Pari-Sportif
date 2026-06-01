@echo off
REM ⚽ FOOTBALL PREDICTOR - CHROME DEPLOYMENT GUIDE
REM Copy this terminal output and follow the steps

cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║        ⚽ CHROME EXTENSION DEPLOYMENT - FOLLOW THESE STEPS    ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo 🟦 STEP 1: OPEN CHROME EXTENSIONS PAGE
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   1. Open Chrome browser
echo   2. In the address bar, type: chrome://extensions/
echo   3. Press Enter
echo.
pause

cls
echo 🟦 STEP 2: ENABLE DEVELOPER MODE
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   1. Look at the TOP RIGHT corner of the extensions page
echo   2. Find the toggle switch labeled "Developer mode"
echo   3. Click it to turn it ON (it will turn BLUE)
echo.
pause

cls
echo 🟦 STEP 3: CLICK "LOAD UNPACKED"
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   1. Look at the TOP LEFT of the extensions page
echo   2. You'll see a blue button that says "Load unpacked"
echo   3. Click on it
echo.
pause

cls
echo 🟦 STEP 4: SELECT THE PROJECT FOLDER
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   A folder picker will open. Navigate to:
echo.
echo   C:\Users\matab\Documents\bot pari\football-predictor-clean
echo.
echo   Then click "Select Folder"
echo.
pause

cls
echo 🟦 STEP 5: EXTENSION LOADS!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   The extension will now appear in your extensions list!
echo   You should see it load successfully.
echo.
echo   ✅ Extension installed in Chrome
echo.
pause

cls
echo 🟦 STEP 6: TEST THE UI
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   1. Look at the TOP RIGHT of Chrome
echo   2. Find the blue soccer ball icon: ⚽ (or extension icon)
echo   3. Click on it
echo.
echo   ✨ YOUR POPUP WILL APPEAR ✨
echo.
echo   You should see:
echo     • Header: "⚽ FOOTBALL AI"
echo     • Statistics panel
echo     • Filter buttons
echo     • Match cards with predictions
echo     • Confidence percentages
echo.
pause

cls
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║              ✅ DEPLOYMENT COMPLETE!                         ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 📊 WHAT YOU SHOULD SEE IN THE POPUP:
echo.
echo   ⚽ FOOTBALL AI
echo   Prédictions temps réel • 82% précision        [🔄]
echo.
echo   [🎯 Matchs: 12] [📊 Confiance: 90%] [⏱️ Maj.: 14:32]
echo.
echo   [Tous] [Victoire Domicile] [Match Nul] [Victoire Extérieur]
echo.
echo   ┌────────────────────────────────────────┐
echo   │ Premier League  📅 02 juin 15:00       │
echo   │                                        │
echo   │  Manchester City  vs  Liverpool        │
echo   │                                        │
echo   │ Prédiction: 🏠 Victoire Domicile       │
echo   │ Confiance:  84%  ████████░░░░          │
echo   └────────────────────────────────────────┘
echo.
echo ✅ If you see this, the UI is working perfectly!
echo.
echo 🎯 FEATURES TO TEST:
echo   ✅ Click filter buttons → matches update
echo   ✅ Click 🔄 refresh button → reloads predictions
echo   ✅ Hover over matches → cards highlight
echo   ✅ See confidence bars → visual indicators
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📝 NOTES:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1. Demo data shows automatically if no predictions exist
echo    To use REAL predictions, run:
echo.
echo    cd "C:\Users\matab\Documents\bot pari\football-predictor-clean\ml-training"
echo    python live_inference_engine.py
echo.
echo 2. Extension auto-refreshes every 10 minutes
echo.
echo 3. To reload extension after making changes:
echo    - Go to chrome://extensions/
echo    - Find the extension
echo    - Click the refresh icon
echo.
echo ═══════════════════════════════════════════════════════════════
echo                 🎉 YOU'RE ALL SET! 🎉
echo ═══════════════════════════════════════════════════════════════
echo.
pause
