import React, { useState, useEffect } from 'react';

interface Vehicle {
  id: string;
  type: string;
  euroClass: string;
  plate: string;
  pmValue: number;
  openPathValue: number;
  status: 'pass' | 'flag' | 'super';
  timestamp: Date;
}

const VEHICLE_TYPES = ['Urban Bus', 'Heavy Duty Truck', 'Coach', 'Delivery Van', 'Refuse Truck'];
const EURO_CLASSES = ['Euro 5', 'Euro 6', 'Euro VI', 'Euro 5+', 'Euro V'];
const PLATES = ['AB123CD', 'XY987ZT', 'LM456NO', 'GH789IJ', 'PK345QR', 'BN234MN'];

function generateVehicle(): Vehicle {
  const type = VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)];
  const isSuper = Math.random() < 0.12;
  const isFlag = !isSuper && Math.random() < 0.18;
  const basePM = isSuper ? 450 + Math.random() * 350 : isFlag ? 160 + Math.random() * 140 : 15 + Math.random() * 80;
  const pmValue = Math.round(basePM);

  const openPathFactor = (pmValue < 100 || Math.random() < 0.25) ? 0.15 + Math.random() * 0.25 : 0.7 + Math.random() * 0.3;
  const openPathValue = Math.round(pmValue * openPathFactor);

  let status: 'pass' | 'flag' | 'super';
  if (pmValue > 400) status = 'super';
  else if (pmValue > 150) status = 'flag';
  else status = 'pass';

  return {
    id: Math.random().toString(36).slice(2, 9),
    type,
    euroClass: EURO_CLASSES[Math.floor(Math.random() * EURO_CLASSES.length)],
    plate: PLATES[Math.floor(Math.random() * PLATES.length)] + Math.floor(Math.random() * 99),
    pmValue,
    openPathValue,
    status,
    timestamp: new Date(),
  };
}

const INITIAL_VEHICLES: Vehicle[] = Array.from({ length: 5 }, generateVehicle);
const INITIAL_STATS = INITIAL_VEHICLES.reduce(
  (acc, v) => ({
    screened: acc.screened + 1,
    flagged: acc.flagged + (v.status !== 'pass' ? 1 : 0),
    super: acc.super + (v.status === 'super' ? 1 : 0),
    missedByOpenPath: acc.missedByOpenPath + (v.openPathValue < 100 && v.pmValue > 150 ? 1 : 0),
  }),
  { screened: 0, flagged: 0, super: 0, missedByOpenPath: 0 }
);

const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="8" fill="#0f766e"/>
    <path d="M10 24c2.5-5 5-7.5 10-7.5s7.5 2.5 10 7.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="18" cy="16" r="2.5" fill="white"/>
    <path d="M18 9v7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'monitor' | 'analytics' | 'evidence'>('monitor');
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCorridor, setSelectedCorridor] = useState('Milan — Via XX Settembre');
  const [stats, setStats] = useState(INITIAL_STATS);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const v = generateVehicle();
      setVehicles(prev => [v, ...prev].slice(0, 25));
      setStats(prev => ({
        screened: prev.screened + 1,
        flagged: prev.flagged + (v.status !== 'pass' ? 1 : 0),
        super: prev.super + (v.status === 'super' ? 1 : 0),
        missedByOpenPath: prev.missedByOpenPath + (v.openPathValue < 100 && v.pmValue > 150 ? 1 : 0),
      }));
    }, 1800);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleReset = () => {
    const fresh = Array.from({ length: 5 }, generateVehicle);
    setVehicles(fresh);
    setStats(
      fresh.reduce(
        (acc, v) => ({
          screened: acc.screened + 1,
          flagged: acc.flagged + (v.status !== 'pass' ? 1 : 0),
          super: acc.super + (v.status === 'super' ? 1 : 0),
          missedByOpenPath: acc.missedByOpenPath + (v.openPathValue < 100 && v.pmValue > 150 ? 1 : 0),
        }),
        { screened: 0, flagged: 0, super: 0, missedByOpenPath: 0 }
      )
    );
    setIsRunning(false);
  };

  return (
    <div className="app">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.5; }
        button { font-family: inherit; cursor: pointer; }
        select { font-family: inherit; }
        .app { min-height: 100vh; display: flex; flex-direction: column; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; width: 100%; }
        .grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
        @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
        .evidence-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
        .table-scroll { overflow-x: auto; }
        .fade-in { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Logo />
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>AeroCheck PM</h1>
              <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>High-Precision Point Sampling for Urban Emission Compliance</p>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 8 }}>
            {(['monitor', 'analytics', 'evidence'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: activeTab === tab ? '1px solid #0f766e' : '1px solid transparent',
                  background: activeTab === tab ? '#f0fdfa' : 'transparent',
                  color: activeTab === tab ? '#0f766e' : '#475569',
                  fontSize: 14,
                  fontWeight: activeTab === tab ? 600 : 500,
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <section style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', color: '#fff', padding: '64px 24px', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1, margin: '0 auto 16px', maxWidth: 800 }}>
              Catch the 5% of Vehicles Causing 50% of Urban PM Pollution
            </h2>
            <p style={{ fontSize: 18, color: '#ccfbf1', maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.6 }}>
              Deploy high-precision point sampling sensors at transit corridors to identify super-emitting buses and heavy-duty vehicles with 5× the accuracy of open-path systems.
            </p>
            <button
              data-cta="primary-cta"
              style={{
                background: '#fff',
                color: '#115e59',
                border: 'none',
                padding: '16px 32px',
                borderRadius: 12,
                fontSize: 18,
                fontWeight: 700,
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Request Corridor Assessment
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 10h10M13 6l4 4-4 4"/>
              </svg>
            </button>
          </div>
        </section>

        <section style={{ padding: '48px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Compliance Screener Demo</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontSize: 14, color: '#334155', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Corridor
                  <select
                    value={selectedCorridor}
                    onChange={e => setSelectedCorridor(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }}
                  >
                    <option>Milan — Via XX Settembre</option>
                    <option>London — Oxford Street</option>
                    <option>Berlin — Alexanderplatz</option>
                  </select>
                </label>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  style={{ background: isRunning ? '#ef4444' : '#0f766e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}
                >
                  {isRunning ? 'Pause Screening' : 'Start Screening'}
                </button>
                <button
                  onClick={handleReset}
                  style={{ background: '#fff', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}
                >
                  Reset
                </button>
              </div>
            </div>

            {activeTab === 'monitor' && (
              <div className="grid">
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Live Feed — {selectedCorridor}</h4>
                  <div className="table-scroll">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>Time</th>
                          <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>Vehicle</th>
                          <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>Class</th>
                          <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>PM (µg/m³)</th>
                          <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>Open Path</th>
                          <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((v, i) => (
                          <tr key={v.id} className="fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', color: '#334155', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{v.timestamp.toLocaleTimeString()}</td>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', color: '#334155', whiteSpace: 'nowrap' }}>
                              {v.type}
                              <br />
                              <span style={{ fontSize: 12, color: '#94a3b8' }}>{v.plate}</span>
                            </td>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', color: '#334155', whiteSpace: 'nowrap' }}>{v.euroClass}</td>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', color: '#334155', whiteSpace: 'nowrap', fontWeight: 600 }}>{v.pmValue}</td>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', color: '#334155', whiteSpace: 'nowrap' }}>
                              <span style={v.openPathValue < 100 && v.pmValue > 150 ? { color: '#dc2626', fontWeight: 600, textDecoration: 'line-through' } : {}}>{v.openPathValue}</span>
                            </td>
                            <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                              <span style={statusStyle(v.status)}>{v.status === 'super' ? 'SUPER' : v.status === 'flag' ? 'FLAG' : 'PASS'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Total Screened</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{stats.screened}</div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Flagged / Super-Emitters</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{stats.flagged} <span style={{ fontSize: 18, color: '#64748b', fontWeight: 500 }}>({stats.super} super)</span></div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Missed by Open Path</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#dc2626' }}>{stats.missedByOpenPath}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 8, lineHeight: 1.4 }}>Vehicles that open-path would have failed to detect</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid">
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Detection Accuracy Comparison</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>PM Accuracy</div>
                      <div style={{ background: '#f1f5f9', borderRadius: 6, height: 36, overflow: 'hidden', marginBottom: 8 }}>
                        <div style={{ width: '100%', height: '100%', background: '#0f766e', display: 'flex', alignItems: 'center', paddingLeft: 12, color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 6 }}>Point Sampling — 5× more accurate</div>
                      </div>
                      <div style={{ background: '#f1f5f9', borderRadius: 6, height: 36, overflow: 'hidden' }}>
                        <div style={{ width: '20%', height: '100%', background: '#94a3b8', display: 'flex', alignItems: 'center', paddingLeft: 12, color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 6 }}>Open Path</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 8 }}>NOx Accuracy</div>
                      <div style={{ background: '#f1f5f9', borderRadius: 6, height: 36, overflow: 'hidden', marginBottom: 8 }}>
                        <div style={{ width: '100%', height: '100%', background: '#0f766e', display: 'flex', alignItems: 'center', paddingLeft: 12, color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 6 }}>Point Sampling — 1.35× more accurate</div>
                      </div>
                      <div style={{ background: '#f1f5f9', borderRadius: 6, height: 36, overflow: 'hidden' }}>
                        <div style={{ width: '74%', height: '100%', background: '#94a3b8', display: 'flex', alignItems: 'center', paddingLeft: 12, color: '#fff', fontSize: 13, fontWeight: 600, borderRadius: 6 }}>Open Path</div>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6 }}>
                    Point Sampling delivers 5× higher accuracy for PM and 1.35× for NOx versus open-path light extinction, ensuring newer Euro 5+ engines and petrol vehicles are correctly identified.
                  </p>
                </div>

                <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Super-Emitter Impact Model</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
                      <div style={{ fontSize: 36, fontWeight: 800, color: '#0f766e' }}>~15%</div>
                      <div style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>of urban buses are super-emitters</div>
                    </div>
                    <div style={{ fontSize: 24, color: '#94a3b8', fontWeight: 700 }}>→</div>
                    <div style={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
                      <div style={{ fontSize: 36, fontWeight: 800, color: '#0f766e' }}>~50%</div>
                      <div style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>of roadside PM2.5 concentrations</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6 }}>
                    Urban buses are the primary driver of roadside PM2.5. Exhaust pipe height and corridor geometry significantly influence local concentrations, making targeted checkpoint placement critical.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'evidence' && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>Evidence-Based Refinement</h4>
                <div className="evidence-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    </div>
                    <h5 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>AP-42 Inaccuracy</h5>
                    <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6 }}>
                      Standard EPA AP-42 procedures for resuspended particulate matter can produce values 9–20× higher than observed fine particulate levels. Direct high-precision measurement eliminates this regulatory unfairness.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                    <h5 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Wind Sensitivity Trade-off</h5>
                    <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6 }}>
                      While PS achieves higher accuracy, capture rates are wind-sensitive. The system is positioned as a high-precision compliance filter, not a high-volume census tool—targeting the worst offenders precisely.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                    </div>
                    <h5 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Bus Corridor Priority</h5>
                    <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6 }}>
                      Urban buses are the primary driver of roadside PM2.5. Integrating exhaust-pipe height and corridor geometry data optimizes sensor placement for maximum regulatory impact.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '32px 24px' }}>
        <div className="container">
          <p style={{ textAlign: 'center', fontSize: 14 }}>© 2024 AeroCheck PM. Designed for National Transport Authorities and Environmental Agencies.</p>
        </div>
      </footer>
    </div>
  );
}

function statusStyle(status: string): React.CSSProperties {
  if (status === 'super') return { background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, display: 'inline-block' };
  if (status === 'flag') return { background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, display: 'inline-block' };
  return { background: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, display: 'inline-block' };
}
