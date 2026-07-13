import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/widgets/app_button.dart';

class ReferralPage extends StatelessWidget {
  const ReferralPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Invite Friends', style: TextStyle(fontWeight: FontWeight.bold)), leading: BackButton(onPressed: () => context.pop())),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpace.lg),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpace.lg),
                decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(AppRadius.card), boxShadow: AppShadow.soft),
                child: const Column(children: [
                  Icon(Icons.group_add_rounded, color: Colors.white, size: 48),
                  SizedBox(height: 10),
                  Text('Invite & Earn 50 PC', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  SizedBox(height: 6),
                  Text('Both you and your friend get 50 PC on signup', style: TextStyle(color: Colors.white70, fontSize: 13), textAlign: TextAlign.center),
                ]),
              ),
              const SizedBox(height: AppSpace.lg),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.card), boxShadow: AppShadow.card),
                child: Row(children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Your code', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    Text('MUZA50', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 22, color: AppColors.primary)),
                  ])),
                  IconButton(onPressed: () {}, icon: const Icon(Icons.copy, color: AppColors.primary)),
                ]),
              ),
              const SizedBox(height: AppSpace.lg),
              Row(children: const [
                Expanded(child: _Stat(value: '3', label: 'Friends joined')),
                SizedBox(width: 12),
                Expanded(child: _Stat(value: '150', label: 'PC earned')),
              ]),
              const SizedBox(height: AppSpace.lg),
              AppButton(label: 'Share Invite Link', icon: Icons.share, onTap: () {}),
            ],
          ),
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String value;
  final String label;
  const _Stat({required this.value, required this.label});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.card), boxShadow: AppShadow.card),
      child: Column(children: [Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)), Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12))]),
    );
  }
}
