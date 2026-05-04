import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/app_theme.dart';
import 'screens/login_screen.dart';
import 'providers/auth_provider.dart';
import 'providers/test_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EdukSimApp());
}

class EdukSimApp extends StatelessWidget {
  const EdukSimApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => TestProvider()),
      ],
      child: MaterialApp(
        title: 'EdukSim',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const LoginScreen(),
      ),
    );
  }
}
