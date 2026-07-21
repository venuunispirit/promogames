import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../models/game.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../widgets/spinning_logo.dart';
import '../games/registry.dart';

class GamePlayerPage extends StatefulWidget {
  final Game game;
  final String? utmSource;
  const GamePlayerPage({super.key, required this.game, this.utmSource});

  @override
  State<GamePlayerPage> createState() => _GamePlayerPageState();
}

class _GamePlayerPageState extends State<GamePlayerPage> {
  bool _loading = true;
  Map<String, dynamic> _settings = {};
  bool _finished = false;
  String? _sessionToken;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    _settings = {
      'id': widget.game.id,
      'name': widget.game.name,
      'slug': widget.game.slug,
      'category': widget.game.category,
    };
    await _startSession();
    await Future.delayed(const Duration(milliseconds: 700));
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _startSession() async {
    final auth = context.read<AuthService>();
    final playerId = auth.user?.id;
    try {
      final data = await ApiService.post('/play/session/start', {
        'game_id': widget.game.id,
        'player_data': {},
        'source_type': 'link',
        'promo_player_id': playerId,
        'utm_source': widget.utmSource ?? '',
      }, auth: playerId != null);
      _sessionToken = data['session_token']?.toString();
      if (data['already_played'] == true && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('You have already played this game')),
        );
        context.pop();
      }
    } catch (_) {
      // non-blocking
    }
  }

  void _onFinished(int score, int maxScore, bool completed) {
    if (_finished) return;
    _finished = true;
    _reportScore(score, maxScore);
    if (!mounted) return;
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
            onPressed: () {
              if (mounted) context.pop();
            },
            child: const Text('Close', style: TextStyle(color: Color(0xFFa78bfa))),
          ),
        ],
      ),
    ).then((_) {
      if (mounted) context.pop();
    });
  }

  Future<void> _reportScore(int score, int maxScore) async {
    try {
      await ApiService.post('/play/session/complete', {
        'session_token': _sessionToken,
        'score': score,
        'total_scoreable': maxScore,
        'player_data': {},
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const FullScreenSpinner(label: 'Loading game…');
    final builder = gameBuilder(widget.game.category);
    return builder(_settings, _onFinished);
  }
}

class FullScreenSpinner extends StatelessWidget {
  final String label;
  const FullScreenSpinner({super.key, required this.label});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0d0a1a),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SpinningLogo(size: 48),
            const SizedBox(height: 16),
            Text(label, style: const TextStyle(color: Color(0xFFa78bfa), fontSize: 14)),
          ],
        ),
      ),
    );
  }
}
