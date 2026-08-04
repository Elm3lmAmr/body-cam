import { useEffect, useState } from 'react';
import { Video, Play, RefreshCw, X, FileVideo, Clock, Calendar, Shield } from 'lucide-react';
import { fetchRecordings } from '../api/recordingApi';

export default function RecordingsView({ token }) {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [guardFilter, setGuardFilter] = useState('');

  const loadRecordings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecordings(token);
      setRecordings(data);
    } catch (err) {
      setError(err.message || 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();
  }, [token]);

  const filtered = recordings.filter((r) =>
    guardFilter.trim() === ''
      ? true
      : (r.employee_code || '').toLowerCase().includes(guardFilter.trim().toLowerCase())
  );

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const formatDuration = (sec) => {
    if (!sec || sec === 0) return 'N/A';
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const videoBaseUrl = `http://${window.location.hostname}:4000`;

  return (
    <div style={styles.container}>
      {/* Top Controls Bar */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Video size={20} color="#4BB8FA" />
          <h2 style={styles.title}>RECORDED SESSION ARCHIVE</h2>
          <span style={styles.badge}>{filtered.length}</span>
        </div>

        <div style={styles.headerRight}>
          <input
            type="text"
            placeholder="Filter by Guard (e.g. G001)..."
            value={guardFilter}
            onChange={(e) => setGuardFilter(e.target.value)}
            style={styles.searchInput}
          />
          <button
            onClick={loadRecordings}
            disabled={loading}
            style={styles.refreshBtn}
            title="Refresh list"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          ⚠ {error}
        </div>
      )}

      {/* Main Table Content */}
      <div style={styles.tableWrapper}>
        {loading && recordings.length === 0 ? (
          <div style={styles.empty}>Loading recorded sessions...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <FileVideo size={42} color="#2C5EAD" style={{ marginBottom: 12 }} />
            <p style={{ color: '#E8F4FD', fontWeight: 600 }}>No Recordings Found</p>
            <p style={{ color: '#7A9BB5', fontSize: 13, marginTop: 4 }}>
              Recorded body-cam videos will appear here once uploaded by field guards.
            </p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>GUARD CODE</th>
                <th style={styles.th}>FILE NAME</th>
                <th style={styles.th}>RECORDED AT</th>
                <th style={styles.th}>DURATION</th>
                <th style={styles.th}>SIZE</th>
                <th style={styles.th}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec) => (
                <tr key={rec.id} style={styles.trBody}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={16} color="#4BB8FA" />
                      <span style={{ fontWeight: 700, color: '#E8F4FD' }}>
                        {rec.employee_code}
                      </span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: '#7A9BB5', fontFamily: 'monospace', fontSize: 13 }}>
                      {rec.file_name}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="#7A9BB5" />
                      <span>{new Date(rec.recorded_at).toLocaleString('en-GB')}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color="#7A9BB5" />
                      <span>{formatDuration(rec.duration_seconds)}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{formatSize(rec.file_size)}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => setSelectedVideo(rec)}
                      style={styles.playBtn}
                    >
                      <Play size={14} />
                      Watch Video
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Video Playback Modal */}
      {selectedVideo && (
        <div style={styles.modalOverlay} onClick={() => setSelectedVideo(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalTitle}>
                  Playback: Guard {selectedVideo.employee_code}
                </span>
                <div style={styles.modalSub}>
                  {selectedVideo.file_name} • {new Date(selectedVideo.recorded_at).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                style={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>
            <div style={styles.videoContainer}>
              <video
                controls
                autoPlay
                style={styles.videoPlayer}
                src={`${videoBaseUrl}${selectedVideo.file_url}`}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    background: '#0D1B2A',
    color: '#E8F4FD',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    background: '#111D2E',
    borderBottom: '2px solid #2C5EAD',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#E8F4FD',
  },
  badge: {
    background: '#2C5EAD',
    color: '#4BB8FA',
    padding: '2px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    background: '#0D1B2A',
    border: '1px solid #2C5EAD',
    color: '#E8F4FD',
    borderRadius: 6,
    padding: '8px 14px',
    fontSize: 13,
    outline: 'none',
    width: 240,
  },
  refreshBtn: {
    background: '#1E4072',
    color: '#E8F4FD',
    border: '1px solid #4BB8FA',
    borderRadius: 6,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
  },
  errorBanner: {
    background: 'rgba(255, 59, 59, 0.15)',
    color: '#FF4E4E',
    padding: '10px 24px',
    fontSize: 13,
    borderBottom: '1px solid rgba(255, 59, 59, 0.3)',
  },
  tableWrapper: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHead: {
    background: '#15253A',
    borderBottom: '2px solid #2C5EAD',
  },
  th: {
    padding: '14px 16px',
    fontSize: 12,
    fontWeight: 700,
    color: '#4BB8FA',
    letterSpacing: '0.05em',
  },
  trBody: {
    borderBottom: '1px solid rgba(44, 94, 173, 0.3)',
    transition: 'background 0.2s',
  },
  td: {
    padding: '14px 16px',
    fontSize: 13,
    color: '#CBDFEF',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60%',
    textAlign: 'center',
    color: '#7A9BB5',
  },
  playBtn: {
    background: '#2C5EAD',
    color: '#E8F4FD',
    border: '1px solid #4BB8FA',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 24,
  },
  modalContent: {
    background: '#111D2E',
    border: '2px solid #2C5EAD',
    borderRadius: 12,
    width: '90%',
    maxWidth: 960,
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #2C5EAD',
    background: '#15253A',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#4BB8FA',
  },
  modalSub: {
    fontSize: 12,
    color: '#7A9BB5',
    marginTop: 4,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#E8F4FD',
    cursor: 'pointer',
    padding: 6,
  },
  videoContainer: {
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 480,
  },
  videoPlayer: {
    width: '100%',
    maxHeight: '75vh',
    outline: 'none',
  },
};
