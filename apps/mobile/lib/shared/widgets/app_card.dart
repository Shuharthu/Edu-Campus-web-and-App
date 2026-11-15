import 'package:flutter/material.dart';
import '../core/theme/app_tokens.dart';

class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.padding = AppSpacing.s16,
    this.featuredDark = false,
    this.onTap,
  });

  final Widget child;
  final double padding;
  final bool featuredDark;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = featuredDark
        ? AppColors.ink
        : (isDark ? AppColors.darkCard : AppColors.lightCard);
    final borderColor = featuredDark
        ? Colors.transparent
        : (isDark ? AppColors.darkBorder : AppColors.lightBorder);

    final content = Container(
      padding: EdgeInsets.all(padding),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppRadius.r2xl),
        border: Border.all(color: borderColor, width: 1.0),
      ),
      child: child,
    );

    if (onTap == null) return content;
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.r2xl),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.r2xl),
        child: content,
      ),
    );
  }
}
