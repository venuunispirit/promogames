import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/data/mock_data.dart';
import '../../core/widgets/app_button.dart';
import '../../services/auth_service.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.history_rounded, 'History', () => context.go('/wallet')),
      (Icons.emoji_events_rounded, 'Achievements', () => context.go('/achievements')),
      (Icons.task_alt_rounded, 'Challenges', () => context.go('/challenges')),
      (Icons.group_add_rounded, 'Referral', () => context.go('/referral')),
      (Icons.settings_rounded, 'Settings', () => context.go('/settings')),
      (Icons.help_outline_rounded, 'Help & Support', () {}),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Profile', style: TextStyle(fontWeight: FontWeight.bold)), automaticallyImplyLeading: false),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpace.lg),
          child: Column(
            children: [
              const SizedBox(height: 12),
              Center(
                child: Stack(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(shape: BoxShape.circle, gradient: AppColors.primaryGradient),
                      child: const CircleAvatar(radius: 44, backgroundColor: Colors.white, child: Icon(Icons.person, size: 44, color: AppColors.primary)),
                    ),
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(color: AppColors.accentGold, shape: BoxShape.circle),
                        child: const Text('7', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Text(MockData.username, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const Text('muzammil@promogames.com', style: TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 16),
              Row(
                children: const [
                  StatTile(label: 'Games', value: '128', icon: Icons.sports_esports, color: AppColors.primary),
                  SizedBox(width: 12),
                  StatTile(label: 'Win Rate', value: '72%', icon: Icons.percent, color: AppColors.success),
                  SizedBox(width: 12),
                  StatTile(label: 'Coins', value: '1,240', icon: Icons.monetization_on, color: AppColors.accentGold),
                ],
              ),
              const SizedBox(height: AppSpace.lg),
              Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.card), boxShadow: AppShadow.card),
                child: Column(
                  children: items.map((it) => ListTile(
                        leading: Icon(it.$1, color: AppColors.primary),
                        title: Text(it.$2),
                        trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
                        onTap: it.$3,
                      )).toList(),
                ),
              ),
              const SizedBox(height: AppSpace.lg),
              AppButton(
                label: 'Log Out',
                icon: Icons.logout,
                secondary: true,
                onTap: () async {
                  await context.read<AuthService>().logout();
                  if (context.mounted) context.go('/login');
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
