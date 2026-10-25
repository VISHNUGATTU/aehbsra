"""
Day-Ahead Procurement Decision and Risk Buffer Simulator
Enables power purchase traders to evaluate residual power procurement needs
(thermal/wholesale contracts) factoring in quantified wind forecast uncertainty.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

from .day_ahead_engine import day_ahead_engine
from .config import UK_WINTER_TYPICAL_DEMAND, DEFAULT_GATE_CLOSURE_HOUR

class ProcurementSimulator:
    def __init__(self):
        pass

    def simulate_procurement(
        self,
        date_str: str = "2026-01-15",
        gate_hour: int = DEFAULT_GATE_CLOSURE_HOUR,
        strategy: str = "p90_conservative",  # "naive", "bias_adjusted", "p90_conservative", "custom_buffer"
        custom_buffer_mw: float = 1500.0,
        day_ahead_price_gbp: float = 78.0,      # £/MWh
        system_buy_price_gbp: float = 115.0,    # £/MWh (punitive cashout penalty for short positions)
        system_sell_price_gbp: float = 48.0     # £/MWh (discount cashout for spill/excess)
    ) -> Dict[str, Any]:
        """
        Simulates procurement for a 24-hour delivery day across all 48 settlement periods.
        """
        # Fetch half-hourly aligned data for the target date
        df_day = day_ahead_engine.align_forecasts_and_actuals(
            gate_hour=gate_hour,
            start_date=date_str,
            end_date=date_str,
            resolution="half_hourly"
        )

        if df_day.empty:
            return {"error": f"No data found for date {date_str}"}

        df_day = df_day.copy()
        n_periods = len(df_day)

        # Assign consumer demand curve (scaled or using standard UK winter profile)
        if n_periods == 48:
            demand = np.array(UK_WINTER_TYPICAL_DEMAND, dtype=float)
        else:
            # Fallback if fewer settlement periods
            demand = np.linspace(30000, 42000, n_periods)

        df_day["consumer_demand"] = demand
        forecast_wind = df_day["forecast_da"].to_numpy()
        actual_wind = df_day["actual"].to_numpy()

        # Compute buffer based on chosen strategy
        # In January 2026, the wind forecast systematically over-predicted wind (mean bias ~1840 MW, P90 error ~4312 MW)
        buffer_mw = 0.0
        if strategy == "naive":
            buffer_mw = 0.0
        elif strategy == "bias_adjusted":
            buffer_mw = 1840.0
        elif strategy == "p90_conservative":
            buffer_mw = 3500.0  # Safe hedge against extreme over-forecast
        elif strategy == "custom_buffer":
            buffer_mw = float(custom_buffer_mw)

        # Naive Strategy Procurement: Procure Demand - Forecasted Wind
        naive_procure = np.maximum(0.0, demand - forecast_wind)
        
        # Risk-Managed Strategy Procurement: Procure Demand - (Forecasted Wind - Buffer)
        # Note: If wind is over-forecast, deducting a buffer increases thermal procurement to avoid short cashout
        hedged_wind_assumed = np.maximum(0.0, forecast_wind - buffer_mw)
        hedged_procure = np.maximum(0.0, demand - hedged_wind_assumed)

        # Real-time imbalance: Actual total supply (Thermal Procured + Actual Wind) - Consumer Demand
        # Imbalance > 0 => Long (Excess power, sold at System Sell Price)
        # Imbalance < 0 => Short (Shortage, utility must buy at punitive System Buy Price)
        naive_imbalance = (naive_procure + actual_wind) - demand
        hedged_imbalance = (hedged_procure + actual_wind) - demand

        # Cost calculation (Half-hourly energy MWh = MW * 0.5 hours)
        # Naive Costs:
        # Day-Ahead purchase cost = naive_procure * 0.5 * day_ahead_price_gbp
        # Real-time cashout adjustment:
        # If short (imbalance < 0): utility pays |imbalance| * 0.5 * system_buy_price_gbp
        # If long (imbalance > 0): utility receives imbalance * 0.5 * system_sell_price_gbp
        naive_da_cost = naive_procure * 0.5 * day_ahead_price_gbp
        naive_short_cost = np.where(naive_imbalance < 0, np.abs(naive_imbalance) * 0.5 * system_buy_price_gbp, 0.0)
        naive_long_rev = np.where(naive_imbalance > 0, naive_imbalance * 0.5 * system_sell_price_gbp, 0.0)
        naive_net_cost = naive_da_cost + naive_short_cost - naive_long_rev

        # Hedged Costs:
        hedged_da_cost = hedged_procure * 0.5 * day_ahead_price_gbp
        hedged_short_cost = np.where(hedged_imbalance < 0, np.abs(hedged_imbalance) * 0.5 * system_buy_price_gbp, 0.0)
        hedged_long_rev = np.where(hedged_imbalance > 0, hedged_imbalance * 0.5 * system_sell_price_gbp, 0.0)
        hedged_net_cost = hedged_da_cost + hedged_short_cost - hedged_long_rev

        # Financial savings
        net_savings_gbp = float(np.sum(naive_net_cost) - np.sum(hedged_net_cost))
        total_naive_cost = float(np.sum(naive_net_cost))
        total_hedged_cost = float(np.sum(hedged_net_cost))

        # Build settlement period breakdown
        timeline = []
        for i in range(n_periods):
            row = df_day.iloc[i]
            sp_num = int(row.get("settlementPeriod", i + 1))
            timeline.append({
                "settlementPeriod": sp_num,
                "time": row["startTime"].strftime("%H:%M"),
                "consumerDemandMW": round(float(demand[i]), 1),
                "actualWindMW": round(float(actual_wind[i]), 1),
                "forecastWindMW": round(float(forecast_wind[i]), 1),
                "naiveProcureMW": round(float(naive_procure[i]), 1),
                "hedgedProcureMW": round(float(hedged_procure[i]), 1),
                "naiveImbalanceMW": round(float(naive_imbalance[i]), 1),
                "hedgedImbalanceMW": round(float(hedged_imbalance[i]), 1)
            })

        # Summary KPIs
        short_hours_naive = int(np.sum(naive_imbalance < 0))
        short_hours_hedged = int(np.sum(hedged_imbalance < 0))
        peak_short_naive = float(np.min(naive_imbalance)) if short_hours_naive > 0 else 0.0
        peak_short_hedged = float(np.min(hedged_imbalance)) if short_hours_hedged > 0 else 0.0

        return {
            "date": date_str,
            "gateHour": gate_hour,
            "strategy": strategy,
            "appliedBufferMW": buffer_mw,
            "pricingAssumptions": {
                "dayAheadPriceGBP": day_ahead_price_gbp,
                "systemBuyPriceGBP": system_buy_price_gbp,
                "systemSellPriceGBP": system_sell_price_gbp
            },
            "financialComparison": {
                "naiveTotalCostGBP": round(total_naive_cost, 2),
                "hedgedTotalCostGBP": round(total_hedged_cost, 2),
                "netSavingsGBP": round(net_savings_gbp, 2),
                "percentCostReduction": round((net_savings_gbp / total_naive_cost * 100) if total_naive_cost > 0 else 0, 2)
            },
            "riskComparison": {
                "naiveShortPeriodsCount": short_hours_naive,
                "hedgedShortPeriodsCount": short_hours_hedged,
                "naivePeakShortageMW": round(abs(peak_short_naive), 1),
                "hedgedPeakShortageMW": round(abs(peak_short_hedged), 1),
                "shortRiskMitigationPercent": round(((short_hours_naive - short_hours_hedged) / short_hours_naive * 100) if short_hours_naive > 0 else 100, 1)
            },
            "timeline": timeline
        }

procurement_simulator = ProcurementSimulator()
