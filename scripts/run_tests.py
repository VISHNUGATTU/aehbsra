"""
Automated Test Runner for UK Energy Utility Forecasting Platform
"""

import sys
import subprocess
import os

def run():
    print("=" * 70)
    print("RUNNING VORTEX POWER BACKEND & ALGORITHM TEST SUITE")
    print("=" * 70)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    test_path = os.path.join(base_dir, "backend", "tests", "test_backend.py")
    
    cmd = [sys.executable, "-m", "pytest", test_path, "-v", "--tb=short"]
    result = subprocess.run(cmd, cwd=base_dir)
    
    if result.returncode == 0:
        print("\n" + "=" * 70)
        print("ALL TESTS PASSED: Data Pipeline, Day-Ahead Engine & Metrics Verified")
        print("=" * 70)
    else:
        print("\n[!] Test failures detected. Review output above.")
    sys.exit(result.returncode)

if __name__ == "__main__":
    run()
