// AUTO-GENERATED FROM packages/ui-tokens/tokens.json — DO NOT EDIT DIRECTLY
import 'package:flutter/material.dart';

class AppSpacing {
  AppSpacing._();
  static const double s0 = 0.0; // Spacing-0
  static const double s2 = 2.0; // Spacing-25
  static const double s4 = 4.0; // Spacing-50
  static const double s6 = 6.0; // Spacing-60
  static const double s8 = 8.0; // Spacing-75
  static const double s10 = 10.0; // Spacing-90
  static const double s12 = 12.0; // Spacing-100
  static const double s16 = 16.0; // Spacing-200
  static const double s20 = 20.0; // Spacing-250
  static const double s24 = 24.0; // Spacing-300
  static const double s32 = 32.0; // Spacing-400
  static const double s40 = 40.0; // Spacing-500
  static const double s48 = 48.0; // Spacing-600
  static const double s64 = 64.0; // Spacing-700
  static const double s80 = 80.0; // Spacing-800
  static const double s96 = 96.0; // Spacing-900
}

class AppRadius {
  AppRadius._();
  static const double none = 0.0;
  static const double xs = 2.0;
  static const double sm = 4.0;
  static const double md = 6.0;
  static const double r6 = 6.0;
  static const double lg = 8.0;
  static const double r8 = 8.0;
  static const double xl = 12.0;
  static const double r12 = 12.0;
  static const double r16 = 16.0;
  static const double r2xl = 16.0;
  static const double r24 = 24.0;
  static const double r3xl = 24.0;
  static const double full = 9999.0;

  static double nested(double outerRadius, double gap) {
    if (gap < 32.0 && (outerRadius - gap) > 2.0) {
      return outerRadius - gap;
    }
    return outerRadius;
  }
}

typedef AppRadii = AppRadius;

class AppMotion {
  AppMotion._();
  static const Curve curve = Cubic(0.22, 1, 0.36, 1);
  static const Duration layoutDuration = Duration(milliseconds: 500);
  static const Duration colorDuration = Duration(milliseconds: 300);
}

class AppColors {
  AppColors._();

  // Basic utility colors
  static const Color white = Color(0xFFFFFFFF);
  static const Color white70 = Color(0xB3FFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color transparent = Color(0x00000000);

  // Brand
  static const Color ink = Color(0xFF0B1220);
  static const Color brandInk = Color(0xFF0B1220);
  static const Color brandWarmWhite = Color(0xFFFBFBFD);
  static const Color accentSuccess = Color(0xFF14B8A6);
  static const Color accentWarning = Color(0xFFF59E0B);
  static const Color teal = Color(0xFF14B8A6);
  static const Color brandTeal = Color(0xFF14B8A6);
  static const Color brightTeal = Color(0xFF2DD4BF);
  static const Color tealDeep = Color(0xFF0F766E);
  static const Color amber = Color(0xFFF59E0B);

  // Neutral tones
  static const Color neutral100 = Color(0xFFF1F5F9);
  static const Color neutral200 = Color(0xFFE2E8F0);
  static const Color neutral300 = Color(0xFFCBD5E1);
  static const Color neutral400 = Color(0xFF94A3B8);
  static const Color neutral500 = Color(0xFF64748B);
  static const Color neutral600 = Color(0xFF475569);
  static const Color neutral700 = Color(0xFF334155);
  static const Color neutral800 = Color(0xFF1E293B);
  static const Color neutral900 = Color(0xFF0F172A);

  // Dark flat surfaces
  static const Color darkCanvas = Color(0xFF000000);
  static const Color darkSidebar = Color(0xFF131209);
  static const Color darkElevated = Color(0xFF181818);
  static const Color darkCard = Color(0xFF1F1F1F);
  static const Color darkHover = Color(0xFF272727);
  static const Color darkBorder = Color(0xFF313131);
  static const Color darkTextPrimary = Color(0xFFF8FAFC);
  static const Color darkTextSecondary = Color(0xFFB3B8C2);
  static const Color darkTextMuted = Color(0xFF8B929E);

  // Light flat surfaces
  static const Color lightCanvas = Color(0xFFF5F7FA);
  static const Color lightSidebar = Color(0xFFFFFFFF);
  static const Color lightElevated = Color(0xFFEEF2F6);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightHover = Color(0xFFE2E8F0);
  static const Color lightBorder = Color(0xFFE2E8F0);
  static const Color lightTextPrimary = Color(0xFF0B1220);
  static const Color lightTextSecondary = Color(0xFF475569);
  static const Color lightTextMuted = Color(0xFF64748B);

  // Semantic (4.5:1 contrast)
  static const Color lightSuccessText = Color(0xFF0F766E);
  static const Color lightSuccessBg = Color(0xFFCCFBF1);
  static const Color lightWarningText = Color(0xFF92400E);
  static const Color lightWarningBg = Color(0xFFFEF3C7);
  static const Color lightDangerText = Color(0xFFB91C1C);
  static const Color lightDangerBg = Color(0xFFFEE2E2);
  static const Color lightInfoText = Color(0xFF0369A1);
  static const Color lightInfoBg = Color(0xFFE0F2FE);

  static const Color darkSuccessText = Color(0xFF2DD4BF);
  static const Color darkSuccessBg = Color(0xFF14332E);
  static const Color darkWarningText = Color(0xFFFBBF24);
  static const Color darkWarningBg = Color(0xFF332611);
  static const Color darkDangerText = Color(0xFFFCA5A5);
  static const Color darkDangerBg = Color(0xFF3B1818);
  static const Color darkInfoText = Color(0xFF38BDF8);
  static const Color darkInfoBg = Color(0xFF122B3B);
}

class AppTextStyles {
  AppTextStyles._();
  static const String fontFamilySans = 'Geist';
  static const String fontFamilyMono = 'Geist Mono';

  static const TextStyle heading1 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 60.0,
    height: 1.0000,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle heading2 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 48.0,
    height: 1.0000,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle heading3 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 36.0,
    height: 1.1111,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle heading4 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 30.0,
    height: 1.2000,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle heading5 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 24.0,
    height: 1.3333,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle heading6 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 20.0,
    height: 1.4000,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle title1 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 20.0,
    height: 1.4000,
    fontWeight: FontWeight.w500,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle title2 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 18.0,
    height: 1.5556,
    fontWeight: FontWeight.w500,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle title3 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 16.0,
    height: 1.5000,
    fontWeight: FontWeight.w500,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle title4 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 14.0,
    height: 1.4286,
    fontWeight: FontWeight.w500,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle title5 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 12.0,
    height: 1.3333,
    fontWeight: FontWeight.w500,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle body1 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 16.0,
    height: 1.5000,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle body2 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 16.0,
    height: 1.5000,
    fontWeight: FontWeight.w500,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle body3 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 16.0,
    height: 1.5000,
    fontWeight: FontWeight.w400,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle body4 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 14.0,
    height: 1.4286,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle body5 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 14.0,
    height: 1.4286,
    fontWeight: FontWeight.w500,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle body6 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 14.0,
    height: 1.4286,
    fontWeight: FontWeight.w400,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle buttonLg = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 18.0,
    height: 1.5556,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle buttonMd = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 16.0,
    height: 1.5000,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle buttonSm = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 14.0,
    height: 1.4286,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle buttonXsm = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 12.0,
    height: 1.3333,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle caption1 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 14.0,
    height: 1.4286,
    fontWeight: FontWeight.w500,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle caption2 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 14.0,
    height: 1.4286,
    fontWeight: FontWeight.w400,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle caption3 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 12.0,
    height: 1.3333,
    fontWeight: FontWeight.w600,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle caption4 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 12.0,
    height: 1.3333,
    fontWeight: FontWeight.w500,
    fontStyle: FontStyle.normal,
  );

  static const TextStyle caption5 = TextStyle(
    fontFamily: fontFamilySans,
    fontSize: 12.0,
    height: 1.3333,
    fontWeight: FontWeight.w400,
    fontStyle: FontStyle.normal,
  );

  static TextStyle mono(TextStyle base) => base.copyWith(
        fontFamily: fontFamilyMono,
        fontFeatures: const [FontFeature.tabularFigures()],
      );
}

class AppTheme {
  AppTheme._();

  static ThemeData light() {
    const scheme = ColorScheme.light(
      primary: AppColors.teal,
      onPrimary: AppColors.ink,
      secondary: AppColors.ink,
      onSecondary: AppColors.lightCard,
      tertiary: AppColors.amber,
      onTertiary: AppColors.ink,
      surface: AppColors.lightCard,
      onSurface: AppColors.lightTextPrimary,
      surfaceContainerLowest: AppColors.lightCanvas,
      surfaceContainerLow: AppColors.lightElevated,
      outline: AppColors.lightBorder,
      error: AppColors.lightDangerText,
      onError: AppColors.lightCard,
    );
    return _buildTheme(scheme, AppColors.lightCanvas, AppColors.lightTextPrimary);
  }

  static ThemeData dark() {
    const scheme = ColorScheme.dark(
      primary: AppColors.brightTeal,
      onPrimary: AppColors.ink,
      secondary: AppColors.teal,
      onSecondary: AppColors.ink,
      tertiary: AppColors.amber,
      onTertiary: AppColors.ink,
      surface: AppColors.darkCard,
      onSurface: AppColors.darkTextPrimary,
      surfaceContainerLowest: AppColors.darkCanvas,
      surfaceContainerLow: AppColors.darkElevated,
      outline: AppColors.darkBorder,
      error: AppColors.darkDangerText,
      onError: AppColors.darkCanvas,
    );
    return _buildTheme(scheme, AppColors.darkCanvas, AppColors.darkTextPrimary);
  }

  static ThemeData _buildTheme(ColorScheme scheme, Color scaffoldBg, Color textColor) {
    final textTheme = TextTheme(
      displayLarge: AppTextStyles.heading1.copyWith(color: textColor),
      displayMedium: AppTextStyles.heading2.copyWith(color: textColor),
      displaySmall: AppTextStyles.heading3.copyWith(color: textColor),
      headlineLarge: AppTextStyles.heading4.copyWith(color: textColor),
      headlineMedium: AppTextStyles.heading5.copyWith(color: textColor),
      headlineSmall: AppTextStyles.heading6.copyWith(color: textColor),
      titleLarge: AppTextStyles.title1.copyWith(color: textColor),
      titleMedium: AppTextStyles.title3.copyWith(color: textColor),
      titleSmall: AppTextStyles.title4.copyWith(color: textColor),
      bodyLarge: AppTextStyles.body3.copyWith(color: textColor),
      bodyMedium: AppTextStyles.body6.copyWith(color: textColor),
      bodySmall: AppTextStyles.caption2.copyWith(color: textColor),
      labelLarge: AppTextStyles.buttonMd.copyWith(color: textColor),
      labelMedium: AppTextStyles.buttonSm.copyWith(color: textColor),
      labelSmall: AppTextStyles.caption4.copyWith(color: textColor),
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: scaffoldBg,
      fontFamily: AppTextStyles.fontFamilySans,
      textTheme: textTheme,
      dividerTheme: DividerThemeData(color: scheme.outline, thickness: 1),
    );
  }
}
