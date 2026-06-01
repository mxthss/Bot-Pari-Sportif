# 🚀 MASTER LAUNCHER - How to Run

## Option 1: From Anywhere (EASIEST)

Double-click any of these:
```
GO.bat                          (from project root)
ml-training/GO.bat              (from ml-training folder)
```

---

## Option 2: From Command Line

### From project root:
```bash
cd C:\Users\matab\Documents\bot pari\football-predictor-clean
GO.bat
```

### From ml-training folder:
```bash
cd C:\Users\matab\Documents\bot pari\football-predictor-clean\ml-training
GO.bat
```

### From anywhere with full path:
```bash
C:\Users\matab\Documents\bot pari\football-predictor-clean\GO.bat
```

---

## What It Does

1. **Automatically changes** to correct directory
2. **Navigates** to ml-training
3. **Runs** LAUNCH_FULL_PIPELINE.py
4. **Automates** everything:
   - Install dependencies
   - Train 1M samples on GPU
   - Optimize models (90% smaller)
   - Deploy to extension
   - Test inference

---

## Timeline

| Step | Time | What |
|------|------|------|
| Setup | 2 min | Verify files |
| Install | 5 min | Dependencies |
| **Train** | **20-30 min** | 🚀 GPU training |
| Optimize | 5 min | ONNX conversion |
| Deploy | 1 min | Copy to extension |
| Test | 1 min | Verify |
| **TOTAL** | **~35-45 min** | |

---

## After Completion

```
chrome://extensions/
↓
Enable "Developer mode"
↓
Click "Load unpacked"
↓
Select: C:\Users\matab\Documents\bot pari\football-predictor-clean
↓
✅ Extension loaded!
```

---

## Size Result

- Before: 500MB ❌
- After: 20MB ✅
- Reduction: **95%** 🎉

---

## Just Run It!

```
GO.bat
```

That's literally all you need to do! 🚀
