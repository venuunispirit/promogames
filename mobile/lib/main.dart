import 'package:flutter/material.dart';
import 'package:mobile/models/game.dart';
import 'package:provider/provider.dart';
import 'services/auth_service.dart';

import 'pages/splash_page.dart';
import 'pages/home_page.dart';
import 'pages/login_page.dart';
import 'pages/game_player_page.dart';
import 'pages/games_list_page.dart';
import 'pages/rewards_page.dart';
import 'pages/admin_dashboard_page.dart';
import 'pages/it_dashboard_page.dart';
import 'pages/bo_dashboard_page.dart';
import 'pages/franchise_dashboard_page.dart';

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
          case '/home':
            return MaterialPageRoute(builder: (_) => const HomePage());
          case '/games':
            return MaterialPageRoute(builder: (_) => const GamesListPage());
          case '/game':
            return MaterialPageRoute(
              builder: (_) => GamePlayerPage(game: settings.arguments as Game),
            );
          case '/rewards':
            return MaterialPageRoute(builder: (_) => const RewardsPage());
          case '/admin':
            return MaterialPageRoute(
              builder: (_) => const AdminDashboardPage(),
            );
          case '/it':
            return MaterialPageRoute(builder: (_) => const ITDashboardPage());
          case '/bo':
            return MaterialPageRoute(builder: (_) => const BODashboardPage());
          case '/franchise':
            return MaterialPageRoute(
              builder: (_) => const FranchiseDashboardPage(),
            );
          default:
            return MaterialPageRoute(builder: (_) => const SplashPage());
        }
      },
    );
  }
}
