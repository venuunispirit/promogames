import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/auth_service.dart';

import 'pages/splash_page.dart';
import 'pages/home_page.dart';
import 'pages/login_page.dart';
import 'pages/register_page.dart';
import 'pages/game_player_page.dart';
import 'pages/games_list_page.dart';
import 'pages/rewards_page.dart';

void main() {
  runApp(
    ChangeNotifierProvider(create: (_) => AuthService(),
    child: const PromoGamesApp())
  );
}

class PromoGamesApp extends StatelessWidget {
  const PromoGamesApp({super.key});

  @override
  Widget build(BuildContext ctx) {
    return MaterialApp(
      title: 'PromoGames',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF8b5cf6),
        useMaterial3: true,
        brightness: Brightness.light,
      ),
      initialRoute: '/',
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/':
            return MaterialPageRoute(builder: (_) => const SplashPage());
          case '/login':
            return MaterialPageRoute(builder: (_) => const LoginPage());
          case '/register':
            return MaterialPageRoute(builder: (_) => const RegisterPage());
          case '/home':
            return MaterialPageRoute(builder: (_) => const HomePage());
          case '/games':
            return MaterialPageRoute(builder: (_) => const GamesListPage());
          case '/game':
            return MaterialPageRoute(builder: (_) => GamePlayerPage());
          case '/rewards':
            return MaterialPageRoute(builder: (_) => const RewardsPage());
          default:
            return MaterialPageRoute(builder: (_) => const SplashPage());
    }
    },
  );
}
}
