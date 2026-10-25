import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DayAheadView from './components/DayAheadView';
import AccuracyLabView from './components/AccuracyLabView';
import ProcurementSimulator from './components/ProcurementSimulator';
import ClientPitchModal from './components/ClientPitchModal';
import ArchitectureModal from './components/ArchitectureModal';
import { 
  fetchHealth, 
  fetchOverview, 
  fetchTimeseries, 
  fetchMetrics 
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [gateHour, setGateHour] = useState(11);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');
  const [resolution, setResolution] = useState('hourly');

  const [overviewData, setOverviewData] = useState(null);
  const [timeseriesData, setTimeseriesData] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [dataHealth, setDataHealth] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [isTechLeadOpen, setIsTechLeadOpen] = useState(false);

  // Set date range helper
  const setDateRange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Main data loader
  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [healthRes, overviewRes, tsRes, metricsRes] = await Promise.all([
          fetchHealth().catch(() => null),
          fetchOverview(gateHour, startDate, endDate),
          fetchTimeseries(gateHour, startDate, endDate, resolution),
          fetchMetrics(gateHour, startDate, endDate, resolution)
        ]);

        if (isMounted) {
          if (healthRes) setDataHealth(healthRes);
          setOverviewData(overviewRes);
          setTimeseriesData(tsRes?.data || []);
          setMetricsData(metricsRes);
        }
      } catch (err) {
        console.error('Data load error:', err);
        if (isMounted) {
          setError(err.message || 'Unable to load power forecast data');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => { isMounted = false; };
  }, [gateHour, startDate, endDate, resolution]);

  return (
    <div className="app-container">
      {/* Header and Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPitch={() => setIsPitchOpen(true)}
        onOpenTechLead={() => setIsTechLeadOpen(true)}
        dataHealth={dataHealth}
      />

      {/* Main Content Area */}
      <main>
        {loading && !overviewData ? (
          <div className="glass-panel" style={{ padding: '80px', textAlign: 'center' }}>
            <div className="pulse-indicator" style={{ width: '16px', height: '16px', margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
              Synchronizing UK Day-Ahead Elexon Data...
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>
              Aligning FUELHH actuals with WINDFOR forecasts at {gateHour}:00 UTC D-1 Gate Closure
            </p>
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderColor: 'var(--accent-rose)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FB7185', marginBottom: '8px' }}>
              Connection Error
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {error}. Ensure the FastAPI backend server is running on port 8000.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                background: 'var(--accent-cyan)',
                border: 'none',
                color: '#000000',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'workspace' && (
              <DayAheadView
                timeseriesData={timeseriesData}
                overviewData={overviewData}
                gateHour={gateHour}
                setGateHour={setGateHour}
                startDate={startDate}
                endDate={endDate}
                setDateRange={setDateRange}
                resolution={resolution}
                setResolution={setResolution}
                loading={loading}
              />
            )}

            {activeTab === 'accuracy' && (
              <AccuracyLabView
                metricsData={metricsData}
                gateHour={gateHour}
                startDate={startDate}
                endDate={endDate}
                resolution={resolution}
              />
            )}

            {activeTab === 'simulator' && (
              <ProcurementSimulator
                gateHour={gateHour}
              />
            )}
          </>
        )}
      </main>

      {/* Presentation Pitch Modal */}
      <ClientPitchModal
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
      />

      {/* Internal Tech Lead Review Modal */}
      <ArchitectureModal
        isOpen={isTechLeadOpen}
        onClose={() => setIsTechLeadOpen(false)}
      />

      {/* Global App Footer */}
      <footer style={{ 
        marginTop: '40px', 
        paddingTop: '20px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px',
        color: 'var(--text-dim)'
      }}>
        <div>
          VORTEX Power Procurement Decision Support System | Built with React & Python FastAPI
        </div>
        <div>
          Data Source: Official Elexon BMRS Open Data Streams (FUELHH & WINDFOR) | January 2026
        </div>
      </footer>
    </div>
  );
}
