@echo off
REM Quick optimization script
REM Converts trained models to lightweight ONNX format

echo.
echo ================================================
echo  MODEL OPTIMIZATION FOR LIGHTWEIGHT DEPLOYMENT
echo ================================================
echo.
echo This script will:
echo   1. Convert models from Joblib to ONNX
echo   2. Quantize to INT8 (smaller + faster)
echo   3. Create browser-ready bundle
echo   4. Reduce size by 80-90%%
echo.

python optimize_models.py

echo.
echo ================================================
echo  Optimization Complete!
echo ================================================
echo.
echo Output directory: models_optimized\browser\
echo.
echo Models are now ready for:
echo   - Browser deployment (Chrome Extension)
echo   - Low-end machines (< 4GB RAM)
echo   - Mobile devices
echo.
pause
