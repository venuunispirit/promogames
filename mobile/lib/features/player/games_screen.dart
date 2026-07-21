import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../services/player_provider.dart';
import '../../core/data/mock_data.dart';
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

  List<Map<String, dynamic>> get _allGames =>
    context.watch<PlayerProvider>().brandedGames +
    context.watch<PlayerProvider>().promoGames;

  List<Map<String, dynamic>> get filtered {
    final games = _allGames;
    return games.where((g) {
      final name = (g['name'] as String? ?? '').toLowerCase();
      final cat = (g['category'] as String? ?? '');
      final matchesQuery = name.contains(query.toLowerCase());
      final matchesCat = category == 'All' || cat.toLowerCase() == category.toLowerCase();
      return matchesQuery && matchesCat;
    }).toList();
  }

  List<String> get _categories {
    final cats = <String>{'All'};
    for (final g in _allGames) {
      final c = g['category'] as String?;
      if (c != null && c.isNotEmpty) cats.add(c);
    }
    return cats.toList();
  }

  Future<void> _onRefresh() async {
    await context.read<PlayerProvider>().loadAll();
  }

  @override
  Widget build(BuildContext context) {
    final games = _allGames;
    final cats = _categories;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Games', style: TextStyle(fontWeight: FontWeight.bold)),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: games.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _onRefresh,
              color: AppColors.primary,
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
                    itemCount: cats.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (_, i) {
                      final c = cats[i];
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
                          itemBuilder: (_, i) {
                            final g = filtered[i];
                            return GameCard(
                              game: GameItem(
                                id: g['id']?.toString() ?? '',
                                name: g['name'] ?? '',
                                category: g['category'] ?? '',
                                reward: '+${g['game_type'] == 'branded' ? '50' : '10'} PC',
                                playTime: '',
                                difficulty: '',
                                completionRate: 0,
                                gradient: [Colors.purple, Colors.indigo],
                                icon: Icons.sports_esports,
                              ),
                              onTap: () => context.push('/games/details', extra: GameItem(
                                id: g['id']?.toString() ?? '',
                                name: g['name'] ?? '',
                                category: g['category'] ?? '',
                                reward: '',
                                playTime: '',
                                difficulty: '',
                                completionRate: 0,
                                gradient: [Colors.purple, Colors.indigo],
                                icon: Icons.sports_esports,
                              )),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
      ),
    );
  }
}
