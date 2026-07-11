import 'package:flutter/material.dart';

class GamePlayerPage extends StatelessWidget {
  const GamePlayerPage({super.key});

  @override
  Widget build(BuildContext ctx) {
    final game = ModalRoute.of(ctx)?.settings.arguments as Map<String, dynamic>?;

    return Scaffold(
      appBar: AppBar(title: Text(game?['name'] ?? 'Game')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.construction, size: 64, color: Colors.grey),
              const SizedBox(height: 16),
              const Text('Game player coming soon', style: TextStyle(fontSize: 16)),
            ],
          ),
        ),
      ),
    );
  }
}
