import 'package:flutter/material.dart';

/// Centralized color palette for PromoGames (light, premium, minimal).
class AppColors {
  // Brand
  static const Color primary = Color(0xFF7B3EFF);
  static const Color primaryDark = Color(0xFF5B1FD6);
  static const Color secondaryPurple = Color(0xFF9A5BFF);
  static const Color accentGold = Color(0xFFFDBB2D);

  // Surfaces
  static const Color background = Color(0xFFF8F9FD);
  static const Color surface = Colors.white;
  static const Color surfaceVariant = Color(0xFFF1F2FA);

  // Text
  static const Color text = Color(0xFF161616);
  static const Color textSecondary = Color(0xFF7C7C8A);
  static const Color textOnPrimary = Colors.white;

  // Lines
  static const Color divider = Color(0xFFECECF5);

  // Semantic
  static const Color success = Color(0xFF34C759);
  static const Color warning = Color(0xFFFF9500);
  static const Color danger = Color(0xFFFF3B30);

  // Gradients
  static const Gradient primaryGradient = LinearGradient(
    colors: [primary, secondaryPurple],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const Gradient goldGradient = LinearGradient(
    colors: [Color(0xFFFDBB2D), Color(0xFFFFD76A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const Gradient heroGradient = LinearGradient(
    colors: [Color(0xFF7B3EFF), Color(0xFF9A5BFF), Color(0xFFB07BFF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Dark theme
  static const Color darkBackground = Color(0xFF0E0E14);
  static const Color darkSurface = Color(0xFF1A1A24);
  static const Color darkText = Color(0xFFFFFFFF);
  static const Color darkTextSecondary = Color(0xFF9A9AA8);
}
