import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import '../core/api_constants.dart';

class ApiService {
  static final ApiService instance = ApiService._init();
  late Dio _dio;

  ApiService._init() {
    final String baseUrl = ApiConstants.baseUrl;
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
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
    return await _dio.post('auth/login', data: {
      'email': email,
      'password': password,
    });
  }

  Future<Response> register(String email, String password, String role) async {
    return await _dio.post('auth/register', data: {
      'email': email,
      'password': password,
      'role': role,
    });
  }

  Future<Response> fetchAssignedTests() async {
    return await _dio.get('exams/tests/assigned');
  }

  Future<Response> fetchFullTest(String testId) async {
    return await _dio.get('exams/tests/$testId/full');
  }

  Future<Response> submitAttempt(String testId, List<Map<String, String>> answers) async {
    return await _dio.post('exams/attempts', data: {
      'test_id': testId,
      'answers': answers,
    });
  }

  Future<Response> fetchMyAttempts() async {
    return await _dio.get('exams/attempts/my');
  }
}
