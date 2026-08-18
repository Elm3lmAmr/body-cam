import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function GuardsPage() {
  const { token, user } = useAuth();
  const [guards, setGuards] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:4000/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formattedGuards = data
            .filter(u => u.role.toLowerCase() === 'guard')
            .map(u => ({
              id: u.employee_code,
              name: u.full_name,
              shift: 'Unknown', // Pending backend shift management
              battery: 100, // Pending battery telemetry
              status: 'Offline', // Pending presence tracking
              zone: 'Unknown' // Pending zone tracking
            }));
          setGuards(formattedGuards);
        } else {
          console.error("Expected array of users, got:", data);
          setGuards([]);
        }
      })
      .catch(err => console.error(err));
  }, [token]);

  return (
    <>
      <div className="search-bar">
        <input type="text" placeholder="Search guards by ID, name, or zone..." />
        <select style={{ width: '150px' }}>
          <option>All Shifts</option>
          <option>Morning</option>
          <option>Evening</option>
          <option>Night</option>
        </select>
        <select style={{ width: '150px' }}>
          <option>All Status</option>
          <option>Active</option>
          <option>Alert</option>
          <option>Offline</option>
        </select>
      </div>

      <div className="guard-grid">
        {guards.map(g => (
          <div className="guard-card" key={g.id}>
            <div className="guard-head">
              <div className="guard-avatar">{g.name.split(' ').map(n=>n[0]).join('')}</div>
              <div className="guard-meta">
                <div className="guard-name">{g.name}</div>
                <div className="guard-id">{g.id}</div>
              </div>
              <div className={`badge ${g.status === 'Alert' ? 'critical' : g.status === 'Active' || g.status === 'Patrol' ? 'online' : 'offline'}`}>
                {g.status.toUpperCase()}
              </div>
            </div>
            
            <div className="guard-stats">
              <div>Shift <b>{g.shift}</b></div>
              <div>Battery <b style={{ color: g.battery < 20 ? 'var(--red)' : 'inherit' }}>{g.battery}%</b></div>
              <div>Zone <b>{g.zone}</b></div>
              <div>Checkpoints <b>{g.status === 'Patrol' ? '12/14' : '--'}</b></div>
            </div>
            
            <div className="guard-actions">
              <button className="btn-sm primary">Direct Message</button>
              <button className="btn-sm">View Stream</button>
              {['it_admin', 'manager', 'supervisor'].includes(user?.role) && (
                <button className="btn-sm">Dispatch</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
