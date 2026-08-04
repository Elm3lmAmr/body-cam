import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/config/app_config.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _employeeCodeController = TextEditingController();
  final _passwordController = TextEditingController();
  late final TextEditingController _ipController;
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    _ipController = TextEditingController(text: AppConfig.serverIp);
  }

  @override
  void dispose() {
    _employeeCodeController.dispose();
    _passwordController.dispose();
    _ipController.dispose();
    super.dispose();
  }

  void _onLoginPressed() {
    AppConfig.serverIp = _ipController.text.trim();
    context.read<AuthBloc>().add(
          LoginButtonPressed(
            employeeCode: _employeeCodeController.text.trim(),
            password: _passwordController.text,
          ),
        );
  }

  void _goToRegister() {
    Navigator.pushNamed(context, AppRoutes.register);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthSuccess) {
            Navigator.pushReplacementNamed(context, AppRoutes.liveStream);
          } else if (state is AuthFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.error),
                backgroundColor: Colors.redAccent,
              ),
            );
          }
        },
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Column(
                children: [
                  // ── Card ──────────────────────────────────────────────────
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withOpacity(0.12),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 28, vertical: 36),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Logo
                        Image.asset(
                          'assets/images/edara_logo.png',
                          height: 80,
                        ),
                        const SizedBox(height: 50),

                        // Subtitle
                        const Text(
                          'Body Camera Management System',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: AppTheme.secondaryColor,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 0.3,
                          ),
                        ),
                        const SizedBox(height: 50),

                        // Divider label
                        const Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            'Sign In',
                            style: TextStyle(
                              color: AppTheme.primaryColor,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Server IP field
                        TextField(
                          controller: _ipController,
                          keyboardType: TextInputType.url,
                          textInputAction: TextInputAction.next,
                          onChanged: (val) {
                            AppConfig.serverIp = val.trim();
                          },
                          decoration: const InputDecoration(
                            labelText: 'API Server IP',
                            hintText: 'e.g. 10.50.234.153',
                            prefixIcon: Icon(Icons.router_outlined, color: AppTheme.primaryColor),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Employee Code field
                        TextField(
                          controller: _employeeCodeController,
                          keyboardType: TextInputType.text,
                          textInputAction: TextInputAction.next,
                          decoration: const InputDecoration(
                            labelText: 'Employee Code',
                            hintText: 'e.g. G001',
                            prefixIcon:
                                Icon(Icons.badge_outlined, color: AppTheme.primaryColor),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Password field
                        TextField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          textInputAction: TextInputAction.done,
                          onSubmitted: (_) => _onLoginPressed(),
                          decoration: InputDecoration(
                            labelText: 'Password',
                            prefixIcon: const Icon(Icons.lock_outline,
                                color: AppTheme.primaryColor),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                color: AppTheme.secondaryColor,
                              ),
                              onPressed: () => setState(
                                  () => _obscurePassword = !_obscurePassword),
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),

                        // Login button
                        BlocBuilder<AuthBloc, AuthState>(
                          builder: (context, state) {
                            if (state is AuthLoading) {
                              return const SizedBox(
                                height: 50,
                                child: Center(
                                  child: CircularProgressIndicator(
                                    color: AppTheme.primaryColor,
                                  ),
                                ),
                              );
                            }
                            return ElevatedButton(
                              onPressed: _onLoginPressed,
                              child: const Text('Login'),
                            );
                          },
                        ),
                        const SizedBox(height: 20),

                        // Navigate to Register
                        GestureDetector(
                          onTap: _goToRegister,
                          child: RichText(
                            text: TextSpan(
                              text: "Don't have an account? ",
                              style: TextStyle(
                                  color: Colors.grey.shade600, fontSize: 13),
                              children: const [
                                TextSpan(
                                  text: 'Register',
                                  style: TextStyle(
                                    color: AppTheme.secondaryColor,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
