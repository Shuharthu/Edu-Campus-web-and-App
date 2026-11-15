import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class TimetableScreen extends StatefulWidget {
  const TimetableScreen({super.key});

  @override
  State<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends State<TimetableScreen> {
  int _selectedDay = 1; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  bool _isWeekView = false;

  final List<Map<String, dynamic>> _days = const [
    {'day': 1, 'name': 'Mon', 'date': '14'},
    {'day': 2, 'name': 'Tue', 'date': '15'},
    {'day': 3, 'name': 'Wed', 'date': '16'},
    {'day': 4, 'name': 'Thu', 'date': '17'},
    {'day': 5, 'name': 'Fri', 'date': '18'},
  ];

  final Map<int, List<Map<String, String>>> _dailySlots = const {
    1: [
      {
        'time': '09:00 - 10:30',
        'code': 'MAT201',
        'title': 'Calculus & Linear Algebra 2',
        'room': 'Room 3C',
        'faculty': 'Dr. Tariq Mahmud',
        'type': 'Lecture',
      },
      {
        'time': '10:45 - 12:15',
        'code': 'CSE204',
        'title': 'Data structures & Algorithms',
        'room': 'Room 4B',
        'faculty': 'Dr. Tariq Mahmud',
        'type': 'Lecture',
      },
      {
        'time': '13:00 - 14:30',
        'code': 'EEE201',
        'title': 'Circuit Analysis',
        'room': 'Lab 2',
        'faculty': 'Dr. Anisur Rahman',
        'type': 'Practical',
      },
      {
        'time': '14:45 - 16:15',
        'code': 'CSE205',
        'title': 'Data Structures Lab',
        'room': 'Lab 1',
        'faculty': 'Dr. Tariq Mahmud',
        'type': 'Lab',
      },
    ],
    2: [
      {
        'time': '09:00 - 10:30',
        'code': 'CSE204',
        'title': 'Data structures Tutorial',
        'room': 'Room 4B',
        'faculty': 'Dr. Anisur Rahman',
        'type': 'Tutorial',
      },
      {
        'time': '10:45 - 12:15',
        'code': 'FIN201',
        'title': 'Corporate Finance',
        'room': 'Room 2A',
        'faculty': 'Prof. Monir Hossain',
        'type': 'Lecture',
      },
    ],
    3: [
      {
        'time': '09:00 - 10:30',
        'code': 'MAT201',
        'title': 'Calculus & Linear Algebra 2',
        'room': 'Room 3C',
        'faculty': 'Dr. Tariq Mahmud',
        'type': 'Lecture',
      },
      {
        'time': '10:45 - 12:15',
        'code': 'CSE204',
        'title': 'Data structures & Algorithms',
        'room': 'Room 4B',
        'faculty': 'Dr. Tariq Mahmud',
        'type': 'Lecture',
      },
      {
        'time': '13:00 - 14:30',
        'code': 'EEE201',
        'title': 'Circuit Analysis',
        'room': 'Room 5C',
        'faculty': 'Dr. Anisur Rahman',
        'type': 'Lecture',
      },
    ],
    4: [
      {
        'time': '09:00 - 10:30',
        'code': 'LAW101',
        'title': 'Constitutional Law of Bangladesh',
        'room': 'Moot Court',
        'faculty': 'Dr. Shirin Akter',
        'type': 'Lecture',
      },
      {
        'time': '10:45 - 12:15',
        'code': 'CSE204',
        'title': 'Data structures & Algorithms',
        'room': 'Room 4B',
        'faculty': 'Dr. Tariq Mahmud',
        'type': 'Lecture',
      },
      {
        'time': '13:00 - 14:30',
        'code': 'EEE201',
        'title': 'Circuit Analysis',
        'room': 'Room 5C',
        'faculty': 'Dr. Anisur Rahman',
        'type': 'Lecture',
      },
    ],
    5: [
      {
        'time': '09:00 - 11:00',
        'code': 'CSE205',
        'title': 'Data Structures Lab Exam',
        'room': 'Lab 1',
        'faculty': 'Dr. Tariq Mahmud',
        'type': 'Lab',
      },
    ],
  };

  @override
  Widget build(BuildContext context) {
    final currentSlots = _dailySlots[_selectedDay] ?? [];

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.s16,
        vertical: AppSpacing.s12,
      ),
      children: [
        // Top Switcher: Day / Week
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Weekly Schedule',
              style: AppTextStyles.title2.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            Container(
              padding: const EdgeInsets.all(AppSpacing.s2),
              decoration: BoxDecoration(
                color: AppColors.neutral100,
                borderRadius: BorderRadius.circular(AppRadii.r8),
              ),
              child: Row(
                children: [
                  _SegmentButton(
                    label: 'Day',
                    isActive: !_isWeekView,
                    onTap: () => setState(() => _isWeekView = false),
                  ),
                  _SegmentButton(
                    label: 'Week',
                    isActive: _isWeekView,
                    onTap: () => setState(() => _isWeekView = true),
                  ),
                ],
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.s12),

        // Drift SQLite Offline Cache Status Banner
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.s12,
            vertical: AppSpacing.s8,
          ),
          decoration: BoxDecoration(
            color: AppColors.brandWarmWhite,
            borderRadius: BorderRadius.circular(AppRadii.r8),
            border: Border.all(color: AppColors.neutral200),
          ),
          child: Row(
            children: [
              const Icon(
                PhosphorIconsRegular.cloudCheck,
                size: 16,
                color: AppColors.accentSuccess,
              ),
              const SizedBox(width: AppSpacing.s8),
              Expanded(
                child: Text(
                  'Updated 10m ago • Available offline via Drift cache',
                  style: AppTextStyles.caption2.copyWith(
                    color: AppColors.neutral600,
                  ),
                ),
              ),
              const Icon(
                PhosphorIconsRegular.calendarPlus,
                size: 16,
                color: AppColors.brandInk,
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.s16),

        // Day Strip Picker
        Row(
          children: _days.map((d) {
            final isSelected = d['day'] == _selectedDay;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _selectedDay = d['day'] as int),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: AppSpacing.s2),
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.s10),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.brandInk : Theme.of(context).cardColor,
                    borderRadius: BorderRadius.circular(AppRadii.r12),
                    border: Border.all(
                      color: isSelected ? AppColors.brandInk : AppColors.neutral200,
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        d['name'] as String,
                        style: AppTextStyles.caption2.copyWith(
                          color: isSelected ? AppColors.white70 : AppColors.neutral500,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s4),
                      Text(
                        d['date'] as String,
                        style: AppTextStyles.body4.copyWith(
                          color: isSelected ? AppColors.white : AppColors.neutral900,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),

        const SizedBox(height: AppSpacing.s20),

        // Schedule Slots for Selected Day
        if (currentSlots.isEmpty)
          Container(
            padding: const EdgeInsets.all(AppSpacing.s32),
            alignment: Alignment.center,
            child: Column(
              children: [
                const Icon(
                  PhosphorIconsRegular.coffee,
                  size: 36,
                  color: AppColors.neutral400,
                ),
                const SizedBox(height: AppSpacing.s8),
                Text(
                  'No classes scheduled for this day',
                  style: AppTextStyles.body5.copyWith(
                    color: AppColors.neutral500,
                  ),
                ),
              ],
            ),
          )
        else
          ...currentSlots.map((slot) {
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
                            const Icon(
                              PhosphorIconsRegular.clock,
                              size: 14,
                              color: AppColors.neutral500,
                            ),
                            const SizedBox(width: AppSpacing.s4),
                            Text(
                              slot['time']!,
                              style: AppTextStyles.caption1.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.neutral700,
                              ),
                            ),
                          ],
                        ),
                        AppChip(
                          label: slot['type']!,
                          tone: slot['type'] == 'Lab' || slot['type'] == 'Practical'
                              ? AppChipTone.info
                              : AppChipTone.neutral,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.s8),
                    Text(
                      '${slot['code']} ${slot['title']}',
                      style: AppTextStyles.body4.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s8),
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
                              slot['room']!,
                              style: AppTextStyles.caption1.copyWith(
                                fontWeight: FontWeight.w500,
                                color: AppColors.neutral700,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          slot['faculty']!,
                          style: AppTextStyles.caption1.copyWith(
                            color: AppColors.neutral500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }),

        const SizedBox(height: AppSpacing.s24),
      ],
    );
  }
}

class _SegmentButton extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _SegmentButton({
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.s12,
          vertical: AppSpacing.s4,
        ),
        decoration: BoxDecoration(
          color: isActive ? AppColors.white : AppColors.transparent,
          borderRadius: BorderRadius.circular(AppRadii.r6),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: AppColors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: AppTextStyles.caption2.copyWith(
            fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
            color: isActive ? AppColors.brandInk : AppColors.neutral500,
          ),
        ),
      ),
    );
  }
}
