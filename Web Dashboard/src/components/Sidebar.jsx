import { Users, WifiOff } from 'lucide-react';
import StreamCard from './StreamCard';

/**
 * Left sidebar listing all active guard streams.
 * Props: { streams, selectedStream, onSelectStream }
 */
export default function Sidebar({ streams, selectedStream, onSelectStream }) {
  return (
    <aside style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Users size={16} color="#4BB8FA" />
          <span style={styles.title}>Active Guards</span>
        </div>
        <span style={styles.countBadge}>{streams.length}</span>
      </div>

      <div style={styles.divider} />

      {/* Stream list */}
      <div style={styles.list}>
        {streams.length === 0 ? (
          <EmptyState />
        ) : (
          streams.map((stream) => (
            <StreamCard
              key={stream.stream_id ?? stream.employeeCode}
              stream={stream}
              isSelected={
                selectedStream?.stream_id === stream.stream_id ||
                selectedStream?.employeeCode === stream.employeeCode
              }
              onClick={() => onSelectStream(stream)}
            />
          ))
        )}
      </div>

      {/* Footer hint */}
      <div style={styles.sidebarFooter}>
        <span style={styles.footerText}>Auto-refreshes every 4s</span>
      </div>
    </aside>
  );
}

function EmptyState() {
  return (
    <div style={styles.empty}>
      <WifiOff size={36} color="#2C5EAD" strokeWidth={1.4} />
      <p style={styles.emptyTitle}>No Active Streams</p>
      <p style={styles.emptySubtitle}>
        Guards will appear here once they<br />activate their body cameras.
      </p>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 320,
    flexShrink: 0,
    background: '#111D2E',
    borderRight: '2px solid #2C5EAD',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: '#E8F4FD',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  countBadge: {
    background: '#2C5EAD',
    color: '#4BB8FA',
    borderRadius: 20,
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 700,
    border: '1px solid #4BB8FA',
    minWidth: 28,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, #2C5EAD 30%, #2C5EAD 70%, transparent)',
    flexShrink: 0,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '48px 24px',
    gap: 12,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#7A9BB5',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#3d5a73',
    lineHeight: 1.6,
  },
  sidebarFooter: {
    padding: '8px 16px',
    borderTop: '1px solid #1a2a3a',
    flexShrink: 0,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#3d5a73',
    letterSpacing: '0.04em',
  },
};
