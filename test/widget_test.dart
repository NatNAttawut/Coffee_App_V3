import 'package:flutter_test/flutter_test.dart';
import 'package:coffeeappv1/main.dart';

void main() {
  testWidgets('App starts successfully', (WidgetTester tester) async {
    // เปิดแอป
    await tester.pumpWidget(const MyApp());

    // ให้ Flutter วาดหน้าจอ 1 frame
    await tester.pump();

    // ตรวจว่า MyApp สามารถสร้างขึ้นมาได้
    expect(find.byType(MyApp), findsOneWidget);
  });
}