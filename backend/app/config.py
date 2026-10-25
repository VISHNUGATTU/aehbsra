"""
Application Configuration and Constants for UK Power Day-Ahead Forecasting System
"""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "cache"
DATA_DIR.mkdir(parents=True, exist_ok=True)

FUELHH_CACHE_FILE = DATA_DIR / "fuelhh_wind_jan2026.json"
WINDFOR_CACHE_FILE = DATA_DIR / "windfor_jan2026.json"

# Elexon BMRS API Endpoints
ELEXON_FUELHH_URL = (
    "https://data.elexon.co.uk/bmrs/api/v1/datasets/fuelhh/stream?"
    "publishDateTimeFrom=2025-12-31T23:00:00Z&"
    "publishDateTimeTo=2026-02-01T01:00:00Z"
)
ELEXON_WINDFOR_URL = (
    "https://data.elexon.co.uk/bmrs/api/v1/datasets/windfor/stream?"
    "publishDateTimeFrom=2025-12-30T00:00:00Z&"
    "publishDateTimeTo=2026-02-01T23:59:59Z"
)

# Market Defaults
DEFAULT_GATE_CLOSURE_HOUR = 11  # 11:00 AM UTC Day D-1 (EPEX SPOT GB Day-Ahead Auction)
TARGET_YEAR = 2026
TARGET_MONTH = 1

# Standard UK Winter Demand Profile (MW) by Settlement Period 1 to 48 (Approximation for Residual Procurement)
# Scaled to typical UK national transmission system demand in January (28 GW night valley to 46 GW evening peak)
UK_WINTER_TYPICAL_DEMAND = [
    27500, 26800, 26200, 25800, 25500, 25400, 25600, 26200,  # 00:00 - 04:00 (SP 1-8)
    27500, 29500, 32500, 35500, 38000, 39500, 40500, 41000,  # 04:00 - 08:00 (SP 9-16)
    40800, 40500, 40200, 40000, 39800, 39600, 39500, 39400,  # 08:00 - 12:00 (SP 17-24)
    39200, 39000, 39100, 39500, 40200, 41500, 43000, 44800,  # 12:00 - 16:00 (SP 25-32)
    45500, 45800, 45200, 44000, 42500, 40500, 38500, 36500,  # 16:00 - 20:00 (SP 33-40)
    34500, 32800, 31200, 29800, 28800, 28200, 27800, 27200   # 20:00 - 24:00 (SP 41-48)
]
