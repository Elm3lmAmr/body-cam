/**
 * signalingServer.js
 * WebRTC Signaling Server — relays SDP offers/answers and ICE candidates
 * between guard mobile devices and supervisor dashboard viewers.
 * Shares HTTP port 4000 via WebSocket upgrade.
 */

const WebSocket = require('ws');

// rooms: Map<employeeCode, { guard: WebSocket|null, viewers: Set<WebSocket> }>
const rooms = new Map();

function setupSignaling(server) {
  const wss = new WebSocket.Server({ server });

  console.log('WebRTC Signaling Server attached to port 4000');

  wss.on('connection', (ws) => {
    let role = null;         // 'guard' | 'viewer'
    let employeeCode = null; // guard's own code
    let targetCode = null;   // viewer's target guard code

    function send(socket, data) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
      }
    }

    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      switch (msg.type) {

        // ── Guard announces presence ─────────────────────────────────────
        case 'join':
          role = 'guard';
          employeeCode = msg.employeeCode;
          if (!rooms.has(employeeCode)) {
            rooms.set(employeeCode, { guard: null, viewers: new Set() });
          }
          rooms.get(employeeCode).guard = ws;
          console.log(`[Signaling] Guard ${employeeCode} joined`);
          // Notify any viewers already waiting
          rooms.get(employeeCode).viewers.forEach(v => {
            send(v, { type: 'guard-ready', employeeCode });
            // Also tell the guard to create an offer for this viewer
            send(ws, { type: 'viewer-ready' });
          });
          break;

        // ── Supervisor requests to watch a guard ─────────────────────────
        case 'watch':
          role = 'viewer';
          targetCode = msg.targetEmployeeCode;
          if (!rooms.has(targetCode)) {
            rooms.set(targetCode, { guard: null, viewers: new Set() });
          }
          rooms.get(targetCode).viewers.add(ws);
          console.log(`[Signaling] Viewer watching ${targetCode}`);
          // Tell the guard a new viewer is ready
          const room = rooms.get(targetCode);
          if (room.guard) send(room.guard, { type: 'viewer-ready' });
          break;

        // ── Guard sends SDP offer to all viewers ─────────────────────────
        case 'offer':
          if (employeeCode && rooms.has(employeeCode)) {
            console.log(`[Signaling] Offer from ${employeeCode} → viewers`);
            rooms.get(employeeCode).viewers.forEach(v =>
              send(v, { type: 'offer', sdp: msg.sdp })
            );
          }
          break;

        // ── Viewer sends SDP answer back to guard ────────────────────────
        case 'answer':
          if (targetCode && rooms.has(targetCode)) {
            console.log(`[Signaling] Answer from viewer → ${targetCode}`);
            send(rooms.get(targetCode).guard, { type: 'answer', sdp: msg.sdp });
          }
          break;

        // ── ICE candidate relay (bidirectional) ──────────────────────────
        case 'ice-candidate':
          if (role === 'guard' && employeeCode && rooms.has(employeeCode)) {
            rooms.get(employeeCode).viewers.forEach(v =>
              send(v, { type: 'ice-candidate', candidate: msg.candidate })
            );
          } else if (role === 'viewer' && targetCode && rooms.has(targetCode)) {
            send(rooms.get(targetCode).guard,
              { type: 'ice-candidate', candidate: msg.candidate });
          }
          break;

        // ── Live location tracking relay ─────────────────────────────────
        case 'location':
          if (role === 'guard' && employeeCode && rooms.has(employeeCode)) {
            rooms.get(employeeCode).viewers.forEach(v =>
              send(v, { type: 'location', lat: msg.lat, lng: msg.lng })
            );
          }
          break;
      }
    });

    ws.on('close', () => {
      if (role === 'guard' && employeeCode && rooms.has(employeeCode)) {
        rooms.get(employeeCode).guard = null;
        console.log(`[Signaling] Guard ${employeeCode} disconnected`);
        rooms.get(employeeCode).viewers.forEach(v =>
          send(v, { type: 'guard-disconnected' })
        );
      } else if (role === 'viewer' && targetCode && rooms.has(targetCode)) {
        rooms.get(targetCode).viewers.delete(ws);
        console.log(`[Signaling] Viewer stopped watching ${targetCode}`);
      }
    });

    ws.on('error', (err) => {
      console.error('[Signaling] WebSocket error:', err.message);
    });
  });
}

module.exports = { setupSignaling };
