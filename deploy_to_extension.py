#!/usr/bin/env python3
"""
Deploy optimized models to browser extension
Copies ONNX models and inference engine to src/models/
"""

import shutil
from pathlib import Path

def deploy_models():
    """Copy optimized models to extension"""
    
    # Paths
    optimized_dir = Path('models_optimized/browser')
    extension_models = Path('../src/models')
    
    if not optimized_dir.exists():
        print("❌ Optimized models not found!")
        print("   Run: python optimize_models.py")
        return False
    
    # Create/clear extension models dir
    if extension_models.exists():
        shutil.rmtree(extension_models)
    extension_models.mkdir(parents=True)
    
    print("📦 Deploying models to extension...\n")
    
    # Copy ONNX models
    onnx_files = list(optimized_dir.glob('*.onnx'))
    total_size = 0
    
    for onnx_file in onnx_files:
        dest = extension_models / onnx_file.name
        shutil.copy(onnx_file, dest)
        size = dest.stat().st_size / (1024*1024)
        total_size += size
        print(f"  ✓ {onnx_file.name:<30} {size:.2f}MB")
    
    # Copy inference engine
    js_file = optimized_dir / 'onnx-inference.js'
    if js_file.exists():
        shutil.copy(js_file, extension_models / 'onnx-inference.js')
        print(f"  ✓ onnx-inference.js")
    
    # Copy metadata
    metadata_file = optimized_dir / 'metadata.json'
    if metadata_file.exists():
        shutil.copy(metadata_file, extension_models / 'metadata.json')
        print(f"  ✓ metadata.json")
    
    print(f"\n✅ Models deployed!")
    print(f"   Location: {extension_models}")
    print(f"   Total size: {total_size:.2f}MB")
    print(f"\n   Extension ready to load in Chrome!")
    
    return True

if __name__ == '__main__':
    deploy_models()
