import '../entities/stream_session.dart';

abstract class LiveStreamRepository {
  Future<StreamSession> startStream({
    required String deviceSerial,
    required double latitude,
    required double longitude,
  });

  Future<void> stopStream({
    required String deviceSerial,
  });
}
