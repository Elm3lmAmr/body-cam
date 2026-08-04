import '../entities/stream_session.dart';
import '../repositories/live_stream_repository.dart';

enum StreamAction { start, stop }

class ToggleStreamUseCase {
  final LiveStreamRepository repository;

  ToggleStreamUseCase(this.repository);

  Future<StreamSession?> call({
    required StreamAction action,
    required String deviceSerial,
    double latitude = 0.0,
    double longitude = 0.0,
  }) async {
    if (action == StreamAction.start) {
      return await repository.startStream(
        deviceSerial: deviceSerial,
        latitude: latitude,
        longitude: longitude,
      );
    } else {
      await repository.stopStream(deviceSerial: deviceSerial);
      return null;
    }
  }
}
