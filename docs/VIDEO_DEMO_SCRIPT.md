# 3 TO 4-MINUTE VIDEO DEMO SCRIPT

> **Total Video Duration:** 3 to 4 Minutes  
> **Format:** Spoken script with exact on-screen clicks and actions inside `(parentheses)`.  
> **Target Audience:** Energy Utility Commercial Director, Procurement Desk & Technical Reviewers.  
> **Preparation:** Open `http://localhost:5173` (or live URL) in full screen. Have terminal ready in background with `python scripts/run_tests.py`.

---

### [0:00 - 0:40] Introduction & The Commercial Challenge

(Screen shows the main dashboard at `http://localhost:5173`. Point cursor to the header title: "VORTEX POWER - UK Day-Ahead Energy Desk" and the live Elexon January 2026 indicator.)

"Hello everyone. Today I'm presenting **VORTEX**, a specialized Day-Ahead renewable forecast evaluation and thermal power procurement risk platform built for UK energy utility trading desks.

As a UK power purchaser, your commercial challenge is critical: you must buy wholesale power on EPEX SPOT or Nord Pool before the **11:00 AM auction gate closure on Day D-1** to cover tomorrow's consumer demand. 

To calculate how much flexible thermal power you need to contract, you rely on national wind forecasts. But if the forecast over-predicts and actual wind drops out, you are caught short in real-time balancing—forced to buy emergency power from National Grid ESO at punitive System Buy Prices that spike beyond £115 to £300 per Megawatt-hour. 

VORTEX was engineered to give trading desks the mathematical tools to eliminate this risk."

---

### [0:40 - 1:40] Tab 1: Day-Ahead Procurement Workspace

(Click on **"1. Day-Ahead Procurement Workspace"** tab. Point cursor to the 5 top KPI cards: Actual Wind 11,581 MW, Day-Ahead Forecast 13,421 MW, Systematic Bias +1,840 MW.)

"Here in the primary Day-Ahead Workspace, we are analyzing official Elexon BMRS streaming data across all 1,488 settlement periods of January 2026.

Notice our **Decision Gate Closure selector** set to **11:00 UTC D-1**. A common flaw in renewable analytics is look-ahead bias—evaluating forecasts using weather runs published after the market cleared. VORTEX strictly filters the forecast stream to isolate only the exact data your traders physically had when bidding."

(Click the date preset button **"Week 1 (Storm)"**. Hover cursor across the co-plotted time series chart.)

"This reveals an immediate, high-value commercial insight: throughout January 2026, the national wind forecast systematically over-predicted generation by an average of **+1,840 MW** across **71% of all trading hours**. 

In the chart, the **Green line** is actual delivered wind generation, the **Blue line** is the Day-Ahead auction forecast, the **Yellow dashed line** shows the intraday correction, and the **Orange shaded area** calculates your exact **Residual Thermal Procurement Need**—the precise gap of power you must purchase to prevent blackouts or cashout penalties."

(Click the **"Export CSV"** button in the control bar to show instantaneous data export.)

"Traders can export this aligned dataset to CSV with one click for downstream ETRM modeling."

---

### [1:40 - 2:30] Tab 2: Quantitative Forecast Accuracy Lab

(Click on **"2. Quantitative Forecast Accuracy Lab"** tab. Hover over the metric cards: MAE 2,123 MW, RMSE 2,617 MW, WAPE 18.3%.)

"Next, the **Forecast Accuracy Lab** evaluates the forecast quantitatively according to international energy standards.

Standard percentage metrics like MAPE fail on wind data because generation frequently nears zero, producing division-by-zero errors. We compute **WAPE (Weighted Absolute Percentage Error)**: at **18.33%**, it provides an uncorrupted volume-weighted benchmark for your risk committee."

(Scroll down to the **Empirical Error Quantiles** row: P05, P10 in green, P25 in blue, P50 in yellow, P75 in orange, P90 in red.)

"More importantly for traders, look at our **Empirical Error Quantiles**:
- The **P50 median error is +1,640 MW**, mathematically proving a structural over-forecasting bias.
- The **P90 tail risk is +4,312 MW**. That means in 10% of hours, wind dropped more than 4.3 Gigawatts below forecast. That severe tail risk is where utilities suffer massive balancing losses."

(Briefly hover over the **Error Distribution Histogram** and **Lead-Time Accuracy Decay Table**.)

"Our lead-time decay table verifies that while volumetric MAE improves as delivery approaches, the positive bias remains persistent—proving that traders must hedge Day-Ahead rather than gambling on intraday corrections."

---

### [2:30 - 3:25] Tab 3: Trader Decision & Hedge Simulator

(Click on **"3. Trader Decision & Hedge Simulator"** tab. Delivery date is set to January 15, 2026.)

"Now, how does a trader turn this quantitative data into cash savings tomorrow morning? That is the role of our **Procurement Simulator**."

(Click on **"1. Naive Strategy (0 MW Buffer)"** card with red border. Scroll to the Imbalance Bar Chart showing large red bars.)

"Under the default **Naive Strategy**, the trader procures strictly `Demand minus Wind Forecast`. Look at the real-time imbalance chart below: heavy red bars across the day indicate massive unhedged short positions settling at the penalty System Buy Price of £115/MWh."

(Click on **"3. P90 Conservative (+3,500 MW Buffer)"** card with green border.)

"Now watch what happens when we switch to our **P90 Conservative Strategy**:
We deduct a quantified 3,500 MW risk buffer from the wind forecast. The red shortage bars disappear entirely! By securing slightly more wholesale thermal power Day-Ahead at £78/MWh, we completely bypass the £115/MWh penalty cashout spread."

(Point cursor to the KPI cards: Net Commercial Savings £182,450 and 22 Short Periods Avoided.)

"On this single day alone, net commercial savings exceed **£182,000**, with 22 short settlement periods eliminated. Over the full winter month of January 2026, this delivers **over £1.2 million in avoided cashout penalties**."

---

### [3:25 - 3:55] Production Architecture & 24/7 Keep-Alive

(Click on **"Tech Lead Review (5m)"** button in the header. Show the clean architecture modal diagram.)

"Architecturally, VORTEX is built with a decoupled modern stack: **React 19 with Vite** on the frontend and a vectorized **Python FastAPI** backend running on Python 3.12."

(Minimize modal or switch to open terminal window and run: `python scripts/run_tests.py`.)

"Our entire data pipeline and mathematical engine is backed by an automated 8-stage test suite validating data completeness across all 1,488 settlement periods, quantile integrity, and REST endpoints—passing 100% cleanly in seconds."

(Show terminal output displaying `8 passed in 9.75s | ALL TESTS PASSED`.)

"The application is containerized with Docker, deployed live on Render and Vercel, and configured with an automated **24/7 GitHub Actions keep-alive cron job** that pings the health endpoint every 10 minutes to eliminate free-tier cold boot delays."

---

### [3:55 - 4:05] Closing Wrap-up

(Switch back to the browser displaying the VORTEX dashboard.)

"In summary: VORTEX transforms volatile weather forecasts into de-biased, actionable, and mathematically hedged power procurement decisions. Thank you, and I look forward to your questions."
