class GameConfig {
  final int id;
  final String name;
  final String category;
  final String? description;
  final String? redirectUrl;
  final String? clientSlug;
  final String? companyName;
  final String? gameType;
  final String? status;
  final Map<String, dynamic> settings;
  final List<Map<String, dynamic>> questions;
  final List<Map<String, dynamic>> words;
  final List<Map<String, dynamic>> tiles;
  final List<Map<String, dynamic>> segments;
  final List<Map<String, dynamic>> formFields;
  final Map<String, String> soundMap;

  const GameConfig({
    required this.id,
    required this.name,
    required this.category,
    this.description,
    this.redirectUrl,
    this.clientSlug,
    this.companyName,
    this.gameType,
    this.status,
    this.settings = const {},
    this.questions = const [],
    this.words = const [],
    this.tiles = const [],
    this.segments = const [],
    this.formFields = const [],
    this.soundMap = const {},
  });

  factory GameConfig.fromJson(Map<String, dynamic> json) {
    return GameConfig(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      category: json['category'] ?? 'quiz',
      description: json['description'],
      redirectUrl: json['redirect_url'],
      clientSlug: json['client_slug'],
      companyName: json['company_name'],
      gameType: json['game_type'],
      status: json['status'],
      settings: Map<String, dynamic>.from(json['settings'] ?? {}),
      questions: (json['questions'] as List?)
              ?.map((q) => Map<String, dynamic>.from(q as Map))
              .toList() ??
          [],
      words: (json['words'] as List?)
              ?.map((w) => Map<String, dynamic>.from(w as Map))
              .toList() ??
          [],
      tiles: (json['tiles'] as List?)
              ?.map((t) => Map<String, dynamic>.from(t as Map))
              .toList() ??
          [],
      segments: (json['segments'] as List?)
              ?.map((s) => Map<String, dynamic>.from(s as Map))
              .toList() ??
          [],
      formFields: (json['formFields'] as List?)
              ?.map((f) => Map<String, dynamic>.from(f as Map))
              .toList() ??
          [],
      soundMap: (json['soundMap'] as Map?)
              ?.map((k, v) => MapEntry(k.toString(), v?.toString() ?? '')) ??
          {},
    );
  }
}
