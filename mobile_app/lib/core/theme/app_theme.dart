import 'package:flutter/material.dart';

class AppTheme {
  // ── Design Tokens ──────────────────────────────────────────────────────────
  static const Color primaryColor    = Color(0xFF2C5EAD);
  static const Color secondaryColor  = Color(0xFF1591DC);
  static const Color accentColor     = Color(0xFF4BB8FA);
  static const Color inputFillColor  = Color(0xFFC4E2F5);
  static const Color backgroundColor = Color(0xFFF0F7FD);

  // ── Theme ──────────────────────────────────────────────────────────────────
  static ThemeData get theme => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: primaryColor,
          primary: primaryColor,
          secondary: secondaryColor,
          tertiary: accentColor,
          surface: Colors.white,
        ),
        scaffoldBackgroundColor: backgroundColor,

        // Input fields
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: inputFillColor,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: inputFillColor, width: 1.5),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: accentColor, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Colors.redAccent, width: 2),
          ),
          labelStyle: TextStyle(color: primaryColor.withOpacity(0.8)),
          hintStyle: TextStyle(color: Colors.grey.shade500),
        ),

        // Elevated button
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: primaryColor,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 50),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 2,
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
        ),

        // Text
        textTheme: const TextTheme(
          headlineMedium: TextStyle(
            color: primaryColor,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
          bodyMedium: TextStyle(
            color: Colors.black87,
            fontSize: 14,
          ),
        ),
      );
}
