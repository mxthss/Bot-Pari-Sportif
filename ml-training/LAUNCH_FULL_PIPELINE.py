#!/usr/bin/env python3
"""
🚀 FULL PIPELINE LAUNCHER - One Command to Rule Them All
Automates: Setup → Train → Optimize → Deploy → Test

Usage: python LAUNCH_FULL_PIPELINE.py
"""

import subprocess
import sys
import os
from pathlib import Path
import json
import time

class PipelineLauncher:
    def __init__(self):
        self.start_time = time.time()
        self.results = {}
        
    def print_header(self, title):
        print("\n" + "="*70)
        print(f"  {title}")
        print("="*70 + "\n")
    
    def print_step(self, step_num, title, description):
        print(f"\n{'='*70}")
        print(f"[{step_num}/6] {title}")
        print(f"{'='*70}")
        print(f"📝 {description}\n")
    
    def run_command(self, cmd, description):
        """Run command and handle errors"""
        print(f"▶️  Running: {description}")
        print(f"   Command: {' '.join(cmd) if isinstance(cmd, list) else cmd}\n")
        
        try:
            if isinstance(cmd, str):
                result = subprocess.run(cmd, shell=True, capture_output=False)
            else:
                result = subprocess.run(cmd, capture_output=False)
            
            if result.returncode == 0:
                print(f"✅ {description} - SUCCESS\n")
                return True
            else:
                print(f"❌ {description} - FAILED (code: {result.returncode})\n")
                return False
        except Exception as e:
            print(f"❌ Error: {e}\n")
            return False
    
    def step_1_verify_setup(self):
        """Verify everything is ready"""
        self.print_step(1, "VERIFICATION", "Checking project structure...")
        
        required_files = [
            'PRODUCTION_TRAINING.py',
            'optimize_models.py',
            'deploy_to_extension.py',
            'requirements.txt'
        ]
        
        print("Checking files:")
        all_good = True
        for file in required_files:
            path = Path(file)
            status = "✅" if path.exists() else "❌"
            print(f"  {status} {file}")
            if not path.exists():
                all_good = False
        
        if all_good:
            print("\n✅ All files present!\n")
            self.results['verify'] = True
            return True
        else:
            print("\n❌ Some files missing!\n")
            self.results['verify'] = False
            return False
    
    def step_2_install_deps(self):
        """Install dependencies"""
        self.print_step(2, "INSTALL DEPENDENCIES", "Installing Python packages for GPU...")
        
        # Upgrade pip
        print("Upgrading pip...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip'], 
                      capture_output=True)
        
        # Install requirements
        print("Installing requirements...")
        success = self.run_command(
            [sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'],
            "Install Python packages"
        )
        
        self.results['install'] = success
        return success
    
    def step_3_train_models(self):
        """Train models"""
        self.print_step(3, "TRAIN MODELS", "Training on 1M samples with GPU...")
        
        print("🚀 GPU TRAINING STARTING")
        print("   Dataset: 1,000,000 samples")
        print("   Models: 5-model ensemble")
        print("   GPU: AMD 9070XT (ROCm)")
        print("   Estimated time: 20-30 minutes\n")
        
        input("Press ENTER to start training (or Ctrl+C to cancel)...\n")
        
        success = self.run_command(
            [sys.executable, 'PRODUCTION_TRAINING.py', '--gpu', '--samples', '1000000'],
            "Train ensemble models"
        )
        
        self.results['train'] = success
        
        if success:
            # Verify models were created
            models_dir = Path('models')
            if models_dir.exists():
                model_files = list(models_dir.glob('*.joblib'))
                print(f"✅ Created {len(model_files)} model files\n")
            return True
        return False
    
    def step_4_optimize_models(self):
        """Optimize models"""
        self.print_step(4, "OPTIMIZE MODELS", "Converting to ONNX and quantizing...")
        
        print("Optimization steps:")
        print("  1. Joblib → ONNX conversion")
        print("  2. INT8 quantization")
        print("  3. 90% size reduction")
        print("  4. Browser bundle creation\n")
        
        success = self.run_command(
            [sys.executable, 'optimize_models.py'],
            "Optimize and quantize models"
        )
        
        self.results['optimize'] = success
        
        if success:
            opt_dir = Path('models_optimized')
            if opt_dir.exists():
                onnx_files = list(opt_dir.glob('*.onnx'))
                total_size = sum(f.stat().st_size for f in onnx_files) / (1024*1024)
                print(f"✅ Optimized to {total_size:.1f}MB\n")
            return True
        return False
    
    def step_5_deploy_extension(self):
        """Deploy to extension"""
        self.print_step(5, "DEPLOY TO EXTENSION", "Copying models to src/models/...")
        
        success = self.run_command(
            [sys.executable, 'deploy_to_extension.py'],
            "Deploy models to extension"
        )
        
        self.results['deploy'] = success
        
        if success:
            models_dir = Path('../src/models')
            if models_dir.exists():
                model_files = list(models_dir.glob('*.onnx'))
                total_size = sum(f.stat().st_size for f in model_files) / (1024*1024)
                print(f"✅ Deployed {len(model_files)} models ({total_size:.1f}MB)\n")
            return True
        return False
    
    def step_6_test_inference(self):
        """Test inference"""
        self.print_step(6, "TEST INFERENCE", "Verifying models work...")
        
        success = self.run_command(
            [sys.executable, 'inference_engine.py'],
            "Test model inference"
        )
        
        self.results['test'] = success
        return success
    
    def print_final_report(self):
        """Print final report"""
        elapsed = time.time() - self.start_time
        
        self.print_header("🎉 PIPELINE COMPLETE!")
        
        print("📊 RESULTS:\n")
        
        steps = [
            ('verify', 'Verification'),
            ('install', 'Install Dependencies'),
            ('train', 'Train Models'),
            ('optimize', 'Optimize Models'),
            ('deploy', 'Deploy Extension'),
            ('test', 'Test Inference'),
        ]
        
        for key, name in steps:
            status = "✅ SUCCESS" if self.results.get(key, False) else "❌ FAILED"
            print(f"  {status:15} {name}")
        
        print(f"\n⏱️  Total Time: {elapsed//60:.0f}m {elapsed%60:.0f}s\n")
        
        all_success = all(self.results.values())
        
        if all_success:
            print("✅ ALL STEPS COMPLETED SUCCESSFULLY!\n")
            print("🎮 NEXT STEPS:")
            print("  1. Open chrome://extensions/")
            print("  2. Enable 'Developer mode'")
            print("  3. Click 'Load unpacked'")
            print("  4. Select: football-predictor-clean/")
            print("  5. Click extension icon to test")
            print("  6. Visit betting sites to see predictions!\n")
        else:
            print("⚠️  SOME STEPS FAILED\n")
            print("Check errors above and retry.\n")
        
        print("="*70)
    
    def run(self):
        """Run full pipeline"""
        self.print_header("🚀 FOOTBALL PREDICTOR - FULL PIPELINE")
        
        print("Starting automated pipeline:")
        print("  → Verify setup")
        print("  → Install dependencies")
        print("  → Train 5 ensemble models (GPU)")
        print("  → Optimize & quantize")
        print("  → Deploy to extension")
        print("  → Test inference\n")
        
        input("Press ENTER to begin... (or Ctrl+C to cancel)\n")
        
        # Run all steps
        steps = [
            ('verify', self.step_1_verify_setup),
            ('install', self.step_2_install_deps),
            ('train', self.step_3_train_models),
            ('optimize', self.step_4_optimize_models),
            ('deploy', self.step_5_deploy_extension),
            ('test', self.step_6_test_inference),
        ]
        
        for key, step_func in steps:
            try:
                if not step_func():
                    print(f"⚠️  Step failed. Continue? (y/n): ", end='')
                    if input().lower() != 'y':
                        break
            except KeyboardInterrupt:
                print("\n\n⛔ Pipeline interrupted by user\n")
                break
            except Exception as e:
                print(f"\n❌ Error in step: {e}\n")
        
        # Final report
        self.print_final_report()

if __name__ == '__main__':
    print("\n" + "█"*70)
    print("█" + " "*68 + "█")
    print("█  🚀 FOOTBALL PREDICTOR - AUTOMATED PIPELINE LAUNCHER" + " "*11 + "█")
    print("█" + " "*68 + "█")
    print("█"*70 + "\n")
    
    launcher = PipelineLauncher()
    launcher.run()
