import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/game_config.dart';
import 'game_contract.dart';

Widget buildTyperGame(GameConfig config, GameFinished onFinished) {
  return _TyperGame(config: config, onFinished: onFinished);
}

class _TyperGame extends StatefulWidget {
  final GameConfig config;
  final GameFinished onFinished;
  const _TyperGame({required this.config, required this.onFinished});

  @override
  State<_TyperGame> createState() => _TyperGameState();
}

class _TyperGameState extends State<_TyperGame> {
  Color _bgColor = const Color(0xFF0d0a1a);
  Color _primaryColor = const Color(0xFF8b5cf6);
  String? _bgImageUrl;
  String? _logoUrl;

  void _parseSettings() {
    final s = widget.config.settings;
    _bgColor = _hexToColor(s['bg_color']?.toString()) ?? const Color(0xFF0d0a1a);
    _primaryColor = _hexToColor(s['primary_color']?.toString()) ?? const Color(0xFF8b5cf6);
    _bgImageUrl = s['bg_image_url']?.toString();
    _logoUrl = s['game_logo_url']?.toString();
  }

  Color? _hexToColor(String? hex) {
    if (hex == null || hex.isEmpty) return null;
    hex = hex.replaceFirst('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    try { return Color(int.parse(hex, radix: 16)); } catch (_) { return null; }
  }

  late List<String> words;
  int index = 0;
  int correctChars = 0;
  int totalChars = 0;
  int wordsDone = 0;
  final TextEditingController _ctrl = TextEditingController();
  final FocusNode _focus = FocusNode();
  bool finished = false;

  @override
  void initState() {
    super.initState();
    _parseSettings();
    final provided = widget.config.settings['words'];
    if (provided is List && provided.isNotEmpty) {
      words = provided.map((e) => e.toString()).toList();
    } else {
      words = [
        'flutter', 'purple', 'bounce', 'puzzle', 'rocket', 'silver',
        'crystal', 'neon', 'jungle', 'vector', 'pixel', 'gravity',
      ];
    }
    totalChars = words.fold(0, (a, w) => a + w.length);
    WidgetsBinding.instance.addPostFrameCallback((_) => _focus.requestFocus());
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _submit(String value) {
    if (finished || index >= words.length) return;
    final target = words[index];
    if (value.trim().toLowerCase() == target) {
      setState(() {
        correctChars += target.length;
        wordsDone++;
        index++;
        _ctrl.clear();
      });
      if (index >= words.length) {
        _finish();
      } else {
        WidgetsBinding.instance
            .addPostFrameCallback((_) => _focus.requestFocus());
      }
    }
  }

  void _finish() {
    if (finished) return;
    finished = true;
    Future.delayed(const Duration(milliseconds: 300), () {
      widget.onFinished(wordsDone, words.length, true);
    });
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.config.name ?? 'Typer';
    final target = index < words.length ? words[index] : '';
    final typed = _ctrl.text;
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        backgroundColor: _bgColor,
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => widget.onFinished(wordsDone, words.length, false),
          )
        ],
      ),
      body: Stack(

        fit: StackFit.expand,

        children: [

          if (_bgImageUrl != null)

            CachedNetworkImage(

              imageUrl: _bgImageUrl!,

              fit: BoxFit.cover,

              placeholder: (_, __) => Container(color: _bgColor),

              errorWidget: (_, __, ___) => Container(color: _bgColor),

            )

          else Container(color: _bgColor),

          Container(color: Colors.black.withOpacity(0.3)),

           Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Word ${index + 1}/${words.length}',
                      style: const TextStyle(color: Color(0xFF8b5cf6), fontSize: 16)),
                  Text('Score: $wordsDone',
                      style: const TextStyle(color: Color(0xFF22c55e), fontSize: 18)),
                ],
              ),
              const SizedBox(height: 40),
              if (!finished)
                Column(
                  children: [
                    Wrap(
                      spacing: 4,
                      children: [
                        for (int i = 0; i < target.length; i++)
                          Text(
                            target[i],
                            style: TextStyle(
                              fontSize: 34,
                              fontWeight: FontWeight.bold,
                              color: i < typed.length
                                  ? (typed[i].toLowerCase() == target[i]
                                      ? const Color(0xFF22c55e)
                                      : Colors.red)
                                  : _primaryColor,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 30),
                    TextField(
                      controller: _ctrl,
                      focusNode: _focus,
                      autocorrect: false,
                      onChanged: (v) => setState(() {}),
                      onSubmitted: _submit,
                      style: const TextStyle(color: Colors.white, fontSize: 22),
                      decoration: InputDecoration(
                        hintText: 'Type the word…',
                        hintStyle: const TextStyle(color: Colors.white38),
                        enabledBorder: OutlineInputBorder(
                          borderSide: const BorderSide(color: Color(0xFF8b5cf6)),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderSide: const BorderSide(color: Color(0xFF22c55e)),
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => _submit(_ctrl.text),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _primaryColor,
                      ),
                      child: const Text('Submit'),
                    ),
                  ],
                )
              else
                const Text('ALL DONE!',
                    style: TextStyle(color: Color(0xFF22c55e), fontSize: 26)),
              const SizedBox(height: 20),
              LinearProgressIndicator(
                value: words.isEmpty ? 0 : index / words.length,
                backgroundColor: _bgColor,
                color: const Color(0xFF22c55e),
              ),
            ],
          ),
        ),
      ],
    ),
  );
  }
}
