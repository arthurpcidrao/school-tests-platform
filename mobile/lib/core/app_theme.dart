import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Cores
  static const Color primary = Color(0xFF0054cb);
  static const Color primaryContainer = Color(0xFF206cf3);
  static const Color onPrimaryContainer = Color(0xFFfefcff);
  static const Color secondary = Color(0xFF006683);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color background = Color(0xFFF4F4F9);
  static const Color textPrimary = Color(0xFF333333);
  static const Color textSecondary = Color(0xFF666666);
  static const Color success = Color(0xFF2ecc71);
  static const Color warning = Color(0xFFf1c40f);
  static const Color danger = Color(0xFFe74c3c);
  static const Color border = Color(0xFFE2E8F0);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      colorScheme: ColorScheme.light(
        primary: primary,
        primaryContainer: primaryContainer,
        secondary: secondary,
        surface: surface,
        error: danger,
      ),
      textTheme: TextTheme(
        // Headers: Lexend
        displayLarge: GoogleFonts.lexend(fontSize: 32, fontWeight: FontWeight.w700, color: textPrimary),
        displayMedium: GoogleFonts.lexend(fontSize: 24, fontWeight: FontWeight.w600, color: textPrimary),
        displaySmall: GoogleFonts.lexend(fontSize: 20, fontWeight: FontWeight.w600, color: textPrimary),
        titleLarge: GoogleFonts.lexend(fontSize: 18, fontWeight: FontWeight.w600, color: textPrimary),
        // Body: Inter
        bodyLarge: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w400, color: textPrimary),
        bodyMedium: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w400, color: textPrimary),
        bodySmall: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w400, color: textSecondary),
        // Buttons/Labels
        labelLarge: GoogleFonts.lexend(fontSize: 16, fontWeight: FontWeight.w500), // Botões
        labelSmall: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.5), // Label caps
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: primary, width: 2),
        ),
        labelStyle: GoogleFonts.inter(color: textSecondary),
        hintStyle: GoogleFonts.inter(color: textSecondary),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryContainer,
          foregroundColor: onPrimaryContainer,
          textStyle: GoogleFonts.lexend(fontSize: 16, fontWeight: FontWeight.w500),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          elevation: 2,
        ),
      ),
    );
  }
}
