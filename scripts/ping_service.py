"""
Standalone Ping / Keep-Alive Script for VORTEX POWER Service.
Can be run on-demand or scheduled via crontab, systemd timer, or Windows Task Scheduler.
"""

import sys
import os
import urllib.request
import time

def main():
    target_url = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("TARGET_URL", "https://vortex-power.onrender.com")
    health_url = f"{target_url.rstrip('/')}/api/health"

    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}] Pinging: {health_url}")
    try:
        start_time = time.time()
        req = urllib.request.Request(
            health_url,
            headers={"User-Agent": "VortexPower-KeepAlive-Script/1.0"}
        )
        with urllib.request.urlopen(req, timeout=45) as resp:
            latency_ms = round((time.time() - start_time) * 1000)
            status_code = resp.getcode()
            print(f"-> SUCCESS: HTTP {status_code} in {latency_ms}ms. Service is active and warm!")
            return 0
    except urllib.error.HTTPError as e:
        print(f"-> HTTP Error {e.code}: {e.reason}")
        return 1
    except Exception as e:
        print(f"-> Connection Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
