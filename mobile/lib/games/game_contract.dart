import 'package:flutter/widgets.dart';

/// Contract every native game must follow.
///
/// A game is a plain builder function (not a registered widget) so each game
/// lives in its own file with zero shared coupling. `GamePlayerPage` looks the
/// builder up by the game's `category` (the backend game-type key) and renders
/// it, passing the game settings and an `onFinished` callback.
typedef GameFinished = void Function(int score, int maxScore, bool completed);

typedef GameBuilder = Widget Function(
  Map<String, dynamic> settings,
  GameFinished onFinished,
);
