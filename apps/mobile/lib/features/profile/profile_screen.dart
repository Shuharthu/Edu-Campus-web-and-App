import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';
import '../../shared/widgets/app_list_tile.dart';
import '../auth/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.s16),
      children: [
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(auth.fullName ?? 'Account', style: AppTextStyles.heading6),
              const SizedBox(height: AppSpacing.s4),
              Text(auth.email ?? '', style: AppTextStyles.body6),
              const SizedBox(height: AppSpacing.s12),
              const AppChip(label: 'Offline cache ready', tone: AppChipTone.success),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.s16),
        AppCard(
          child: Column(
            children: [
              AppListTile(
                leading: const Icon(PhosphorIconsRegular.moon),
                title: 'Appearance',
                subtitle: themeMode == ThemeMode.dark ? 'Dark theme' : 'Light theme',
                trailing: Switch(
                  value: themeMode == ThemeMode.dark,
                  onChanged: (dark) {
                    ref.read(themeModeProvider.notifier).state =
                        dark ? ThemeMode.dark : ThemeMode.light;
                  },
                ),
              ),
              AppListTile(
                leading: const Icon(PhosphorIconsRegular.translate),
                title: 'Language',
                subtitle: locale.languageCode == 'ar' ? 'Arabic (RTL)' : 'English (LTR)',
                onTap: () {
                  ref.read(localeProvider.notifier).state =
                      locale.languageCode == 'en'
                          ? const Locale('ar')
                          : const Locale('en');
                },
              ),
              AppListTile(
                leading: const Icon(PhosphorIconsRegular.fingerprint),
                title: 'Biometric unlock',
                subtitle: 'Verify device biometrics before opening sensitive records',
                onTap: () => ref.read(authProvider.notifier).authenticateWithBiometrics(),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.s24),
        AppButton(
          label: 'Sign out',
          variant: AppButtonVariant.secondary,
          fullWidth: true,
          onPressed: () async {
            await ref.read(authProvider.notifier).signOut();
            if (context.mounted) context.go('/sign-in');
          },
        ),
      ],
    );
  }
}
