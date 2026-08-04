import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/toggle_stream_usecase.dart';

part 'live_stream_event.dart';
part 'live_stream_state.dart';

class LiveStreamBloc extends Bloc<LiveStreamEvent, LiveStreamState> {
  final ToggleStreamUseCase toggleStreamUseCase;

  LiveStreamBloc({required this.toggleStreamUseCase}) : super(StreamInitial()) {
    on<StartStreamEvent>((event, emit) async {
      emit(StreamConnecting());
      try {
        final session = await toggleStreamUseCase(
          action: StreamAction.start,
          deviceSerial: event.deviceSerial,
          latitude: event.latitude,
          longitude: event.longitude,
        );
        if (session != null) {
          emit(StreamLiveActive(
            streamId: session.streamId,
            webrtcEndpoint: session.webrtcEndpoint,
            deviceSerial: session.deviceSerial,
          ));
        }
      } catch (e) {
        emit(StreamFailure(errorMessage: e.toString()));
      }
    });

    on<StopStreamEvent>((event, emit) async {
      try {
        await toggleStreamUseCase(
          action: StreamAction.stop,
          deviceSerial: event.deviceSerial,
        );
        emit(StreamIdle());
      } catch (e) {
        emit(StreamFailure(errorMessage: e.toString()));
      }
    });
  }
}
