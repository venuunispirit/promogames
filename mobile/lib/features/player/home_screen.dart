import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/data/mock_data.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/cards.dart';
import '../../core/widgets/states.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: AppSpace.xl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _Header(),
              const SizedBox(height: AppSpace.lg),
              _Hero(),
              const SizedBox(height: AppSpace.lg),
              _QuickActions(),
              const SizedBox(height: AppSpace.lg),
              _DailyGoals(),
              const SizedBox(height: AppSpace.lg),
              _HorizontalGames(title: 'Continue Playing', games: MockData.games.take(4).toList(), onMore: () => context.go('/games')),
              const SizedBox(height: AppSpace.lg),
              _HorizontalGames(title: 'Featured Games', games: MockData.games.skip(4).take(5).toList(), onMore: () => context.go('/games')),
              const SizedBox(height: AppSpace.lg),
              _AchievementsPreview(),
              const SizedBox(height: AppSpace.lg),
              _LeaderboardPreview(onMore: () => context.go('/leaderboard')),
              const SizedBox(height: AppSpace.lg),
              _RewardPreview(onMore: () => context.go('/rewards')),
            ],
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpace.lg, AppSpace.md, AppSpace.lg, 0),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Hi, ${MockData.username} 👋',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                const Text('Ready to earn more Promo Coins?',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
              ],
            ),
          ),
          IconButton(
            onPressed: () => context.go('/notifications'),
            icon: const Icon(Icons.notifications_outlined),
            style: IconButton.styleFrom(backgroundColor: Colors.white, padding: const EdgeInsets.all(10)),
          ),
          const SizedBox(width: 10),
          const CoinPill(balance: 1240),
        ],
      ),
    );
  }
}

class _Hero extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
      padding: const EdgeInsets.all(AppSpace.lg),
      decoration: BoxDecoration(
        gradient: AppColors.heroGradient,
        borderRadius: BorderRadius.circular(AppRadius.card),
        boxShadow: AppShadow.soft,
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Coin Balance', style: TextStyle(color: Colors.white70, fontSize: 14)),
                    const SizedBox(height: 4),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const CoinIcon(size: 26),
                        const SizedBox(width: 8),
                        const Text('1,240',
                            style: TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.bold)),
                        const Text(' PC', style: TextStyle(color: Colors.white70, fontSize: 18)),
                      ],
                    ),
                    const SizedBox(height: 14),
                    const Text('Level 7', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: LinearProgressIndicator(
                        value: 0.64,
                        minHeight: 8,
                        backgroundColor: Colors.white.withAlpha(30),
                        valueColor: const AlwaysStoppedAnimation(Colors.white),
                      ).animate().scale(begin: const Offset(0, 1), end: const Offset(1, 1), duration: 900.ms, curve: Curves.easeOut, alignment: Alignment.centerLeft),
                    ),
                    const SizedBox(height: 4),
                    const Text('640 / 1,000 XP to Level 8', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Stack(
                alignment: Alignment.center,
                children: [
                  ...List.generate(6, (i) => Positioned(
                        left: 20 + 30 * (i % 2),
                        top: 10 + 40 * (i / 2),
                        child: Container(width: 5, height: 5, decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle))
                            .animate(onPlay: (c) => c.repeat())
                            .fadeIn(duration: 800.ms, delay: (i * 150).ms).fadeOut(delay: (i * 150 + 600).ms),
                      )),
                  const CoinIcon(size: 84),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppSpace.lg),
          Row(
            children: [
              Expanded(child: AppButton(label: 'Play Games', icon: Icons.play_arrow, onTap: () => context.go('/games'))),
              const SizedBox(width: 12),
              Expanded(
                child: AppButton(
                  label: 'Redeem',
                  icon: Icons.card_giftcard,
                  secondary: true,
                  onTap: () => context.go('/rewards'),
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).moveY(begin: 12, end: 0, duration: 400.ms);
  }
}

class _QuickActions extends StatelessWidget {
  static const _items = [
    (Icons.sports_esports_rounded, 'Play', AppColors.primary),
    (Icons.card_giftcard_rounded, 'Rewards', AppColors.accentGold),
    (Icons.leaderboard_rounded, 'Ranks', AppColors.secondaryPurple),
    (Icons.group_add_rounded, 'Invite', AppColors.success),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
      child: Row(
        children: _items.map((it) {
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6),
              child: InkWell(
                borderRadius: BorderRadius.circular(AppRadius.card),
                onTap: () {
                  if (it.$2 == 'Play') context.go('/games');
                  if (it.$2 == 'Rewards') context.go('/rewards');
                  if (it.$2 == 'Ranks') context.go('/leaderboard');
                  if (it.$2 == 'Invite') context.go('/referral');
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(AppRadius.card),
                    boxShadow: AppShadow.card,
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: it.$3.withAlpha(16),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Icon(it.$1, color: it.$3),
                      ),
                      const SizedBox(height: 8),
                      Text(it.$2, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _DailyGoals extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
      child: Container(
        padding: const EdgeInsets.all(AppSpace.lg),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.card), boxShadow: AppShadow.card),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.local_fire_department, color: AppColors.warning),
                const SizedBox(width: 8),
                const Text('Daily Goals', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: AppColors.warning.withAlpha(18), borderRadius: BorderRadius.circular(AppRadius.pill)),
                  child: const Text('🔥 5 day streak', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _GoalRow(label: 'Play 1 game', progress: 1.0, reward: '10 PC', done: true),
            const SizedBox(height: 10),
            _GoalRow(label: 'Earn 100 PC', progress: 0.64, reward: '20 PC', done: false),
            const SizedBox(height: 14),
            AppButton(
              label: 'Claim Daily Bonus',
              icon: Icons.check_circle,
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }
}

class _GoalRow extends StatelessWidget {
  final String label;
  final double progress;
  final String reward;
  final bool done;
  const _GoalRow({required this.label, required this.progress, required this.reward, required this.done});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(done ? Icons.check_circle : Icons.radio_button_unchecked, color: done ? AppColors.success : AppColors.textSecondary),
        const SizedBox(width: 10),
        Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w500))),
        SizedBox(width: 90, child: ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(value: progress, minHeight: 6, backgroundColor: AppColors.surfaceVariant, valueColor: const AlwaysStoppedAnimation(AppColors.primary)),
        )),
        const SizedBox(width: 10),
        Text(reward, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _HorizontalGames extends StatelessWidget {
  final String title;
  final List<GameItem> games;
  final VoidCallback onMore;
  const _HorizontalGames({required this.title, required this.games, required this.onMore});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
          child: SectionHeader(title: title, onViewAll: onMore),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 250,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
            itemCount: games.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (_, i) => SizedBox(
              width: 170,
              child: GameCard(
                game: games[i],
                onTap: () => context.go('/game-details', extra: games[i]),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _AchievementsPreview extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final items = MockData.achievements.take(4).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
          child: SectionHeader(title: 'Achievements', onViewAll: () => context.go('/achievements')),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 150,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (_, i) => SizedBox(width: 130, child: AchievementMedal(achievement: items[i])),
          ),
        ),
      ],
    );
  }
}

class _LeaderboardPreview extends StatelessWidget {
  final VoidCallback onMore;
  const _LeaderboardPreview({required this.onMore});

  @override
  Widget build(BuildContext context) {
    final top = MockData.leaderboard.take(3).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
          child: SectionHeader(title: 'Top Players', onViewAll: onMore),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
          child: Row(
            children: top.asMap().entries.map((e) {
              final entry = e.value;
              final rank = e.key + 1;
              final medal = [AppColors.accentGold, AppColors.textSecondary, const Color(0xFFCD7F32)][e.key];
              return Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 5),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.card), boxShadow: AppShadow.card),
                  child: Column(
                    children: [
                      Stack(
                        alignment: Alignment.topRight,
                        children: [
                          CircleAvatar(radius: 22, backgroundColor: AppColors.primary.withAlpha(24), child: Text(entry.avatar, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary))),
                          CircleAvatar(radius: 9, backgroundColor: medal, child: Text('$rank', style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold))),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(entry.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                      const SizedBox(height: 2),
                      Text('${entry.coins}', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _RewardPreview extends StatelessWidget {
  final VoidCallback onMore;
  const _RewardPreview({required this.onMore});

  @override
  Widget build(BuildContext context) {
    final items = MockData.rewards.take(4).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
          child: SectionHeader(title: 'Reward Store', onViewAll: onMore),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 230,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (_, i) => SizedBox(
              width: 160,
              child: RewardCard(reward: items[i], onTap: () => context.go('/reward-details', extra: items[i]), compact: true),
            ),
          ),
        ),
      ],
    );
  }
}
