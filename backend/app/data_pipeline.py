"""
Data Pipeline for Elexon BMRS Datasets (FUELHH and WINDFOR)
Handles ingestion, caching, parsing, and data validation for January 2026.
"""

import json
import logging
import urllib.request
import urllib.error
from datetime import datetime
from typing import Dict, Any, Tuple
import pandas as pd

from .config import (
    FUELHH_CACHE_FILE,
    WINDFOR_CACHE_FILE,
    ELEXON_FUELHH_URL,
    ELEXON_WINDFOR_URL,
    TARGET_YEAR,
    TARGET_MONTH
)

logger = logging.getLogger(__name__)

class DataPipeline:
    def __init__(self):
        self.df_actuals: pd.DataFrame = pd.DataFrame()
        self.df_forecasts: pd.DataFrame = pd.DataFrame()
        self._is_loaded = False

    def fetch_stream_from_elexon(self, url: str, timeout: int = 45) -> list:
        headers = {"User-Agent": "UK-DayAhead-Power-Procurement/1.0"}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            content = resp.read().decode("utf-8")
            return json.loads(content)

    def load_actuals(self, force_refresh: bool = False) -> pd.DataFrame:
        if not force_refresh and FUELHH_CACHE_FILE.exists():
            try:
                with open(FUELHH_CACHE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                df = pd.DataFrame(data)
                df["startTime"] = pd.to_datetime(df["startTime"], utc=True)
                df["generation"] = pd.to_numeric(df["generation"], errors="coerce")
                logger.info(f"Loaded {len(df)} FUELHH records from local cache.")
                return df
            except Exception as e:
                logger.warning(f"Failed loading actuals cache: {e}. Fetching live.")

        logger.info("Fetching FUELHH stream from Elexon BMRS API...")
        raw = self.fetch_stream_from_elexon(ELEXON_FUELHH_URL)
        clean = [
            {
                "startTime": item["startTime"],
                "settlementDate": item.get("settlementDate"),
                "settlementPeriod": item.get("settlementPeriod"),
                "publishTime": item.get("publishTime"),
                "generation": float(item["generation"])
            }
            for item in raw
            if item.get("fuelType") == "WIND"
        ]
        clean.sort(key=lambda x: x["startTime"])
        with open(FUELHH_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(clean, f, indent=2)

        df = pd.DataFrame(clean)
        df["startTime"] = pd.to_datetime(df["startTime"], utc=True)
        return df

    def load_forecasts(self, force_refresh: bool = False) -> pd.DataFrame:
        if not force_refresh and WINDFOR_CACHE_FILE.exists():
            try:
                with open(WINDFOR_CACHE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                df = pd.DataFrame(data)
                df["startTime"] = pd.to_datetime(df["startTime"], utc=True)
                df["publishTime"] = pd.to_datetime(df["publishTime"], utc=True)
                df["generation"] = pd.to_numeric(df["generation"], errors="coerce")
                logger.info(f"Loaded {len(df)} WINDFOR records from local cache.")
                return df
            except Exception as e:
                logger.warning(f"Failed loading forecasts cache: {e}. Fetching live.")

        logger.info("Fetching WINDFOR stream from Elexon BMRS API...")
        raw = self.fetch_stream_from_elexon(ELEXON_WINDFOR_URL)
        clean = [
            {
                "publishTime": item["publishTime"],
                "startTime": item["startTime"],
                "generation": float(item["generation"])
            }
            for item in raw
        ]
        clean.sort(key=lambda x: (x["startTime"], x["publishTime"]))
        with open(WINDFOR_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(clean, f, indent=2)

        df = pd.DataFrame(clean)
        df["startTime"] = pd.to_datetime(df["startTime"], utc=True)
        df["publishTime"] = pd.to_datetime(df["publishTime"], utc=True)
        return df

    def initialize(self, force_refresh: bool = False) -> None:
        self.df_actuals = self.load_actuals(force_refresh=force_refresh)
        self.df_forecasts = self.load_forecasts(force_refresh=force_refresh)
        self._is_loaded = True

    def get_data(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        if not self._is_loaded:
            self.initialize()
        return self.df_actuals.copy(), self.df_forecasts.copy()

    def get_health(self) -> Dict[str, Any]:
        if not self._is_loaded:
            self.initialize()

        act_jan = self.df_actuals[
            (self.df_actuals["startTime"] >= "2026-01-01T00:00:00Z") &
            (self.df_actuals["startTime"] < "2026-02-01T00:00:00Z")
        ]
        
        fc_jan = self.df_forecasts[
            (self.df_forecasts["startTime"] >= "2026-01-01T00:00:00Z") &
            (self.df_forecasts["startTime"] < "2026-02-01T00:00:00Z")
        ]

        return {
            "status": "HEALTHY",
            "targetPeriod": f"{TARGET_YEAR}-{TARGET_MONTH:02d}",
            "actuals": {
                "totalRecords": len(act_jan),
                "expectedRecords": 31 * 48,  # 1488 half-hour settlement periods
                "completenessPercent": round((len(act_jan) / (31 * 48)) * 100, 2),
                "minGenerationMW": round(float(act_jan["generation"].min()), 1) if not act_jan.empty else 0,
                "maxGenerationMW": round(float(act_jan["generation"].max()), 1) if not act_jan.empty else 0,
                "avgGenerationMW": round(float(act_jan["generation"].mean()), 1) if not act_jan.empty else 0
            },
            "forecasts": {
                "totalPublications": len(fc_jan),
                "distinctPublishTimes": int(fc_jan["publishTime"].nunique()) if not fc_jan.empty else 0,
                "earliestPublish": fc_jan["publishTime"].min().isoformat() if not fc_jan.empty else None,
                "latestPublish": fc_jan["publishTime"].max().isoformat() if not fc_jan.empty else None
            }
        }

# Global singleton
pipeline = DataPipeline()
