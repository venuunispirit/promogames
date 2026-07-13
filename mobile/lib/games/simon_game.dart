import 'package:flutter/material.dart';
import 'game_contract.dart';

const _bg = LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [Color(0xFF0d0a1a), Color(0xFF1a0e2e), Color(0xFF0f0b1e), Color(0xFF080612)],
);
const _purple = Color(0xFF8b5cf6);
const _green = Color(0xFF22c55e);

Widget buildSimonGame(Map<String, dynamic> settings, GameFinished onFinished) {
  return _SimonGame(settings: settings, onFinished: onFinished);
}

class _SimonGame extends StatefulWidget {
  final Map<String, dynamic> settings;
  final GameFinished onFinished;
  const _SimonGame({required this.settings, required this.onFinished});

  @override
  State<_SimonGame> createState() => _SimonGameState();
}

class _SimonGameState extends State<_SimonGame> {
  static const _colors = [
    Color(0xFF22c55e),
    Color(0xFFef4444),
    Color(0xFF3b82f6),
    Color(0xFFeab308),
  ];

  final List<int> _sequence = [];
  int _inputIndex = 0;
  int _lit = -1;
  bool _playing = false;
  bool _gameOver = false;
  String _status = 'Tap Start';

  int get _score => _sequence.isEmpty ? 0 : _sequence.length - 1;

  Future<void> _start() async {
    _sequence.clear();
    _gameOver = false;
    await _nextRound();
  }

  Future<void> _nextRound() async {
    _sequence.add((_sequence.length + DateTime.now().millisecond) % 4);
    _inputIndex = 0;
    await _playSequence();
  }

  Future<void> _playSequence() async {
    setState(() {
      _playing = true;
      _status = 'Watch...';
    });
    await Future.delayed(const Duration(milliseconds: 500));
    for (final c in _sequence) {
      if (!mounted) return;
      setState(() => _lit = c);
      await Future.delayed(const Duration(milliseconds: 500));
      if (!mounted) return;
      setState(() => _lit = -1);
      await Future.delayed(const Duration(milliseconds: 250));
    }
    if (!mounted) return;
    setState(() {
      _playing = false;
      _status = 'Your turn';
    });
  }

  void _tap(int c) {
    if (_playing || _gameOver) return;
    setState(() => _lit = c);
    Future.delayed(const Duration(milliseconds: 200), () {
      if (mounted) setState(() => _lit = -1);
    });
    if (_sequence[_inputIndex] == c) {
      _inputIndex++;
      if (_inputIndex == _sequence.length) {
        setState(() => _status = 'Good!');
        Future.delayed(const Duration(milliseconds: 600), _nextRound);
      }
    } else {
      setState(() {
        _gameOver = true;
        _status = 'Game Over! Score: $_score';
      });
      widget.onFinished(_score, _score, true);
    }
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
            widget.onFinished(_score, _score, false);
            Navigator.of(context).maybePop();
          },
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: _bg),
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(_status, style: const TextStyle(color: _green, fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Level: ${_sequence.length}', style: const TextStyle(color: _purple, fontSize: 16)),
            const SizedBox(height: 24),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: 4,
                itemBuilder: (context, i) {
                  return GestureDetector(
                    onTap: () => _tap(i),
                    child: Container(
                      decoration: BoxDecoration(
                        color: _lit == i ? _colors[i] : _colors[i].withOpacity(0.35),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white24, width: 2),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),
            if (!_playing && (_sequence.isEmpty || _gameOver))
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: _purple, padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14)),
                onPressed: _start,
                child: Text(_gameOver ? 'Restart' : 'Start', style: const TextStyle(color: Colors.white, fontSize: 16)),
              ),
          ],
        ),
      ),
    );
  }
}
