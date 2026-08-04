import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _employeeCodeController  = TextEditingController();
  final _fullNameController      = TextEditingController();
  final _mobileNumberController  = TextEditingController();
  final _passwordController      = TextEditingController();
  final _rePasswordController    = TextEditingController();

  bool _obscurePassword   = true;
  bool _obscureRePassword = true;
  String _selectedRole    = 'Guard';

  @override
  void dispose() {
    _employeeCodeController.dispose();
    _fullNameController.dispose();
    _mobileNumberController.dispose();
    _passwordController.dispose();
    _rePasswordController.dispose();
    super.dispose();
  }

  void _onRegisterPressed() {
    context.read<AuthBloc>().add(
          RegisterButtonPressed(
            employeeCode: _employeeCodeController.text.trim(),
            fullName:     _fullNameController.text.trim(),
            mobileNumber: _mobileNumberController.text.trim(),
            password:     _passwordController.text,
            rePassword:   _rePasswordController.text,
            role:         _selectedRole,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthRegistered) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Registration successful! Please login.'),
                backgroundColor: Colors.green,
              ),
            );
            Navigator.pushReplacementNamed(context, AppRoutes.login);
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
              padding:
                  const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Column(
                children: [
                  // ── Card ────────────────────────────────────────────────
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
                        const SizedBox(height: 12),

                        // Title
                        const Text(
                          'Create Account',
                          style: TextStyle(
                            color: AppTheme.primaryColor,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),

                        Text(
                          'Body Camera Management System',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: AppTheme.secondaryColor,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 28),

                        // Employee Code
                        TextField(
                          controller: _employeeCodeController,
                          textInputAction: TextInputAction.next,
                          decoration: const InputDecoration(
                            labelText: 'Employee Code',
                            hintText: 'e.g. G001',
                            prefixIcon: Icon(Icons.badge_outlined,
                                color: AppTheme.primaryColor),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Full Name
                        TextField(
                          controller: _fullNameController,
                          textInputAction: TextInputAction.next,
                          textCapitalization: TextCapitalization.words,
                          decoration: const InputDecoration(
                            labelText: 'Full Name',
                            prefixIcon: Icon(Icons.person_outline,
                                color: AppTheme.primaryColor),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Mobile Number
                        TextField(
                          controller: _mobileNumberController,
                          keyboardType: TextInputType.phone,
                          textInputAction: TextInputAction.next,
                          decoration: const InputDecoration(
                            labelText: 'Mobile Number',
                            prefixIcon: Icon(Icons.phone_outlined,
                                color: AppTheme.primaryColor),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Password
                        TextField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          textInputAction: TextInputAction.next,
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
                        const SizedBox(height: 14),

                        // Re-Password
                        TextField(
                          controller: _rePasswordController,
                          obscureText: _obscureRePassword,
                          textInputAction: TextInputAction.done,
                          onSubmitted: (_) => _onRegisterPressed(),
                          decoration: InputDecoration(
                            labelText: 'Re-Password',
                            prefixIcon: const Icon(Icons.lock_outline,
                                color: AppTheme.primaryColor),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureRePassword
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                color: AppTheme.secondaryColor,
                              ),
                              onPressed: () => setState(() =>
                                  _obscureRePassword = !_obscureRePassword),
                            ),
                          ),
                        ),
                        const SizedBox(height: 22),

                        // Role selector
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            'Role',
                            style: TextStyle(
                              color: AppTheme.primaryColor.withOpacity(0.8),
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: ['Guard', 'Supervisor'].map((role) {
                            final isSelected = _selectedRole == role;
                            return Padding(
                              padding: const EdgeInsets.only(right: 10),
                              child: ChoiceChip(
                                label: Text(role),
                                selected: isSelected,
                                onSelected: (_) =>
                                    setState(() => _selectedRole = role),
                                selectedColor: AppTheme.primaryColor,
                                backgroundColor:
                                    AppTheme.inputFillColor,
                                labelStyle: TextStyle(
                                  color: isSelected
                                      ? Colors.white
                                      : AppTheme.primaryColor,
                                  fontWeight: FontWeight.w600,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  side: BorderSide(
                                    color: isSelected
                                        ? AppTheme.primaryColor
                                        : AppTheme.accentColor,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 28),

                        // Register button
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
                              onPressed: _onRegisterPressed,
                              child: const Text('Create Account'),
                            );
                          },
                        ),
                        const SizedBox(height: 20),

                        // Back to login
                        GestureDetector(
                          onTap: () => Navigator.pushReplacementNamed(context, AppRoutes.login),
                          child: RichText(
                            text: TextSpan(
                              text: 'Already have an account? ',
                              style: TextStyle(
                                  color: Colors.grey.shade600, fontSize: 13),
                              children: const [
                                TextSpan(
                                  text: 'Login',
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
