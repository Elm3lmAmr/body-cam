abstract class AuthRepository {
  Future<void> login(String employeeCode, String password);

  Future<void> register(
    String employeeCode,
    String fullName,
    String mobileNumber,
    String password,
    String rePassword,
    String role,
  );
}
