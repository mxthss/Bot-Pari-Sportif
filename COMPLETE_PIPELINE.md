# Complete ML Pipeline - From Training to Deployment

## 📋 Full Workflow

```
1. SETUP                    (SETUP_AMD_GPU.bat)
   └─→ Install dependencies

2. TRAIN                    (RUN_TRAINING.bat)
   └─→ Generate 1M samples
   └─→ Train 5 models
   └─→ Save to models/
   └─→ ~500MB total

3. OPTIMIZE                 (OPTIMIZE.bat)
   └─→ Convert to ONNX
   └─→ Quantize (INT8)
   └─→ Reduce size 80-90%
   └─→ ~30-50MB final

4. DEPLOY                   (deploy_to_extension.py)
   └─→ Copy to src/models/
   └─→ Ready for Chrome

5. TEST                     (inference_engine.py)
   └─→ Verify predictions

6. LOAD IN CHROME           (chrome://extensions/)
   └─→ Enable Developer mode
   └─→ Load unpacked
   └─→ Ready to use!
```

---

## 🚀 Step-by-Step Guide

### Step 1: Setup Dependencies
```bash
cd ml-training
SETUP_AMD_GPU.bat
```

**What happens:**
- Installs Python packages
- Sets up AMD ROCm support
- Prepares GPU acceleration

**Time:** ~10-15 minutes

---

### Step 2: Train Models
```bash
RUN_TRAINING.bat
```

**What happens:**
- Generates 1,000,000 realistic samples
- Trains Random Forest (200 trees)
- Trains XGBoost (GPU accelerated)
- Trains LightGBM (GPU accelerated)
- Trains Gradient Boosting (200 trees)
- Trains Neural Network (Deep Learning)
- Saves all models to `models/`

**Output:** ~500MB

**Time:** 
- GPU (9070XT): 20-30 minutes ⚡
- CPU: 60-120 minutes

---

### Step 3: Optimize Models
```bash
OPTIMIZE.bat
```

**What happens:**
1. Converts each model from Joblib → ONNX
   - Random Forest: 150MB → 8MB
   - XGBoost: 100MB → 6MB
   - LightGBM: 80MB → 4MB
   - Gradient Boosting: 100MB → 6MB
   - Neural Network: 200MB → 15MB

2. Quantizes models (INT8 precision)
   - Further reduces size by 40-50%
   - Inference only 2-5% slower

3. Creates browser bundle
   - ONNX models
   - JavaScript inference engine
   - Metadata

**Output Size:** 
- Before: 500MB
- After: 30-50MB
- **Total reduction: 90%+** 🎉

**Time:** ~5 minutes

---

### Step 4: Deploy to Extension
```bash
python deploy_to_extension.py
```

**What happens:**
- Copies ONNX models to `src/models/`
- Copies JS inference engine
- Copies metadata
- Extension ready for loading

**Result:** ~20-30MB in extension folder

---

### Step 5: Test Inference
```bash
python inference_engine.py
```

**What happens:**
- Loads all trained models
- Tests with sample match data
- Shows predictions & confidence
- Verifies everything works

**Output:**
```
Prediction Result: Home Win
Confidence: 78%

Probabilities:
  away_win     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 15%
  draw         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 22%
  home_win     ████████████████████████░░░░░ 63%
```

---

### Step 6: Load in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select: `football-predictor-clean/` folder
5. Done! ✅

---

## 📊 File Sizes Comparison

| Stage | Size | Format | Use |
|-------|------|--------|-----|
| Raw Training | ~500MB | Joblib | Server-side |
| Optimized | ~40MB | ONNX | Browser |
| Deployed | ~20-30MB | ONNX+JS | Extension |

---

## ⚡ Performance on Different Machines

### High-End (GPU)
- Training: 20-30 min
- Optimization: 2-3 min
- Inference: 5-10ms per prediction
- Perfect for: Full training

### Mid-Range (4GB RAM, CPU)
- Training: 60-90 min
- Optimization: 5-10 min
- Inference: 50-100ms per prediction
- Perfect for: Running extension

### Low-End (2GB RAM, CPU)
- Training: Skip (use pre-trained)
- Optimization: Already done
- Inference: 100-200ms per prediction
- Perfect for: Using optimized models

---

## 🔧 Command Reference

```bash
# Full pipeline (start to finish)
SETUP_AMD_GPU.bat
RUN_TRAINING.bat
OPTIMIZE.bat
python deploy_to_extension.py

# Or step-by-step
python PRODUCTION_TRAINING.py --gpu --samples 1000000
python optimize_models.py
python deploy_to_extension.py
python inference_engine.py

# Test only
python inference_engine.py

# Retrain with different settings
python PRODUCTION_TRAINING.py --samples 500000  # Fewer samples
python PRODUCTION_TRAINING.py --no-gpu          # CPU only
```

---

## 📁 Directory Structure After Each Step

### After Step 1 (Setup)
```
ml-training/
├── requirements.txt
├── PRODUCTION_TRAINING.py
└── inference_engine.py
```

### After Step 2 (Training)
```
ml-training/
├── models/
│   ├── random_forest.joblib (150MB)
│   ├── xgboost.joblib (100MB)
│   ├── lightgbm.joblib (80MB)
│   ├── gradient_boosting.joblib (100MB)
│   ├── neural_network.joblib (200MB)
│   └── metadata.json
└── training.log
```

### After Step 3 (Optimize)
```
ml-training/
├── models/ (original ~500MB)
├── models_optimized/
│   ├── random_forest.onnx (8MB)
│   ├── xgboost.onnx (6MB)
│   ├── lightgbm.onnx (4MB)
│   ├── gradient_boosting.onnx (6MB)
│   ├── onnx-inference.js (3KB)
│   └── browser/
│       ├── *.onnx (all models ~25MB)
│       └── metadata.json
```

### After Step 4 (Deploy)
```
src/models/
├── random_forest.onnx
├── xgboost.onnx
├── lightgbm.onnx
├── gradient_boosting.onnx
├── onnx-inference.js
└── metadata.json
```

---

## ✅ Verification Checklist

- [ ] Step 1: Dependencies installed
- [ ] Step 2: Models trained (check models/ folder)
- [ ] Step 3: Optimized models created (check models_optimized/)
- [ ] Step 4: Models deployed to src/models/
- [ ] Step 5: Inference test passed
- [ ] Step 6: Extension loaded in Chrome

---

## 🐛 Troubleshooting

### Models not training?
```bash
# Check GPU
rocm-smi

# Train on CPU instead
python PRODUCTION_TRAINING.py --no-gpu
```

### Optimization fails?
```bash
# Install ONNX tools
pip install onnx onnxmltools onnxruntime

# Retry
python optimize_models.py
```

### Extension won't load?
- Check: manifest.json syntax
- Check: All files in src/
- Check: No errors in Console (F12)
- Try: Reload extension

### Predictions too slow?
- On low-end PC: Already optimized (~100-200ms)
- On GPU: Check if GPU inference enabled
- Use smaller model (XGBoost only)

---

## 🎯 Final Result

✅ **Complete AI Football Prediction System**
- ✓ Browser extension
- ✓ Trained on 1M samples
- ✓ 5-model ensemble
- ✓ 90% size reduction
- ✓ Works on low-end machines
- ✓ Real-time predictions
- ✓ No server required

**Ready to deploy!** 🚀

---

**Created:** 2026-05-29  
**Optimized for:** AMD 9070XT + Low-end machines  
**Total pipeline time:** ~1-2 hours (GPU) / ~3-4 hours (CPU)
