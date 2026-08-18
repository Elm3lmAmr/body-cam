import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useActiveStreams } from '../hooks/useActiveStreams';
import StreamViewer from '../components/StreamViewer';

export default function LiveStreamsPage() {
  const { token } = useAuth();
  const { streams, error } = useActiveStreams(token);
  const [guards, setGuards] = useState([]);
  const [layout, setLayout] = useState('grid-3x3'); // 'grid-3x3', 'grid-2x2', 'focus'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'offline'

  useEffect(() => {
    fetch('http://localhost:4000/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGuards(data.filter(u => (u.role || '').toLowerCase() === 'guard'));
        }
      })
      .catch(err => console.error(err));
  }, [token]);

  // Merge guards with active streams
  const mergedStreams = guards.map(guard => {
    const activeStream = (streams || []).find(s => s.employee_code === guard.employee_code);
    return {
      guard,
      stream: activeStream || null,
      isActive: !!activeStream
    };
  });

  const displayStreams = mergedStreams.filter(item => {
    if (activeFilter === 'active') return item.isActive;
    if (activeFilter === 'offline') return !item.isActive;
    return true;
  });

  return (
    <>
      <div className="streams-toolbar">
        <div className="toolbar-group">
          <button className={layout === 'grid-3x3' ? 'active' : ''} onClick={() => setLayout('grid-3x3')}>3x3 Grid</button>
          <button className={layout === 'grid-2x2' ? 'active' : ''} onClick={() => setLayout('grid-2x2')}>2x2 Grid</button>
          <button className={layout === 'focus' ? 'active' : ''} onClick={() => setLayout('focus')}>Focus View</button>
        </div>
        <div className="toolbar-group">
          <button className={activeFilter === 'all' ? 'active' : ''} onClick={() => setActiveFilter('all')}>All Cameras ({mergedStreams.length})</button>
          <button className={activeFilter === 'active' ? 'active' : ''} onClick={() => setActiveFilter('active')}>Active ({mergedStreams.filter(s => s.isActive).length})</button>
          <button className={activeFilter === 'offline' ? 'active' : ''} onClick={() => setActiveFilter('offline')}>Offline ({mergedStreams.filter(s => !s.isActive).length})</button>
        </div>
      </div>

      {error && <div style={{ color: 'var(--red)', marginBottom: '16px' }}>{error}</div>}

      <div className={`stream-grid ${layout}`}>
        {displayStreams.length === 0 && <div style={{ color: 'var(--text-dim)' }}>No cameras match filter.</div>}
        {displayStreams.map((item, idx) => (
          <div className="stream-tile" key={item.guard.employee_code || idx}>
            <div className="stream-video">
              {item.isActive ? (
                <StreamViewer stream={item.stream} embedded={true} />
              ) : (
                <>
                  <div className="stream-mock">Camera Offline</div>
                  <div className="stream-scan" style={{ opacity: 0.1, animationDuration: '8s' }}></div>
                  <div className="stream-overlay">
                    <div className="stream-top">
                      <span className="stream-tag offline">OFFLINE</span>
                      <span className="stream-tag">{item.guard.employee_code}</span>
                    </div>
                    <div className="stream-bot">
                      <span style={{ textTransform: 'capitalize' }}>{item.guard.role || 'Guard'}</span>
                      <span>--:--:--</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="stream-info">
              <div>
                <div className="who">{item.guard.full_name}</div>
                <div className="where" style={{ textTransform: 'capitalize' }}>{item.guard.role || 'Guard'} · {item.guard.mobile_number || 'No Mobile'}</div>
              </div>
              <span className={`badge ${item.isActive ? 'recording online' : 'offline'}`}>
                {item.isActive ? 'REC' : 'OFFLINE'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
