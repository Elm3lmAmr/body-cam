import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/di/injection_container.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Catch any unhandled Flutter framework errors and show them on screen
  // instead of a silent black screen — critical for debugging.
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    debugPrint('FLUTTER ERROR: ${details.exceptionAsString()}');
  };

  runApp(const EdaraApp());
}

class EdaraApp extends StatelessWidget {
  const EdaraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => InjectionContainer.authBloc,
      child: MaterialApp(
        title: 'Edara',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.theme,
        initialRoute: AppRoutes.login,
        onGenerateRoute: AppRouter.generateRoute,
        // Show any routing errors on screen instead of black screen
        builder: (context, child) {
          ErrorWidget.builder = (FlutterErrorDetails errorDetails) {
            return Material(
              child: Container(
                color: const Color(0xFFF0F7FD),
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, color: Colors.redAccent, size: 56),
                    const SizedBox(height: 16),
                    const Text(
                      'App Error',
                      style: TextStyle(
                        fontSize: 22, fontWeight: FontWeight.bold,
                        color: Color(0xFF2C5EAD),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      errorDetails.exceptionAsString(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 13, color: Colors.black54, height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            );
          };
          return child ?? const SizedBox.shrink();
        },
      ),
    );
  }
}
