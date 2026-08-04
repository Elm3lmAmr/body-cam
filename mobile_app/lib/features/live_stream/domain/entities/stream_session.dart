class StreamSession {
  final String streamId;
  final String webrtcEndpoint;
  final String deviceSerial;
  final String employeeCode;

  const StreamSession({
    required this.streamId,
    required this.webrtcEndpoint,
    required this.deviceSerial,
    required this.employeeCode,
  });
}
