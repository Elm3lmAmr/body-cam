abstract class AuthEvent {}

class LoginButtonPressed extends AuthEvent {
  final String employeeCode;
  final String password;

  LoginButtonPressed({required this.employeeCode, required this.password});
}

class RegisterButtonPressed extends AuthEvent {
  final String employeeCode;
  final String fullName;
  final String mobileNumber;
  final String password;
  final String rePassword;
  final String role;

  RegisterButtonPressed({
    required this.employeeCode,
    required this.fullName,
    required this.mobileNumber,
    required this.password,
    required this.rePassword,
    required this.role,
  });
}
