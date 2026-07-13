import 'package:flutter/material.dart';
import 'game_contract.dart';

Widget buildStackGame(Map<String, dynamic> settings, GameFinished onFinished) {
  return _StackGame(settings: settings, onFinished: onFinished);
}

class _StackGame extends StatefulWidget {
  final Map<String, dynamic> settings;
  final GameFinished onFinished;
  const _StackGame({required this.settings, required this.onFinished});

  @override
  State<_StackGame> createState() => _StackGameState();
}

class _StackGameState extends State<_StackGame>
    with SingleTickerProviderStateMixin {
  // Positions are fractions (0..1) of the canvas width.
  late List<Block> blocks; // bottom -> top
  late double movingX;
  late double movingW;
  late double dir; // +1 or -1
  late double speed;
  late AnimationController _controller;
  int score = 0;
  bool over = false;

  @override
  void initState() {
    super.initState();
    _reset();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(days: 1),
    )
      ..addListener(_tick)
      ..repeat();
  }

  void _reset() {
    blocks = [Block(x: 0.2, w: 0.6)];
    movingW = 0.6;
    movingX = 0.0;
    dir = 1;
    speed = 0.006;
    score = 0;
    over = false;
  }

  void _tick() {
    if (over) return;
    setState(() {
      movingX += dir * speed;
      if (movingX <= 0) {
        movingX = 0;
        dir = 1;
      } else if (movingX + movingW >= 1) {
        movingX = 1 - movingW;
        dir = -1;
      }
    });
  }

  void _drop() {
    if (over) return;
    setState(() {
      final prev = blocks.last;
      final left = movingX < prev.x ? prev.x : movingX;
      final right = (movingX + movingW) < (prev.x + prev.w)
          ? (movingX + movingW)
          : (prev.x + prev.w);
      final overlap = right - left;
      if (overlap <= 0.001) {
        over = true;
        _controller.stop();
        Future.delayed(const Duration(milliseconds: 600), () {
          widget.onFinished(score, score, true);
        });
        return;
      }
      blocks.add(Block(x: left, w: overlap));
      score++;
      movingW = overlap;
      movingX = 0;
      dir = 1;
      speed += 0.0015;
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.settings['name'] ?? 'Stack';
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
              padding: const EdgeInsets.all(12),
              child: Text('Stacked: $score',
                  style: const TextStyle(color: Color(0xFF22c55e), fontSize: 18)),
            ),
            Expanded(
              child: GestureDetector(
                onTap: _drop,
                child: LayoutBuilder(
                  builder: (ctx, c) {
                    final w = c.maxWidth;
                    final h = c.maxHeight;
                    final levels = blocks.length + 2;
                    final bh = h / levels;
                    return CustomPaint(
                      painter: _StackPainter(blocks, movingX, movingW,
                          blocks.length, bh, over),
                      size: Size(w, h),
                    );
                  },
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(
                over ? 'TOPPLED!' : 'Tap to drop the block',
                style: TextStyle(
                  color: over ? Colors.red : Colors.white54,
                  fontSize: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class Block {
  final double x;
  final double w;
  Block({required this.x, required this.w});
}

class _StackPainter extends CustomPainter {
  final List<Block> blocks;
  final double movingX;
  final double movingW;
  final int level;
  final double bh;
  final bool over;
  _StackPainter(this.blocks, this.movingX, this.movingW, this.level, this.bh, this.over);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint();
    for (int i = 0; i < blocks.length; i++) {
      final b = blocks[i];
      final y = size.height - (i + 1) * bh;
      paint.color =
          (i % 2 == 0) ? const Color(0xFF8b5cf6) : const Color(0xFF22c55e);
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(b.x * size.width, y, b.w * size.width, bh - 2),
          const Radius.circular(4),
        ),
        paint,
      );
    }
    final my = size.height - (level + 1) * bh;
    paint.color = over ? Colors.red : const Color(0xFF8b5cf6);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(movingX * size.width, my, movingW * size.width, bh - 2),
        const Radius.circular(4),
      ),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => true;
}
