import 'dart:async';
import 'package:flutter/material.dart';
import 'game_contract.dart';

Widget buildSnakeGame(Map<String, dynamic> settings, GameFinished onFinished) {
  return _SnakeGame(settings: settings, onFinished: onFinished);
}

class _SnakeGame extends StatefulWidget {
  final Map<String, dynamic> settings;
  final GameFinished onFinished;
  const _SnakeGame({required this.settings, required this.onFinished});

  @override
  State<_SnakeGame> createState() => _SnakeGameState();
}

class _SnakeGameState extends State<_SnakeGame> {
  static const int cols = 18;
  static const int rows = 22;
  late List<Point> snake;
  late Point dir;
  late Point food;
  late Timer timer;
  int score = 0;
  bool dead = false;

  @override
  void initState() {
    super.initState();
    _reset();
    timer = Timer.periodic(const Duration(milliseconds: 110), (_) => _tick());
  }

  void _reset() {
    snake = [Point(5, 10), Point(4, 10), Point(3, 10)];
    dir = Point(1, 0);
    _placeFood();
  }

  void _placeFood() {
    final rnd = (DateTime.now().microsecondsSinceEpoch);
    int x, y;
    do {
      x = (rnd ~/ (snake.length + 1) + score) % cols;
      y = (rnd + score * 7) % rows;
    } while (snake.any((s) => s.x == x && s.y == y));
    food = Point(x, y);
  }

  void _tick() {
    if (dead) return;
    setState(() {
      final head = snake.first;
      final next = Point(head.x + dir.x, head.y + dir.y);
      if (next.x < 0 || next.x >= cols || next.y < 0 || next.y >= rows ||
          snake.any((s) => s.x == next.x && s.y == next.y)) {
        _gameOver();
        return;
      }
      snake.insert(0, next);
      if (next.x == food.x && next.y == food.y) {
        score++;
        _placeFood();
      } else {
        snake.removeLast();
      }
    });
  }

  void _gameOver() {
    dead = true;
    timer.cancel();
    Future.delayed(const Duration(milliseconds: 300), () {
      widget.onFinished(score, score, true);
    });
  }

  void _setDir(Point d) {
    if (dead) return;
    if (d.x != -dir.x || d.y != -dir.y) dir = d;
  }

  @override
  void dispose() {
    timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.settings['name'] ?? 'Snake';
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
                  style: const TextStyle(color: Color(0xFF22c55e), fontSize: 18)),
            ),
            Expanded(
              child: LayoutBuilder(
                builder: (ctx, c) {
                  final w = c.maxWidth;
                  final h = c.maxHeight;
                  final cell = (w < h ? w / cols : h / rows);
                  return Center(
                    child: SizedBox(
                      width: cell * cols,
                      height: cell * rows,
                      child: GestureDetector(
                        onVerticalDragEnd: (d) {
                          if (d.primaryVelocity! < 0) _setDir(Point(0, -1));
                          else if (d.primaryVelocity! > 0) _setDir(Point(0, 1));
                        },
                        onHorizontalDragEnd: (d) {
                          if (d.primaryVelocity! < 0) _setDir(Point(-1, 0));
                          else if (d.primaryVelocity! > 0) _setDir(Point(1, 0));
                        },
                        child: CustomPaint(
                          painter: _SnakePainter(snake, food, cell),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            if (dead)
              const Padding(
                padding: EdgeInsets.all(8),
                child: Text('GAME OVER',
                    style: TextStyle(color: Colors.red, fontSize: 22)),
              ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _dirBtn(Icons.arrow_upward, () => _setDir(Point(0, -1))),
                Column(
                  children: [
                    _dirBtn(Icons.arrow_back, () => _setDir(Point(-1, 0))),
                    _dirBtn(Icons.arrow_forward, () => _setDir(Point(1, 0))),
                  ],
                ),
                _dirBtn(Icons.arrow_downward, () => _setDir(Point(0, 1))),
              ],
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _dirBtn(IconData i, VoidCallback f) => IconButton(
        icon: Icon(i, color: const Color(0xFF8b5cf6)),
        onPressed: f,
      );
}

class Point {
  final int x, y;
  Point(this.x, this.y);
}

class _SnakePainter extends CustomPainter {
  final List<Point> snake;
  final Point food;
  final double cell;
  _SnakePainter(this.snake, this.food, this.cell);

  @override
  void paint(Canvas canvas, Size size) {
    final grid = Paint()..color = const Color(0xFF1a0e2e);
    canvas.drawRect(
        Rect.fromLTWH(0, 0, size.width, size.height),
        Paint()..color = const Color(0xFF080612));
    for (int i = 0; i < snake.length; i++) {
      final s = snake[i];
      grid.color = i == 0 ? const Color(0xFF22c55e) : const Color(0xFF8b5cf6);
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(s.x * cell, s.y * cell, cell - 1, cell - 1),
          const Radius.circular(3),
        ),
        grid,
      );
    }
    final f = Paint()..color = Colors.red;
    canvas.drawCircle(
        Offset(food.x * cell + cell / 2, food.y * cell + cell / 2),
        cell / 2 - 2,
        f);
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => true;
}
