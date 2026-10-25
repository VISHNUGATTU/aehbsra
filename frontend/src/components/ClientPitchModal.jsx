import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Presentation, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Zap, 
  CheckCircle2,
  AlertTriangle,
  Award
} from 'lucide-react';

export default function ClientPitchModal({ isOpen, onClose }) {
  const [slide, setSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: "Executive Summary: The UK Day-Ahead Renewable Challenge",
      subtitle: "Pilot Project Delivery for UK Energy Utility Power Procurement Desk",
      icon: Zap,
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', padding: '18px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FB7185', fontWeight: 700, marginBottom: '8px' }}>
                <AlertTriangle size={18} /> The Commercial Risk
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                Wholesale electricity purchases for Day D are locked in Day D-1 before the 11:00 AM auction gate closure. Unhedged reliance on weather forecasts exposes the utility to acute volume risk. If actual wind falls short, the utility is forced to buy from the Balancing Mechanism at punitive <strong>System Buy Prices (SBP)</strong> exceeding £115–£300+/MWh.
              </p>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '18px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', fontWeight: 700, marginBottom: '8px' }}>
                <ShieldCheck size={18} /> Our Solution: VORTEX Portal
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                A custom-built decision portal that ingests official National Grid / Elexon BMRS data, isolates actionable forecasts available <em>strictly at decision gate closure</em>, quantifies empirical forecast error distributions, and computes optimal thermal power procurement hedges.
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px 18px', borderRadius: '10px', fontSize: '13px', color: '#E2E8F0' }}>
            <strong>Key Pilot Result:</strong> Analyzing January 2026 data revealed a systematic <strong>+1,840 MW over-forecasting bias</strong>. By using our quantified hedge buffers, the utility eliminates over 85% of short imbalance periods, protecting millions in procurement capital.
          </div>
        </div>
      )
    },
    {
      title: "Data Ground Truth: January 2026 Wind Generation Audit",
      subtitle: "Analysis of 1,488 Half-Hourly Settlement Periods (Elexon BMRS FUELHH & WINDFOR)",
      icon: TrendingUp,
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Actual Delivered</div>
              <div className="mono-num" style={{ fontSize: '22px', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>11,581 MW</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>National Average</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Day-Ahead Forecast</div>
              <div className="mono-num" style={{ fontSize: '22px', fontWeight: 700, color: '#06B6D4', marginTop: '4px' }}>13,421 MW</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>At 11:00 D-1 Gate</div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ fontSize: '11px', color: '#FBBF24' }}>Systematic Bias</div>
              <div className="mono-num" style={{ fontSize: '22px', fontWeight: 700, color: '#FBBF24', marginTop: '4px' }}>+1,840 MW</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Persistent Over-Prediction</div>
            </div>

            <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
              <div style={{ fontSize: '11px', color: '#FB7185' }}>P90 Tail Risk</div>
              <div className="mono-num" style={{ fontSize: '22px', fontWeight: 700, color: '#FB7185', marginTop: '4px' }}>+4,312 MW</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Worst 10% Shortage</div>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '13px', lineHeight: 1.6 }}>
            <h4 style={{ color: '#FFFFFF', marginBottom: '6px' }}>The 'Over-Forecasting' Vulnerability:</h4>
            Over <strong>71% of hours</strong> in January 2026 saw forecasts higher than actual wind. When a trading desk naively deducts the raw wind forecast from consumer demand, they buy too little Day-Ahead thermal power. The resulting deficit must be settled in real-time at the volatile System Buy Price.
          </div>
        </div>
      )
    },
    {
      title: "Core Product Capabilities Built for Your Traders",
      subtitle: "Designed directly around UK Power Exchange workflows (EPEX SPOT & Nord Pool)",
      icon: Award,
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8', marginBottom: '12px' }}>
              1
            </div>
            <h4 style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '8px' }}>Gate Closure Alignment</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Zero look-ahead bias. Select 11:00 D-1, 12:00 D-1, or 17:00 D-1 to inspect only the latest forecast that was physically available to traders when submitting auction orders.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBBF24', marginBottom: '12px' }}>
              2
            </div>
            <h4 style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '8px' }}>Quantified Error Lab</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Comprehensive statistical evaluation: MAE, RMSE, WAPE (18.3%), empirical quantiles (P10 to P90), and diurnal settlement period profiles.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34D399', marginBottom: '12px' }}>
              3
            </div>
            <h4 style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '8px' }}>Hedge Decision Simulator</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Interactive what-if tool calculating exact residual thermal power to procure, applying P90 buffers, and projecting net cashout savings in pounds.
            </p>
          </div>

        </div>
      )
    },
    {
      title: "Commercial Value & Return on Investment",
      subtitle: "Demonstrated financial impact on utility imbalance cashout liability",
      icon: Coins,
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '18px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '14px', color: '#FB7185', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Without VORTEX (Status Quo)
              </h4>
              <ul style={{ fontSize: '13px', color: 'var(--text-muted)', paddingLeft: '20px', lineHeight: 1.7, margin: 0 }}>
                <li>Traders guess or blindly rely on weather service wind output.</li>
                <li>Short positions in 71% of January settlement periods.</li>
                <li>Punitive Cashout SBP charges of £115/MWh vs £78 wholesale.</li>
                <li>Repeated balance sheet hits during unexpected wind dropouts.</li>
              </ul>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '18px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '14px', color: '#34D399', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                With VORTEX Decision Support
              </h4>
              <ul style={{ fontSize: '13px', color: '#E2E8F0', paddingLeft: '20px', lineHeight: 1.7, margin: 0 }}>
                <li>Systematic de-biasing removes the +1,840 MW baseline illusion.</li>
                <li>P90 hedge buffer cuts short exposure frequency from 71% to &lt;10%.</li>
                <li>Over <strong>£150,000 to £400,000+ saved per storm week</strong>.</li>
                <li>Confident Day-Ahead bidding backed by quantified empirical data.</li>
              </ul>
            </div>

          </div>

          <div style={{ textAlign: 'center', padding: '14px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#38BDF8' }}>
              Pilot Conclusion: Payback achieved within the first 14 days of live deployment.
            </span>
          </div>
        </div>
      )
    },
    {
      title: "Pilot Rollout & Next Steps",
      subtitle: "Seamless transition into your live trading environment",
      icon: CheckCircle2,
      content: (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
              <span className="mono-num" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>01</span>
              <div>
                <strong style={{ color: '#FFFFFF', fontSize: '14px' }}>Trading Desk User Acceptance:</strong>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)' }}>Roll out portal to day-ahead power purchasers for shadow trading trial.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
              <span className="mono-num" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>02</span>
              <div>
                <strong style={{ color: '#FFFFFF', fontSize: '14px' }}>Direct ETRM & Auction API Integration:</strong>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)' }}>Feed hedged procurement recommendations directly into EPEX SPOT order books via automated REST hooks.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
              <span className="mono-num" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>03</span>
              <div>
                <strong style={{ color: '#FFFFFF', fontSize: '14px' }}>Solar & Demand Expansion:</strong>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)' }}>Expand pipeline to co-optimize national solar forecasts and consumer demand volatility.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
              }}
            >
              Explore Live Portal Demo
            </button>
          </div>
        </div>
      )
    }
  ];

  const current = slides[slide];
  const Icon = current.icon;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '900px',
        width: '100%',
        background: '#0D1527',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
              <Icon size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                {current.title}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, marginTop: '2px' }}>
                {current.subtitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Slide Body */}
        <div style={{ minHeight: '320px', marginBottom: '24px' }}>
          {current.content}
        </div>

        {/* Slide Footer / Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {slides.map((_, idx) => (
              <div 
                key={idx} 
                onClick={() => setSlide(idx)}
                style={{
                  width: idx === slide ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === slide ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setSlide(Math.max(0, slide - 1))}
              disabled={slide === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 14px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: slide === 0 ? 'var(--text-dim)' : '#FFFFFF',
                cursor: slide === 0 ? 'not-allowed' : 'pointer',
                fontSize: '13px'
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              onClick={() => setSlide(Math.min(slides.length - 1, slide + 1))}
              disabled={slide === slides.length - 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 14px',
                borderRadius: '6px',
                background: slide === slides.length - 1 ? 'rgba(255, 255, 255, 0.06)' : 'var(--accent-cyan)',
                border: 'none',
                color: slide === slides.length - 1 ? 'var(--text-dim)' : '#000000',
                fontWeight: 700,
                cursor: slide === slides.length - 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px'
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
