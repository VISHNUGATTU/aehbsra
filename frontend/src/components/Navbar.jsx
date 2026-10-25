import React from 'react';
import { 
  Zap, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Presentation, 
  Code2, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenPitch,
  onOpenTechLead,
  dataHealth
}) {
  return (
    <header className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand / Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <Zap size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', margin: 0 }}>
                VORTEX <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>POWER</span>
              </h1>
              <span className="badge-status badge-cyan">
                UK Day-Ahead Energy Desk
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '2px' }}>
              National Wind Generation Forecast Evaluation & Procurement Risk Portal
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(15, 23, 42, 0.8)', 
            padding: '6px 14px', 
            borderRadius: '8px', 
            border: '1px solid rgba(255, 255, 255, 0.08)' 
          }}>
            <div className="pulse-indicator"></div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Elexon BMRS Live: <strong style={{ color: '#FFFFFF' }}>January 2026</strong>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              100% Complete (1,488 SPs)
            </span>
          </div>

          {/* Presentation & Review Buttons */}
          <button 
            id="btn-client-pitch"
            onClick={onOpenPitch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#A5B4FC',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Presentation size={15} />
            <span>Client Pitch</span>
          </button>

          <button 
            id="btn-tech-lead"
            onClick={onOpenTechLead}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#E2E8F0',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Code2 size={15} />
            <span>Tech Lead Review</span>
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginTop: '16px', 
        paddingTop: '16px', 
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
    </header>
  );
}
