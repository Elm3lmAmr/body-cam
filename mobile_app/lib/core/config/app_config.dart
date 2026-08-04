/// Central server configuration.
/// For real device testing: update serverIp to your PC's local WiFi IP.
/// Find it with: ipconfig (Windows) → look for "Wireless LAN adapter Wi-Fi" → IPv4 Address
class AppConfig {
  AppConfig._();

  /// PC's local network IP. Change this when testing on a real device.
  /// Use '10.0.2.2' for Android emulator, or your PC's WiFi IP (e.g. '192.168.1.100') for real device.
  static String serverIp = '10.50.234.153';

  static const int serverPort = 4000;
  static String get baseUrl => 'http://$serverIp:$serverPort';
  static String get wsUrl => 'ws://$serverIp:$serverPort';

  /// Device identifier for this body camera unit.
  static const String deviceSerial = 'DEV_SGC_X515';
}
