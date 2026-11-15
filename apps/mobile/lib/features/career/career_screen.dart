import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class CareerScreen extends StatefulWidget {
  const CareerScreen({super.key});

  @override
  State<CareerScreen> createState() => _CareerScreenState();
}

class _CareerScreenState extends State<CareerScreen> {
  String _selectedRoleType = 'ALL';

  final List<Map<String, dynamic>> _jobPostings = [
    {
      'id': 'job-1',
      'company': 'bKash Limited',
      'role': 'Software Engineer Intern (Backend / Cloud)',
      'type': 'INTERNSHIP',
      'stipend': '\$400 / mo',
      'location': 'Dhaka (Hybrid)',
      'minCgpa': 3.20,
      'deadline': 'Dec 15, 2026',
      'hasApplied': true,
      'status': 'SHORTLISTED',
      'interviewDate': 'Nov 21, 2026 (10:30 AM)',
    },
    {
      'id': 'job-2',
      'company': 'Brain Station 23',
      'role': 'Junior Full-Stack Developer',
      'type': 'FULL_TIME',
      'stipend': '\$650 / mo',
      'location': 'Dhaka / Remote',
      'minCgpa': 3.00,
      'deadline': 'Dec 05, 2026',
      'hasApplied': false,
      'status': null,
      'interviewDate': null,
    },
    {
      'id': 'job-3',
      'company': 'Optimizely',
      'role': 'Associate QA Automation Engineer',
      'type': 'FULL_TIME',
      'stipend': '\$600 / mo',
      'location': 'Dhaka (Gulshan)',
      'minCgpa': 3.00,
      'deadline': 'Dec 10, 2026',
      'hasApplied': false,
      'status': null,
      'interviewDate': null,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _jobPostings.where((j) {
      if (_selectedRoleType == 'ALL') return true;
      return j['type'] == _selectedRoleType;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.darkCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.darkCanvas,
        elevation: 0,
        title: Text(
          'Career Hub & Placement',
          style: AppTextStyles.title1.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.darkTextPrimary,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.s16),
        children: [
          // Student Verified Credential Banner
          AppCard(
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: const BoxDecoration(
                    color: AppColors.darkInfoBg,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Icon(PhosphorIcons.graduationCap(), size: 24, color: AppColors.brightTeal),
                  ),
                ),
                const SizedBox(width: AppSpacing.s16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Verified Academic Profile',
                        style: AppTextStyles.title4.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.darkTextPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Text(
                            'Cumulative GPA: ',
                            style: AppTextStyles.body5.copyWith(
                              color: AppColors.darkTextSecondary,
                            ),
                          ),
                          Text(
                            '3.21 / 4.00',
                            style: AppTextStyles.caption1.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppColors.brightTeal,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.s8),
                          Icon(PhosphorIcons.checkCircle(), size: 14, color: AppColors.brightTeal),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.s16),

          // Active Application Status
          Text(
            'Your Applications',
            style: AppTextStyles.title3.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.darkTextPrimary,
            ),
          ),
          const SizedBox(height: AppSpacing.s12),

          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'bKash Limited',
                      style: AppTextStyles.title3.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.darkTextPrimary,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.s8,
                        vertical: AppSpacing.s4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.darkSuccessBg,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: Text(
                        'SHORTLISTED',
                        style: AppTextStyles.caption2.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.darkSuccessText,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.s4),
                Text(
                  'Software Engineer Intern (Backend / Cloud)',
                  style: AppTextStyles.body5.copyWith(
                    color: AppColors.darkTextSecondary,
                  ),
                ),
                const SizedBox(height: AppSpacing.s12),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.s12),
                  decoration: BoxDecoration(
                    color: AppColors.darkElevated,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    border: Border.all(color: AppColors.darkBorder),
                  ),
                  child: Row(
                    children: [
                      Icon(PhosphorIcons.calendar(), size: 18, color: AppColors.brightTeal),
                      const SizedBox(width: AppSpacing.s8),
                      Expanded(
                        child: Text(
                          'Technical Interview: Nov 21, 2026 • 10:30 AM (Google Meet)',
                          style: AppTextStyles.body5.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.darkTextPrimary,
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

          // Open Opportunities
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Open Opportunities',
                style: AppTextStyles.title3.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.darkTextPrimary,
                ),
              ),
              Row(
                children: [
                  AppChip(
                    label: 'All',
                    isSelected: _selectedRoleType == 'ALL',
                    onTap: () => setState(() => _selectedRoleType = 'ALL'),
                  ),
                  const SizedBox(width: AppSpacing.s8),
                  AppChip(
                    label: 'Internships',
                    isSelected: _selectedRoleType == 'INTERNSHIP',
                    onTap: () => setState(() => _selectedRoleType = 'INTERNSHIP'),
                  ),
                  const SizedBox(width: AppSpacing.s8),
                  AppChip(
                    label: 'Full-time',
                    isSelected: _selectedRoleType == 'FULL_TIME',
                    onTap: () => setState(() => _selectedRoleType = 'FULL_TIME'),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.s12),

          ...filtered.map((job) {
            final hasApplied = job['hasApplied'] as bool;

            return Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.s12),
              child: AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          job['company'],
                          style: AppTextStyles.title4.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.darkTextPrimary,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.s8,
                            vertical: AppSpacing.s2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.darkElevated,
                            borderRadius: BorderRadius.circular(AppRadius.xs),
                            border: Border.all(color: AppColors.darkBorder),
                          ),
                          child: Text(
                            job['type'],
                            style: AppTextStyles.caption2.copyWith(
                              color: AppColors.brightTeal,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      job['role'],
                      style: AppTextStyles.body5.copyWith(
                        color: AppColors.darkTextSecondary,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s12),
                    Row(
                      children: [
                        Text(
                          job['stipend'],
                          style: AppTextStyles.body5.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.darkSuccessText,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.s8),
                        Text('•', style: AppTextStyles.body5.copyWith(color: AppColors.darkTextSecondary)),
                        const SizedBox(width: AppSpacing.s8),
                        Text(
                          job['location'],
                          style: AppTextStyles.body5.copyWith(
                            color: AppColors.darkTextSecondary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.s12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        AppButton(
                          label: hasApplied ? 'Applied' : 'Easy Apply',
                          variant: hasApplied
                              ? AppButtonVariant.ghost
                              : AppButtonVariant.primary,
                          size: AppButtonSize.small,
                          icon: hasApplied
                              ? PhosphorIcons.check()
                              : PhosphorIcons.paperPlaneTilt(),
                          onPressed: hasApplied
                              ? null
                              : () {
                                  setState(() {
                                    job['hasApplied'] = true;
                                  });
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        'Applied to ${job['company']} with your verified CGPA.',
                                      ),
                                    ),
                                  );
                                },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
