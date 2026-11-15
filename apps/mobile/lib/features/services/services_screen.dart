import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  final List<Map<String, dynamic>> _requests = [
    {
      'id': 'sr-001',
      'trackingNumber': 'SR-2026-8492',
      'title': 'Official Academic Transcript (Sealed)',
      'purpose': 'Graduate School Application (WES Evaluation)',
      'fee': 15.0,
      'status': 'SEALED & READY',
      'submittedDate': 'Nov 10, 2026',
      'steps': [
        {'title': 'Application Submitted', 'date': 'Nov 10', 'done': true},
        {'title': 'Department Verified', 'date': 'Nov 11', 'done': true},
        {'title': 'Registrar Cryptographic Seal', 'date': 'Nov 14', 'done': true},
        {'title': 'Ready for Dispatch / Download', 'date': 'Ready', 'done': true},
      ],
    },
    {
      'id': 'sr-002',
      'trackingNumber': 'SR-2026-8490',
      'title': 'Bonafide Student Certificate',
      'purpose': 'Embassy Student Visa Verification',
      'fee': 10.0,
      'status': 'COMPLETED',
      'submittedDate': 'Nov 02, 2026',
      'steps': [
        {'title': 'Application Submitted', 'date': 'Nov 02', 'done': true},
        {'title': 'Department Verified', 'date': 'Nov 03', 'done': true},
        {'title': 'Registrar Seal Applied', 'date': 'Nov 04', 'done': true},
        {'title': 'Delivered via Portal', 'date': 'Nov 04', 'done': true},
      ],
    },
  ];

  void _showNewRequestDialog() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return Container(
          padding: const EdgeInsets.all(AppSpacing.s24),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCard : AppColors.lightCard,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(AppRadius.r3xl),
            ),
          ),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Request Official Document',
                      style: AppTextStyles.title2.copyWith(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        PhosphorIcons.x(),
                        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                      ),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.s16),
                _buildServiceOption(
                  icon: PhosphorIcons.fileText(),
                  title: 'Official Academic Transcript',
                  subtitle: 'Includes GPA breakdown, credits & registrar seal (\$15.00)',
                  isDark: isDark,
                  onTap: () {
                    Navigator.of(ctx).pop();
                    _submitNewRequest('Official Academic Transcript', 15.0);
                  },
                ),
                const SizedBox(height: AppSpacing.s12),
                _buildServiceOption(
                  icon: PhosphorIcons.certificate(),
                  title: 'Medium of Instruction Certificate',
                  subtitle: 'Certifies English as the language of instruction (\$10.00)',
                  isDark: isDark,
                  onTap: () {
                    Navigator.of(ctx).pop();
                    _submitNewRequest('Medium of Instruction Certificate', 10.0);
                  },
                ),
                const SizedBox(height: AppSpacing.s12),
                _buildServiceOption(
                  icon: PhosphorIcons.identificationBadge(),
                  title: 'Migration & Character Clearance',
                  subtitle: 'Official university transfer clearance certificate (\$25.00)',
                  isDark: isDark,
                  onTap: () {
                    Navigator.of(ctx).pop();
                    _submitNewRequest('Migration & Character Clearance', 25.0);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _submitNewRequest(String title, double fee) {
    final newReq = {
      'id': 'sr-${DateTime.now().millisecondsSinceEpoch}',
      'trackingNumber': 'SR-2026-${(1000 + _requests.length).toString()}',
      'title': title,
      'purpose': 'Official University Application',
      'fee': fee,
      'status': 'SUBMITTED',
      'submittedDate': 'Today',
      'steps': [
        {'title': 'Application Submitted', 'date': 'Today', 'done': true},
        {'title': 'Department Verified', 'date': 'Pending', 'done': false},
        {'title': 'Registrar Cryptographic Seal', 'date': 'Pending', 'done': false},
        {'title': 'Ready for Dispatch / Download', 'date': 'Pending', 'done': false},
      ],
    };

    setState(() {
      _requests.insert(0, newReq);
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Request for $title submitted! Tracking: ${newReq['trackingNumber']}',
          style: AppTextStyles.body5.copyWith(color: AppColors.white),
        ),
        backgroundColor: AppColors.tealDeep,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Widget _buildServiceOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.xl),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.s16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkElevated : AppColors.lightElevated,
          borderRadius: BorderRadius.circular(AppRadius.xl),
          border: Border.all(
            color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkHover : AppColors.lightHover,
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: Icon(icon, color: AppColors.teal),
            ),
            const SizedBox(width: AppSpacing.s12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.body4.copyWith(
                      color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s2),
                  Text(
                    subtitle,
                    style: AppTextStyles.caption2.copyWith(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              PhosphorIcons.caretRight(),
              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkCanvas : AppColors.lightCanvas,
      appBar: AppBar(
        title: Text(
          'University Services',
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
            // Top CTA Action Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Official Service Desk',
                      style: AppTextStyles.title3.copyWith(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      'Track authenticated documents & certificates',
                      style: AppTextStyles.caption2.copyWith(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                    ),
                  ],
                ),
                AppButton(
                  label: 'New Request',
                  onPressed: _showNewRequestDialog,
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.s20),

            // Requests List with Timeline
            ..._requests.map((req) {
              final steps = req['steps'] as List<dynamic>;
              return Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.s16),
                child: AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text(
                                req['trackingNumber'] as String,
                                style: AppTextStyles.body4.copyWith(
                                  color: AppColors.teal,
                                  fontWeight: FontWeight.w600,
                                  fontFamily: AppTextStyles.fontFamilyMono,
                                ),
                              ),
                              const SizedBox(width: AppSpacing.s8),
                              Text(
                                '• ${req['submittedDate']}',
                                style: AppTextStyles.caption2.copyWith(
                                  color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                                ),
                              ),
                            ],
                          ),
                          AppChip(
                            label: req['status'] as String,
                            tone: req['status'] == 'COMPLETED' || req['status'] == 'SEALED & READY'
                                ? ChipTone.success
                                : ChipTone.info,
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.s8),
                      Text(
                        req['title'] as String,
                        style: AppTextStyles.title3.copyWith(
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s4),
                      Text(
                        'Purpose: ${req['purpose']}',
                        style: AppTextStyles.caption2.copyWith(
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        ),
                      ),

                      const SizedBox(height: AppSpacing.s16),
                      Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                      const SizedBox(height: AppSpacing.s12),

                      // Timeline Stepper
                      Text(
                        'Fulfillment Progress',
                        style: AppTextStyles.caption1.copyWith(
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s12),

                      Column(
                        children: steps.map((step) {
                          final isDone = step['done'] as bool;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: AppSpacing.s8),
                            child: Row(
                              children: [
                                Icon(
                                  isDone ? PhosphorIcons.checkCircle() : PhosphorIcons.circle(),
                                  color: isDone
                                      ? (isDark ? AppColors.darkSuccessText : AppColors.lightSuccessText)
                                      : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                                  size: 16,
                                ),
                                const SizedBox(width: AppSpacing.s10),
                                Expanded(
                                  child: Text(
                                    step['title'] as String,
                                    style: AppTextStyles.caption2.copyWith(
                                      color: isDone
                                          ? (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary)
                                          : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                                      fontWeight: isDone ? FontWeight.w600 : FontWeight.normal,
                                    ),
                                  ),
                                ),
                                Text(
                                  step['date'] as String,
                                  style: AppTextStyles.caption3.copyWith(
                                    color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                                    fontFamily: AppTextStyles.fontFamilyMono,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),

                      const SizedBox(height: AppSpacing.s12),

                      // Download Button if Completed or Sealed
                      if (req['status'] == 'COMPLETED' || req['status'] == 'SEALED & READY')
                        AppButton(
                          label: 'Download Sealed PDF Transcript',
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  'Downloading digitally signed document...',
                                  style: AppTextStyles.body5.copyWith(color: AppColors.white),
                                ),
                                backgroundColor: AppColors.tealDeep,
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
