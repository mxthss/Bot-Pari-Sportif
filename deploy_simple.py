#!/usr/bin/env python3
"""
SIMPLIFIED DEPLOYMENT
Skip ONNX conversion, deploy joblib models directly
Joblib models work perfectly and are already optimized
"""

import shutil
import json
from pathlib import Path

def deploy_models():
    """Deploy models directly to extension"""
    
    print("="*70)
    print("📦 DEPLOYING MODELS TO EXTENSION")
    print("="*70)
    print()
    
    models_dir = Path('models')
    extension_models = Path('../src/models')
    
    if not models_dir.exists():
        print("❌ models/ directory not found!")
        print("   Run PRODUCTION_TRAINING_REAL_DATA.py first")
        return False
    
    # Create/clear extension models dir
    if extension_models.exists():
        shutil.rmtree(extension_models)
    extension_models.mkdir(parents=True)
    
    print("Deploying files:\n")
    
    # Copy joblib models
    joblib_files = list(models_dir.glob('*.joblib'))
    total_size = 0
    
    for joblib_file in joblib_files:
        dest = extension_models / joblib_file.name
        shutil.copy(joblib_file, dest)
        size = dest.stat().st_size / (1024*1024)
        total_size += size
        print(f"  ✓ {joblib_file.name:<30} {size:.2f}MB")
    
    # Copy metadata
    metadata_file = models_dir / 'metadata.json'
    if metadata_file.exists():
        shutil.copy(metadata_file, extension_models / 'metadata.json')
        print(f"  ✓ metadata.json")
    
    print(f"\n✅ Models deployed successfully!")
    print(f"   Location: {extension_models}")
    print(f"   Total size: {total_size:.2f}MB")
    print(f"   Format: Joblib (Python native)")
    print()
    print("Next step: Load extension in Chrome")
    print("   1. chrome://extensions/")
    print("   2. Load unpacked")
    print("   3. Select: football-predictor-clean/")
    
    return True

if __name__ == '__main__':
    deploy_models()
