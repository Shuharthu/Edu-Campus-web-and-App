import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../auth/auth_provider.dart';

class OnboardingScreen extends ConsumerWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.s24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  SvgPicture.asset(
                    Theme.of(context).brightness == Brightness.dark
                        ? 'assets/brand/smart-edu-logo-dark.svg'
                        : 'assets/brand/smart-edu-logo-light.svg',
                    height: 32,
                  ),
                  AppButton(
                    label: locale.languageCode == 'ar' ? 'English' : 'العربية',
                    variant: AppButtonVariant.secondary,
                    onPressed: () {
                      ref.read(localeProvider.notifier).state =
                          locale.languageCode == 'en'
                              ? const Locale('ar')
                              : const Locale('en');
                    },
                  ),
                ],
              ),
              const Spacer(),
              Text('Smart EDU', style: AppTextStyles.heading2),
              const SizedBox(height: AppSpacing.s12),
              Text(
                'One campus, in every pocket and on every desk.',
                style: AppTextStyles.body3,
              ),
              const SizedBox(height: AppSpacing.s24),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Real time synchronization', style: AppTextStyles.title3),
                    const SizedBox(height: AppSpacing.s4),
                    Text(
                      'Attendance, grades, notices, digital ID and tuition updates stay synced across phone and console.',
                      style: AppTextStyles.body6,
                    ),
                  ],
                ),
              ),
              const Spacer(),
              AppButton(
                label: 'Get started',
                fullWidth: true,
                onPressed: () => context.go('/sign-in'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
