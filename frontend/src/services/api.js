/**
 * API Service Client for UK Energy Utility Day-Ahead Forecasting API
 */

const API_BASE = '/api';

export async function fetchHealth() {
  const resp = await fetch(`${API_BASE}/health`);
  if (!resp.ok) throw new Error('Failed to fetch health status');
  return resp.json();
}

export async function fetchOverview(gateHour = 11, startDate = '2026-01-01', endDate = '2026-01-31') {
  const query = new URLSearchParams({ gateHour, startDate, endDate });
  const resp = await fetch(`${API_BASE}/overview?${query}`);
  if (!resp.ok) throw new Error('Failed to fetch overview KPIs');
  return resp.json();
}

export async function fetchTimeseries(gateHour = 11, startDate = '2026-01-01', endDate = '2026-01-31', resolution = 'hourly') {
  const query = new URLSearchParams({ gateHour, startDate, endDate, resolution });
  const resp = await fetch(`${API_BASE}/timeseries?${query}`);
  if (!resp.ok) throw new Error('Failed to fetch timeseries data');
  return resp.json();
}

export async function fetchMetrics(gateHour = 11, startDate = '2026-01-01', endDate = '2026-01-31', resolution = 'hourly') {
  const query = new URLSearchParams({ gateHour, startDate, endDate, resolution });
  const resp = await fetch(`${API_BASE}/metrics?${query}`);
  if (!resp.ok) throw new Error('Failed to fetch detailed metrics');
  return resp.json();
}

export async function fetchDiurnal(gateHour = 11, startDate = '2026-01-01', endDate = '2026-01-31', resolution = 'hourly') {
  const query = new URLSearchParams({ gateHour, startDate, endDate, resolution });
  const resp = await fetch(`${API_BASE}/diurnal?${query}`);
  if (!resp.ok) throw new Error('Failed to fetch diurnal breakdown');
  return resp.json();
}

export async function fetchDistribution(gateHour = 11, startDate = '2026-01-01', endDate = '2026-01-31', numBins = 30) {
  const query = new URLSearchParams({ gateHour, startDate, endDate, numBins });
  const resp = await fetch(`${API_BASE}/distribution?${query}`);
  if (!resp.ok) throw new Error('Failed to fetch error distribution');
  return resp.json();
}

export async function fetchRampAnalysis(gateHour = 11, startDate = '2026-01-01', endDate = '2026-01-31') {
  const query = new URLSearchParams({ gateHour, startDate, endDate });
  const resp = await fetch(`${API_BASE}/ramp-analysis?${query}`);
  if (!resp.ok) throw new Error('Failed to fetch ramp analysis');
  return resp.json();
}

export async function executeSimulation(payload) {
  const resp = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.detail || 'Simulation execution failed');
  }
  return resp.json();
}
