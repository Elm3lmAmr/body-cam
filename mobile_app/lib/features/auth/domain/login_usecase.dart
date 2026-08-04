import 'auth_repository.dart';

class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  Future<void> call(String employeeCode, String password) {
    return repository.login(employeeCode, password);
  }
}
