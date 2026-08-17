import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function IncidentDetailsModal({ token, incidentId, onClose }) {
  const { t } = useLanguage();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newLog, setNewLog] = useState('');

  const fetchDetails = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:4000/api/incidents/${incidentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIncident(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [incidentId]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLog) return;
    try {
      await fetch(`http://${window.location.hostname}:4000/api/incidents/${incidentId}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: newLog })
      });
      setNewLog('');
      fetchDetails();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return null;
  if (!incident) return null;

  return (
    <div style={overlayStyle}>
      <div className="edara-card" style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: 'var(--accent)' }}>Incident: {incident.incident_uid}</h2>
          <button className="btn-primary" style={{ background: 'transparent', padding: '4px 8px' }} onClick={onClose}>X</button>
        </div>

        <div style={{ marginBottom: '16px', background: 'var(--bg-dark)', padding: '12px', borderRadius: '8px' }}>
          <p><strong>Status:</strong> {incident.status}</p>
          <p><strong>Description:</strong> {incident.description}</p>
          <p><strong>Start Time:</strong> {incident.start_time ? new Date(incident.start_time).toLocaleString() : 'N/A'}</p>
          <p><strong>End Time:</strong> {incident.end_time ? new Date(incident.end_time).toLocaleString() : 'N/A'}</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>Attachments</h3>
          {incident.attachments && incident.attachments.length > 0 ? (
            <ul>
              {incident.attachments.map(att => (
                <li key={att.id}>
                  <a href={`http://${window.location.hostname}:4000/uploads/${att.file_path}`} target="_blank" rel="noopener noreferrer">
                    {att.file_name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No attachments found.</p>
          )}
        </div>

        <div>
          <h3 style={{ color: 'var(--text-muted)' }}>History Log</h3>
          <div style={{ maxHeight: '150px', overflowY: 'auto', background: 'var(--bg-dark)', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
            {incident.logs && incident.logs.length > 0 ? (
              incident.logs.map(log => (
                <div key={log.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</span>
                  <p style={{ fontSize: '12px', margin: 0 }}>{log.action}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No logs found.</p>
            )}
          </div>
          <form onSubmit={handleAddLog} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="edara-input" 
              placeholder="Add a log entry..." 
              value={newLog} 
              onChange={e => setNewLog(e.target.value)} 
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Add</button>
          </form>
        </div>

      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalStyle = {
  width: '100%',
  maxWidth: '600px',
  padding: '24px',
  border: '1px solid var(--primary)'
};
