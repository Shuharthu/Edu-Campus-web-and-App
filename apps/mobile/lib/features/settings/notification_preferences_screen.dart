import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class NotificationPreferencesScreen extends StatefulWidget {
  const NotificationPreferencesScreen({super.key});

  @override
  State<NotificationPreferencesScreen> createState() =>
      _NotificationPreferencesScreenState();
}

class _NotificationPreferencesScreenState
    extends State<NotificationPreferencesScreen> {
  bool _pushEnabled = true;
  bool _emailEnabled = true;
  bool _smsUrgent = true;

  bool _gradesPush = true;
  bool _examsPush = true;
  bool _assignmentsPush = true;
  bool _feesPush = true;

  bool _quietHoursEnabled = true;
  String _quietStart = '10:00 PM';
  String _quietEnd = '07:00 AM';

  void _savePreferences() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Notification preferences saved successfully!',
          style: AppTextStyles.body5.copyWith(color: AppColors.white),
        ),
        backgroundColor: AppColors.tealDeep,
        behavior: SnackBarBehavior.floating,
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
          'Notification Preferences',
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
            // Emergency Notification Notice
            Container(
              padding: const EdgeInsets.all(AppSpacing.s16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkElevated : AppColors.lightElevated,
                borderRadius: BorderRadius.circular(AppRadius.xl),
                border: Border.all(
                  color: AppColors.teal,
                  width: 1.2,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    PhosphorIcons.shieldCheck(),
                    color: AppColors.teal,
                    size: 24,
                  ),
                  const SizedBox(width: AppSpacing.s12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Emergency & Safety Broadcasts',
                          style: AppTextStyles.caption1.copyWith(
                            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'Severe weather advisories and safety bulletins are mandatory and cannot be disabled.',
                          style: AppTextStyles.caption3.copyWith(
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const AppChip(label: 'Always On', tone: ChipTone.success),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s20),

            // Master Channel Toggles
            Text(
              'Delivery Channels',
              style: AppTextStyles.title3.copyWith(
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSpacing.s8),

            AppCard(
              child: Column(
                children: [
                  _buildToggleRow(
                    title: 'Push Notifications',
                    subtitle: 'Real-time alerts on your mobile device',
                    value: _pushEnabled,
                    onChanged: (v) => setState(() => _pushEnabled = v),
                    isDark: isDark,
                  ),
                  Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  _buildToggleRow(
                    title: 'Email Digest & Bulletins',
                    subtitle: 'Daily updates sent to your student email',
                    value: _emailEnabled,
                    onChanged: (v) => setState(() => _emailEnabled = v),
                    isDark: isDark,
                  ),
                  Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  _buildToggleRow(
                    title: 'SMS Alerts for Urgent Events',
                    subtitle: 'High priority exam and safety notifications',
                    value: _smsUrgent,
                    onChanged: (v) => setState(() => _smsUrgent = v),
                    isDark: isDark,
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s20),

            // Academic Categories
            Text(
              'Academic & Course Updates',
              style: AppTextStyles.title3.copyWith(
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSpacing.s8),

            AppCard(
              child: Column(
                children: [
                  _buildToggleRow(
                    title: 'Grades & Moderation Releases',
                    subtitle: 'Notify immediately when semester results are published',
                    value: _gradesPush,
                    onChanged: (v) => setState(() => _gradesPush = v),
                    isDark: isDark,
                  ),
                  Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  _buildToggleRow(
                    title: 'Exam Seating & Admit Cards',
                    subtitle: 'Venue and seat assignment alerts',
                    value: _examsPush,
                    onChanged: (v) => setState(() => _examsPush = v),
                    isDark: isDark,
                  ),
                  Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  _buildToggleRow(
                    title: 'Assignment Deadlines',
                    subtitle: '24-hour advance submission reminders',
                    value: _assignmentsPush,
                    onChanged: (v) => setState(() => _assignmentsPush = v),
                    isDark: isDark,
                  ),
                  Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  _buildToggleRow(
                    title: 'Tuition Installments & Receipts',
                    subtitle: 'Due date alerts and payment confirmation receipts',
                    value: _feesPush,
                    onChanged: (v) => setState(() => _feesPush = v),
                    isDark: isDark,
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s20),

            // Quiet Hours
            Text(
              'Quiet Hours',
              style: AppTextStyles.title3.copyWith(
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSpacing.s8),

            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildToggleRow(
                    title: 'Enable Night Quiet Hours',
                    subtitle: 'Mute non-urgent notifications during sleep hours',
                    value: _quietHoursEnabled,
                    onChanged: (v) => setState(() => _quietHoursEnabled = v),
                    isDark: isDark,
                  ),
                  if (_quietHoursEnabled) ...[
                    Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                    const SizedBox(height: AppSpacing.s12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Quiet Schedule',
                          style: AppTextStyles.caption1.copyWith(
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          '$_quietStart – $_quietEnd',
                          style: AppTextStyles.caption1.copyWith(
                            color: AppColors.teal,
                            fontWeight: FontWeight.w600,
                            fontFamily: AppTextStyles.fontFamilyMono,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s24),

            AppButton(
              label: 'Save Notification Preferences',
              onPressed: _savePreferences,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToggleRow({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    required bool isDark,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.s6),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.caption1.copyWith(
                    color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  subtitle,
                  style: AppTextStyles.caption3.copyWith(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: AppColors.teal,
          ),
        ],
      ),
    );
  }
}
