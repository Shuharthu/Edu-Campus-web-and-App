import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class ResultsScreen extends StatefulWidget {
  final String studentName;
  final String studentNumber;
  final double currentCgpa;
  final int totalCredits;

  const ResultsScreen({
    super.key,
    this.studentName = 'Rafiq Hasan',
    this.studentNumber = '2024-CSE-0042',
    this.currentCgpa = 3.21,
    this.totalCredits = 54,
  });

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  double _targetCgpa = 3.50;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // What-If math: target CGPA across 18 upcoming credits
    // (54 * 3.21 + 18 * targetTermGpa) / (54 + 18) = _targetCgpa
    // 173.34 + 18 * targetTermGpa = 72 * _targetCgpa
    final totalPastPoints = widget.totalCredits * widget.currentCgpa;
    const upcomingCredits = 18;
    final totalFutureCredits = widget.totalCredits + upcomingCredits;
    final requiredPoints = (_targetCgpa * totalFutureCredits) - totalPastPoints;
    final requiredTermGpa = (requiredPoints / upcomingCredits).clamp(0.0, 4.0);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkCanvas : AppColors.lightCanvas,
      appBar: AppBar(
        title: Text(
          'Academic Scorecard',
          style: AppTextStyles.title2.copyWith(
            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: isDark ? AppColors.darkCanvas : AppColors.lightCanvas,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            PhosphorIcons.arrowLeft(),
            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.s16,
            vertical: AppSpacing.s12,
          ),
          children: [
            // Student Profile Banner
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.studentName,
                      style: AppTextStyles.title1.copyWith(
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s2),
                    Text(
                      '${widget.studentNumber} • BS-CSE • Fall 2026',
                      style: AppTextStyles.caption2.copyWith(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                    ),
                  ],
                ),
                AppChip(
                  label: 'Good Standing',
                  variant: AppChipVariant.success,
                  icon: PhosphorIcons.checkCircle(PhosphorIconsStyle.fill),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.s16),

            // CGPA Highlight Card
            Container(
              padding: const EdgeInsets.all(AppSpacing.s16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.ink, AppColors.tealDeep],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(AppRadius.r2xl),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Cumulative GPA (CGPA)',
                        style: AppTextStyles.caption1.copyWith(
                          color: AppColors.white70,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        'Scale: 4.00',
                        style: AppTextStyles.caption2.copyWith(
                          color: AppColors.brightTeal,
                          fontFamily: AppTextStyles.fontFamilyMono,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s8),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        widget.currentCgpa.toStringAsFixed(2),
                        style: AppTextStyles.heading1.copyWith(
                          color: AppColors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s8),
                      Text(
                        '/ 4.00',
                        style: AppTextStyles.body4.copyWith(
                          color: AppColors.white70,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${widget.totalCredits} Credits Completed',
                        style: AppTextStyles.caption1.copyWith(
                          color: AppColors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        'Term GPA: 3.25',
                        style: AppTextStyles.caption1.copyWith(
                          color: AppColors.brightTeal,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s16),

            // "Ask Smart EDU" AI Insights Card (Parity with User Mockup)
            Container(
              padding: const EdgeInsets.all(AppSpacing.s16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCard : AppColors.white,
                borderRadius: BorderRadius.circular(AppRadius.r2xl),
                border: Border.all(
                  color: AppColors.teal.withValues(alpha: 0.3),
                  width: 1.5,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.s4),
                        decoration: BoxDecoration(
                          color: AppColors.teal.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          PhosphorIcons.sparkle(PhosphorIconsStyle.fill),
                          size: 16,
                          color: AppColors.teal,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s8),
                      Text(
                        'Ask Smart EDU: AI Academic Insights',
                        style: AppTextStyles.body3.copyWith(
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s8),
                  Text(
                    'You have attended 15 out of 18 classes in CSE204 (83.3%). You can miss up to 2 more classes and still maintain exam eligibility (≥75%).',
                    style: AppTextStyles.body5.copyWith(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.s8,
                      vertical: AppSpacing.s4,
                    ),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkWarningBg : AppColors.lightWarningBg,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          PhosphorIcons.warning(PhosphorIconsStyle.fill),
                          size: 14,
                          color: isDark ? AppColors.darkWarningText : AppColors.lightWarningText,
                        ),
                        const SizedBox(width: AppSpacing.s4),
                        Expanded(
                          child: Text(
                            'Midterm score in CSE204 (58%) is under 60%. Departmental moderation review active.',
                            style: AppTextStyles.caption3.copyWith(
                              color: isDark ? AppColors.darkWarningText : AppColors.lightWarningText,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s24),

            // Section: Current Courses Breakdown
            Text(
              'Enrolled Course Performance',
              style: AppTextStyles.title3.copyWith(
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
              ),
            ),
            const SizedBox(height: AppSpacing.s8),

            _buildCourseGradeTile(
              isDark: isDark,
              code: 'CSE204',
              title: 'Data Structures & Algorithms',
              grade: 'B+',
              points: '3.25',
              credits: '4.0',
              attdPct: 83.3,
            ),
            const SizedBox(height: AppSpacing.s8),
            _buildCourseGradeTile(
              isDark: isDark,
              code: 'EEE201',
              title: 'Circuit Analysis',
              grade: 'A-',
              points: '3.50',
              credits: '3.0',
              attdPct: 88.0,
            ),
            const SizedBox(height: AppSpacing.s8),
            _buildCourseGradeTile(
              isDark: isDark,
              code: 'BUS101',
              title: 'Principles of Management',
              grade: 'A',
              points: '3.75',
              credits: '3.0',
              attdPct: 92.0,
            ),
            const SizedBox(height: AppSpacing.s8),
            _buildCourseGradeTile(
              isDark: isDark,
              code: 'MAT201',
              title: 'Discrete Mathematics',
              grade: 'B',
              points: '3.00',
              credits: '3.0',
              attdPct: 85.0,
            ),

            const SizedBox(height: AppSpacing.s24),

            // What-If Simulator Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        PhosphorIcons.calculator(),
                        size: 18,
                        color: AppColors.teal,
                      ),
                      const SizedBox(width: AppSpacing.s8),
                      Text(
                        'What-If CGPA Simulator',
                        style: AppTextStyles.title3.copyWith(
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Text(
                    'Estimate the GPA you need next semester to achieve your graduation goal.',
                    style: AppTextStyles.caption2.copyWith(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Target CGPA Goal:',
                        style: AppTextStyles.body4.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        _targetCgpa.toStringAsFixed(2),
                        style: AppTextStyles.title2.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.teal,
                        ),
                      ),
                    ],
                  ),

                  Slider(
                    value: _targetCgpa,
                    min: 3.0,
                    max: 4.0,
                    divisions: 20,
                    activeColor: AppColors.teal,
                    inactiveColor: isDark ? AppColors.darkElevated : AppColors.lightElevated,
                    onChanged: (val) {
                      setState(() {
                        _targetCgpa = val;
                      });
                    },
                  ),

                  const SizedBox(height: AppSpacing.s8),

                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(AppSpacing.s12),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkElevated : AppColors.lightElevated,
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Required Semester GPA:',
                          style: AppTextStyles.caption3.copyWith(
                            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.s2),
                        Text(
                          requiredTermGpa > 4.0
                            ? 'Target exceeds maximum possible GPA (4.00) in 1 semester.'
                            : '${requiredTermGpa.toStringAsFixed(2)} GPA across 18 credits in Spring 2027',
                          style: AppTextStyles.body3.copyWith(
                            fontWeight: FontWeight.w600,
                            color: requiredTermGpa > 4.0 ? AppColors.amber : AppColors.teal,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s24),
          ],
        ),
      ),
    );
  }

  Widget _buildCourseGradeTile({
    required bool isDark,
    required String code,
    required String title,
    required String grade,
    required String points,
    required String credits,
    required double attdPct,
  }) {
    return AppCard(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      code,
                      style: AppTextStyles.body3.copyWith(
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.s8),
                    Text(
                      '$credits Cr',
                      style: AppTextStyles.caption2.copyWith(
                        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.s2),
                Text(
                  title,
                  style: AppTextStyles.caption2.copyWith(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
                const SizedBox(height: AppSpacing.s4),
                Text(
                  'Attendance: $attdPct%',
                  style: AppTextStyles.caption3.copyWith(
                    color: attdPct >= 75 ? AppColors.teal : AppColors.amber,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.s12,
              vertical: AppSpacing.s8,
            ),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkElevated : AppColors.lightElevated,
              borderRadius: BorderRadius.circular(AppRadius.lg),
            ),
            child: Column(
              children: [
                Text(
                  grade,
                  style: AppTextStyles.title2.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.teal,
                  ),
                ),
                Text(
                  points,
                  style: AppTextStyles.caption3.copyWith(
                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    fontFamily: AppTextStyles.fontFamilyMono,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
