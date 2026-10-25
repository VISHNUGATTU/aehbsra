import React from 'react';
import { 
  Zap, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Presentation, 
  Code2, 
  TrendingUp,
  AlertTriangle,
  Flame,
  ArrowUpRight
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenPitch,
  onOpenTechLead,
  dataHealth
}) {
  return (
    <header style={{ marginBottom: '20px' }}>
      {/* Main Top Header Glass Panel */}
      <div className="glass-panel" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Brand / Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Zap size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', margin: 0 }}>
                  VORTEX <span style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>POWER</span>
                </h1>
                <span className="badge-status badge-cyan">
                  UK Day-Ahead Energy Desk
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '2px', fontWeight: 500 }}>
                National Wind Generation Forecast Evaluation & Procurement Risk Hedging Portal
              </p>
            </div>
          </div>

          {/* Live Status Badge & Presentation Cues */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Live Data Badge */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(11, 18, 33, 0.85)', 
              padding: '6px 14px', 
              borderRadius: '8px', 
              border: '1px solid rgba(255, 255, 255, 0.08)' 
            }}>
              <div className="pulse-indicator"></div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                {dataHealth?.isSnapshot ? 'Elexon BMRS Verified Snapshot:' : 'Elexon BMRS Live API:'}{' '}
                <strong style={{ color: '#FFFFFF' }}>January 2026</strong>
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span style={{ fontSize: '11px', color: dataHealth?.isSnapshot ? 'var(--accent-cyan)' : 'var(--accent-emerald)', fontWeight: 700 }}>
                {dataHealth?.isSnapshot ? '100% Complete (1,488 SPs)' : '100% Synchronized (1,488 SPs)'}
              </span>
            </div>

            {/* Presentation Buttons */}
            <button 
              id="btn-client-pitch"
              onClick={onOpenPitch}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 15px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.45)',
                color: '#C7D2FE',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.2)'
              }}
              title="Open 5-Minute Client Pitch Teleprompter & Slide Walkthrough"
            >
              <Presentation size={15} />
              <span>Client Pitch (5m)</span>
            </button>

            <button 
              id="btn-tech-lead"
              onClick={onOpenTechLead}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 15px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#E2E8F0',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Open 5-Minute Technical Lead Architecture & Code Review"
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
          gap: '10px', 
          marginTop: '16px', 
          paddingTop: '14px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
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
          <span className="ticker-label">MARKET GATE CLOSURE:</span>
          <span className="ticker-value" style={{ color: 'var(--accent-cyan)' }}>11:00 UTC (D-1)</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>

        <div className="ticker-item">
          <span className="ticker-label">EPEX SPOT GB DA INDEX:</span>
          <span className="ticker-value">£78.50 / MWh</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>

        <div className="ticker-item">
          <span className="ticker-label">CASHOUT SBP (SHORT PENALTY):</span>
          <span className="ticker-value" style={{ color: '#FB7185' }}>£115.00 / MWh</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>

        <div className="ticker-item">
          <span className="ticker-label">CASHOUT SSP (SURPLUS LONG):</span>
          <span className="ticker-value" style={{ color: '#FBBF24' }}>£48.00 / MWh</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>

        <div className="ticker-item">
          <span className="ticker-label">IMBALANCE CASHOUT SPREAD:</span>
          <span className="ticker-value" style={{ color: '#FB7185' }}>£67.00 / MWh</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>

        <div className="ticker-item">
          <span className="ticker-label">JAN 2026 MEAN WIND:</span>
          <span className="ticker-value" style={{ color: '#34D399' }}>11,580.7 MW</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>

        <div className="ticker-item">
          <span className="ticker-label">SYSTEMATIC OVER-BIAS:</span>
          <span className="ticker-value" style={{ color: '#FBBF24' }}>+1,840.3 MW (71.2% Over-forecast)</span>
        </div>
      </div>
    </header>
  );
}
