@echo off
REM Quick start script for training
REM Football Predictor - AMD GPU Training

cd ml-training

echo.
echo ================================================
echo  FOOTBALL PREDICTOR - ML TRAINING
echo ================================================
echo.
echo Configuration:
echo   GPU: AMD 9070XT (ROCm enabled)
echo   Samples: 1,000,000
echo   Models: 5-model ensemble
echo.
echo Starting training...
echo.

python PRODUCTION_TRAINING.py --gpu --samples 1000000

echo.
echo ================================================
echo  Training Complete!
echo ================================================
echo.
echo Next: Test models with
echo   python inference_engine.py
echo.
pause
