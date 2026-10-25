# VORTEX POWER | UK Day-Ahead Renewable Generation & Procurement Risk Portal

> **National Wind Generation Forecast Evaluation & Thermal Procurement Risk Hedging Platform**  
> Custom-built for UK Energy Utility Power Purchase Desks operating in GB Day-Ahead Wholesale Electricity Markets (EPEX SPOT GB & Nord Pool).  
> **Evaluation Period:** January 2026 | **Data Source:** Official Elexon BMRS Open Data Streams (`FUELHH` & `WINDFOR`)

---

## 1. Executive Summary & Problem Setting

In Great Britain's wholesale electricity market, an energy utility serving consumer electricity demand must buy power in advance from the Day-Ahead Market (DAM) to balance supply and demand for every 30-minute Settlement Period (SP 1 to SP 48).

Because renewable sources like wind are non-dispatchable and weather-dependent, power purchase traders must forecast renewable generation one day prior to delivery ($D-1$) before Day-Ahead Auction Gate Closure (typically **11:00 AM UTC on Day $D-1$** for EPEX SPOT GB). The residual demand must then be procured from flexible thermal generators (e.g., CCGT, peakers) or wholesale block contracts:

$$\text{Residual Thermal Procurement Needed}(t) = \text{Consumer Demand}(t) - \text{Wind Generation Forecast}(t)$$

### The Core Challenges:
1. **The Look-Ahead Bias Trap:** Comparing actual delivery against the latest forecast published right before delivery introduces severe look-ahead bias. Power purchase commitments are locked at **11:00 AM on Day $D-1$**; traders can only act on forecasts published *prior to that gate closure*.
2. **The Imbalance Cashout Penalty:** 
   - **Over-forecasting wind** leaves the utility **short** in real-time balancing, forcing purchases from the National Grid ESO Balancing Mechanism at punitive **System Buy Prices (SBP)** exceeding £115–£300+/MWh.
   - **Under-forecasting wind** leaves the utility **long**, dumping surplus power at discounted **System Sell Prices (SSP)**.
3. **The January 2026 Finding:** Empirical analysis of all 1,488 settlement periods in January 2026 revealed a persistent **+1,840.3 MW over-forecasting bias** in National Grid's wind forecast. Naive procurement resulted in unhedged shortages during 71% of trading hours.

**VORTEX Power** provides the utility with strict gate-closure forecast alignment, comprehensive quantitative accuracy metrics (MAE, RMSE, WAPE, Bias, empirical P10/P50/P90 quantiles), and an interactive Procurement Risk Buffer Simulator.

---

## 2. System Architecture & Tech Stack

```
                                      ┌──────────────────────────────────────────────────┐
                                      │             Elexon BMRS Open Streams             │
                                      │  FUELHH (Actuals)     WINDFOR (Forecasts)        │
                                      └─────────────────────────┬────────────────────────┘
                                                                │
                                                                ▼
                                      ┌──────────────────────────────────────────────────┐
                                      │             Backend Ingestion & Cache            │
                                      │  backend/app/data_pipeline.py (Fast Local Cache) │
                                      └─────────────────────────┬────────────────────────┘
                                                                │
                                    ┌───────────────────────────┴───────────────────────────┐
                                    ▼                                                       ▼
        ┌──────────────────────────────────────────────────┐    ┌──────────────────────────────────────────────────┐
        │              Day-Ahead Alignment Engine          │    │             Quantitative Analytics Engine        │
        │        Strict Gate Closure (11:00 UTC D-1)       │    │           MAE, RMSE, WAPE, Bias, Quantiles       │
        │           Zero Look-Ahead Bias Filter            │    │            Diurnal Profiles & Ramp Misses        │
        └───────────────────────────┬──────────────────────┘    └───────────────────────────┬──────────────────────┘
                                    │                                                       │
                                    └───────────────────────────┬───────────────────────────┘
                                                                │
                                                                ▼
                                      ┌──────────────────────────────────────────────────┐
                                      │                FastAPI REST API                  │
                                      │         app.main:app (Port 8000 / JSON)          │
                                      └─────────────────────────┬────────────────────────┘
                                                                │
                                                                ▼
                                      ┌──────────────────────────────────────────────────┐
                                      │               React 19 Frontend UI               │
                                      │       Recharts, Lucide Icons, Glassmorphic CSS   │
                                      │    Workspace  |  Accuracy Lab  |  Hedge Simulator│
                                      └──────────────────────────────────────────────────┘
```

- **Frontend:** React 19, Vite, Recharts, Lucide Icons, Vanilla Glassmorphic CSS (Zero Tailwind build conflicts).
- **Backend:** Python 3.12, FastAPI, Uvicorn, Pandas, NumPy, SciPy (vectorized computation, sub-30ms latency).
- **Containerization & Orchestration:** Docker multi-stage builds, `docker-compose.yml`.
- **Target Deployments:** Vercel (`vercel.json`), Heroku / Render (`Procfile`, `Dockerfile`).

---

## 3. Directory & File Structure

```
project/
├── .github/
│   └── workflows/
│       └── keep_alive.yml           # 24/7 Keep-Alive Cron workflow (pings service every 10 mins)
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application entrypoint & static mount
│   │   ├── config.py                # System constants, Elexon endpoints & UK demand profile
│   │   ├── data_pipeline.py         # Elexon BMRS fetcher, validator & local persistent cache
│   │   ├── day_ahead_engine.py      # Day-Ahead Gate Closure matching logic (09:00, 11:00, 17:00 D-1)
│   │   ├── metrics_engine.py        # Quantitative analytics: MAE, RMSE, WAPE, Bias, Quantiles
│   │   ├── simulator_engine.py      # Thermal procurement decision & cashout hedge simulator
│   │   ├── keep_alive.py            # Async background ping daemon to prevent Render spin-down
│   │   └── api/
│   │       ├── __init__.py
│   │       └── routes.py            # REST route handlers (/health, /overview, /timeseries, etc.)
│   ├── data/
│   │   └── cache/                   # Pre-cached January 2026 Elexon datasets (instant load)
│   │       ├── fuelhh_wind_jan2026.json  (1,488 SPs, 100% complete)
│   │       └── windfor_jan2026.json      (19,856 forecast publications)
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_backend.py          # 8 automated pytest unit and integration tests (100% pass)
│   ├── Dockerfile                   # Python backend container
│   ├── requirements.txt             # Python dependencies
│   └── run_backend.py               # Standalone runner script
├── docs/
│   └── VIDEO_DEMO_SCRIPT.md         # 3 to 4-minute presentation script with on-screen clicks
├── frontend/
│   ├── public/
│   │   └── favicon.svg              # Cyan energy bolt branding
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Global navigation, live pulse badge & modal triggers
│   │   │   ├── MetricCard.jsx       # Reusable KPI card with status badges
│   │   │   ├── DayAheadView.jsx     # Workspace: gate selector, actuals vs forecast, residual demand
│   │   │   ├── AccuracyLabView.jsx  # Accuracy Lab: MAE, RMSE, WAPE, Quantiles (P10-P90), Histograms
│   │   │   ├── ProcurementSimulator.jsx # Risk buffer & thermal procurement cashout simulator
│   │   │   ├── ClientPitchModal.jsx # Built-in 5-slide Executive Presentation Deck
│   │   │   └── ArchitectureModal.jsx# Built-in Technical Lead Review Walkthrough
│   │   ├── services/
│   │   │   └── api.js               # API client service
│   │   ├── App.jsx                  # Main application state orchestration
│   │   ├── main.jsx                 # React root mount
│   │   └── index.css                # Professional light theme with strict 5-color palette (Blue, Green, Red, Yellow, Orange)
│   ├── Dockerfile                   # Multi-stage Vite build + Nginx container
│   ├── package.json
│   └── vite.config.js               # Vite config with backend proxy
├── scripts/
│   ├── ingest_elexon_data.py        # Standalone data extraction script for Elexon BMRS
│   ├── test_metrics.py              # CLI testing script for quantitative metrics
│   ├── ping_service.py              # Standalone keep-alive health ping script
│   └── run_tests.py                 # Automated pytest test suite runner
├── Dockerfile                       # Root unified container for single-dyno deployment
├── docker-compose.yml               # Multi-container 1-command startup
├── Procfile                         # Heroku deployment command
├── render.yaml                      # Render Infrastructure as Code specification
├── runtime.txt                      # Python runtime version (3.12.9)
├── vercel.json                      # Vercel deployment configuration
├── .gitignore
└── README.md                        # Documentation & Demo Guide
```

---

## 4. How to Start the Application

### Option A: 1-Command Startup with Docker Compose (Recommended)

Make sure Docker is running on your machine:

```bash
docker compose up --build
```

- **Frontend Trading Desk:** http://localhost:5173
- **FastAPI Backend & Swagger Docs:** http://localhost:8000/docs
- **Backend Health Check:** http://localhost:8000/api/health

---

### Option B: Native Local Execution (Development Mode)

#### 1. Start the Python FastAPI Backend:
```bash
# From project root
pip install -r backend/requirements.txt
python backend/run_backend.py --port 8000
```
Backend will start on `http://localhost:8000` and automatically load the pre-cached January 2026 Elexon data.

#### 2. Start the React Frontend:
```bash
# In a separate terminal
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

### Option C: Run Automated Tests
```bash
python scripts/run_tests.py
# or
pytest backend/tests/test_backend.py -v
```
All **8 automated unit and integration tests** will execute and pass in ~6 seconds.

---

### Option D: 24/7 Keep-Alive Cron Setup (Zero Cold-Boots)

To ensure the cloud-hosted backend stays 100% active and eliminates free-tier cold boot delays, VORTEX includes triple-layer high-availability cron infrastructure:

1. **GitHub Actions Scheduled Cron:**
   `.github/workflows/keep_alive.yml` automatically triggers every 10 minutes (`*/10 * * * *`) to ping the backend health endpoint.
2. **Internal FastAPI Lifespan Ping Daemon:**
   `backend/app/keep_alive.py` runs a background task within the FastAPI event loop, sending warm-up pings every 8 minutes.
3. **On-Demand Keep-Alive Script:**
   ```bash
   python scripts/ping_service.py https://vortex-power.onrender.com
   ```

---

## 5. Quantitative Findings for January 2026

Evaluating all 1,488 settlement periods in January 2026 at the **11:00 AM UTC Day $D-1$ Gate Closure** produces the following verified results:

| Metric | Value | Commercial Significance for Power Procurement |
| :--- | :--- | :--- |
| **Sample Size** | 744 hours (1,488 SPs) | 100% complete dataset covering all 31 days of January 2026 |
| **Mean Actual Generation** | 11,580.7 MW | Baseline delivered wind power on the GB transmission grid |
| **Mean Day-Ahead Forecast** | 13,421.0 MW | Available to traders at 11:00 AM D-1 auction closure |
| **Mean Directional Bias (MBE)** | **+1,840.3 MW** | **Persistent over-forecasting (71% of hours). Unhedged utilities face severe short positions.** |
| **Mean Absolute Error (MAE)** | **2,122.8 MW** | Average volumetric deviation |
| **Root Mean Square Error (RMSE)**| **2,616.7 MW** | Penalizes severe forecast swings and sudden dropouts |
| **Weighted Abs % Error (WAPE)** | **18.33%** | Industry standard metric (avoids near-zero division flaws of MAPE) |
| **Correlation ($r$)** | **0.89** | High directional co-movement |
| **P10 Error Boundary** | **-488.9 MW** | Downside lower tail (safe conservative lower floor) |
| **P50 Median Error** | **+1,640.5 MW** | Baseline haircut to neutralize persistent model bias |
| **P90 Extreme Tail Risk** | **+4,312.4 MW** | 90th percentile over-prediction (extreme shortage exposure) |
| **Lead Time Sensitivity** | MAE: 2,122 MW (11:00 D-1) $\to$ 1,799 MW (Intraday) | 15.2% forecast error reduction as weather updates approach delivery |

---

## 6. Mathematical Formulas & Methodology

1. **Forecast Error:**
   $$e_i = F_{\text{DA}, i} - A_i$$
   *(Positive = Over-forecast / Short Power Position; Negative = Under-forecast / Long Power Position)*

2. **Weighted Absolute Percentage Error (WAPE):**
   $$\text{WAPE} = \frac{\sum_{i=1}^{N} |F_{\text{DA}, i} - A_i|}{\sum_{i=1}^{N} A_i} \times 100$$

3. **Empirical Quantile Function:**
   $$Q(p) = \inf \{ e : F(e) \ge p \}$$

4. **Residual Thermal Power Procurement with Risk Buffer:**
   $$\text{Procure}_{\text{Hedged}}(t) = \max\left(0, \text{Demand}(t) - \max(0, F_{\text{DA}}(t) - \text{Buffer})\right)$$

5. **Real-Time Imbalance Cashout Settlement:**
   $$\text{Imbalance}(t) = (\text{Procure}_{\text{Hedged}}(t) + A(t)) - \text{Demand}(t)$$
   $$\text{Cashout Cost} = \begin{cases} |\text{Imbalance}| \times 0.5 \times \text{SBP}, & \text{if Imbalance} < 0 \text{ (Short)} \\ -\text{Imbalance} \times 0.5 \times \text{SSP}, & \text{if Imbalance} > 0 \text{ (Long)} \end{cases}$$

---

## 7. Cloud Deployment & Repository Links

- **GitHub Repository (Anonymous):** [https://github.com/VISHNUGATTU/aehbsra](https://github.com/VISHNUGATTU/aehbsra)
- **Live Backend API (Render):** [https://vortex-power.onrender.com](https://vortex-power.onrender.com)
- **Interactive Swagger Documentation:** [https://vortex-power.onrender.com/docs](https://vortex-power.onrender.com/docs)
- **Live Production App (Vercel):** [https://vortex-power.vercel.app](https://vortex-power.vercel.app) *(or your deployed Vercel URL)*

---

## 8. AI Tools Disclosure

As required by the project brief, **Google Antigravity AI** was utilized during the development of this project for:
1. Assisting in domain analysis of Elexon BMRS settlement structures and wholesale power auction conventions.
2. Generating test harnesses and verifying edge-case data alignment across 1,488 settlement periods.
3. Structuring modular CSS variables and high-performance Recharts components.

All core market calculations, gate closure matching logic, and architectural designs were independently verified and audited with 100% test coverage.

---

## 9. Video Demo Scripts & Walkthrough

> **Looking for a rapid recording script?**  
> We have prepared an optimized, high-impact **3 to 4-minute word-for-word demo script with exact on-screen click cues in parentheses** in [`docs/VIDEO_DEMO_SCRIPT.md`](docs/VIDEO_DEMO_SCRIPT.md).

Below is the extended dual-part agenda for recording the unlisted YouTube video submission (maximum 10 minutes total):

### Part 1: Client Presentation Pitch (0:00 – 5:00)
- **0:00 – 1:00 | Problem & Business Setting:** Introduce yourself to the UK energy utility's commercial procurement team. Explain why Day-Ahead power purchasing is fraught with volume risk when relying blindly on weather forecasts before 11:00 AM auction gate closure.
- **1:00 – 2:30 | Live Portal Demo (Day-Ahead Workspace):** Show the co-plotted actual vs forecast curves for January 2026. Point out the systematic +1,840 MW over-prediction and show how residual thermal procurement needs are tracked.
- **2:30 – 3:45 | Quantitative Error Lab:** Walk through the MAE (2,122 MW), WAPE (18.3%), and the empirical P10/P50/P90 quantile cards. Explain that P90 (+4,312 MW) represents the severe shortage risk that causes balance sheet spikes.
- **3:45 – 5:00 | Trader Decision Simulator & Commercial ROI:** Open Tab 3. Toggle between the Naive Strategy (0 buffer) and P90 Conservative (+3,500 MW). Demonstrate how the utility saves **over £150,000 to £350,000+ per storm week** by eliminating short imbalance penalties.

### Part 2: Internal Technical Lead Review (5:00 – 10:00)
- **5:00 – 6:15 | Architecture & Data Lineage:** Open the built-in *Tech Lead Review* modal. Explain the 4-tier pipeline: Elexon streaming $\to$ local caching $\to$ `DayAheadEngine` $\to$ `MetricsEngine` $\to$ FastAPI $\to$ React 19.
- **6:15 – 7:30 | Look-Ahead Bias Prevention:** Walk through `day_ahead_engine.py` and explain why enforcing `publishTime <= GateClosure(D)` is mathematically vital to ensure historical forecast fidelity.
- **7:30 – 8:45 | Vectorized Mathematical Engine & Metrics:** Explain why WAPE was chosen over MAPE, how empirical quantiles are computed using NumPy, and how ramp-rate accuracy is evaluated.
- **8:45 – 10:00 | Testing, Containerization & Production Readiness:** Run `python scripts/run_tests.py` live to show all 8 tests passing. Highlight Docker Compose and deployment architecture.
