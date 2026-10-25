"""
Runner script to launch the FastAPI backend server.
Usage: python run_backend.py [--port 8000] [--reload]
"""

import sys
import uvicorn

if __name__ == "__main__":
    port = 8000
    if "--port" in sys.argv:
        idx = sys.argv.index("--port")
        if idx + 1 < len(sys.argv):
            port = int(sys.argv[idx + 1])

    reload = "--reload" in sys.argv
    print(f"Starting UK Energy Forecasting FastAPI Server on http://localhost:{port}...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=reload)
