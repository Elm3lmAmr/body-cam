part of 'live_stream_bloc.dart';

abstract class LiveStreamState {}

class StreamInitial extends LiveStreamState {}

class StreamConnecting extends LiveStreamState {}

class StreamLiveActive extends LiveStreamState {
  final String streamId;
  final String webrtcEndpoint;
  final String deviceSerial;

  StreamLiveActive({
    required this.streamId,
    required this.webrtcEndpoint,
    required this.deviceSerial,
  });
}

class StreamIdle extends LiveStreamState {}

class StreamFailure extends LiveStreamState {
  final String errorMessage;

  StreamFailure({required this.errorMessage});
}
