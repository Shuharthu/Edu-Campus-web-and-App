import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class NoticesScreen extends StatefulWidget {
  const NoticesScreen({super.key});

  @override
  State<NoticesScreen> createState() => _NoticesScreenState();
}

class _NoticesScreenState extends State<NoticesScreen> {
  String _selectedCategory = 'ALL';

  final List<Map<String, dynamic>> _notices = [
    {
      'id': 'n-1',
      'title': 'Fall 2026 Midterm Examination Seating Matrix & Admit Cards Published',
      'category': 'ACADEMIC',
      'priority': 'URGENT',
      'author': 'Dr. Tariq Mahmud (Dean)',
      'date': 'Nov 12, 2026 • 09:00 AM',
      'content':
          'Dear Students & Faculty,\n\nThe Fall 2026 Midterm Examination Seating Matrix has been published. All eligible students must generate their digital admit cards with anti-fraud QR code prior to entering the exam venue. Defaulters below 75% attendance should report to the department coordinator immediately.\n\nExam venues open at 08:30 AM.',
      'isPinned': true,
      'isRead': true,
    },
    {
      'id': 'n-2',
      'title': 'CSE Department Hackathon & Robotics Showcase Registration Open',
      'category': 'DEPARTMENT',
      'priority': 'NORMAL',
      'author': 'CSE Department Office',
      'date': 'Nov 13, 2026 • 11:30 AM',
      'content':
          'Registration is now open for the annual CSE Autumn Hackathon. Teams of 3-4 students may submit their project proposals to the department office by November 20, 2026.',
      'isPinned': false,
      'isRead': false,
    },
    {
      'id': 'n-3',
      'title': 'Emergency Advisory: Heavy Rainstorm Transit Schedule Protocol',
      'category': 'EMERGENCY',
      'priority': 'URGENT',
      'author': 'Campus Security & Transit',
      'date': 'Nov 14, 2026 • 07:15 AM',
      'content':
          'Campus transit shuttles from Uttara and Dhanmondi are operating on a 15-minute headway. In case of severe waterlogging, evening lab sessions will transition online.',
      'isPinned': true,
      'isRead': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filteredNotices = _notices.where((n) {
      if (_selectedCategory == 'ALL') return true;
      if (_selectedCategory == 'URGENT') return n['priority'] == 'URGENT';
      return n['category'] == _selectedCategory;
    }).toList();

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkCanvas : AppColors.lightCanvas,
      appBar: AppBar(
        title: Text(
          'Campus Notice Board',
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
            // Filter Pills
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('ALL', 'All Notices', isDark),
                  _buildFilterChip('URGENT', 'Urgent Alerts', isDark),
                  _buildFilterChip('ACADEMIC', 'Academic', isDark),
                  _buildFilterChip('DEPARTMENT', 'CSE Dept', isDark),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s16),

            // Pinned Emergency Card
            Container(
              padding: const EdgeInsets.all(AppSpacing.s20),
              decoration: BoxDecoration(
                color: AppColors.ink,
                borderRadius: BorderRadius.circular(AppRadius.r3xl),
                border: Border.all(
                  color: AppColors.tealDeep,
                  width: 1.5,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            PhosphorIcons.pushPin(),
                            color: AppColors.teal,
                            size: 18,
                          ),
                          const SizedBox(width: AppSpacing.s8),
                          Text(
                            'OFFICIAL CAMPUS BROADCAST',
                            style: AppTextStyles.caption2.copyWith(
                              color: AppColors.teal,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      const AppChip(
                        label: 'URGENT',
                        tone: ChipTone.warning,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  Text(
                    'Midterm Seating Arrangement & Admit Card Download Ready',
                    style: AppTextStyles.title2.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s6),
                  Text(
                    'Examination Hall C, Seat 42 assigned. Review schedule and download authenticated PDF pass.',
                    style: AppTextStyles.caption1.copyWith(
                      color: AppColors.white70,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s20),

            Text(
              'Recent Announcements',
              style: AppTextStyles.title3.copyWith(
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSpacing.s12),

            ...filteredNotices.map((n) {
              final isUrgent = n['priority'] == 'URGENT';
              return Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.s12),
                child: AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                isUrgent ? PhosphorIcons.warning() : PhosphorIcons.bell(),
                                size: 16,
                                color: isUrgent
                                    ? (isDark ? AppColors.darkWarningText : AppColors.lightWarningText)
                                    : AppColors.teal,
                              ),
                              const SizedBox(width: AppSpacing.s6),
                              Text(
                                n['author'] as String,
                                style: AppTextStyles.caption2.copyWith(
                                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          AppChip(
                            label: n['priority'] as String,
                            tone: isUrgent ? ChipTone.warning : ChipTone.neutral,
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.s8),
                      Text(
                        n['title'] as String,
                        style: AppTextStyles.title3.copyWith(
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s6),
                      Text(
                        n['content'] as String,
                        style: AppTextStyles.caption1.copyWith(
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            n['date'] as String,
                            style: AppTextStyles.caption3.copyWith(
                              color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                              fontFamily: AppTextStyles.fontFamilyMono,
                            ),
                          ),
                          Icon(
                            PhosphorIcons.shareNetwork(),
                            size: 16,
                            color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
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
      ),
    );
  }

  Widget _buildFilterChip(String key, String label, bool isDark) {
    final isSelected = _selectedCategory == key;
    return Padding(
      padding: const EdgeInsets.only(right: AppSpacing.s8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (val) {
          if (val) setState(() => _selectedCategory = key);
        },
        selectedColor: AppColors.teal,
        backgroundColor: isDark ? AppColors.darkElevated : AppColors.lightElevated,
        labelStyle: AppTextStyles.caption2.copyWith(
          color: isSelected
              ? AppColors.ink
              : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
    );
  }
}
