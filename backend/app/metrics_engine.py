"""
Quantitative Power Forecasting Metrics and Accuracy Analysis Engine
Provides institutional-grade metrics: MAE, RMSE, WAPE, Bias, Quantiles,
Diurnal Settlement Profiles, Ramp Rate errors, and Error Distribution for histograms.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from scipy import stats

class MetricsEngine:
    def __init__(self):
        pass

    def calculate_summary_metrics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculates high-level statistical KPIs from an aligned DataFrame.
        """
        if df.empty or "error" not in df.columns:
            return {}

        actual = df["actual"].to_numpy()
        forecast = df["forecast_da"].to_numpy()
        errors = df["error"].to_numpy()
        abs_errors = df["abs_error"].to_numpy()

        n = len(errors)
        mean_actual = float(np.mean(actual))
        mean_forecast = float(np.mean(forecast))
        
        mae = float(np.mean(abs_errors))
        rmse = float(np.sqrt(np.mean(errors ** 2)))
        bias = float(np.mean(errors))
        
        # WAPE (Weighted Absolute Percentage Error): industry standard for wind
        sum_actual = float(np.sum(actual))
        wape = float((np.sum(abs_errors) / sum_actual) * 100) if sum_actual > 0 else 0.0

        # Normalized metrics (% of mean generation)
        nmae = (mae / mean_actual * 100) if mean_actual > 0 else 0.0
        nrmse = (rmse / mean_actual * 100) if mean_actual > 0 else 0.0

        # Pearson correlation and R2
        corr = float(np.corrcoef(actual, forecast)[0, 1]) if n > 1 else 1.0
        ss_res = np.sum(errors ** 2)
        ss_tot = np.sum((actual - mean_actual) ** 2)
        r2 = float(1.0 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0

        # Extreme risks
        max_over = float(np.max(errors))   # Maximum short risk (forecast > actual)
        max_under = float(np.min(errors))  # Maximum long risk (forecast < actual)
        over_forecast_count = int(np.sum(errors > 0))
        over_forecast_pct = round((over_forecast_count / n) * 100, 1)

        # Quantiles (Empirical Error Distribution)
        quantiles = {
            "p05": float(np.percentile(errors, 5)),
            "p10": float(np.percentile(errors, 10)),
            "p25": float(np.percentile(errors, 25)),
            "p50": float(np.percentile(errors, 50)),  # Median error
            "p75": float(np.percentile(errors, 75)),
            "p90": float(np.percentile(errors, 90)),
            "p95": float(np.percentile(errors, 95))
        }

        # Intraday comparison if available
        intraday_metrics = {}
        if "error_intraday" in df.columns:
            err_intra = df["error_intraday"].to_numpy()
            abs_err_intra = df["abs_error_intraday"].to_numpy()
            mae_intra = float(np.mean(abs_err_intra))
            rmse_intra = float(np.sqrt(np.mean(err_intra ** 2)))
            bias_intra = float(np.mean(err_intra))
            mae_improvement = float(mae - mae_intra)
            intraday_metrics = {
                "mae": round(mae_intra, 1),
                "rmse": round(rmse_intra, 1),
                "bias": round(bias_intra, 1),
                "maeImprovementMW": round(mae_improvement, 1),
                "maeImprovementPercent": round((mae_improvement / mae * 100) if mae > 0 else 0, 1)
            }

        return {
            "sampleCount": n,
            "meanActualMW": round(mean_actual, 1),
            "meanForecastMW": round(mean_forecast, 1),
            "mae": round(mae, 1),
            "rmse": round(rmse, 1),
            "wape": round(wape, 2),
            "bias": round(bias, 1),
            "normalizedMaePercent": round(nmae, 2),
            "normalizedRmsePercent": round(nrmse, 2),
            "correlation": round(corr, 3),
            "r2Score": round(r2, 3),
            "maxOverForecastMW": round(max_over, 1),
            "maxUnderForecastMW": round(max_under, 1),
            "overForecastFrequencyPercent": over_forecast_pct,
            "underForecastFrequencyPercent": round(100 - over_forecast_pct, 1),
            "quantiles": {k: round(v, 1) for k, v in quantiles.items()},
            "intradayBenchmark": intraday_metrics
        }

    def calculate_diurnal_profiles(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Groups errors by Hour of Day (0 to 23) or Settlement Period (1 to 48)
        to identify intraday structural forecast biases.
        """
        if df.empty:
            return []

        df_copy = df.copy()
        if "settlementPeriod" in df_copy.columns:
            group_col = "settlementPeriod"
        else:
            df_copy["hour"] = df_copy["startTime"].dt.hour
            group_col = "hour"

        profiles = []
        for period_val, group in df_copy.groupby(group_col):
            act = group["actual"]
            fc = group["forecast_da"]
            err = group["error"]
            abs_err = group["abs_error"]

            profiles.append({
                "period": int(period_val),
                "meanActualMW": round(float(act.mean()), 1),
                "meanForecastMW": round(float(fc.mean()), 1),
                "mae": round(float(abs_err.mean()), 1),
                "rmse": round(float(np.sqrt((err ** 2).mean())), 1),
                "bias": round(float(err.mean()), 1),
                "p10": round(float(err.quantile(0.10)), 1),
                "p50": round(float(err.quantile(0.50)), 1),
                "p90": round(float(err.quantile(0.90)), 1),
                "overForecastRate": round(float((err > 0).mean() * 100), 1)
            })

        profiles.sort(key=lambda x: x["period"])
        return profiles

    def calculate_error_distribution(self, df: pd.DataFrame, num_bins: int = 30) -> Dict[str, Any]:
        """
        Computes histogram bins and probability density for visual inspection.
        """
        if df.empty:
            return {"bins": [], "kde": []}

        errors = df["error"].dropna().to_numpy()
        if len(errors) == 0:
            return {"bins": [], "kde": []}

        counts, bin_edges = np.histogram(errors, bins=num_bins)
        
        bins_data = []
        for i in range(len(counts)):
            bins_data.append({
                "binStart": round(float(bin_edges[i]), 1),
                "binEnd": round(float(bin_edges[i+1]), 1),
                "binCenter": round(float((bin_edges[i] + bin_edges[i+1]) / 2), 1),
                "count": int(counts[i]),
                "frequency": round(float(counts[i] / len(errors)), 4)
            })

        # Calculate Smooth KDE Curve for aesthetic charting
        kde_curve = []
        try:
            kde = stats.gaussian_kde(errors)
            x_eval = np.linspace(float(bin_edges[0]), float(bin_edges[-1]), 80)
            density = kde(x_eval)
            for x, y in zip(x_eval, density):
                kde_curve.append({
                    "errorMW": round(float(x), 1),
                    "density": float(y)
                })
        except Exception:
            pass

        return {
            "bins": bins_data,
            "kde": kde_curve,
            "p10": round(float(np.percentile(errors, 10)), 1),
            "p50": round(float(np.percentile(errors, 50)), 1),
            "p90": round(float(np.percentile(errors, 90)), 1),
            "skewness": round(float(stats.skew(errors)), 3),
            "kurtosis": round(float(stats.kurtosis(errors)), 3)
        }

    def calculate_ramp_rate_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Evaluates accuracy of predicted vs actual generation changes (ramps).
        Ramp rate error is vital for managing grid balancing and thermal peaker response.
        """
        if df.empty or len(df) < 2:
            return {}

        df_sorted = df.sort_values("startTime").copy()
        df_sorted["actual_ramp"] = df_sorted["actual"].diff()
        df_sorted["forecast_ramp"] = df_sorted["forecast_da"].diff()
        df_sorted["ramp_error"] = df_sorted["forecast_ramp"] - df_sorted["actual_ramp"]
        df_sorted["abs_ramp_error"] = df_sorted["ramp_error"].abs()

        valid = df_sorted.dropna(subset=["ramp_error"])
        ramp_mae = float(valid["abs_ramp_error"].mean())
        ramp_rmse = float(np.sqrt((valid["ramp_error"] ** 2).mean()))

        # Correlation between forecasted ramp direction and actual ramp direction
        actual_direction = np.sign(valid["actual_ramp"].to_numpy())
        forecast_direction = np.sign(valid["forecast_ramp"].to_numpy())
        direction_accuracy = float(np.mean(actual_direction == forecast_direction) * 100)

        return {
            "rampMaeMW": round(ramp_mae, 1),
            "rampRmseMW": round(ramp_rmse, 1),
            "directionAccuracyPercent": round(direction_accuracy, 1),
            "maxUpwardRampMissMW": round(float(valid["ramp_error"].max()), 1),
            "maxDownwardRampMissMW": round(float(valid["ramp_error"].min()), 1)
        }

metrics_engine = MetricsEngine()
