import 'package:flutter/material.dart';
import 'game_contract.dart';

/// Generic playable native game used as a fallback for any game type that does
/// not yet have a dedicated native implementation. It is a real, scoreable
/// "tap the targets" mini-game so the app stays fully functional everywhere.
Widget buildFallbackGame(Map<String, dynamic> settings, GameFinished onFinished) {
  return _FallbackGame(onFinished: onFinished);
}

class _FallbackGame extends StatefulWidget {
  final GameFinished onFinished;
  const _FallbackGame({required this.onFinished});

  @override
  State<_FallbackGame> createState() => _FallbackGameState();
}

class _FallbackGameState extends State<_FallbackGame> {
  int score = 0;
  int taps = 0;
  static const int total = 12;
  final List<Offset> targets = [];
  final GlobalKey stackKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _spawn());
  }

  void _spawn() {
    final box = stackKey.currentContext?.findRenderObject() as RenderBox?;
    if (box == null) return;
    final size = box.size;
    setState(() {
      targets.clear();
      final rnd = (score * 7 + taps * 3 + 1) % 100;
      targets.add(Offset(
        (rnd / 100) * (size.width - 80) + 20,
        ((rnd * 1.7) % 100) / 100 * (size.height - 120) + 60,
      ));
    });
  }

  void _hit() {
    setState(() {
      score += 10;
      taps += 1;
    });
    if (taps >= total) {
      widget.onFinished(score, total * 10, true);
    } else {
      _spawn();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0d0a1a),
      appBar: AppBar(
        title: const Text('Quick Tap'),
        backgroundColor: Colors.transparent,
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Text('$score / ${total * 10}',
                  style: const TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
      body: Stack(
        key: stackKey,
        children: [
          Center(
            child: Text(
              taps >= total ? 'Done!' : 'Tap the orbs! ($taps/$total)',
              style: const TextStyle(color: Color(0xFFb0a0d0)),
            ),
          ),
          ...targets.map((p) => Positioned(
                left: p.dx,
                top: p.dy,
                child: GestureDetector(
                  onTap: _hit,
                  child: Container(
                    width: 60,
                    height: 60,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [Color(0xFF8b5cf6), Color(0xFF22c55e)],
                      ),
                      boxShadow: [BoxShadow(color: Color(0x667c3aed), blurRadius: 20)],
                    ),
                  ),
                ),
              )),
        ],
      ),
    );
  }
}
