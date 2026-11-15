import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class AttendanceCheckInScreen extends StatefulWidget {
  final String courseCode;
  final String courseTitle;
  final String roomName;
  final VoidCallback? onCompleted;

  const AttendanceCheckInScreen({
    super.key,
    this.courseCode = 'CSE204-A',
    this.courseTitle = 'Data Structures & Algorithms',
    this.roomName = 'Hall 301 (Engineering Bldg)',
    this.onCompleted,
  });

  @override
  State<AttendanceCheckInScreen> createState() => _AttendanceCheckInScreenState();
}

class _AttendanceCheckInScreenState extends State<AttendanceCheckInScreen> {
  int _activeTabIndex = 0; // 0 = QR Scanner, 1 = 6-Digit PIN
  bool _isCheckedIn = false;
  String _pinCode = '';
  final List<TextEditingController> _pinControllers = List.generate(
    6,
    (_) => TextEditingController(),
  );

  @override
  void dispose() {
    for (final c in _pinControllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _handleSuccessfulCheckIn() {
    setState(() {
      _isCheckedIn = true;
    });
  }

  void _onPinDigitEntered(int index, String value) {
    if (value.isNotEmpty && index < 5) {
      FocusScope.of(context).nextFocus();
    }
    final entered = _pinControllers.map((c) => c.text).join();
    setState(() {
      _pinCode = entered;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkCanvas : AppColors.lightCanvas,
      appBar: AppBar(
        title: Text(
          'Attendance Check-In',
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
        child: _isCheckedIn ? _buildSuccessView(isDark) : _buildCheckInFlow(isDark),
      ),
    );
  }

  Widget _buildCheckInFlow(bool isDark) {
    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.s16,
        vertical: AppSpacing.s12,
      ),
      children: [
        // Class Context Card
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.courseCode,
                    style: AppTextStyles.caption1.copyWith(
                      color: AppColors.teal,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  AppChip(
                    label: 'Live Session',
                    variant: AppChipVariant.success,
                    icon: PhosphorIcons.broadcast(PhosphorIconsStyle.bold),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.s4),
              Text(
                widget.courseTitle,
                style: AppTextStyles.title3.copyWith(
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.s8),
              Row(
                children: [
                  Icon(
                    PhosphorIcons.mapPin(),
                    size: 14,
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                  const SizedBox(width: AppSpacing.s4),
                  Text(
                    widget.roomName,
                    style: AppTextStyles.caption2.copyWith(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.s8),
              // Geofence Pill
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.s8,
                  vertical: AppSpacing.s4,
                ),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSuccessBg : AppColors.lightSuccessBg,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: AppColors.teal,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.s4),
                    Text(
                      'Classroom In Range (8m away) • Geofence Validated',
                      style: AppTextStyles.caption3.copyWith(
                        color: isDark ? AppColors.darkSuccessText : AppColors.lightSuccessText,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.s16),

        // Tab Switcher: QR Scan vs 6-Digit PIN
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
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _activeTabIndex = 0),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.s8),
                    decoration: BoxDecoration(
                      color: _activeTabIndex == 0
                          ? (isDark ? AppColors.darkCard : AppColors.white)
                          : AppColors.transparent,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      boxShadow: _activeTabIndex == 0
                          ? [
                              BoxShadow(
                                color: AppColors.ink.withValues(alpha: 0.05),
                                blurRadius: 4,
                                offset: const Offset(0, 1),
                              ),
                            ]
                          : null,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          PhosphorIcons.qrCode(),
                          size: 16,
                          color: _activeTabIndex == 0
                              ? AppColors.teal
                              : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                        ),
                        const SizedBox(width: AppSpacing.s4),
                        Text(
                          'Scan QR',
                          style: AppTextStyles.caption1.copyWith(
                            color: _activeTabIndex == 0
                                ? (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary)
                                : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _activeTabIndex = 1),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.s8),
                    decoration: BoxDecoration(
                      color: _activeTabIndex == 1
                          ? (isDark ? AppColors.darkCard : AppColors.white)
                          : AppColors.transparent,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      boxShadow: _activeTabIndex == 1
                          ? [
                              BoxShadow(
                                color: AppColors.ink.withValues(alpha: 0.05),
                                blurRadius: 4,
                                offset: const Offset(0, 1),
                              ),
                            ]
                          : null,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          PhosphorIcons.key(),
                          size: 16,
                          color: _activeTabIndex == 1
                              ? AppColors.teal
                              : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                        ),
                        const SizedBox(width: AppSpacing.s4),
                        Text(
                          '6-Digit PIN',
                          style: AppTextStyles.caption1.copyWith(
                            color: _activeTabIndex == 1
                                ? (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary)
                                : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.s16),

        // Active Tab View Content
        if (_activeTabIndex == 0) _buildQrScannerView(isDark) else _buildPinEntryView(isDark),
      ],
    );
  }

  Widget _buildQrScannerView(bool isDark) {
    return Column(
      children: [
        // Camera Viewfinder Box
        Container(
          height: 280,
          width: double.infinity,
          decoration: BoxDecoration(
            color: AppColors.ink,
            borderRadius: BorderRadius.circular(AppRadius.r2xl),
            border: Border.all(
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
            ),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Viewfinder brackets
              Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  border: Border.all(
                    color: AppColors.brightTeal,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                ),
                child: Center(
                  child: Icon(
                    PhosphorIcons.qrCode(),
                    size: 64,
                    color: AppColors.brightTeal.withValues(alpha: 0.4),
                  ),
                ),
              ),
              Positioned(
                bottom: AppSpacing.s16,
                child: Text(
                  'Point camera at classroom projector',
                  style: AppTextStyles.caption2.copyWith(
                    color: AppColors.white70,
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.s16),

        AppButton(
          label: 'Simulate QR Scan (Verify)',
          icon: PhosphorIcons.camera(PhosphorIconsStyle.bold),
          onPressed: _handleSuccessfulCheckIn,
        ),
      ],
    );
  }

  Widget _buildPinEntryView(bool isDark) {
    return Column(
      children: [
        Text(
          'Enter the 6-digit PIN projected on the classroom screen',
          textAlign: TextAlign.center,
          style: AppTextStyles.body5.copyWith(
            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
          ),
        ),
        const SizedBox(height: AppSpacing.s24),

        // 6 PIN boxes
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: List.generate(6, (index) {
            return SizedBox(
              width: 44,
              height: 52,
              child: TextField(
                controller: _pinControllers[index],
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                maxLength: 1,
                style: AppTextStyles.title2.copyWith(
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                ),
                decoration: InputDecoration(
                  counterText: '',
                  filled: true,
                  fillColor: isDark ? AppColors.darkElevated : AppColors.lightElevated,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    borderSide: BorderSide(
                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    borderSide: const BorderSide(
                      color: AppColors.teal,
                      width: 2,
                    ),
                  ),
                ),
                onChanged: (val) => _onPinDigitEntered(index, val),
              ),
            );
          }),
        ),

        const SizedBox(height: AppSpacing.s24),

        AppButton(
          label: 'Verify Code (849 201)',
          disabled: _pinCode.length < 6,
          onPressed: _handleSuccessfulCheckIn,
        ),
      ],
    );
  }

  Widget _buildSuccessView(bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.s24,
        vertical: AppSpacing.s32,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSuccessBg : AppColors.lightSuccessBg,
              shape: BoxShape.circle,
            ),
            child: Icon(
              PhosphorIcons.checkCircle(PhosphorIconsStyle.fill),
              size: 44,
              color: isDark ? AppColors.darkSuccessText : AppColors.lightSuccessText,
            ),
          ),
          const SizedBox(height: AppSpacing.s16),
          Text(
            'Attendance Verified!',
            style: AppTextStyles.title1.copyWith(
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
            ),
          ),
          const SizedBox(height: AppSpacing.s8),
          Text(
            'You are marked present for ${widget.courseCode} Lecture 18.',
            textAlign: TextAlign.center,
            style: AppTextStyles.body4.copyWith(
              color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.s24),

          // Updated attendance standing card
          AppCard(
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Attendance Standing',
                      style: AppTextStyles.caption2.copyWith(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                    ),
                    AppChip(
                      label: 'Exam Eligible (≥75%)',
                      variant: AppChipVariant.success,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.s8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '15 / 18 Classes Attended',
                      style: AppTextStyles.body3.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      '83.3%',
                      style: AppTextStyles.title3.copyWith(
                        color: AppColors.teal,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.s32),

          AppButton(
            label: 'Done',
            onPressed: () {
              if (widget.onCompleted != null) {
                widget.onCompleted!();
              } else {
                Navigator.of(context).pop();
              }
            },
          ),
        ],
      ),
    );
  }
}
