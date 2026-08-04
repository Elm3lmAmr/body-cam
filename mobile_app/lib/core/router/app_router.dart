import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../di/injection_container.dart';
// Screens
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/live_stream/presentation/screens/live_stream_screen.dart';

/// All named routes for the Edara application.
/// Navigation is handled exclusively through these names — no
/// hard-coded Navigator.push(MaterialPageRoute(...)) calls in screens.
class AppRoutes {
  AppRoutes._();

  static const String login      = '/';
  static const String register   = '/register';
  static const String liveStream = '/live-stream';
}

class AppRouter {
  AppRouter._();

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {

      case AppRoutes.login:
        return _fadeRoute(const LoginScreen(), settings);

      case AppRoutes.register:
        return _fadeRoute(const RegisterScreen(), settings);

      case AppRoutes.liveStream:
        return _fadeRoute(
          BlocProvider(
            create: (_) => InjectionContainer.liveStreamBloc,
            child: const LiveStreamScreen(),
          ),
          settings,
        );

      default:
        return _fadeRoute(
          Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
          settings,
        );
    }
  }

  /// Smooth fade transition between screens.
  static PageRouteBuilder<dynamic> _fadeRoute(
      Widget page, RouteSettings settings) {
    return PageRouteBuilder(
      settings: settings,
      pageBuilder: (_, __, ___) => page,
      transitionsBuilder: (_, animation, __, child) => FadeTransition(
        opacity: animation,
        child: child,
      ),
      transitionDuration: const Duration(milliseconds: 250),
    );
  }
}
