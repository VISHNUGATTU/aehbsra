# VORTEX POWER | Line-by-Line Video Demo Script & Screen Actions

> **Total Duration:** 3.5 to 4 Minutes  
> **Format:** Exact bracketed screen action `[ON SCREEN & ACTION]` before every spoken paragraph.  
> **Pre-Generated Audio Narration:** Available locally at [`docs/vortex_demo_voiceover.mp3`](vortex_demo_voiceover.mp3) (1.79 MB, British English Male - Ryan Neural).  
> **Setup:** Open `http://localhost:5173` on full screen (F11). Have terminal window open in background with `python scripts/run_tests.py`.

---

### SCENE 1: Introduction & Commercial Setting

**[ON SCREEN: Browser open in full screen to `http://localhost:5173`. Make sure Tab 1 "Day-Ahead Procurement Workspace" is visible. Hover mouse cursor over the header title "VORTEX POWER - UK Day-Ahead Energy Desk" and the green live badge "Elexon BMRS Verified Snapshot: January 2026 | 100% Complete".]**  
"Hello everyone. Today I am presenting VORTEX, a specialized Day-Ahead renewable forecast evaluation and thermal power procurement risk platform built for UK energy utility trading desks."

**[ON SCREEN: Slowly move mouse cursor across the top 4 KPI cards: "Actual Delivered Wind: 11,581 MW", "Day-Ahead Forecast: 13,421 MW", "Systematic Bias: +1,840 MW".]**  
"As a UK power purchaser, your commercial challenge is critical: you must buy wholesale power on EPEX SPOT or Nord Pool before the 11:00 AM auction gate closure on Day D minus 1 to cover tomorrow's consumer demand."

**[ON SCREEN: Hover cursor over the "Decision Gate Closure" dropdown in the control bar, highlighting "11:00 UTC D-1 (Auction Gate)".]**  
"To calculate how much flexible thermal power you need to contract, you rely on national wind forecasts. But if the forecast over-predicts and actual wind drops out, you are caught short in real-time balancing, forced to buy emergency power from National Grid ESO at punitive System Buy Prices that spike beyond 115 to 300 pounds per Megawatt-hour."

**[ON SCREEN: Move cursor back to the main dashboard title and slightly wiggle cursor to focus attention.]**  
"VORTEX was engineered to give trading desks the mathematical tools to eliminate this risk."

---

### SCENE 2: Tab 1 — Day-Ahead Procurement Workspace

**[ON SCREEN: Ensure you are on Tab 1 ("1. Day-Ahead Procurement Workspace"). Click the date preset button "Week 1 (Storm)" on the top control bar to zoom into the stormy January 1–7 period.]**  
"Here in the primary Day-Ahead Workspace, we are analyzing official Elexon BMRS streaming data across all 1,488 settlement periods of January 2026."

**[ON SCREEN: Click and open the "Decision Gate Closure" dropdown, showing the 09:00, 11:00, and 17:00 options, then click "11:00 UTC D-1 (Auction Gate)" to confirm.]**  
"Notice our Decision Gate Closure selector set to 11:00 UTC D minus 1. A common flaw in renewable analytics is look-ahead bias, evaluating forecasts using weather runs published after the market cleared. VORTEX strictly filters the forecast stream to isolate only the exact data your traders physically had when bidding."

**[ON SCREEN: Move cursor smoothly from left to right along the main co-plotted time-series chart, pointing out the persistent gap where the blue line runs higher than the green line.]**  
"This reveals an immediate, high-value commercial insight: throughout January 2026, the national wind forecast systematically over-predicted generation by an average of plus 1,840 Megawatts across 71 percent of all trading hours."

**[ON SCREEN: Hover over the chart legend elements: first hover on Green (Actual Wind), then Blue (Day-Ahead Forecast), then Yellow dashed (Intraday Forecast), then point to the Orange shaded area (Residual Thermal Procurement). Finally, click the "Export CSV" button in the control bar to show instantaneous data export.]**  
"In the chart, the Green line is actual delivered wind generation, the Blue line is the Day-Ahead auction forecast, the Yellow dashed line shows the intraday correction, and the Orange shaded area calculates your exact Residual Thermal Procurement Need, the precise gap of power you must purchase to prevent blackouts or cashout penalties. Traders can export this aligned dataset to CSV with one click for downstream ETRM modeling."

---

### SCENE 3: Tab 2 — Quantitative Forecast Accuracy Lab

**[ON SCREEN: Click on the second tab: "2. Quantitative Forecast Accuracy Lab".]**  
"Next, the Forecast Accuracy Lab evaluates the forecast quantitatively according to international energy standards."

**[ON SCREEN: Move cursor across the top 3 metric cards: hover on MAE (2,123 MW), RMSE (2,617 MW), and WAPE (18.33%).]**  
"Standard percentage metrics like MAPE fail on wind data because generation frequently nears zero, producing division-by-zero errors. We compute WAPE, Weighted Absolute Percentage Error: at 18.33 percent, it provides an uncorrupted volume-weighted benchmark for your risk committee."

**[ON SCREEN: Scroll down slightly to the "Empirical Error Quantiles (MW)" row. Point mouse cursor to the yellow P50 card (+1,640 MW), then smoothly move cursor to the red P90 card (+4,312 MW).]**  
"More importantly for traders, look at our Empirical Error Quantiles:
The P50 median error is plus 1,640 Megawatts, mathematically proving a structural over-forecasting bias.
The P90 tail risk is plus 4,312 Megawatts. That means in 10 percent of hours, wind dropped more than 4.3 Gigawatts below forecast. That severe tail risk is where utilities suffer massive balancing losses."

**[ON SCREEN: Scroll down slightly further to display the "Error Distribution Histogram" and the "Lead-Time Accuracy Decay Table" showing 09:00, 11:00, 17:00, and Intraday gates.]**  
"Our lead-time decay table verifies that while volumetric MAE improves as delivery approaches, the positive bias remains persistent, proving that traders must hedge Day-Ahead rather than gambling on intraday corrections."

---

### SCENE 4: Tab 3 — Trader Decision & Hedge Simulator

**[ON SCREEN: Click on the third tab: "3. Trader Decision & Hedge Simulator". Delivery date shows January 15, 2026.]**  
"Now, how does a trader turn this quantitative data into cash savings tomorrow morning? That is the role of our Procurement Simulator."

**[ON SCREEN: Click on the first strategy card: "1. Naive Strategy (0 MW Buffer)" (red border). Scroll down slightly to show the "Real-Time Imbalance Settlement (MW)" bar chart showing deep red shortage bars across the settlement periods.]**  
"Under the default Naive Strategy, the trader procures strictly Demand minus Wind Forecast. Look at the real-time imbalance chart below: heavy red bars across the day indicate massive unhedged short positions settling at the penalty System Buy Price of 115 pounds per Megawatt-hour."

**[ON SCREEN: Scroll back up and click on the third strategy card: "3. P90 Conservative (+3,500 MW Buffer)" (green border). Scroll back down to the imbalance chart: point out that the red bars have vanished completely and turned green/neutral!]**  
"Now watch what happens when we switch to our P90 Conservative Strategy:
We deduct a quantified 3,500 Megawatt risk buffer from the wind forecast. The red shortage bars disappear entirely. By securing slightly more wholesale thermal power Day-Ahead at 78 pounds per Megawatt-hour, we completely bypass the 115 pounds per Megawatt-hour penalty cashout spread."

**[ON SCREEN: Hover cursor over the two top simulation KPI cards: "Net Commercial Savings: £182,450" and "Short Periods Avoided: 22".]**  
"On this single day alone, net commercial savings exceed 182,000 pounds, with 22 short settlement periods eliminated. Over the full winter month of January 2026, this delivers over 1.2 million pounds in avoided cashout penalties."

---

### SCENE 5: Technical Review, Architecture & Tests

**[ON SCREEN: Scroll to top of page. Click the "Tech Lead Review (5m)" button in the top navbar. The Architecture modal appears displaying the 4-tier system diagram.]**  
"Architecturally, VORTEX is built with a decoupled modern stack: React 19 with Vite on the frontend and a vectorized Python FastAPI backend running on Python 3.12."

**[ON SCREEN: Press Alt + Tab to switch to your open terminal window where `python scripts/run_tests.py` is typed. Press ENTER. Let the 8 tests run on screen for 9 seconds until the green summary appears: `8 passed in 9.43s | ALL TESTS PASSED`.]**  
"Our entire data pipeline and mathematical engine is backed by an automated 8-stage test suite validating data completeness across all 1,488 settlement periods, quantile integrity, and REST endpoints, passing 100 percent cleanly in seconds."

**[ON SCREEN: Press Alt + Tab back to the browser showing the architecture modal. Point cursor to the Keep-Alive & Cloud Deployment cards in the modal.]**  
"The application is containerized with Docker, deployed live on Render and Vercel, and configured with an automated 24/7 GitHub Actions keep-alive cron job that pings the health endpoint every 10 minutes to eliminate free-tier cold boot delays."

---

### SCENE 6: Closing Wrap-up

**[ON SCREEN: Click the "X" button (top right) or press Escape to close the modal. You are back on the clean, professional dashboard view. Hover mouse cursor calmly in the center of the screen.]**  
"In summary: VORTEX transforms volatile weather forecasts into de-biased, actionable, and mathematically hedged power procurement decisions. Thank you, and I look forward to your questions."
