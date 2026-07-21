import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/data/mock_data.dart';
import '../../services/player_provider.dart';
import '../../core/widgets/app_button.dart';
import '../../services/auth_service.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.history_rounded, 'History', () => context.push('/wallet')),
      (Icons.emoji_events_rounded, 'Achievements', () => context.push('/achievements')),
      (Icons.task_alt_rounded, 'Challenges', () => context.push('/challenges')),
      (Icons.group_add_rounded, 'Referral', () => context.push('/referral')),
      (Icons.settings_rounded, 'Settings', () => context.push('/settings')),
      (Icons.help_outline_rounded, 'Help & Support', () => context.push('/settings/support')),
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
                child: Consumer<PlayerProvider>(
                  builder: (_, prov, __) {
                    final avatarId = prov.user?.avatarId ?? 'av-3';
                    // Match React avatars
                    const avatars = [
                      {'id': 'av-1', 'label': 'Phoenix', 'gradient': [Color(0xFFf97316), Color(0xFFdc2626)], 'emoji': '🔥'},
                      {'id': 'av-2', 'label': 'Neon Cat', 'gradient': [Color(0xFFec4899), Color(0xFF8b5cf6)], 'emoji': '🐱'},
                      {'id': 'av-3', 'label': 'Cosmic Owl', 'gradient': [Color(0xFF6366f1), Color(0xFF0ea5e9)], 'emoji': '🦉'},
                      {'id': 'av-4', 'label': 'Cyber Robot', 'gradient': [Color(0xFF14b8a6), Color(0xFF22d3ee)], 'emoji': '🤖'},
                      {'id': 'av-5', 'label': 'Golden Crown', 'gradient': [Color(0xFFf59e0b), Color(0xFFf97316)], 'emoji': '👑'},
                      {'id': 'av-6', 'label': 'Electric Wolf', 'gradient': [Color(0xFF8b5cf6), Color(0xFFec4899)], 'emoji': '🐺'},
                    ];
                    final avIndex = avatars.indexWhere((a) => a['id'] == avatarId);
                    final av = avatars[avIndex >= 0 ? avIndex : 2];
                    final gradient = av['gradient'] as List<Color>;
                    return Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(colors: gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
                        boxShadow: [BoxShadow(color: gradient[1].withAlpha(80), blurRadius: 16)],
                      ),
                      child: Center(child: Text(av['emoji'] as String, style: const TextStyle(fontSize: 44))),
                    );
                  },
                ),
              ),
              const SizedBox(height: 12),
              Consumer<PlayerProvider>(
                builder: (_, prov, __) {
                  final name = prov.user?.username ?? MockData.username;
                  final email = prov.user?.email ?? '';
                  final balance = prov.pcBalance;
                  return Column(
                    children: [
                      Text(name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                      Text(email.isNotEmpty ? email : 'No email', style: const TextStyle(color: AppColors.textSecondary)),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          StatTile(label: 'Coins', value: '$balance', icon: Icons.monetization_on, color: AppColors.accentGold),
                        ],
                      ),
                    ],
                  );
                },
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
