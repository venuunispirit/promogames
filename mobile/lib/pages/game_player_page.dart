import 'package:flutter/material.dart';
import '../models/game.dart';
import '../services/api_service.dart';
import '../widgets/spinning_logo.dart';
import '../games/game_contract.dart';
import '../games/registry.dart';

class GamePlayerPage extends StatefulWidget {
  final Game game;
  const GamePlayerPage({super.key, required this.game});

  @override
  State<GamePlayerPage> createState() => _GamePlayerPageState();
}

class _GamePlayerPageState extends State<GamePlayerPage> {
  bool _loading = true;
  Map<String, dynamic> _settings = {};
  bool _finished = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    // Best-effort: try to enrich settings from the game payload passed in.
    _settings = {
      'id': widget.game.id,
      'name': widget.game.name,
      'slug': widget.game.slug,
      'category': widget.game.category,
      'game_type': widget.game.category,
    };
    // Simulate asset/game load so the spinning logo shows, matching the web feel.
    await Future.delayed(const Duration(milliseconds: 700));
    if (mounted) setState(() => _loading = false);
  }

  void _onFinished(int score, int maxScore, bool completed) {
    if (_finished) return;
    _finished = true;
    _reportScore(score, maxScore);
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF1a0e2e),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Game Over', style: TextStyle(color: Color(0xFFf0ecff))),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SpinningLogo(size: 48),
            const SizedBox(height: 16),
            Text('Score: $score${maxScore > 0 ? ' / $maxScore' : ''}',
                style: const TextStyle(color: Color(0xFFa78bfa), fontSize: 20, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close', style: TextStyle(color: Color(0xFFa78bfa))),
          ),
        ],
      ),
    ).then((_) {
      if (mounted) Navigator.pop(context);
    });
  }

  // Best-effort score reporting. Does not block the UX if the backend
  // session endpoint is unavailable.
  Future<void> _reportScore(int score, int maxScore) async {
    try {
      await ApiService.post('/play/session/complete', {
        'game_id': widget.game.id,
        'score': score,
        'total_scoreable': maxScore,
        'completed': true,
      });
    } catch (_) {
      // ignore — non-blocking
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const FullScreenSpinner(label: 'Loading game…');
    final builder = gameBuilder(widget.game.category);
    return builder(_settings, _onFinished);
  }
}
