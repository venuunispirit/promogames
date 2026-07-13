import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/data/mock_data.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/cards.dart';
import '../../core/widgets/states.dart';

class GamesScreen extends StatefulWidget {
  const GamesScreen({super.key});

  @override
  State<GamesScreen> createState() => _GamesScreenState();
}

class _GamesScreenState extends State<GamesScreen> {
  String query = '';
  String category = 'All';

  List<GameItem> get filtered {
    return MockData.games.where((g) {
      final matchesQuery = g.name.toLowerCase().contains(query.toLowerCase());
      final matchesCat = category == 'All' || g.category == category;
      return matchesQuery && matchesCat;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Games', style: TextStyle(fontWeight: FontWeight.bold)),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(AppSpace.lg, 0, AppSpace.lg, AppSpace.sm),
              child: Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.button), boxShadow: AppShadow.card),
                child: TextField(
                  onChanged: (v) => setState(() => query = v),
                  decoration: const InputDecoration(
                    hintText: 'Search games…',
                    prefixIcon: Icon(Icons.search, color: AppColors.textSecondary),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
            ),
            SizedBox(
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
                itemCount: MockData.categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final c = MockData.categories[i];
                  final active = c == category;
                  return ChoiceChip(
                    label: Text(c),
                    selected: active,
                    onSelected: (_) => setState(() => category = c),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
            // Featured banner
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
              child: Container(
                padding: const EdgeInsets.all(AppSpace.lg),
                decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(AppRadius.card), boxShadow: AppShadow.soft),
                child: Row(
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Spin & Win', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                          SizedBox(height: 4),
                          Text('Win up to 100 PC today', style: TextStyle(color: Colors.white70, fontSize: 13)),
                        ],
                      ),
                    ),
                    const CoinIcon(size: 40),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: filtered.isEmpty
                  ? const EmptyState(icon: Icons.sports_esports, title: 'No games found', subtitle: 'Try a different search or category')
                  : GridView.builder(
                      padding: const EdgeInsets.all(AppSpace.lg),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 14,
                        crossAxisSpacing: 14,
                        childAspectRatio: 0.78,
                      ),
                      itemCount: filtered.length,
                      itemBuilder: (_, i) => GameCard(
                        game: filtered[i],
                        onTap: () => context.go('/game-details', extra: filtered[i]),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
