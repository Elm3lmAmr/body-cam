import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../../../../core/config/app_config.dart';

class WebRTCService {
  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;
  WebSocketChannel? _channel;
  bool _disposed = false;
  MediaStream? _remoteStream;
  MediaRecorder? _mediaRecorder;
  String? _recordingPath;
  String? _employeeCode;
  DateTime? _recordingStartTime;

  MediaStream? get localStream => _localStream;
  MediaStream? get remoteStream => _remoteStream;
  String? get recordingPath => _recordingPath;
  Function(MediaStream)? onAddRemoteStream;

  static const Map<String, dynamic> _iceConfig = {
    'iceServers': [
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'stun:stun1.l.google.com:19302'},
    ],
    'sdpSemantics': 'unified-plan',
  };

  Future<void> start(String employeeCode) async {
    _employeeCode = employeeCode;
    // 1. Get user media (back camera + audio)
    _localStream = await navigator.mediaDevices.getUserMedia({
      'video': {
        'facingMode': 'environment',
      },
      'audio': true,
    });

    // 2. Create peer connection
    _peerConnection = await createPeerConnection(_iceConfig);

    _peerConnection!.onAddStream = (stream) {
      _remoteStream = stream;
      onAddRemoteStream?.call(stream);
      Helper.setSpeakerphoneOn(true);
    };

    _peerConnection!.onTrack = (event) {
      if (event.streams.isNotEmpty) {
        _remoteStream = event.streams[0];
        onAddRemoteStream?.call(_remoteStream!);
        Helper.setSpeakerphoneOn(true);
      }
    };

    // 3. Add all tracks
    _localStream!.getTracks().forEach((track) {
      _peerConnection!.addTrack(track, _localStream!);
    });

    // 4. Connect WebSocket signaling
    _channel = WebSocketChannel.connect(Uri.parse(AppConfig.wsUrl));

    // 5. Send join message
    _send({'type': 'join', 'employeeCode': employeeCode});

    // 6. Listen to signaling messages
    _channel!.stream.listen((raw) async {
      if (_disposed) return;
      final msg = jsonDecode(raw as String) as Map<String, dynamic>;
      final type = msg['type'] as String;

      if (type == 'viewer-ready') {
        await _createAndSendOffer();
      } else if (type == 'answer') {
        final sdp = RTCSessionDescription(
          msg['sdp']['sdp'] as String,
          msg['sdp']['type'] as String,
        );
        await _peerConnection!.setRemoteDescription(sdp);
      } else if (type == 'ice-candidate') {
        final c = msg['candidate'];
        if (c != null) {
          await _peerConnection!.addCandidate(RTCIceCandidate(
            c['candidate'] as String?,
            c['sdpMid'] as String?,
            c['sdpMLineIndex'] as int?,
          ));
        }
      }
    });

    // 7. Send our ICE candidates
    _peerConnection!.onIceCandidate = (candidate) {
      if (candidate.candidate != null && !_disposed) {
        _send({
          'type': 'ice-candidate',
          'candidate': {
            'candidate': candidate.candidate,
            'sdpMid': candidate.sdpMid,
            'sdpMLineIndex': candidate.sdpMLineIndex,
          },
        });
      }
    };
  }

  Future<void> _createAndSendOffer() async {
    final offer = await _peerConnection!.createOffer();
    await _peerConnection!.setLocalDescription(offer);
    _send({'type': 'offer', 'sdp': offer.toMap()});
  }

  void _send(Map<String, dynamic> data) {
    _channel?.sink.add(jsonEncode(data));
  }

  void sendLocation(double lat, double lng) {
    if (!_disposed) {
      _send({
        'type': 'location',
        'lat': lat,
        'lng': lng,
      });
    }
  }

  Future<void> startRecording(String filePath) async {
    if (_localStream == null) return;
    try {
      _mediaRecorder = MediaRecorder();
      _recordingPath = filePath;
      _recordingStartTime = DateTime.now();
      final videoTrack = _localStream!.getVideoTracks().first;
      final hasAudio = _localStream!.getAudioTracks().isNotEmpty;
      await _mediaRecorder!.start(
        filePath,
        videoTrack: videoTrack,
        audioChannel: hasAudio ? RecorderAudioChannel.INPUT : null,
      );
      print('Recording started: $filePath');
    } catch (e) {
      print('Failed to start recording: $e');
    }
  }

  Future<void> _uploadRecording(String filePath) async {
    try {
      final file = File(filePath);
      if (!await file.exists()) return;
      final durationSeconds = _recordingStartTime != null
          ? DateTime.now().difference(_recordingStartTime!).inSeconds
          : 0;
      final formData = FormData.fromMap({
        'video': await MultipartFile.fromFile(filePath, filename: filePath.split('/').last),
        'employee_code': _employeeCode ?? 'G001',
        'duration_seconds': durationSeconds.toString(),
      });
      final dio = Dio(BaseOptions(
        baseUrl: AppConfig.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(minutes: 5),
      ));
      final res = await dio.post('/api/recordings/upload', data: formData);
      print('Recording uploaded successfully: ${res.data}');
    } catch (e) {
      print('Failed to upload recording: $e');
    }
  }

  Future<void> stopRecording() async {
    if (_mediaRecorder != null) {
      try {
        await _mediaRecorder!.stop();
        print('Recording stopped: $_recordingPath');
        if (_recordingPath != null) {
          await _uploadRecording(_recordingPath!);
        }
      } catch (e) {
        print('Failed to stop recording: $e');
      }
      _mediaRecorder = null;
    }
  }

  Future<void> dispose() async {
    _disposed = true;
    await stopRecording();
    await _channel?.sink.close();
    _localStream?.getTracks().forEach((t) => t.stop());
    await _localStream?.dispose();
    await _peerConnection?.close();
    _peerConnection = null;
    _localStream = null;
    _channel = null;
  }
}
