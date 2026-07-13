import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

import 'pages/splash_page.dart';
import 'pages/login_page.dart';
import 'pages/game_player_page.dart';
import 'pages/admin_dashboard_page.dart';
import 'pages/it_dashboard_page.dart';
import 'pages/bo_dashboard_page.dart';
import 'pages/franchise_dashboard_page.dart';

import 'widgets/player_shell.dart';
import 'features/player/home_screen.dart';
import 'features/player/games_screen.dart';
import 'features/player/rewards_screen.dart';
import 'features/player/leaderboard_screen.dart';
import 'features/player/profile_screen.dart';
import 'features/player/game_details_page.dart';
import 'features/player/reward_details_page.dart';
import 'features/player/wallet_page.dart';
import 'features/player/notifications_page.dart';
import 'features/player/challenges_page.dart';
import 'features/player/achievements_page.dart';
import 'features/player/referral_page.dart';
import 'features/player/settings_page.dart';

import 'models/game.dart';
import 'core/data/mock_data.dart';
import 'core/widgets/states.dart';

GoRouter buildRouter() {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (_, __) => const SplashPage()),
      GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
      GoRoute(
        path: '/game',
        builder: (context, state) => GamePlayerPage(game: state.extra as Game),
      ),
      GoRoute(path: '/wallet', builder: (_, __) => const WalletPage()),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationsPage()),
      GoRoute(path: '/challenges', builder: (_, __) => const ChallengesPage()),
      GoRoute(path: '/achievements', builder: (_, __) => const AchievementsPage()),
      GoRoute(path: '/referral', builder: (_, __) => const ReferralPage()),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsPage()),
      GoRoute(
        path: '/success',
        builder: (context, _) => SuccessScreen(
          title: 'Reward Redeemed!',
          subtitle: 'Your voucher is on its way to your email.',
          onContinue: () => context.go('/rewards'),
        ),
      ),
      GoRoute(path: '/admin', builder: (_, __) => const AdminDashboardPage()),
      GoRoute(path: '/it', builder: (_, __) => const ITDashboardPage()),
      GoRoute(path: '/bo', builder: (_, __) => const BODashboardPage()),
      GoRoute(path: '/franchise', builder: (_, __) => const FranchiseDashboardPage()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => PlayerShell(navigationShell: shell),
        branches: [
          StatefulShellBranch(
            initialLocation: '/home',
            routes: [GoRoute(path: '/home', builder: (_, __) => const HomeScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/games', builder: (_, __) => const GamesScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/rewards', builder: (_, __) => const RewardsScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/leaderboard', builder: (_, __) => const LeaderboardScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen())],
          ),
        ],
      ),
      GoRoute(
        path: '/game-details',
        builder: (context, state) => GameDetailsPage(game: state.extra as GameItem),
      ),
      GoRoute(
        path: '/reward-details',
        builder: (context, state) => RewardDetailsPage(reward: state.extra as RewardItem),
      ),
    ],
  );
}
