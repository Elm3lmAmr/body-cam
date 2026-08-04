import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../domain/auth_repository.dart';
import '../../../core/network/dio_client.dart';

class AuthRepositoryImpl implements AuthRepository {
  final DioClient _dioClient;
  final FlutterSecureStorage _secureStorage;

  AuthRepositoryImpl(this._dioClient, this._secureStorage);

  @override
  Future<void> login(String employeeCode, String password) async {
    try {
      final response = await _dioClient.dio.post(
        '/api/auth/device-login',
        data: {
          'employee_code': employeeCode,
          'password': password,
        },
      );

      final token = response.data['token'];
      final userEmployeeCode = response.data['user']?['employeeCode'] as String? ?? '';
      final fullName = response.data['user']?['fullName'] as String? ?? '';
      if (token != null) {
        await _secureStorage.write(key: 'jwt_token', value: token);
        await _secureStorage.write(key: 'employee_code', value: userEmployeeCode);
        await _secureStorage.write(key: 'full_name', value: fullName);
      } else {
        throw Exception('Token not found in response');
      }
    } on DioException catch (e) {
      final msg = e.response?.data?['error'] ?? e.message;
      throw Exception(msg);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  @override
  Future<void> register(
    String employeeCode,
    String fullName,
    String mobileNumber,
    String password,
    String rePassword,
    String role,
  ) async {
    try {
      await _dioClient.dio.post(
        '/api/auth/register',
        data: {
          'employee_code': employeeCode,
          'full_name': fullName,
          'mobile_number': mobileNumber,
          'password': password,
          're_password': rePassword,
          'role': role,
        },
      );
    } on DioException catch (e) {
      final msg = e.response?.data?['error'] ?? e.message;
      throw Exception(msg);
    } catch (e) {
      throw Exception(e.toString());
    }
  }
}
