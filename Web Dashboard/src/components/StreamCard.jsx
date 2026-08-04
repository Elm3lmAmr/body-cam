import { useMemo } from 'react';
import { Camera, MapPin } from 'lucide-react';

/**
 * Card for a single active guard stream in the sidebar.
 * Props: { stream, isSelected, onClick }
 */
export default function StreamCard({ stream, isSelected, onClick }) {
  const { employeeCode, device_serial, gps, startedAt } = stream;

  // Human-readable name (fallback to code)
  const displayName = useMemo(() => {
    const nameMap = {
      G001: 'Ahmed',
      G002: 'Mostafa',
      G003: 'AbdelAleem',
      G004: 'Saad',
      G11790: 'Mohamed Howedy',
    };
    return nameMap[employeeCode] ?? employeeCode;
  }, [employeeCode]);

  // Relative duration "Active for Xm Ys"
  const activeDuration = useMemo(() => {
    if (!startedAt) return '—';
    const diffMs = Date.now() - new Date(startedAt).getTime();
    const totalSec = Math.max(0, Math.floor(diffMs / 1000));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }, [startedAt]);

  const lat = gps?.latitude?.toFixed(7) ?? '—';
  const lon = gps?.longitude?.toFixed(7) ?? '—';

  const cardStyle = {
    ...styles.card,
    border: isSelected ? '1px solid #4BB8FA' : '1px solid #2C5EAD',
    boxShadow: isSelected
      ? '0 0 12px rgba(75,184,250,0.4), inset 0 0 12px rgba(75,184,250,0.04)'
      : '0 2px 8px rgba(0,0,0,0.3)',
    transform: isSelected ? 'translateX(2px)' : 'translateX(0)',
  };

  return (
    <div style={cardStyle} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Row 1: Guard name + LIVE badge */}
      <div style={styles.row1}>
        <span style={styles.guardName}>{displayName}</span>
        <span style={styles.liveBadge}>
          <span className="live-dot" style={{ width: 6, height: 6 }} />
          LIVE
        </span>
      </div>

      {/* Row 1b: Employee code */}
      <div style={styles.empCode}>{employeeCode}</div>

      {/* Row 2: Device serial */}
      <div style={styles.infoRow}>
        <Camera size={12} color="#4BB8FA" />
        <span style={styles.infoText}>{device_serial ?? '—'}</span>
      </div>

      {/* Row 3: GPS */}
      <div style={styles.infoRow}>
        <MapPin size={12} color="#1591DC" />
        <span style={{ ...styles.infoText, fontFamily: 'monospace', fontSize: 11 }}>
          {lat} &nbsp; {lon}
        </span>
      </div>

      {/* Row 4: Duration */}
      <div style={styles.durationRow}>
        <span style={styles.durationDot}>▶</span>
        <span style={styles.durationText}>Active for {activeDuration}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#1a2a3a',
    borderRadius: 10,
    padding: '12px 14px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
    animation: 'slide-in-left 0.25s ease',
  },
  row1: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  guardName: {
    fontSize: 15,
    fontWeight: 700,
    color: '#E8F4FD',
  },
  liveBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: 'rgba(0,255,65,0.1)',
    border: '1px solid rgba(0,255,65,0.4)',
    borderRadius: 20,
    padding: '2px 8px',
    fontSize: 10,
    fontWeight: 700,
    color: '#00FF41',
    letterSpacing: '0.08em',
  },
  empCode: {
    fontSize: 11,
    color: '#7A9BB5',
    marginBottom: 8,
    letterSpacing: '0.04em',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 12,
    color: '#7A9BB5',
  },
  durationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    borderTop: '1px solid rgba(44,94,173,0.3)',
    paddingTop: 6,
  },
  durationDot: {
    fontSize: 8,
    color: '#1591DC',
  },
  durationText: {
    fontSize: 11,
    color: '#1591DC',
    fontWeight: 600,
    fontFamily: 'monospace',
  },
};
