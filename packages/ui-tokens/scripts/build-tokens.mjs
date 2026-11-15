import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkgRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(pkgRoot, '..', '..');

const checkOnly = process.argv.includes('--check');
const tokens = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'tokens.json'), 'utf8'));

function toFlutterColor(hex) {
  const clean = hex.replace('#', '').toUpperCase();
  return `Color(0xFF${clean})`;
}

function toCamelCase(kebab) {
  return kebab.replace(/-([a-z0-9])/gi, (_, ch) => ch.toUpperCase());
}

function generateTailwindPreset() {
  const spacingObj = Object.fromEntries(
    Object.values(tokens.spacing).map((px) => [String(px), `${px}px`]),
  );
  const fontSizeObj = Object.fromEntries(
    Object.entries(tokens.typeScale).map(([k, v]) => [
      k,
      [`${v.size}px`, { lineHeight: `${v.lineHeight}px` }],
    ]),
  );
  const borderRadiusObj = Object.fromEntries(
    Object.entries(tokens.radius).map(([k, v]) => [k, v === 9999 ? '9999px' : `${v}px`]),
  );

  return `// AUTO-GENERATED FROM packages/ui-tokens/tokens.json — DO NOT EDIT DIRECTLY
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  theme: {
    fontFamily: {
      sans: ['var(--font-geist-sans)', 'Geist', 'system-ui', 'sans-serif'],
      mono: ['var(--font-geist-mono)', 'Geist Mono', 'monospace'],
    },
    fontSize: ${JSON.stringify(fontSizeObj, null, 6)},
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
    },
    spacing: ${JSON.stringify(spacingObj, null, 6)},
    borderRadius: ${JSON.stringify(borderRadiusObj, null, 6)},
    extend: {
      colors: {
        brand: {
          ink: '${tokens.colors.brand.ink}',
          teal: '${tokens.colors.brand.teal}',
          'bright-teal': '${tokens.colors.brand.brightTeal}',
          'teal-deep': '${tokens.colors.brand.tealDeep}',
          amber: '${tokens.colors.brand.amber}',
        },
        surface: {
          black: '#000000',
          sidebar: '#131209',
          elevated: '#181818',
          card: '#1F1F1F',
          hover: '#272727',
          border: '#313131',
        },
      },
      transitionTimingFunction: {
        smartedu: 'cubic-bezier(${tokens.motion.bezier.join(', ')})',
      },
      transitionDuration: {
        layout: '${tokens.motion.layoutMs}ms',
        color: '${tokens.motion.colorMs}ms',
      },
    },
  },
};
`;
}

function generateTokensCss() {
  const styleLines = Object.entries(tokens.textStyles)
    .map(([name, def]) => {
      const scale = tokens.typeScale[def.scale];
      return `.${name} {\n  font-size: ${scale.size}px;\n  line-height: ${scale.lineHeight}px;\n  font-weight: ${def.weight};\n  font-style: normal;\n}`;
    })
    .join('\n\n');

  return `/* AUTO-GENERATED FROM packages/ui-tokens/tokens.json — DO NOT EDIT DIRECTLY */
:root {
  --se-bg-canvas: ${tokens.colors.light.canvas};
  --se-bg-sidebar: ${tokens.colors.light.sidebar};
  --se-bg-elevated: ${tokens.colors.light.elevated};
  --se-bg-card: ${tokens.colors.light.card};
  --se-bg-hover: ${tokens.colors.light.hover};
  --se-border: ${tokens.colors.light.border};
  --se-text-primary: ${tokens.colors.light.textPrimary};
  --se-text-secondary: ${tokens.colors.light.textSecondary};
  --se-text-muted: ${tokens.colors.light.textMuted};
  --se-brand-ink: ${tokens.colors.brand.ink};
  --se-brand-teal: ${tokens.colors.brand.teal};
  --se-brand-bright-teal: ${tokens.colors.brand.brightTeal};
  --se-brand-amber: ${tokens.colors.brand.amber};
  --se-success-text: ${tokens.colors.semantic.light.successText};
  --se-success-bg: ${tokens.colors.semantic.light.successBg};
  --se-warning-text: ${tokens.colors.semantic.light.warningText};
  --se-warning-bg: ${tokens.colors.semantic.light.warningBg};
  --se-danger-text: ${tokens.colors.semantic.light.dangerText};
  --se-danger-bg: ${tokens.colors.semantic.light.dangerBg};
  --se-info-text: ${tokens.colors.semantic.light.infoText};
  --se-info-bg: ${tokens.colors.semantic.light.infoBg};
  --se-ease: cubic-bezier(${tokens.motion.bezier.join(', ')});
}

.dark {
  --se-bg-canvas: ${tokens.colors.dark.canvas};
  --se-bg-sidebar: ${tokens.colors.dark.sidebar};
  --se-bg-elevated: ${tokens.colors.dark.elevated};
  --se-bg-card: ${tokens.colors.dark.card};
  --se-bg-hover: ${tokens.colors.dark.hover};
  --se-border: ${tokens.colors.dark.border};
  --se-text-primary: ${tokens.colors.dark.textPrimary};
  --se-text-secondary: ${tokens.colors.dark.textSecondary};
  --se-text-muted: ${tokens.colors.dark.textMuted};
  --se-success-text: ${tokens.colors.semantic.dark.successText};
  --se-success-bg: ${tokens.colors.semantic.dark.successBg};
  --se-warning-text: ${tokens.colors.semantic.dark.warningText};
  --se-warning-bg: ${tokens.colors.semantic.dark.warningBg};
  --se-danger-text: ${tokens.colors.semantic.dark.dangerText};
  --se-danger-bg: ${tokens.colors.semantic.dark.dangerBg};
  --se-info-text: ${tokens.colors.semantic.dark.infoText};
  --se-info-bg: ${tokens.colors.semantic.dark.infoBg};
}

${styleLines}
`;
}

function generateDartTokens() {
  const spacingLines = Object.entries(tokens.spacing)
    .map(([k, v]) => `  static const double s${v} = ${v}.0; // Spacing-${k}`)
    .join('\n');

  const radiusLines = Object.entries(tokens.radius)
    .map(([k, v]) => `  static const double ${k === '2xl' ? 'r2xl' : k === '3xl' ? 'r3xl' : k} = ${v}.0;`)
    .join('\n');

  const textStyleGetters = Object.entries(tokens.textStyles)
    .map(([name, def]) => {
      const scale = tokens.typeScale[def.scale];
      const weight =
        def.weight === 600
          ? 'FontWeight.w600'
          : def.weight === 500
            ? 'FontWeight.w500'
            : 'FontWeight.w400';
      const heightRatio = (scale.lineHeight / scale.size).toFixed(4);
      const camel = toCamelCase(name.toLowerCase());
      return `  static const TextStyle ${camel} = TextStyle(\n    fontFamily: fontFamilySans,\n    fontSize: ${scale.size}.0,\n    height: ${heightRatio},\n    fontWeight: ${weight},\n    fontStyle: FontStyle.normal,\n  );`;
    })
    .join('\n\n');

  return `// AUTO-GENERATED FROM packages/ui-tokens/tokens.json — DO NOT EDIT DIRECTLY
import 'package:flutter/material.dart';

class AppSpacing {
  AppSpacing._();
${spacingLines}
}

class AppRadius {
  AppRadius._();
${radiusLines}

  static double nested(double outerRadius, double gap) {
    if (gap < 32.0 && (outerRadius - gap) > 2.0) {
      return outerRadius - gap;
    }
    return outerRadius;
  }
}

class AppMotion {
  AppMotion._();
  static const Curve curve = Cubic(${tokens.motion.bezier[0]}, ${tokens.motion.bezier[1]}, ${tokens.motion.bezier[2]}, ${tokens.motion.bezier[3]});
  static const Duration layoutDuration = Duration(milliseconds: ${tokens.motion.layoutMs});
  static const Duration colorDuration = Duration(milliseconds: ${tokens.motion.colorMs});
}

class AppColors {
  AppColors._();

  // Brand
  static const Color ink = ${toFlutterColor(tokens.colors.brand.ink)};
  static const Color teal = ${toFlutterColor(tokens.colors.brand.teal)};
  static const Color brightTeal = ${toFlutterColor(tokens.colors.brand.brightTeal)};
  static const Color tealDeep = ${toFlutterColor(tokens.colors.brand.tealDeep)};
  static const Color amber = ${toFlutterColor(tokens.colors.brand.amber)};

  // Dark flat surfaces
  static const Color darkCanvas = ${toFlutterColor(tokens.colors.dark.canvas)};
  static const Color darkSidebar = ${toFlutterColor(tokens.colors.dark.sidebar)};
  static const Color darkElevated = ${toFlutterColor(tokens.colors.dark.elevated)};
  static const Color darkCard = ${toFlutterColor(tokens.colors.dark.card)};
  static const Color darkHover = ${toFlutterColor(tokens.colors.dark.hover)};
  static const Color darkBorder = ${toFlutterColor(tokens.colors.dark.border)};
  static const Color darkTextPrimary = ${toFlutterColor(tokens.colors.dark.textPrimary)};
  static const Color darkTextSecondary = ${toFlutterColor(tokens.colors.dark.textSecondary)};
  static const Color darkTextMuted = ${toFlutterColor(tokens.colors.dark.textMuted)};

  // Light flat surfaces
  static const Color lightCanvas = ${toFlutterColor(tokens.colors.light.canvas)};
  static const Color lightSidebar = ${toFlutterColor(tokens.colors.light.sidebar)};
  static const Color lightElevated = ${toFlutterColor(tokens.colors.light.elevated)};
  static const Color lightCard = ${toFlutterColor(tokens.colors.light.card)};
  static const Color lightHover = ${toFlutterColor(tokens.colors.light.hover)};
  static const Color lightBorder = ${toFlutterColor(tokens.colors.light.border)};
  static const Color lightTextPrimary = ${toFlutterColor(tokens.colors.light.textPrimary)};
  static const Color lightTextSecondary = ${toFlutterColor(tokens.colors.light.textSecondary)};
  static const Color lightTextMuted = ${toFlutterColor(tokens.colors.light.textMuted)};

  // Semantic (4.5:1 contrast)
  static const Color lightSuccessText = ${toFlutterColor(tokens.colors.semantic.light.successText)};
  static const Color lightSuccessBg = ${toFlutterColor(tokens.colors.semantic.light.successBg)};
  static const Color lightWarningText = ${toFlutterColor(tokens.colors.semantic.light.warningText)};
  static const Color lightWarningBg = ${toFlutterColor(tokens.colors.semantic.light.warningBg)};
  static const Color lightDangerText = ${toFlutterColor(tokens.colors.semantic.light.dangerText)};
  static const Color lightDangerBg = ${toFlutterColor(tokens.colors.semantic.light.dangerBg)};
  static const Color lightInfoText = ${toFlutterColor(tokens.colors.semantic.light.infoText)};
  static const Color lightInfoBg = ${toFlutterColor(tokens.colors.semantic.light.infoBg)};

  static const Color darkSuccessText = ${toFlutterColor(tokens.colors.semantic.dark.successText)};
  static const Color darkSuccessBg = ${toFlutterColor(tokens.colors.semantic.dark.successBg)};
  static const Color darkWarningText = ${toFlutterColor(tokens.colors.semantic.dark.warningText)};
  static const Color darkWarningBg = ${toFlutterColor(tokens.colors.semantic.dark.warningBg)};
  static const Color darkDangerText = ${toFlutterColor(tokens.colors.semantic.dark.dangerText)};
  static const Color darkDangerBg = ${toFlutterColor(tokens.colors.semantic.dark.dangerBg)};
  static const Color darkInfoText = ${toFlutterColor(tokens.colors.semantic.dark.infoText)};
  static const Color darkInfoBg = ${toFlutterColor(tokens.colors.semantic.dark.infoBg)};
}

class AppTextStyles {
  AppTextStyles._();
  static const String fontFamilySans = '${tokens.fonts.sans}';
  static const String fontFamilyMono = '${tokens.fonts.mono}';

${textStyleGetters}

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
`;
}

const outputs = [
  {
    file: path.join(pkgRoot, 'dist', 'tailwind.preset.cjs'),
    content: generateTailwindPreset(),
  },
  {
    file: path.join(pkgRoot, 'dist', 'tokens.css'),
    content: generateTokensCss(),
  },
  {
    file: path.join(repoRoot, 'apps', 'mobile', 'lib', 'core', 'theme', 'app_tokens.dart'),
    content: generateDartTokens(),
  },
];

let drifted = false;
for (const out of outputs) {
  if (checkOnly) {
    const existing = fs.existsSync(out.file) ? fs.readFileSync(out.file, 'utf8') : null;
    if (existing !== out.content) {
      console.error(`Token drift detected: ${path.relative(repoRoot, out.file)}`);
      drifted = true;
    }
  } else {
    fs.mkdirSync(path.dirname(out.file), { recursive: true });
    fs.writeFileSync(out.file, out.content, 'utf8');
    console.log(`Generated: ${path.relative(repoRoot, out.file)}`);
  }
}

if (drifted) {
  process.exit(1);
}
