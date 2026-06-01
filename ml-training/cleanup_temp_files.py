#!/usr/bin/env python3
"""
Clean up temporary training files
"""
from pathlib import Path
import os

ml_dir = Path(r'C:\Users\matab\Documents\bot pari\football-predictor-clean\ml-training')

# Files to delete (duplicates/obsolete)
files_to_delete = [
    ml_dir / 'REAL_DATA_TRAINING.py',
    ml_dir / 'TRAIN.bat',
    # Keep: PRODUCTION_TRAINING.py, RUN_TRAINING.bat, inference_engine.py
]

print("🗑️  Cleaning up temporary files...\n")

for file_path in files_to_delete:
    if file_path.exists():
        try:
            file_path.unlink()
            print(f"  ✓ Deleted: {file_path.name}")
        except Exception as e:
            print(f"  ✗ Failed to delete {file_path.name}: {e}")
    else:
        print(f"  - Skip (not found): {file_path.name}")

print("\n✅ Cleanup complete!")
print("\nRemaining files in ml-training/:")
for f in sorted(ml_dir.glob('*')):
    if f.is_file():
        print(f"  ✓ {f.name}")
    else:
        print(f"  📁 {f.name}/")
