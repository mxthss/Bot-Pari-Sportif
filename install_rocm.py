#!/usr/bin/env python3
"""
Install ROCm 5.7 for AMD GPU Support
"""

import os
import subprocess
import urllib.request
import sys

def install_rocm():
    print("="*70)
    print("🚀 INSTALLING ROCm 5.7 FOR AMD GPU")
    print("="*70)
    print()
    
    # Option 1: Use chocolatey (if installed)
    print("[1/3] Checking for Chocolatey...")
    try:
        result = subprocess.run(['choco', '--version'], capture_output=True)
        if result.returncode == 0:
            print("✅ Chocolatey found")
            print()
            print("Installing ROCm via Chocolatey...")
            subprocess.run(['choco', 'install', 'rocm-developer', '-y'])
            print("✅ ROCm installed!")
            return True
    except:
        print("⚠️  Chocolatey not found")
    
    # Option 2: Direct download
    print("\n[2/3] Downloading ROCm installer...")
    print("This may take a few minutes (~500MB)...")
    
    # Alternative: Use AMD's direct download
    urls = [
        "https://repo.radeon.com/rocm/windows/amd-software-adrenalin-edition-25.1.2.exe",
        "https://drivers.amd.com/drivers/installer/23.50/rocm-developer/amd-software-adrenalin-edition-23.50.2-minimalsetup-230531.exe"
    ]
    
    installer_path = os.path.expanduser("~/Downloads/ROCm-Installer.exe")
    
    for url in urls:
        try:
            print(f"Trying: {url}")
            urllib.request.urlretrieve(url, installer_path)
            print(f"✅ Downloaded to {installer_path}")
            
            print("\n[3/3] Running installer...")
            print("Please follow the installer wizard")
            print("- Check: GPU Computing")
            print("- Check: HIP SDK")
            print("")
            
            subprocess.run([installer_path])
            print("\n✅ ROCm installation started!")
            print("⚠️  RESTART YOUR COMPUTER after installation completes")
            return True
            
        except Exception as e:
            print(f"❌ Failed: {e}")
            continue
    
    print("\n❌ Could not download ROCm automatically")
    print("\nManual installation:")
    print("1. Go to: https://www.amd.com/en/technologies/rocm/tools/hip")
    print("2. Download ROCm Installer for Windows")
    print("3. Run the installer")
    print("4. Select 'GPU Computing' and 'HIP SDK'")
    print("5. Restart computer")
    print("6. Verify with: rocm-smi")
    
    return False

def verify_rocm():
    print("\n" + "="*70)
    print("VERIFYING ROCm INSTALLATION")
    print("="*70 + "\n")
    
    try:
        result = subprocess.run(['rocm-smi'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ ROCm detected!")
            print(result.stdout)
            return True
        else:
            print("❌ rocm-smi command failed")
            return False
    except FileNotFoundError:
        print("❌ rocm-smi not found in PATH")
        print("   Restart computer after installation and try again")
        return False

def install_gpu_torch():
    print("\n" + "="*70)
    print("INSTALLING GPU-ENABLED PYTORCH")
    print("="*70 + "\n")
    
    print("Installing PyTorch with ROCm 5.7 support...")
    cmd = [
        sys.executable, '-m', 'pip', 'install',
        'torch', 'torchvision', 'torchaudio',
        '--index-url', 'https://download.pytorch.org/whl/rocm5.7'
    ]
    
    result = subprocess.run(cmd)
    
    if result.returncode == 0:
        print("\n✅ PyTorch GPU installed!")
        return True
    else:
        print("\n❌ PyTorch installation failed")
        return False

if __name__ == '__main__':
    print("\n")
    install_rocm()
    
    # Try to verify
    if verify_rocm():
        # Install GPU PyTorch
        install_gpu_torch()
        print("\n" + "="*70)
        print("✅ ROCm setup complete!")
        print("="*70)
        print("\nYou can now run GPU-accelerated training:")
        print("  python PRODUCTION_TRAINING.py --gpu")
    else:
        print("\n⚠️  Please restart your computer and run this script again")
