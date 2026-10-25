import React from 'react';
import { 
  Zap, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Presentation, 
  Code2
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenPitch,
  onOpenTechLead,
  dataHealth
}) {
  return (
    <header style={{ marginBottom: '24px' }}>
      {/* Main Top Header White Card */}
      <div className="glass-panel" style={{ padding: '20px 28px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          {/* Brand / Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              flexShrink: 0
            }}>
              <Zap size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: 0 }}>
                  VORTEX <span style={{ color: 'var(--blue)', fontWeight: 700 }}>POWER</span>
                </h1>
                <span className="badge-status badge-blue">
                  UK Day-Ahead Energy Desk
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '3px', fontWeight: 500 }}>
                National Wind Generation Forecast Evaluation & Thermal Procurement Risk Hedging Portal
              </p>
            </div>
          </div>

          {/* Live Status Badge & Presentation Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Live Data Badge */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'var(--bg-sunken)', 
              padding: '7px 14px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-subtle)' 
            }}>
              <div className="pulse-indicator"></div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                {dataHealth?.isSnapshot ? 'Elexon BMRS Verified Snapshot:' : 'Elexon BMRS Live Stream:'}{' '}
                <strong style={{ color: 'var(--text-main)' }}>January 2026</strong>
              </span>
              <span style={{ color: 'var(--border-strong)' }}>|</span>
              <span style={{ fontSize: '11px', color: 'var(--green-dark)', fontWeight: 700 }}>
                {dataHealth?.isSnapshot ? '100% Complete (1,488 SPs)' : '100% Synchronized (1,488 SPs)'}
              </span>
            </div>

            {/* Presentation Buttons */}
            <button 
              id="btn-client-pitch"
              onClick={onOpenPitch}
              className="btn-primary"
              style={{ fontSize: '12.5px', padding: '7px 15px' }}
              title="Open 5-Minute Client Pitch Teleprompter & Slide Deck"
            >
              <Presentation size={15} />
              <span>Client Pitch (5m)</span>
            </button>

            <button 
              id="btn-tech-lead"
              onClick={onOpenTechLead}
              className="btn-secondary"
              style={{ fontSize: '12.5px', padding: '7px 15px' }}
              title="Open Technical Lead Architecture & Code Review"
            >
              <Code2 size={15} />
              <span>Tech Lead Review (5m)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tab Bar */}
        <nav style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginTop: '18px', 
          paddingTop: '16px', 
          borderTop: '1px solid var(--border-subtle)',
          overflowX: 'auto'
        }}>
          <button 
            id="tab-workspace"
            className={`nav-tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
            onClick={() => setActiveTab('workspace')}
          >
            <Activity size={16} />
            <span>1. Day-Ahead Procurement Workspace</span>
          </button>

          <button 
            id="tab-accuracy"
            className={`nav-tab-btn ${activeTab === 'accuracy' ? 'active' : ''}`}
            onClick={() => setActiveTab('accuracy')}
          >
            <BarChart3 size={16} />
            <span>2. Quantitative Forecast Accuracy Lab</span>
          </button>

          <button 
            id="tab-simulator"
            className={`nav-tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            <ShieldCheck size={16} />
            <span>3. Trader Decision & Hedge Simulator</span>
          </button>
        </nav>
      </div>

      {/* Institutional Market Ticker Tape */}
      <div className="market-ticker-strip">
        <div className="ticker-item">
          <span className="ticker-label">DECISION GATE CLOSURE:</span>
          <span className="ticker-value" style={{ color: 'var(--blue)' }}>11:00 UTC (D-1)</span>
        </div>
        <div className="ticker-sep" />

        <div className="ticker-item">
          <span className="ticker-label">EPEX SPOT GB DA INDEX:</span>
          <span className="ticker-value">£78.50 / MWh</span>
        </div>
        <div className="ticker-sep" />

        <div className="ticker-item">
          <span className="ticker-label">CASHOUT SBP (SHORT PENALTY):</span>
          <span className="ticker-value" style={{ color: 'var(--red-dark)' }}>£115.00 / MWh</span>
        </div>
        <div className="ticker-sep" />

        <div className="ticker-item">
          <span className="ticker-label">CASHOUT SSP (SURPLUS SPILL):</span>
          <span className="ticker-value" style={{ color: 'var(--yellow-dark)' }}>£48.00 / MWh</span>
        </div>
        <div className="ticker-sep" />

        <div className="ticker-item">
          <span className="ticker-label">IMBALANCE SPREAD:</span>
          <span className="ticker-value" style={{ color: 'var(--red-dark)' }}>£67.00 / MWh</span>
        </div>
        <div className="ticker-sep" />

        <div className="ticker-item">
          <span className="ticker-label">JAN 2026 MEAN WIND:</span>
          <span className="ticker-value" style={{ color: 'var(--green-dark)' }}>11,580.7 MW</span>
        </div>
        <div className="ticker-sep" />

        <div className="ticker-item">
          <span className="ticker-label">SYSTEMATIC OVER-BIAS:</span>
          <span className="ticker-value" style={{ color: 'var(--yellow-dark)' }}>+1,840.3 MW (71.2% Over-forecast)</span>
        </div>
      </div>
    </header>
  );
}
