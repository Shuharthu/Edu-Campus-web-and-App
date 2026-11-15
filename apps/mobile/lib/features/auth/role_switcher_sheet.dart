import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_chip.dart';
import '../../shared/widgets/app_list_tile.dart';
import 'auth_provider.dart';

class RoleSwitcherSheet extends ConsumerWidget {
  const RoleSwitcherSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.s24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Switch active role', style: AppTextStyles.heading6),
            const SizedBox(height: AppSpacing.s4),
            Text(
              'Navigation and data scope update immediately.',
              style: AppTextStyles.body6,
            ),
            const SizedBox(height: AppSpacing.s16),
            for (final assignment in auth.assignments)
              AppListTile(
                leading: Icon(
                  assignment.id == auth.activeRole?.id
                      ? PhosphorIconsFill.checkCircle
                      : PhosphorIconsRegular.userCircle,
                  color: Theme.of(context).colorScheme.primary,
                ),
                title: assignment.roleName,
                subtitle: assignment.departmentCode != null
                    ? '${assignment.scopeType} · ${assignment.departmentCode}'
                    : assignment.scopeType,
                trailing: assignment.isActing
                    ? const AppChip(label: 'Acting', tone: AppChipTone.warning)
                    : null,
                onTap: () {
                  ref.read(authProvider.notifier).switchRole(assignment);
                  Navigator.of(context).pop();
                },
              ),
            const SizedBox(height: AppSpacing.s12),
            AppButton(
              label: 'Close',
              variant: AppButtonVariant.secondary,
              fullWidth: true,
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      ),
    );
  }
}
