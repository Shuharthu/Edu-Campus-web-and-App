import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class FacultyHomeTab extends StatelessWidget {
  final String facultyName;
  final VoidCallback onStartAttendancePressed;

  const FacultyHomeTab({
    super.key,
    required this.facultyName,
    required this.onStartAttendancePressed,
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
                  'Good morning, $facultyName',
                  style: AppTextStyles.title1.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.s4),
                Text(
                  'Department of Computer Science • Faculty Mode',
                  style: AppTextStyles.body5.copyWith(
                    color: AppColors.neutral500,
                  ),
                ),
              ],
            ),
            CircleAvatar(
              radius: 20,
              backgroundColor: AppColors.brandInk,
              child: const Icon(
                PhosphorIconsRegular.chalkboardTeacher,
                size: 20,
                color: AppColors.white,
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.s16),

        // Hero: Teaching Overview & Next Lecture
        AppCard(
          featuredDark: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const AppChip(
                    label: 'Next Lecture in 25 min',
                    tone: AppChipTone.warning,
                  ),
                  Text(
                    'Room 4B',
                    style: AppTextStyles.caption1.copyWith(
                      color: AppColors.neutral300,
                      fontWeight: FontWeight.w500,
                    ),
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
                'Section A • 44 Students Enrolled',
                style: AppTextStyles.body5.copyWith(
                  color: AppColors.neutral300,
                ),
              ),
              const SizedBox(height: AppSpacing.s12),
              AppButton(
                label: 'Start attendance session',
                icon: PhosphorIconsRegular.qrCode,
                variant: AppButtonVariant.primary,
                size: AppButtonSize.medium,
                onPressed: onStartAttendancePressed,
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.s16),

        // Teaching Load KPI Strip
        Row(
          children: [
            Expanded(
              child: _MetricCard(
                title: 'Sections',
                value: '4',
                subtitle: 'Active this term',
              ),
            ),
            const SizedBox(width: AppSpacing.s8),
            Expanded(
              child: _MetricCard(
                title: 'Weekly Load',
                value: '14h',
                subtitle: 'of 18h maximum',
              ),
            ),
            const SizedBox(width: AppSpacing.s8),
            Expanded(
              child: _MetricCard(
                title: 'Students',
                value: '148',
                subtitle: 'Total enrolled',
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.s20),

        Text(
          "Today's Teaching Schedule",
          style: AppTextStyles.title3.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),

        const SizedBox(height: AppSpacing.s12),

        // Teaching Slot 1
        _TeachingSlotCard(
          time: '09:00 - 10:30',
          course: 'MAT201 Sec A (Calculus 2)',
          room: 'Room 3C',
          enrolledCount: 42,
          isCompleted: true,
        ),

        const SizedBox(height: AppSpacing.s8),

        // Teaching Slot 2 (Live / Next)
        _TeachingSlotCard(
          time: '10:45 - 12:15',
          course: 'CSE204 Sec A (Data structures)',
          room: 'Room 4B',
          enrolledCount: 44,
          isNext: true,
          onAction: onStartAttendancePressed,
        ),

        const SizedBox(height: AppSpacing.s8),

        // Teaching Slot 3
        _TeachingSlotCard(
          time: '14:45 - 16:15',
          course: 'CSE205 Lab 1 (Data Structures Lab)',
          room: 'Lab 1',
          enrolledCount: 30,
        ),

        const SizedBox(height: AppSpacing.s24),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(AppRadii.r12),
        border: Border.all(color: AppColors.neutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTextStyles.caption2.copyWith(
              color: AppColors.neutral500,
            ),
          ),
          const SizedBox(height: AppSpacing.s4),
          Text(
            value,
            style: AppTextStyles.title2.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppSpacing.s2),
          Text(
            subtitle,
            style: AppTextStyles.caption2.copyWith(
              color: AppColors.neutral600,
            ),
          ),
        ],
      ),
    );
  }
}

class _TeachingSlotCard extends StatelessWidget {
  final String time;
  final String course;
  final String room;
  final int enrolledCount;
  final bool isCompleted;
  final bool isNext;
  final VoidCallback? onAction;

  const _TeachingSlotCard({
    required this.time,
    required this.course,
    required this.room,
    required this.enrolledCount,
    this.isCompleted = false,
    this.isNext = false,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.s12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(AppRadii.r12),
        border: Border.all(
          color: isNext ? AppColors.brandInk : AppColors.neutral200,
          width: isNext ? 1.5 : 1.0,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                time,
                style: AppTextStyles.caption1.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.neutral600,
                ),
              ),
              const SizedBox(height: AppSpacing.s4),
              Text(
                course,
                style: AppTextStyles.body4.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppSpacing.s4),
              Text(
                '$room • $enrolledCount students',
                style: AppTextStyles.caption1.copyWith(
                  color: AppColors.neutral500,
                ),
              ),
            ],
          ),
          if (isCompleted)
            const AppChip(label: 'Done', tone: AppChipTone.success)
          else if (isNext)
            AppButton(
              label: 'Open QR',
              icon: PhosphorIconsRegular.qrCode,
              size: AppButtonSize.small,
              variant: AppButtonVariant.primary,
              onPressed: onAction,
            )
          else
            const AppChip(label: 'Upcoming', tone: AppChipTone.neutral),
        ],
      ),
    );
  }
}
