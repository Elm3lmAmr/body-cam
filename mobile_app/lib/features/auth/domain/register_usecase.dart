import 'auth_repository.dart';

class RegisterUseCase {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  Future<void> call(
    String employeeCode,
    String fullName,
    String mobileNumber,
    String password,
    String rePassword,
    String role,
  ) {
    return repository.register(
      employeeCode,
      fullName,
      mobileNumber,
      password,
      rePassword,
      role,
    );
  }
}
