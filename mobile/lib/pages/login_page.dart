import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final emailCtrl = TextEditingController();
  bool emailValid = false;

  @override
  void dispose() {
    emailCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    final email = emailCtrl.text.trim();
    if (email.isEmpty) return;
    Navigator.pushNamed(context, '/password', arguments: email);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    return Scaffold(
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
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Glass card
                  _buildGlassCard(auth),
                  const SizedBox(height: 28),

                  // Register link
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/register'),
                    child: RichText(
                      text: TextSpan(
                        style: TextStyle(color: Colors.white.withAlpha(120), fontSize: 13, fontWeight: FontWeight.w600),
                        children: [
                          const TextSpan(text: "Don't have an account? "),
                          TextSpan(
                            text: 'Create one',
                            style: TextStyle(color: const Color(0xFFa78bfa), fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Secured by PromoGames',
                    style: TextStyle(color: Colors.white.withAlpha(35), fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 1),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGlassCard(AuthService auth) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: Stack(
        children: [
          // Blur background
          Positioned.fill(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(28),
              child: BackdropFilter(
                filter: ui.ImageFilter.blur(sigmaX: 30, sigmaY: 30),
                child: Container(color: Colors.transparent),
              ),
            ),
          ),
          // Card content
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 44, horizontal: 28),
            decoration: BoxDecoration(
              color: const Color(0x7A120a22),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(
                color: const Color(0x357c3aed),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0x307c3aed),
                  blurRadius: 80,
                  spreadRadius: 5,
                  offset: const Offset(0, 0),
                ),
                BoxShadow(
                  color: Colors.black.withAlpha(140),
                  blurRadius: 60,
                  offset: const Offset(0, 30),
                ),
              ],
            ),
            child: Column(
              children: [
                // Logo
                Container(
                  width: 68,
                  height: 68,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0x447c3aed),
                        blurRadius: 40,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Image.asset(
                      'assets/favicon.png',
                      width: 68,
                      height: 68,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'PromoGames',
                  style: TextStyle(
                    color: Color(0xFFf0ecff),
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.8,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Sign in to continue playing',
                  style: TextStyle(
                    color: const Color(0xFFb0a0d0),
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(height: 36),

                // Email field
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0x12FFFFFF),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: emailCtrl.text.isNotEmpty && emailValid
                          ? const Color(0x667c3aed)
                          : const Color(0x1AFFFFFF),
                    ),
                  ),
                  child: TextField(
                    controller: emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    enabled: !auth.loading,
                    style: const TextStyle(color: Color(0xFFf0ecff), fontSize: 15, fontWeight: FontWeight.w500),
                    decoration: InputDecoration(
                      hintText: 'Email address',
                      hintStyle: TextStyle(color: Colors.white.withAlpha(55), fontWeight: FontWeight.w400),
                      prefixIcon: Icon(Icons.email_outlined, color: const Color(0x88b0a0d0), size: 20),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                    ),
                    onChanged: (v) {
                      setState(() {
                        emailValid = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(v);
                      });
                    },
                    onSubmitted: (_) => _submit(),
                  ),
                ),
                const SizedBox(height: 20),

                // Error
                if (auth.error != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0x0Fef4444),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0x1Fef4444)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.warning_amber_rounded, color: Color(0xFFfca5a5), size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              auth.error!,
                              style: const TextStyle(color: Color(0xFFfca5a5), fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                // Button
                SizedBox(
                  width: double.infinity,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(18),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF22c55e), Color(0xFF16a34a)],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0x5522c55e),
                          blurRadius: 24,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: (auth.loading || emailCtrl.text.trim().isEmpty)
                          ? null
                          : () => _submit(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                        disabledBackgroundColor: Colors.white.withAlpha(10),
                      ),
                      child: auth.loading
                          ? const SizedBox(
                              width: 20, height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text(
                              'Continue →',
                              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
                            ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
