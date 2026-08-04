import '../../domain/entities/stream_session.dart';

class StreamSessionModel extends StreamSession {
  const StreamSessionModel({
    required super.streamId,
    required super.webrtcEndpoint,
    required super.deviceSerial,
    required super.employeeCode,
  });

  factory StreamSessionModel.fromJson(Map<String, dynamic> json) =>
      StreamSessionModel(
        streamId: json['stream_id'] as String,
        webrtcEndpoint: json['webrtc_endpoint'] as String,
        deviceSerial: json['device_serial'] as String,
        employeeCode: json['employee_code'] as String,
      );
}
