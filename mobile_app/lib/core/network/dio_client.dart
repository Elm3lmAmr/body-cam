import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';

class DioClient {
  final Dio _dio;
  final FlutterSecureStorage _secureStorage;

  DioClient(this._secureStorage) : _dio = Dio(BaseOptions(baseUrl: AppConfig.baseUrl)) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Dynamically update baseUrl in case the IP was changed at runtime
          options.baseUrl = AppConfig.baseUrl;
          final token = await _secureStorage.read(key: 'jwt_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  Dio get dio => _dio;
}
