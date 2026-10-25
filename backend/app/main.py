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

from .data_pipeline import pipeline
from .api.routes import router

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
    yield
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
