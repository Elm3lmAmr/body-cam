import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/main.dart';

void main() {
  testWidgets('App starts without errors', (WidgetTester tester) async {
    await tester.pumpWidget(const EdaraApp());
    expect(find.byType(EdaraApp), findsOneWidget);
  });
}
