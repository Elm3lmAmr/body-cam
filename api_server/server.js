/**
 * server.js — Entry point for the Edara API + WebRTC Signaling Server.
 * Both the REST API (Express) and the WebSocket Signaling Server
 * share a single HTTP server on PORT 4000.
 */

const http = require('http');
const app = require('./app');
const { setupSignaling } = require('./signaling/signalingServer');

const PORT = process.env.PORT || 4000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach WebRTC signaling WebSocket server
setupSignaling(server);

// Start listening
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Edara API Server    → http://127.0.0.1:${PORT}`);
  console.log(`✅ WebRTC Signaling    → ws://127.0.0.1:${PORT}`);
  console.log(`✅ Network accessible  → ws://0.0.0.0:${PORT} (real device WebRTC)`);
});
