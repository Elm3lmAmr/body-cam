import { useEffect, useState } from 'react';
import { LogOut, Radio, Video } from 'lucide-react';

/**
 * Top status bar — fixed height 56px.
 * Props: { user, streamCount, lastUpdate, onLogout, activeTab, onTabChange }
 */
export default function StatusBar({ user, streamCount, lastUpdate, onLogout, activeTab = 'live', onTabChange }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');
  const clockStr = `${hh}:${mm}:${ss}`;

  const dateStr = time.toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <header style={styles.bar}>
      {/* ---- Left: Branding ---- */}
      <div style={styles.left}>
        <img
          src="/edara_logo.png"
          alt="Edara"
          style={styles.logo}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div style={styles.brandText}>
          <span style={styles.brandName}>EDARA</span>
          <span style={styles.brandSub}>Command Center</span>
        </div>
      </div>

      {/* ---- Center: Navigation Tabs ---- */}
      <div style={styles.center}>
        <button
          onClick={() => onTabChange && onTabChange('live')}
          style={{
            ...styles.tabBtn,
            background: activeTab === 'live' ? '#1E4072' : 'transparent',
            borderColor: activeTab === 'live' ? '#4BB8FA' : 'transparent',
          }}
        >
          <span className="live-dot" />
          <Radio size={14} color="#00FF41" style={{ marginLeft: 6 }} />
          <span style={styles.liveLabel}>LIVE FEEDS</span>
          <span style={styles.streamBadge}>{streamCount}</span>
        </button>

        <button
          onClick={() => onTabChange && onTabChange('recordings')}
          style={{
            ...styles.tabBtn,
            background: activeTab === 'recordings' ? '#1E4072' : 'transparent',
            borderColor: activeTab === 'recordings' ? '#4BB8FA' : 'transparent',
          }}
        >
          <Video size={15} color="#4BB8FA" />
          <span style={{ fontWeight: 700, color: '#E8F4FD', fontSize: 13, letterSpacing: '0.06em' }}>
            RECORDED SESSIONS
          </span>
        </button>
      </div>

      {/* ---- Right: User + Clock + Logout ---- */}
      <div style={styles.right}>
        <div style={styles.userInfo}>
          <span style={styles.userName}>
            {user?.fullName ?? user?.employeeCode ?? 'Supervisor'}
          </span>
          <span style={styles.userRole}>SUPERVISOR</span>
        </div>
        <div style={styles.clockBlock}>
          <span style={styles.clockTime}>{clockStr}</span>
          <span style={styles.clockDate}>{dateStr}</span>
        </div>
        <button style={styles.logoutBtn} onClick={onLogout} title="Sign out" aria-label="Sign out">
          <LogOut size={18} color="#7A9BB5" />
        </button>
      </div>
    </header>
  );
}

const styles = {
  bar: {
    height: 56,
    background: '#111D2E',
    borderBottom: '1px solid #2C5EAD',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    flexShrink: 0,
    boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 200,
  },
  logo: {
    height: 32,
    objectFit: 'contain',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  brandName: {
    fontSize: 15,
    fontWeight: 800,
    color: '#4BB8FA',
    letterSpacing: '0.12em',
  },
  brandSub: {
    fontSize: 10,
    color: '#7A9BB5',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid transparent',
    borderRadius: 8,
    padding: '6px 14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  liveLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: '#00FF41',
    letterSpacing: '0.1em',
    marginLeft: 4,
  },
  streamBadge: {
    background: '#2C5EAD',
    color: '#4BB8FA',
    borderRadius: 20,
    padding: '1px 10px',
    fontSize: 13,
    fontWeight: 700,
    marginLeft: 8,
    border: '1px solid #4BB8FA',
  },
  streamLabel: {
    fontSize: 12,
    color: '#7A9BB5',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    minWidth: 200,
    justifyContent: 'flex-end',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    lineHeight: 1.3,
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#E8F4FD',
  },
  userRole: {
    fontSize: 10,
    color: '#1591DC',
    letterSpacing: '0.08em',
    fontWeight: 600,
  },
  clockBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    borderLeft: '1px solid #2C5EAD',
    paddingLeft: 16,
    lineHeight: 1.3,
  },
  clockTime: {
    fontSize: 16,
    fontWeight: 700,
    color: '#4BB8FA',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '0.06em',
  },
  clockDate: {
    fontSize: 10,
    color: '#7A9BB5',
  },
  logoutBtn: {
    background: 'rgba(44,94,173,0.15)',
    border: '1px solid #2C5EAD',
    borderRadius: 8,
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s, border-color 0.2s',
  },
};
