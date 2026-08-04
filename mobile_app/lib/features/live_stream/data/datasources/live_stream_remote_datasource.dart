import 'package:dio/dio.dart';
import '../models/stream_session_model.dart';

class LiveStreamRemoteDataSource {
  final Dio dio;

  LiveStreamRemoteDataSource(this.dio);

  Future<StreamSessionModel> startStream({
    required String deviceSerial,
    required double latitude,
    required double longitude,
  }) async {
    final response = await dio.post(
      '/api/stream/initialize',
      data: {
        'device_serial': deviceSerial,
        'status': 'STREAMING',
        'gps': {
          'latitude': latitude,
          'longitude': longitude,
        },
      },
    );
    return StreamSessionModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> stopStream({
    required String deviceSerial,
  }) async {
    await dio.post(
      '/api/stream/initialize',
      data: {
        'device_serial': deviceSerial,
        'status': 'IDLE',
        'gps': {
          'latitude': 0.0,
          'longitude': 0.0,
        },
      },
    );
  }
}
