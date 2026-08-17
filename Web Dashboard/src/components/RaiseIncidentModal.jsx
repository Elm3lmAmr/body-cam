import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function RaiseIncidentModal({ token, onClose, onSuccess }) {
  const { t } = useLanguage();
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tempUid, setTempUid] = useState('');

  useEffect(() => {
    // Generate a temporary UID just for visual feedback
    setTempUid('INC-' + Math.floor(10000 + Math.random() * 90000));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('description', description);
      if (startTime) formData.append('start_time', startTime);
      if (endTime) formData.append('end_time', endTime);
      
      const response = await fetch(`http://${window.location.hostname}:4000/api/incidents/raise`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (response.ok) {
        const result = await response.json();
        
        // Handle attachment upload if one was selected
        if (attachment) {
          const fileData = new FormData();
          fileData.append('attachment', attachment);
          await fetch(`http://${window.location.hostname}:4000/api/incidents/${result.incident.id}/attachments`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fileData
          });
        }

        alert(t('incident_raised_success'));
        onSuccess();
      } else {
        alert('Failed to raise incident');
      }
    } catch (error) {
      console.error(error);
      alert('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div className="edara-card" style={modalStyle}>
        <h2 style={{ color: 'var(--red-rec)', marginBottom: '16px' }}>{t('raise_incident')}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={labelStyle}>{t('incident_uid')}</label>
            <input type="text" className="edara-input" value={tempUid} disabled style={{ opacity: 0.7 }} />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t('start_date') || 'Start Time'}</label>
              <input type="datetime-local" className="edara-input" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t('end_date') || 'End Time'}</label>
              <input type="datetime-local" className="edara-input" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t('description')}</label>
            <textarea 
              className="edara-input" 
              rows="4" 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Attachment (Import)</label>
            <input type="file" className="edara-input" onChange={e => setAttachment(e.target.files[0])} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }} onClick={onClose} disabled={loading}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--red-rec)', boxShadow: '0 0 10px rgba(255, 59, 59, 0.5)' }} disabled={loading}>
              {loading ? '...' : t('submit')}
            </button>
          </div>
        </form>
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
  maxWidth: '500px',
  padding: '24px',
  border: '2px solid var(--red-rec)',
  boxShadow: '0 0 20px rgba(255, 59, 59, 0.3)'
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  color: 'var(--text-muted)'
};
