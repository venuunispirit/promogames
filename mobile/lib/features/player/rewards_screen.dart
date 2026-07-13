import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/data/mock_data.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/cards.dart';
import '../../core/widgets/states.dart';

class RewardsScreen extends StatelessWidget {
  const RewardsScreen({super.key});

  static const categories = ['All', 'Shopping', 'Food', 'Gaming', 'Subscriptions', 'Cashback'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Rewards', style: TextStyle(fontWeight: FontWeight.bold)), automaticallyImplyLeading: false),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: AppSpace.xl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Balance header
              Container(
                margin: const EdgeInsets.all(AppSpace.lg),
                padding: const EdgeInsets.all(AppSpace.lg),
                decoration: BoxDecoration(gradient: AppColors.goldGradient, borderRadius: BorderRadius.circular(AppRadius.card), boxShadow: AppShadow.soft),
                child: Row(
                  children: [
                    const CoinIcon(size: 40),
                    const SizedBox(width: 12),
                    const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Your Balance', style: TextStyle(color: Colors.black87, fontSize: 14)),
                      Text('1,240 PC', style: TextStyle(color: Colors.black, fontSize: 28, fontWeight: FontWeight.bold)),
                    ]),
                    const Spacer(),
                    OutlinedButton(
                      onPressed: () => context.go('/wallet'),
                      style: OutlinedButton.styleFrom(foregroundColor: Colors.black87, side: const BorderSide(color: Colors.black38)),
                      child: const Text('Wallet'),
                    ),
                  ],
                ),
              ),
              // Categories
              SizedBox(
                height: 44,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
                  itemCount: categories.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) => ChoiceChip(label: Text(categories[i]), selected: false, onSelected: (_) {}),
                ),
              ),
              const SizedBox(height: 12),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: const EdgeInsets.all(AppSpace.lg),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 14,
                  crossAxisSpacing: 14,
                  childAspectRatio: 0.72,
                ),
                itemCount: MockData.rewards.length,
                itemBuilder: (_, i) => RewardCard(
                  reward: MockData.rewards[i],
                  onTap: () => context.go('/reward-details', extra: MockData.rewards[i]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
