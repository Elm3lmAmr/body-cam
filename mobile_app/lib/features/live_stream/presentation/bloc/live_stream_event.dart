part of 'live_stream_bloc.dart';

abstract class LiveStreamEvent {}

class StartStreamEvent extends LiveStreamEvent {
  final String deviceSerial;
  final double latitude;
  final double longitude;

  StartStreamEvent({
    required this.deviceSerial,
    this.latitude = 0.0,
    this.longitude = 0.0,
  });
}

class StopStreamEvent extends LiveStreamEvent {
  final String deviceSerial;

  StopStreamEvent({required this.deviceSerial});
}
