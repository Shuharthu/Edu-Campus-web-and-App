import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class CampusOperationsScreen extends StatefulWidget {
  const CampusOperationsScreen({super.key});

  @override
  State<CampusOperationsScreen> createState() => _CampusOperationsScreenState();
}

class _CampusOperationsScreenState extends State<CampusOperationsScreen> {
  int _selectedTabIndex = 0; // 0: Hostel, 1: Transit, 2: Maintenance

  void _showReportIssueModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.darkCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.r2xl)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.s24,
            left: AppSpacing.s24,
            right: AppSpacing.s24,
            top: AppSpacing.s24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Report Campus Issue',
                    style: AppTextStyles.title2.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.darkTextPrimary,
                    ),
                  ),
                  IconButton(
                    icon: Icon(PhosphorIcons.x(), color: AppColors.darkTextSecondary),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.s12),
              Text(
                'Submit a maintenance ticket directly to university facilities engineering.',
                style: AppTextStyles.body5.copyWith(
                  color: AppColors.darkTextSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.s16),
              TextField(
                decoration: InputDecoration(
                  hintText: 'Location (e.g. Hardware Lab 4B)',
                  hintStyle: AppTextStyles.body4.copyWith(
                    color: AppColors.darkTextSecondary,
                  ),
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
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Describe equipment failure or problem...',
                  hintStyle: AppTextStyles.body4.copyWith(
                    color: AppColors.darkTextSecondary,
                  ),
                  filled: true,
                  fillColor: AppColors.darkElevated,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    borderSide: const BorderSide(color: AppColors.darkBorder),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.s24),
              AppButton(
                label: 'Submit Maintenance Ticket',
                variant: AppButtonVariant.primary,
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Maintenance ticket dispatched to campus engineering.'),
                    ),
                  );
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
    return Scaffold(
      backgroundColor: AppColors.darkCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.darkCanvas,
        elevation: 0,
        title: Text(
          'Campus Operations',
          style: AppTextStyles.title1.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.darkTextPrimary,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(PhosphorIcons.wrench(), color: AppColors.brightTeal),
            onPressed: () => _showReportIssueModal(context),
            tooltip: 'Report Facility Issue',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.s16),
        children: [
          // Segmented Tab Selector
          Container(
            padding: const EdgeInsets.all(AppSpacing.s4),
            decoration: BoxDecoration(
              color: AppColors.darkElevated,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: AppColors.darkBorder),
            ),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedTabIndex = 0),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.s8),
                      decoration: BoxDecoration(
                        color: _selectedTabIndex == 0
                            ? AppColors.darkCard
                            : AppColors.transparent,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'Hostel Pass',
                        style: AppTextStyles.body5.copyWith(
                          fontWeight: FontWeight.w600,
                          color: _selectedTabIndex == 0
                              ? AppColors.brightTeal
                              : AppColors.darkTextSecondary,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedTabIndex = 1),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.s8),
                      decoration: BoxDecoration(
                        color: _selectedTabIndex == 1
                            ? AppColors.darkCard
                            : AppColors.transparent,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'Transit Tracker',
                        style: AppTextStyles.body5.copyWith(
                          fontWeight: FontWeight.w600,
                          color: _selectedTabIndex == 1
                              ? AppColors.brightTeal
                              : AppColors.darkTextSecondary,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedTabIndex = 2),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.s8),
                      decoration: BoxDecoration(
                        color: _selectedTabIndex == 2
                            ? AppColors.darkCard
                            : AppColors.transparent,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'Facilities',
                        style: AppTextStyles.body5.copyWith(
                          fontWeight: FontWeight.w600,
                          color: _selectedTabIndex == 2
                              ? AppColors.brightTeal
                              : AppColors.darkTextSecondary,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.s16),

          // Tab 0: Hostel Pass
          if (_selectedTabIndex == 0) ...[
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(PhosphorIcons.buildings(), size: 20, color: AppColors.brightTeal),
                          const SizedBox(width: AppSpacing.s8),
                          Text(
                            'Shahidullah Hall (Boys)',
                            style: AppTextStyles.title3.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppColors.darkTextPrimary,
                            ),
                          ),
                        ],
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
                          'ACTIVE RESIDENT',
                          style: AppTextStyles.caption2.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.darkSuccessText,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s16),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Room Allocation',
                              style: AppTextStyles.caption2.copyWith(
                                color: AppColors.darkTextSecondary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Room 302 • Bed A',
                              style: AppTextStyles.title3.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.darkTextPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Semester Fee',
                              style: AppTextStyles.caption2.copyWith(
                                color: AppColors.darkTextSecondary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '\$450.00 (Paid)',
                              style: AppTextStyles.title3.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.brightTeal,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s16),
                  const Divider(color: AppColors.darkBorder),
                  const SizedBox(height: AppSpacing.s12),
                  Text(
                    'Roommates',
                    style: AppTextStyles.body5.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.darkTextSecondary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.s12,
                          vertical: AppSpacing.s8,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.darkElevated,
                          borderRadius: BorderRadius.circular(AppRadius.md),
                          border: Border.all(color: AppColors.darkBorder),
                        ),
                        child: Row(
                          children: [
                            Icon(PhosphorIcons.user(), size: 14, color: AppColors.darkTextSecondary),
                            const SizedBox(width: AppSpacing.s6),
                            Text(
                              'Tanvir Ahmed (Bed B)',
                              style: AppTextStyles.body5.copyWith(
                                color: AppColors.darkTextPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],

          // Tab 1: Transit Tracker
          if (_selectedTabIndex == 1) ...[
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(PhosphorIcons.bus(), size: 20, color: AppColors.brightTeal),
                          const SizedBox(width: AppSpacing.s8),
                          Text(
                            'Route 1: Uttara Express',
                            style: AppTextStyles.title3.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppColors.darkTextPrimary,
                            ),
                          ),
                        ],
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
                          'ON SCHEDULE',
                          style: AppTextStyles.caption2.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.darkSuccessText,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s12),
                  Text(
                    'Bus #04 • Kabir Hossain (+8801711223344) • Departure: 07:30 AM',
                    style: AppTextStyles.body5.copyWith(
                      color: AppColors.darkTextSecondary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s16),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.s12),
                    decoration: BoxDecoration(
                      color: AppColors.darkInfoBg,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: AppColors.darkBorder),
                    ),
                    child: Row(
                      children: [
                        Icon(PhosphorIcons.mapPin(), size: 20, color: AppColors.darkInfoText),
                        const SizedBox(width: AppSpacing.s8),
                        Expanded(
                          child: Text(
                            'Current Telemetry: Farmgate Junction (In Transit • Next Stop in 8 mins)',
                            style: AppTextStyles.body5.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppColors.darkInfoText,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
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
                        'Route 2: Dhanmondi Shuttle',
                        style: AppTextStyles.title4.copyWith(
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
                          'ON SCHEDULE',
                          style: AppTextStyles.caption2.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.darkSuccessText,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s6),
                  Text(
                    'Departure: 08:00 AM • Current: Dhanmondi 27 (Boarding)',
                    style: AppTextStyles.body5.copyWith(
                      color: AppColors.darkTextSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Tab 2: Facilities Tickets
          if (_selectedTabIndex == 2) ...[
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Hardware Lab 4B (HVAC)',
                        style: AppTextStyles.title4.copyWith(
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
                          color: AppColors.darkInfoBg,
                          borderRadius: BorderRadius.circular(AppRadius.sm),
                        ),
                        child: Text(
                          'IN PROGRESS',
                          style: AppTextStyles.caption2.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.darkInfoText,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s8),
                  Text(
                    'Central AC unit blowing ambient air; technician dispatched.',
                    style: AppTextStyles.body4.copyWith(
                      color: AppColors.darkTextSecondary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s8),
                  Text(
                    'Assigned: Kamal Uddin (Senior HVAC Tech)',
                    style: AppTextStyles.caption1.copyWith(
                      color: AppColors.brightTeal,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.s12),
            AppButton(
              label: 'Report New Campus Issue',
              variant: AppButtonVariant.outline,
              icon: PhosphorIcons.plus(),
              onPressed: () => _showReportIssueModal(context),
            ),
          ],
        ],
      ),
    );
  }
}
