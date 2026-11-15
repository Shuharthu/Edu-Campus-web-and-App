import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';
import '../../shared/widgets/app_list_tile.dart';
import '../auth/auth_provider.dart';
import '../auth/role_switcher_sheet.dart';
import '../attendance/attendance_check_in_screen.dart';
import '../communication/chat_screen.dart';
import '../communication/notices_screen.dart';
import '../courses/course_detail_screen.dart';
import '../exams/admit_card_screen.dart';
import '../finance/tuition_payment_screen.dart';
import '../profile/profile_screen.dart';
import '../results/results_screen.dart';
import '../services/digital_id_screen.dart';
import '../services/services_screen.dart';
import '../settings/notification_preferences_screen.dart';
import '../timetable/timetable_screen.dart';
import '../library/library_screen.dart';
import '../operations/campus_operations_screen.dart';
import '../career/career_screen.dart';
import '../assistant/smart_assistant_screen.dart';
import '../assistant/study_planner_screen.dart';
import '../analytics/course_evaluation_screen.dart';
import 'faculty_home_tab.dart';
import 'student_home_tab.dart';

class HomeShellScreen extends ConsumerStatefulWidget {
  const HomeShellScreen({super.key});

  @override
  ConsumerState<HomeShellScreen> createState() => _HomeShellScreenState();
}

class _HomeShellScreenState extends ConsumerState<HomeShellScreen> {
  int _tabIndex = 0;

  void _showActionDialog(String title, String message, IconData icon) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadii.r16),
        ),
        title: Row(
          children: [
            Icon(icon, size: 24, color: AppColors.brandInk),
            const SizedBox(width: AppSpacing.s8),
            Text(title, style: AppTextStyles.title3),
          ],
        ),
        content: Text(message, style: AppTextStyles.body5),
        actions: [
          AppButton(
            label: 'Close',
            variant: AppButtonVariant.primary,
            size: AppButtonSize.small,
            onPressed: () => Navigator.of(ctx).pop(),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final role = auth.activeRole;
    final isFaculty = role?.roleSlug == 'faculty';

    return Scaffold(
      appBar: AppBar(
        title: Text(
          role?.roleName ?? 'Smart EDU',
          style: AppTextStyles.title2.copyWith(fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            icon: Icon(
              PhosphorIcons.bell(),
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkTextPrimary
                  : AppColors.lightTextPrimary,
            ),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => const NoticesScreen(),
                ),
              );
            },
          ),
          if (auth.assignments.length > 1)
            Padding(
              padding: const EdgeInsets.only(right: AppSpacing.s12),
              child: AppButton(
                label: 'Switch role',
                variant: AppButtonVariant.secondary,
                size: AppButtonSize.small,
                onPressed: () {
                  showModalBottomSheet<void>(
                    context: context,
                    builder: (_) => const RoleSwitcherSheet(),
                  );
                },
              ),
            ),
        ],
      ),
      body: Builder(
        builder: (context) {
          switch (_tabIndex) {
            case 0:
              return isFaculty
                  ? FacultyHomeTab(
                      facultyName: auth.fullName ?? 'Dr. Tariq Mahmud',
                      onStartAttendancePressed: () {
                        _showActionDialog(
                          'Attendance Session',
                          'Rotating QR attendance session initialized for CSE204 Section A in Room 4B.',
                          PhosphorIconsRegular.qrCode,
                        );
                      },
                    )
                  : StudentHomeTab(
                      studentName: (auth.fullName ?? 'Rafiq').split(' ').first,
                      onCheckInPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const AttendanceCheckInScreen(),
                          ),
                        );
                      },
                      onResultsPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const ResultsScreen(),
                          ),
                        );
                      },
                      onPayFeesPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const TuitionPaymentScreen(),
                          ),
                        );
                      },
                      onIDCardPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const DigitalIdScreen(),
                          ),
                        );
                      },
                    );
            case 1:
              return const TimetableScreen();
            case 2:
              return ListView(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.s16,
                  vertical: AppSpacing.s12,
                ),
                children: [
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const AppChip(label: 'Enrolled Courses', tone: AppChipTone.info),
                        const SizedBox(height: AppSpacing.s12),
                        Text('Fall 2026 Academic Catalog', style: AppTextStyles.title3),
                        const SizedBox(height: AppSpacing.s8),
                        Text(
                          'Browse course syllabi, assignments, and learning materials.',
                          style: AppTextStyles.body5.copyWith(color: AppColors.neutral600),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const CourseDetailScreen(),
                        ),
                      );
                    },
                    child: AppCard(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'CSE204-A',
                                style: AppTextStyles.caption1.copyWith(
                                  color: AppColors.teal,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: AppSpacing.s2),
                              Text(
                                'Data Structures & Algorithms',
                                style: AppTextStyles.body3.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: AppSpacing.s2),
                              Text(
                                'Dr. Tariq Mahmud • 4.0 Credits',
                                style: AppTextStyles.caption2.copyWith(
                                  color: AppColors.neutral500,
                                ),
                              ),
                            ],
                          ),
                          const Icon(
                            PhosphorIconsRegular.caretRight,
                            size: 18,
                            color: AppColors.neutral500,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const AdmitCardScreen(),
                        ),
                      );
                    },
                    child: AppCard(
                      featuredDark: true,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(
                                    PhosphorIconsRegular.identificationBadge,
                                    size: 16,
                                    color: AppColors.brightTeal,
                                  ),
                                  const SizedBox(width: AppSpacing.s4),
                                  Text(
                                    'MIDTERM ADMIT CARD',
                                    style: AppTextStyles.caption2.copyWith(
                                      color: AppColors.brightTeal,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 1.0,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: AppSpacing.s6),
                              Text(
                                'Hall C • Seat 42',
                                style: AppTextStyles.title3.copyWith(
                                  color: AppColors.white,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: AppSpacing.s2),
                              Text(
                                'CSE204 Midterm • Nov 25, 2026',
                                style: AppTextStyles.caption2.copyWith(
                                  color: AppColors.white70,
                                ),
                              ),
                            ],
                          ),
                          const Icon(
                            PhosphorIconsRegular.qrCode,
                            size: 28,
                            color: AppColors.brightTeal,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            case 3:
              return ListView(
                padding: const EdgeInsets.all(AppSpacing.s16),
                children: [
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const NoticesScreen(),
                        ),
                      );
                    },
                    child: AppCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const AppChip(label: 'Notice Board', tone: AppChipTone.neutral),
                          const SizedBox(height: AppSpacing.s12),
                          Text('Campus Announcements', style: AppTextStyles.title3),
                          const SizedBox(height: AppSpacing.s8),
                          Text(
                            'Official notices from the Office of the Registrar and Department of Computer Science.',
                            style: AppTextStyles.body5.copyWith(color: AppColors.neutral600),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const ChatScreen(),
                        ),
                      );
                    },
                    child: AppCard(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                PhosphorIcons.chatCircleText(),
                                color: AppColors.teal,
                                size: 24,
                              ),
                              const SizedBox(width: AppSpacing.s12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Course Discussion Channels',
                                    style: AppTextStyles.title3,
                                  ),
                                  const SizedBox(height: AppSpacing.s2),
                                  Text(
                                    'Real-time Q&A with instructors & peers',
                                    style: AppTextStyles.caption2.copyWith(
                                      color: AppColors.neutral500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Icon(
                            PhosphorIcons.caretRight(),
                            size: 18,
                            color: AppColors.neutral500,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const LibraryScreen(),
                        ),
                      );
                    },
                    child: AppCard(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                PhosphorIcons.bookOpen(),
                                color: AppColors.brightTeal,
                                size: 24,
                              ),
                              const SizedBox(width: AppSpacing.s12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Central Library & Catalog',
                                    style: AppTextStyles.title3,
                                  ),
                                  const SizedBox(height: AppSpacing.s2),
                                  Text(
                                    'Active loans, digital e-books & RFID pass',
                                    style: AppTextStyles.caption2.copyWith(
                                      color: AppColors.neutral500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Icon(
                            PhosphorIcons.caretRight(),
                            size: 18,
                            color: AppColors.neutral500,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const CampusOperationsScreen(),
                        ),
                      );
                    },
                    child: AppCard(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                PhosphorIcons.buildings(),
                                color: AppColors.brightTeal,
                                size: 24,
                              ),
                              const SizedBox(width: AppSpacing.s12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Campus Operations & Transit',
                                    style: AppTextStyles.title3,
                                  ),
                                  const SizedBox(height: AppSpacing.s2),
                                  Text(
                                    'Hostel room pass, live bus tracker & tickets',
                                    style: AppTextStyles.caption2.copyWith(
                                      color: AppColors.neutral500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Icon(
                            PhosphorIcons.caretRight(),
                            size: 18,
                            color: AppColors.neutral500,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const CareerScreen(),
                        ),
                      );
                    },
                    child: AppCard(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                PhosphorIcons.briefcase(),
                                color: AppColors.brightTeal,
                                size: 24,
                              ),
                              const SizedBox(width: AppSpacing.s12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Career Hub & Placement',
                                    style: AppTextStyles.title3,
                                  ),
                                  const SizedBox(height: AppSpacing.s2),
                                  Text(
                                    'Verified CGPA, job applications & interviews',
                                    style: AppTextStyles.caption2.copyWith(
                                      color: AppColors.neutral500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Icon(
                            PhosphorIcons.caretRight(),
                            size: 18,
                            color: AppColors.neutral500,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const SmartAssistantScreen(),
                        ),
                      );
                    },
                    child: AppCard(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                PhosphorIcons.robot(),
                                color: AppColors.brightTeal,
                                size: 24,
                              ),
                              const SizedBox(width: AppSpacing.s12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Ask Smart EDU',
                                    style: AppTextStyles.title3,
                                  ),
                                  const SizedBox(height: AppSpacing.s2),
                                  Text(
                                    'Grounded AI assistant with citations',
                                    style: AppTextStyles.caption2.copyWith(
                                      color: AppColors.neutral500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Icon(
                            PhosphorIcons.caretRight(),
                            size: 18,
                            color: AppColors.neutral500,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const StudyPlannerScreen(),
                        ),
                      );
                    },
                    child: AppCard(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                PhosphorIcons.calendarCheck(),
                                color: AppColors.brightTeal,
                                size: 24,
                              ),
                              const SizedBox(width: AppSpacing.s12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Adaptive Study Planner',
                                    style: AppTextStyles.title3,
                                  ),
                                  const SizedBox(height: AppSpacing.s2),
                                  Text(
                                    'Exam targets, hours & topic tracking',
                                    style: AppTextStyles.caption2.copyWith(
                                      color: AppColors.neutral500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Icon(
                            PhosphorIcons.caretRight(),
                            size: 18,
                            color: AppColors.neutral500,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const CourseEvaluationScreen(),
                        ),
                      );
                    },
                    child: AppCard(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                PhosphorIcons.star(),
                                color: AppColors.amber,
                                size: 24,
                              ),
                              const SizedBox(width: AppSpacing.s12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Course Evaluation',
                                    style: AppTextStyles.title3,
                                  ),
                                  const SizedBox(height: AppSpacing.s2),
                                  Text(
                                    'Anonymous feedback for CSE204',
                                    style: AppTextStyles.caption2.copyWith(
                                      color: AppColors.neutral500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Icon(
                            PhosphorIcons.caretRight(),
                            size: 18,
                            color: AppColors.neutral500,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const NotificationPreferencesScreen(),
                        ),
                      );
                    },
                    child: AppCard(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                PhosphorIcons.bellRinging(),
                                color: AppColors.teal,
                                size: 24,
                              ),
                              const SizedBox(width: AppSpacing.s12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Notification Preferences',
                                    style: AppTextStyles.title3,
                                  ),
                                  const SizedBox(height: AppSpacing.s2),
                                  Text(
                                    'Manage Push, Email, SMS & Quiet Hours',
                                    style: AppTextStyles.caption2.copyWith(
                                      color: AppColors.neutral500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Icon(
                            PhosphorIcons.caretRight(),
                            size: 18,
                            color: AppColors.neutral500,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            case 4:
              return const ProfileScreen();
            default:
              return const SizedBox.shrink();
          }
        },
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tabIndex,
        onDestinationSelected: (idx) => setState(() => _tabIndex = idx),
        destinations: const [
          NavigationDestination(
            icon: Icon(PhosphorIconsRegular.house),
            selectedIcon: Icon(PhosphorIconsFill.house),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(PhosphorIconsRegular.calendar),
            selectedIcon: Icon(PhosphorIconsFill.calendar),
            label: 'Schedule',
          ),
          NavigationDestination(
            icon: Icon(PhosphorIconsRegular.bookOpen),
            selectedIcon: Icon(PhosphorIconsFill.bookOpen),
            label: 'Courses',
          ),
          NavigationDestination(
            icon: Icon(PhosphorIconsRegular.chatCircle),
            selectedIcon: Icon(PhosphorIconsFill.chatCircle),
            label: 'Inbox',
          ),
          NavigationDestination(
            icon: Icon(PhosphorIconsRegular.user),
            selectedIcon: Icon(PhosphorIconsFill.user),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
