import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class StudentHomeTab extends StatelessWidget {
  final String studentName;
  final VoidCallback onCheckInPressed;
  final VoidCallback onPayFeesPressed;
  final VoidCallback onIDCardPressed;
  final VoidCallback onResultsPressed;

  const StudentHomeTab({
    super.key,
    required this.studentName,
    required this.onCheckInPressed,
    required this.onPayFeesPressed,
    required this.onIDCardPressed,
    required this.onResultsPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.s16,
        vertical: AppSpacing.s12,
      ),
      children: [
        // Greeting & Subtitle
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Good morning, $studentName',
                  style: AppTextStyles.title1.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.s4),
                Text(
                  'Main Campus • Fall 2026',
                  style: AppTextStyles.body5.copyWith(
                    color: AppColors.neutral500,
                  ),
                ),
              ],
            ),
            // Student Avatar
            CircleAvatar(
              radius: 20,
              backgroundColor: AppColors.brandInk,
              child: Text(
                studentName.isNotEmpty ? studentName[0].toUpperCase() : 'S',
                style: AppTextStyles.body4.copyWith(
                  color: AppColors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.s16),

        // Hero: Next Class Countdown Card (Matching mockup exactly)
        AppCard(
          featuredDark: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.s8,
                      vertical: AppSpacing.s4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.brandTeal.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(AppRadii.r6),
                      border: Border.all(
                        color: AppColors.brandTeal.withValues(alpha: 0.4),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          PhosphorIconsRegular.clockCountdown,
                          size: 14,
                          color: AppColors.brandTeal,
                        ),
                        const SizedBox(width: AppSpacing.s4),
                        Text(
                          'Next class in 25 min',
                          style: AppTextStyles.caption2.copyWith(
                            color: AppColors.brandTeal,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const AppChip(
                    label: 'Live',
                    tone: AppChipTone.success,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.s12),
              Text(
                'CSE204 Data structures & Algorithms',
                style: AppTextStyles.title2.copyWith(
                  color: AppColors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppSpacing.s4),
              Text(
                '10:45 - 12:15 • Room 4B • Building B',
                style: AppTextStyles.body5.copyWith(
                  color: AppColors.neutral300,
                ),
              ),
              const SizedBox(height: AppSpacing.s12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const CircleAvatar(
                        radius: 12,
                        backgroundColor: AppColors.neutral700,
                        child: Icon(
                          PhosphorIconsRegular.chalkboardTeacher,
                          size: 14,
                          color: AppColors.white,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s8),
                      Text(
                        'Dr. Tariq Mahmud',
                        style: AppTextStyles.body5.copyWith(
                          color: AppColors.neutral200,
                        ),
                      ),
                    ],
                  ),
                  // One-tap Check In button
                  AppButton(
                    label: 'Check in',
                    icon: PhosphorIconsRegular.qrCode,
                    variant: AppButtonVariant.primary,
                    size: AppButtonSize.small,
                    onPressed: onCheckInPressed,
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.s16),

        // Quick Action Pills (4-Grid matching mockup)
        Row(
          children: [
            Expanded(
              child: _QuickActionItem(
                icon: PhosphorIconsRegular.qrCode,
                label: 'Check in',
                onTap: onCheckInPressed,
              ),
            ),
            const SizedBox(width: AppSpacing.s8),
            Expanded(
              child: _QuickActionItem(
                icon: PhosphorIconsRegular.graduationCap,
                label: 'Results',
                onTap: onResultsPressed,
              ),
            ),
            const SizedBox(width: AppSpacing.s8),
            Expanded(
              child: _QuickActionItem(
                icon: PhosphorIconsRegular.creditCard,
                label: 'Pay fees',
                onTap: onPayFeesPressed,
              ),
            ),
            const SizedBox(width: AppSpacing.s8),
            Expanded(
              child: _QuickActionItem(
                icon: PhosphorIconsRegular.identificationCard,
                label: 'ID card',
                onTap: onIDCardPressed,
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.s20),

        // Today's Classes Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "Today's classes (4)",
              style: AppTextStyles.title3.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              'Monday, Nov 14',
              style: AppTextStyles.caption1.copyWith(
                color: AppColors.neutral500,
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.s12),

        // Class 1: Completed / Attended
        _ClassScheduleCard(
          time: '09:00 - 10:30',
          courseCode: 'MAT201',
          courseTitle: 'Calculus & Linear Algebra 2',
          room: 'Room 3C',
          instructor: 'Dr. Tariq Mahmud',
          status: 'Attended',
          statusTone: AppChipTone.success,
        ),

        const SizedBox(height: AppSpacing.s8),

        // Class 2: In Progress / Upcoming
        _ClassScheduleCard(
          time: '10:45 - 12:15',
          courseCode: 'CSE204',
          courseTitle: 'Data structures & Algorithms',
          room: 'Room 4B',
          instructor: 'Dr. Tariq Mahmud',
          status: 'Next class',
          statusTone: AppChipTone.info,
          isHighlighted: true,
        ),

        const SizedBox(height: AppSpacing.s8),

        // Class 3: Scheduled
        _ClassScheduleCard(
          time: '13:00 - 14:30',
          courseCode: 'EEE201',
          courseTitle: 'Circuit Analysis',
          room: 'Lab 2',
          instructor: 'Dr. Anisur Rahman',
          status: 'Scheduled',
          statusTone: AppChipTone.neutral,
        ),

        const SizedBox(height: AppSpacing.s8),

        // Class 4: Lab / Practical
        _ClassScheduleCard(
          time: '14:45 - 16:15',
          courseCode: 'CSE205',
          courseTitle: 'Data Structures Lab',
          room: 'Lab 1',
          instructor: 'Dr. Tariq Mahmud',
          status: 'Scheduled',
          statusTone: AppChipTone.neutral,
        ),

        const SizedBox(height: AppSpacing.s20),

        // Tuition Due Alert Card (Matching mockup)
        Container(
          padding: const EdgeInsets.all(AppSpacing.s16),
          decoration: BoxDecoration(
            color: AppColors.brandWarmWhite,
            borderRadius: BorderRadius.circular(AppRadii.r16),
            border: Border.all(
              color: AppColors.accentWarning.withValues(alpha: 0.3),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.s10),
                decoration: BoxDecoration(
                  color: AppColors.accentWarning.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  PhosphorIconsRegular.currencyDollar,
                  color: AppColors.accentWarning,
                  size: 20,
                ),
              ),
              const SizedBox(width: AppSpacing.s12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tuition installment 2 due',
                      style: AppTextStyles.body4.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s2),
                    Text(
                      'Due in 5 days — \$420.00',
                      style: AppTextStyles.caption1.copyWith(
                        color: AppColors.neutral600,
                      ),
                    ),
                  ],
                ),
              ),
              AppButton(
                label: 'Pay now',
                size: AppButtonSize.small,
                variant: AppButtonVariant.primary,
                onPressed: onPayFeesPressed,
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.s24),
      ],
    );
  }
}

class _QuickActionItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickActionItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadii.r12),
      child: Container(
        padding: const EdgeInsets.symmetric(
          vertical: AppSpacing.s12,
          horizontal: AppSpacing.s6,
        ),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(AppRadii.r12),
          border: Border.all(color: AppColors.neutral200),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 22, color: AppColors.brandInk),
            const SizedBox(height: AppSpacing.s6),
            Text(
              label,
              style: AppTextStyles.caption2.copyWith(
                fontWeight: FontWeight.w500,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class _ClassScheduleCard extends StatelessWidget {
  final String time;
  final String courseCode;
  final String courseTitle;
  final String room;
  final String instructor;
  final String status;
  final AppChipTone statusTone;
  final bool isHighlighted;

  const _ClassScheduleCard({
    required this.time,
    required this.courseCode,
    required this.courseTitle,
    required this.room,
    required this.instructor,
    required this.status,
    required this.statusTone,
    this.isHighlighted = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(AppRadii.r12),
        border: Border.all(
          color: isHighlighted ? AppColors.brandInk : AppColors.neutral200,
          width: isHighlighted ? 1.5 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                time,
                style: AppTextStyles.caption1.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.neutral600,
                ),
              ),
              AppChip(
                label: status,
                tone: statusTone,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.s6),
          Text(
            '$courseCode $courseTitle',
            style: AppTextStyles.body4.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppSpacing.s6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(
                    PhosphorIconsRegular.door,
                    size: 14,
                    color: AppColors.neutral500,
                  ),
                  const SizedBox(width: AppSpacing.s4),
                  Text(
                    room,
                    style: AppTextStyles.caption1.copyWith(
                      color: AppColors.neutral700,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              Text(
                instructor,
                style: AppTextStyles.caption1.copyWith(
                  color: AppColors.neutral500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
