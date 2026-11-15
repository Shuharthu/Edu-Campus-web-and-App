import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class AdmitCardScreen extends StatelessWidget {
  final String studentName;
  final String studentNumber;
  final String program;
  final String examName;
  final String courseCode;
  final String courseTitle;
  final String date;
  final String time;
  final String venue;
  final String seatNumber;
  final String qrToken;

  const AdmitCardScreen({
    super.key,
    this.studentName = 'Rafiq Hasan',
    this.studentNumber = '2024-CSE-0042',
    this.program = 'BS Computer Science & Eng.',
    this.examName = 'Midterm Examination',
    this.courseCode = 'CSE204',
    this.courseTitle = 'Data Structures & Algorithms',
    this.date = 'Nov 25, 2026',
    this.time = '09:00 AM – 11:00 AM',
    this.venue = 'Hall C (Engineering Bldg)',
    this.seatNumber = 'Seat 42',
    this.qrToken = 'smartedu_admit_7f8a92e4b01c',
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkCanvas : AppColors.lightCanvas,
      appBar: AppBar(
        title: Text(
          'Digital Admit Card',
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
            // Official Admit Card Container with Clean University Security Card Style
            Container(
              padding: const EdgeInsets.all(AppSpacing.s20),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCard : AppColors.white,
                borderRadius: BorderRadius.circular(AppRadius.r2xl),
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.ink.withValues(alpha: 0.06),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // University Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'SMART UNIVERSITY',
                            style: AppTextStyles.caption2.copyWith(
                              letterSpacing: 1.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.teal,
                            ),
                          ),
                          Text(
                            'OFFICE OF THE REGISTRAR',
                            style: AppTextStyles.caption3.copyWith(
                              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                            ),
                          ),
                        ],
                      ),
                      AppChip(
                        label: 'Fall 2026',
                        variant: AppChipVariant.info,
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.s16),
                  const Divider(),
                  const SizedBox(height: AppSpacing.s12),

                  // Candidate Details
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkElevated : AppColors.lightElevated,
                          borderRadius: BorderRadius.circular(AppRadius.lg),
                        ),
                        child: Center(
                          child: Icon(
                            PhosphorIcons.user(PhosphorIconsStyle.bold),
                            size: 26,
                            color: AppColors.teal,
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              studentName,
                              style: AppTextStyles.title2.copyWith(
                                fontWeight: FontWeight.w700,
                                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.s2),
                            Text(
                              'ID: $studentNumber',
                              style: AppTextStyles.caption1.copyWith(
                                fontFamily: AppTextStyles.fontFamilyMono,
                                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                              ),
                            ),
                            Text(
                              program,
                              style: AppTextStyles.caption2.copyWith(
                                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.s16),

                  // Seat & Hall Highlight Box
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.s16,
                      vertical: AppSpacing.s12,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.teal.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppRadius.xl),
                      border: Border.all(
                        color: AppColors.teal.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'EXAM VENUE',
                              style: AppTextStyles.caption3.copyWith(
                                color: AppColors.tealDeep,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.s2),
                            Text(
                              venue,
                              style: AppTextStyles.body3.copyWith(
                                fontWeight: FontWeight.w600,
                                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.s12,
                            vertical: AppSpacing.s6,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.teal,
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                          ),
                          child: Text(
                            seatNumber,
                            style: AppTextStyles.body2.copyWith(
                              color: AppColors.white,
                              fontWeight: FontWeight.w700,
                              fontFamily: AppTextStyles.fontFamilyMono,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.s16),

                  // Examination Meta Rows
                  _buildMetaRow(isDark, 'Course:', '$courseCode: $courseTitle'),
                  const SizedBox(height: AppSpacing.s8),
                  _buildMetaRow(isDark, 'Examination:', examName),
                  const SizedBox(height: AppSpacing.s8),
                  _buildMetaRow(isDark, 'Date & Time:', '$date ($time)'),
                  const SizedBox(height: AppSpacing.s8),
                  _buildMetaRow(isDark, 'Attendance Standing:', '83.3% (Verified Eligible)'),

                  const SizedBox(height: AppSpacing.s20),

                  // Anti-Fraud Dynamic QR Box
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.s16),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkElevated : AppColors.lightElevated,
                      borderRadius: BorderRadius.circular(AppRadius.xl),
                    ),
                    child: Column(
                      children: [
                        Container(
                          width: 130,
                          height: 130,
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                            border: Border.all(
                              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                            ),
                          ),
                          child: Center(
                            child: Icon(
                              PhosphorIcons.qrCode(),
                              size: 100,
                              color: AppColors.ink,
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.s8),
                        Text(
                          qrToken,
                          style: AppTextStyles.caption3.copyWith(
                            fontFamily: AppTextStyles.fontFamilyMono,
                            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.s4),
                        Text(
                          'Scan with Invigilator Terminal to Check In',
                          style: AppTextStyles.caption3.copyWith(
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s20),

            // Examination Rules Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        PhosphorIcons.warningCircle(PhosphorIconsStyle.fill),
                        size: 16,
                        color: AppColors.amber,
                      ),
                      const SizedBox(width: AppSpacing.s8),
                      Text(
                        'Examination Rules & Instructions',
                        style: AppTextStyles.body4.copyWith(
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s8),
                  _buildRuleItem(isDark, '1. Carry university physical student card along with this admit card.'),
                  _buildRuleItem(isDark, '2. Mobile phones, smartwatches, and programmable calculators barred.'),
                  _buildRuleItem(isDark, '3. Candidates must be seated at least 15 minutes before start.'),
                  _buildRuleItem(isDark, '4. No student admitted 30 minutes after commencement.'),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s24),

            AppButton(
              label: 'Share / Download PDF',
              icon: PhosphorIcons.downloadSimple(PhosphorIconsStyle.bold),
              onPressed: () {},
            ),
            const SizedBox(height: AppSpacing.s24),
          ],
        ),
      ),
    );
  }

  Widget _buildMetaRow(bool isDark, String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTextStyles.caption2.copyWith(
            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
          ),
        ),
        Text(
          value,
          style: AppTextStyles.caption1.copyWith(
            fontWeight: FontWeight.w600,
            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildRuleItem(bool isDark, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.s4),
      child: Text(
        text,
        style: AppTextStyles.caption2.copyWith(
          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
          height: 1.3,
        ),
      ),
    );
  }
}
