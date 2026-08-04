import 'package:dio/dio.dart';
import '../../domain/entities/stream_session.dart';
import '../../domain/repositories/live_stream_repository.dart';
import '../datasources/live_stream_remote_datasource.dart';

class LiveStreamRepositoryImpl implements LiveStreamRepository {
  final LiveStreamRemoteDataSource remoteDataSource;

  LiveStreamRepositoryImpl(this.remoteDataSource);

  @override
  Future<StreamSession> startStream({
    required String deviceSerial,
    required double latitude,
    required double longitude,
  }) async {
    try {
      return await remoteDataSource.startStream(
        deviceSerial: deviceSerial,
        latitude: latitude,
        longitude: longitude,
      );
    } on DioException catch (e) {
      final message = e.response?.data?['error'] as String? ??
          e.message ??
          'Failed to start stream';
      throw Exception(message);
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }

  @override
  Future<void> stopStream({required String deviceSerial}) async {
    try {
      await remoteDataSource.stopStream(deviceSerial: deviceSerial);
    } on DioException catch (e) {
      final message = e.response?.data?['error'] as String? ??
          e.message ??
          'Failed to stop stream';
      throw Exception(message);
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }
}
