import 'package:flutter/material.dart';
import '../core/theme/app_tokens.dart';

enum AppChipTone { neutral, success, warning, danger, info }
typedef ChipTone = AppChipTone;
typedef AppChipVariant = AppChipTone;

class AppChip extends StatelessWidget {
  const AppChip({
    super.key,
    required this.label,
    this.tone = AppChipTone.neutral,
    AppChipTone? variant,
    this.icon,
    this.isSelected = false,
    this.onTap,
  }) : actualTone = variant ?? tone;

  final String label;
  final AppChipTone tone;
  final AppChipTone actualTone;
  final IconData? icon;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final (bg, fg) = switch (actualTone) {
      AppChipTone.neutral => isDark
          ? (AppColors.darkHover, AppColors.darkTextSecondary)
          : (AppColors.lightElevated, AppColors.lightTextSecondary),
      AppChipTone.success => isDark
          ? (AppColors.darkSuccessBg, AppColors.darkSuccessText)
          : (AppColors.lightSuccessBg, AppColors.lightSuccessText),
      AppChipTone.warning => isDark
          ? (AppColors.darkWarningBg, AppColors.darkWarningText)
          : (AppColors.lightWarningBg, AppColors.lightWarningText),
      AppChipTone.danger => isDark
          ? (AppColors.darkDangerBg, AppColors.darkDangerText)
          : (AppColors.lightDangerBg, AppColors.lightDangerText),
      AppChipTone.info => isDark
          ? (AppColors.darkInfoBg, AppColors.darkInfoText)
          : (AppColors.lightInfoBg, AppColors.lightInfoText),
    };

    final effectiveBg = isSelected ? (isDark ? AppColors.brightTeal : AppColors.teal) : bg;
    final effectiveFg = isSelected ? AppColors.ink : fg;

    final content = Container(
      padding: const EdgeInsets.symmetric(
        vertical: AppSpacing.s4,
        horizontal: AppSpacing.s12,
      ),
      decoration: BoxDecoration(
        color: effectiveBg,
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: effectiveFg),
            const SizedBox(width: AppSpacing.s4),
          ],
          Text(
            label,
            style: AppTextStyles.caption3.copyWith(color: effectiveFg),
          ),
        ],
      ),
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: content,
      );
    }
    return content;
  }
}
