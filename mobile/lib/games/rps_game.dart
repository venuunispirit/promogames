import 'package:flutter/material.dart';
import 'game_contract.dart';

Widget buildRpsGame(Map<String, dynamic> settings, GameFinished onFinished) {
  return _RpsGame(settings: settings, onFinished: onFinished);
}

class _RpsGame extends StatefulWidget {
  final Map<String, dynamic> settings;
  final GameFinished onFinished;
  const _RpsGame({required this.settings, required this.onFinished});

  @override
  State<_RpsGame> createState() => _RpsGameState();
}

class _RpsGameState extends State<_RpsGame> {
  final String title = 'Rock Paper Scissors';
  static const int roundsTotal = 7;

  final List<String> choices = ['rock', 'paper', 'scissors'];
  final Map<String, IconData> icons = {
    'rock': Icons.square_rounded,
    'paper': Icons.description,
    'scissors': Icons.content_cut,
  };

  int wins = 0;
  int losses = 0;
  int round = 0;
  String? playerChoice;
  String? cpuChoice;
  String result = 'Best of $roundsTotal — pick your move!';

  int _beats(String a, String b) {
    if (a == b) return 0;
    if ((a == 'rock' && b == 'scissors') ||
        (a == 'paper' && b == 'rock') ||
        (a == 'scissors' && b == 'paper')) return 1;
    return -1;
  }

  void _play(String choice) {
    if (round >= roundsTotal) {
      return;
    }
    final cpu = choices[DateTime.now().microsecondsSinceEpoch % 3];
    final outcome = _beats(choice, cpu);
    setState(() {
      playerChoice = choice;
      cpuChoice = cpu;
      round++;
      if (outcome == 1) {
        wins++;
        result = 'You win this round!';
      } else if (outcome == -1) {
        losses++;
        result = 'CPU wins this round.';
      } else {
        result = 'Draw!';
      }

      if (round >= roundsTotal) {
        result = 'Done! Wins: $wins  Losses: $losses';
      }
    });
    if (round >= roundsTotal) {
      Future.delayed(const Duration(milliseconds: 800), () {
        widget.onFinished(wins, roundsTotal, true);
      });
    }
  }

  Widget _choiceBtn(String c) => ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF1a0e2e),
          foregroundColor: const Color(0xFF8b5cf6),
          side: const BorderSide(color: Color(0xFF8b5cf6)),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        ),
        onPressed: round >= roundsTotal ? null : () => _play(c),
        child: Column(
          children: [
            Icon(icons[c], size: 30),
            Text(c, style: const TextStyle(fontSize: 12)),
          ],
        ),
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.settings['name'] ?? title),
        backgroundColor: const Color(0xFF0d0a1a),
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => widget.onFinished(wins, roundsTotal, false),
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
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Round $round/$roundsTotal',
                style: const TextStyle(color: Color(0xFF8b5cf6), fontSize: 18)),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Column(children: [
                  const Text('You', style: TextStyle(color: Colors.white70)),
                  Icon(icons[playerChoice ?? 'rock'], size: 40, color: const Color(0xFF22c55e)),
                ]),
                Column(children: [
                  const Text('CPU', style: TextStyle(color: Colors.white70)),
                  Icon(icons[cpuChoice ?? 'rock'], size: 40, color: Colors.red),
                ]),
              ],
            ),
            const SizedBox(height: 16),
            Text(result, style: const TextStyle(color: Colors.white, fontSize: 16), textAlign: TextAlign.center),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: choices.map(_choiceBtn).toList(),
            ),
            const SizedBox(height: 24),
            Text('Wins: $wins   Losses: $losses',
                style: const TextStyle(color: Color(0xFF22c55e), fontSize: 16)),
          ],
        ),
      ),
    );
  }
}
