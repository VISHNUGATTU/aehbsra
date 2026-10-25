"""
Day-Ahead Alignment Engine for UK Power Procurement
Calculates actionable forecasts at specified Day-Ahead Decision Gate Closures
without look-ahead bias, aligned with actual wind generation.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np

from .data_pipeline import pipeline
from .config import DEFAULT_GATE_CLOSURE_HOUR

class DayAheadEngine:
    def __init__(self):
        pass

    def align_forecasts_and_actuals(
        self,
        gate_hour: int = DEFAULT_GATE_CLOSURE_HOUR,
        start_date: Optional[str] = "2026-01-01",
        end_date: Optional[str] = "2026-01-31",
        resolution: str = "hourly"  # "hourly" or "half_hourly"
    ) -> pd.DataFrame:
        """
        Aligns WINDFOR forecasts to FUELHH actuals for a specific decision gate closure.
        Returns a DataFrame with matched actual, day_ahead_forecast, intraday_forecast, and errors.
        """
        df_act, df_fc = pipeline.get_data()

        # Filter actuals to target range (inclusive of end date)
        start_ts = pd.to_datetime(start_date, utc=True)
        end_ts = pd.to_datetime(end_date, utc=True) + pd.Timedelta(days=1) - pd.Timedelta(seconds=1)
        
        df_act_filt = df_act[(df_act["startTime"] >= start_ts) & (df_act["startTime"] <= end_ts)].copy()

        # Extract Day-Ahead forecasts by delivery date
        da_records = []
        intra_records = []

        # Process each delivery date present in the target range
        unique_dates = pd.date_range(start_date, end_date, freq="D", tz="UTC")

        for delivery_dt in unique_dates:
            delivery_date = delivery_dt.date()
            # Gate closure timestamp: Day D-1 at gate_hour:00:00 UTC
            gate_closure_ts = delivery_dt - pd.Timedelta(days=1) + pd.Timedelta(hours=gate_hour)

            # Slice forecasts whose target startTime falls on delivery_date
            next_day_ts = delivery_dt + pd.Timedelta(days=1)
            fc_day = df_fc[(df_fc["startTime"] >= delivery_dt) & (df_fc["startTime"] < next_day_ts)]

            # 1. Day-Ahead forecasts published <= gate_closure_ts
            valid_da = fc_day[fc_day["publishTime"] <= gate_closure_ts]
            for st, group in valid_da.groupby("startTime"):
                latest_da = group.sort_values("publishTime").iloc[-1]
                da_records.append({
                    "startTime": latest_da["startTime"],
                    "forecast_da": latest_da["generation"],
                    "publishTime_da": latest_da["publishTime"],
                    "gate_closure": gate_closure_ts
                })

            # 2. Intraday latest forecasts (published right before delivery startTime)
            for st, group in fc_day.groupby("startTime"):
                valid_intra = group[group["publishTime"] <= st]
                if not valid_intra.empty:
                    latest_intra = valid_intra.sort_values("publishTime").iloc[-1]
                    intra_records.append({
                        "startTime": latest_intra["startTime"],
                        "forecast_intraday": latest_intra["generation"],
                        "publishTime_intraday": latest_intra["publishTime"]
                    })

        df_da = pd.DataFrame(da_records)
        df_intra = pd.DataFrame(intra_records)

        # Merge forecasts
        if df_da.empty:
            return pd.DataFrame()

        df_fc_combined = pd.merge(df_da, df_intra, on="startTime", how="left")

        if resolution == "hourly":
            # Resample actuals to hourly mean
            df_act_hourly = df_act_filt.set_index("startTime").resample("1h")["generation"].mean().reset_index()
            df_act_hourly.rename(columns={"generation": "actual"}, inplace=True)
            df_merged = pd.merge(df_act_hourly, df_fc_combined, on="startTime", how="inner")
        else:
            # Half-hourly resolution (Settlement Periods 1-48)
            # Map hourly forecast to each corresponding half-hour settlement period
            # Floor startTime to hour to merge with hourly forecast
            df_act_filt["hour_floor"] = df_act_filt["startTime"].dt.floor("h")
            df_merged = pd.merge(
                df_act_filt,
                df_fc_combined.rename(columns={"startTime": "hour_floor"}),
                on="hour_floor",
                how="inner"
            )
            df_merged.rename(columns={"generation": "actual"}, inplace=True)

        # Calculate error metrics
        # Error = Forecast - Actual
        # Positive = Over-forecast (Short risk in balancing market)
        # Negative = Under-forecast (Long risk in balancing market)
        df_merged["error"] = df_merged["forecast_da"] - df_merged["actual"]
        df_merged["abs_error"] = df_merged["error"].abs()
        df_merged["pct_error"] = np.where(
            df_merged["actual"] > 100,
            (df_merged["error"] / df_merged["actual"]) * 100,
            np.nan
        )

        if "forecast_intraday" in df_merged.columns:
            df_merged["error_intraday"] = df_merged["forecast_intraday"] - df_merged["actual"]
            df_merged["abs_error_intraday"] = df_merged["error_intraday"].abs()
            df_merged["forecast_delta"] = df_merged["forecast_intraday"] - df_merged["forecast_da"]

        # Sort chronologically
        df_merged.sort_values("startTime", inplace=True)
        return df_merged

day_ahead_engine = DayAheadEngine()
