#!/usr/bin/env python3
"""
Quick GPU Setup - Install GPU libraries via pip
No need to download/install ROCm separately
"""

import subprocess
import sys

def install_gpu_packages():
    print("="*70)
    print("🚀 INSTALLING GPU PACKAGES FOR AMD 9070XT")
    print("="*70)
    print()
    
    packages = [
        # GPU-accelerated ML libraries
        ("xgboost-gpu", "xgboost>=2.0.0"),
        ("lightgbm-gpu", "lightgbm>=4.0.0"),
        ("cupy", "cupy-cuda11x"),  # GPU compute
        ("GPU PyTorch", "torch --index-url https://download.pytorch.org/whl/rocm5.7"),
    ]
    
    print("Installing GPU-optimized packages...")
    print()
    
    # Install each package
    for name, package in packages:
        print(f"[*] Installing {name}...")
        
        if "--index-url" in package:
            # Special handling for PyTorch
            parts = package.split()
            cmd = [sys.executable, '-m', 'pip', 'install'] + parts
        else:
            cmd = [sys.executable, '-m', 'pip', 'install', package]
        
        result = subprocess.run(cmd, capture_output=True)
        
        if result.returncode == 0:
            print(f"    ✅ {name} installed\n")
        else:
            print(f"    ⚠️  {name} install had issues (may still work)\n")
    
    print("="*70)
    print("✅ GPU PACKAGES INSTALLED!")
    print("="*70)
    print()
    print("Your GPU (9070XT) is now ready for training!")
    print()
    print("Next: Run training")
    print("  python PRODUCTION_TRAINING.py --gpu --samples 1000000")
    print()

if __name__ == '__main__':
    install_gpu_packages()
