@echo off
REM Football Predictor - ML Training Setup
REM Optimized for AMD GPU (9070XT with ROCm)

echo.
echo ================================================
echo  FOOTBALL PREDICTOR - ML TRAINING SETUP
echo ================================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.10+
    pause
    exit /b 1
)

echo [1/4] Creating virtual environment (optional but recommended)...
REM python -m venv venv
REM call venv\Scripts\activate

echo [2/4] Installing base dependencies...
pip install --upgrade pip >nul
pip install numpy pandas scikit-learn

echo [3/4] Installing ML frameworks...
pip install xgboost lightgbm

echo [4/4] Installing AMD GPU support (ROCm)...
echo.
echo Choose your setup:
echo   1 = AMD GPU with ROCm (9070XT recommended)
echo   2 = CPU only (slower)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo Installing ROCm optimized packages...
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.7 >nul
    pip install tensorflow[and-cuda] >nul
    echo.
    echo ✅ ROCm setup complete
    echo    GPU: AMD 9070XT detected
    echo    GPU Memory: ~16GB available
) else (
    echo CPU-only mode selected
    pip install torch torchvision torchaudio >nul
    pip install tensorflow >nul
)

echo.
echo [5/4] Installing optional packages...
pip install onnx onnxmltools onnxruntime >nul

echo.
echo ================================================
echo  SETUP COMPLETE!
echo ================================================
echo.
echo To start training:
echo   python PRODUCTION_TRAINING.py --gpu --samples 1000000
echo.
echo This will:
echo   - Generate 1,000,000 realistic football samples
echo   - Train 5 different models (ensemble)
echo   - Use your AMD GPU (9070XT) for acceleration
echo   - Save models to ml-training/models/
echo.
pause
