import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.dark_mode_rounded, 'Dark Mode', true),
      (Icons.notifications_rounded, 'Notifications', true),
      (Icons.language_rounded, 'Language', false),
      (Icons.privacy_tip_rounded, 'Privacy', false),
      (Icons.support_agent_rounded, 'Support', false),
      (Icons.info_rounded, 'About', false),
    ];
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Settings', style: TextStyle(fontWeight: FontWeight.bold)), leading: BackButton(onPressed: () => context.pop())),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpace.lg),
          child: Column(
            children: items.map((it) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.card), boxShadow: AppShadow.card),
              child: SwitchListTile(
                secondary: Icon(it.$1, color: AppColors.primary),
                title: Text(it.$2),
                value: it.$3,
                activeColor: AppColors.primary,
                onChanged: (_) {},
              ),
            )).toList(),
          ),
        ),
      ),
    );
  }
}
