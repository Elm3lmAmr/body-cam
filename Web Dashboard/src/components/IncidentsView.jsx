import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import RaiseIncidentModal from './RaiseIncidentModal';

export default function IncidentsView({ token }) {
  const { t } = useLanguage();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/incidents';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      } else {
        console.error('Failed to fetch incidents');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [startDate, endDate]);

  const filteredIncidents = incidents.filter(inc => 
    inc.incident_uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inc.description && inc.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2>{t('incidents')} / {t('reports')}</h2>
        <button className="btn-primary" style={redBtnStyle} onClick={() => setShowModal(true)}>
          {t('raise_red_flag')}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div className="edara-card" style={{ padding: '16px', flex: 1 }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Incidents</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{incidents.length}</p>
        </div>
      </div>

      <div style={filterStyle}>
        <div>
          <label style={labelStyle}>{t('start_date')}</label>
          <input type="datetime-local" className="edara-input" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>{t('end_date')}</label>
          <input type="datetime-local" className="edara-input" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Search</label>
          <input 
            type="text" 
            className="edara-input" 
            style={inputStyle} 
            placeholder="Search by ID or description..."
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        <button className="btn-primary" onClick={fetchIncidents}>{t('filter')}</button>
      </div>

      <div style={tableContainerStyle}>
        {loading ? (
          <p>Loading...</p>
        ) : incidents.length === 0 ? (
          <p>{t('no_incidents')}</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>{t('incident_uid')}</th>
                <th>{t('description')}</th>
                <th>{t('dispatch_to')}</th>
                <th>{t('created_at')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map(inc => (
                <tr key={inc.id} style={trStyle}>
                  <td>{inc.incident_uid}</td>
                  <td>{inc.description}</td>
                  <td>{inc.dispatch_to}</td>
                  <td>{new Date(inc.created_at).toLocaleString()}</td>
                  <td>
                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setSelectedIncident(inc)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <RaiseIncidentModal 
          token={token} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => { setShowModal(false); fetchIncidents(); }} 
        />
      )}

      {selectedIncident && (
        <IncidentDetailsModal 
          token={token}
          incidentId={selectedIncident.id}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}

import IncidentDetailsModal from './IncidentDetailsModal';

const containerStyle = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  color: 'var(--text-light)',
  overflowY: 'auto'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px'
};

const redBtnStyle = {
  background: 'var(--red-rec)',
  boxShadow: '0 0 10px rgba(255, 59, 59, 0.5)'
};

const filterStyle = {
  display: 'flex',
  gap: '16px',
  marginBottom: '24px',
  alignItems: 'flex-end',
  background: 'var(--bg-panel)',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)'
};

const labelStyle = {
  display: 'block',
  marginBottom: '4px',
  fontSize: '12px',
  color: 'var(--text-muted)'
};

const inputStyle = {
  width: 'auto'
};

const tableContainerStyle = {
  background: 'var(--bg-panel)',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  padding: '16px',
  flex: 1
};

const tableStyle = {
  width: '100%',
  textAlign: 'left',
  borderCollapse: 'collapse'
};

const trStyle = {
  borderBottom: '1px solid var(--border-color)'
};
