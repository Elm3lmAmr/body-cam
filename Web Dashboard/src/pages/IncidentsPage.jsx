import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function IncidentsPage() {
  const { token, user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/incidents', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setIncidents(data);
          if (data.length > 0) setSelectedIncident(data[0]);
        } else {
          console.error("Expected array of incidents, got:", data);
          setIncidents([]);
        }
      })
      .catch(err => console.error("Failed to fetch incidents", err));
  }, [token]);

  return (
    <>
      <div className="incident-layout">
        <div>
          <div className="card" style={{ marginBottom: '12px' }}>
            <div className="card-head">
              <div className="card-title">Case #{selectedIncident?.id || '----'} <span className="badge critical">OPEN</span></div>
              <div className="card-action">Export Evidence</div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="stream-video" style={{ borderBottom: '1px solid var(--border)' }}>
                {selectedIncident ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', background: '#000', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    [Video Playback for Incident #{selectedIncident.id}]
                    <br/><br/>
                    (Feature pending backend recording linkage)
                  </div>
                ) : (
                  <div className="stream-mock" style={{ flexDirection: 'column' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>▶</div>
                    <div>SELECT AN INCIDENT</div>
                  </div>
                )}
              </div>
              
              <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                {['it_admin', 'manager'].includes(user?.role) && (
                  <button className="btn-primary" style={{ flex: 1 }}>Dispatch Backup</button>
                )}
                <button className="btn-primary" style={{ flex: 1, background: 'var(--panel-2)', color: 'var(--text)' }}>Notify Manager</button>
                {['it_admin', 'manager'].includes(user?.role) && (
                  <button className="btn-primary" style={{ flex: 1, background: 'var(--panel-2)', color: 'var(--red)' }}>Close Case</button>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">All Incidents</div>
              <div className="card-action">Filter</div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Case #</th>
                  <th>Priority</th>
                  <th>Guard ID</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(inc => (
                  <tr key={inc.id} onClick={() => setSelectedIncident(inc)} style={{ cursor: 'pointer', background: selectedIncident?.id === inc.id ? 'var(--panel-2)' : 'transparent' }}>
                    <td className="mono">{inc.id}</td>
                    <td><span className={`badge ${inc.status === 'closed' ? 'closed' : 'critical'}`}>{inc.status.toUpperCase()}</span></td>
                    <td className="mono">{inc.device_serial || 'UNK'}</td>
                    <td className="mono">{new Date(inc.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-head">
            <div className="card-title">Incident Timeline</div>
          </div>
          <div className="timeline">
            {selectedIncident ? (
              <>
                <div className="tl-item">
                  <div className="tl-dot critical"></div>
                  <div className="tl-body">
                    <div className="tl-msg">SOS Triggered by {selectedIncident.device_serial}</div>
                    <div className="tl-time">{new Date(selectedIncident.created_at).toLocaleTimeString()}</div>
                  </div>
                </div>
                <div className="tl-item">
                  <div className="tl-dot action"></div>
                  <div className="tl-body">
                    <div className="tl-msg">Auto-dispatch to Head of Security</div>
                    <div className="tl-time">{new Date(new Date(selectedIncident.created_at).getTime() + 1000).toLocaleTimeString()}</div>
                  </div>
                </div>
                <div className="tl-item">
                  <div className="tl-dot info"></div>
                  <div className="tl-body">
                    <div className="tl-msg">Recording bookmarked</div>
                    <div className="tl-time">{new Date(new Date(selectedIncident.created_at).getTime() + 5000).toLocaleTimeString()}</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Select an incident to view its timeline.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
