import 'package:flutter/material.dart';
import 'game_contract.dart';

const _bg = LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [Color(0xFF0d0a1a), Color(0xFF1a0e2e), Color(0xFF0f0b1e), Color(0xFF080612)],
);
const _purple = Color(0xFF8b5cf6);
const _green = Color(0xFF22c55e);

Widget buildWhackamoleGame(Map<String, dynamic> settings, GameFinished onFinished) {
  return _WhackamoleGame(settings: settings, onFinished: onFinished);
}

class _WhackamoleGame extends StatefulWidget {
  final Map<String, dynamic> settings;
  final GameFinished onFinished;
  const _WhackamoleGame({required this.settings, required this.onFinished});

  @override
  State<_WhackamoleGame> createState() => _WhackamoleGameState();
}

class _WhackamoleGameState extends State<_WhackamoleGame> {
  static const _cells = 9;
  static const _duration = 20;
  final List<bool> _moles = List.filled(_cells, false);
  int _score = 0;
  int _timeLeft = _duration;
  bool _running = false;
  int _tick = 0;

  int get _maxScore => _duration * 2;

  void _start() {
    setState(() {
      _score = 0;
      _timeLeft = _duration;
      _running = true;
      for (var i = 0; i < _cells; i++) {
        _moles[i] = false;
      }
    });
    _loop();
    _countdown();
  }

  void _countdown() {
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted || !_running) return;
      setState(() => _timeLeft--);
      if (_timeLeft <= 0) {
        _end();
      } else {
        _countdown();
      }
    });
  }

  void _loop() {
    Future.delayed(const Duration(milliseconds: 700), () {
      if (!mounted || !_running) return;
      setState(() {
        _tick++;
        for (var i = 0; i < _cells; i++) {
          _moles[i] = false;
        }
        final active = ((_tick * 7 + DateTime.now().millisecond) % _cells);
        _moles[active] = true;
        if (_cells > 3) {
          final second = ((_tick * 13 + 3) % _cells);
          if (second != active) _moles[second] = true;
        }
      });
      _loop();
    });
  }

  void _whack(int i) {
    if (!_running || !_moles[i]) return;
    setState(() {
      _moles[i] = false;
      _score++;
    });
  }

  void _end() {
    setState(() {
      _running = false;
      for (var i = 0; i < _cells; i++) {
        _moles[i] = false;
      }
    });
    widget.onFinished(_score, _maxScore, true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1a0e2e),
        title: Text(widget.settings['name'] ?? 'Game'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            widget.onFinished(_score, _maxScore, false);
            Navigator.of(context).maybePop();
          },
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: _bg),
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Score: $_score',
                    style: const TextStyle(color: _green, fontSize: 20, fontWeight: FontWeight.bold)),
                Text('Time: $_timeLeft',
                    style: const TextStyle(color: _purple, fontSize: 20, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: _cells,
                itemBuilder: (context, i) {
                  final up = _moles[i];
                  return GestureDetector(
                    onTap: () => _whack(i),
                    child: Container(
                      decoration: BoxDecoration(
                        color: up ? _green.withOpacity(0.4) : Colors.white10,
                        shape: BoxShape.circle,
                        border: Border.all(color: up ? _green : _purple, width: 3),
                      ),
                      child: Center(
                        child: Text(up ? '🐹' : '',
                            style: const TextStyle(fontSize: 40)),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            if (!_running)
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: _purple, padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14)),
                onPressed: _start,
                child: Text(_timeLeft <= 0 ? 'Play Again' : 'Start',
                    style: const TextStyle(color: Colors.white, fontSize: 16)),
              ),
          ],
        ),
      ),
    );
  }
}
