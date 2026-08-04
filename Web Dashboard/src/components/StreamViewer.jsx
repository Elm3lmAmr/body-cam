import { useEffect, useState } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

export default function StreamViewer({ stream }) {
  const employeeCode = stream?.employeeCode ?? null;
  const { videoRef, status, errorMsg, gpsLocation, isMicMuted, toggleMic } = useWebRTC(employeeCode);
  const [isMuted, setIsMuted] = useState(true);

  if (!stream) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0D1B2A', color: '#4BB8FA',
        gap: 16,
      }}>
        <div style={{ fontSize: 64, opacity: 0.3 }}>📷</div>
        <p style={{ fontSize: 18, opacity: 0.6 }}>Select a guard to view live feed</p>
        <p style={{ fontSize: 13, opacity: 0.4 }}>Active streams appear in the sidebar</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
      {/* Real video element — WebRTC stream plays here */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          display: status === 'live' ? 'block' : 'none',
        }}
      />

      {/* Status overlays when not live */}
      {status !== 'live' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0D1B2A',
          gap: 16,
        }}>
          {status === 'connecting' && (
            <>
              <div style={styles.spinner} />
              <p style={{ color: '#4BB8FA', fontSize: 18 }}>Connecting to {stream.employeeCode}...</p>
              <p style={{ color: '#666', fontSize: 13 }}>Waiting for WebRTC stream</p>
            </>
          )}
          {status === 'disconnected' && (
            <>
              <div style={{ fontSize: 64 }}>📵</div>
              <p style={{ color: '#FF6B6B', fontSize: 18 }}>Guard Disconnected</p>
              <p style={{ color: '#666', fontSize: 13 }}>Stream ended or device went offline</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div style={{ fontSize: 64 }}>⚠️</div>
              <p style={{ color: '#FF6B6B', fontSize: 18 }}>Connection Error</p>
              <p style={{ color: '#666', fontSize: 13 }}>{errorMsg}</p>
            </>
          )}
        </div>
      )}

      {/* HUD overlay — always on top when live */}
      {status === 'live' && (
        <>
          {/* Top bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
          }}>
            <RecBadge />
            <span style={{
              color: 'white', fontSize: 13, fontFamily: 'monospace',
              background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 6,
            }}>
              DEV: {stream.device_serial}
            </span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => toggleMic(!isMicMuted)}
                title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                style={{
                  background: isMicMuted ? 'rgba(255,0,0,0.6)' : 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
                  padding: '6px', borderRadius: '50%', cursor: 'pointer',
                }}
              >
                {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? "Unmute Guard's Audio" : "Mute Guard's Audio"}
                style={{
                  background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
                  padding: '6px', borderRadius: '50%', cursor: 'pointer',
                }}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
          </div>

          {/* Corner brackets centred on frame */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}>
            <CornerBrackets />
          </div>

          {/* GPS Minimap bottom left */}
          <div style={{
            position: 'absolute', bottom: 16, left: 16,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {gpsLocation && (
              <div style={{
                width: 180, height: 180, borderRadius: 12, overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.2)'
              }}>
                <MapContainer
                  key={`${gpsLocation.lat}-${gpsLocation.lng}`}
                  center={[gpsLocation.lat, gpsLocation.lng]}
                  zoom={15}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[gpsLocation.lat, gpsLocation.lng]} />
                </MapContainer>
              </div>
            )}
            <div style={{
              background: 'rgba(0,0,0,0.6)',
              padding: '6px 12px', borderRadius: 8,
              fontFamily: 'monospace', fontSize: 12,
              color: '#00FF41', lineHeight: 1.6,
            }}>
              <div>GUARD: {stream.employeeCode}</div>
              {gpsLocation ? (
                <>
                  <div>LAT: {gpsLocation.lat.toFixed(7)}</div>
                  <div>LON: {gpsLocation.lng.toFixed(7)}</div>
                </>
              ) : (
                <>
                  <div>LAT: {stream.gps?.latitude?.toFixed(7) ?? '0.0000000'}</div>
                  <div>LON: {stream.gps?.longitude?.toFixed(7) ?? '0.0000000'}</div>
                </>
              )}
            </div>
          </div>

          {/* Timestamp bottom right */}
          <LiveClock />
        </>
      )}
    </div>
  );
}

function RecBadge() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setVisible(v => !v), 600);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'rgba(255,0,0,0.85)',
      padding: '4px 12px', borderRadius: 6,
      opacity: visible ? 1 : 0.2,
      transition: 'opacity 0.3s',
    }}>
      <span style={{ color: 'white', fontSize: 10 }}>●</span>
      <span style={{ color: 'white', fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>REC</span>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date().toUTCString().slice(17, 25));
  useEffect(() => {
    const id = setInterval(() =>
      setTime(new Date().toUTCString().slice(17, 25)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      position: 'absolute', bottom: 16, right: 16,
      background: 'rgba(0,0,0,0.6)',
      padding: '6px 12px', borderRadius: 8,
      fontFamily: 'monospace', fontSize: 13,
      color: 'white',
    }}>
      UTC {time}
    </div>
  );
}

function CornerBrackets() {
  const b = '#4BB8FA';
  const s = { position: 'absolute', width: 40, height: 40, border: `3px solid ${b}` };
  return (
    <div style={{ position: 'relative', width: 120, height: 80 }}>
      <div style={{ ...s, top: 0, left: 0, borderRight: 'none', borderBottom: 'none' }} />
      <div style={{ ...s, top: 0, right: 0, borderLeft: 'none', borderBottom: 'none' }} />
      <div style={{ ...s, bottom: 0, left: 0, borderRight: 'none', borderTop: 'none' }} />
      <div style={{ ...s, bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none' }} />
    </div>
  );
}

const styles = {
  spinner: {
    width: 48, height: 48,
    border: '4px solid #1a2a3a',
    borderTop: '4px solid #4BB8FA',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};
