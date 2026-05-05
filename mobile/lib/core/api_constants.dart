import 'package:flutter/foundation.dart';

class ApiConstants {
  // Alterar essa variável para mudar o ambiente (desenvolvimento vs produção)
  static const bool isProduction = false;
  
  // URL de Produção (Exemplo)
  static const String productionUrl = 'https://sua-url-de-producao.com/api/';
  
  // URL de Desenvolvimento (kIsWeb verifica se é emulador ou web)
  static const String devUrl = kIsWeb ? 'http://localhost:8000/api/' : 'http://10.0.2.2:8000/api/';

  // Retorna a base URL dependendo do ambiente
  static String get baseUrl => isProduction ? productionUrl : devUrl;
}
