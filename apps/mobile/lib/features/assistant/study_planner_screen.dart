import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class StudyPlannerScreen extends StatefulWidget {
  const StudyPlannerScreen({super.key});

  @override
  State<StudyPlannerScreen> createState() => _StudyPlannerScreenState();
}

class _StudyBlockItem {
  final String id;
  final String title;
  final String topic;
  final String courseCode;
  final double hours;
  final String targetDate;
  bool isCompleted;
  String? completedAt;

  _StudyBlockItem({
    required this.id,
    required this.title,
    required this.topic,
    required this.courseCode,
    required this.hours,
    required this.targetDate,
    required this.isCompleted,
    this.completedAt,
  });
}

class _StudyPlannerScreenState extends State<StudyPlannerScreen> {
  final List<_StudyBlockItem> _blocks = [
    _StudyBlockItem(
      id: 'sb-1',
      title: 'Algorithm Analysis & DP Review',
      topic: 'Bellman-Ford & Floyd-Warshall Algorithms',
      courseCode: 'CSE204',
      hours: 2.0,
      targetDate: 'Nov 15, 2026',
      isCompleted: true,
      completedAt: 'Today, 10:45 AM',
    ),
    _StudyBlockItem(
      id: 'sb-2',
      title: 'Database Systems Implementation',
      topic: 'B+ Tree Indexing & WAL Write-Ahead Logging',
      courseCode: 'CSE301',
      hours: 1.5,
      targetDate: 'Nov 16, 2026',
      isCompleted: false,
    ),
    _StudyBlockItem(
      id: 'sb-3',
      title: 'Discrete Mathematics Proofs',
      topic: 'Graph Coloring & Planarity Proofs',
      courseCode: 'MAT201',
      hours: 1.0,
      targetDate: 'Nov 17, 2026',
      isCompleted: false,
    ),
    _StudyBlockItem(
      id: 'sb-4',
      title: 'Midterm Past Papers Mock Exam',
      topic: 'Complete 2024 & 2025 Midterm Exam Papers',
      courseCode: 'CSE204',
      hours: 2.5,
      targetDate: 'Nov 18, 2026',
      isCompleted: false,
    ),
  ];

  void _toggleBlock(_StudyBlockItem block) {
    setState(() {
      block.isCompleted = !block.isCompleted;
      if (block.isCompleted) {
        block.completedAt = 'Just now';
      } else {
        block.completedAt = null;
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          block.isCompleted
              ? 'Marked "${block.title}" as completed!'
              : 'Reopened "${block.title}"',
          style: AppTextStyles.caption4.copyWith(color: AppColors.white),
        ),
        backgroundColor: block.isCompleted ? AppColors.darkSuccessText : AppColors.darkElevated,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showAddBlockDialog() {
    final titleController = TextEditingController();
    final topicController = TextEditingController();
    final hoursController = TextEditingController(text: '1.5');

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkCard,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.r2xl)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: AppSpacing.s16,
            right: AppSpacing.s16,
            top: AppSpacing.s16,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + AppSpacing.s24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Schedule Study Block',
                    style: AppTextStyles.title1.copyWith(
                      color: AppColors.darkTextPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  IconButton(
                    icon: Icon(
                      PhosphorIconsRegular.x,
                      color: AppColors.darkTextMuted,
                      size: AppSpacing.s20,
                    ),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.s12),
              TextField(
                controller: titleController,
                style: AppTextStyles.body3.copyWith(color: AppColors.darkTextPrimary),
                decoration: InputDecoration(
                  labelText: 'Session Title',
                  labelStyle: AppTextStyles.caption4.copyWith(color: AppColors.darkTextMuted),
                  filled: true,
                  fillColor: AppColors.darkElevated,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: const BorderSide(color: AppColors.darkBorder),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.s12),
              TextField(
                controller: topicController,
                style: AppTextStyles.body3.copyWith(color: AppColors.darkTextPrimary),
                decoration: InputDecoration(
                  labelText: 'Target Topic / Concept',
                  labelStyle: AppTextStyles.caption4.copyWith(color: AppColors.darkTextMuted),
                  filled: true,
                  fillColor: AppColors.darkElevated,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: const BorderSide(color: AppColors.darkBorder),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.s12),
              TextField(
                controller: hoursController,
                keyboardType: TextInputType.number,
                style: AppTextStyles.body3.copyWith(color: AppColors.darkTextPrimary),
                decoration: InputDecoration(
                  labelText: 'Allocated Hours',
                  labelStyle: AppTextStyles.caption4.copyWith(color: AppColors.darkTextMuted),
                  filled: true,
                  fillColor: AppColors.darkElevated,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: const BorderSide(color: AppColors.darkBorder),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.s16),
              AppButton(
                text: 'Save Study Block',
                onPressed: () {
                  if (titleController.text.trim().isNotEmpty) {
                    setState(() {
                      _blocks.add(
                        _StudyBlockItem(
                          id: 'sb-${DateTime.now().millisecondsSinceEpoch}',
                          title: titleController.text.trim(),
                          topic: topicController.text.trim().isEmpty ? 'General Topic' : topicController.text.trim(),
                          courseCode: 'CSE204',
                          hours: double.tryParse(hoursController.text) ?? 1.5,
                          targetDate: 'Nov 19, 2026',
                          isCompleted: false,
                        ),
                      );
                    });
                    Navigator.pop(ctx);
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final completedCount = _blocks.where((b) => b.isCompleted).length;
    final totalHours = _blocks.fold<double>(0, (sum, b) => sum + b.hours);
    final completedHours = _blocks.where((b) => b.isCompleted).fold<double>(0, (sum, b) => sum + b.hours);
    final progressPct = totalHours > 0 ? (completedHours / totalHours) : 0.0;

    return Scaffold(
      backgroundColor: AppColors.darkCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.darkCanvas,
        elevation: 0,
        title: Text(
          'Adaptive Study Planner',
          style: AppTextStyles.title1.copyWith(
            color: AppColors.darkTextPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(
              PhosphorIconsRegular.plusCircle,
              color: AppColors.brightTeal,
              size: AppSpacing.s24,
            ),
            onPressed: _showAddBlockDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.s16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Weekly Target Progress Card
            AppCard(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.s16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Weekly Exam Prep Target',
                          style: AppTextStyles.caption4.copyWith(
                            color: AppColors.darkTextMuted,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.s8,
                            vertical: AppSpacing.s2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.darkSuccessBg,
                            borderRadius: BorderRadius.circular(AppRadius.full),
                            border: Border.all(color: AppColors.darkSuccessText),
                          ),
                          child: Text(
                            'On Schedule',
                            style: AppTextStyles.caption5.copyWith(
                              color: AppColors.darkSuccessText,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.s12),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          '${completedHours.toStringAsFixed(1)} / ${totalHours.toStringAsFixed(1)}',
                          style: AppTextStyles.heading5.copyWith(
                            color: AppColors.darkTextPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.s4),
                        Text(
                          'hours completed',
                          style: AppTextStyles.body3.copyWith(
                            color: AppColors.darkTextSecondary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.s12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadius.full),
                      child: LinearProgressIndicator(
                        value: progressPct,
                        backgroundColor: AppColors.darkElevated,
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.brightTeal),
                        minHeight: AppSpacing.s8,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '$completedCount of ${_blocks.length} focus sessions finished',
                          style: AppTextStyles.caption5.copyWith(
                            color: AppColors.darkTextMuted,
                          ),
                        ),
                        Text(
                          '${(progressPct * 100).toInt()}% Done',
                          style: AppTextStyles.caption4.copyWith(
                            color: AppColors.brightTeal,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.s24),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Scheduled Study Blocks',
                  style: AppTextStyles.title3.copyWith(
                    color: AppColors.darkTextPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Fall Midterm Week',
                  style: AppTextStyles.caption4.copyWith(
                    color: AppColors.darkTextMuted,
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.s12),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _blocks.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.s12),
              itemBuilder: (context, index) {
                final block = _blocks[index];
                return AppCard(
                  child: InkWell(
                    onTap: () => _toggleBlock(block),
                    borderRadius: BorderRadius.circular(AppRadius.xl),
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.s16),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Interactive completion checkbox
                          Container(
                            margin: const EdgeInsets.only(top: AppSpacing.s2),
                            height: AppSpacing.s24,
                            width: AppSpacing.s24,
                            decoration: BoxDecoration(
                              color: block.isCompleted ? AppColors.brightTeal : AppColors.darkElevated,
                              borderRadius: BorderRadius.circular(AppRadius.md),
                              border: Border.all(
                                color: block.isCompleted ? AppColors.brightTeal : AppColors.darkBorder,
                                width: 1.5,
                              ),
                            ),
                            child: block.isCompleted
                                ? Icon(
                                    PhosphorIconsRegular.check,
                                    size: AppSpacing.s16,
                                    color: AppColors.ink,
                                  )
                                : null,
                          ),
                          const SizedBox(width: AppSpacing.s12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: AppSpacing.s8,
                                        vertical: AppSpacing.s2,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.darkElevated,
                                        borderRadius: BorderRadius.circular(AppRadius.xs),
                                      ),
                                      child: Text(
                                        block.courseCode,
                                        style: AppTextStyles.caption5.copyWith(
                                          color: AppColors.brightTeal,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.s8),
                                    Text(
                                      '${block.hours} hrs • ${block.targetDate}',
                                      style: AppTextStyles.caption5.copyWith(
                                        color: AppColors.darkTextMuted,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: AppSpacing.s8),
                                Text(
                                  block.title,
                                  style: AppTextStyles.body2.copyWith(
                                    color: block.isCompleted ? AppColors.darkTextMuted : AppColors.darkTextPrimary,
                                    decoration: block.isCompleted ? TextDecoration.lineThrough : null,
                                  ),
                                ),
                                const SizedBox(height: AppSpacing.s4),
                                Text(
                                  block.topic,
                                  style: AppTextStyles.caption4.copyWith(
                                    color: AppColors.darkTextSecondary,
                                  ),
                                ),
                                if (block.completedAt != null) ...[
                                  const SizedBox(height: AppSpacing.s4),
                                  Row(
                                    children: [
                                      Icon(
                                        PhosphorIconsRegular.checkCircle,
                                        size: AppSpacing.s12,
                                        color: AppColors.darkSuccessText,
                                      ),
                                      const SizedBox(width: AppSpacing.s4),
                                      Text(
                                        'Completed ${block.completedAt}',
                                        style: AppTextStyles.caption5.copyWith(
                                          color: AppColors.darkSuccessText,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
