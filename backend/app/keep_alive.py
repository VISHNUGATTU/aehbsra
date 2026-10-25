"""
Keep-Alive Background Service for Render / Cloud Deployments.
Prevents free-tier web services from spinning down after 15 minutes of inactivity.
"""

import os
import asyncio
import logging
import urllib.request
import urllib.error

logger = logging.getLogger("keep-alive")

async def keep_alive_daemon(interval_seconds: int = 600):
    """
    Periodically pings the public health endpoint to keep cloud instances warm.
    Render automatically injects RENDER_EXTERNAL_URL into the environment.
    """
    # Prefer explicit KEEP_ALIVE_URL, then Render's automatic external URL, then default
    target_url = os.environ.get("KEEP_ALIVE_URL") or os.environ.get("RENDER_EXTERNAL_URL") or "https://vortex-power.onrender.com"
    health_url = f"{target_url.rstrip('/')}/api/health"

    logger.info(f"Keep-alive daemon started. Monitoring target: {health_url} (interval: {interval_seconds}s)")

    # Initial delay before starting periodic pings
    await asyncio.sleep(60)

    while True:
        try:
            req = urllib.request.Request(
                health_url,
                headers={"User-Agent": "VortexPower-KeepAlive/1.0"}
            )
            # Run blocking urllib in executor to not block asyncio loop
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, lambda: urllib.request.urlopen(req, timeout=30))
            logger.info(f"Keep-alive ping successful -> {health_url}")
        except Exception as e:
            logger.warning(f"Keep-alive ping to {health_url} returned: {e}")

        await asyncio.sleep(interval_seconds)
