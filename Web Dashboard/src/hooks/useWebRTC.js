import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC(employeeCode) {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | connecting | live | disconnected | error
  const [errorMsg, setErrorMsg] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(true);

  const cleanup = useCallback(() => {
    if (pcRef.current) { 
      if (pcRef.current.__localStream) {
        pcRef.current.__localStream.getTracks().forEach(t => t.stop());
      }
      pcRef.current.close(); 
      pcRef.current = null; 
    }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus('idle');
  }, []);

  useEffect(() => {
    if (!employeeCode) { cleanup(); return; }

    setStatus('connecting');
    setErrorMsg(null);

    const ws = new WebSocket(`ws://${window.location.hostname}:4000`);
    wsRef.current = ws;

    const pc = new RTCPeerConnection(ICE_CONFIG);
    pcRef.current = pc;

    // When we receive media tracks from guard
    pc.ontrack = (event) => {
      const stream = event.streams && event.streams.length > 0 ? event.streams[0] : new MediaStream([event.track]);
      
      if (videoRef.current) {
        if (videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream;
        } else {
          // Force DOM update if track was dynamically added to same stream
          videoRef.current.srcObject = null;
          videoRef.current.srcObject = stream;
        }
        
        videoRef.current.play().catch(e => {
          if (e.name !== 'AbortError') console.error("Play error:", e);
        });
        setStatus('live');
      }
    };

    // Send our ICE candidates to guard via signaling
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          },
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setStatus('disconnected');
      }
    };

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'watch', targetEmployeeCode: employeeCode }));
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'guard-ready') {
        // Guard is online and will send an offer soon
        setStatus('connecting');
      }

      if (msg.type === 'offer') {
        try {
          if (!pc.__localStream) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getAudioTracks().forEach(t => t.enabled = false);
            pc.__localStream = stream;
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
          }
        } catch (e) {
          console.warn('Could not access microphone:', e);
        }

        pc.__isSettingRemote = true;
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        pc.__isSettingRemote = false;
        
        // Process queued ICE candidates now that remote description is set
        if (pc.__iceQueue) {
          for (const c of pc.__iceQueue) {
            try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) { console.warn(e); }
          }
          pc.__iceQueue = [];
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'answer', sdp: answer }));
      }

      if (msg.type === 'ice-candidate' && msg.candidate) {
        if (!pc.remoteDescription || pc.__isSettingRemote) {
          pc.__iceQueue = pc.__iceQueue || [];
          pc.__iceQueue.push(msg.candidate);
        } else {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } catch (e) {
            console.warn('ICE candidate error:', e);
          }
        }
      }

      if (msg.type === 'guard-disconnected') {
        setStatus('disconnected');
        if (videoRef.current) videoRef.current.srcObject = null;
      }

      if (msg.type === 'location') {
        setGpsLocation({ lat: msg.lat, lng: msg.lng });
      }
    };

    ws.onerror = () => {
      setStatus('error');
      setErrorMsg('Cannot connect to signaling server');
    };

    ws.onclose = () => {
      if (status !== 'live') setStatus('disconnected');
    };

    return () => {
      cleanup();
    };
  }, [employeeCode]);

  const toggleMic = useCallback((mute) => {
    if (pcRef.current && pcRef.current.__localStream) {
      pcRef.current.__localStream.getAudioTracks().forEach(t => t.enabled = !mute);
      setIsMicMuted(mute);
    }
  }, []);

  return { videoRef, status, errorMsg, gpsLocation, isMicMuted, toggleMic };
}
