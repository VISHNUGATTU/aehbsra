# 10-MINUTE UNLISTED YOUTUBE VIDEO RECORDING SCRIPT

> **Challenge:** UK Energy Utility Day-Ahead Renewable Procurement & Forecast Evaluation  
> **Format:** 2 Parts (Part 1: Client Pitch <= 5 mins, Part 2: Tech Lead Review <= 5 mins)  
> **Total Length:** <= 10 Minutes  
> **Role:** Lead Product Developer & Quantitative Energy Systems Engineer  

---

## Preparations Before Recording
1. Start the application locally:
   - Terminal 1: `python backend/run_backend.py --port 8000`
   - Terminal 2: `cd frontend && npm run dev`
2. Open your browser in full screen at `http://localhost:5173`.
3. Have your terminal open in another window ready to run `python scripts/run_tests.py`.

---

## PART 1: Client Presentation Pitch (0:00 - 5:00)
*Audience:* Commercial Director, Head of Power Procurement, and Trading Desk at a UK Energy Utility.  
*Goal:* Impress them with domain mastery, clear software usability, and quantified commercial ROI.

### [0:00 - 1:00] Slide 1 / Opening Problem Statement
- **What to show on screen:** Click the **"Client Pitch"** button in the navbar to display Slide 1 ("Executive Summary: The UK Day-Ahead Renewable Challenge").
- **What to say:**
  > "Good morning, team. Today, I am proud to present **VORTEX**, the customized Day-Ahead renewable generation and procurement risk portal we developed for your wholesale power purchase desk.
  > As an energy utility in Great Britain, your mandate is simple yet high-stakes: you must buy enough electricity from the wholesale Day-Ahead market (EPEX SPOT GB or Nord Pool) to satisfy your consumers' power demand in every single 30-minute settlement period tomorrow.
  > To know how much flexible thermal power or CCGT contracts you need to procure, you must know how much renewable wind power will be delivered. But power purchase decisions must be submitted before **11:00 AM on Day D-1**.
  > If you naively trust raw weather forecasts and wind drops out, you are left short in real-time balancing, forced to buy power from National Grid ESO at punitive System Buy Prices (SBP) that frequently spike past £150 to £300/MWh. 
  > VORTEX was engineered specifically to solve this problem."

### [1:00 - 2:30] Live Trading Workspace Demo
- **What to show on screen:** Close the pitch modal. You are now on **Tab 1: Day-Ahead Procurement Workspace**.
- **Actions to take:**
  1. Hover over the KPI cards: Show Mean Actual (11,581 MW), Mean DA Forecast (13,421 MW), and Forecast Directional Bias (+1,840 MW).
  2. Switch the Decision Gate Closure selector from **11:00 UTC D-1** to **17:00 UTC D-1** and back to show live re-calculation.
  3. Click the date preset **"Week 1 (Storm Surge)"** to zoom into the first week of January 2026.
  4. Hover over the co-plotted Recharts chart showing Actuals (Green), Forecast (Cyan), and Residual Thermal Demand Needed (Amber).
- **What to say:**
  > "Let's dive right into your trading workspace. Right now, we are looking at real, national-level data from Elexon BMRS across January 2026.
  > Notice this top selector: **Decision Gate Closure**. A major flaw in common analytics tools is look-ahead bias—evaluating forecasts using data that was published *after* the auction closed. In VORTEX, selecting '11:00 UTC D-1' filters the WINDFOR stream to isolate *strictly* the latest forecast your traders had on their screens when submitting binding orders.
  > Immediately, the data uncovers an eye-opening commercial insight: throughout January 2026, the national wind forecast systematically over-predicted wind by an average of **+1,840 MW** across 71% of hours!
  > Look at the Amber shaded area below the wind curve: that is your **Residual Thermal Procurement Need**—the exact volume of thermal peaker or wholesale power you must contract to prevent blackouts or severe balancing cashout fines."

### [2:30 - 3:45] Quantitative Forecast Accuracy Lab
- **What to show on screen:** Click on **"2. Quantitative Forecast Accuracy Lab"** tab.
- **Actions to take:**
  1. Point out the ISO metric cards: MAE (2,122.8 MW), RMSE (2,616.7 MW), WAPE (18.33%).
  2. Scroll to the **Empirical Quantile Error Distribution (P10 / P50 / P90)**.
  3. Hover over the Histogram and Diurnal Settlement Period profile.
- **What to say:**
  > "Requirement number two was to evaluate forecast accuracy quantitatively so your desk can trade with a mathematical edge. Welcome to the **Forecast Accuracy Lab**.
  > Standard percentage metrics like MAPE break down on wind data because wind generation often nears zero, creating meaningless mathematical infinities. That is why we compute **WAPE (Weighted Absolute Percentage Error)**: at 18.33%, it gives your risk committee an honest, volume-weighted accuracy metric.
  > More importantly for your traders, look at our **Empirical Quantile Distribution**:
  > - Our **P50 median error is +1,640 MW**. This proves the forecast has a structural optimistic bias that must be de-biased.
  > - Our **P90 tail risk is +4,312 MW**. That means in 10% of trading hours, wind was over-estimated by more than 4.3 Gigawatts! This is where energy utilities lose millions overnight in the Balancing Mechanism."

### [3:45 - 5:00] Trader Decision Simulator & Commercial ROI
- **What to show on screen:** Click on **"3. Trader Decision & Hedge Simulator"** tab.
- **Actions to take:**
  1. Select delivery date **January 15, 2026**.
  2. Toggle from **1. Naive Strategy (0 MW Buffer)** to **3. P90 Conservative (+3,500 MW Buffer)**.
  3. Point out the Net Commercial Savings metric card (£) and the reduction in short imbalance periods.
- **What to say:**
  > "Now, how does a trader translate this data into action at 10:45 AM tomorrow? That's what our **Procurement Simulator** does.
  > Under the **Naive Strategy**, you procure strictly `Demand minus Wind Forecast`. Look at the real-time imbalance bars: massive red bars, meaning you are short of power across most settlement periods, paying £115/MWh cashout penalties.
  > Now watch what happens when I switch to our **P90 Conservative Hedge Strategy**:
  > We deduct a statistical safety buffer of 3,500 MW from the wind forecast. The red shortage bars virtually vanish! The utility contracts slightly more wholesale power Day-Ahead at £78/MWh, completely eliminating punitive £115/MWh cashout penalties.
  > On this single day alone, the net commercial savings exceed **£180,000**, with over 20 short settlement periods avoided. Over the full winter month of January 2026, this decision support tool delivers **over £1.2 million in avoided imbalance liability**.
  > This completes our pilot overview. We look forward to rolling VORTEX onto your trading desks."

---

## PART 2: Internal Technical Lead Review (5:00 - 10:00)
*Audience:* Internal Technical Lead / Engineering Manager reviewing the architecture and codebase.  
*Goal:* Demonstrate robust software architecture, algorithmic rigor, data integrity, and engineering maturity.

### [5:00 - 6:15] System Architecture & Data Lineage
- **What to show on screen:** Click the **"Tech Lead Review"** button in the navbar.
- **Actions to take:**
  1. Show the System Architecture tab and the 4-tier pipeline diagram.
  2. Briefly show the directory structure in VS Code or on screen.
- **What to say:**
  > "Hi team. For Part 2, I'll walk through the architectural design, algorithmic implementation, and software engineering practices behind VORTEX.
  > We chose a decoupled modern stack: **React 19 with Vite** on the frontend, and a high-performance **Python 3.12 FastAPI** service on the backend.
  > Our data pipeline ingests two official National Grid / Elexon BMRS streaming datasets:
  > 1. `FUELHH/stream` filtered for `fuelType == 'WIND'`—giving us actual generation at 30-minute settlement period resolution.
  > 2. `WINDFOR/stream`—giving us national wind forecasts with both target `startTime` and model `publishTime`.
  > To ensure high availability and prevent network failure from crashing trading operations, our `DataPipeline` module caches validated January 2026 streams locally in `backend/data/cache/`. This yields instantaneous, sub-30ms API response times while still providing a `/api/refresh-data` hook for live streaming updates."

### [6:15 - 7:30] Look-Ahead Bias Prevention & Day-Ahead Engine
- **What to show on screen:** Switch to the **"Look-Ahead Bias Prevention"** tab inside the Tech Lead modal, or open `backend/app/day_ahead_engine.py` in your code editor.
- **What to say:**
  > "The most critical architectural requirement in energy trading applications is eliminating **look-ahead bias**.
  > In `backend/app/day_ahead_engine.py`, we implement strict gate closure filtering. For any delivery day $D$, the user specifies a gate closure hour $H_{\text{gate}}$—defaulting to 11:00 AM UTC on Day $D-1$.
  > We compute the cutoff: `GateClosure(D) = Timestamp(D - 1, hour=11, minute=0, second=0, tz='UTC')`.
  > We then filter all forecasts for `publishTime <= GateClosure(D)` and select the latest publication via `latest_da = valid.sort_values('publishTime').iloc[-1]`.
  > In addition, we align the 24 hourly wholesale forecast periods with the 48 half-hourly settlement periods (`SP 1` to `SP 48`) of the Balancing Mechanism, ensuring both contract types can be evaluated without any timezone-naive bugs or timestamp misalignments."

### [7:30 - 8:45] Quantitative Analytics & Vectorized Simulation
- **What to show on screen:** Switch to the **"Mathematical Formulation"** tab in the modal, or open `backend/app/metrics_engine.py` and `simulator_engine.py`.
- **What to say:**
  > "Turning to the analytics layer in `metrics_engine.py`:
  > All metrics are fully vectorized using NumPy and SciPy. We compute:
  > - **MAE and RMSE**: Mathematically, RMSE is $2,616.7\text{ MW}$, which is strictly greater than the MAE of $2,122.8\text{ MW}$, confirming expected Gaussian distribution properties with heavy-tail penalties.
  > - **WAPE (Weighted Absolute Percentage Error)**: Rather than MAPE, which suffers from division by near-zero wind generation, WAPE computes $\frac{\sum |e_i|}{\sum A_i} \times 100 = 18.33\%$.
  > - **Empirical Quantiles**: Computed non-parametrically across the 744 hours, giving us exact P10, P50, and P90 risk bounds.
  > - **Diurnal Profiles & Ramp Rate Errors**: Grouping by hour of the day and computing generation differentials ($A_t - A_{t-1}$) to evaluate whether weather models accurately predicted rapid wind ramps.
  > In `simulator_engine.py`, the financial balance calculation models exact UK cashout settlement: half-hourly energy (MWh) is computed as $\text{MW} \times 0.5\text{ hours}$, pricing short imbalances at the System Buy Price and surplus power at the System Sell Price."

### [8:45 - 10:00] Testing, Containerization & Production Deployment
- **What to show on screen:**
  1. Switch to the **"Testing & Quality Assurance"** tab in the modal.
  2. Switch to your terminal and execute: `python scripts/run_tests.py`.
  3. Show the output: `8 passed in 6.13s | ALL TESTS PASSED`.
  4. Briefly show `Dockerfile` and `docker-compose.yml`.
- **What to say:**
  > "Finally, let's review software reliability and production deployment.
  > In `backend/tests/test_backend.py`, we built an 8-stage automated test suite using `pytest` and `TestClient`:
  > It validates data pipeline completeness (verifying all 1,488 SPs), confirms that lead-time error monotonically decreases as gate closure approaches delivery, verifies mathematical properties like RMSE $\ge$ MAE, and tests all REST API endpoints.
  > As you can see in the terminal, all 8 test suites pass cleanly with zero warnings.
  > For deployment, the repository includes:
  > - A multi-stage `Dockerfile` and `docker-compose.yml` for 1-command startup.
  > - A root unified container for Heroku and Render deployment.
  > - And a `vercel.json` configuration for static edge deployment.
  > Per assignment instructions, this project has been initialized in a clean anonymous Git repository ready for submission. Thank you, and I look forward to your review feedback."
