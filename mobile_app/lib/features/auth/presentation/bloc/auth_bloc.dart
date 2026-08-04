import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/login_usecase.dart';
import '../../domain/register_usecase.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;

  AuthBloc({required this.loginUseCase, required this.registerUseCase})
      : super(AuthInitial()) {
    on<LoginButtonPressed>((event, emit) async {
      emit(AuthLoading());
      try {
        await loginUseCase(event.employeeCode, event.password);
        emit(AuthSuccess());
      } catch (e) {
        emit(AuthFailure(error: e.toString()));
      }
    });

    on<RegisterButtonPressed>((event, emit) async {
      emit(AuthLoading());
      try {
        await registerUseCase(
          event.employeeCode,
          event.fullName,
          event.mobileNumber,
          event.password,
          event.rePassword,
          event.role,
        );
        emit(AuthRegistered());
      } catch (e) {
        emit(AuthFailure(error: e.toString()));
      }
    });
  }
}
