"""
Elexon BMRS Data Ingestion & Cache Script for UK Wind Generation & Forecasts
Target: January 2026
Sources:
  - Actuals: FUELHH/stream (fuelType == 'WIND')
  - Forecasts: WINDFOR/stream (National Wind Generation Forecasts)
"""

import os
import json
import urllib.request
import urllib.error
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "backend", "data", "cache")
os.makedirs(DATA_DIR, exist_ok=True)

FUELHH_CACHE = os.path.join(DATA_DIR, "fuelhh_wind_jan2026.json")
WINDFOR_CACHE = os.path.join(DATA_DIR, "windfor_jan2026.json")

def fetch_json_stream(url: str, timeout: int = 45) -> list:
    headers = {"User-Agent": "UK-Utility-DayAhead-Forecasting-Engine/1.0"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        content = resp.read().decode("utf-8")
        return json.loads(content)

def ingest_actuals():
    print("Ingesting FUELHH (Actual Wind Generation) for Jan 2026...")
    url = (
        "https://data.elexon.co.uk/bmrs/api/v1/datasets/fuelhh/stream?"
        "publishDateTimeFrom=2025-12-31T23:00:00Z&"
        "publishDateTimeTo=2026-02-01T01:00:00Z"
    )
    raw = fetch_json_stream(url)
    print(f"Total FUELHH rows fetched: {len(raw)}")
    
    # Filter for fuelType == 'WIND'
    wind_actuals = [
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
    
    # Sort chronologically by startTime
    wind_actuals.sort(key=lambda x: x["startTime"])
    print(f"Extracted WIND records: {len(wind_actuals)}")
    if wind_actuals:
        print(f"  Start: {wind_actuals[0]['startTime']} -> End: {wind_actuals[-1]['startTime']}")
        print(f"  Min Gen: {min(x['generation'] for x in wind_actuals):.1f} MW, Max Gen: {max(x['generation'] for x in wind_actuals):.1f} MW")

    with open(FUELHH_CACHE, "w", encoding="utf-8") as f:
        json.dump(wind_actuals, f, indent=2)
    print(f"Saved to {FUELHH_CACHE}")
    return wind_actuals

def ingest_forecasts():
    print("\nIngesting WINDFOR (Wind Forecasts) for Jan 2026 decision horizon...")
    url = (
        "https://data.elexon.co.uk/bmrs/api/v1/datasets/windfor/stream?"
        "publishDateTimeFrom=2025-12-30T00:00:00Z&"
        "publishDateTimeTo=2026-02-01T23:59:59Z"
    )
    raw = fetch_json_stream(url)
    print(f"Total WINDFOR rows fetched: {len(raw)}")
    
    forecasts = [
        {
            "publishTime": item["publishTime"],
            "startTime": item["startTime"],
            "generation": float(item["generation"])
        }
        for item in raw
    ]
    
    forecasts.sort(key=lambda x: (x["startTime"], x["publishTime"]))
    print(f"Cleaned WINDFOR records: {len(forecasts)}")
    if forecasts:
        start_times = [x["startTime"] for x in forecasts]
        pub_times = [x["publishTime"] for x in forecasts]
        print(f"  Target startTime range: {min(start_times)} -> {max(start_times)}")
        print(f"  publishTime range: {min(pub_times)} -> {max(pub_times)}")
    
    with open(WINDFOR_CACHE, "w", encoding="utf-8") as f:
        json.dump(forecasts, f, indent=2)
    print(f"Saved to {WINDFOR_CACHE}")
    return forecasts

if __name__ == "__main__":
    actuals = ingest_actuals()
    forecasts = ingest_forecasts()
    print("\nData ingestion complete!")
