import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';

class StreamPermissionService {
  /// Request Camera, Microphone, and Location permissions.
  /// Returns true if ALL are granted.
  static Future<bool> requestAll() async {
    if (kIsWeb) {
      // On Web, permission_handler .request() hangs or throws.
      // Web automatically prompts for permissions when the respective APIs (getUserMedia, Geolocation) are called.
      return true;
    }

    final statuses = await [
      Permission.camera,
      Permission.microphone,
      Permission.locationWhenInUse,
    ].request();

    return statuses.values.every((s) => s.isGranted);
  }

  static Future<bool> get cameraGranted async =>
      await Permission.camera.isGranted;
  static Future<bool> get micGranted async =>
      await Permission.microphone.isGranted;
  static Future<bool> get locationGranted async =>
      await Permission.locationWhenInUse.isGranted;

  static Future<void> openSettings() => openAppSettings();
}
