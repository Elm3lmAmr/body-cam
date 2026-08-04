# Body Camera Web Dashboard

The **Web Dashboard** is a React-based frontend application that serves as the supervisor portal for the Body Camera Management System. It allows supervisors to monitor live video feeds streamed directly from guards' mobile devices in real time.

## Overview of the Process

The entire system relies on three core components working together seamlessly:

1. **Mobile App (Body Camera)**: 
   - Guards log into the Flutter mobile app.
   - The app uses the device's camera to capture live video.
   - It establishes a WebRTC Peer-to-Peer connection with the Web Dashboard via the Signaling Server.
2. **API & Signaling Server**: 
   - A Node.js/Express backend handles authentication and provides a WebSocket signaling server.
   - The signaling server is responsible for relaying SDP offers, answers, and ICE candidates between the mobile app (producer) and the web dashboard (consumer).
3. **Web Dashboard (This Project)**: 
   - Supervisors log into the dashboard to see a list of active streams.
   - When a stream is selected, the dashboard establishes a WebRTC connection to receive the live video track directly from the guard's mobile device with minimal latency.

## WebRTC Connection Flow

1. **Signaling**: The Web Dashboard connects to the WebSocket signaling server dynamically using the host's IP address.
2. **Handshake**: 
   - The dashboard sends a `watch` request for a specific guard's stream.
   - The mobile app sends an SDP `offer`.
   - The dashboard receives the offer and responds with an SDP `answer`.
3. **ICE Candidates**: Both peers exchange ICE candidates to discover the best network path to connect to each other.
4. **Live Stream**: Once connected, the video track is received by the Web Dashboard and displayed in the `StreamViewer` component.

## Technologies Used

- **React & Vite**: Fast and modern frontend framework and build tool.
- **WebRTC**: For ultra-low latency, real-time peer-to-peer video streaming.
- **WebSocket**: For WebRTC signaling and real-time status updates.
- **Vanilla CSS**: For custom, dynamic, and responsive styling.

## Running the Dashboard

To run the Web Dashboard locally:

1. Ensure the API & Signaling server is running.
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The application will hot-reload dynamically, and network requests are configured to use the host's IP address automatically, ensuring it works seamlessly across any connected network.
