import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';
import '../models/user.dart';

class AuthService extends ChangeNotifier {
  User? _user;
  bool _loading = false;
  String? _error;

  User? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> checkSession() async {
    final token = await ApiService.getToken();
    if (token != null) {
      try {
        final data = await ApiService.get('/play/me');
        _user = User.fromJson(data);
        notifyListeners();
      } catch (_) {
        await _clearSession();
      }
    }
  }

  Future<bool> login(String username, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiService.post('/play/login', {
        'username': username,
        'password': password,
      }, auth: false);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', data['session_token'] ?? '');
      _user = User.fromJson(data);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String username, String password, String email) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiService.post('/play/register', {
        'username': username,
        'password': password,
        'email': email,
      }, auth: false);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', data['session_token'] ?? '');
      _user = User.fromJson(data);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _clearSession();
    notifyListeners();
  }

  Future<void> _clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    _user = null;
  }
}
