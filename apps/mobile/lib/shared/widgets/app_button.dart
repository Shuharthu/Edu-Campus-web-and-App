import 'package:flutter/material.dart';
import '../core/theme/app_tokens.dart';

enum AppButtonVariant { primary, secondary, ghost, outline }
enum AppButtonSize { small, medium, large }

class AppButton extends StatefulWidget {
  const AppButton({
    super.key,
    String? label,
    String? text,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.medium,
    this.isLoading = false,
    this.disabled = false,
    this.icon,
    this.fullWidth = false,
  }) : label = text ?? label ?? '';

  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool isLoading;
  final bool disabled;
  final IconData? icon;
  final bool fullWidth;

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final disableAnim = MediaQuery.disableAnimationsOf(context);

    final bgColor = switch (widget.variant) {
      AppButtonVariant.primary => isDark ? AppColors.brightTeal : AppColors.teal,
      AppButtonVariant.secondary => isDark ? AppColors.darkHover : AppColors.lightCard,
      AppButtonVariant.ghost => Colors.transparent,
      AppButtonVariant.outline => Colors.transparent,
    };

    final fgColor = switch (widget.variant) {
      AppButtonVariant.primary => AppColors.ink,
      AppButtonVariant.secondary => isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
      AppButtonVariant.ghost => isDark ? AppColors.brightTeal : AppColors.tealDeep,
      AppButtonVariant.outline => isDark ? AppColors.brightTeal : AppColors.tealDeep,
    };

    final borderColor = switch (widget.variant) {
      AppButtonVariant.primary => Colors.transparent,
      AppButtonVariant.secondary => isDark ? AppColors.darkBorder : AppColors.lightBorder,
      AppButtonVariant.ghost => Colors.transparent,
      AppButtonVariant.outline => isDark ? AppColors.brightTeal : AppColors.tealDeep,
    };

    final isClickable = widget.onPressed != null && !widget.isLoading && !widget.disabled;

    return Semantics(
      button: true,
      enabled: isClickable,
      label: widget.label,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          minHeight: 44.0,
          minWidth: widget.fullWidth ? double.infinity : 0.0,
        ),
        child: AnimatedScale(
          scale: _pressed && !disableAnim ? 0.98 : 1.0,
          duration: disableAnim ? Duration.zero : AppMotion.colorDuration,
          curve: AppMotion.curve,
          child: Material(
            color: bgColor,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            child: InkWell(
              onTap: isClickable ? widget.onPressed : null,
              onHighlightChanged: (v) => setState(() => _pressed = v),
              borderRadius: BorderRadius.circular(AppRadius.lg),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  vertical: AppSpacing.s8,
                  horizontal: AppSpacing.s12,
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: borderColor, width: 1.0),
                ),
                child: Row(
                  mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (widget.icon != null) ...[
                      Icon(widget.icon, size: 18, color: fgColor),
                      const SizedBox(width: AppSpacing.s8),
                    ],
                    Text(
                      widget.isLoading ? 'Working...' : widget.label,
                      style: AppTextStyles.buttonMd.copyWith(color: fgColor),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
