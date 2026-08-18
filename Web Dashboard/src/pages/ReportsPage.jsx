import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ReportsPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    total_incidents: 0,
    critical_incidents: 0,
    avg_response_min: 0,
    data_archived_mb: 0,
    incidents_by_day: []
  });

  useEffect(() => {
    fetch('http://localhost:4000/api/incidents/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setStats(data);
        }
      })
      .catch(err => console.error(err));
  }, [token]);

  // Transform data for charting (e.g. taking max to calculate bar heights)
  const maxCount = Math.max(...stats.incidents_by_day.map(d => d.count), 1);

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Total Incidents</div>
          <div className="kpi-value">{stats.total_incidents}</div>
          <div className="kpi-delta flat">Current</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Critical Priority</div>
          <div className="kpi-value">{stats.critical_incidents} <span className="unit">cases</span></div>
          <div className="kpi-delta down">Active</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Response</div>
          <div className="kpi-value">{stats.avg_response_min} <span className="unit">min</span></div>
          <div className="kpi-delta flat">Est. response</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Data Archived</div>
          <div className="kpi-value">{(stats.data_archived_mb / 1024).toFixed(2)} <span className="unit">GB</span></div>
          <div className="kpi-delta flat">Video Storage</div>
        </div>
      </div>

      <div className="chart-row">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Recent Incidents (Last 7 Days)</div>
          </div>
          <div className="bar-chart" style={{ padding: '0 20px' }}>
            {stats.incidents_by_day.length === 0 ? (
              <div style={{color: 'var(--text-dim)', textAlign: 'center', flex: 1, alignSelf: 'center'}}>No recent data</div>
            ) : (
              stats.incidents_by_day.map((d, i) => {
                const height = Math.max((d.count / maxCount) * 100, 5);
                const dt = new Date(d.date);
                return (
                  <div className="bar" style={{ height: `${height}%` }} key={i}>
                    <div className="bar-val">{d.count}</div>
                    <div className="bar-lbl">{dt.getDate()}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">By Priority (Simulation)</div>
          </div>
          <div className="donut">
            <svg viewBox="0 0 36 36" className="donut-svg">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--panel-2)" strokeWidth="4" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--text-dim)" strokeWidth="4" strokeDasharray="50, 100" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--blue)" strokeWidth="4" strokeDasharray="30, 100" strokeDashoffset="-50" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--amber)" strokeWidth="4" strokeDasharray="15, 100" strokeDashoffset="-80" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--red)" strokeWidth="4" strokeDasharray="5, 100" strokeDashoffset="-95" />
            </svg>
            <div className="donut-legend">
              <div className="critical">Critical (5%)</div>
              <div className="high">High (15%)</div>
              <div className="medium">Medium (30%)</div>
              <div className="low">Low (50%)</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
