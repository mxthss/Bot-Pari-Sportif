@echo off
REM 🚀 FULL PIPELINE LAUNCHER - One Click to Start Everything

REM Change to project root first
cd /d C:\Users\matab\Documents\bot pari\football-predictor-clean

cls
echo.
echo ════════════════════════════════════════════════════════════════════════════
echo  🚀 FOOTBALL PREDICTOR - FULL AUTOMATED PIPELINE
echo ════════════════════════════════════════════════════════════════════════════
echo.
echo This will automatically:
echo  ✓ Install dependencies
echo  ✓ Train 1M sample models on GPU
echo  ✓ Optimize models (90%% size reduction)
echo  ✓ Deploy to Chrome extension
echo  ✓ Test inference
echo.
echo Total time: ~45-60 minutes (GPU)
echo.
echo ════════════════════════════════════════════════════════════════════════════
echo.

REM Navigate to ml-training and run pipeline
cd ml-training
python LAUNCH_FULL_PIPELINE.py

echo.
echo ════════════════════════════════════════════════════════════════════════════
echo  🎉 PIPELINE LAUNCHER FINISHED
echo ════════════════════════════════════════════════════════════════════════════
echo.
pause
