import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { 
  Wind, 
  TrendingUp, 
  AlertTriangle, 
  Percent, 
  Clock, 
  Layers, 
  Info,
  Calendar,
  Flame,
  Download
} from 'lucide-react';
import MetricCard from './MetricCard';

export default function DayAheadView({
  timeseriesData,
  overviewData,
  gateHour,
  setGateHour,
  startDate,
  endDate,
  setDateRange,
  resolution,
  setResolution,
  loading
}) {
  const [showIntraday, setShowIntraday] = useState(true);
  const [showResidualDemand, setShowResidualDemand] = useState(true);

  const summary = overviewData?.summary || {};

  const handlePresetChange = (preset) => {
    if (preset === 'month') {
      setDateRange('2026-01-01', '2026-01-31');
    } else if (preset === 'w1') {
      setDateRange('2026-01-01', '2026-01-07');
    } else if (preset === 'w2') {
      setDateRange('2026-01-08', '2026-01-14');
    } else if (preset === 'w3') {
      setDateRange('2026-01-15', '2026-01-21');
    } else if (preset === 'w4') {
      setDateRange('2026-01-22', '2026-01-28');
    }
  };

  // Prepare chart data with residual thermal demand
  // Typical winter demand baseline: ~38,000 MW average
  const chartData = (timeseriesData || []).map((d) => {
    const demand = 38000;
    const residualThermal = Math.max(0, demand - (d.forecastDA || 0));
    const actualResidual = Math.max(0, demand - (d.actual || 0));
    return {
      ...d,
      demand,
      residualThermal,
      actualResidual
    };
  });

  const handleExportCSV = () => {
    if (!chartData || chartData.length === 0) return;
    const headers = ['Timestamp', 'Period', 'Actual_Wind_MW', 'DayAhead_Forecast_MW', 'Forecast_Error_MW', 'Residual_Thermal_Needed_MW'];
    if (showIntraday) headers.push('Intraday_Forecast_MW');

    const rows = chartData.map(d => {
      const row = [
        `"${d.timestamp}"`,
        d.settlementPeriod ? `SP_${d.settlementPeriod}` : `"${d.timeFormatted}"`,
        d.actual ?? '',
        d.forecastDA ?? '',
        d.error ?? '',
        d.residualThermal ?? ''
      ];
      if (showIntraday) row.push(d.forecastIntraday ?? '');
      return row.join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vortex_day_ahead_${startDate}_${endDate}_gate${gateHour}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Control Panel Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Date Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} /> Period:
            </span>
            <button
              onClick={() => handlePresetChange('month')}
              className={`nav-tab-btn ${startDate === '2026-01-01' && endDate === '2026-01-31' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
            >
              Full Jan 2026 (31 Days)
            </button>
            <button
              onClick={() => handlePresetChange('w1')}
              className={`nav-tab-btn ${startDate === '2026-01-01' && endDate === '2026-01-07' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
            >
              Week 1 (Storm Surge)
            </button>
            <button
              onClick={() => handlePresetChange('w2')}
              className={`nav-tab-btn ${startDate === '2026-01-08' && endDate === '2026-01-14' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
            >
              Week 2
            </button>
            <button
              onClick={() => handlePresetChange('w3')}
              className={`nav-tab-btn ${startDate === '2026-01-15' && endDate === '2026-01-21' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
            >
              Week 3
            </button>
            <button
              onClick={() => handlePresetChange('w4')}
              className={`nav-tab-btn ${startDate === '2026-01-22' && endDate === '2026-01-28' ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
            >
              Week 4
            </button>
          </div>

          {/* Decision Gate Closure & Resolution Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            
            {/* Gate Closure Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} color="var(--accent-cyan)" /> Day-Ahead Gate:
              </span>
              <select
                id="select-gate-hour"
                className="custom-select"
                value={gateHour}
                onChange={(e) => setGateHour(Number(e.target.value))}
              >
                <option value={9}>09:00 UTC D-1 (Early Auction)</option>
                <option value={11}>11:00 UTC D-1 (EPEX SPOT GB Auction - Default)</option>
                <option value={12}>12:00 UTC D-1 (Nord Pool GB Auction)</option>
                <option value={14}>14:00 UTC D-1 (Post-Auction Adjustment)</option>
                <option value={17}>17:00 UTC D-1 (Evening Day-Ahead)</option>
              </select>
            </div>

            {/* Resolution Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Resolution:
              </span>
              <select
                id="select-resolution"
                className="custom-select"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              >
                <option value="hourly">Hourly Contract (Wholesale)</option>
                <option value="half_hourly">Half-Hourly (SP 1–48 Settlement)</option>
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: 'var(--accent-cyan)',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Download currently filtered time series as CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="metrics-grid-5">
        <MetricCard
          title="Actual Wind Generation"
          value={summary.meanActualMW ? summary.meanActualMW.toLocaleString() : '---'}
          unit="MW"
          subtitle="Mean generation delivered"
          badgeText="Delivered"
          badgeType="green"
          icon={Wind}
        />

        <MetricCard
          title="Day-Ahead Forecast"
          value={summary.meanForecastMW ? summary.meanForecastMW.toLocaleString() : '---'}
          unit="MW"
          subtitle={`Latest available at ${gateHour}:00 D-1`}
          badgeText="Auction Basis"
          badgeType="cyan"
          icon={TrendingUp}
        />

        <MetricCard
          title="Forecast Directional Bias"
          value={summary.bias ? (summary.bias > 0 ? `+${summary.bias}` : summary.bias) : '---'}
          unit="MW"
          subtitle={summary.bias > 0 ? 'Systematic Over-forecast (Short Risk)' : 'Under-forecast'}
          badgeText={summary.bias > 0 ? 'Short Risk Warning' : 'Long Position'}
          badgeType={summary.bias > 0 ? 'amber' : 'green'}
          icon={AlertTriangle}
        />

        <MetricCard
          title="Mean Absolute Error (MAE)"
          value={summary.mae ? summary.mae.toLocaleString() : '---'}
          unit="MW"
          subtitle={`WAPE: ${summary.wape || '--'}% of volume`}
          badgeText="Mean Error"
          badgeType="cyan"
          icon={Percent}
        />

        <MetricCard
          title="P90 Extreme Shortage Risk"
          value={summary.quantiles?.p90 ? `+${summary.quantiles.p90}` : '---'}
          unit="MW"
          subtitle="90th percentile over-prediction"
          badgeText="Tail Risk Exposure"
          badgeType="rose"
          icon={Flame}
        />
      </div>

      {/* Executive Alert Banner */}
      <div className="glass-panel" style={{ 
        padding: '16px 20px', 
        borderLeft: '4px solid var(--accent-amber)',
        background: 'rgba(245, 158, 11, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle color="var(--accent-amber)" size={20} />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FBBF24', margin: 0 }}>
              Day-Ahead Procurement Insight: Persistent Over-Forecasting in January 2026
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
              At the <strong>{gateHour}:00 UTC D-1 Gate Closure</strong>, the national wind forecast systematically exceeded actual delivery by an average of <strong>+{summary.bias} MW</strong> ({summary.overForecastFrequencyPercent}% of hours). 
              A procurement desk that buys residual thermal power without a buffer would face an unhedged <strong>short position</strong> settling at punitive System Buy Prices (SBP).
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showIntraday} 
              onChange={(e) => setShowIntraday(e.target.checked)} 
            />
            Show Intraday Update
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showResidualDemand} 
              onChange={(e) => setShowResidualDemand(e.target.checked)} 
            />
            Show Residual Thermal Need
          </label>
        </div>
      </div>

      {/* Main Co-Plotted Time Series Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Actual Wind Generation vs Latest Available Day-Ahead Forecast
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '2px' }}>
              Forecast evaluated strictly at {gateHour}:00 UTC on Day D-1 (Zero look-ahead bias) | Resolution: {resolution}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
              <div style={{ width: '12px', height: '3px', backgroundColor: '#10B981', borderRadius: '2px' }} />
              Actual Delivered (MW)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#06B6D4' }}>
              <div style={{ width: '12px', height: '3px', backgroundColor: '#06B6D4', borderRadius: '2px' }} />
              Day-Ahead Forecast (MW)
            </span>
            {showIntraday && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A855F7' }}>
                <div style={{ width: '12px', height: '3px', backgroundColor: '#A855F7', borderRadius: '2px', strokeDasharray: '2 2' }} />
                Intraday Delivery-1h (MW)
              </span>
            )}
            {showResidualDemand && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F59E0B' }}>
                <div style={{ width: '12px', height: '3px', backgroundColor: '#F59E0B', borderRadius: '2px' }} />
                Residual Thermal Procurement Needed
              </span>
            )}
          </div>
        </div>

        <div style={{ width: '100%', height: '420px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="thermalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis 
                dataKey="timeFormatted" 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false} 
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false} 
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Areas */}
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="#10B981" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#actualGrad)" 
                name="Actual Wind Generation" 
              />
              <Line 
                type="monotone" 
                dataKey="forecastDA" 
                stroke="#06B6D4" 
                strokeWidth={2.5} 
                dot={false}
                name="Day-Ahead Forecast" 
              />
              {showIntraday && (
                <Line 
                  type="monotone" 
                  dataKey="forecastIntraday" 
                  stroke="#A855F7" 
                  strokeWidth={1.8} 
                  strokeDasharray="4 4" 
                  dot={false}
                  name="Intraday Update" 
                />
              )}
              {showResidualDemand && (
                <Area 
                  type="monotone" 
                  dataKey="residualThermal" 
                  stroke="#F59E0B" 
                  strokeWidth={1.8} 
                  fillOpacity={1} 
                  fill="url(#thermalGrad)" 
                  name="Residual Thermal Need" 
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explanatory Context Footer */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Info size={18} color="var(--accent-cyan)" />
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          <strong>How Decision Gate Closures Work in UK Wholesale Trading:</strong> Power procurement contracts for delivery across Day D are submitted to EPEX SPOT GB or Nord Pool before 11:00 AM on Day D-1. The cyan line shows the exact forecast published prior to that cutoff. The purple dashed line shows how weather models adjusted by Delivery-1 hour, illustrating the intraday correction trajectory.
        </p>
      </div>

    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload || {};
  const error = (d.forecastDA || 0) - (d.actual || 0);

  return (
    <div style={{
      background: '#0F172A',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      minWidth: '220px'
    }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
        {d.timeFormatted} {d.settlementPeriod ? `(SP ${d.settlementPeriod})` : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>
          <span>Actual Wind:</span>
          <span className="mono-num" style={{ fontWeight: 700 }}>{d.actual?.toLocaleString()} MW</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#06B6D4' }}>
          <span>Day-Ahead Forecast:</span>
          <span className="mono-num" style={{ fontWeight: 700 }}>{d.forecastDA?.toLocaleString()} MW</span>
        </div>
        {d.forecastIntraday && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A855F7' }}>
            <span>Intraday Forecast:</span>
            <span className="mono-num">{d.forecastIntraday?.toLocaleString()} MW</span>
          </div>
        )}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          paddingTop: '6px', 
          borderTop: '1px solid rgba(255,255,255,0.08)',
          color: error > 0 ? '#FBBF24' : '#34D399'
        }}>
          <span>Forecast Error:</span>
          <span className="mono-num" style={{ fontWeight: 700 }}>
            {error > 0 ? `+${error.toLocaleString()}` : error.toLocaleString()} MW
          </span>
        </div>
        {d.residualThermal && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#F59E0B', paddingTop: '4px' }}>
            <span>Thermal Needed:</span>
            <span className="mono-num">{d.residualThermal?.toLocaleString()} MW</span>
          </div>
        )}
      </div>
    </div>
  );
}
