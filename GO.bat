@echo off
REM 🚀 MASTER LAUNCHER - Start from anywhere!

REM Set working directory to this folder
setlocal enabledelayedexpansion
cd /d "%~dp0"

cls
echo.
echo ════════════════════════════════════════════════════════════════════════════
echo  🚀 FOOTBALL PREDICTOR - FULL AUTOMATED PIPELINE
echo ════════════════════════════════════════════════════════════════════════════
echo.
echo Current directory: %cd%
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
