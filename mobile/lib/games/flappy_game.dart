import 'dart:async';
import 'package:flutter/material.dart';
import 'game_contract.dart';

Widget buildFlappyGame(Map<String, dynamic> settings, GameFinished onFinished) {
  return _FlappyGame(settings: settings, onFinished: onFinished);
}

class _FlappyGame extends StatefulWidget {
  final Map<String, dynamic> settings;
  final GameFinished onFinished;
  const _FlappyGame({required this.settings, required this.onFinished});

  @override
  State<_FlappyGame> createState() => _FlappyGameState();
}

class _FlappyGameState extends State<_FlappyGame> {
  static const double w = 360;
  static const double h = 560;
  static const double gw = 30;
  late double birdY;
  late double birdV;
  late List<Pipe> pipes;
  int score = 0;
  bool over = false;
  bool started = false;
  late Timer timer;

  @override
  void initState() {
    super.initState();
    _reset();
    timer = Timer.periodic(const Duration(milliseconds: 16), (_) => _tick());
  }

  void _reset() {
    birdY = h / 2;
    birdV = 0;
    pipes = [
      Pipe(w + 40, 120.0 + (DateTime.now().microsecond % 120), 170.0),
      Pipe(w + 260, 90.0 + (DateTime.now().millisecond % 120), 170.0),
    ];
    over = false;
    started = false;
  }

  void _flap() {
    if (over) return;
    setState(() {
      if (!started) started = true;
      birdV = -6.0;
    });
  }

  void _tick() {
    if (over || !started) return;
    setState(() {
      birdV += 0.32;
      birdY += birdV;
      if (birdY < 0 || birdY > h) {
        _gameOver();
        return;
      }
      for (final p in pipes) {
        p.x -= 2.4;
        final by = birdY;
        if (p.x < gw + 8 && p.x + 50 > gw - 8) {
          if (by < p.gapTop || by > p.gapTop + p.gap) {
            _gameOver();
            return;
          }
        }
        if (!p.passed && p.x + 50 < gw) {
          p.passed = true;
          score++;
        }
      }
      if (pipes.first.x < -60) {
        pipes.removeAt(0);
        final last = pipes.last;
        final gt = 70.0 + (DateTime.now().microsecond % 180);
        pipes.add(Pipe(last.x + 200.0, gt, 170.0));
      }
    });
  }

  void _gameOver() {
    over = true;
    Future.delayed(const Duration(milliseconds: 200),
        () => widget.onFinished(score, score, true));
  }

  @override
  void dispose() {
    timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.settings['name'] ?? 'Flappy';
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        backgroundColor: const Color(0xFF0d0a1a),
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => widget.onFinished(score, score, false),
          )
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
          children: [
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text('Score: $score',
                  style: const TextStyle(
                      color: Color(0xFF22c55e), fontSize: 18)),
            ),
            Center(
              child: GestureDetector(
                onTap: _flap,
                child: SizedBox(
                  width: w,
                  height: h,
                  child: CustomPaint(
                    painter: _FlappyPainter(birdY, pipes, gw),
                  ),
                ),
              ),
            ),
            if (!started)
              const Text('Tap to flap',
                  style: TextStyle(color: Color(0xFF8b5cf6))),
            if (over)
              const Padding(
                padding: EdgeInsets.all(4),
                child: Text('GAME OVER',
                    style: TextStyle(color: Colors.red, fontSize: 22)),
              ),
            IconButton(
              icon: const Icon(Icons.replay, color: Color(0xFF8b5cf6)),
              onPressed: () => setState(_reset),
            ),
          ],
        ),
      ),
    );
  }
}

class Pipe {
  double x;
  double gapTop;
  double gap;
  bool passed;
  Pipe(this.x, this.gapTop, this.gap) : passed = false;
}

class _FlappyPainter extends CustomPainter {
  final double birdY;
  final List<Pipe> pipes;
  final double gw;
  _FlappyPainter(this.birdY, this.pipes, this.gw);

  @override
  void paint(Canvas canvas, Size size) {
    final bp = Paint()..color = const Color(0xFF22c55e);
    canvas.drawCircle(Offset(gw, birdY), 11, bp);
    final pp = Paint()..color = const Color(0xFF8b5cf6);
    for (final p in pipes) {
      canvas.drawRect(Rect.fromLTWH(p.x, 0, 50, p.gapTop), pp);
      canvas.drawRect(
          Rect.fromLTWH(p.x, p.gapTop + p.gap, 50, size.height), pp);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => true;
}
