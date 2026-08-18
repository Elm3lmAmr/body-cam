import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:dio/dio.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:geolocator/geolocator.dart';
import 'package:path_provider/path_provider.dart';
import '../../../../core/config/app_config.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/live_stream_bloc.dart';
import '../services/stream_permission_service.dart';
import '../services/webrtc_service.dart';


class LiveStreamScreen extends StatefulWidget {
  const LiveStreamScreen({super.key});

  @override
  State<LiveStreamScreen> createState() => _LiveStreamScreenState();
}

class _LiveStreamScreenState extends State<LiveStreamScreen> {
  final _localRenderer = RTCVideoRenderer();
  final _remoteRenderer = RTCVideoRenderer();
  final _secureStorage = const FlutterSecureStorage();
  WebRTCService? _webRTCService;


  bool _permissionsGranted = false;
  bool _permissionsDeniedPermanently = false;
  double _lat = 0.0;
  double _lng = 0.0;
  bool _gpsReady = false;
  StreamSubscription<Position>? _positionStream;

  @override
  void initState() {
    super.initState();
    _initRenderer();
    _initPermissionsAndGps();
  }

  Future<void> _initRenderer() async {
    await _localRenderer.initialize();
    await _remoteRenderer.initialize();
  }

  Future<void> _initPermissionsAndGps() async {
    final granted = await StreamPermissionService.requestAll();
    if (!mounted) return;

    if (!granted) {
      setState(() => _permissionsDeniedPermanently = true);
      return;
    }

    setState(() => _permissionsGranted = true);

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return;

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );
      if (!mounted) return;
      setState(() {
        _lat = position.latitude;
        _lng = position.longitude;
        _gpsReady = true;
      });
    } catch (_) {
      // GPS unavailable - proceed with 0,0
      if (mounted) setState(() => _gpsReady = true);
    }
  }

  Future<void> _startStream() async {
    final employeeCode =
        await _secureStorage.read(key: 'employee_code') ?? 'UNKNOWN';

    if (!mounted) return;

    // Dispatch to BLoC with real GPS
    context.read<LiveStreamBloc>().add(StartStreamEvent(
          deviceSerial: AppConfig.deviceSerial,
          latitude: _lat,
          longitude: _lng,
        ));

    // Start WebRTC
    _webRTCService = WebRTCService();

    _webRTCService!.onAddRemoteStream = (stream) {
      if (mounted) {
        setState(() {
          _remoteRenderer.srcObject = stream;
        });
      }
    };
    
    try {
      await _webRTCService!.start(employeeCode);
      if (mounted) {
        _localRenderer.srcObject = _webRTCService!.localStream;
        setState(() {});
      }

      // Add a small delay to prevent MediaRecorder from blocking WebRTC video initialization
      await Future.delayed(const Duration(milliseconds: 1500));

      // Start recording automatically
      final dir = await getApplicationDocumentsDirectory();
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final filePath = '${dir.path}/bodycam_rec_$timestamp.mp4';
      await _webRTCService!.startRecording(filePath);

      _positionStream = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 2,
        ),
      ).listen((Position position) {
        if (mounted) {
          setState(() {
            _lat = position.latitude;
            _lng = position.longitude;
          });
          _webRTCService?.sendLocation(position.latitude, position.longitude);
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Camera error: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Future<void> _stopStream(String deviceSerial) async {
    context.read<LiveStreamBloc>().add(StopStreamEvent(deviceSerial: deviceSerial));
    _positionStream?.cancel();
    _positionStream = null;
    
    final recPath = _webRTCService?.recordingPath;
    await _webRTCService?.dispose();
    _webRTCService = null;
    _localRenderer.srcObject = null;
    _remoteRenderer.srcObject = null;
    

    if (mounted) {
      setState(() {});
      if (recPath != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Recording saved to:\n$recPath'),
            duration: const Duration(seconds: 4),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  void _triggerSOS() async {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('SOS Triggered! Alerting supervisor...'),
        backgroundColor: Colors.red,
        duration: Duration(seconds: 3),
      ),
    );
    
    try {
      final dio = Dio();
      final url = '${AppConfig.baseUrl}/api/incidents/raise';
      await dio.post(url, data: {
        'description': 'SOS triggered by guard from Mobile App',
        'type': 'red_flag',
        'device_serial': AppConfig.deviceSerial,
        'start_time': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Failed to send SOS: $e');
    }
  }

  @override
  void dispose() {
    _positionStream?.cancel();
    _localRenderer.dispose();
    _remoteRenderer.dispose();
    _webRTCService?.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.primaryColor,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Live Stream',
          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600),
        ),
        leading: const Icon(Icons.videocam, color: Colors.white),
      ),
      body: SafeArea(
        child: _permissionsDeniedPermanently
            ? _buildPermissionDenied()
            : BlocBuilder<LiveStreamBloc, LiveStreamState>(
                builder: (context, state) {
                  if (state is StreamConnecting) return _buildConnecting();
                  if (state is StreamLiveActive) return _buildLive(state);
                  if (state is StreamFailure) return _buildFailure(state.errorMessage);
                  return _buildIdle();
                },
              ),
      ),
    );
  }

  Widget _buildPermissionDenied() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.no_photography, size: 72, color: Colors.redAccent),
            const SizedBox(height: 20),
            const Text('Permissions Required',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold,
                    color: AppTheme.primaryColor)),
            const SizedBox(height: 12),
            const Text(
              'Camera, Microphone, and Location access\nare required to start the live stream.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.black54, height: 1.5),
            ),
            const SizedBox(height: 28),
            ElevatedButton.icon(
              onPressed: StreamPermissionService.openSettings,
              icon: const Icon(Icons.settings),
              label: const Text('Open Settings'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIdle() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 120, height: 120,
              decoration: BoxDecoration(
                color: AppTheme.inputFillColor,
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(
                  color: AppTheme.accentColor.withOpacity(0.2),
                  blurRadius: 24, offset: const Offset(0, 8),
                )],
              ),
              child: const Icon(Icons.videocam_off_rounded,
                  size: 52, color: AppTheme.primaryColor),
            ),
            const SizedBox(height: 24),
            const Text('Camera Offline',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700,
                    color: AppTheme.primaryColor)),
            const SizedBox(height: 8),
            Text(
              _gpsReady
                  ? 'GPS: $_lat, $_lng\nDevice: ${AppConfig.deviceSerial}'
                  : 'Acquiring GPS signal...',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: Colors.black54, height: 1.5),
            ),

            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _permissionsGranted ? _startStream : null,
              icon: const Icon(Icons.play_arrow_rounded),
              label: const Text('Start Stream'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 52),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConnecting() {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircularProgressIndicator(
            strokeWidth: 3.5,
            valueColor: AlwaysStoppedAnimation<Color>(AppTheme.secondaryColor),
          ),
          SizedBox(height: 24),
          Text('Connecting…',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600,
                  color: AppTheme.primaryColor)),
        ],
      ),
    );
  }

  Widget _buildLive(StreamLiveActive state) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Local camera preview
        RTCVideoView(
          _localRenderer,
          objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
        ),

        // Hidden remote audio renderer
        SizedBox(
          width: 1,
          height: 1,
          child: RTCVideoView(_remoteRenderer),
        ),

        // HUD overlay
        Positioned(
          top: 16, left: 16, right: 16,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _LiveBadge(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  state.deviceSerial,
                  style: const TextStyle(color: Colors.white, fontSize: 12,
                      fontFamily: 'monospace'),
                ),
              ),
            ],
          ),
        ),

        // GPS overlay bottom left
        Positioned(
          bottom: 80, left: 16,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'LAT: ${_lat.toStringAsFixed(6)}\nLON: ${_lng.toStringAsFixed(6)}',
              style: const TextStyle(color: Color(0xFF00FF41),
                  fontSize: 11, fontFamily: 'monospace', height: 1.5),
            ),
          ),
        ),

        // SOS Button
        Positioned(
          bottom: 96, right: 16,
          child: FloatingActionButton(
            heroTag: 'sos_btn',
            backgroundColor: Colors.red,
            onPressed: _triggerSOS,
            child: const Text('SOS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ),

        // Stop button
        Positioned(
          bottom: 24, left: 24, right: 24,
          child: ElevatedButton.icon(
            onPressed: () => _stopStream(state.deviceSerial),
            icon: const Icon(Icons.stop_rounded),
            label: const Text('Stop Stream'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 52),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFailure(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, size: 56, color: Colors.redAccent),
            const SizedBox(height: 16),
            const Text('Stream Failed', style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.w700, color: Colors.redAccent)),
            const SizedBox(height: 10),
            Text(error, textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: Colors.redAccent, height: 1.5)),
            const SizedBox(height: 28),
            ElevatedButton.icon(
              onPressed: _startStream,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

class _LiveBadge extends StatefulWidget {
  @override
  State<_LiveBadge> createState() => _LiveBadgeState();
}

class _LiveBadgeState extends State<_LiveBadge> {
  bool _visible = true;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 700),
        (_) => setState(() => _visible = !_visible));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: _visible ? 1.0 : 0.2,
      duration: const Duration(milliseconds: 300),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.red,
          borderRadius: BorderRadius.circular(6),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.fiber_manual_record, color: Colors.white, size: 10),
            SizedBox(width: 6),
            Text('REC', style: TextStyle(
                color: Colors.white, fontWeight: FontWeight.w800,
                fontSize: 13, letterSpacing: 1.5)),
          ],
        ),
      ),
    );
  }
}
