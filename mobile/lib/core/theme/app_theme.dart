import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';
import 'app_dimensions.dart';

/// Centralized [ThemeData] for PromoGames — deep purple dark theme.
class AppTheme {
  static ThemeData get light => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.background,
        fontFamily: GoogleFonts.inter().fontFamily,
        textTheme: GoogleFonts.interTextTheme(Typography.material2021().white).apply(
          bodyColor: Colors.white,
          displayColor: Colors.white,
        ),
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          brightness: Brightness.dark,
          primary: AppColors.primary,
          secondary: AppColors.secondaryPurple,
          surface: AppColors.surface,
          background: AppColors.background,
          onSurface: Colors.white,
          onBackground: Colors.white,
          error: AppColors.danger,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: false,
          iconTheme: IconThemeData(color: Colors.white),
          titleTextStyle: TextStyle(
            color: AppColors.surface,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        cardTheme: CardThemeData(
          color: AppColors.surface,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.card),
          ),
          margin: EdgeInsets.zero,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            elevation: 0,
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.button),
            ),
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
          ),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.button),
            ),
          ),
        ),
        chipTheme: ChipThemeData(
          backgroundColor: AppColors.surfaceVariant,
          selectedColor: AppColors.primary,
          secondarySelectedColor: AppColors.primary,
          labelStyle: const TextStyle(color: Colors.white),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.pill),
          ),
        ),
        dividerTheme: const DividerThemeData(color: AppColors.divider, thickness: 1),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      );
}
