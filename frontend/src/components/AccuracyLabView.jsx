import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  Percent, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  Sliders, 
  HelpCircle,
  Activity,
  Layers
} from 'lucide-react';
import MetricCard from './MetricCard';
import { fetchDiurnal, fetchDistribution, fetchRampAnalysis } from '../services/api';

export default function AccuracyLabView({
  metricsData,
  gateHour,
  startDate,
  endDate,
  resolution
}) {
  const [diurnalData, setDiurnalData] = useState([]);
  const [distData, setDistData] = useState({ bins: [], kde: [] });
  const [rampData, setRampData] = useState({});
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    async function loadLabData() {
      setLoadingExtras(true);
      try {
        const [diurnal, dist, ramp] = await Promise.all([
          fetchDiurnal(gateHour, startDate, endDate, resolution),
          fetchDistribution(gateHour, startDate, endDate, 28),
          fetchRampAnalysis(gateHour, startDate, endDate)
        ]);
        setDiurnalData(diurnal || []);
        setDistData(dist || { bins: [], kde: [] });
        setRampData(ramp || {});
      } catch (err) {
        console.error('Failed to load lab data:', err);
      } finally {
        setLoadingExtras(false);
      }
    }
    loadLabData();
  }, [gateHour, startDate, endDate, resolution]);

  const quantiles = metricsData?.quantiles || {};
  const intraday = metricsData?.intradayBenchmark || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(19, 30, 52, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Quantitative Forecast Error & Risk Evaluation Engine
              </h2>
              <span className="badge-status badge-cyan">ISO Standard Metric Suite</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0, marginTop: '4px' }}>
              Rigorous statistical audit of UK National Wind Generation forecasts at Gate Closure {gateHour}:00 UTC D-1
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', fontSize: '12px', color: 'var(--text-muted)' }}>
              Sample Size: <strong style={{ color: '#FFFFFF' }}>{metricsData?.sampleCount || 0}</strong> observations
            </div>
          </div>
        </div>
      </div>

      {/* Primary Quantitative Metrics Grid */}
      <div className="metrics-grid-4">
        <MetricCard
          title="Mean Absolute Error (MAE)"
          value={metricsData?.mae ? metricsData.mae.toLocaleString() : '---'}
          unit="MW"
          subtitle={`Normalized: ${metricsData?.normalizedMaePercent || '--'}% of capacity`}
          badgeText="Volume Error"
          badgeType="cyan"
          icon={Percent}
        />

        <MetricCard
          title="Root Mean Square Error (RMSE)"
          value={metricsData?.rmse ? metricsData.rmse.toLocaleString() : '---'}
          unit="MW"
          subtitle={`Normalized: ${metricsData?.normalizedRmsePercent || '--'}% of capacity`}
          badgeText="Penalizes Spikes"
          badgeType="cyan"
          icon={Activity}
        />

        <MetricCard
          title="Weighted Abs % Error (WAPE)"
          value={metricsData?.wape ? `${metricsData.wape}%` : '---'}
          subtitle="Sum(|Errors|) / Sum(Actuals)"
          badgeText="Wind Industry Std"
          badgeType="green"
          icon={BarChart3}
        />

        <MetricCard
          title="Mean Directional Bias (MBE)"
          value={metricsData?.bias ? (metricsData.bias > 0 ? `+${metricsData.bias}` : metricsData.bias) : '---'}
          unit="MW"
          subtitle={metricsData?.bias > 0 ? 'Persistent Over-Prediction' : 'Under-Prediction'}
          badgeText={metricsData?.bias > 0 ? 'Short Exposure' : 'Long Exposure'}
          badgeType={metricsData?.bias > 0 ? 'amber' : 'green'}
          icon={TrendingUp}
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Correlation (r)</span>
          <div className="mono-num" style={{ fontSize: '20px', fontWeight: 700, color: '#38BDF8', marginTop: '2px' }}>
            {metricsData?.correlation || '---'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>High co-movement</span>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>R² Fit Score</span>
          <div className="mono-num" style={{ fontSize: '20px', fontWeight: 700, color: '#34D399', marginTop: '2px' }}>
            {metricsData?.r2Score || '---'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Variance explained</span>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Over-Forecast Frequency</span>
          <div className="mono-num" style={{ fontSize: '20px', fontWeight: 700, color: '#FBBF24', marginTop: '2px' }}>
            {metricsData?.overForecastFrequencyPercent || '---'}%
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hours forecast exceeded actual</span>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Intraday MAE Improvement</span>
          <div className="mono-num" style={{ fontSize: '20px', fontWeight: 700, color: '#A855F7', marginTop: '2px' }}>
            {intraday.maeImprovementPercent ? `+${intraday.maeImprovementPercent}%` : '---'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{intraday.maeImprovementMW || 0} MW reduced by Delivery-1h</span>
        </div>
      </div>

      {/* Empirical Quantile Error Distribution (P10 / P50 / P90) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Empirical Error Quantiles & Downside Tail Risk
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '2px' }}>
              Used by wholesale power traders to set risk-adjusted procurement buffers and avoid cashout penalties
            </p>
          </div>
          <span className="badge-status badge-amber">Confidence Boundaries</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>P05 (Under-Gen)</span>
            <div className="mono-num" style={{ fontSize: '18px', fontWeight: 700, color: '#34D399', margin: '4px 0' }}>
              {quantiles.p05 ? `${quantiles.p05} MW` : '---'}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Extreme Wind Spill</span>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <span style={{ fontSize: '11px', color: '#34D399', fontWeight: 700 }}>P10 (Conservative)</span>
            <div className="mono-num" style={{ fontSize: '18px', fontWeight: 700, color: '#34D399', margin: '4px 0' }}>
              {quantiles.p10 ? `${quantiles.p10} MW` : '---'}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>90% Confidence Floor</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>P25 (Lower Quartile)</span>
            <div className="mono-num" style={{ fontSize: '18px', fontWeight: 700, color: '#93C5FD', margin: '4px 0' }}>
              {quantiles.p25 ? `+${quantiles.p25} MW` : '---'}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>25% Error Point</span>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <span style={{ fontSize: '11px', color: '#FBBF24', fontWeight: 700 }}>P50 (Median Error)</span>
            <div className="mono-num" style={{ fontSize: '18px', fontWeight: 700, color: '#FBBF24', margin: '4px 0' }}>
              {quantiles.p50 ? `+${quantiles.p50} MW` : '---'}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Baseline Bias Haircut</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>P75 (Upper Quartile)</span>
            <div className="mono-num" style={{ fontSize: '18px', fontWeight: 700, color: '#F87171', margin: '4px 0' }}>
              {quantiles.p75 ? `+${quantiles.p75} MW` : '---'}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>75% Error Point</span>
          </div>

          <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            <span style={{ fontSize: '11px', color: '#FB7185', fontWeight: 700 }}>P90 (Severe Short Risk)</span>
            <div className="mono-num" style={{ fontSize: '18px', fontWeight: 700, color: '#FB7185', margin: '4px 0' }}>
              {quantiles.p90 ? `+${quantiles.p90} MW` : '---'}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>90% Risk Threshold</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>P95 (Extreme Spike)</span>
            <div className="mono-num" style={{ fontSize: '18px', fontWeight: 700, color: '#FB7185', margin: '4px 0' }}>
              {quantiles.p95 ? `+${quantiles.p95} MW` : '---'}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Worst 5% Shortage</span>
          </div>

        </div>

        {/* Quantile Trading Strategy Explanation */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.6)', 
          padding: '14px 18px', 
          borderRadius: '8px', 
          border: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '12.5px',
          color: 'var(--text-muted)',
          lineHeight: 1.6
        }}>
          <strong style={{ color: '#FFFFFF' }}>Actionable Trader Guidance:</strong> When submitting Day-Ahead bids at 11:00 AM D-1, relying on the nominal forecast exposes the utility to an unhedged mean shortfall of <strong>+{metricsData?.bias} MW</strong>. By subtracting a <strong>P50 Buffer (+{quantiles.p50} MW)</strong>, the trader neutralizes the median bias. By subtracting a <strong>P90 Buffer (+{quantiles.p90} MW)</strong>, the procurement desk ensures that wind generation shortfalls will only occur in 10% of delivery hours, dramatically slashing exposure to volatile System Buy Price (SBP) imbalance cashout penalizations.
        </div>
      </div>

      {/* Two Column Layout: Error Distribution & Diurnal Settlement Pattern */}
      <div className="dual-column-grid">
        
        {/* Error Distribution Histogram */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Forecast Error Distribution (MW)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '2px' }}>
              Frequency histogram of (Forecast - Actual) | Right of 0 = Over-forecasting (Short risk)
            </p>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData.bins} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis 
                  dataKey="binCenter" 
                  stroke="#64748B" 
                  fontSize={10} 
                  tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`}
                />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip content={<DistTooltip />} />
                <ReferenceLine x={0} stroke="#10B981" strokeWidth={2} label={{ value: 'Zero Error', fill: '#10B981', fontSize: 10, position: 'top' }} />
                <ReferenceLine x={distData.p50} stroke="#FBBF24" strokeDasharray="3 3" label={{ value: `P50 (+${distData.p50})`, fill: '#FBBF24', fontSize: 10, position: 'top' }} />
                <ReferenceLine x={distData.p90} stroke="#FB7185" strokeDasharray="3 3" label={{ value: `P90 (+${distData.p90})`, fill: '#FB7185', fontSize: 10, position: 'top' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distData.bins?.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.binCenter > 0 ? (entry.binCenter > (distData.p90 || 4000) ? '#F43F5E' : '#06B6D4') : '#10B981'} 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diurnal Settlement Period Pattern */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Diurnal Error Profile by Hour of Day
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '2px' }}>
              Mean forecast bias across 24 trading hours (00:00 - 23:00 UTC)
            </p>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={diurnalData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="period" stroke="#64748B" fontSize={10} tickFormatter={(val) => `${val}:00`} />
                <YAxis stroke="#64748B" fontSize={10} tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`} />
                <Tooltip content={<DiurnalTooltip />} />
                <Bar dataKey="bias" fill="#F59E0B" fillOpacity={0.7} radius={[3, 3, 0, 0]} name="Mean Bias (MW)" />
                <Line type="monotone" dataKey="mae" stroke="#06B6D4" strokeWidth={2} dot={false} name="MAE (MW)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

function DistTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload || {};
  return (
    <div style={{ background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Range: {d.binStart} to {d.binEnd} MW</div>
      <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
        Occurrences: <strong style={{ color: '#06B6D4' }}>{d.count}</strong> hours ({((d.frequency || 0) * 100).toFixed(1)}%)
      </div>
    </div>
  );
}

function DiurnalTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload || {};
  return (
    <div style={{ background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Hour {d.period}:00 UTC</div>
      <div style={{ color: '#F59E0B', marginTop: '4px' }}>Mean Bias: +{d.bias} MW</div>
      <div style={{ color: '#06B6D4' }}>MAE: {d.mae} MW</div>
      <div style={{ color: 'var(--text-muted)' }}>Over-Forecast Rate: {d.overForecastRate}%</div>
    </div>
  );
}
