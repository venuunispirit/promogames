import 'package:flutter/material.dart';
import 'game_contract.dart';

Widget buildStressBusterGame(
    Map<String, dynamic> settings, GameFinished onFinished) {
  return _SbGame(settings: settings, onFinished: onFinished);
}

class _SbGame extends StatefulWidget {
  final Map<String, dynamic> settings;
  final GameFinished onFinished;
  const _SbGame({required this.settings, required this.onFinished});

  @override
  State<_SbGame> createState() => _SbGameState();
}

class _SbGameState extends State<_SbGame> with TickerProviderStateMixin {
  late AnimationController _breath;
  int relief = 0;
  int breaths = 0;
  bool finished = false;

  @override
  void initState() {
    super.initState();
    _breath = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat(reverse: true);
  }

  String _phase() {
    final v = _breath.value;
    if (v < 0.45) return 'Breathe in...';
    if (v < 0.55) return 'Hold';
    return 'Breathe out...';
  }

  void _tapBreath() {
    if (finished) return;
    relief++;
    if (relief % 4 == 0) breaths++;
    setState(() {});
  }

  void _finish() {
    if (finished) return;
    finished = true;
    widget.onFinished(relief, 0, false);
  }

  @override
  void dispose() {
    _breath.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.settings['name'] ?? 'Stress Buster';
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        backgroundColor: const Color(0xFF0d0a1a),
        actions: [
          IconButton(icon: const Icon(Icons.close), onPressed: _finish),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0d0a1a),
              Color(0xFF1a0e2e),
              Color(0xFF0f0b1e),
              Color(0xFF080612),
            ],
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            const Text('Follow the circle. Tap as you breathe.',
                style: TextStyle(color: Colors.white70, fontSize: 16)),
            AnimatedBuilder(
              animation: _breath,
              builder: (ctx, _) {
                final size = 80 + _breath.value * 180;
                return GestureDetector(
                  onTap: _tapBreath,
                  child: Container(
                    width: size,
                    height: size,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          const Color(0xFF22c55e).withOpacity(0.8),
                          const Color(0xFF8b5cf6).withOpacity(0.3),
                        ],
                      ),
                      border: Border.all(
                        color: const Color(0xFF8b5cf6), width: 3),
                    ),
                    child: Center(
                      child: Text(
                        _phase(),
                        style: const TextStyle(
                            color: Colors.white, fontSize: 18),
                      ),
                    ),
                  ),
                );
              },
            ),
            Column(
              children: [
                Text('Relief taps: $relief',
                    style: const TextStyle(
                        color: Color(0xFF22c55e), fontSize: 20)),
                Text('Breaths: $breaths',
                    style: const TextStyle(
                        color: Color(0xFF8b5cf6), fontSize: 16)),
                const SizedBox(height: 12),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8b5cf6),
                  ),
                  onPressed: _finish,
                  child: const Text('Finish session'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
