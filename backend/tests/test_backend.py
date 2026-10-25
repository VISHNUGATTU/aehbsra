"""
Unit and Integration Test Suite for UK Power Forecasting & Procurement Backend
"""

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
import pandas as pd
import numpy as np

from app.main import app
from app.data_pipeline import pipeline
from app.day_ahead_engine import day_ahead_engine
from app.metrics_engine import metrics_engine
from app.simulator_engine import procurement_simulator

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_pipeline():
    pipeline.initialize()

def test_data_pipeline_health():
    health = pipeline.get_health()
    assert health["status"] == "HEALTHY"
    assert health["targetPeriod"] == "2026-01"
    assert health["actuals"]["totalRecords"] == 1488  # 31 days * 48 half-hours
    assert health["actuals"]["completenessPercent"] == 100.0
    assert health["forecasts"]["totalPublications"] > 1000

def test_day_ahead_alignment_hourly():
    df = day_ahead_engine.align_forecasts_and_actuals(
        gate_hour=11,
        start_date="2026-01-01",
        end_date="2026-01-31",
        resolution="hourly"
    )
    assert not df.empty
    assert len(df) == 744  # 31 days * 24 hours
    assert "actual" in df.columns
    assert "forecast_da" in df.columns
    assert "error" in df.columns
    # Check no NaN values in essential columns
    assert df["actual"].isna().sum() == 0
    assert df["forecast_da"].isna().sum() == 0

def test_day_ahead_gate_closure_lead_time():
    # As gate closure moves closer to delivery (from 09:00 to 17:00 D-1),
    # the MAE should either stay steady or improve
    df_09 = day_ahead_engine.align_forecasts_and_actuals(gate_hour=9)
    df_17 = day_ahead_engine.align_forecasts_and_actuals(gate_hour=17)
    
    mae_09 = df_09["abs_error"].mean()
    mae_17 = df_17["abs_error"].mean()
    assert mae_17 < mae_09

def test_metrics_engine():
    df = day_ahead_engine.align_forecasts_and_actuals(gate_hour=11)
    summary = metrics_engine.calculate_summary_metrics(df)
    
    assert summary["sampleCount"] == 744
    assert summary["mae"] > 0
    assert summary["rmse"] > summary["mae"]  # Mathematical property: RMSE >= MAE
    assert summary["wape"] > 0
    assert "quantiles" in summary
    assert summary["quantiles"]["p10"] < summary["quantiles"]["p90"]

def test_diurnal_profiles():
    df = day_ahead_engine.align_forecasts_and_actuals(gate_hour=11)
    diurnal = metrics_engine.calculate_diurnal_profiles(df)
    assert len(diurnal) == 24  # 24 hours
    assert all("period" in d and "mae" in d for d in diurnal)

def test_error_distribution():
    df = day_ahead_engine.align_forecasts_and_actuals(gate_hour=11)
    dist = metrics_engine.calculate_error_distribution(df, num_bins=20)
    assert "bins" in dist
    assert len(dist["bins"]) == 20
    assert "p10" in dist
    assert "p90" in dist

def test_procurement_simulator():
    sim = procurement_simulator.simulate_procurement(
        date_str="2026-01-15",
        gate_hour=11,
        strategy="bias_adjusted",
        custom_buffer_mw=1840.0
    )
    assert "financialComparison" in sim
    assert "riskComparison" in sim
    assert "timeline" in sim
    assert len(sim["timeline"]) == 48

def test_api_endpoints():
    # Root
    resp = client.get("/")
    assert resp.status_code == 200

    # Health
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "HEALTHY"

    # Overview
    resp = client.get("/api/overview?gateHour=11&startDate=2026-01-01&endDate=2026-01-07")
    assert resp.status_code == 200
    data = resp.json()
    assert "summary" in data

    # Timeseries
    resp = client.get("/api/timeseries?gateHour=11&startDate=2026-01-01&endDate=2026-01-03&resolution=hourly")
    assert resp.status_code == 200
    ts_data = resp.json()
    assert ts_data["count"] == 72  # 3 days * 24 hours

    # Metrics
    resp = client.get("/api/metrics?gateHour=11")
    assert resp.status_code == 200
    assert "mae" in resp.json()

    # Simulation POST
    resp = client.post("/api/simulate", json={
        "date": "2026-01-15",
        "gateHour": 11,
        "strategy": "p90_conservative"
    })
    assert resp.status_code == 200
    assert "financialComparison" in resp.json()
