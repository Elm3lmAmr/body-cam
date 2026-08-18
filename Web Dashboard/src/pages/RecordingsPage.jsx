import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RecordingsPage() {
  const { token } = useAuth();
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/recordings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.recordings) {
          // Map backend fields to frontend fields
          const formattedRecordings = data.recordings.map(r => {
            const h = Math.floor(r.duration_seconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((r.duration_seconds % 3600) / 60).toString().padStart(2, '0');
            const s = (r.duration_seconds % 60).toString().padStart(2, '0');
            
            return {
              id: 'REC-' + r.id.toString().padStart(4, '0'),
              duration: `${h}:${m}:${s}`,
              guard: r.employee_code,
              date: new Date(r.recorded_at).toLocaleString('en-GB'),
              bookmarked: r.duration_seconds < 120, // mock bookmark logic for now
              file_url: r.file_url
            };
          });
          setRecordings(formattedRecordings);
        }
      })
      .catch(err => console.error("Failed to fetch recordings", err));
  }, [token]);

  return (
    <>
      <div className="search-bar">
        <input type="text" placeholder="Search recordings by ID, Guard, or Date..." />
        <select style={{ width: '150px' }}>
          <option>All Types</option>
          <option>Bookmarked (SOS)</option>
          <option>Continuous</option>
        </select>
        <button className="btn-primary" style={{ width: 'auto', marginTop: 0 }}>Search</button>
      </div>

      <div style={{ background: 'var(--blue-dim)', color: 'var(--blue)', padding: '10px 16px', borderRadius: '6px', fontSize: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12a5 5 0 110-10 5 5 0 010 10zm-1-7h2v4H7V6zm0-2h2v1H7V4z"/></svg>
        EVIDENCE LIBRARY: All recordings are WORM protected and SHA-256 hashed on ingest.
      </div>

      <div className="rec-grid">
        {recordings.map(rec => (
          <div className="rec-card" key={rec.id} onClick={() => window.open(`http://localhost:4000${rec.file_url}`, '_blank')} style={{ cursor: 'pointer' }}>
            <div className="rec-thumb" style={{ background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 16 16" fill="var(--blue)"><path d="M4 3l9 5-9 5V3z"/></svg>
              <div className="rec-dur">{rec.duration}</div>
              {rec.bookmarked && <div className="rec-bookmark">BOOKMARKED</div>}
            </div>
            <div className="rec-info">
              <div className="rec-title">{rec.id} — {rec.guard}</div>
              <div className="rec-meta">{rec.date}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
