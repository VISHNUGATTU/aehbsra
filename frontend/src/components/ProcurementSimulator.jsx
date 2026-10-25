import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { 
  ShieldCheck, 
  Coins, 
  AlertOctagon, 
  Flame, 
  Calendar, 
  Download,
  Search
} from 'lucide-react';
import MetricCard from './MetricCard';
import { executeSimulation } from '../services/api';

export default function ProcurementSimulator({ gateHour }) {
  const [targetDate, setTargetDate] = useState('2026-01-15');
  const [strategy, setStrategy] = useState('p90_conservative');
  const [customBufferMW, setCustomBufferMW] = useState(1840);
  const [daPrice, setDaPrice] = useState(78.0);
  const [sbpPrice, setSbpPrice] = useState(115.0);
  const [sspPrice, setSspPrice] = useState(48.0);

  const [ledgerFilter, setLedgerFilter] = useState('all'); // 'all', 'short_only', 'long_only'
  const [ledgerSearch, setLedgerSearch] = useState('');

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await executeSimulation({
        date: targetDate,
        gateHour: gateHour,
        strategy: strategy,
        customBufferMW: Number(customBufferMW),
        dayAheadPriceGBP: Number(daPrice),
        systemBuyPriceGBP: Number(sbpPrice),
        systemSellPriceGBP: Number(sspPrice)
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Simulation error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [targetDate, strategy, gateHour, customBufferMW, daPrice, sbpPrice, sspPrice]);

  const financial = simResult?.financialComparison || {};
  const risk = simResult?.riskComparison || {};
  const timeline = simResult?.timeline || [];

  const handleExportLedgerCSV = () => {
    if (!timeline || timeline.length === 0) return;
    const headers = ['Settlement_Period', 'Time', 'Demand_MW', 'Actual_Wind_MW', 'Forecast_Wind_MW', 'Hedged_Thermal_Procured_MW', 'Naive_Procured_MW', 'Hedged_Imbalance_MW', 'Naive_Imbalance_MW'];
    const rows = timeline.map(d => [
      d.settlementPeriod,
      `"${d.time}"`,
      d.consumerDemandMW,
      d.actualWindMW,
      d.forecastWindMW,
      d.hedgedProcureMW,
      d.naiveProcureMW,
      d.hedgedImbalanceMW,
      d.naiveImbalanceMW
    ].join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vortex_settlement_ledger_${targetDate}_${strategy}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTimeline = timeline.filter(d => {
    if (ledgerFilter === 'short_only' && d.hedgedImbalanceMW >= 0) return false;
    if (ledgerFilter === 'long_only' && d.hedgedImbalanceMW <= 0) return false;
    if (ledgerSearch) {
      const q = ledgerSearch.toLowerCase();
      const matchSp = String(d.settlementPeriod).includes(q);
      const matchTime = (d.time || '').toLowerCase().includes(q);
      if (!matchSp && !matchTime) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Simulator Control Header */}
      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Day-Ahead Thermal Power Procurement & Risk Hedging Simulator
              </h2>
              <span className="badge-status badge-green">Decision Support Engine</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', margin: 0, marginTop: '4px' }}>
              Calculate residual power needed beyond wind, applying quantified risk buffers to avoid punitive System Buy Price penalties
            </p>
          </div>

          {/* Quick Date Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} /> Delivery Date:
            </span>
            <select
              id="select-sim-date"
              className="custom-select"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            >
              {[...Array(31)].map((_, i) => {
                const day = String(i + 1).padStart(2, '0');
                const dStr = `2026-01-${day}`;
                return (
                  <option key={dStr} value={dStr}>
                    {dStr} (January {i + 1}, 2026)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Strategy Selector Pills (Strict 5 Colors) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          
          {/* Strategy 1: Naive (Red) */}
          <div 
            onClick={() => setStrategy('naive')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: strategy === 'naive' ? 'var(--red-soft)' : '#FFFFFF',
              border: `2px solid ${strategy === 'naive' ? 'var(--red)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: strategy === 'naive' ? '0 0 0 2px rgba(220, 38, 38, 0.15)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: strategy === 'naive' ? 'var(--red-dark)' : 'var(--text-main)' }}>
                1. Naive (0 MW Buffer)
              </span>
              <span className="badge-status badge-red">High Risk</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Procures <code>Demand - WindForecast</code>. Highly vulnerable to January 2026 over-forecasting shortfalls.
            </p>
          </div>

          {/* Strategy 2: Bias De-Risked (Yellow) */}
          <div 
            onClick={() => setStrategy('bias_adjusted')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: strategy === 'bias_adjusted' ? 'var(--yellow-soft)' : '#FFFFFF',
              border: `2px solid ${strategy === 'bias_adjusted' ? 'var(--yellow)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: strategy === 'bias_adjusted' ? '0 0 0 2px rgba(202, 138, 4, 0.15)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: strategy === 'bias_adjusted' ? 'var(--yellow-dark)' : 'var(--text-main)' }}>
                2. Bias De-Risked (+1,840 MW)
              </span>
              <span className="badge-status badge-yellow">Balanced</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Deducts historical mean bias (+1,840 MW) from wind expectation to offset baseline model optimism.
            </p>
          </div>

          {/* Strategy 3: P90 Conservative (Green) */}
          <div 
            onClick={() => setStrategy('p90_conservative')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: strategy === 'p90_conservative' ? 'var(--green-soft)' : '#FFFFFF',
              border: `2px solid ${strategy === 'p90_conservative' ? 'var(--green)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: strategy === 'p90_conservative' ? '0 0 0 2px rgba(22, 163, 74, 0.15)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: strategy === 'p90_conservative' ? 'var(--green-dark)' : 'var(--text-main)' }}>
                3. P90 Conservative (+3,500 MW)
              </span>
              <span className="badge-status badge-green">Recommended</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Hedges 90% of worst-case wind drops. Protects utility against crippling Cashout SBP spikes.
            </p>
          </div>

          {/* Strategy 4: Custom Risk Buffer (Blue) */}
          <div 
            onClick={() => setStrategy('custom_buffer')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: strategy === 'custom_buffer' ? 'var(--blue-soft)' : '#FFFFFF',
              border: `2px solid ${strategy === 'custom_buffer' ? 'var(--blue)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: strategy === 'custom_buffer' ? '0 0 0 2px rgba(37, 99, 235, 0.15)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: strategy === 'custom_buffer' ? 'var(--blue-dark)' : 'var(--text-main)' }}>
                4. Custom Risk Buffer
              </span>
              <span className="badge-status badge-blue">Trader Defined</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={customBufferMW}
                onChange={(e) => {
                  setCustomBufferMW(Number(e.target.value));
                  if (strategy !== 'custom_buffer') setStrategy('custom_buffer');
                }}
                style={{ flex: 1 }}
              />
              <span className="mono-num" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue-dark)' }}>
                {customBufferMW} MW
              </span>
            </div>
          </div>

        </div>

        {/* Pricing Assumptions Bar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          flexWrap: 'wrap', 
          padding: '12px 18px', 
          background: 'var(--bg-sunken)', 
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '12.5px'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-dim)' }}>Market Pricing Assumptions (£/MWh):</span>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--blue-dark)', fontWeight: 600 }}>Day-Ahead Wholesale:</span>
            <input 
              type="number" 
              className="custom-input" 
              style={{ width: '65px', padding: '4px 6px', fontSize: '12px' }} 
              value={daPrice} 
              onChange={(e) => setDaPrice(e.target.value)} 
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--red-dark)', fontWeight: 600 }}>System Buy Price (Short SBP):</span>
            <input 
              type="number" 
              className="custom-input" 
              style={{ width: '65px', padding: '4px 6px', fontSize: '12px' }} 
              value={sbpPrice} 
              onChange={(e) => setSbpPrice(e.target.value)} 
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--green-dark)', fontWeight: 600 }}>System Sell Price (Surplus SSP):</span>
            <input 
              type="number" 
              className="custom-input" 
              style={{ width: '65px', padding: '4px 6px', fontSize: '12px' }} 
              value={sspPrice} 
              onChange={(e) => setSspPrice(e.target.value)} 
            />
          </label>

          <button 
            onClick={runSimulation}
            className="btn-primary"
            style={{
              marginLeft: 'auto',
              padding: '6px 14px',
              fontSize: '12px'
            }}
          >
            Re-calculate
          </button>
        </div>
      </div>

      {/* Simulator Results KPI Cards (Strict 5 Colors) */}
      <div className="metrics-grid-4">
        
        <MetricCard
          title="Net Commercial Savings"
          value={financial.netSavingsGBP ? `£${Math.round(financial.netSavingsGBP).toLocaleString()}` : '£0'}
          subtitle={`Day's cost reduced by ${financial.percentCostReduction || 0}%`}
          badgeText="Avoided Penalties"
          badgeType="green"
          icon={Coins}
        />

        <MetricCard
          title="Short Imbalance Periods Avoided"
          value={risk.naiveShortPeriodsCount !== undefined ? `${risk.naiveShortPeriodsCount - (risk.hedgedShortPeriodsCount || 0)} SPs` : '---'}
          subtitle={`Down from ${risk.naiveShortPeriodsCount || 0} SPs to ${risk.hedgedShortPeriodsCount || 0} SPs`}
          badgeText="Risk Reduction"
          badgeType="blue"
          icon={ShieldCheck}
        />

        <MetricCard
          title="Peak Shortage Exposure"
          value={risk.hedgedPeakShortageMW !== undefined ? `${risk.hedgedPeakShortageMW} MW` : '---'}
          subtitle={`Naive peak shortage: ${risk.naivePeakShortageMW || 0} MW`}
          badgeText="Peak Protection"
          badgeType="yellow"
          icon={AlertOctagon}
        />

        <MetricCard
          title="Applied Risk Buffer"
          value={`${simResult?.appliedBufferMW || 0}`}
          unit="MW"
          subtitle={`Subtracted from Day-Ahead wind`}
          badgeText="Safety Margin"
          badgeType="green"
          icon={Flame}
        />

      </div>

      {/* Settlement Period Procurement Timeline Chart */}
      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Settlement Period Power Dispatch & Imbalance Profile ({targetDate})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '3px' }}>
              Comparison across all 48 Half-Hourly Settlement Periods: Demand, Wind, and Additional Thermal Power Needed
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
              <div style={{ width: '14px', height: '3px', borderRadius: '2px', backgroundColor: '#0F172A' }} />
              Consumer Demand (MW)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green-dark)' }}>
              <div style={{ width: '14px', height: '3px', borderRadius: '2px', backgroundColor: 'var(--green)' }} />
              Actual Wind (MW)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--orange-dark)' }}>
              <div style={{ width: '14px', height: '3px', borderRadius: '2px', backgroundColor: 'var(--orange)' }} />
              Hedged Thermal Procured
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--red-dark)' }}>
              <div style={{ width: '14px', height: 0, borderTop: '2px dashed var(--red)' }} />
              Naive Procured
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: '380px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={10} interval={3} />
              <YAxis stroke="#64748B" fontSize={10} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
              <Tooltip content={<SimTooltip />} />
              
              <Line type="monotone" dataKey="consumerDemandMW" stroke="#0F172A" strokeWidth={2} dot={false} name="Consumer Demand" />
              <Line type="monotone" dataKey="actualWindMW" stroke="#16A34A" strokeWidth={2.2} dot={false} name="Actual Wind" />
              <Line type="monotone" dataKey="hedgedProcureMW" stroke="#EA580C" strokeWidth={2.5} dot={false} name="Hedged Thermal Procured" />
              <Line type="monotone" dataKey="naiveProcureMW" stroke="#DC2626" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Naive Thermal Procured" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-Time Imbalance Exposure Chart */}
      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Real-Time Imbalance MW: Naive vs Hedged Procurement
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '3px' }}>
            Negative bars (Red) = Short power position (utility must buy at penalty Cashout SBP) | Positive bars (Green) = Long power position
          </p>
        </div>

        <div style={{ width: '100%', height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={10} interval={3} />
              <YAxis stroke="#64748B" fontSize={10} />
              <Tooltip content={<ImbalanceTooltip />} />
              <ReferenceLine y={0} stroke="#94A3B8" />
              
              <Bar dataKey="naiveImbalanceMW" fill="#DC2626" fillOpacity={0.7} name="Naive Imbalance (MW)" />
              <Bar dataKey="hedgedImbalanceMW" fill="#16A34A" fillOpacity={0.85} name="Hedged Imbalance (MW)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Settlement Period Procurement & Imbalance Ledger Table */}
      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Settlement Period Data Ledger ({targetDate})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '3px' }}>
              Granular half-hourly breakdown of power balances, thermal contracts, and imbalance cashout positions
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search SP (e.g. 17) or Time..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="custom-input"
                style={{ width: '180px', paddingLeft: '28px', fontSize: '12px' }}
              />
              <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>

            {/* Filter Toggle Segmented Control */}
            <div className="segmented-control">
              <button
                onClick={() => setLedgerFilter('all')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  background: ledgerFilter === 'all' ? '#FFFFFF' : 'transparent',
                  color: ledgerFilter === 'all' ? 'var(--blue-dark)' : 'var(--text-dim)',
                  boxShadow: ledgerFilter === 'all' ? '0 1px 2px rgba(15, 23, 42, 0.08)' : 'none',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                All (48)
              </button>
              <button
                onClick={() => setLedgerFilter('short_only')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  background: ledgerFilter === 'short_only' ? 'var(--red-soft)' : 'transparent',
                  color: ledgerFilter === 'short_only' ? 'var(--red-dark)' : 'var(--text-dim)',
                  boxShadow: ledgerFilter === 'short_only' ? '0 1px 2px rgba(220, 38, 38, 0.1)' : 'none',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Short Only
              </button>
              <button
                onClick={() => setLedgerFilter('long_only')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  background: ledgerFilter === 'long_only' ? 'var(--green-soft)' : 'transparent',
                  color: ledgerFilter === 'long_only' ? 'var(--green-dark)' : 'var(--text-dim)',
                  boxShadow: ledgerFilter === 'long_only' ? '0 1px 2px rgba(22, 163, 74, 0.1)' : 'none',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Long Only
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportLedgerCSV}
              className="btn-pill-blue"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                fontSize: '12px'
              }}
            >
              <Download size={13} />
              <span>Export Ledger</span>
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div style={{ overflowX: 'auto', maxHeight: '380px' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>SP #</th>
                <th>Time</th>
                <th style={{ textAlign: 'right' }}>Consumer Demand</th>
                <th style={{ textAlign: 'right' }}>Actual Wind</th>
                <th style={{ textAlign: 'right' }}>DA Wind Forecast</th>
                <th style={{ textAlign: 'right' }}>Hedged Thermal</th>
                <th style={{ textAlign: 'right' }}>Naive Thermal</th>
                <th style={{ textAlign: 'right' }}>Hedged Imbalance</th>
                <th style={{ textAlign: 'center' }}>Balancing Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTimeline.map((row, idx) => {
                const isShort = row.hedgedImbalanceMW < 0;
                const isLong = row.hedgedImbalanceMW > 0;
                return (
                  <tr key={idx}>
                    <td className="mono-num" style={{ fontWeight: 700, color: 'var(--blue-dark)' }}>
                      SP {row.settlementPeriod}
                    </td>
                    <td className="mono-num" style={{ color: 'var(--text-dim)' }}>
                      {row.time}
                    </td>
                    <td className="mono-num" style={{ textAlign: 'right', color: 'var(--text-main)' }}>
                      {row.consumerDemandMW?.toLocaleString()} MW
                    </td>
                    <td className="mono-num" style={{ textAlign: 'right', color: 'var(--green-dark)', fontWeight: 600 }}>
                      {row.actualWindMW?.toLocaleString()} MW
                    </td>
                    <td className="mono-num" style={{ textAlign: 'right', color: 'var(--blue-dark)' }}>
                      {row.forecastWindMW?.toLocaleString()} MW
                    </td>
                    <td className="mono-num" style={{ textAlign: 'right', color: 'var(--orange-dark)', fontWeight: 600 }}>
                      {row.hedgedProcureMW?.toLocaleString()} MW
                    </td>
                    <td className="mono-num" style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                      {row.naiveProcureMW?.toLocaleString()} MW
                    </td>
                    <td className="mono-num" style={{ textAlign: 'right', fontWeight: 700, color: isShort ? 'var(--red-dark)' : 'var(--green-dark)' }}>
                      {row.hedgedImbalanceMW > 0 ? `+${row.hedgedImbalanceMW.toLocaleString()}` : row.hedgedImbalanceMW?.toLocaleString()} MW
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isShort ? (
                        <span className="badge-status badge-red" style={{ fontSize: '10px', padding: '2px 8px' }}>
                          Short Exposure
                        </span>
                      ) : isLong ? (
                        <span className="badge-status badge-green" style={{ fontSize: '10px', padding: '2px 8px' }}>
                          Long / Safe
                        </span>
                      ) : (
                        <span className="badge-status badge-blue" style={{ fontSize: '10px', padding: '2px 8px' }}>
                          Balanced
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-dim)' }}>
          <span>Showing {filteredTimeline.length} of {timeline.length} settlement periods for delivery date {targetDate}</span>
          <span>Imbalance prices: SBP £{sbpPrice}/MWh | SSP £{sspPrice}/MWh | Day-Ahead £{daPrice}/MWh</span>
        </div>
      </div>

    </div>
  );
}

function SimTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload || {};
  return (
    <div style={{ 
      background: '#FFFFFF', 
      border: '1px solid var(--border-subtle)', 
      borderRadius: '8px', 
      padding: '12px 14px', 
      fontSize: '12px',
      boxShadow: 'var(--shadow-modal)'
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Time: {d.time} (SP {d.settlementPeriod})</div>
      <div style={{ color: 'var(--text-main)' }}>Demand: {d.consumerDemandMW?.toLocaleString()} MW</div>
      <div style={{ color: 'var(--green-dark)' }}>Actual Wind: {d.actualWindMW?.toLocaleString()} MW</div>
      <div style={{ color: 'var(--blue-dark)' }}>Forecast Wind: {d.forecastWindMW?.toLocaleString()} MW</div>
      <div style={{ color: 'var(--orange-dark)', marginTop: '4px', fontWeight: 600 }}>Hedged Thermal Needed: {d.hedgedProcureMW?.toLocaleString()} MW</div>
      <div style={{ color: 'var(--red-dark)' }}>Naive Thermal Needed: {d.naiveProcureMW?.toLocaleString()} MW</div>
    </div>
  );
}

function ImbalanceTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload || {};
  return (
    <div style={{ 
      background: '#FFFFFF', 
      border: '1px solid var(--border-subtle)', 
      borderRadius: '8px', 
      padding: '10px 14px', 
      fontSize: '12px',
      boxShadow: 'var(--shadow-modal)'
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Time: {d.time} (SP {d.settlementPeriod})</div>
      <div style={{ color: d.naiveImbalanceMW < 0 ? 'var(--red-dark)' : 'var(--green-dark)', marginTop: '4px', fontWeight: 600 }}>
        Naive Imbalance: {d.naiveImbalanceMW > 0 ? `+${d.naiveImbalanceMW}` : d.naiveImbalanceMW} MW
      </div>
      <div style={{ color: d.hedgedImbalanceMW < 0 ? 'var(--red-dark)' : 'var(--green-dark)', fontWeight: 600 }}>
        Hedged Imbalance: {d.hedgedImbalanceMW > 0 ? `+${d.hedgedImbalanceMW}` : d.hedgedImbalanceMW} MW
      </div>
    </div>
  );
}
