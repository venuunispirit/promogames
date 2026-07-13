import 'package:flutter/material.dart';
import 'game_contract.dart';

const _bg = LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [Color(0xFF0d0a1a), Color(0xFF1a0e2e), Color(0xFF0f0b1e), Color(0xFF080612)],
);
const _purple = Color(0xFF8b5cf6);
const _green = Color(0xFF22c55e);

Widget buildTictactoeGame(Map<String, dynamic> settings, GameFinished onFinished) {
  return _TicTacToeGame(settings: settings, onFinished: onFinished);
}

class _TicTacToeGame extends StatefulWidget {
  final Map<String, dynamic> settings;
  final GameFinished onFinished;
  const _TicTacToeGame({required this.settings, required this.onFinished});

  @override
  State<_TicTacToeGame> createState() => _TicTacToeGameState();
}

class _TicTacToeGameState extends State<_TicTacToeGame> {
  List<String> _board = List.filled(9, '');
  bool _finished = false;
  String _status = 'Your turn (X)';
  int _score = 0;

  static const _wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  String? _winner(List<String> b) {
    for (final w in _wins) {
      if (b[w[0]] != '' && b[w[0]] == b[w[1]] && b[w[1]] == b[w[2]]) return b[w[0]];
    }
    return null;
  }

  void _playerMove(int i) {
    if (_finished || _board[i] != '') return;
    setState(() => _board[i] = 'X');
    _checkEnd();
    if (!_finished) _aiMove();
  }

  void _aiMove() {
    final empty = [for (var i = 0; i < 9; i++) if (_board[i] == '') i];
    if (empty.isEmpty) return;
    int? choice;
    for (final i in empty) {
      final t = [..._board];
      t[i] = 'O';
      if (_winner(t) == 'O') { choice = i; break; }
    }
    if (choice == null) {
      for (final i in empty) {
        final t = [..._board];
        t[i] = 'X';
        if (_winner(t) == 'X') { choice = i; break; }
      }
    }
    choice ??= empty.contains(4) ? 4 : (empty..shuffle()).first;
    setState(() => _board[choice!] = 'O');
    _checkEnd();
  }

  void _checkEnd() {
    final w = _winner(_board);
    if (w != null) {
      setState(() {
        _finished = true;
        _score = w == 'X' ? 1 : 0;
        _status = w == 'X' ? 'You win!' : 'You lose!';
      });
      widget.onFinished(_score, 1, true);
    } else if (!_board.contains('')) {
      setState(() {
        _finished = true;
        _score = 0;
        _status = 'Draw!';
      });
      widget.onFinished(_score, 1, true);
    }
  }

  void _reset() {
    setState(() {
      _board = List.filled(9, '');
      _finished = false;
      _status = 'Your turn (X)';
    });
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
            widget.onFinished(_score, 1, false);
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
            const SizedBox(height: 20),
            AspectRatio(
              aspectRatio: 1,
              child: GridView.builder(
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                ),
                itemCount: 9,
                itemBuilder: (context, i) {
                  return GestureDetector(
                    onTap: () => _playerMove(i),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white10,
                        border: Border.all(color: _purple, width: 2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Center(
                        child: Text(_board[i],
                            style: TextStyle(
                                fontSize: 48,
                                fontWeight: FontWeight.bold,
                                color: _board[i] == 'X' ? _green : _purple)),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),
            if (_finished)
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: _purple, padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14)),
                onPressed: _reset,
                child: const Text('Play Again', style: TextStyle(color: Colors.white, fontSize: 16)),
              ),
          ],
        ),
      ),
    );
  }
}
