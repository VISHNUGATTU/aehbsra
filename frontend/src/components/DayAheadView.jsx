import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { 
  Wind, 
  TrendingUp, 
  AlertTriangle, 
  Percent, 
  Clock, 
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
      <div className="glass-panel" style={{ padding: '16px 20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Date Presets Segmented Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} /> Period:
            </span>
            <div className="segmented-control">
              <button
                onClick={() => handlePresetChange('month')}
                className={`nav-tab-btn ${startDate === '2026-01-01' && endDate === '2026-01-31' ? 'active' : ''}`}
                style={{ padding: '5px 12px', fontSize: '12px' }}
              >
                Full Jan 2026 (31 Days)
              </button>
              <button
                onClick={() => handlePresetChange('w1')}
                className={`nav-tab-btn ${startDate === '2026-01-01' && endDate === '2026-01-07' ? 'active' : ''}`}
                style={{ padding: '5px 12px', fontSize: '12px' }}
              >
                Week 1 (Storm)
              </button>
              <button
                onClick={() => handlePresetChange('w2')}
                className={`nav-tab-btn ${startDate === '2026-01-08' && endDate === '2026-01-14' ? 'active' : ''}`}
                style={{ padding: '5px 12px', fontSize: '12px' }}
              >
                Week 2
              </button>
              <button
                onClick={() => handlePresetChange('w3')}
                className={`nav-tab-btn ${startDate === '2026-01-15' && endDate === '2026-01-21' ? 'active' : ''}`}
                style={{ padding: '5px 12px', fontSize: '12px' }}
              >
                Week 3
              </button>
              <button
                onClick={() => handlePresetChange('w4')}
                className={`nav-tab-btn ${startDate === '2026-01-22' && endDate === '2026-01-28' ? 'active' : ''}`}
                style={{ padding: '5px 12px', fontSize: '12px' }}
              >
                Week 4
              </button>
            </div>
          </div>

          {/* Decision Gate Closure & Resolution Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            
            {/* Gate Closure Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} color="var(--blue)" /> Day-Ahead Gate:
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
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-dim)' }}>
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
              className="btn-pill-blue"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '7px 12px' }}
              title="Download currently filtered time series as CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

          </div>
        </div>
      </div>

      {/* KPI Cards Row (Strict 5 Semantic Colors) */}
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
          subtitle={`Evaluated at ${gateHour}:00 D-1`}
          badgeText="Auction Basis"
          badgeType="blue"
          icon={TrendingUp}
        />

        <MetricCard
          title="Forecast Directional Bias"
          value={summary.bias ? (summary.bias > 0 ? `+${summary.bias}` : summary.bias) : '---'}
          unit="MW"
          subtitle={summary.bias > 0 ? 'Persistent Over-forecast' : 'Under-forecast'}
          badgeText={summary.bias > 0 ? 'Short Risk Warning' : 'Long Position'}
          badgeType={summary.bias > 0 ? 'yellow' : 'green'}
          icon={AlertTriangle}
        />

        <MetricCard
          title="Mean Absolute Error (MAE)"
          value={summary.mae ? summary.mae.toLocaleString() : '---'}
          unit="MW"
          subtitle={`WAPE: ${summary.wape || '--'}% of volume`}
          badgeText="Mean Error"
          badgeType="blue"
          icon={Percent}
        />

        <MetricCard
          title="P90 Shortage Tail Risk"
          value={summary.quantiles?.p90 ? `+${summary.quantiles.p90}` : '---'}
          unit="MW"
          subtitle="90th percentile over-prediction"
          badgeText="Tail Risk Exposure"
          badgeType="red"
          icon={Flame}
        />
      </div>

      {/* Executive Alert Banner (Yellow / Amber Warning) */}
      <div className="glass-panel" style={{ 
        padding: '16px 20px', 
        borderLeft: '4px solid var(--yellow)',
        background: 'var(--yellow-soft)',
        borderColor: 'var(--yellow-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#FEF08A',
            color: 'var(--yellow-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--yellow-deep)', margin: 0 }}>
              Day-Ahead Procurement Advisory: Systematic Over-Forecasting Detected
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, marginTop: '2px', lineHeight: 1.5 }}>
              At the <strong>{gateHour}:00 UTC D-1 Gate Closure</strong>, the national wind forecast exceeded actual delivery by an average of <strong>+{summary.bias} MW</strong> ({summary.overForecastFrequencyPercent}% of hours). 
              A procurement desk purchasing residual thermal power without a buffer faces an unhedged <strong>short position</strong> settling at punitive System Buy Prices (SBP).
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showIntraday} 
              onChange={(e) => setShowIntraday(e.target.checked)} 
            />
            Show Intraday Update
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>
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
      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Actual Wind Generation vs Latest Available Day-Ahead Forecast
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '3px' }}>
              Forecast evaluated strictly at {gateHour}:00 UTC on Day D-1 (Zero look-ahead bias) | Resolution: {resolution}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green-dark)' }}>
              <div style={{ width: '12px', height: '3px', backgroundColor: 'var(--green)', borderRadius: '2px' }} />
              Actual Delivered (MW)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue-dark)' }}>
              <div style={{ width: '12px', height: '3px', backgroundColor: 'var(--blue)', borderRadius: '2px' }} />
              Day-Ahead Forecast (MW)
            </span>
            {showIntraday && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--yellow-dark)' }}>
                <div style={{ width: '14px', height: 0, borderTop: '2px dashed var(--yellow)' }} />
                Intraday Delivery-1h (MW)
              </span>
            )}
            {showResidualDemand && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--orange-dark)' }}>
                <div style={{ width: '12px', height: '3px', backgroundColor: 'var(--orange)', borderRadius: '2px' }} />
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
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="thermalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EA580C" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
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
              
              {/* Areas & Lines */}
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="#16A34A" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#actualGrad)" 
                name="Actual Wind Generation" 
              />
              <Line 
                type="monotone" 
                dataKey="forecastDA" 
                stroke="#2563EB" 
                strokeWidth={2.5} 
                dot={false}
                name="Day-Ahead Forecast" 
              />
              {showIntraday && (
                <Line 
                  type="monotone" 
                  dataKey="forecastIntraday" 
                  stroke="#CA8A04" 
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
                  stroke="#EA580C" 
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
      <div className="glass-panel" style={{ 
        padding: '16px 20px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '14px',
        background: '#FFFFFF',
        borderLeft: '4px solid var(--blue)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--blue-soft)',
          color: 'var(--blue-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Info size={18} />
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          <strong>How Decision Gate Closures Work in UK Wholesale Trading:</strong> Power procurement contracts for delivery across Day D are submitted to EPEX SPOT GB or Nord Pool before 11:00 AM on Day D-1. The blue line shows the exact forecast published prior to that cutoff. The yellow dashed line shows how weather models adjusted by Delivery-1 hour, illustrating the intraday correction trajectory. The orange area represents the residual thermal power that must be procured.
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
      background: '#FFFFFF',
      border: '1px solid var(--border-subtle)',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: 'var(--shadow-modal)',
      minWidth: '220px'
    }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
        {d.timeFormatted} {d.settlementPeriod ? `(SP ${d.settlementPeriod})` : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--green-dark)' }}>
          <span>Actual Wind:</span>
          <span className="mono-num" style={{ fontWeight: 700 }}>{d.actual?.toLocaleString()} MW</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--blue-dark)' }}>
          <span>Day-Ahead Forecast:</span>
          <span className="mono-num" style={{ fontWeight: 700 }}>{d.forecastDA?.toLocaleString()} MW</span>
        </div>
        {d.forecastIntraday && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--yellow-dark)' }}>
            <span>Intraday Forecast:</span>
            <span className="mono-num">{d.forecastIntraday?.toLocaleString()} MW</span>
          </div>
        )}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          paddingTop: '6px', 
          borderTop: '1px solid var(--border-subtle)',
          color: error > 0 ? 'var(--red-dark)' : 'var(--green-dark)'
        }}>
          <span>Forecast Error:</span>
          <span className="mono-num" style={{ fontWeight: 700 }}>
            {error > 0 ? `+${error.toLocaleString()}` : error.toLocaleString()} MW
          </span>
        </div>
        {d.residualThermal && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--orange-dark)', paddingTop: '4px' }}>
            <span>Thermal Needed:</span>
            <span className="mono-num">{d.residualThermal?.toLocaleString()} MW</span>
          </div>
        )}
      </div>
    </div>
  );
}
