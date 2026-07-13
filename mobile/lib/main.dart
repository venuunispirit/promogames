import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/auth_service.dart';
import 'core/theme/app_theme.dart';
import 'app_router.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthService(),
      child: const PromoGamesApp(),
    ),
  );
}

class PromoGamesApp extends StatelessWidget {
  const PromoGamesApp({super.key});

  @override
  Widget build(BuildContext ctx) {
    return MaterialApp.router(
      title: 'PromoGames',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.light,
      routerConfig: buildRouter(),
    );
  }
}
