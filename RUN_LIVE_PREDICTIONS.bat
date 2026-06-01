@echo off
REM Get live football data and make predictions
REM Real data from internet APIs

cd /d "C:\Users\matab\Documents\bot pari\football-predictor-clean\ml-training"

echo.
echo ════════════════════════════════════════════════════════════════
echo 🔴 LIVE FOOTBALL PREDICTIONS - REAL DATA FROM INTERNET
echo ════════════════════════════════════════════════════════════════
echo.
echo Step 1: Fetching live match data...
echo.

python live_data_fetcher.py

echo.
echo Step 2: Making predictions...
echo.

python live_inference_engine.py

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ Complete! Check predictions.json for results
echo ════════════════════════════════════════════════════════════════
echo.
pause
