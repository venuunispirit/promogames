import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/auth_service.dart';
import 'services/player_provider.dart';
import 'app_router.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => PlayerProvider()),
      ],
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
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF8b5cf6),
        useMaterial3: true,
        brightness: Brightness.light,
      ),
      routerConfig: buildRouter(),
    );
  }
}
