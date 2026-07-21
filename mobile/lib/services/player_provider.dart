import 'package:flutter/foundation.dart';
import 'api_service.dart';
import '../models/user.dart';
import '../core/data/mock_data.dart';

class PlayerProvider extends ChangeNotifier {
  User? _user;
  List<Map<String, dynamic>> _brandedGames = [];
  List<Map<String, dynamic>> _promoGames = [];
  List<Map<String, dynamic>> _transactions = [];
  List<Map<String, dynamic>> _rewards = [];
  List<Map<String, dynamic>> _leaderboard = [];
  bool _loading = true;

  User? get user => _user;
  List<Map<String, dynamic>> get brandedGames => _brandedGames;
  List<Map<String, dynamic>> get promoGames => _promoGames;
  List<Map<String, dynamic>> get transactions => _transactions;
  List<Map<String, dynamic>> get rewards => _rewards;
  List<Map<String, dynamic>> get leaderboard => _leaderboard;
  bool get loading => _loading;

  int get pcBalance => _user?.pcBalance ?? 0;

  Future<void> loadAll() async {
    _loading = true;
    notifyListeners();
    await Future.wait([
      _fetchProfile(),
      _fetchGames(),
      _fetchTransactions(),
      _fetchRewards(),
      _fetchLeaderboard(),
    ]);
    _loading = false;
    notifyListeners();
  }

  Future<void> _fetchProfile() async {
    try {
      final data = await ApiService.get('/pauth/me');
      _user = User.fromJson(data['player']);
    } catch (_) {
      _user ??= User(id: 0, username: MockData.username, pcBalance: MockData.coinBalance, avatarId: 'av-3');
    }
  }

  Future<void> _fetchGames() async {
    try {
      final data = await ApiService.get('/play/play-page-games');
      final branded = (data['branded'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      final promo = (data['promogames'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      _brandedGames = branded;
      _promoGames = promo;
    } catch (_) {
      _brandedGames = [];
      _promoGames = [];
    }
  }

  Future<void> _fetchTransactions() async {
    try {
      final data = await ApiService.get('/pauth/transactions');
      _transactions = (data['transactions'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    } catch (_) {
      _transactions = MockData.transactions.map((t) => {
        'id': t.id,
        'note': t.title,
        'points': t.amount,
        'created_at': t.date,
        'type': t.amount > 0 ? 'earn' : 'spend',
      }).toList();
    }
  }

  Future<void> _fetchRewards() async {
    try {
      final data = await ApiService.get('/pauth/rewards');
      _rewards = (data['rewards'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    } catch (_) {
      _rewards = MockData.rewards.map((r) => {
        'id': r.id,
        'title': r.title,
        'brand': r.brand,
        'pp_cost': r.coins,
        'description': r.category,
      }).toList();
    }
  }

  Future<void> _fetchLeaderboard() async {
    try {
      final data = await ApiService.get('/pauth/leaderboard');
      _leaderboard = (data['leaderboard'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    } catch (_) {
      _leaderboard = MockData.leaderboard.map((l) => {
        'name': l.name,
        'pc_balance': l.coins,
        'username': l.name.toLowerCase(),
      }).toList();
    }
  }
}
