"""
FastAPI REST Route Handlers for UK Power Day-Ahead Forecasting System
"""

from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException, Body
from pydantic import BaseModel, Field

from ..data_pipeline import pipeline
from ..day_ahead_engine import day_ahead_engine
from ..metrics_engine import metrics_engine
from ..simulator_engine import procurement_simulator
from ..config import DEFAULT_GATE_CLOSURE_HOUR

router = APIRouter(prefix="/api")

class SimulationRequest(BaseModel):
    date: str = Field(default="2026-01-15", description="Delivery date (YYYY-MM-DD)")
    gateHour: int = Field(default=DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23, description="Decision Gate Closure Hour on Day D-1")
    strategy: str = Field(default="p90_conservative", description="Strategy: naive, bias_adjusted, p90_conservative, custom_buffer")
    customBufferMW: float = Field(default=1500.0, ge=0, description="Custom buffer in MW")
    dayAheadPriceGBP: float = Field(default=78.0, description="Day-Ahead wholesale contract price (£/MWh)")
    systemBuyPriceGBP: float = Field(default=115.0, description="System Buy Price (£/MWh)")
    systemSellPriceGBP: float = Field(default=48.0, description="System Sell Price (£/MWh)")

@router.get("/health")
def get_health():
    """Returns system status, data completeness and record counts."""
    return pipeline.get_health()

@router.get("/overview")
def get_overview(
    gateHour: int = Query(DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23),
    startDate: str = Query("2026-01-01"),
    endDate: str = Query("2026-01-31")
):
    """
    Returns executive summary KPIs for the target evaluation period.
    """
    df = day_ahead_engine.align_forecasts_and_actuals(
        gate_hour=gateHour,
        start_date=startDate,
        end_date=endDate,
        resolution="hourly"
    )
    if df.empty:
        raise HTTPException(status_code=404, detail="No aligned data found for specified criteria")

    summary = metrics_engine.calculate_summary_metrics(df)
    health = pipeline.get_health()
    return {
        "gateHour": gateHour,
        "dateRange": {"startDate": startDate, "endDate": endDate},
        "summary": summary,
        "health": health
    }

@router.get("/timeseries")
def get_timeseries(
    gateHour: int = Query(DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23),
    startDate: str = Query("2026-01-01"),
    endDate: str = Query("2026-01-31"),
    resolution: str = Query("hourly", pattern="^(hourly|half_hourly)$")
):
    """
    Returns aligned time series data (Actuals, Day-Ahead Forecast, Intraday Forecast, and Errors).
    """
    df = day_ahead_engine.align_forecasts_and_actuals(
        gate_hour=gateHour,
        start_date=startDate,
        end_date=endDate,
        resolution=resolution
    )
    if df.empty:
        raise HTTPException(status_code=404, detail="No data available for date range")

    records = []
    for _, row in df.iterrows():
        item = {
            "timestamp": row["startTime"].isoformat(),
            "timeFormatted": row["startTime"].strftime("%d %b %H:%M"),
            "actual": round(float(row["actual"]), 1),
            "forecastDA": round(float(row["forecast_da"]), 1),
            "error": round(float(row["error"]), 1),
            "absError": round(float(row["abs_error"]), 1),
            "publishTimeDA": row["publishTime_da"].isoformat() if pd_not_null(row.get("publishTime_da")) else None
        }
        if "forecast_intraday" in row and pd_not_null(row["forecast_intraday"]):
            item["forecastIntraday"] = round(float(row["forecast_intraday"]), 1)
            item["errorIntraday"] = round(float(row.get("error_intraday", 0)), 1)
        if "settlementPeriod" in row:
            item["settlementPeriod"] = int(row["settlementPeriod"])

        records.append(item)

    return {
        "gateHour": gateHour,
        "resolution": resolution,
        "count": len(records),
        "data": records
    }

@router.get("/metrics")
def get_metrics(
    gateHour: int = Query(DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23),
    startDate: str = Query("2026-01-01"),
    endDate: str = Query("2026-01-31"),
    resolution: str = Query("hourly")
):
    """
    Detailed statistical error evaluation (MAE, RMSE, WAPE, Bias, Quantiles, R2).
    """
    df = day_ahead_engine.align_forecasts_and_actuals(
        gate_hour=gateHour,
        start_date=startDate,
        end_date=endDate,
        resolution=resolution
    )
    if df.empty:
        raise HTTPException(status_code=404, detail="No data available for metrics calculation")

    return metrics_engine.calculate_summary_metrics(df)

@router.get("/diurnal")
def get_diurnal(
    gateHour: int = Query(DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23),
    startDate: str = Query("2026-01-01"),
    endDate: str = Query("2026-01-31"),
    resolution: str = Query("hourly")
):
    """
    Returns diurnal / settlement period error profile (SP 1-48 or Hours 0-23).
    """
    df = day_ahead_engine.align_forecasts_and_actuals(
        gate_hour=gateHour,
        start_date=startDate,
        end_date=endDate,
        resolution=resolution
    )
    if df.empty:
        return []
    return metrics_engine.calculate_diurnal_profiles(df)

@router.get("/distribution")
def get_distribution(
    gateHour: int = Query(DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23),
    startDate: str = Query("2026-01-01"),
    endDate: str = Query("2026-01-31"),
    numBins: int = Query(30, ge=10, le=100)
):
    """
    Returns histogram bins and KDE smooth density for error distribution inspection.
    """
    df = day_ahead_engine.align_forecasts_and_actuals(
        gate_hour=gateHour,
        start_date=startDate,
        end_date=endDate,
        resolution="hourly"
    )
    if df.empty:
        return {"bins": [], "kde": []}
    return metrics_engine.calculate_error_distribution(df, num_bins=numBins)

@router.get("/ramp-analysis")
def get_ramp_analysis(
    gateHour: int = Query(DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23),
    startDate: str = Query("2026-01-01"),
    endDate: str = Query("2026-01-31")
):
    """
    Returns generation ramp-rate accuracy metrics (predicted ramp vs actual ramp).
    """
    df = day_ahead_engine.align_forecasts_and_actuals(
        gate_hour=gateHour,
        start_date=startDate,
        end_date=endDate,
        resolution="hourly"
    )
    if df.empty:
        return {}
    return metrics_engine.calculate_ramp_rate_analysis(df)

@router.post("/simulate")
def run_simulation(req: SimulationRequest):
    """
    Simulates Day-Ahead procurement decisions with quantified risk hedging buffers.
    """
    result = procurement_simulator.simulate_procurement(
        date_str=req.date,
        gate_hour=req.gateHour,
        strategy=req.strategy,
        custom_buffer_mw=req.customBufferMW,
        day_ahead_price_gbp=req.dayAheadPriceGBP,
        system_buy_price_gbp=req.systemBuyPriceGBP,
        system_sell_price_gbp=req.systemSellPriceGBP
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/refresh-data")
def refresh_data():
    """Forces fresh download from Elexon BMRS API streams."""
    pipeline.initialize(force_refresh=True)
    return {"message": "Data successfully refreshed from Elexon BMRS API", "health": pipeline.get_health()}

def pd_not_null(val):
    if val is None:
        return False
    try:
        import pandas as pd
        return not pd.isna(val)
    except Exception:
        return True
