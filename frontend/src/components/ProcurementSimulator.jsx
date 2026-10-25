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
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  ShieldCheck, 
  Coins, 
  AlertOctagon, 
  Flame, 
  Play, 
  Calendar, 
  Sliders, 
  DollarSign,
  TrendingDown,
  Layers
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
  }, [targetDate, strategy, gateHour]);

  const financial = simResult?.financialComparison || {};
  const risk = simResult?.riskComparison || {};
  const timeline = simResult?.timeline || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Simulator Control Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Day-Ahead Thermal Power Procurement & Risk Hedging Simulator
              </h2>
              <span className="badge-status badge-green">Decision Support Engine</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0, marginTop: '4px' }}>
              Calculate residual power needed beyond wind, applying quantified risk buffers to avoid punitive System Buy Price penalties
            </p>
          </div>

          {/* Quick Date Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
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

        {/* Strategy Selector Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          
          <div 
            onClick={() => setStrategy('naive')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: strategy === 'naive' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${strategy === 'naive' ? 'rgba(244, 63, 94, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: strategy === 'naive' ? '#FB7185' : '#FFFFFF' }}>
                1. Naive Strategy (0 MW Buffer)
              </span>
              <span className="badge-status badge-rose">High Risk</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Procures <code>Demand - WindForecast</code>. Highly vulnerable to January 2026 over-forecasting shortfalls.
            </p>
          </div>

          <div 
            onClick={() => setStrategy('bias_adjusted')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: strategy === 'bias_adjusted' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${strategy === 'bias_adjusted' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: strategy === 'bias_adjusted' ? '#FBBF24' : '#FFFFFF' }}>
                2. Bias De-Risked (+1,840 MW)
              </span>
              <span className="badge-status badge-amber">Balanced</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Deducts historical mean bias (+1,840 MW) from wind expectation to offset baseline model optimism.
            </p>
          </div>

          <div 
            onClick={() => setStrategy('p90_conservative')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: strategy === 'p90_conservative' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${strategy === 'p90_conservative' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: strategy === 'p90_conservative' ? '#34D399' : '#FFFFFF' }}>
                3. P90 Conservative (+3,500 MW)
              </span>
              <span className="badge-status badge-green">Recommended</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Hedges 90% of worst-case wind drops. Protects utility against crippling Cashout SBP spikes.
            </p>
          </div>

          <div 
            onClick={() => setStrategy('custom_buffer')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: strategy === 'custom_buffer' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${strategy === 'custom_buffer' ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: strategy === 'custom_buffer' ? '#38BDF8' : '#FFFFFF' }}>
                4. Custom Risk Buffer
              </span>
              <span className="badge-status badge-cyan">Trader Defined</span>
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
              <span className="mono-num" style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8' }}>
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
          background: 'rgba(15, 23, 42, 0.7)', 
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '12px'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Market Price Assumptions (£/MWh):</span>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Day-Ahead Wholesale:</span>
            <input 
              type="number" 
              className="custom-input" 
              style={{ width: '65px', padding: '4px 6px' }} 
              value={daPrice} 
              onChange={(e) => setDaPrice(e.target.value)} 
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#FB7185' }}>System Buy Price (Short Cashout):</span>
            <input 
              type="number" 
              className="custom-input" 
              style={{ width: '65px', padding: '4px 6px' }} 
              value={sbpPrice} 
              onChange={(e) => setSbpPrice(e.target.value)} 
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#34D399' }}>System Sell Price (Spill):</span>
            <input 
              type="number" 
              className="custom-input" 
              style={{ width: '65px', padding: '4px 6px' }} 
              value={sspPrice} 
              onChange={(e) => setSspPrice(e.target.value)} 
            />
          </label>

          <button 
            onClick={runSimulation}
            style={{
              marginLeft: 'auto',
              padding: '6px 14px',
              borderRadius: '6px',
              background: 'var(--accent-cyan)',
              color: '#000000',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Re-calculate
          </button>
        </div>
      </div>

      {/* Simulator Results KPI Cards */}
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
          badgeType="cyan"
          icon={ShieldCheck}
        />

        <MetricCard
          title="Peak Shortage Exposure"
          value={risk.hedgedPeakShortageMW !== undefined ? `${risk.hedgedPeakShortageMW} MW` : '---'}
          subtitle={`Naive peak shortage: ${risk.naivePeakShortageMW || 0} MW`}
          badgeText="Peak Protection"
          badgeType="amber"
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
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Settlement Period Power Dispatch & Imbalance Profile ({targetDate})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '2px' }}>
              Comparison across all 48 Half-Hourly Settlement Periods: Demand, Wind, and Additional Thermal Power Needed
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F8FAFC' }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#F8FAFC' }} />
              Consumer Demand (MW)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
              <div style={{ width: '12px', height: '3px', backgroundColor: '#10B981' }} />
              Actual Wind (MW)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F59E0B' }}>
              <div style={{ width: '12px', height: '3px', backgroundColor: '#F59E0B' }} />
              Hedged Thermal Procured
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6366F1' }}>
              <div style={{ width: '12px', height: '3px', backgroundColor: '#6366F1', strokeDasharray: '2 2' }} />
              Naive Procured
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: '380px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={10} interval={3} />
              <YAxis stroke="#64748B" fontSize={10} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
              <Tooltip content={<SimTooltip />} />
              
              <Line type="monotone" dataKey="consumerDemandMW" stroke="#FFFFFF" strokeWidth={2} dot={false} name="Consumer Demand" />
              <Line type="monotone" dataKey="actualWindMW" stroke="#10B981" strokeWidth={2.2} dot={false} name="Actual Wind" />
              <Line type="monotone" dataKey="hedgedProcureMW" stroke="#F59E0B" strokeWidth={2.5} dot={false} name="Hedged Thermal Procured" />
              <Line type="monotone" dataKey="naiveProcureMW" stroke="#6366F1" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Naive Thermal Procured" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-Time Imbalance Exposure Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Real-Time Imbalance MW: Naive vs Hedged Procurement
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '2px' }}>
            Negative bars (Red) = Short power position (utility must buy at penalty Cashout SBP) | Positive bars (Green) = Long power position
          </p>
        </div>

        <div style={{ width: '100%', height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={10} interval={3} />
              <YAxis stroke="#64748B" fontSize={10} />
              <Tooltip content={<ImbalanceTooltip />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
              
              <Bar dataKey="naiveImbalanceMW" fill="#F43F5E" fillOpacity={0.6} name="Naive Imbalance (MW)" />
              <Bar dataKey="hedgedImbalanceMW" fill="#10B981" fillOpacity={0.8} name="Hedged Imbalance (MW)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

function SimTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload || {};
  return (
    <div style={{ background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
      <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>Time: {d.time} (SP {d.settlementPeriod})</div>
      <div style={{ color: '#FFFFFF' }}>Demand: {d.consumerDemandMW?.toLocaleString()} MW</div>
      <div style={{ color: '#10B981' }}>Actual Wind: {d.actualWindMW?.toLocaleString()} MW</div>
      <div style={{ color: '#06B6D4' }}>Forecast Wind: {d.forecastWindMW?.toLocaleString()} MW</div>
      <div style={{ color: '#F59E0B', marginTop: '4px', fontWeight: 600 }}>Hedged Thermal Needed: {d.hedgedProcureMW?.toLocaleString()} MW</div>
      <div style={{ color: '#A5B4FC' }}>Naive Thermal Needed: {d.naiveProcureMW?.toLocaleString()} MW</div>
    </div>
  );
}

function ImbalanceTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload || {};
  return (
    <div style={{ background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '10px', fontSize: '12px' }}>
      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Time: {d.time} (SP {d.settlementPeriod})</div>
      <div style={{ color: d.naiveImbalanceMW < 0 ? '#FB7185' : '#34D399', marginTop: '4px' }}>
        Naive Imbalance: {d.naiveImbalanceMW > 0 ? `+${d.naiveImbalanceMW}` : d.naiveImbalanceMW} MW
      </div>
      <div style={{ color: d.hedgedImbalanceMW < 0 ? '#FB7185' : '#34D399' }}>
        Hedged Imbalance: {d.hedgedImbalanceMW > 0 ? `+${d.hedgedImbalanceMW}` : d.hedgedImbalanceMW} MW
      </div>
    </div>
  );
}
