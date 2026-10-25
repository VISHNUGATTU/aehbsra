/**
 * API Service Client for UK Energy Utility Day-Ahead Forecasting API
 * 
 * Features automatic failover to verified January 2026 high-fidelity Elexon snapshot
 * ensuring 100% uptime and resilience against free-tier cold boots or network latency.
 */

import {
  FALLBACK_HEALTH,
  FALLBACK_OVERVIEW,
  FALLBACK_METRICS,
  FALLBACK_TIMESERIES,
  FALLBACK_DIURNAL,
  FALLBACK_DISTRIBUTION,
  FALLBACK_RAMPS,
  FALLBACK_LEAD_TIME,
  FALLBACK_SIMULATION
} from './fallbackData';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
let isSnapshotMode = false;

export function getIsSnapshotMode() {
  return isSnapshotMode;
}

/**
 * Enhanced fetch with timeout to prevent cold-boot hanging
 */
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000, ...fetchOpts } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...fetchOpts,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function fetchHealth() {
  try {
    const resp = await fetchWithTimeout(`${API_BASE}/health`, { timeout: 3500 });
    if (resp.ok) {
      isSnapshotMode = false;
      return await resp.json();
    }
  } catch (err) {
    console.warn('[VORTEX API] Live health check unavailable, activating verified snapshot mode:', err.message);
  }
  isSnapshotMode = true;
  return { ...FALLBACK_HEALTH, isSnapshot: true };
}

export async function fetchOverview(gateHour = 11, startDate = '2026-01-01', endDate = '2026-01-31') {
  try {
    const query = new URLSearchParams({ gateHour, startDate, endDate });
    const resp = await fetchWithTimeout(`${API_BASE}/overview?${query}`, { timeout: 5000 });
    if (resp.ok) {
      isSnapshotMode = false;
      return await resp.json();
    }
  } catch (err) {
    console.warn('[VORTEX API] Live overview unavailable, using verified snapshot:', err.message);
  }
  isSnapshotMode = true;
  return FALLBACK_OVERVIEW;
}

export async function fetchTimeseries(gateHour = 11, startDate = '2026-01-01', endDate = '2026-01-31', resolution = 'hourly') {
  try {
    const query = new URLSearchParams({ gateHour, startDate, endDate, resolution });
    const resp = await fetchWithTimeout(`${API_BASE}/timeseries?${query}`, { timeout: 6000 });
    if (resp.ok) {
      isSnapshotMode = false;
      return await resp.json();
    }
  } catch (err) {
    console.warn('[VORTEX API] Live timeseries unavailable, using verified snapshot:', err.message);
  }
  isSnapshotMode = true;
  
  // Filter fallback timeseries by date range if customized
  if (startDate !== '2026-01-01' || endDate !== '2026-01-31') {
    const filtered = (FALLBACK_TIMESERIES.data || []).filter(d => {
      const dayStr = d.timestamp.substring(0, 10);
      return dayStr >= startDate && dayStr <= endDate;
    });
    return {
      gateHour,
      resolution,
      count: filtered.length,
      data: filtered,
      isSnapshot: true
    };
  }
  return { ...FALLBACK_TIMESERIES, isSnapshot: true };
}

export async function fetchMetrics(gateHour = 11, startDate = '2026-01-01', endDate = '2026-01-31', resolution = 'hourly') {
  try {
    const query = new URLSearchParams({ gateHour, startDate, endDate, resolution });
    const resp = await fetchWithTimeout(`${API_BASE}/metrics?${query}`, { timeout: 5000 });
    if (resp.ok) {
      isSnapshotMode = false;
      return await resp.json();
    }
  } catch (err) {
    console.warn('[VORTEX API] Live metrics unavailable, using verified snapshot:', err.message);
  }
  isSnapshotMode = true;
  return FALLBACK_METRICS;
}

export async function fetchDiurnal(gateHour = 11, startDate = '2026-01-01', endDate = '2026-01-31', resolution = 'hourly') {
  try {
    const query = new URLSearchParams({ gateHour, startDate, endDate, resolution });
    const resp = await fetchWithTimeout(`${API_BASE}/diurnal?${query}`, { timeout: 5000 });
    if (resp.ok) {
      isSnapshotMode = false;
      return await resp.json();
    }
  } catch (err) {
    console.warn('[VORTEX API] Live diurnal unavailable, using verified snapshot:', err.message);
  }
  isSnapshotMode = true;
  return FALLBACK_DIURNAL;
}

export async function fetchDistribution(gateHour = 11, startDate = '2026-01-01', endDate = '2026-01-31', numBins = 30) {
  try {
    const query = new URLSearchParams({ gateHour, startDate, endDate, numBins });
    const resp = await fetchWithTimeout(`${API_BASE}/distribution?${query}`, { timeout: 5000 });
    if (resp.ok) {
      isSnapshotMode = false;
      return await resp.json();
    }
  } catch (err) {
    console.warn('[VORTEX API] Live distribution unavailable, using verified snapshot:', err.message);
  }
  isSnapshotMode = true;
  return FALLBACK_DISTRIBUTION;
}

export async function fetchRampAnalysis(gateHour = 11, startDate = '2026-01-01', endDate = '2026-01-31') {
  try {
    const query = new URLSearchParams({ gateHour, startDate, endDate });
    const resp = await fetchWithTimeout(`${API_BASE}/ramp-analysis?${query}`, { timeout: 5000 });
    if (resp.ok) {
      isSnapshotMode = false;
      return await resp.json();
    }
  } catch (err) {
    console.warn('[VORTEX API] Live ramp analysis unavailable, using verified snapshot:', err.message);
  }
  isSnapshotMode = true;
  return FALLBACK_RAMPS;
}

export async function fetchLeadTimeComparison(startDate = '2026-01-01', endDate = '2026-01-31') {
  try {
    const query = new URLSearchParams({ startDate, endDate });
    const resp = await fetchWithTimeout(`${API_BASE}/lead-time-comparison?${query}`, { timeout: 5000 });
    if (resp.ok) {
      isSnapshotMode = false;
      return await resp.json();
    }
  } catch (err) {
    console.warn('[VORTEX API] Live lead time comparison unavailable, using verified snapshot:', err.message);
  }
  isSnapshotMode = true;
  return FALLBACK_LEAD_TIME;
}

export async function executeSimulation(payload) {
  try {
    const resp = await fetchWithTimeout(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: 6000
    });
    if (resp.ok) {
      isSnapshotMode = false;
      return await resp.json();
    }
  } catch (err) {
    console.warn('[VORTEX API] Live simulation unavailable, using verified snapshot:', err.message);
  }
  isSnapshotMode = true;
  return FALLBACK_SIMULATION;
}
