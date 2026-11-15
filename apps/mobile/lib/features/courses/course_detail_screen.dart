import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class CourseDetailScreen extends StatefulWidget {
  final String courseCode;
  final String courseTitle;
  final String facultyName;
  final String credits;

  const CourseDetailScreen({
    super.key,
    this.courseCode = 'CSE204',
    this.courseTitle = 'Data Structures & Algorithms',
    this.facultyName = 'Dr. Tariq Mahmud',
    this.credits = '4.0 Credits',
  });

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  int _activeTab = 0; // 0 = Materials, 1 = Assignments, 2 = Attendance

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkCanvas : AppColors.lightCanvas,
      appBar: AppBar(
        title: Text(
          widget.courseCode,
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
            // Course Meta Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        widget.credits,
                        style: AppTextStyles.caption1.copyWith(
                          color: AppColors.teal,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      AppChip(
                        label: 'Section A',
                        variant: AppChipVariant.info,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Text(
                    widget.courseTitle,
                    style: AppTextStyles.title2.copyWith(
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Row(
                    children: [
                      Icon(
                        PhosphorIcons.user(),
                        size: 14,
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                      const SizedBox(width: AppSpacing.s4),
                      Text(
                        widget.facultyName,
                        style: AppTextStyles.caption2.copyWith(
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s16),

            // Tab Selector
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.s4,
                vertical: AppSpacing.s4,
              ),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkElevated : AppColors.lightElevated,
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: Row(
                children: [
                  _buildTabButton(isDark, 0, 'Materials', PhosphorIcons.filePdf()),
                  _buildTabButton(isDark, 1, 'Assignments', PhosphorIcons.clipboardText()),
                  _buildTabButton(isDark, 2, 'Attendance', PhosphorIcons.checkCircle()),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s16),

            // Tab Body
            if (_activeTab == 0)
              _buildMaterialsTab(isDark)
            else if (_activeTab == 1)
              _buildAssignmentsTab(isDark)
            else
              _buildAttendanceTab(isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildTabButton(bool isDark, int index, String label, IconData icon) {
    final isSelected = _activeTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.s8),
          decoration: BoxDecoration(
            color: isSelected
                ? (isDark ? AppColors.darkCard : AppColors.white)
                : AppColors.transparent,
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 15,
                color: isSelected
                    ? AppColors.teal
                    : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
              ),
              const SizedBox(width: AppSpacing.s4),
              Text(
                label,
                style: AppTextStyles.caption1.copyWith(
                  color: isSelected
                      ? (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary)
                      : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMaterialsTab(bool isDark) {
    final materials = [
      {'week': 'Week 1', 'title': 'Course Syllabus & Asymptotic Complexity', 'size': '2.4 MB'},
      {'week': 'Week 2', 'title': 'Arrays, Linked Lists, and Stacks', 'size': '4.1 MB'},
      {'week': 'Week 3', 'title': 'Queues & Circular Buffers Implementation', 'size': '3.2 MB'},
      {'week': 'Week 4', 'title': 'Binary Search Trees and Traversals', 'size': '5.8 MB'},
    ];

    return Column(
      children: materials.map((m) {
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.s8),
          child: AppCard(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.s8),
                        decoration: BoxDecoration(
                          color: AppColors.teal.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(AppRadius.md),
                        ),
                        child: Icon(
                          PhosphorIcons.filePdf(),
                          size: 20,
                          color: AppColors.teal,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              m['week']!,
                              style: AppTextStyles.caption3.copyWith(
                                color: AppColors.teal,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              m['title']!,
                              style: AppTextStyles.body4.copyWith(
                                fontWeight: FontWeight.w600,
                                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                              ),
                            ),
                            Text(
                              'PDF Document • ${m['size']}',
                              style: AppTextStyles.caption3.copyWith(
                                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  PhosphorIcons.downloadSimple(),
                  size: 20,
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildAssignmentsTab(bool isDark) {
    return Column(
      children: [
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  AppChip(
                    label: 'Assignment 1',
                    variant: AppChipVariant.info,
                  ),
                  AppChip(
                    label: 'Score: 95 / 100',
                    variant: AppChipVariant.success,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.s8),
              Text(
                'Binary Search Tree Implementation',
                style: AppTextStyles.body3.copyWith(
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.s4),
              Text(
                'Implement iterative and recursive search, insertion, deletion, and in-order traversal in C++ or Java.',
                style: AppTextStyles.caption2.copyWith(
                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.s12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Due: Nov 20, 2026',
                    style: AppTextStyles.caption3.copyWith(
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    ),
                  ),
                  Text(
                    'Weightage: 10%',
                    style: AppTextStyles.caption3.copyWith(
                      color: AppColors.teal,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAttendanceTab(bool isDark) {
    return Column(
      children: [
        AppCard(
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Attendance Standing',
                    style: AppTextStyles.body4.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    '83.3%',
                    style: AppTextStyles.title2.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.teal,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.s8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '15 Attended / 18 Held',
                    style: AppTextStyles.caption2.copyWith(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                    ),
                  ),
                  Text(
                    'Can miss 2 more (≥75%)',
                    style: AppTextStyles.caption3.copyWith(
                      color: AppColors.teal,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
