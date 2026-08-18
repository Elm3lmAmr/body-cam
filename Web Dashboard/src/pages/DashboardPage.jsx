import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useActiveStreams } from '../hooks/useActiveStreams';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leafet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function DashboardPage() {
  const { token } = useAuth();
  const { streams } = useActiveStreams(token);
  const [incidents, setIncidents] = useState([]);
  const [events, setEvents] = useState([]);
  const [kpis, setKpis] = useState({ activeGuards: 0, activeIncidents: 0, responseTime: '0m', streams: 0 });

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        const [incRes, evtRes] = await Promise.all([
          fetch('http://localhost:4000/api/incidents', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:4000/api/events', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (incRes.ok) {
          const data = await incRes.json();
          if (Array.isArray(data)) {
            setIncidents(data);
            setKpis(k => ({ ...k, activeIncidents: data.filter(i => i.status !== 'closed').length }));
          } else {
            console.error("Expected array of incidents, got:", data);
            setIncidents([]);
          }
        }
        
        if (evtRes.ok) {
          const data = await evtRes.json();
          if (Array.isArray(data)) {
            setEvents(data);
          } else {
            console.error("Expected array of events, got:", data);
            setEvents([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Sync kpi streams count
  useEffect(() => {
    setKpis(k => ({ ...k, streams: streams.length, activeGuards: streams.length }));
  }, [streams]);

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Guards on Shift</div>
          <div className="kpi-value">{kpis.activeGuards} <span className="unit">active</span></div>
          <div className="kpi-delta up">▲ 2 from yesterday</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Active Incidents <span className="feed-dot red"></span></div>
          <div className="kpi-value">{kpis.activeIncidents} <span className="unit">open</span></div>
          <div className="kpi-delta up">▲ 1 from last hour</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Response</div>
          <div className="kpi-value">{kpis.responseTime}</div>
          <div className="kpi-delta flat">▶ No change</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Streams Live <span className="feed-dot green"></span></div>
          <div className="kpi-value">{kpis.streams} <span className="unit">fps</span></div>
          <div className="kpi-delta flat">▶ Stable</div>
        </div>
      </div>

      <div className="row">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Zone Map <span className="sub">Real-time</span></div>
            <div className="card-action">Expand map</div>
          </div>
          <div className="map-wrap" style={{ height: '320px' }}>
            <MapContainer center={[30.0444, 31.2357]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {streams.map(s => {
                const lat = s.gps?.latitude || 30.0444;
                const lng = s.gps?.longitude || 31.2357;
                return (
                  <Marker key={s.device_serial} position={[lat, lng]} icon={greenIcon}>
                    <Popup>{s.employeeCode}</Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Live Event Feed</div>
            <div className="card-action">View all</div>
          </div>
          <div className="feed card-body" style={{ padding: 0 }}>
            {events.length === 0 ? <div style={{ padding: '20px', color: 'var(--text-muted)' }}>No recent events.</div> : null}
            {events.map((evt) => (
              <div className="feed-item" key={evt.id}>
                <div className={`feed-dot ${evt.type === 'critical' ? 'red' : 'blue'}`}></div>
                <div className="feed-body">
                  <div className="feed-msg">[{evt.source}] {evt.message}</div>
                  <div className="feed-meta">{new Date(evt.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Active Incidents</div>
          <div className="card-action">Export CSV</div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Guard</th>
              <th>Location</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {incidents.filter(i => i.status !== 'closed').length === 0 ? (
               <tr><td colSpan="5" style={{ textAlign: 'center' }}>No active incidents</td></tr>
            ) : incidents.filter(i => i.status !== 'closed').map(inc => (
              <tr key={inc.id}>
                <td className="mono">{inc.id}</td>
                <td><span className="badge critical">{inc.status}</span></td>
                <td>{inc.device_serial || 'Unknown'}</td>
                <td className="mono">Location data pending</td>
                <td className="mono">{new Date(inc.created_at).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
