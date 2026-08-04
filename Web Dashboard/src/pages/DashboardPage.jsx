import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useActiveStreams } from '../hooks/useActiveStreams';
import StatusBar from '../components/StatusBar';
import Sidebar from '../components/Sidebar';
import StreamViewer from '../components/StreamViewer';
import RecordingsView from '../components/RecordingsView';

export default function DashboardPage() {
  const { token, user, logout } = useAuth();
  const { streams, lastUpdate, error } = useActiveStreams(token);
  const [selectedStream, setSelectedStream] = useState(null);
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <StatusBar
        user={user}
        streamCount={streams.length}
        lastUpdate={lastUpdate}
        onLogout={logout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* API error banner */}
      {error && activeTab === 'live' && (
        <div style={bannerStyle}>
          ⚠ Stream API error: {error}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {activeTab === 'live' ? (
          <>
            <Sidebar
              streams={streams}
              selectedStream={selectedStream}
              onSelectStream={setSelectedStream}
            />
            <main style={{ flex: 1, background: '#0D1B2A', position: 'relative', overflow: 'hidden' }}>
              <StreamViewer stream={selectedStream} />
            </main>
          </>
        ) : (
          <main style={{ flex: 1, background: '#0D1B2A', position: 'relative', overflow: 'hidden' }}>
            <RecordingsView token={token} />
          </main>
        )}
      </div>
    </div>
  );
}

const bannerStyle = {
  background: 'rgba(255,59,59,0.12)',
  borderBottom: '1px solid rgba(255,59,59,0.4)',
  color: '#FF3B3B',
  fontSize: 12,
  padding: '6px 20px',
  letterSpacing: '0.03em',
};
