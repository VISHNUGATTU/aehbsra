"""
Professional Voiceover Generator for VORTEX POWER Demo Video
Utilizes Microsoft Edge Neural Text-to-Speech (edge-tts)
Selected Voice: en-GB-RyanNeural (British English Male - Executive/Commercial Energy Specialist)
Outputs high-fidelity MP3 to docs/ and frontend/public/ for direct download and browser playback.
"""

import os
import sys
import asyncio
import edge_tts

# Complete studio voiceover dialogue matching docs/VIDEO_DEMO_SCRIPT.md
NARRATION_SCRIPT = """
Hello everyone. Today I am presenting VORTEX, a specialized Day-Ahead renewable forecast evaluation and thermal power procurement risk platform built for UK energy utility trading desks.

As a UK power purchaser, your commercial challenge is critical: you must buy wholesale power on EPEX SPOT or Nord Pool before the 11:00 AM auction gate closure on Day D minus 1 to cover tomorrow's consumer demand.

To calculate how much flexible thermal power you need to contract, you rely on national wind forecasts. But if the forecast over-predicts and actual wind drops out, you are caught short in real-time balancing, forced to buy emergency power from National Grid ESO at punitive System Buy Prices that spike beyond 115 to 300 pounds per Megawatt-hour.

VORTEX was engineered to give trading desks the mathematical tools to eliminate this risk.

Here in the primary Day-Ahead Workspace, we are analyzing official Elexon BMRS streaming data across all 1,488 settlement periods of January 2026.

Notice our Decision Gate Closure selector set to 11:00 UTC D minus 1. A common flaw in renewable analytics is look-ahead bias, evaluating forecasts using weather runs published after the market cleared. VORTEX strictly filters the forecast stream to isolate only the exact data your traders physically had when bidding.

This reveals an immediate, high-value commercial insight: throughout January 2026, the national wind forecast systematically over-predicted generation by an average of plus 1,840 Megawatts across 71 percent of all trading hours.

In the chart, the Green line is actual delivered wind generation, the Blue line is the Day-Ahead auction forecast, the Yellow dashed line shows the intraday correction, and the Orange shaded area calculates your exact Residual Thermal Procurement Need, the precise gap of power you must purchase to prevent blackouts or cashout penalties. Traders can export this aligned dataset to CSV with one click for downstream ETRM modeling.

Next, the Forecast Accuracy Lab evaluates the forecast quantitatively according to international energy standards.

Standard percentage metrics like MAPE fail on wind data because generation frequently nears zero, producing division-by-zero errors. We compute WAPE, Weighted Absolute Percentage Error: at 18.33 percent, it provides an uncorrupted volume-weighted benchmark for your risk committee.

More importantly for traders, look at our Empirical Error Quantiles:
The P50 median error is plus 1,640 Megawatts, mathematically proving a structural over-forecasting bias.
The P90 tail risk is plus 4,312 Megawatts. That means in 10 percent of hours, wind dropped more than 4.3 Gigawatts below forecast. That severe tail risk is where utilities suffer massive balancing losses.

Our lead-time decay table verifies that while volumetric MAE improves as delivery approaches, the positive bias remains persistent, proving that traders must hedge Day-Ahead rather than gambling on intraday corrections.

Now, how does a trader turn this quantitative data into cash savings tomorrow morning? That is the role of our Procurement Simulator.

Under the default Naive Strategy, the trader procures strictly Demand minus Wind Forecast. Look at the real-time imbalance chart below: heavy red bars across the day indicate massive unhedged short positions settling at the penalty System Buy Price of 115 pounds per Megawatt-hour.

Now watch what happens when we switch to our P90 Conservative Strategy:
We deduct a quantified 3,500 Megawatt risk buffer from the wind forecast. The red shortage bars disappear entirely. By securing slightly more wholesale thermal power Day-Ahead at 78 pounds per Megawatt-hour, we completely bypass the 115 pounds per Megawatt-hour penalty cashout spread.

On this single day alone, net commercial savings exceed 182,000 pounds, with 22 short settlement periods eliminated. Over the full winter month of January 2026, this delivers over 1.2 million pounds in avoided cashout penalties.

Architecturally, VORTEX is built with a decoupled modern stack: React 19 with Vite on the frontend and a vectorized Python FastAPI backend running on Python 3.12.

Our entire data pipeline and mathematical engine is backed by an automated 8-stage test suite validating data completeness across all 1,488 settlement periods, quantile integrity, and REST endpoints, passing 100 percent cleanly in seconds.

The application is containerized with Docker, deployed live on Render and Vercel, and configured with an automated 24/7 GitHub Actions keep-alive cron job that pings the health endpoint every 10 minutes to eliminate free-tier cold boot delays.

In summary: VORTEX transforms volatile weather forecasts into de-biased, actionable, and mathematically hedged power procurement decisions. Thank you, and I look forward to your questions.
"""

VOICE = "en-GB-RyanNeural"  # Professional British English Male Voice

import shutil

async def generate_audio():
    print(f"[*] Initializing Edge TTS with voice: {VOICE}")
    communicate = edge_tts.Communicate(NARRATION_SCRIPT.strip(), VOICE, rate="+1%", pitch="+0Hz")
    
    docs_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
    public_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "public")
    
    os.makedirs(docs_dir, exist_ok=True)
    os.makedirs(public_dir, exist_ok=True)
    
    out_file_docs = os.path.join(docs_dir, "vortex_demo_voiceover.mp3")
    out_file_public = os.path.join(public_dir, "vortex_demo_voiceover.mp3")
    
    if not os.path.exists(out_file_docs) or os.path.getsize(out_file_docs) == 0:
        print(f"[*] Generating: {out_file_docs} ...")
        await communicate.save(out_file_docs)
    
    file_size_mb = os.path.getsize(out_file_docs) / (1024 * 1024)
    print(f"[+] docs/ audio ready: {out_file_docs} ({file_size_mb:.2f} MB)")
    
    shutil.copy2(out_file_docs, out_file_public)
    print(f"[+] frontend/public/ audio copied: {out_file_public}")

if __name__ == "__main__":
    asyncio.run(generate_audio())
