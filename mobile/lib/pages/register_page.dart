import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final nameCtrl = TextEditingController();
  final usernameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final passwordCtrl = TextEditingController();
  final dobCtrl = TextEditingController();
  final whatsappCtrl = TextEditingController();
  bool showPassword = false;

  @override
  void dispose() {
    nameCtrl.dispose();
    usernameCtrl.dispose();
    emailCtrl.dispose();
    passwordCtrl.dispose();
    dobCtrl.dispose();
    whatsappCtrl.dispose();
    super.dispose();
  }

  void _register() {
    final auth = context.read<AuthService>();
    auth.register(
      usernameCtrl.text.trim(),
      passwordCtrl.text,
      emailCtrl.text.trim(),
    );
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
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Back button
                  Align(
                    alignment: Alignment.centerLeft,
                    child: TextButton.icon(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(Icons.arrow_back_ios, size: 14, color: Colors.white.withAlpha(150)),
                      label: Text('Back', style: TextStyle(color: Colors.white.withAlpha(150), fontSize: 13, fontWeight: FontWeight.w600)),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Glass card
                  _buildGlassCard(auth),
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
          Positioned.fill(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(28),
              child: BackdropFilter(
                filter: ui.ImageFilter.blur(sigmaX: 30, sigmaY: 30),
                child: Container(color: Colors.transparent),
              ),
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 28),
            decoration: BoxDecoration(
              color: const Color(0x7A120a22),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: const Color(0x357c3aed), width: 1.2),
              boxShadow: [
                BoxShadow(color: const Color(0x307c3aed), blurRadius: 80, spreadRadius: 5),
                BoxShadow(color: Colors.black.withAlpha(140), blurRadius: 60, offset: const Offset(0, 30)),
              ],
            ),
            child: Column(
              children: [
                // Logo
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: const Color(0x447c3aed), blurRadius: 40, spreadRadius: 5)],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.asset('assets/favicon.png', width: 56, height: 56, fit: BoxFit.cover),
                  ),
                ),
                const SizedBox(height: 12),
                const Text('Create Account', style: TextStyle(color: Color(0xFFf0ecff), fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                const SizedBox(height: 4),
                Text('Join the fun', style: TextStyle(color: const Color(0xFFb0a0d0), fontSize: 13, fontWeight: FontWeight.w400)),
                const SizedBox(height: 24),

                _field(label: 'Full Name', controller: nameCtrl, icon: Icons.person_outline),
                const SizedBox(height: 12),
                _field(label: 'Email', controller: emailCtrl, icon: Icons.email_outlined, keyboardType: TextInputType.emailAddress),
                const SizedBox(height: 12),
                _field(label: 'Username', controller: usernameCtrl, icon: Icons.alternate_email),
                const SizedBox(height: 12),
                _field(label: 'Password', controller: passwordCtrl, icon: Icons.lock_outline, obscure: !showPassword, suffix: _pwToggle()),
                const SizedBox(height: 12),
                _field(label: 'Date of Birth', controller: dobCtrl, icon: Icons.cake_outlined, hint: 'YYYY-MM-DD'),
                const SizedBox(height: 12),
                _field(label: 'WhatsApp (optional)', controller: whatsappCtrl, icon: Icons.phone_android_outlined, keyboardType: TextInputType.phone),
                const SizedBox(height: 20),

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
                          Expanded(child: Text(auth.error!, style: const TextStyle(color: Color(0xFFfca5a5), fontSize: 13, fontWeight: FontWeight.w600))),
                        ],
                      ),
                    ),
                  ),

                SizedBox(
                  width: double.infinity,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(18),
                      gradient: const LinearGradient(colors: [Color(0xFF22c55e), Color(0xFF16a34a)]),
                      boxShadow: [BoxShadow(color: const Color(0x5522c55e), blurRadius: 24, offset: const Offset(0, 6))],
                    ),
                    child: ElevatedButton(
                      onPressed: (auth.loading || emailCtrl.text.trim().isEmpty)
                          ? null
                          : _register,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                        disabledBackgroundColor: Colors.white.withAlpha(10),
                      ),
                      child: auth.loading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Create Account', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
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

  Widget _field({required String label, required TextEditingController controller, IconData? icon, bool obscure = false, Widget? suffix, TextInputType? keyboardType, String? hint}) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0x12FFFFFF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        keyboardType: keyboardType,
        style: const TextStyle(color: Color(0xFFf0ecff), fontSize: 14, fontWeight: FontWeight.w500),
        decoration: InputDecoration(
          hintText: hint ?? label,
          hintStyle: TextStyle(color: Colors.white.withAlpha(55), fontWeight: FontWeight.w400, fontSize: 14),
          labelText: label,
          labelStyle: TextStyle(color: const Color(0x88b0a0d0), fontSize: 12, fontWeight: FontWeight.w600),
          prefixIcon: icon != null ? Icon(icon, color: const Color(0x66b0a0d0), size: 20) : null,
          suffixIcon: suffix,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }

  Widget _pwToggle() {
    return IconButton(
      icon: Icon(showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: const Color(0x66b0a0d0), size: 20),
      onPressed: () => setState(() => showPassword = !showPassword),
    );
  }
}
