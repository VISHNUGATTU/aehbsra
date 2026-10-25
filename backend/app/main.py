"""
UK Energy Day-Ahead Power Forecasting and Decision Support System
FastAPI Application Entrypoint
"""

import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

import asyncio
from .data_pipeline import pipeline
from .api.routes import router
from .keep_alive import keep_alive_daemon

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("energy-forecasting")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing UK Energy Forecasting System...")
    try:
        pipeline.initialize()
        health = pipeline.get_health()
        logger.info(f"Data Pipeline Initialized: {health['status']}, Actuals: {health['actuals']['totalRecords']}, Forecasts: {health['forecasts']['totalPublications']}")
    except Exception as e:
        logger.error(f"Error during initialization: {e}", exc_info=True)

    keep_alive_task = None
    # Enable keep-alive ping daemon on Render or when explicitly configured
    if os.environ.get("RENDER") or os.environ.get("RENDER_EXTERNAL_URL") or os.environ.get("ENABLE_KEEP_ALIVE") == "true":
        keep_alive_task = asyncio.create_task(keep_alive_daemon(interval_seconds=600))
        logger.info("Launched background keep-alive ping daemon for 24/7 warm cloud uptime.")

    yield

    if keep_alive_task and not keep_alive_task.done():
        keep_alive_task.cancel()
    logger.info("Shutting down forecasting engine.")

app = FastAPI(
    title="UK Energy Utility Day-Ahead Forecasting API",
    description="Quantitative Renewable Generation Forecast Evaluation & Procurement Risk Engine for UK Day-Ahead Power Markets",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development and production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes first
app.include_router(router)

# Check for built frontend static files (Heroku / Docker / Production)
static_candidates = [
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    Path(__file__).resolve().parent.parent / "static",
    Path(__file__).resolve().parent / "static"
]

mounted_static = False
for candidate in static_candidates:
    if candidate.exists() and (candidate / "index.html").exists():
        app.mount("/", StaticFiles(directory=str(candidate), html=True), name="static")
        logger.info(f"Mounted production frontend from {candidate}")
        mounted_static = True
        break

if not mounted_static:
    @app.get("/")
    def root():
        return {
            "service": "UK Energy Utility Day-Ahead Forecasting Engine",
            "market": "GB Wholesale Electricity Market (Elexon BMRS)",
            "targetPeriod": "January 2026",
            "documentation": "/docs",
            "apiPrefix": "/api"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
