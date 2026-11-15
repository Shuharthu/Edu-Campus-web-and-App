import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:smart_edu_mobile/core/theme/app_tokens.dart';
import 'package:smart_edu_mobile/shared/widgets/app_button.dart';
import 'package:smart_edu_mobile/shared/widgets/app_card.dart';
import 'package:smart_edu_mobile/shared/widgets/app_chip.dart';

void main() {
  testWidgets('Shared widgets honor theme tokens and minimum 44px touch targets', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        home: Scaffold(
          body: AppCard(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const AppChip(label: 'Active', tone: AppChipTone.success),
                const SizedBox(height: AppSpacing.s12),
                AppButton(label: 'Sign in', onPressed: () {}),
              ],
            ),
          ),
        ),
      ),
    );

    final buttonSize = tester.getSize(find.byType(AppButton));
    expect(buttonSize.height, greaterThanOrEqualTo(44.0));
    expect(find.text('Active'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);
  });
}
