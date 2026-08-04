import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../network/dio_client.dart';
// Auth
import '../../features/auth/data/auth_repository_impl.dart';
import '../../features/auth/domain/login_usecase.dart';
import '../../features/auth/domain/register_usecase.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
// Live Stream
import '../../features/live_stream/data/datasources/live_stream_remote_datasource.dart';
import '../../features/live_stream/data/repositories/live_stream_repository_impl.dart';
import '../../features/live_stream/domain/usecases/toggle_stream_usecase.dart';
import '../../features/live_stream/presentation/bloc/live_stream_bloc.dart';

/// Central dependency injection container.
/// All object graphs are assembled here — main.dart stays clean.
class InjectionContainer {
  InjectionContainer._();

  // ── Shared Infrastructure ──────────────────────────────────────────────────
  static final _secureStorage = const FlutterSecureStorage();
  static final _dioClient = DioClient(_secureStorage);

  // ── Auth ───────────────────────────────────────────────────────────────────
  static final _authRepository =
      AuthRepositoryImpl(_dioClient, _secureStorage);

  static AuthBloc get authBloc => AuthBloc(
        loginUseCase: LoginUseCase(_authRepository),
        registerUseCase: RegisterUseCase(_authRepository),
      );

  // ── Live Stream ────────────────────────────────────────────────────────────
  static final _liveStreamDataSource =
      LiveStreamRemoteDataSource(_dioClient.dio);
  static final _liveStreamRepository =
      LiveStreamRepositoryImpl(_liveStreamDataSource);

  static LiveStreamBloc get liveStreamBloc => LiveStreamBloc(
        toggleStreamUseCase: ToggleStreamUseCase(_liveStreamRepository),
      );
}
