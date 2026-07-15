import 'game_contract.dart';
import 'fallback_game.dart';

import 'quiz_game.dart';
import 'memory_game.dart';
import 'tictactoe_game.dart';
import 'simon_game.dart';
import 'reaction_game.dart';
import 'whackamole_game.dart';
import 'snake_game.dart';
import 'game2048_game.dart';
import 'breakout_game.dart';
import 'space_game.dart';
import 'flappy_game.dart';
import 'catch_game.dart';
import 'maze_game.dart';
import 'sudoku_game.dart';
import 'crossword_game.dart';
import 'wordsearch_game.dart';
import 'jigsaw_game.dart';
import 'wordscramble_game.dart';
import 'pouring_game.dart';
import 'typer_game.dart';
import 'screw_game.dart';
import 'bounce_game.dart';
import 'stack_game.dart';
import 'hanoi_game.dart';
import 'bowling_game.dart';
import 'minesweeper_game.dart';
import 'rps_game.dart';
import 'arrowescape_game.dart';
import 'bejeweled_game.dart';
import 'tetris_game.dart';
import 'bubbleshooter_game.dart';
import 'carlaunch_game.dart';
import 'stressbuster_game.dart';
import 'soundify_game.dart';
import 'connect4_game.dart';
import 'chess_game.dart';
import 'canva_game.dart';
import 'brickimages_game.dart';

final Map<String, GameBuilder> _builders = {
  'quiz': buildQuizGame,
  'memory': buildMemoryGame,
  'tictactoe': buildTictactoeGame,
  'simon': buildSimonGame,
  'reaction': buildReactionGame,
  'whackamole': buildWhackamoleGame,
  'snake': buildSnakeGame,
  '2048': build2048Game,
  'breakout': buildBreakoutGame,
  'space': buildSpaceGame,
  'flappy': buildFlappyGame,
  'catch': buildCatchGame,
  'maze': buildMazeGame,
  'sudoku': buildSudokuGame,
  'crossword': buildCrosswordGame,
  'wordsearch': buildWordSearchGame,
  'jigsaw': buildJigsawGame,
  'wordscramble': buildWordScrambleGame,
  'pouring': buildPouringGame,
  'typer': buildTyperGame,
  'screw': buildScrewGame,
  'bounce': buildBounceGame,
  'stack': buildStackGame,
  'hanoi': buildHanoiGame,
  'bowling': buildBowlingGame,
  'minesweeper': buildMinesweeperGame,
  'rps': buildRpsGame,
  'arrowescape': buildArrowEscapeGame,
  'bejeweled': buildBejeweledGame,
  'tetris': buildTetrisGame,
  'bubbleshooter': buildBubbleShooterGame,
  'carlaunch': buildCarLaunchGame,
  'stressbuster': buildStressBusterGame,
  'soundify': buildSoundifyGame,
  'connect4': buildConnect4Game,
  'chess': buildChessGame,
  'canva': buildCanvaGame,
  'brickimages': buildBrickImagesGame,
};

/// Returns the native builder for a backend game-type (`category`).
/// Unknown types resolve to a playable native fallback so the app is functional.
GameBuilder gameBuilder(String category) {
  final key = (category).toLowerCase();
  return _builders[key] ?? buildFallbackGame;
}
