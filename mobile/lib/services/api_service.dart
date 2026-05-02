import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static final ApiService instance = ApiService._init();
  late Dio _dio;

  ApiService._init() {
    _dio = Dio(BaseOptions(
      baseUrl: 'http://10.0.2.2:8000/api/', // Emulator localhost
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // Interceptor para injetar o token JWT
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        // Implementar lógica de refresh token se necessário
        return handler.next(e);
      },
    ));
  }

  Dio get client => _dio;

  Future<Response> login(String email, String password) async {
    return await _dio.post('token/', data: {
      'email': email,
      'password': password,
    });
  }

  Future<Response> fetchAvailableExams() async {
    return await _dio.get('tests/'); // O endpoint correto precisa ser ajustado baseado nas urls.py
  }

  Future<Response> syncTestAttempts(List<Map<String, dynamic>> attempts) async {
    return await _dio.post('sync-attempts/', data: attempts);
  }
}
